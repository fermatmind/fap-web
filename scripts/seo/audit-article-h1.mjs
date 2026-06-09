#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { decodeXmlEntities, dedupeUrls } from "./lib/live-url-check.mjs";

const DEFAULT_SITE_URL = "https://fermatmind.com";
const DEFAULT_SITEMAP_URL = "https://fermatmind.com/sitemap.xml";
const DEFAULT_OUTPUT_JSON = "docs/seo/generated/article-h1-audit.v1.json";
const DEFAULT_OUTPUT_MD = "docs/seo/article_h1_audit_report.md";
const DEFAULT_SAMPLE_SIZE = 20;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_SEED = "ARTICLE-H1-03";
const ALLOWED_HOSTS = new Set(["fermatmind.com", "staging.fermatmind.com"]);
const ARTICLE_DETAIL_PATH_RE = /^\/(?:en|zh)\/articles\/[a-z0-9][a-z0-9-]*$/i;

/**
 * @typedef {{ reason: string, detail: string }} ArticleH1Issue
 * @typedef {{
 *   url: string,
 *   final_url: string,
 *   status: number,
 *   duration_ms: number,
 *   h1_count: number,
 *   h1_texts: string[],
 *   passed: boolean,
 *   issues: ArticleH1Issue[],
 * }} ArticleH1PageResult
 */

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeUrl(value, siteUrl = DEFAULT_SITE_URL) {
  const origin = new URL(siteUrl).origin;
  const parsed = new URL(String(value || "/"), origin);
  parsed.hash = "";
  parsed.pathname = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/g, "") : parsed.pathname;
  return `${parsed.origin}${parsed.pathname}${parsed.search}`;
}

function assertAllowedUrl(rawUrl, label = "url") {
  const parsed = new URL(rawUrl);
  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new Error(`invalid_${label}_protocol=${parsed.protocol}`);
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`unexpected_${label}_host=${parsed.hostname}`);
  }
}

export function parseSitemapArticleUrls(xml, siteUrl = DEFAULT_SITE_URL) {
  const origin = new URL(siteUrl).origin;
  const locMatches = [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
  return dedupeUrls(
    locMatches
      .map((match) => decodeXmlEntities(match[1]).trim())
      .filter(Boolean)
      .map((loc) => normalizeUrl(loc, origin))
      .filter((url) => {
        const parsed = new URL(url);
        return parsed.origin === origin && ARTICLE_DETAIL_PATH_RE.test(parsed.pathname);
      })
  );
}

function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1_000_000) / 1_000_000;
  };
}

export function selectArticleSample(urls, sampleSize = DEFAULT_SAMPLE_SIZE, seed = DEFAULT_SEED) {
  const random = seededRandom(seed);
  const rows = urls.map((url) => ({ url, score: random() }));
  rows.sort((a, b) => a.score - b.score || a.url.localeCompare(b.url));
  return rows.slice(0, Math.min(sampleSize, rows.length)).map((row) => row.url);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildIssue(reason, detail = "") {
  return { reason, detail };
}

export async function inspectArticlePageH1(page, url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const started = performance.now();
  const issues = [];

  let response = null;
  try {
    response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    await page.waitForLoadState("networkidle", { timeout: Math.min(5_000, timeoutMs) }).catch(() => {});
    await page.waitForTimeout(250);
  } catch (error) {
    issues.push(buildIssue("navigation_failed", error instanceof Error ? error.message : String(error)));
  }

  const finalUrl = page.url();
  const status = response?.status() ?? 0;

  if (status !== 200) {
    issues.push(buildIssue("non_200_status", `status=${status}`));
  }

  if (finalUrl !== url) {
    issues.push(buildIssue("unexpected_final_url", finalUrl));
  }

  let h1Texts = [];
  try {
    h1Texts = await page.locator("h1").evaluateAll((nodes) =>
      nodes.map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
    );
  } catch (error) {
    issues.push(buildIssue("h1_count_failed", error instanceof Error ? error.message : String(error)));
  }

  const h1Count = h1Texts.length;
  if (h1Count !== 1) {
    issues.push(buildIssue("h1_count_not_one", `h1_count=${h1Count}`));
  }

  return {
    url,
    final_url: finalUrl,
    status,
    duration_ms: Math.round(performance.now() - started),
    h1_count: h1Count,
    h1_texts: h1Texts.map(normalizeText),
    passed: issues.length === 0,
    issues,
  };
}

/**
 * @param {{
 *   sitemapUrl?: string,
 *   siteUrl?: string,
 *   fetchedAt?: string,
 *   sampleSize?: number,
 *   seed?: string,
 *   sitemapStatus?: number,
 *   sitemapArticleUrlCount?: number,
 *   sampledUrls?: string[],
 *   pageResults?: ArticleH1PageResult[],
 *   runner?: string,
 * }} options
 */
export function buildArticleH1AuditReport({
  sitemapUrl = DEFAULT_SITEMAP_URL,
  siteUrl = DEFAULT_SITE_URL,
  fetchedAt = new Date().toISOString(),
  sampleSize = DEFAULT_SAMPLE_SIZE,
  seed = DEFAULT_SEED,
  sitemapStatus = 200,
  sitemapArticleUrlCount = 0,
  sampledUrls = [],
  pageResults = [],
  runner = "playwright-chromium-final-dom",
} = {}) {
  const failedPages = pageResults.filter((row) => !row.passed);
  const h1CountDistribution = pageResults.reduce((counts, row) => {
    const key = String(row.h1_count);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const issues = [];
  if (sitemapStatus !== 200) {
    issues.push(buildIssue("sitemap_non_200", `status=${sitemapStatus}`));
  }
  if (sitemapArticleUrlCount < sampleSize) {
    issues.push(buildIssue("insufficient_article_urls", `found=${sitemapArticleUrlCount} required=${sampleSize}`));
  }
  if (sampledUrls.length < sampleSize) {
    issues.push(buildIssue("insufficient_sample_size", `sampled=${sampledUrls.length} required=${sampleSize}`));
  }
  if (failedPages.length > 0) {
    issues.push(buildIssue("page_h1_failures", `failed=${failedPages.length}`));
  }

  return {
    schema_version: 1,
    generated_at: fetchedAt,
    runner,
    source: {
      sitemap_url: sitemapUrl,
      site_url: siteUrl,
      sitemap_status: sitemapStatus,
      article_detail_url_count: sitemapArticleUrlCount,
    },
    sample: {
      requested_size: sampleSize,
      actual_size: sampledUrls.length,
      seed,
      strategy: "seeded_random_from_live_sitemap_article_detail_urls",
      urls: sampledUrls,
    },
    summary: {
      passed: issues.length === 0,
      audited_page_count: pageResults.length,
      passed_page_count: pageResults.filter((row) => row.passed).length,
      failed_page_count: failedPages.length,
      h1_count_distribution: h1CountDistribution,
      issue_count: issues.length,
    },
    issues,
    pages: pageResults,
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

function renderPageRows(rows) {
  if (rows.length === 0) return "_No audited pages._";

  return [
    "| status | H1 count | URL | H1 text | issues |",
    "| --- | ---: | --- | --- | --- |",
    ...rows.map((row) => {
      const issues = row.issues.map((issue) => `${issue.reason}:${issue.detail}`).join("; ") || "none";
      return `| ${row.status} | ${row.h1_count} | ${escapeMarkdown(row.url)} | ${escapeMarkdown(
        row.h1_texts.join(" / ")
      )} | ${escapeMarkdown(issues)} |`;
    }),
  ].join("\n");
}

export function renderMarkdownReport(report) {
  return `# Article H1 Audit Report

Generated: ${report.generated_at}

## Scope

This report is observation-only. It audits public article detail pages from the live sitemap and does not change article rendering, CMS content, article titles, metadata, body, FAQ, CTA, or backend validation behavior.

## Inputs

- Sitemap: ${report.source.sitemap_url}
- Site: ${report.source.site_url}
- Sitemap status: ${report.source.sitemap_status}
- Live article detail URLs discovered: ${report.source.article_detail_url_count}
- Runner: ${report.runner}
- Sample strategy: ${report.sample.strategy}
- Sample seed: ${report.sample.seed}
- Requested sample size: ${report.sample.requested_size}
- Actual sample size: ${report.sample.actual_size}

## Summary

- Passed: ${report.summary.passed}
- Audited pages: ${report.summary.audited_page_count}
- Passed pages: ${report.summary.passed_page_count}
- Failed pages: ${report.summary.failed_page_count}
- H1 count distribution: ${Object.entries(report.summary.h1_count_distribution)
    .map(([count, total]) => `${count}=${total}`)
    .join(", ")}
- Audit issue count: ${report.summary.issue_count}

## Audited Article Pages

${renderPageRows(report.pages)}

## Acceptance Notes

- At least 20 public article detail pages are sampled when the live sitemap exposes at least 20 article detail URLs.
- Each audited page must finish with exactly one \`<h1>\` in the Playwright Chromium DOM.
- The default CLI mode is report-only; use \`--assert-clean\` when the same script should act as a failing gate.
- CMS body H1 prevention is owned by ARTICLE-H1-02; frontend DOM fallback is owned by ARTICLE-H1-01.
- ARTICLE-H1-03 does not mutate CMS data and does not deploy.
`;
}

function parseArgs(argv) {
  const config = {
    sitemapUrl: DEFAULT_SITEMAP_URL,
    siteUrl: DEFAULT_SITE_URL,
    outputJson: DEFAULT_OUTPUT_JSON,
    outputMd: DEFAULT_OUTPUT_MD,
    sampleSize: DEFAULT_SAMPLE_SIZE,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    seed: DEFAULT_SEED,
    headless: true,
    assertClean: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--sitemap-url") {
      config.sitemapUrl = next;
      index += 1;
    } else if (arg.startsWith("--sitemap-url=")) {
      config.sitemapUrl = arg.slice("--sitemap-url=".length);
    } else if (arg === "--site-url") {
      config.siteUrl = next;
      index += 1;
    } else if (arg.startsWith("--site-url=")) {
      config.siteUrl = arg.slice("--site-url=".length);
    } else if (arg === "--output") {
      config.outputJson = next;
      index += 1;
    } else if (arg.startsWith("--output=")) {
      config.outputJson = arg.slice("--output=".length);
    } else if (arg === "--report") {
      config.outputMd = next;
      index += 1;
    } else if (arg.startsWith("--report=")) {
      config.outputMd = arg.slice("--report=".length);
    } else if (arg === "--sample-size") {
      config.sampleSize = readPositiveInt(next, DEFAULT_SAMPLE_SIZE);
      index += 1;
    } else if (arg.startsWith("--sample-size=")) {
      config.sampleSize = readPositiveInt(arg.slice("--sample-size=".length), DEFAULT_SAMPLE_SIZE);
    } else if (arg === "--timeout-ms") {
      config.timeoutMs = readPositiveInt(next, DEFAULT_TIMEOUT_MS);
      index += 1;
    } else if (arg.startsWith("--timeout-ms=")) {
      config.timeoutMs = readPositiveInt(arg.slice("--timeout-ms=".length), DEFAULT_TIMEOUT_MS);
    } else if (arg === "--seed") {
      config.seed = next || DEFAULT_SEED;
      index += 1;
    } else if (arg.startsWith("--seed=")) {
      config.seed = arg.slice("--seed=".length) || DEFAULT_SEED;
    } else if (arg === "--headed") {
      config.headless = false;
    } else if (arg === "--assert-clean") {
      config.assertClean = true;
    } else if (arg === "--help") {
      config.help = true;
    } else {
      throw new Error(`unknown_arg=${arg}`);
    }
  }

  return config;
}

function printHelp() {
  console.log(`Usage: node scripts/seo/audit-article-h1.mjs [options]

Options:
  --sitemap-url <url>   Live sitemap URL. Default: ${DEFAULT_SITEMAP_URL}
  --site-url <url>      Site origin used for article URL normalization. Default: ${DEFAULT_SITE_URL}
  --sample-size <n>     Number of article detail pages to sample. Default: ${DEFAULT_SAMPLE_SIZE}
  --seed <value>        Seed for deterministic random sampling. Default: ${DEFAULT_SEED}
  --output <path>       JSON output path. Default: ${DEFAULT_OUTPUT_JSON}
  --report <path>       Markdown report path. Default: ${DEFAULT_OUTPUT_MD}
  --timeout-ms <n>      Per-page navigation timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --headed              Run Chromium headed for local debugging.
  --assert-clean        Exit non-zero when the sampled live DOM is not single-H1 clean.
`);
}

async function fetchSitemap(config) {
  assertAllowedUrl(config.sitemapUrl, "sitemap");
  assertAllowedUrl(config.siteUrl, "site");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(config.sitemapUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/xml,text/xml,text/plain,*/*",
        "Cache-Control": "no-cache",
        "User-Agent": "FermatMind article H1 live DOM auditor",
      },
    });
    return { status: response.status, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

export async function runLiveArticleH1Audit(config) {
  const sitemap = await fetchSitemap(config);
  const articleUrls = parseSitemapArticleUrls(sitemap.text, config.siteUrl);
  const sampledUrls = selectArticleSample(articleUrls, config.sampleSize, config.seed);
  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({ javaScriptEnabled: true });

  await context.route("**/*", async (route) => {
    const request = route.request();
    if (["font", "image", "media"].includes(request.resourceType())) {
      await route.abort();
      return;
    }
    await route.continue();
  });

  const pageResults = [];
  try {
    for (const url of sampledUrls) {
      assertAllowedUrl(url, "article");
      const page = await context.newPage();
      try {
        pageResults.push(await inspectArticlePageH1(page, url, config.timeoutMs));
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return buildArticleH1AuditReport({
    sitemapUrl: config.sitemapUrl,
    siteUrl: config.siteUrl,
    sampleSize: config.sampleSize,
    seed: config.seed,
    sitemapStatus: sitemap.status,
    sitemapArticleUrlCount: articleUrls.length,
    sampledUrls,
    pageResults,
  });
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (config.help) {
    printHelp();
    return;
  }

  const report = await runLiveArticleH1Audit(config);
  fs.mkdirSync(path.dirname(config.outputJson), { recursive: true });
  fs.mkdirSync(path.dirname(config.outputMd), { recursive: true });
  fs.writeFileSync(config.outputJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(config.outputMd, renderMarkdownReport(report));

  console.log(
    `[article-h1-audit] passed=${report.summary.passed} audited=${report.summary.audited_page_count} failed=${report.summary.failed_page_count} output=${config.outputJson} report=${config.outputMd}`
  );
  for (const page of report.pages) {
    console.log(
      `[article-h1-audit:page] status=${page.status} h1_count=${page.h1_count} passed=${page.passed} url=${page.url}`
    );
  }

  process.exit(config.assertClean && !report.summary.passed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[article-h1-audit] failed=${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
