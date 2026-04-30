import { NextResponse } from "next/server";
import { listCmsArticlesForLlmsWithLastKnownGood } from "@/lib/cms/articles";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
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
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
import { listTopics } from "@/lib/cms/topics";
import { getAllTests } from "@/lib/content";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";
import type { CareerFirstWaveDiscoverabilityManifestAdapter } from "@/lib/career/adapters/types";

const TOPIC_FALLBACKS = [
  { slug: "mbti", title: "MBTI" },
  { slug: "big-five", title: "Big Five" },
  { slug: "iq-eq", title: "IQ and EQ" },
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
  /^\/career\/jobs\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i,
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
  return LLMS_FINAL_PATH_DENY_PATTERNS.some((pattern) => pattern.test(normalized));
}

function shouldKeep(path: string): boolean {
  return !isForbiddenFinalLlmsPath(path) && shouldIncludeInSitemap(path);
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
) {
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
        updatedAt: "",
      };
    })
  );

  return entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

async function listPersonalityEntries() {
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
              locale: "en",
              path: `/en/personality/${slug}`,
              title: `${slug.toUpperCase()} | ${item.title || item.typeCode}`,
            }))
        ),
      ...zhProfiles.items
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => ({
              locale: "zh",
              path: `/zh/personality/${slug}`,
              title: `${slug.toUpperCase()} | ${item.title || item.typeCode}`,
            }))
        ),
    ].filter((entry) => shouldKeep(entry.path));
  } catch {
    // Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.
  }

  return [];
}

async function listTopicEntries() {
  try {
    const [enTopics, zhTopics] = await Promise.all([
      listTopics({ locale: "en", perPage: 100 }),
      listTopics({ locale: "zh", perPage: 100 }),
    ]);

    return [
      ...enTopics.items.map((item) => ({
        locale: "en",
        path: `/en/topics/${item.slug}`,
        title: item.title,
      })),
      ...zhTopics.items.map((item) => ({
        locale: "zh",
        path: `/zh/topics/${item.slug}`,
        title: item.title,
      })),
    ].filter((entry) => shouldKeep(entry.path));
  } catch {
    // Fall back to the stable public topic set when the topics CMS is unavailable.
  }

  return TOPIC_FALLBACKS.flatMap((topic) => [
    { locale: "en", path: `/en/topics/${topic.slug}`, title: topic.title },
    { locale: "zh", path: `/zh/topics/${topic.slug}`, title: topic.title },
  ]).filter((entry) => shouldKeep(entry.path));
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
    testList,
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
    listContentPagesWithLastKnownGood("en", "help").then((result) => result.value).catch(() => []),
    listContentPagesWithLastKnownGood("zh", "help").then((result) => result.value).catch(() => []),
  ]);

  const [enCareerFamilies, zhCareerFamilies] = await Promise.all([
    listCareerFamilyEntriesFromManifest("en", enDiscoverabilityManifest),
    listCareerFamilyEntriesFromManifest("zh", zhDiscoverabilityManifest),
  ]);

  const helpEntries = [
    ...enHelpPages.map((page) => ({
      locale: "en",
      path: `/en${page.path}`,
      title: page.title,
    })),
    ...zhHelpPages.map((page) => ({
      locale: "zh",
      path: `/zh${page.path}`,
      title: page.title,
    })),
  ].filter((entry) => shouldKeep(entry.path));

  const tests = testList
    .flatMap((test) => [
      { locale: "en", path: `/en/tests/${test.slug}`, title: test.title, updatedAt: "" },
      { locale: "zh", path: `/zh/tests/${test.slug}`, title: test.title, updatedAt: "" },
    ])
    .filter((entry) => shouldKeep(entry.path));

  const articles = [...enArticles, ...zhArticles]
    .filter((article) => article.isIndexable)
    .map((article) => {
      if (!shouldKeep(article.href)) return null;
      return {
        locale: article.locale,
        path: article.href,
        title: article.title,
        updatedAt: article.updatedAt,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const guideEntries = [
    ...(enCareerGuides.filter((item) => item.isIndexable).length > 0
      ? [{ locale: "en", path: "/en/career/guides", title: "Career guides", updatedAt: "" }]
      : []),
    ...(zhCareerGuides.filter((item) => item.isIndexable).length > 0
      ? [{ locale: "zh", path: "/zh/career/guides", title: "职业指南", updatedAt: "" }]
      : []),
    ...enCareerGuides
      .filter((item) => item.isIndexable)
      .map((item) => ({ locale: "en", path: item.href, title: item.title, updatedAt: item.updatedAt ?? "" })),
    ...zhCareerGuides
      .filter((item) => item.isIndexable)
      .map((item) => ({ locale: "zh", path: item.href, title: item.title, updatedAt: item.updatedAt ?? "" })),
  ].filter((entry) => shouldKeep(entry.path));

  const careers = [
    { locale: "en", path: "/en/career", title: "Career center", updatedAt: "" },
    { locale: "zh", path: "/zh/career", title: "职业发展中心", updatedAt: "" },
    { locale: "en", path: "/en/career/jobs", title: "Career jobs", updatedAt: "" },
    { locale: "zh", path: "/zh/career/jobs", title: "职业库", updatedAt: "" },
    { locale: "en", path: "/en/career/recommendations", title: "Career recommendations", updatedAt: "" },
    { locale: "zh", path: "/zh/career/recommendations", title: "职业推荐", updatedAt: "" },
    { locale: "en", path: "/en/career/industries", title: "Career industries", updatedAt: "" },
    { locale: "zh", path: "/zh/career/industries", title: "职业行业", updatedAt: "" },
    ...CAREER_DATASET_FAMILY_SLUGS.flatMap((slug) => [
      { locale: "en", path: `/en/career/industries/${slug}`, title: slug, updatedAt: "" },
      { locale: "zh", path: `/zh/career/industries/${slug}`, title: slug, updatedAt: "" },
    ]),
    ...guideEntries,
    ...enCareerFamilies,
    ...zhCareerFamilies,
    ...enCareerRecommendations.filter(shouldKeepCareerAuthorityEntry).map((item) => ({
      locale: "en",
      path: item.href,
      title: item.recommendationSubjectMeta.displayTitle,
      updatedAt: item.provenanceMeta.compiledAt ?? "",
    })),
    ...zhCareerRecommendations.filter(shouldKeepCareerAuthorityEntry).map((item) => ({
      locale: "zh",
      path: item.href,
      title: item.recommendationSubjectMeta.displayTitle,
      updatedAt: item.provenanceMeta.compiledAt ?? "",
    })),
  ].filter((entry) => shouldKeep(entry.path));

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
    `- ${toCanonical(siteUrl, "/en/career/jobs")}`,
    `- ${toCanonical(siteUrl, "/zh/career/jobs")}`,
    `- ${toCanonical(siteUrl, "/en/career/recommendations")}`,
    `- ${toCanonical(siteUrl, "/zh/career/recommendations")}`,
    "",
    "## Personality",
    ...personalityEntries.map((entry) => `- [${entry.locale}] ${entry.title} | ${toCanonical(siteUrl, entry.path)}`),
    "",
    "## Topics",
    ...topicEntries.map((entry) => `- [${entry.locale}] ${entry.title} | ${toCanonical(siteUrl, entry.path)}`),
    "",
    "## Help",
    ...helpEntries.map((entry) => `- [${entry.locale}] ${entry.title} | ${toCanonical(siteUrl, entry.path)}`),
    "",
    "## Tests",
    ...tests.map((entry) => `- [${entry.locale}] ${entry.title} | ${toCanonical(siteUrl, entry.path)}`),
    "",
    "## Articles",
    ...articles.map(
      (entry) =>
        `- [${entry.locale}] ${entry.title} | ${toCanonical(siteUrl, entry.path)} | updated=${entry.updatedAt}`
    ),
    "",
    "## Career",
    ...careers.map(
      (entry) =>
        `- [${entry.locale}] ${entry.title} | ${toCanonical(siteUrl, entry.path)}${entry.updatedAt ? ` | updated=${entry.updatedAt}` : ""}`
    ),
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
