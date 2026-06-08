#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { decodeXmlEntities, dedupeUrls } from "./lib/live-url-check.mjs";

const DEFAULT_SOURCE_URL = "https://api.fermatmind.com/api/v0.5/seo/sitemap-source";
const DEFAULT_SITEMAP_URL = "https://fermatmind.com/sitemap.xml";
const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_OUTPUT_MD = "docs/seo/sitemap_diff_report.md";
const DEFAULT_OUTPUT_JSON = "docs/seo/generated/sitemap-diff-report.v1.json";
const DEFAULT_TIMEOUT_MS = 25_000;
const ALLOWED_FETCH_HOSTS = new Set(["api.fermatmind.com", "fermatmind.com", "staging.fermatmind.com"]);
const LOCALE_PREFIX_RE = /^\/(?:en|zh)(?=\/|$)/i;
const PRIVATE_PATH_PATTERNS = [
  /^\/api(?:\/|$)/i,
  /^\/result(?:s)?(?:\/|$)/i,
  /^\/order(?:s)?(?:\/|$)/i,
  /^\/share(?:\/|$)/i,
  /^\/pay(?:\/|$)/i,
  /^\/payment(?:s)?(?:\/|$)/i,
  /^\/history(?:\/|$)/i,
  /^\/tests\/[^/]+\/take(?:\/|$)/i,
];

const RULE_SOURCES = {
  sitemapAuthorityAdapters:
    "lib/seo/sitemapAuthorityAdapters.cjs:SITEMAP_FINAL_PATH_DENY_PATTERNS,SITEMAP_ROUTE_EXCLUDES",
  indexingPolicy: "lib/seo/indexingPolicy.cjs:getNoindexReasonForPath",
  discoverabilityExposurePolicy:
    "lib/seo/discoverabilityExposurePolicy.cjs:DISCOVERABILITY_PRIVATE_PATH_PATTERNS",
  nextSitemapCatalog: "next-sitemap.config.js:scale catalog localized test URLs",
  backendSitemapGenerator: "fap-api/backend/app/Services/SEO/SitemapGenerator.php:getScaleUrls/static URLs",
};

const ROOT_TEST_ALIAS_RE = /^\/tests\/[^/]+$/i;
const RULE_EXCLUDED_PATHS = new Set([
  "/datasets",
  "/datasets/occupations",
  "/datasets/occupations/method",
  "/en/datasets",
  "/zh/datasets",
  "/help/about",
  "/help/for-business-and-research",
  "/help/privacy",
  "/help/refund-policy",
  "/help/team",
  "/help/terms-of-service",
  "/help/used-and-mentioned",
  "/en/help/about",
  "/en/help/for-business-and-research",
  "/en/help/privacy",
  "/en/help/refund-policy",
  "/en/help/team",
  "/en/help/terms-of-service",
  "/en/help/used-and-mentioned",
  "/zh/help/about",
  "/zh/help/for-business-and-research",
  "/zh/help/privacy",
  "/zh/help/refund-policy",
  "/zh/help/team",
  "/zh/help/terms-of-service",
  "/zh/help/used-and-mentioned",
]);
const NOINDEX_PATHS = new Set(["/en/career/jobs", "/zh/career/jobs"]);

function normalizeSiteOrigin(siteUrl = DEFAULT_SITE_URL) {
  return new URL(siteUrl).origin;
}

function stripLocalePrefix(pathname) {
  const stripped = String(pathname || "/").replace(LOCALE_PREFIX_RE, "");
  return stripped || "/";
}

function normalizePathname(pathname) {
  const normalized = String(pathname || "/").replace(/\/{2,}/g, "/");
  if (normalized.length > 1) {
    return normalized.replace(/\/+$/g, "") || "/";
  }
  return normalized || "/";
}

export function normalizeUrl(value, siteUrl = DEFAULT_SITE_URL) {
  const origin = normalizeSiteOrigin(siteUrl);
  const parsed = new URL(String(value || "/"), origin);
  parsed.hash = "";
  parsed.pathname = normalizePathname(parsed.pathname);
  if (parsed.hostname === "www.fermatmind.com" || parsed.hostname === "staging.fermatmind.com") {
    return `${origin}${parsed.pathname}${parsed.search}`;
  }
  if (parsed.hostname === "fermatmind.com") {
    return `${origin}${parsed.pathname}${parsed.search}`;
  }
  return parsed.toString();
}

export function parseSitemapLocs(xml, siteUrl = DEFAULT_SITE_URL) {
  const locMatches = [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
  return dedupeUrls(
    locMatches
      .map((match) => decodeXmlEntities(match[1]).trim())
      .filter(Boolean)
      .map((loc) => normalizeUrl(loc, siteUrl))
  );
}

function extractSourceItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload?.urls)) {
    return payload.urls;
  }
  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }
  if (Array.isArray(payload?.data?.urls)) {
    return payload.data.urls;
  }
  return [];
}

export function parseSourceItems(payload, siteUrl = DEFAULT_SITE_URL) {
  return dedupeUrls(
    extractSourceItems(payload)
      .map((item) => (typeof item === "string" ? item : item?.loc || item?.url || item?.path))
      .filter(Boolean)
      .map((loc) => normalizeUrl(loc, siteUrl))
  );
}

function isPrivatePath(pathname) {
  const stripped = stripLocalePrefix(pathname);
  return PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

function classifyBackendOnly(url) {
  const pathname = new URL(url).pathname;
  const stripped = stripLocalePrefix(pathname);

  if (isPrivatePath(pathname)) {
    return {
      label: "excluded_by_private_path",
      explanation: "Backend source includes a private URL family that the live sitemap must never expose.",
      rule_source: RULE_SOURCES.discoverabilityExposurePolicy,
    };
  }

  if (NOINDEX_PATHS.has(pathname)) {
    return {
      label: "excluded_by_noindex",
      explanation: "Frontend indexing policy marks this index page noindex, so it is intentionally absent live.",
      rule_source: RULE_SOURCES.indexingPolicy,
    };
  }

  if (ROOT_TEST_ALIAS_RE.test(stripped) || RULE_EXCLUDED_PATHS.has(pathname) || RULE_EXCLUDED_PATHS.has(stripped)) {
    return {
      label: "excluded_by_rule",
      explanation: ROOT_TEST_ALIAS_RE.test(stripped)
        ? "Backend source emits a root /tests/* alias while live sitemap uses localized canonical test URLs."
        : "Frontend sitemap authority adapters explicitly deny or exclude this static/help/dataset URL.",
      rule_source: RULE_SOURCES.sitemapAuthorityAdapters,
    };
  }

  return {
    label: "unknown",
    explanation: "Backend-only URL did not match the known frontend exclusion, noindex, or private-path rules.",
    rule_source: "",
  };
}

function classifyLiveOnly(url) {
  const pathname = new URL(url).pathname;

  if (isPrivatePath(pathname)) {
    return {
      label: "excluded_by_private_path",
      explanation: "Live sitemap contains a private URL family; this is a safety violation.",
      rule_source: RULE_SOURCES.discoverabilityExposurePolicy,
    };
  }

  return {
    label: "missing_unexpectedly",
    explanation: "Public live sitemap URL is not represented in backend sitemap-source authority.",
    rule_source: pathname.includes("/tests/") ? RULE_SOURCES.nextSitemapCatalog : RULE_SOURCES.backendSitemapGenerator,
  };
}

function sortUrls(urls) {
  return [...urls].sort((a, b) => a.localeCompare(b));
}

function groupCounts(rows) {
  return rows.reduce((counts, row) => {
    counts[row.label] = (counts[row.label] || 0) + 1;
    return counts;
  }, {});
}

function buildRows(sourceUrls, liveUrls) {
  const sourceSet = new Set(sourceUrls);
  const liveSet = new Set(liveUrls);
  const rows = [];

  for (const url of sortUrls(sourceUrls)) {
    if (liveSet.has(url)) {
      rows.push({
        url,
        side: "both",
        label: "included",
        explanation: "URL is present in both backend sitemap-source and live sitemap.xml.",
        rule_source: "",
      });
    } else {
      rows.push({ url, side: "backend_only", ...classifyBackendOnly(url) });
    }
  }

  for (const url of sortUrls(liveUrls)) {
    if (!sourceSet.has(url)) {
      rows.push({ url, side: "live_only", ...classifyLiveOnly(url) });
    }
  }

  return rows;
}

export function buildSitemapDiffReport({
  sourcePayload = {},
  sitemapXml = "",
  sourceUrl = DEFAULT_SOURCE_URL,
  sitemapUrl = DEFAULT_SITEMAP_URL,
  siteUrl = DEFAULT_SITE_URL,
  sourceHeaders = {},
  sitemapHeaders = {},
  fetchedAt = new Date().toISOString(),
  sourceStatus = 200,
  sitemapStatus = 200,
} = {}) {
  const sourceUrls = parseSourceItems(sourcePayload, siteUrl);
  const liveUrls = parseSitemapLocs(sitemapXml, siteUrl);
  const rows = buildRows(sourceUrls, liveUrls);
  const differenceRows = rows.filter((row) => row.side !== "both");
  const privateLiveUrls = liveUrls.filter((url) => isPrivatePath(new URL(url).pathname));
  const labelCounts = groupCounts(rows);
  const differenceLabelCounts = groupCounts(differenceRows);

  return {
    schema_version: 1,
    generated_at: fetchedAt,
    source: {
      url: sourceUrl,
      status: sourceStatus,
      count_field: Number.isFinite(sourcePayload?.count) ? sourcePayload.count : null,
      url_count: sourceUrls.length,
      cache_state: sourceHeaders["x-fermat-cache"] || sourceHeaders["X-Fermat-Cache"] || null,
      generated_at: sourcePayload?.generated_at || sourcePayload?.generatedAt || null,
    },
    live_sitemap: {
      url: sitemapUrl,
      status: sitemapStatus,
      url_count: liveUrls.length,
      last_modified: sitemapHeaders["last-modified"] || sitemapHeaders["Last-Modified"] || null,
    },
    summary: {
      included_count: labelCounts.included || 0,
      backend_only_count: differenceRows.filter((row) => row.side === "backend_only").length,
      live_only_count: differenceRows.filter((row) => row.side === "live_only").length,
      net_source_minus_live: sourceUrls.length - liveUrls.length,
      private_live_url_count: privateLiveUrls.length,
      label_counts: {
        included: labelCounts.included || 0,
        excluded_by_rule: labelCounts.excluded_by_rule || 0,
        excluded_by_noindex: labelCounts.excluded_by_noindex || 0,
        excluded_by_private_path: labelCounts.excluded_by_private_path || 0,
        missing_unexpectedly: labelCounts.missing_unexpectedly || 0,
        cache_stale: labelCounts.cache_stale || 0,
        unknown: labelCounts.unknown || 0,
      },
      difference_label_counts: {
        excluded_by_rule: differenceLabelCounts.excluded_by_rule || 0,
        excluded_by_noindex: differenceLabelCounts.excluded_by_noindex || 0,
        excluded_by_private_path: differenceLabelCounts.excluded_by_private_path || 0,
        missing_unexpectedly: differenceLabelCounts.missing_unexpectedly || 0,
        cache_stale: differenceLabelCounts.cache_stale || 0,
        unknown: differenceLabelCounts.unknown || 0,
      },
    },
    rule_sources: RULE_SOURCES,
    private_live_urls: privateLiveUrls,
    differences: differenceRows,
  };
}

function escapeMarkdown(value) {
  return String(value ?? "").replace(/[&<>|\r\n]/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === "|") return "&#124;";
    return " ";
  });
}

function renderTableRows(rows) {
  if (rows.length === 0) {
    return "_No rows._";
  }

  return [
    "| side | label | URL | explanation | rule source |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.side} | ${row.label} | ${escapeMarkdown(row.url)} | ${escapeMarkdown(
          row.explanation
        )} | ${escapeMarkdown(row.rule_source)} |`
    ),
  ].join("\n");
}

export function renderMarkdownReport(report) {
  const backendOnly = report.differences.filter((row) => row.side === "backend_only");
  const liveOnly = report.differences.filter((row) => row.side === "live_only");

  return `# Sitemap Source vs Live Diff Report

Generated: ${report.generated_at}

## Scope

This report is observation-only. It compares backend sitemap-source with the public live sitemap and does not change sitemap generation behavior.

## Inputs

- Backend source: ${report.source.url}
- Backend status: ${report.source.status}
- Backend count field: ${report.source.count_field ?? "n/a"}
- Backend parsed URLs: ${report.source.url_count}
- Backend cache state: ${report.source.cache_state ?? "n/a"}
- Live sitemap: ${report.live_sitemap.url}
- Live status: ${report.live_sitemap.status}
- Live parsed URLs: ${report.live_sitemap.url_count}
- Live Last-Modified: ${report.live_sitemap.last_modified ?? "n/a"}

## Summary

- Included in both: ${report.summary.included_count}
- Backend-only: ${report.summary.backend_only_count}
- Live-only: ${report.summary.live_only_count}
- Net source minus live: ${report.summary.net_source_minus_live}
- Live private URL violations: ${report.summary.private_live_url_count}
- Difference labels: ${Object.entries(report.summary.difference_label_counts)
    .map(([label, count]) => `${label}=${count}`)
    .join(", ")}

## Rule Sources

- excluded_by_rule: ${RULE_SOURCES.sitemapAuthorityAdapters}
- excluded_by_noindex: ${RULE_SOURCES.indexingPolicy}
- excluded_by_private_path: ${RULE_SOURCES.discoverabilityExposurePolicy}
- missing_unexpectedly localized tests: ${RULE_SOURCES.nextSitemapCatalog}
- missing_unexpectedly backend authority: ${RULE_SOURCES.backendSitemapGenerator}

## Backend-Only Differences

${renderTableRows(backendOnly)}

## Live-Only Differences

${renderTableRows(liveOnly)}

## Safety Notes

- Private live URL list: ${report.private_live_urls.length === 0 ? "none" : report.private_live_urls.join(", ")}
- Labels intentionally preserve unknown when a URL cannot be explained by current source-backed rules.
`;
}

function parseArgs(argv) {
  const config = {
    sourceUrl: DEFAULT_SOURCE_URL,
    sitemapUrl: DEFAULT_SITEMAP_URL,
    siteUrl: DEFAULT_SITE_URL,
    outputMd: DEFAULT_OUTPUT_MD,
    outputJson: DEFAULT_OUTPUT_JSON,
    sourceFixture: "",
    sitemapFixture: "",
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--source-url") {
      config.sourceUrl = next;
      index += 1;
    } else if (arg === "--sitemap-url") {
      config.sitemapUrl = next;
      index += 1;
    } else if (arg === "--site-url") {
      config.siteUrl = next;
      index += 1;
    } else if (arg === "--output-md") {
      config.outputMd = next;
      index += 1;
    } else if (arg === "--output-json") {
      config.outputJson = next;
      index += 1;
    } else if (arg === "--source-fixture") {
      config.sourceFixture = next;
      index += 1;
    } else if (arg === "--sitemap-fixture") {
      config.sitemapFixture = next;
      index += 1;
    } else if (arg === "--timeout-ms") {
      config.timeoutMs = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--help") {
      config.help = true;
    } else {
      throw new Error(`unknown_arg=${arg}`);
    }
  }

  return config;
}

function assertFetchAllowed(url) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`invalid_protocol=${parsed.protocol}`);
  }
  if (!ALLOWED_FETCH_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`unexpected_host=${parsed.hostname}`);
  }
}

async function fetchText(url, timeoutMs, headers = {}) {
  assertFetchAllowed(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "FermatMind SEO sitemap source/live diff",
        ...headers,
      },
    });
    const text = await response.text();
    return {
      status: response.status,
      text,
      durationMs: Math.round(performance.now() - started),
      headers: Object.fromEntries(response.headers.entries()),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function loadInputs(config) {
  if (config.sourceFixture && config.sitemapFixture) {
    return {
      sourceStatus: 200,
      sitemapStatus: 200,
      sourcePayload: JSON.parse(fs.readFileSync(config.sourceFixture, "utf8")),
      sitemapXml: fs.readFileSync(config.sitemapFixture, "utf8"),
      sourceHeaders: {},
      sitemapHeaders: {},
    };
  }

  const [sourceResult, sitemapResult] = await Promise.all([
    fetchText(config.sourceUrl, config.timeoutMs, { Accept: "application/json" }),
    fetchText(config.sitemapUrl, config.timeoutMs, { Accept: "application/xml,text/xml,text/plain,*/*" }),
  ]);

  return {
    sourceStatus: sourceResult.status,
    sitemapStatus: sitemapResult.status,
    sourcePayload: JSON.parse(sourceResult.text),
    sitemapXml: sitemapResult.text,
    sourceHeaders: sourceResult.headers,
    sitemapHeaders: sitemapResult.headers,
  };
}

function printHelp() {
  console.log(`Usage: node scripts/seo/diff-sitemap-source-vs-live.mjs [options]

Options:
  --source-url <url>       Backend sitemap-source URL.
  --sitemap-url <url>      Live sitemap.xml URL.
  --site-url <url>         Canonical site origin for normalization.
  --output-md <path>       Markdown report path.
  --output-json <path>     JSON report path.
  --source-fixture <path>  Local backend source JSON fixture.
  --sitemap-fixture <path> Local sitemap XML fixture.
  --timeout-ms <ms>        Request timeout in milliseconds.
`);
}

export async function runCli(argv = process.argv.slice(2)) {
  const config = parseArgs(argv);
  if (config.help) {
    printHelp();
    return { exitCode: 0 };
  }

  const inputs = await loadInputs(config);
  const report = buildSitemapDiffReport({
    ...inputs,
    sourceUrl: config.sourceUrl,
    sitemapUrl: config.sitemapUrl,
    siteUrl: config.siteUrl,
  });
  const markdown = renderMarkdownReport(report);

  fs.mkdirSync(path.dirname(config.outputMd), { recursive: true });
  fs.mkdirSync(path.dirname(config.outputJson), { recursive: true });
  fs.writeFileSync(config.outputMd, `${markdown.trimEnd()}\n`);
  fs.writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `sitemap diff: source=${report.source.url_count} live=${report.live_sitemap.url_count} ` +
      `backend_only=${report.summary.backend_only_count} live_only=${report.summary.live_only_count} ` +
      `unknown=${report.summary.difference_label_counts.unknown} private_live=${report.summary.private_live_url_count}`
  );

  return { exitCode: 0, report };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
