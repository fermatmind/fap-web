import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policy from "../../lib/seo/indexingPolicy.cjs";

const { shouldIncludeInSitemap } = policy;
const EXPECTED_HOST = "fermatmind.com";
const NOINDEX_SITEMAP_PATTERNS = [
  /^\/(?:en|zh)\/relationships(?:\/|$)/i,
];
const FORBIDDEN_PRIVATE_PATH_PATTERNS = [
  /^\/api(?:\/|$)/i,
  /^\/result(?:\/|$)/i,
  /^\/orders(?:\/|$)/i,
  /^\/share(?:\/|$)/i,
  /^\/pay(?:\/|$)/i,
  /^\/payment(?:\/|$)/i,
  /^\/history(?:\/|$)/i,
  /^\/tests\/[^/]+\/take(?:\/|$)/i,
];
const FORBIDDEN_FINAL_PATH_PATTERNS = [
  /^\/zh$/i,
  /^\/tests(?:\/|$)/i,
  /^\/(?:en|zh)\/blog$/i,
  /^\/(?:en|zh)\/help$/i,
  /^\/(?:en|zh)\/refund$/i,
  /^\/zh\/help\/(?:about|team|used-and-mentioned)$/i,
  /^\/en\/(?:brand|careers|charter|foundation|policies)$/i,
  /^\/datasets\/occupations(?:\/method)?$/i,
  /^\/(?:en|zh)\/datasets\/occupations(?:\/method)?$/i,
  /^\/career\/jobs\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i,
  /^\/ops(?:\/|$)/i,
  /^\/(?:en|zh)\/ops(?:\/|$)/i,
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

function normalizePathname(pathname) {
  const normalized = String(pathname || "/").replace(/\/{2,}/g, "/");
  if (normalized === "/") return "/";
  return normalized.replace(/\/+$/, "") || "/";
}

function stripLocalePrefix(pathname) {
  const normalized = normalizePathname(pathname);
  const stripped = normalized.replace(/^\/(?:en|zh)(?=\/|$)/i, "");
  return stripped || "/";
}

function matchesAny(patterns, pathname) {
  return patterns.some((pattern) => pattern.test(pathname));
}

const errors = [];
for (const rawUrl of urls) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    errors.push(`[invalid-url] ${rawUrl}`);
    continue;
  }

  const pathname = normalizePathname(parsed.pathname);
  const strippedPathname = stripLocalePrefix(pathname);

  if (parsed.hostname !== EXPECTED_HOST) {
    errors.push(`[non-apex-host] ${rawUrl}`);
    continue;
  }

  if (rawUrl.includes("www.fermatmind.com")) {
    errors.push(`[www-host] ${rawUrl}`);
    continue;
  }

  if (NOINDEX_SITEMAP_PATTERNS.some((pattern) => pattern.test(pathname))) {
    errors.push(`[noindex-in-sitemap] ${pathname}`);
    continue;
  }

  if (matchesAny(FORBIDDEN_PRIVATE_PATH_PATTERNS, strippedPathname)) {
    errors.push(`[private-flow-in-sitemap] ${pathname}`);
    continue;
  }

  if (matchesAny(FORBIDDEN_FINAL_PATH_PATTERNS, pathname)) {
    errors.push(`[forbidden-final-path] ${pathname}`);
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
