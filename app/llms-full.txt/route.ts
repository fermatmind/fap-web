import { NextResponse } from "next/server";
import { getCmsArticleWithLastKnownGood, listCmsArticlesForLlmsWithLastKnownGood } from "@/lib/cms/articles";
import { getCareerGuideFromCmsBySlug, listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { adaptCareerFamilyHub } from "@/lib/career/adapters/adaptCareerFamilyHub";
import { adaptCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/adapters/adaptCareerFirstWaveDiscoverabilityManifest";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { fetchCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { isCareerFamilyHubDiscoverableByManifest } from "@/lib/career/launchPolicy";
import { CAREER_DATASET_FAMILY_SLUGS } from "@/lib/career/datasetDirectory";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { listContentPagesWithLastKnownGood } from "@/lib/cms/content-pages";
import {
  buildDefaultPublicPersonalitySlug,
  getPersonalityProjectionDetailBySlugOrType,
  listPersonalityProfiles,
} from "@/lib/cms/personality";
import { getTopicBySlug, listTopics } from "@/lib/cms/topics";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import {
  MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER,
  isMentalHealthScreeningTest,
} from "@/components/compliance/MentalHealthDisclaimer";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { CareerFirstWaveDiscoverabilityManifestAdapter } from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";
import type { LandingSurfaceViewModel } from "@/lib/landing/landingSurface";

const TOPIC_FALLBACKS = [
  { slug: "mbti", title: "MBTI" },
  { slug: "big-five", title: "Big Five" },
  { slug: "iq-eq", title: "IQ and EQ" },
];
const LLMS_FINAL_PATH_ALLOW_PATTERNS: RegExp[] = [
  /^\/(?:en|zh)\/career\/recommendations\/mbti\/[^/]+$/i,
];
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
  /^\/career\/jobs\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/recommendations\/mbti\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/guides\/[^/]+$/i,
  /^\/(?:en|zh)\/personality\/(?:intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)$/i,
  /^\/ops(?:\/|$)/i,
  /^\/(?:en|zh)\/ops(?:\/|$)/i,
];

const MAX_FAQ_ITEMS = 2;
const MAX_NEXT_STEPS = 3;
const MAX_TEXT_CHARS = 360;
const ENRICHMENT_CONCURRENCY = 8;

type LlmsLocale = Locale;

type LlmsFaqItem = {
  question: string;
  answer: string;
};

type LlmsFullEntry = {
  locale: LlmsLocale;
  path: string;
  title: string;
  type: string;
  updatedAt?: string | null;
  summary?: string | null;
  faq?: LlmsFaqItem[];
  nextSteps?: string[];
  disclaimer?: string | null;
  url?: string;
};

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

function isAllowedFinalLlmsPath(path: string): boolean {
  const normalized = normalizePath(path);
  return LLMS_FINAL_PATH_ALLOW_PATTERNS.some((pattern) => pattern.test(normalized));
}

function isForbiddenFinalLlmsPath(path: string): boolean {
  const normalized = normalizePath(path);
  if (isAllowedFinalLlmsPath(normalized)) {
    return false;
  }

  return LLMS_FINAL_PATH_DENY_PATTERNS.some((pattern) => pattern.test(normalized));
}

function shouldKeep(path: string): boolean {
  return !isForbiddenFinalLlmsPath(path) && shouldIncludeInSitemap(path);
}

function cleanText(value: unknown, maxChars = MAX_TEXT_CHARS): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  const normalized = String(value).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, maxChars - 3).trimEnd()}...`;
}

function summaryFromRecord(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;
  return cleanText(record.summary ?? record.excerpt ?? record.description ?? record.subtitle);
}

function extractSlugFromPath(path: string): string {
  const segments = normalizePath(path).split("/").filter(Boolean);
  return segments.at(-1) ?? "";
}

function displayLocale(locale: LlmsLocale): string {
  return locale === "zh" ? "zh-CN" : "en";
}

function firstSummaryFromAnswerSurface(surface: AnswerSurfaceViewModel | null | undefined): string {
  if (!surface) {
    return "";
  }

  for (const block of surface.summaryBlocks) {
    const value = cleanText(block.body || block.title);
    if (value) {
      return value;
    }
  }

  return "";
}

function firstSummaryFromLandingSurface(surface: LandingSurfaceViewModel | null | undefined): string {
  if (!surface) {
    return "";
  }

  for (const block of surface.summaryBlocks) {
    const value = cleanText(block.body || block.title);
    if (value) {
      return value;
    }
  }

  return "";
}

function buildSummary({
  answerSurface,
  landingSurface,
  sourceSummary,
}: {
  answerSurface?: AnswerSurfaceViewModel | null;
  landingSurface?: LandingSurfaceViewModel | null;
  sourceSummary?: unknown;
}): string {
  return firstSummaryFromAnswerSurface(answerSurface) || firstSummaryFromLandingSurface(landingSurface) || cleanText(sourceSummary);
}

function buildFaq(answerSurface: AnswerSurfaceViewModel | null | undefined): LlmsFaqItem[] {
  if (!answerSurface) {
    return [];
  }

  return answerSurface.faqBlocks
    .map((item) => ({
      question: cleanText(item.question),
      answer: cleanText(item.answer),
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, MAX_FAQ_ITEMS);
}

function safeCanonicalUrlFromHref(siteUrl: string, href: string | null | undefined): string | null {
  const rawHref = String(href ?? "").trim();
  if (!rawHref) {
    return null;
  }

  try {
    const url = new URL(rawHref, siteUrl);
    if (url.origin !== siteUrl) {
      return null;
    }

    const path = normalizePath(url.pathname);
    if (!shouldKeep(path)) {
      return null;
    }

    return toCanonical(siteUrl, path);
  } catch {
    return null;
  }
}

function buildNextSteps(answerSurface: AnswerSurfaceViewModel | null | undefined, siteUrl: string): string[] {
  if (!answerSurface) {
    return [];
  }

  const seen = new Set<string>();
  const steps: string[] = [];

  for (const item of answerSurface.nextStepBlocks) {
    const url = safeCanonicalUrlFromHref(siteUrl, item.href);
    if (!url || seen.has(url)) {
      continue;
    }

    const label = cleanText(item.title || item.body, 120);
    steps.push(label ? `${label}: ${url}` : url);
    seen.add(url);

    if (steps.length >= MAX_NEXT_STEPS) {
      break;
    }
  }

  return steps;
}

function formatEntry(entry: LlmsFullEntry, siteUrl: string): string[] {
  const canonicalUrl = entry.url ?? toCanonical(siteUrl, entry.path);
  const lines = [
    `### [${entry.locale}] ${entry.title} | ${canonicalUrl}`,
    `- URL: ${canonicalUrl}`,
    `- Locale: ${displayLocale(entry.locale)}`,
    `- Type: ${entry.type}`,
  ];
  const updatedAt = cleanText(entry.updatedAt, 80);
  const summary = cleanText(entry.summary);
  const disclaimer = cleanText(entry.disclaimer);
  const faq = (entry.faq ?? []).filter((item) => item.question && item.answer).slice(0, MAX_FAQ_ITEMS);
  const nextSteps = (entry.nextSteps ?? []).filter(Boolean).slice(0, MAX_NEXT_STEPS);

  if (updatedAt) {
    lines.push(`- Updated: ${updatedAt}`);
  }

  if (summary) {
    lines.push(`- Summary: ${summary}`);
  }

  if (disclaimer) {
    lines.push(`- Disclaimer: ${disclaimer}`);
  }

  if (faq.length) {
    lines.push("- FAQ:");
    for (const item of faq) {
      lines.push(`  - Q: ${item.question}`);
      lines.push(`    A: ${item.answer}`);
    }
  }

  if (nextSteps.length) {
    lines.push("- Next steps:");
    for (const step of nextSteps) {
      lines.push(`  - ${step}`);
    }
  }

  return lines;
}

async function mapWithConcurrency<T, U>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<U>
): Promise<U[]> {
  const results = new Array<U>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await mapper(items[currentIndex]);
      }
    })
  );

  return results;
}

function shouldKeepCareerAuthorityEntry(entry: {
  href: string;
  seoContract: { indexEligible: boolean | null; indexState: string | null };
}): boolean {
  return !isForbiddenFinalLlmsPath(entry.href) && shouldIncludeInSitemap(entry.href, {
    indexEligible: entry.seoContract.indexEligible,
    indexState: entry.seoContract.indexState,
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

async function listCareerFamilyEntriesFromManifest(
  locale: "en" | "zh",
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null
): Promise<LlmsFullEntry[]> {
  if (!manifest) {
    return [];
  }

  const entries = await Promise.all(
    manifest.discoverableFamilyHubSlugs.map(async (slug) => {
      if (!isCareerFamilyHubDiscoverableByManifest(manifest, slug)) {
        return null;
      }

      const payload = await fetchCareerFamilyHub({ locale, slug }).catch(() => null);
      const hub = adaptCareerFamilyHub({ locale, payload });

      if (!hub || hub.counts.visibleChildrenCount <= 0) {
        return null;
      }

      return {
        locale,
        path: buildCareerFamilyFrontendUrl(locale, hub.family.canonicalSlug),
        title: hub.family.title,
        type: "career_family",
        summary: summaryFromRecord(hub.family),
        updatedAt: "",
      };
    })
  );

  return entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

async function listPersonalityEntries(): Promise<LlmsFullEntry[]> {
  try {
    const [enProfiles, zhProfiles] = await Promise.all([
      listPersonalityProfiles({ locale: "en", perPage: 100 }),
      listPersonalityProfiles({ locale: "zh", perPage: 100 }),
    ]);

    return [
      ...enProfiles.items
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => ({
              locale: "en" as const,
              path: `/en/personality/${slug}`,
              title: `${slug.toUpperCase()} | ${item.title || item.typeCode}`,
              type: "personality",
              summary: summaryFromRecord(item),
            }))
        ),
      ...zhProfiles.items
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => ({
              locale: "zh" as const,
              path: `/zh/personality/${slug}`,
              title: `${slug.toUpperCase()} | ${item.title || item.typeCode}`,
              type: "personality",
              summary: summaryFromRecord(item),
            }))
        ),
    ].filter((entry) => shouldKeep(entry.path));
  } catch {
    // Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.
  }

  return [];
}

async function listTopicEntries(): Promise<LlmsFullEntry[]> {
  try {
    const [enTopics, zhTopics] = await Promise.all([
      listTopics({ locale: "en", perPage: 100 }),
      listTopics({ locale: "zh", perPage: 100 }),
    ]);

    return [
      ...enTopics.items.map((item) => ({
        locale: "en" as const,
        path: `/en/topics/${item.slug}`,
        title: item.title,
        type: "topic",
        summary: summaryFromRecord(item),
      })),
      ...zhTopics.items.map((item) => ({
        locale: "zh" as const,
        path: `/zh/topics/${item.slug}`,
        title: item.title,
        type: "topic",
        summary: summaryFromRecord(item),
      })),
    ].filter((entry) => shouldKeep(entry.path));
  } catch {
    // Fall back to the stable public topic set when the topics CMS is unavailable.
  }

  return TOPIC_FALLBACKS.flatMap((topic) => [
    { locale: "en" as const, path: `/en/topics/${topic.slug}`, title: topic.title, type: "topic" },
    { locale: "zh" as const, path: `/zh/topics/${topic.slug}`, title: topic.title, type: "topic" },
  ]).filter((entry) => shouldKeep(entry.path));
}

async function enrichArticleEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  const slug = extractSlugFromPath(entry.path);
  const detail = slug
    ? await getCmsArticleWithLastKnownGood(slug, entry.locale).then((result) => result.value).catch(() => null)
    : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

async function enrichPersonalityEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  const slug = extractSlugFromPath(entry.path);
  const detail = slug ? await getPersonalityProjectionDetailBySlugOrType(slug, entry.locale).catch(() => null) : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

async function enrichTopicEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  const slug = extractSlugFromPath(entry.path);
  const detail = slug ? await getTopicBySlug(slug, entry.locale).catch(() => null) : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
}

async function enrichCareerGuideEntry(entry: LlmsFullEntry, siteUrl: string): Promise<LlmsFullEntry> {
  if (!entry.path.includes("/career/guides/")) {
    return entry;
  }

  const slug = extractSlugFromPath(entry.path);
  const detail = slug ? await getCareerGuideFromCmsBySlug(slug, entry.locale).catch(() => null) : null;
  const answerSurface = detail?.answerSurface ?? null;
  const landingSurface = detail?.landingSurface ?? null;

  return {
    ...entry,
    summary: buildSummary({ answerSurface, landingSurface, sourceSummary: entry.summary }),
    faq: buildFaq(answerSurface),
    nextSteps: buildNextSteps(answerSurface, siteUrl),
  };
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
    enTestList,
    zhTestList,
    enHelpPages,
    zhHelpPages,
  ] = await Promise.all([
    fetchCareerFirstWaveDiscoverabilityManifest({ locale: "en" })
      .then((payload) => adaptCareerFirstWaveDiscoverabilityManifest({ payload }))
      .catch(() => null),
    fetchCareerFirstWaveDiscoverabilityManifest({ locale: "zh" })
      .then((payload) => adaptCareerFirstWaveDiscoverabilityManifest({ payload }))
      .catch(() => null),
    listCareerGuidesFromCms("en").catch(() => []),
    listCareerGuidesFromCms("zh").catch(() => []),
    fetchCareerRecommendationIndex({ locale: "en" })
      .then((payload) => adaptCareerRecommendationIndex({ locale: "en", payload }))
      .catch(() => []),
    fetchCareerRecommendationIndex({ locale: "zh" })
      .then((payload) => adaptCareerRecommendationIndex({ locale: "zh", payload }))
      .catch(() => []),
    listPersonalityEntries(),
    listTopicEntries(),
    listCmsArticlesForLlmsWithLastKnownGood({ locale: "en" }).then((result) => result.value).catch(() => []),
    listCmsArticlesForLlmsWithLastKnownGood({ locale: "zh" }).then((result) => result.value).catch(() => []),
    getAllTests("en").catch(() => []),
    getAllTests("zh").catch(() => []),
    listContentPagesWithLastKnownGood("en", "help").then((result) => result.value).catch(() => []),
    listContentPagesWithLastKnownGood("zh", "help").then((result) => result.value).catch(() => []),
  ]);

  const [enCareerFamilies, zhCareerFamilies] = await Promise.all([
    listCareerFamilyEntriesFromManifest("en", enDiscoverabilityManifest),
    listCareerFamilyEntriesFromManifest("zh", zhDiscoverabilityManifest),
  ]);

  const helpEntries = [
    ...enHelpPages.map((page) => ({
      locale: "en" as const,
      path: `/en${page.path}`,
      title: page.title,
      type: "help",
      summary: summaryFromRecord(page),
    })),
    ...zhHelpPages.map((page) => ({
      locale: "zh" as const,
      path: `/zh${page.path}`,
      title: page.title,
      type: "help",
      summary: summaryFromRecord(page),
    })),
  ].filter((entry) => shouldKeep(entry.path));

  const tests = [
    ...enTestList.map((test) => ({
      locale: "en" as const,
      path: `/en/tests/${test.slug}`,
      title: resolveTestTitleByLocale(test, "en"),
      type: "test",
      updatedAt: "",
      summary: cleanText(test.description ?? test.highlight_excerpt_i18n?.en ?? ""),
      disclaimer: isMentalHealthScreeningTest({ slug: test.slug, scaleCode: test.scale_code })
        ? MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER.en
        : null,
    })),
    ...zhTestList.map((test) => ({
      locale: "zh" as const,
      path: `/zh/tests/${test.slug}`,
      title: resolveTestTitleByLocale(test, "zh"),
      type: "test",
      updatedAt: "",
      summary: cleanText(test.description ?? test.highlight_excerpt_i18n?.zh ?? test.highlight_excerpt_i18n?.["zh-CN"] ?? ""),
      disclaimer: isMentalHealthScreeningTest({ slug: test.slug, scaleCode: test.scale_code })
        ? MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER.zh
        : null,
    })),
  ]
    .filter((entry) => shouldKeep(entry.path));

  const articles = [...enArticles, ...zhArticles]
    .filter((article) => article.isIndexable)
    .map((article) => {
      if (!shouldKeep(article.href)) return null;
      return {
        locale: article.locale,
        path: article.href,
        title: article.title,
        type: "article",
        summary: article.excerpt,
        updatedAt: article.updatedAt,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const guideEntries = [
    ...(enCareerGuides.filter((item) => item.isIndexable).length > 0
      ? [{ locale: "en" as const, path: "/en/career/guides", title: "Career guides", type: "career_guides_index", updatedAt: "" }]
      : []),
    ...(zhCareerGuides.filter((item) => item.isIndexable).length > 0
      ? [{ locale: "zh" as const, path: "/zh/career/guides", title: "职业指南", type: "career_guides_index", updatedAt: "" }]
      : []),
    ...enCareerGuides
      .filter((item) => item.isIndexable)
      .map((item) => ({
        locale: "en" as const,
        path: item.href,
        title: item.title,
        type: "career_guide",
        summary: summaryFromRecord(item),
        updatedAt: item.updatedAt ?? "",
      })),
    ...zhCareerGuides
      .filter((item) => item.isIndexable)
      .map((item) => ({
        locale: "zh" as const,
        path: item.href,
        title: item.title,
        type: "career_guide",
        summary: summaryFromRecord(item),
        updatedAt: item.updatedAt ?? "",
      })),
  ].filter((entry) => shouldKeep(entry.path));

  const careers = [
    { locale: "en" as const, path: "/en/career", title: "Career center", type: "career_index", updatedAt: "" },
    { locale: "zh" as const, path: "/zh/career", title: "职业发展中心", type: "career_index", updatedAt: "" },
    { locale: "en" as const, path: "/en/career/recommendations", title: "Career recommendations", type: "career_recommendations_index", updatedAt: "" },
    { locale: "zh" as const, path: "/zh/career/recommendations", title: "职业推荐", type: "career_recommendations_index", updatedAt: "" },
    { locale: "en" as const, path: "/en/career/industries", title: "Career industries", type: "career_industries_index", updatedAt: "" },
    { locale: "zh" as const, path: "/zh/career/industries", title: "职业行业", type: "career_industries_index", updatedAt: "" },
    ...CAREER_DATASET_FAMILY_SLUGS.flatMap((slug) => [
      { locale: "en" as const, path: `/en/career/industries/${slug}`, title: slug, type: "career_industry", updatedAt: "" },
      { locale: "zh" as const, path: `/zh/career/industries/${slug}`, title: slug, type: "career_industry", updatedAt: "" },
    ]),
    ...guideEntries,
    ...enCareerFamilies,
    ...zhCareerFamilies,
    ...enCareerRecommendations.filter(shouldKeepCareerAuthorityEntry).map((item) => ({
      locale: "en" as const,
      path: item.href,
      title: item.recommendationSubjectMeta.displayTitle,
      type: "career_recommendation",
      updatedAt: item.provenanceMeta.compiledAt ?? "",
    })),
    ...zhCareerRecommendations.filter(shouldKeepCareerAuthorityEntry).map((item) => ({
      locale: "zh" as const,
      path: item.href,
      title: item.recommendationSubjectMeta.displayTitle,
      type: "career_recommendation",
      updatedAt: item.provenanceMeta.compiledAt ?? "",
    })),
  ].filter((entry) => shouldKeep(entry.path));

  const [enrichedPersonalityEntries, enrichedTopicEntries, enrichedArticles, enrichedGuideEntries] = await Promise.all([
    mapWithConcurrency(personalityEntries, ENRICHMENT_CONCURRENCY, (entry) => enrichPersonalityEntry(entry, siteUrl)),
    mapWithConcurrency(topicEntries, ENRICHMENT_CONCURRENCY, (entry) => enrichTopicEntry(entry, siteUrl)),
    mapWithConcurrency(articles, ENRICHMENT_CONCURRENCY, (entry) => enrichArticleEntry(entry, siteUrl)),
    mapWithConcurrency(guideEntries, ENRICHMENT_CONCURRENCY, (entry) => enrichCareerGuideEntry(entry, siteUrl)),
  ]);

  const enrichedCareerPathMap = new Map(enrichedGuideEntries.map((entry) => [`${entry.locale}:${entry.path}`, entry]));
  const enrichedCareers = careers.map((entry) => enrichedCareerPathMap.get(`${entry.locale}:${entry.path}`) ?? entry);

  const lines = [
    "# FermatMind llms-full.txt",
    `Generated-At: ${new Date().toISOString()}`,
    `Site: ${siteUrl}`,
    "",
    "## Citation Policy",
    "- Prefer canonical public URLs only.",
    "- Prefer answer-first, breadcrumb, FAQ, and structured list sections when available.",
    "- Exclude noindex and private user-flow paths.",
    "",
    "## Canonical Entrypoints",
    ...[
      { locale: "zh" as const, path: "/", title: "FermatMind", type: "home", url: toCanonical(siteUrl, "/") },
      { locale: "en" as const, path: "/en", title: "FermatMind English", type: "home", url: toCanonical(siteUrl, "/en") },
      { locale: "en" as const, path: "/en/personality", title: "Personality library", type: "primary_page", url: toCanonical(siteUrl, "/en/personality") },
      { locale: "zh" as const, path: "/zh/personality", title: "人格库", type: "primary_page", url: toCanonical(siteUrl, "/zh/personality") },
      { locale: "en" as const, path: "/en/topics", title: "Topics", type: "primary_page", url: toCanonical(siteUrl, "/en/topics") },
      { locale: "zh" as const, path: "/zh/topics", title: "主题", type: "primary_page", url: toCanonical(siteUrl, "/zh/topics") },
      { locale: "en" as const, path: "/en/support", title: "Support", type: "support", url: toCanonical(siteUrl, "/en/support") },
      { locale: "zh" as const, path: "/zh/support", title: "支持", type: "support", url: toCanonical(siteUrl, "/zh/support") },
      { locale: "en" as const, path: "/en/career", title: "Career center", type: "career_index", url: toCanonical(siteUrl, "/en/career") },
      { locale: "zh" as const, path: "/zh/career", title: "职业发展中心", type: "career_index", url: toCanonical(siteUrl, "/zh/career") },
      {
        locale: "en" as const,
        path: "/en/career/recommendations",
        title: "Career recommendations",
        type: "career_recommendations_index",
        url: toCanonical(siteUrl, "/en/career/recommendations"),
      },
      {
        locale: "zh" as const,
        path: "/zh/career/recommendations",
        title: "职业推荐",
        type: "career_recommendations_index",
        url: toCanonical(siteUrl, "/zh/career/recommendations"),
      },
    ].flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Personality",
    ...enrichedPersonalityEntries.flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Topics",
    ...enrichedTopicEntries.flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Help",
    ...helpEntries.flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Tests",
    ...tests.flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Articles",
    ...enrichedArticles.flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Career",
    ...enrichedCareers.flatMap((entry) => formatEntry(entry, siteUrl)),
    "",
    "## Sitemap",
    `- ${toCanonical(siteUrl, "/sitemap.xml")}`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
