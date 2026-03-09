import { NextResponse } from "next/server";
import {
  getAllTests,
  listBlogPosts,
  listBig5RecommendationTraits,
  listCareerGuideSlugs,
  listCareerIndustrySlugs,
  listMbtiRecommendationTypes,
} from "@/lib/content";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function GET() {
  const siteUrl = getSiteUrlOrThrow();

  const testEntries = getAllTests()
    .flatMap((test) => [`/en/tests/${test.slug}`, `/zh/tests/${test.slug}`])
    .filter((path) => shouldIncludeInSitemap(path));

  const articleEntries = listBlogPosts()
    .map((post) => {
      const locale = post.locale === "en" ? "en" : "zh";
      if (locale === "en" && !post.translation_ready) return null;
      return `/${locale}/articles/${post.slug}`;
    })
    .filter((path): path is string => Boolean(path))
    .filter((path) => shouldIncludeInSitemap(path));

  const careerEntries = [
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
    "/en/career/tests/riasec/result",
    "/zh/career/tests/riasec/result",
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
  ].filter((path) => shouldIncludeInSitemap(path));

  const lines = [
    "# FermatMind llms.txt",
    `Site: ${siteUrl}`,
    "Languages: en, zh",
    "",
    "Primary Entries:",
    `- ${toCanonical(siteUrl, "/")}`,
    `- ${toCanonical(siteUrl, "/en")}`,
    `- ${toCanonical(siteUrl, "/zh")}`,
    `- ${toCanonical(siteUrl, "/en/tests")}`,
    `- ${toCanonical(siteUrl, "/zh/tests")}`,
    `- ${toCanonical(siteUrl, "/en/career")}`,
    `- ${toCanonical(siteUrl, "/zh/career")}`,
    `- ${toCanonical(siteUrl, "/zh/articles")}`,
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
