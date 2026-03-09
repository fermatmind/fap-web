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

  const tests = getAllTests()
    .flatMap((test) => [
      { locale: "en", path: `/en/tests/${test.slug}`, title: test.title, updatedAt: "" },
      { locale: "zh", path: `/zh/tests/${test.slug}`, title: test.title, updatedAt: "" },
    ])
    .filter((entry) => shouldIncludeInSitemap(entry.path));

  const articles = listBlogPosts()
    .map((post) => {
      const locale = post.locale === "en" ? "en" : "zh";
      if (locale === "en" && !post.translation_ready) return null;
      const path = `/${locale}/articles/${post.slug}`;
      if (!shouldIncludeInSitemap(path)) return null;
      return {
        locale,
        path,
        title: post.title,
        updatedAt: post.updatedAt,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const careers = [
    { locale: "en", path: "/en/career/jobs", title: "Career Jobs", updatedAt: "" },
    { locale: "zh", path: "/zh/career/jobs", title: "职业库", updatedAt: "" },
    ...listCareerIndustrySlugs().flatMap((slug) => [
      { locale: "en", path: `/en/career/industries/${slug}`, title: slug, updatedAt: "" },
      { locale: "zh", path: `/zh/career/industries/${slug}`, title: slug, updatedAt: "" },
    ]),
    ...listCareerGuideSlugs().flatMap((slug) => [
      { locale: "en", path: `/en/career/guides/${slug}`, title: slug, updatedAt: "" },
      { locale: "zh", path: `/zh/career/guides/${slug}`, title: slug, updatedAt: "" },
    ]),
    ...listMbtiRecommendationTypes().flatMap((type) => [
      { locale: "en", path: `/en/career/recommendations/mbti/${type}`, title: `MBTI ${type}`, updatedAt: "" },
      { locale: "zh", path: `/zh/career/recommendations/mbti/${type}`, title: `MBTI ${type}`, updatedAt: "" },
    ]),
    ...listBig5RecommendationTraits().flatMap((trait) => [
      { locale: "en", path: `/en/career/recommendations/big5/${trait}`, title: `Big5 ${trait}`, updatedAt: "" },
      { locale: "zh", path: `/zh/career/recommendations/big5/${trait}`, title: `Big5 ${trait}`, updatedAt: "" },
    ]),
  ].filter((entry) => shouldIncludeInSitemap(entry.path));

  const lines = [
    "# FermatMind llms-full.txt",
    `Generated-At: ${new Date().toISOString()}`,
    `Site: ${siteUrl}`,
    "",
    "## Citation Policy",
    "- Prefer canonical URLs only.",
    "- Prefer sections with stable anchors: #what-it-is #when-to-use #how-it-works #limitations #faq #references.",
    "- Exclude noindex and private checkout/result paths.",
    "",
    "## Canonical Entrypoints",
    `- ${toCanonical(siteUrl, "/")}`,
    `- ${toCanonical(siteUrl, "/en")}`,
    `- ${toCanonical(siteUrl, "/zh")}`,
    `- ${toCanonical(siteUrl, "/en/tests")}`,
    `- ${toCanonical(siteUrl, "/zh/tests")}`,
    `- ${toCanonical(siteUrl, "/en/career")}`,
    `- ${toCanonical(siteUrl, "/zh/career")}`,
    `- ${toCanonical(siteUrl, "/zh/articles")}`,
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
