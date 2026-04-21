import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policy from "../../lib/seo/indexingPolicy.cjs";

const { shouldIncludeInSitemap } = policy;
const NOINDEX_SITEMAP_PATTERNS = [
  /^\/(?:en|zh)\/relationships(?:\/|$)/i,
];

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sitemapPath = path.resolve(ROOT_DIR, process.env.SITEMAP_PATH || "public/sitemap.xml");

if (!fs.existsSync(sitemapPath)) {
  console.error(`[seo] sitemap file not found: ${sitemapPath}`);
  process.exit(1);
}

const xml = fs.readFileSync(sitemapPath, "utf8");
const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
const urls = locMatches.map((match) => match[1]);

const errors = [];
for (const rawUrl of urls) {
  const pathname = new URL(rawUrl).pathname;

  if (NOINDEX_SITEMAP_PATTERNS.some((pattern) => pattern.test(pathname))) {
    errors.push(`[noindex-in-sitemap] ${pathname}`);
    continue;
  }

  if (!shouldIncludeInSitemap(pathname)) {
    errors.push(`[non-indexable] ${pathname}`);
    continue;
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
