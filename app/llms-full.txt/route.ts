import { NextResponse } from "next/server";
import { listCmsArticlesForLlms } from "@/lib/cms/articles";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { adaptCareerFamilyHub } from "@/lib/career/adapters/adaptCareerFamilyHub";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
import { listTopics } from "@/lib/cms/topics";
import {
  getAllTests,
  listCareerIndustrySlugs,
} from "@/lib/content";
import { listHelpCenterPages } from "@/lib/help/helpCenterContent";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";

const TOPIC_FALLBACKS = [
  { slug: "mbti", title: "MBTI" },
  { slug: "big-five", title: "Big Five" },
  { slug: "iq-eq", title: "IQ and EQ" },
];
const CAREER_FAMILY_DISCOVERABILITY_CANDIDATE_SLUGS = ["data-science", "compliance"] as const;

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function shouldKeep(path: string): boolean {
  return shouldIncludeInSitemap(path);
}

function shouldKeepCareerAuthorityEntry(entry: {
  href: string;
  seoContract: { indexEligible: boolean | null; indexState: string | null };
}): boolean {
  return shouldIncludeInSitemap(entry.href, {
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

async function listCareerFamilyEntries(locale: "en" | "zh") {
  const entries = await Promise.all(
    CAREER_FAMILY_DISCOVERABILITY_CANDIDATE_SLUGS.map(async (slug) => {
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
    enCareerJobs,
    zhCareerJobs,
    enCareerGuides,
    zhCareerGuides,
    enCareerRecommendations,
    zhCareerRecommendations,
    enCareerFamilies,
    zhCareerFamilies,
    personalityEntries,
    topicEntries,
    enArticles,
    zhArticles,
  ] = await Promise.all([
    fetchCareerJobIndex({ locale: "en" })
      .then((payload) => adaptCareerJobIndex({ locale: "en", payload }))
      .catch(() => []),
    fetchCareerJobIndex({ locale: "zh" })
      .then((payload) => adaptCareerJobIndex({ locale: "zh", payload }))
      .catch(() => []),
    listCareerGuidesFromCms("en").catch(() => []),
    listCareerGuidesFromCms("zh").catch(() => []),
    fetchCareerRecommendationIndex({ locale: "en" })
      .then((payload) => adaptCareerRecommendationIndex({ locale: "en", payload }))
      .catch(() => []),
    fetchCareerRecommendationIndex({ locale: "zh" })
      .then((payload) => adaptCareerRecommendationIndex({ locale: "zh", payload }))
      .catch(() => []),
    listCareerFamilyEntries("en"),
    listCareerFamilyEntries("zh"),
    listPersonalityEntries(),
    listTopicEntries(),
    listCmsArticlesForLlms({ locale: "en" }).catch(() => []),
    listCmsArticlesForLlms({ locale: "zh" }).catch(() => []),
  ]);

  const helpEntries = [
    ...listHelpCenterPages("en").map((page) => ({
      locale: "en",
      path: `/en/help/${page.slug}`,
      title: page.title,
    })),
    ...listHelpCenterPages("zh").map((page) => ({
      locale: "zh",
      path: `/zh/help/${page.slug}`,
      title: page.title,
    })),
  ].filter((entry) => shouldKeep(entry.path));

  const tests = getAllTests()
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
    ...enCareerJobs.filter(shouldKeepCareerAuthorityEntry).map((job) => ({
      locale: "en",
      path: job.href,
      title: job.titles.title,
      updatedAt: job.provenanceMeta.compiledAt ?? "",
    })),
    ...zhCareerJobs.filter(shouldKeepCareerAuthorityEntry).map((job) => ({
      locale: "zh",
      path: job.href,
      title: job.titles.title,
      updatedAt: job.provenanceMeta.compiledAt ?? "",
    })),
    ...listCareerIndustrySlugs().flatMap((slug) => [
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
    "- Exclude noindex and private share/result/compare/history/take paths.",
    "",
    "## Canonical Entrypoints",
    `- ${toCanonical(siteUrl, "/")}`,
    `- ${toCanonical(siteUrl, "/en")}`,
    `- ${toCanonical(siteUrl, "/zh")}`,
    `- ${toCanonical(siteUrl, "/en/personality")}`,
    `- ${toCanonical(siteUrl, "/zh/personality")}`,
    `- ${toCanonical(siteUrl, "/en/topics")}`,
    `- ${toCanonical(siteUrl, "/zh/topics")}`,
    `- ${toCanonical(siteUrl, "/en/help")}`,
    `- ${toCanonical(siteUrl, "/zh/help")}`,
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
