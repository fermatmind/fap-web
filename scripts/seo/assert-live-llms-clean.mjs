#!/usr/bin/env node
import {
  checkLiveUrl,
  dedupeUrls,
  fetchNoRedirect,
  getUnsafeLiveFetchIssue,
  LIVE_CHECK_DEFAULTS,
  mapWithConcurrency,
  makeIssue,
  printSummary,
  stripTrailingUrlPunctuation,
} from "./lib/live-url-check.mjs";

const sourceUrl = process.argv[2];
const FORBIDDEN_FINAL_PATHS = new Set(["/zh", "/en/help", "/zh/help"]);

if (!sourceUrl) {
  console.error("Usage: node scripts/seo/assert-live-llms-clean.mjs <llms-url>");
  process.exit(2);
}

const sourceIssue = getUnsafeLiveFetchIssue(sourceUrl);
if (sourceIssue) {
  console.error(`[seo-live] unsafe_llms_source=${JSON.stringify(sourceIssue)}`);
  process.exit(1);
}

let llmsResponse;
try {
  llmsResponse = await fetchNoRedirect(sourceUrl, {
    timeoutMs: LIVE_CHECK_DEFAULTS.sourceTimeoutMs,
    accept: "text/plain,text/markdown,*/*",
  });
} catch (error) {
  console.error(`[seo-live] failed_to_fetch_llms=${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (llmsResponse.response.status >= 300 && llmsResponse.response.status < 400) {
  console.error(
    `[seo-live] llms_redirect status=${llmsResponse.response.status} location=${llmsResponse.response.headers.get("location") || ""}`
  );
  process.exit(1);
}

if (llmsResponse.response.status < 200 || llmsResponse.response.status >= 300) {
  console.error(`[seo-live] llms_bad_status status=${llmsResponse.response.status}`);
  process.exit(1);
}

const urls = dedupeUrls(
  [...llmsResponse.body.matchAll(/https?:\/\/[^\s<>"'`]+/gi)]
    .map((match) => stripTrailingUrlPunctuation(match[0]))
    .filter(Boolean)
);

const badRows = [];
if (urls.length === 0) {
  badRows.push(makeIssue(sourceUrl, "empty-llms", "No http(s) URLs found."));
}

const checkedRows = await mapWithConcurrency(
  urls,
  LIVE_CHECK_DEFAULTS.concurrency,
  async (url) =>
    checkLiveUrl(url, {
      ...LIVE_CHECK_DEFAULTS,
      forbiddenFinalPaths: FORBIDDEN_FINAL_PATHS,
    })
);

for (const issue of checkedRows) {
  if (issue) {
    badRows.push(issue);
  }
}

printSummary({
  label: "llms",
  sourceUrl,
  totalUrls: urls.length,
  checkedUrls: urls.length,
  badRows,
});

process.exit(badRows.length > 0 ? 1 : 0);
