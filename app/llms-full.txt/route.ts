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
