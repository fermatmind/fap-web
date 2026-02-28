import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policy from "../../lib/seo/indexingPolicy.cjs";

const { shouldIncludeInSitemap } = policy;

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sitemapPath = path.resolve(ROOT_DIR, process.env.SITEMAP_PATH || "public/sitemap-0.xml");
const blogJsonPath = path.resolve(ROOT_DIR, ".velite/blog.json");

if (!fs.existsSync(sitemapPath)) {
  console.error(`[seo] sitemap file not found: ${sitemapPath}`);
  process.exit(1);
}

const xml = fs.readFileSync(sitemapPath, "utf8");
const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
const urls = locMatches.map((match) => match[1]);

const blog = fs.existsSync(blogJsonPath) ? JSON.parse(fs.readFileSync(blogJsonPath, "utf8")) : [];
const indexableEnglishArticleSlugs = new Set(
  blog
    .filter((item) => String(item?.locale || "").toLowerCase() === "en")
    .filter((item) => item?.translation_ready === true)
    .map((item) => String(item?.slug || "").trim())
    .filter(Boolean)
);

const errors = [];
for (const rawUrl of urls) {
  const pathname = new URL(rawUrl).pathname;
  if (!shouldIncludeInSitemap(pathname)) {
    errors.push(`[non-indexable] ${pathname}`);
    continue;
  }

  if (pathname === "/en/articles" && indexableEnglishArticleSlugs.size === 0) {
    errors.push(`[missing-en-content] ${pathname}`);
    continue;
  }

  const articleMatch = pathname.match(/^\/en\/articles\/([^/]+)$/i);
  if (articleMatch && !indexableEnglishArticleSlugs.has(articleMatch[1])) {
    errors.push(`[non-indexable-en-article] ${pathname}`);
  }
}

if (errors.length > 0) {
  console.error("[seo] sitemap indexability check failed");
  for (const err of errors.slice(0, 50)) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log(`[seo] sitemap indexability check passed: ${urls.length} urls`);
