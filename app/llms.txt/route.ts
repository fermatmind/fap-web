import { NextResponse } from "next/server";
import { listCmsArticlesForLlmsWithLastKnownGood } from "@/lib/cms/articles";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { adaptCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/adapters/adaptCareerFirstWaveDiscoverabilityManifest";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { isCareerFamilyHubDiscoverableByManifest } from "@/lib/career/launchPolicy";
import { CAREER_DATASET_FAMILY_SLUGS } from "@/lib/career/datasetDirectory";
import { listContentPagesWithLastKnownGood } from "@/lib/cms/content-pages";
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
import { listTopics } from "@/lib/cms/topics";
import { isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { listBackendSitemapCareerJobPaths } from "@/lib/seo/backendSitemapSource";
import { listBackendDiscoverabilityTestEntries } from "@/lib/seo/backendTestDiscoverabilitySource";
import {
  LLMS_ROUTE_ARTICLE_MAX_PAGES,
  LLMS_ROUTE_LIMITS,
  limitLlmsRouteEntries,
  withLlmsRouteBudget,
} from "@/lib/seo/llmsRouteBudget";
import { getSiteUrlOrThrow } from "@/lib/site";
import type { CareerFirstWaveDiscoverabilityManifestAdapter } from "@/lib/career/adapters/types";

const TOPIC_FALLBACK_SLUGS = ["mbti", "big-five", "iq-eq"];
const LLMS_FINAL_PATH_DENY_PATTERNS: RegExp[] = [
  /^\/zh$/i,
  /^\/tests(?:\/|$)/i,
  /^\/(?:en|zh)\/blog$/i,
  /^\/(?:en|zh)\/help$/i,
  /^\/(?:en|zh)\/refund$/i,
  /^\/zh\/help\/(?:about|team|used-and-mentioned)$/i,
  /^\/en\/(?:brand|careers|charter|foundation|policies)$/i,
  /^\/datasets\/occupations(?:\/method)?$/i,
  /^\/(?:en|zh)\/datasets\/occupations(?:\/method)?$/i,
  /^\/career\/jobs$/i,
  /^\/(?:en|zh)\/career\/jobs$/i,
  /^\/(?:en|zh)\/career\/recommendations$/i,
  /^\/(?:en|zh)\/career\/recommendations\/mbti\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/guides\/[^/]+$/i,
  /^\/(?:en|zh)\/personality\/(?:intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)$/i,
  /^\/ops(?:\/|$)/i,
  /^\/(?:en|zh)\/ops(?:\/|$)/i,
];

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

function listCareerFamilyPathsFromManifest(
  locale: "en" | "zh",
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null
): string[] {
  if (!manifest) {
    return [];
  }

  return manifest.routes
    .filter(
      (route) =>
        route.routeKind === "career_family_hub" &&
        isCareerFamilyHubDiscoverableByManifest(manifest, route.canonicalSlug)
    )
    .map((route) => `/${locale}/career/family/${route.canonicalSlug}`);
}

async function listPersonalityPaths(): Promise<string[]> {
  try {
    const [enProfiles, zhProfiles] = await Promise.all([
      listPersonalityProfiles({ locale: "en", perPage: LLMS_ROUTE_LIMITS.personalityProfiles }),
      listPersonalityProfiles({ locale: "zh", perPage: LLMS_ROUTE_LIMITS.personalityProfiles }),
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
  const siteUrl = getSiteUrlOrThrow();
  const [
    enDiscoverabilityManifest,
    zhDiscoverabilityManifest,
    enCareerGuides,
    zhCareerGuides,
    enCareerRecommendations,
    zhCareerRecommendations,
    personalityEntries,
    topicEntries,
    enArticles,
    zhArticles,
    backendTestEntries,
    enHelpPages,
    zhHelpPages,
    careerJobEntries,
  ] = await Promise.all([
    withLlmsRouteBudget(
      () =>
        fetchCareerFirstWaveDiscoverabilityManifest({ locale: "en" }).then((payload) =>
          adaptCareerFirstWaveDiscoverabilityManifest({ payload })
        ),
      null
    ),
    withLlmsRouteBudget(
      () =>
        fetchCareerFirstWaveDiscoverabilityManifest({ locale: "zh" }).then((payload) =>
          adaptCareerFirstWaveDiscoverabilityManifest({ payload })
        ),
      null
    ),
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
      []
    ),
    withLlmsRouteBudget(
      () =>
        listCmsArticlesForLlmsWithLastKnownGood({
          locale: "zh",
          perPage: LLMS_ROUTE_LIMITS.articles,
          maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES,
        }).then((result) => result.value),
      []
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
        listContentPagesWithLastKnownGood("en", "help").then((result) =>
          limitLlmsRouteEntries(result.value, LLMS_ROUTE_LIMITS.helpPages)
        ),
      []
    ),
    withLlmsRouteBudget(
      () =>
        listContentPagesWithLastKnownGood("zh", "help").then((result) =>
          limitLlmsRouteEntries(result.value, LLMS_ROUTE_LIMITS.helpPages)
        ),
      []
    ),
    withLlmsRouteBudget(
      () =>
        listBackendSitemapCareerJobPaths().then((entries) =>
          limitLlmsRouteEntries(entries, LLMS_ROUTE_LIMITS.careerJobs)
        ),
      []
    ),
  ]);

  const enCareerFamilies = listCareerFamilyPathsFromManifest("en", enDiscoverabilityManifest);
  const zhCareerFamilies = listCareerFamilyPathsFromManifest("zh", zhDiscoverabilityManifest);

  const helpEntries = dedupePaths([
    ...enHelpPages.map((page) => `/en${page.path}`),
    ...zhHelpPages.map((page) => `/zh${page.path}`),
  ]);
  const testEntries = dedupePaths(backendTestEntries.map((entry) => entry.path));

  const articleEntries = dedupePaths(
    [...enArticles, ...zhArticles]
      .filter((article) => article.isIndexable)
      .map((article) => article.href)
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
    "/en/career/industries",
    "/zh/career/industries",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
    ...CAREER_DATASET_FAMILY_SLUGS.flatMap((slug) => [`/en/career/industries/${slug}`, `/zh/career/industries/${slug}`]),
    ...guideEntries,
    ...enCareerFamilies,
    ...zhCareerFamilies,
    ...enCareerRecommendations.filter(shouldKeepCareerAuthorityRoute).map((item) => item.href),
    ...zhCareerRecommendations.filter(shouldKeepCareerAuthorityRoute).map((item) => item.href),
    ...careerJobEntries,
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
    `- ${toCanonical(siteUrl, "/en/support")}`,
    `- ${toCanonical(siteUrl, "/zh/support")}`,
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
    "Indexable Tests:",
    ...testEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Articles:",
    ...articleEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Career Entries:",
    ...careerEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
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
