import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();
const SITEMAP_PATH = path.join(ROOT, "public/sitemap-0.xml");
const BLOG_JSON_PATH = path.join(ROOT, ".velite/blog.json");

function readSitemapUrls(): string[] {
  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

function getIndexableEnglishArticleSlugs(): Set<string> {
  if (!fs.existsSync(BLOG_JSON_PATH)) return new Set();
  const blog = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, "utf8")) as Array<Record<string, unknown>>;
  return new Set(
    blog
      .filter((item) => String(item.locale ?? "").toLowerCase() === "en")
      .filter((item) => item.translation_ready === true)
      .map((item) => String(item.slug ?? "").trim())
      .filter(Boolean)
  );
}

describe("sitemap indexability contract", () => {
  it("sitemap file exists", () => {
    expect(fs.existsSync(SITEMAP_PATH)).toBe(true);
  });

  it("contains only indexable URLs", () => {
    const urls = readSitemapUrls();
    const indexableEnglishSlugs = getIndexableEnglishArticleSlugs();
    const disallowedPrefixes = [
      "/en/history",
      "/zh/history",
      "/en/result",
      "/zh/result",
      "/en/orders",
      "/zh/orders",
      "/en/share",
      "/zh/share",
      "/en/attempts",
      "/zh/attempts",
      "/en/payment",
      "/zh/payment",
      "/en/pay",
      "/zh/pay",
      "/en/personality",
      "/zh/personality",
      "/en/professions",
      "/zh/professions",
      "/en/types",
      "/zh/types",
      "/robots.txt",
    ];

    expect(urls.length).toBeGreaterThan(0);

    for (const rawUrl of urls) {
      const pathname = new URL(rawUrl).pathname;
      expect(
        shouldIncludeInSitemap(pathname),
        `sitemap contains non-indexable path: ${pathname}`
      ).toBe(true);

      if (pathname === "/en/articles" && indexableEnglishSlugs.size === 0) {
        throw new Error("/en/articles is present in sitemap but no indexable english article exists.");
      }

      const articleMatch = pathname.match(/^\/en\/articles\/([^/]+)$/i);
      if (articleMatch) {
        expect(
          indexableEnglishSlugs.has(articleMatch[1]),
          `sitemap contains non-indexable english article: ${pathname}`
        ).toBe(true);
      }

      for (const prefix of disallowedPrefixes) {
        expect(pathname.startsWith(prefix), `sitemap contains blocked prefix: ${pathname}`).toBe(false);
      }
    }
  });
});
