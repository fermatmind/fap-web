import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policy from "../../lib/seo/indexingPolicy.cjs";

const { shouldIncludeInSitemap } = policy;

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sitemapPath = path.resolve(ROOT_DIR, process.env.SITEMAP_PATH || "public/sitemap.xml");
const site = String(process.env.BAIDU_PUSH_SITE || "").trim();
const token = String(process.env.BAIDU_PUSH_TOKEN || "").trim();

if (!site || !token) {
  console.error("[baidu] missing BAIDU_PUSH_SITE or BAIDU_PUSH_TOKEN");
  process.exit(1);
}

if (!fs.existsSync(sitemapPath)) {
  console.error(`[baidu] sitemap not found: ${sitemapPath}`);
  process.exit(1);
}

const xml = fs.readFileSync(sitemapPath, "utf8");
const allowedSitemapHost = resolveSiteHostname(site);
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => normalizeSitemapUrl(match[1], allowedSitemapHost))
  .filter((url) => {
    const pathname = new URL(url).pathname;
    return shouldIncludeInSitemap(pathname);
  });

const endpoint =
  process.env.BAIDU_PUSH_ENDPOINT || `https://data.zz.baidu.com/urls?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`;

const endpointUrl = new URL(endpoint);
if (endpointUrl.protocol !== "https:" || endpointUrl.hostname !== "data.zz.baidu.com") {
  console.error("[baidu] BAIDU_PUSH_ENDPOINT must use https://data.zz.baidu.com");
  process.exit(1);
}

const body = urls.join("\n");
const response = await fetch(endpointUrl.toString(), {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  // lgtm[js/file-access-to-http] URLs are parsed, scheme-limited, host-limited to BAIDU_PUSH_SITE, policy-filtered, and posted only to Baidu's fixed HTTPS endpoint.
  body,
});

if (!response.ok) {
  const body = await response.text();
  console.error(`[baidu] push failed: ${response.status} ${response.statusText}`);
  console.error(body);
  process.exit(1);
}

const resultText = await response.text();
console.log(`[baidu] pushed ${urls.length} urls`);
console.log(resultText);

function resolveSiteHostname(value) {
  const raw = value.replace(/\/+$/, "");
  const parsed = raw.startsWith("http://") || raw.startsWith("https://") ? new URL(raw) : new URL(`https://${raw}`);

  if (parsed.protocol !== "https:") {
    throw new Error("[baidu] BAIDU_PUSH_SITE must be an https site");
  }

  return parsed.hostname;
}

function normalizeSitemapUrl(value, allowedHost) {
  const url = new URL(String(value).trim());

  if (url.protocol !== "https:" || url.hostname !== allowedHost) {
    throw new Error(`[baidu] sitemap URL is outside the configured site: ${url.hostname}`);
  }

  url.hash = "";

  return url.toString();
}
