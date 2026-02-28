import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policy from "../../lib/seo/indexingPolicy.cjs";

const { shouldIncludeInSitemap } = policy;

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sitemapPath = path.resolve(ROOT_DIR, process.env.SITEMAP_PATH || "public/sitemap-0.xml");
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
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url) => {
    const pathname = new URL(url).pathname;
    return shouldIncludeInSitemap(pathname);
  });

const endpoint =
  process.env.BAIDU_PUSH_ENDPOINT || `http://data.zz.baidu.com/urls?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: urls.join("\n"),
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
