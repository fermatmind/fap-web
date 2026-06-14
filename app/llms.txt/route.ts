import { NextResponse } from "next/server";
import { listCmsArticlesForLlmsWithLastKnownGood } from "@/lib/cms/articles";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import {
  listDiscoverableContentPagesWithLastKnownGood,
  type ContentPage,
} from "@/lib/cms/content-pages";
import type { Locale } from "@/lib/i18n/locales";
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
import { buildPersonalityComparisonSlugsFromProfiles } from "@/lib/mbti/personalityComparison";
import { listTopics } from "@/lib/cms/topics";
import { isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { listBackendSitemapCareerJobPaths } from "@/lib/seo/backendSitemapSource";
import { listBackendDiscoverabilityTestEntries } from "@/lib/seo/backendTestDiscoverabilitySource";
import { listDailyGivingDiscoverabilityEntries } from "@/lib/foundation/dailyGivingSeo";
import {
  createConfiguredStagingLlmsResponse,
  isConfiguredStagingDiscoverability,
} from "@/lib/seo/stagingDiscoverability";
import {
  LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS,
  LLMS_ROUTE_ARTICLE_TIMEOUT_MS,
  LLMS_ROUTE_ARTICLE_MAX_PAGES,
  LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS,
  LLMS_ROUTE_LIMITS,
  limitLlmsRouteEntries,
  withLlmsRouteBudget,
} from "@/lib/seo/llmsRouteBudget";
import { TOPIC_LLMS_COMPATIBILITY_FALLBACK_SLUGS } from "@/lib/seo/topicLlmsAuthority";
import { getSiteUrlOrThrow } from "@/lib/site";

const TOPIC_FALLBACK_SLUGS = TOPIC_LLMS_COMPATIBILITY_FALLBACK_SLUGS;
const LLMS_FINAL_PATH_DENY_PATTERNS: RegExp[] = [
  /^\/zh$/i,
  /^\/tests(?:\/|$)/i,
  /^\/(?:en|zh)\/tests\/(?:clinical-depression-anxiety-assessment-professional-edition|depression-screening-test-standard-edition)$/i,
  /^\/(?:en|zh)\/blog$/i,
  /^\/(?:en|zh)\/help$/i,
  /^\/(?:en|zh)\/refund$/i,
  /^\/(?:en|zh)\/help\/(?:about|for-business-and-research|team|used-and-mentioned)$/i,
  /^\/datasets\/occupations(?:\/method)?$/i,
  /^\/(?:en|zh)\/datasets\/occupations(?:\/method)?$/i,
  /^\/career\/jobs$/i,
  /^\/(?:en|zh)\/career\/jobs$/i,
  /^\/(?:en|zh)\/career\/jobs\/(?:software-developers|digital-forensics-analysts|computer-occupations-all-other)$/i,
  /^\/(?:en|zh)\/career\/recommendations$/i,
  /^\/(?:en|zh)\/career\/recommendations\/mbti\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/guides\/[^/]+$/i,
  /^\/(?:en|zh)\/personality\/(?:intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)$/i,
  /^\/ops(?:\/|$)/i,
  /^\/(?:en|zh)\/ops(?:\/|$)/i,
];
const CAREER_JOB_DETAIL_PATH_RE = /^\/(?:en|zh)\/career\/jobs\/[^/?#]+$/i;
const CAREER_JOB_DETAIL_PARTS_RE = /^\/(?:en|zh)\/career\/jobs\/([^/?#]+)$/i;
const EXCLUDED_CAREER_JOB_DETAIL_SLUGS = new Set([
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
]);

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function normalizePath(path: string): string {
  const value = String(path || "").trim() || "/";
  if (value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function isForbiddenFinalLlmsPath(path: string): boolean {
  const normalized = normalizePath(path);
  return (
    isSharedDiscoverabilityDeniedPath(normalized) ||
    LLMS_FINAL_PATH_DENY_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function shouldKeep(path: string): boolean {
  return !isForbiddenFinalLlmsPath(path) && shouldIncludeInSitemap(path);
}

function dedupePaths(paths: string[]): string[] {
  return [...new Set(paths.map((path) => normalizePath(path)))].filter((path) => shouldKeep(path));
}

function shouldKeepCareerJobAuthorityPath(path: string): boolean {
  const normalized = normalizePath(path);
  const slug = normalized.match(CAREER_JOB_DETAIL_PARTS_RE)?.[1]?.toLowerCase();

  return (
    CAREER_JOB_DETAIL_PATH_RE.test(normalized) &&
    Boolean(slug) &&
    !EXCLUDED_CAREER_JOB_DETAIL_SLUGS.has(slug ?? "") &&
    !isSharedDiscoverabilityDeniedPath(normalized) &&
    shouldIncludeInSitemap(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

function dedupeCareerJobAuthorityPaths(paths: string[]): string[] {
  return [...new Set(paths.map((path) => normalizePath(path)))]
    .filter((path) => shouldKeepCareerJobAuthorityPath(path))
    .sort((left, right) => left.localeCompare(right));
}

function localizedContentPagePath(page: ContentPage, fallbackLocale: Locale): string {
  const normalizedPath = normalizePath(page.path || `/${page.slug}`);
  const locale = page.locale === "zh" || page.locale === "en" ? page.locale : fallbackLocale;

  if (/^\/(en|zh)(\/|$)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return locale === "zh" ? "/" : "/en";
  }

  return normalizePath(`/${locale}${normalizedPath}`);
}

function shouldKeepCareerAuthorityRoute(item: {
  href: string;
  seoContract: { indexEligible: boolean | null; indexState: string | null };
}): boolean {
  return !isForbiddenFinalLlmsPath(item.href) && shouldIncludeInSitemap(item.href, {
    indexEligible: item.seoContract.indexEligible,
    indexState: item.seoContract.indexState,
  });
}

function publishedPersonalityVariantSlugs(value: string): string[] {
  const defaultSlug = buildDefaultPublicPersonalitySlug(value);
  if (!defaultSlug) {
    return [];
  }

  if (defaultSlug.endsWith("-a")) {
    const baseSlug = defaultSlug.slice(0, -2);

    return [defaultSlug, `${baseSlug}-t`];
  }

  return [defaultSlug];
}

async function listPersonalityPaths(): Promise<string[]> {
  try {
    const [enProfiles, zhProfiles, enVariantProfiles, zhVariantProfiles] = await Promise.all([
      listPersonalityProfiles({ locale: "en", perPage: LLMS_ROUTE_LIMITS.personalityProfiles }),
      listPersonalityProfiles({ locale: "zh", perPage: LLMS_ROUTE_LIMITS.personalityProfiles }),
      listPersonalityProfiles({ locale: "en", perPage: LLMS_ROUTE_LIMITS.personalityProfiles, includeVariants: true }),
      listPersonalityProfiles({ locale: "zh", perPage: LLMS_ROUTE_LIMITS.personalityProfiles, includeVariants: true }),
    ]);

    return dedupePaths([
      ...limitLlmsRouteEntries(enProfiles.items, LLMS_ROUTE_LIMITS.personalityProfiles)
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => `/en/personality/${slug}`)
        ),
      ...limitLlmsRouteEntries(zhProfiles.items, LLMS_ROUTE_LIMITS.personalityProfiles)
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => `/zh/personality/${slug}`)
        ),
      ...buildPersonalityComparisonSlugsFromProfiles(
        limitLlmsRouteEntries(enVariantProfiles.items, LLMS_ROUTE_LIMITS.personalityProfiles)
      ).map((slug) => `/en/personality/${slug}`),
      ...buildPersonalityComparisonSlugsFromProfiles(
        limitLlmsRouteEntries(zhVariantProfiles.items, LLMS_ROUTE_LIMITS.personalityProfiles)
      ).map((slug) => `/zh/personality/${slug}`),
    ]);
  } catch {
    // Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.
  }

  return [];
}

async function listTopicPaths(): Promise<string[]> {
  try {
    const [enTopics, zhTopics] = await Promise.all([
      listTopics({ locale: "en", perPage: LLMS_ROUTE_LIMITS.topics }),
      listTopics({ locale: "zh", perPage: LLMS_ROUTE_LIMITS.topics }),
    ]);
    const slugs = new Set(
      [...enTopics.items, ...zhTopics.items]
        .map((item) => String(item.slug ?? "").trim().toLowerCase())
        .filter(Boolean)
    );

    if (slugs.size > 0) {
      return dedupePaths(
        [...slugs].flatMap((slug) => [`/en/topics/${slug}`, `/zh/topics/${slug}`])
      );
    }
  } catch {
    // Fall back to the stable public topic set when the topics CMS is unavailable.
  }

  return dedupePaths(TOPIC_FALLBACK_SLUGS.flatMap((slug) => [`/en/topics/${slug}`, `/zh/topics/${slug}`]));
}

export async function GET() {
  if (isConfiguredStagingDiscoverability()) {
    return createConfiguredStagingLlmsResponse();
  }

  const siteUrl = getSiteUrlOrThrow();
  const [
    enCareerGuides,
    zhCareerGuides,
    enCareerRecommendations,
    zhCareerRecommendations,
    personalityEntries,
    topicEntries,
    enArticles,
    zhArticles,
    backendTestEntries,
    enDiscoverableContentPages,
    zhDiscoverableContentPages,
    careerJobEntries,
    enDailyGivingEntries,
    zhDailyGivingEntries,
  ] = await Promise.all([
    withLlmsRouteBudget(
      () => listCareerGuidesFromCms("en", { page: 1, perPage: LLMS_ROUTE_LIMITS.careerGuides }),
      []
    ),
    withLlmsRouteBudget(
      () => listCareerGuidesFromCms("zh", { page: 1, perPage: LLMS_ROUTE_LIMITS.careerGuides }),
      []
    ),
    withLlmsRouteBudget(
      () =>
        fetchCareerRecommendationIndex({ locale: "en" }).then((payload) =>
          limitLlmsRouteEntries(
            adaptCareerRecommendationIndex({ locale: "en", payload }),
            LLMS_ROUTE_LIMITS.careerRecommendations
          )
        ),
      []
    ),
    withLlmsRouteBudget(
      () =>
        fetchCareerRecommendationIndex({ locale: "zh" }).then((payload) =>
          limitLlmsRouteEntries(
            adaptCareerRecommendationIndex({ locale: "zh", payload }),
            LLMS_ROUTE_LIMITS.careerRecommendations
          )
        ),
      []
    ),
    withLlmsRouteBudget(() => listPersonalityPaths(), []),
    withLlmsRouteBudget(() => listTopicPaths(), []),
    withLlmsRouteBudget(
      () =>
        listCmsArticlesForLlmsWithLastKnownGood({
          locale: "en",
          perPage: LLMS_ROUTE_LIMITS.articles,
          maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES,
        }).then((result) => result.value),
      [],
      { timeoutMs: LLMS_ROUTE_ARTICLE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listCmsArticlesForLlmsWithLastKnownGood({
          locale: "zh",
          perPage: LLMS_ROUTE_LIMITS.articles,
          maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES,
        }).then((result) => result.value),
      [],
      { timeoutMs: LLMS_ROUTE_ARTICLE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listBackendDiscoverabilityTestEntries().then((entries) =>
          limitLlmsRouteEntries(entries, LLMS_ROUTE_LIMITS.tests)
        ),
      []
    ),
    withLlmsRouteBudget(
      () =>
        listDiscoverableContentPagesWithLastKnownGood("en").then((result) =>
          limitLlmsRouteEntries(result.value, LLMS_ROUTE_LIMITS.helpPages)
        ),
      [],
      { timeoutMs: LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      () =>
        listDiscoverableContentPagesWithLastKnownGood("zh").then((result) =>
          limitLlmsRouteEntries(result.value, LLMS_ROUTE_LIMITS.helpPages)
        ),
      [],
      { timeoutMs: LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(
      (signal) => listBackendSitemapCareerJobPaths({ limit: LLMS_ROUTE_LIMITS.careerJobs, signal }),
      [],
      { timeoutMs: LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS }
    ),
    withLlmsRouteBudget(() => listDailyGivingDiscoverabilityEntries("en"), []),
    withLlmsRouteBudget(() => listDailyGivingDiscoverabilityEntries("zh"), []),
  ]);

  const helpEntries = dedupePaths([
    ...enDiscoverableContentPages.filter((page) => page.kind === "help").map((page) => localizedContentPagePath(page, "en")),
    ...zhDiscoverableContentPages.filter((page) => page.kind === "help").map((page) => localizedContentPagePath(page, "zh")),
  ]);
  const contentPageEntries = dedupePaths(
    [
      ...enDiscoverableContentPages.map((page) => ({ page, locale: "en" as const })),
      ...zhDiscoverableContentPages.map((page) => ({ page, locale: "zh" as const })),
    ]
      .filter(({ page }) => page.kind !== "help" && page.isPublic && page.isIndexable)
      .map(({ page, locale }) => localizedContentPagePath(page, locale))
  );
  const testEntries = dedupePaths(backendTestEntries.map((entry) => entry.path));

  const articleEntries = dedupePaths(
    limitLlmsRouteEntries(
      [...enArticles, ...zhArticles]
        .filter((article) => article.isIndexable && article.llmsEligible !== false)
        .map((article) => article.href),
      LLMS_ROUTE_LIMITS.articles
    )
  );

  const guideEntries = dedupePaths([
    ...(enCareerGuides.filter((item) => item.isIndexable).length > 0 ? ["/en/career/guides"] : []),
    ...(zhCareerGuides.filter((item) => item.isIndexable).length > 0 ? ["/zh/career/guides"] : []),
    ...enCareerGuides.filter((item) => item.isIndexable).map((item) => item.href),
    ...zhCareerGuides.filter((item) => item.isIndexable).map((item) => item.href),
  ]);

  const careerEntries = dedupePaths([
    "/en/career",
    "/zh/career",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
    ...guideEntries,
    ...enCareerRecommendations.filter(shouldKeepCareerAuthorityRoute).map((item) => item.href),
    ...zhCareerRecommendations.filter(shouldKeepCareerAuthorityRoute).map((item) => item.href),
  ]);
  const careerJobAuthorityEntries = dedupeCareerJobAuthorityPaths(careerJobEntries);
  const allCareerEntries = [...careerEntries, ...careerJobAuthorityEntries];
  const dailyGivingEntries = dedupePaths([
    ...enDailyGivingEntries.map((entry) => entry.path),
    ...zhDailyGivingEntries.map((entry) => entry.path),
  ]);

  const lines = [
    "# FermatMind llms.txt",
    `Site: ${siteUrl}`,
    "Languages: en, zh",
    "",
    "Primary Entries:",
    `- ${toCanonical(siteUrl, "/")}`,
    `- ${toCanonical(siteUrl, "/en")}`,
    `- ${toCanonical(siteUrl, "/en/personality")}`,
    `- ${toCanonical(siteUrl, "/zh/personality")}`,
    `- ${toCanonical(siteUrl, "/en/topics")}`,
    `- ${toCanonical(siteUrl, "/zh/topics")}`,
    `- ${toCanonical(siteUrl, "/en/career")}`,
    `- ${toCanonical(siteUrl, "/zh/career")}`,
    ...dedupePaths(["/en/career/recommendations", "/zh/career/recommendations"]).map(
      (path) => `- ${toCanonical(siteUrl, path)}`
    ),
    "",
    "Indexable Personality:",
    ...personalityEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Topics:",
    ...topicEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Help:",
    ...helpEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Content Pages:",
    ...contentPageEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Foundation Daily Giving:",
    ...dailyGivingEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Tests:",
    ...testEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Articles:",
    ...articleEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Career Entries:",
    ...allCareerEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    `Sitemap: ${toCanonical(siteUrl, "/sitemap.xml")}`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
