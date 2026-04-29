#!/usr/bin/env node
import {
  checkLiveUrl,
  decodeXmlEntities,
  dedupeUrls,
  fetchNoRedirect,
  LIVE_CHECK_DEFAULTS,
  mapWithConcurrency,
  makeIssue,
  printSummary,
} from "./lib/live-url-check.mjs";

const sourceUrl = process.argv[2];

if (!sourceUrl) {
  console.error("Usage: node scripts/seo/assert-live-sitemap-clean.mjs <sitemap-url>");
  process.exit(2);
}

let sitemapResponse;
try {
  sitemapResponse = await fetchNoRedirect(sourceUrl, {
    timeoutMs: Math.max(LIVE_CHECK_DEFAULTS.timeoutMs, 30_000),
    accept: "application/xml,text/xml,text/plain,*/*",
  });
} catch (error) {
  console.error(`[seo-live] failed_to_fetch_sitemap=${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (sitemapResponse.response.status >= 300 && sitemapResponse.response.status < 400) {
  console.error(
    `[seo-live] sitemap_redirect status=${sitemapResponse.response.status} location=${sitemapResponse.response.headers.get("location") || ""}`
  );
  process.exit(1);
}

if (sitemapResponse.response.status < 200 || sitemapResponse.response.status >= 300) {
  console.error(`[seo-live] sitemap_bad_status status=${sitemapResponse.response.status}`);
  process.exit(1);
}

const locMatches = [...sitemapResponse.body.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
const urls = dedupeUrls(locMatches.map((match) => decodeXmlEntities(match[1]).trim()).filter(Boolean));

const badRows = [];
if (urls.length === 0) {
  badRows.push(makeIssue(sourceUrl, "empty-sitemap", "No <loc> URLs found."));
}

const checkedRows = await mapWithConcurrency(
  urls,
  LIVE_CHECK_DEFAULTS.concurrency,
  async (url) => checkLiveUrl(url, LIVE_CHECK_DEFAULTS)
);

for (const issue of checkedRows) {
  if (issue) {
    badRows.push(issue);
  }
}

printSummary({
  label: "sitemap",
  sourceUrl,
  totalUrls: urls.length,
  checkedUrls: urls.length,
  badRows,
});

process.exit(badRows.length > 0 ? 1 : 0);
