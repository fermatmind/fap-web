import { NextResponse } from "next/server";
import { listCmsArticlesForLlms } from "@/lib/cms/articles";
import { listCareerJobsFromCms } from "@/lib/cms/career-jobs";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { listTopics } from "@/lib/cms/topics";
import {
  getAllTests,
  listBig5RecommendationTraits,
  listCareerGuideSlugs,
  listCareerIndustrySlugs,
  listMbtiRecommendationTypes,
} from "@/lib/content";
import { HELP_CENTER_SLUGS } from "@/lib/help/helpCenterContent";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";

const TOPIC_FALLBACK_SLUGS = ["mbti", "big-five", "iq-eq"];

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function dedupePaths(paths: string[]): string[] {
  return [...new Set(paths)].filter((path) => shouldIncludeInSitemap(path));
}

async function listPersonalityPaths(): Promise<string[]> {
  try {
    const [enProfiles, zhProfiles] = await Promise.all([
      listPersonalityProfiles({ locale: "en", perPage: 100 }),
      listPersonalityProfiles({ locale: "zh", perPage: 100 }),
    ]);

    return dedupePaths([
      ...enProfiles.items
        .filter((item) => item.isIndexable)
        .map((item) => `/en/personality/${String(item.slug ?? "").trim().toLowerCase()}`),
      ...zhProfiles.items
        .filter((item) => item.isIndexable)
        .map((item) => `/zh/personality/${String(item.slug ?? "").trim().toLowerCase()}`),
    ]);
  } catch {
    // Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.
  }

  return [];
}

async function listTopicPaths(): Promise<string[]> {
  try {
    const [enTopics, zhTopics] = await Promise.all([
      listTopics({ locale: "en", perPage: 100 }),
      listTopics({ locale: "zh", perPage: 100 }),
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
  const [enCareerJobs, zhCareerJobs, personalityEntries, topicEntries, enArticles, zhArticles] = await Promise.all([
    listCareerJobsFromCms({ locale: "en" }).catch(() => []),
    listCareerJobsFromCms({ locale: "zh" }).catch(() => []),
    listPersonalityPaths(),
    listTopicPaths(),
    listCmsArticlesForLlms({ locale: "en" }).catch(() => []),
    listCmsArticlesForLlms({ locale: "zh" }).catch(() => []),
  ]);

  const helpEntries = dedupePaths(HELP_CENTER_SLUGS.flatMap((slug) => [`/en/help/${slug}`, `/zh/help/${slug}`]));
  const testEntries = dedupePaths(
    getAllTests().flatMap((test) => [`/en/tests/${test.slug}`, `/zh/tests/${test.slug}`])
  );

  const articleEntries = dedupePaths(
    [...enArticles, ...zhArticles]
      .filter((article) => article.isIndexable)
      .map((article) => article.href)
  );

  const careerEntries = dedupePaths([
    "/en/career",
    "/zh/career",
    "/en/career/jobs",
    "/zh/career/jobs",
    "/en/career/industries",
    "/zh/career/industries",
    "/en/career/guides",
    "/zh/career/guides",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
    "/en/career/tests/riasec",
    "/zh/career/tests/riasec",
    ...enCareerJobs.map((job) => job.href),
    ...zhCareerJobs.map((job) => job.href),
    ...listCareerIndustrySlugs().flatMap((slug) => [`/en/career/industries/${slug}`, `/zh/career/industries/${slug}`]),
    ...listCareerGuideSlugs().flatMap((slug) => [`/en/career/guides/${slug}`, `/zh/career/guides/${slug}`]),
    ...listMbtiRecommendationTypes().flatMap((type) => [
      `/en/career/recommendations/mbti/${type}`,
      `/zh/career/recommendations/mbti/${type}`,
    ]),
    ...listBig5RecommendationTraits().flatMap((trait) => [
      `/en/career/recommendations/big5/${trait}`,
      `/zh/career/recommendations/big5/${trait}`,
    ]),
  ]);

  const lines = [
    "# FermatMind llms.txt",
    `Site: ${siteUrl}`,
    "Languages: en, zh",
    "",
    "Primary Entries:",
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
