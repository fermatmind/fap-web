import { NextResponse } from "next/server";
import { listCmsArticlesForLlms } from "@/lib/cms/articles";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { listCareerJobsFromCms } from "@/lib/cms/career-jobs";
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
import { listTopics } from "@/lib/cms/topics";
import {
  getAllTests,
  listBig5RecommendationTraits,
  listCareerIndustrySlugs,
  listMbtiRecommendationTypes,
} from "@/lib/content";
import { listHelpCenterPages } from "@/lib/help/helpCenterContent";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";

const TOPIC_FALLBACKS = [
  { slug: "mbti", title: "MBTI" },
  { slug: "big-five", title: "Big Five" },
  { slug: "iq-eq", title: "IQ and EQ" },
];

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function shouldKeep(path: string): boolean {
  return shouldIncludeInSitemap(path);
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
  const [enCareerJobs, zhCareerJobs, enCareerGuides, zhCareerGuides, personalityEntries, topicEntries, enArticles, zhArticles] = await Promise.all([
    listCareerJobsFromCms({ locale: "en" }).catch(() => []),
    listCareerJobsFromCms({ locale: "zh" }).catch(() => []),
    listCareerGuidesFromCms("en").catch(() => []),
    listCareerGuidesFromCms("zh").catch(() => []),
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
    { locale: "en", path: "/en/career/recommendations", title: "Career recommendations", updatedAt: "" },
    { locale: "zh", path: "/zh/career/recommendations", title: "职业推荐", updatedAt: "" },
    ...enCareerJobs.map((job) => ({ locale: "en", path: job.href, title: job.title, updatedAt: "" })),
    ...zhCareerJobs.map((job) => ({ locale: "zh", path: job.href, title: job.title, updatedAt: "" })),
    ...listCareerIndustrySlugs().flatMap((slug) => [
      { locale: "en", path: `/en/career/industries/${slug}`, title: slug, updatedAt: "" },
      { locale: "zh", path: `/zh/career/industries/${slug}`, title: slug, updatedAt: "" },
    ]),
    ...guideEntries,
    ...listMbtiRecommendationTypes().flatMap((type) => [
      { locale: "en", path: `/en/career/recommendations/mbti/${type}`, title: `MBTI ${type}`, updatedAt: "" },
      { locale: "zh", path: `/zh/career/recommendations/mbti/${type}`, title: `MBTI ${type}`, updatedAt: "" },
    ]),
    ...listBig5RecommendationTraits().flatMap((trait) => [
      { locale: "en", path: `/en/career/recommendations/big5/${trait}`, title: `Big5 ${trait}`, updatedAt: "" },
      { locale: "zh", path: `/zh/career/recommendations/big5/${trait}`, title: `Big5 ${trait}`, updatedAt: "" },
    ]),
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
