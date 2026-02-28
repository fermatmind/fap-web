import { NextResponse } from "next/server";
import { getAllTests, listBlogPosts } from "@/lib/content";
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
    `- ${toCanonical(siteUrl, "/zh/articles")}`,
    "",
    "Indexable Tests:",
    ...testEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Articles:",
    ...articleEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
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
