#!/usr/bin/env node
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { decodeXmlEntities, dedupeUrls } from "./lib/live-url-check.mjs";

const DEFAULT_SITEMAP_URL = "https://fermatmind.com/sitemap.xml";
const DEFAULT_REQUESTS = 8;
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_DELAY_MS = 250;
const DEFAULT_ALLOWED_SOURCE_HOSTS = ["fermatmind.com", "staging.fermatmind.com"];

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

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readHostList(value, fallback) {
  const hosts = String(value || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  return hosts.length > 0 ? hosts : fallback;
}

export function stripLocalePrefix(pathname) {
  const normalized = pathname || "/";
  const stripped = normalized.replace(/^\/(?:en|zh)(?=\/|$)/i, "");
  return stripped || "/";
}

export function isPrivateSitemapPath(pathname) {
  const stripped = stripLocalePrefix(pathname);
  return PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

export function parseSitemapLocs(xml) {
  const locMatches = [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
  return dedupeUrls(locMatches.map((match) => decodeXmlEntities(match[1]).trim()).filter(Boolean));
}

export function evaluateSitemapBody(body, { sourceUrl, allowedLocHosts } = {}) {
  const locs = parseSitemapLocs(body);
  const issues = [];
  const privateLocs = [];
  const unsafeLocs = [];

  if (locs.length === 0) {
    issues.push({ reason: "empty-sitemap", detail: "No <loc> URLs found." });
  }

  for (const loc of locs) {
    try {
      const parsed = new URL(loc);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        unsafeLocs.push({ loc, reason: "invalid-protocol", detail: parsed.protocol });
      }

      if (allowedLocHosts.length > 0 && !allowedLocHosts.includes(parsed.hostname.toLowerCase())) {
        unsafeLocs.push({ loc, reason: "unexpected-host", detail: parsed.hostname });
      }

      if (isPrivateSitemapPath(parsed.pathname)) {
        privateLocs.push(loc);
      }
    } catch {
      unsafeLocs.push({ loc, reason: "invalid-url", detail: "" });
    }
  }

  if (privateLocs.length > 0) {
    issues.push({ reason: "private-url-family", detail: privateLocs.slice(0, 20).join(", ") });
  }

  if (unsafeLocs.length > 0) {
    issues.push({ reason: "unsafe-loc", detail: JSON.stringify(unsafeLocs.slice(0, 20)) });
  }

  return {
    sourceUrl,
    locCount: locs.length,
    locs,
    privateLocs,
    unsafeLocs,
    issues,
  };
}

/**
 * @param {string[]} argv
 * @param {Record<string, string | undefined>} env
 */
export function buildConfig(argv = process.argv.slice(2), env = process.env) {
  const url = argv[0] || env.SEO_SITEMAP_STABILITY_URL || DEFAULT_SITEMAP_URL;
  const requests = readPositiveInt(env.SEO_SITEMAP_STABILITY_REQUESTS, DEFAULT_REQUESTS);
  const timeoutMs = readPositiveInt(env.SEO_SITEMAP_STABILITY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const delayMs = readPositiveInt(env.SEO_SITEMAP_STABILITY_DELAY_MS, DEFAULT_DELAY_MS);
  const allowedSourceHosts = readHostList(env.SEO_SITEMAP_STABILITY_ALLOWED_HOSTS, DEFAULT_ALLOWED_SOURCE_HOSTS);

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`invalid_sitemap_url=${url}`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`invalid_sitemap_protocol=${parsedUrl.protocol}`);
  }

  if (!allowedSourceHosts.includes(parsedUrl.hostname.toLowerCase())) {
    throw new Error(`unexpected_sitemap_host=${parsedUrl.hostname}`);
  }

  const allowedLocHosts = readHostList(env.SEO_SITEMAP_STABILITY_LOC_HOSTS, [parsedUrl.hostname.toLowerCase()]);

  return {
    url: parsedUrl.toString(),
    requests,
    timeoutMs,
    delayMs,
    allowedLocHosts,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSitemapOnce(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Accept: "application/xml,text/xml,text/plain,*/*",
        "Cache-Control": "no-cache",
        "User-Agent": "FermatMind SEO sitemap stability verifier",
      },
    });
    const body = await response.text().catch(() => "");
    const durationMs = Math.round(performance.now() - started);
    return { response, body, durationMs };
  } finally {
    clearTimeout(timer);
  }
}

export async function runSitemapStabilityCheck(config) {
  const results = [];
  const issues = [];

  for (let index = 0; index < config.requests; index += 1) {
    if (index > 0 && config.delayMs > 0) {
      await sleep(config.delayMs);
    }

    try {
      const fetched = await fetchSitemapOnce(config.url, config.timeoutMs);
      const status = fetched.response.status;
      const location = fetched.response.headers.get("location") || "";
      const bodyCheck = evaluateSitemapBody(fetched.body, {
        sourceUrl: config.url,
        allowedLocHosts: config.allowedLocHosts,
      });
      const result = {
        request: index + 1,
        status,
        durationMs: fetched.durationMs,
        locCount: bodyCheck.locCount,
        issueCount: bodyCheck.issues.length,
      };
      results.push(result);

      if (status !== 200) {
        issues.push({
          request: index + 1,
          reason: status >= 500 ? "sitemap-5xx" : "sitemap-non-200",
          detail: `status=${status}${location ? ` location=${location}` : ""}`,
        });
      }

      for (const issue of bodyCheck.issues) {
        issues.push({ request: index + 1, ...issue });
      }
    } catch (error) {
      issues.push({
        request: index + 1,
        reason: "request-failed",
        detail: error instanceof Error ? error.message : String(error),
      });
      results.push({
        request: index + 1,
        status: 0,
        durationMs: config.timeoutMs,
        locCount: 0,
        issueCount: 1,
      });
    }
  }

  const locCounts = new Set(results.map((result) => result.locCount));
  if (locCounts.size > 1) {
    issues.push({
      request: "all",
      reason: "loc-count-unstable",
      detail: [...locCounts].join(","),
    });
  }

  return {
    sourceUrl: config.url,
    requests: config.requests,
    results,
    issues,
    passed: issues.length === 0,
  };
}

export function printStabilitySummary(summary) {
  const durations = summary.results.map((result) => result.durationMs);
  const locCounts = summary.results.map((result) => result.locCount);
  const maxDurationMs = durations.length > 0 ? Math.max(...durations) : 0;
  const minLocCount = locCounts.length > 0 ? Math.min(...locCounts) : 0;
  const maxLocCount = locCounts.length > 0 ? Math.max(...locCounts) : 0;

  for (const result of summary.results) {
    console.log(
      `[seo-sitemap-stability:request] index=${result.request} status=${result.status} duration_ms=${result.durationMs} loc_count=${result.locCount} issue_count=${result.issueCount}`
    );
  }

  console.log(
    `[seo-sitemap-stability] source=${summary.sourceUrl} requests=${summary.requests} passed=${summary.passed} max_duration_ms=${maxDurationMs} min_loc_count=${minLocCount} max_loc_count=${maxLocCount} issue_count=${summary.issues.length}`
  );

  for (const issue of summary.issues.slice(0, 80)) {
    console.log(`[seo-sitemap-stability:issue] ${JSON.stringify(issue)}`);
  }
}

async function main() {
  const config = buildConfig();
  const summary = await runSitemapStabilityCheck(config);
  printStabilitySummary(summary);
  process.exit(summary.passed ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[seo-sitemap-stability] failed=${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
