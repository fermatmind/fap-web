#!/usr/bin/env node

const DEFAULT_SITE_BASE_URL = "https://fermatmind.com";
const DEFAULT_API_BASE_URL = "https://api.fermatmind.com";
const DEFAULT_ALLOWED_HOSTS = ["fermatmind.com", "api.fermatmind.com"];
const DEFAULT_TIMEOUT_MS = 30_000;

export const SCIENCE_CONTENTPAGE_SLUGS = [
  "science",
  "item-design-notes",
  "reliability-validity",
  "data-privacy",
  "common-misconceptions",
];

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function normalizeBaseUrl(value, fallback) {
  const rawValue = stripTrailingSlash(value || fallback);
  const url = new URL(rawValue);
  url.pathname = stripTrailingSlash(url.pathname);
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function readAllowedHosts(env) {
  return String(env.SCIENCE_CONTENTPAGE_MONITOR_ALLOWED_HOSTS || DEFAULT_ALLOWED_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function buildConfig(env = process.env) {
  const siteBaseUrl = normalizeBaseUrl(env.SCIENCE_CONTENTPAGE_SITE_BASE_URL || env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_BASE_URL);
  const apiBaseUrl = normalizeBaseUrl(env.SCIENCE_CONTENTPAGE_API_BASE_URL || env.NEXT_PUBLIC_API_URL, DEFAULT_API_BASE_URL);
  const allowedHosts = readAllowedHosts(env);
  const timeoutMs = readPositiveInt(env.SCIENCE_CONTENTPAGE_MONITOR_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  for (const rawUrl of [siteBaseUrl, apiBaseUrl]) {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    if (!allowedHosts.includes(hostname)) {
      throw new Error(`unexpected_monitor_host=${hostname}`);
    }
  }

  return {
    siteBaseUrl,
    apiBaseUrl,
    allowedHosts,
    timeoutMs,
  };
}

function makeIssue(check, detail) {
  return { check, detail };
}

function buildApiUrl(apiBaseUrl, slug) {
  const basePath = new URL(apiBaseUrl).pathname.replace(/\/+$/, "");
  const normalizedBase = basePath.endsWith("/api/v0.5") ? apiBaseUrl : `${apiBaseUrl}/api/v0.5`;
  return `${normalizedBase}/content-pages/${slug}?locale=en`;
}

async function fetchText(url, config, accept = "*/*") {
  const parsed = new URL(url);
  if (!config.allowedHosts.includes(parsed.hostname.toLowerCase())) {
    throw new Error(`blocked_monitor_host=${parsed.hostname}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Accept: accept,
        "User-Agent": "FermatMind Science ContentPage live exposure monitor",
      },
    });
    const body = await response.text().catch(() => "");
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function includesRoute(body, siteBaseUrl, route) {
  const absolute = `${siteBaseUrl}${route}`;
  return body.includes(absolute) || body.includes(route);
}

function hasFooterHref(html, route) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hrefPattern = new RegExp(`<a\\b[^>]*\\bhref=(["'])${escapedRoute}\\1`, "i");
  return hrefPattern.test(html);
}

function evaluateContentPagePayload(slug, payload) {
  const page = payload?.page;
  const checks = {
    ok: payload?.ok === true,
    slug: page?.slug === slug,
    locale: page?.locale === "en",
    status: page?.status === "published",
    review_state: page?.review_state === "approved",
    is_public: page?.is_public === true,
    is_indexable: page?.is_indexable === true,
    publish_allowed: page?.publish_allowed === true,
    claim_gate_status: page?.claim_gate_status === "passed",
    seo_title: typeof page?.seo_title === "string" && page.seo_title.trim().length > 0,
    meta_description:
      (typeof page?.meta_description === "string" && page.meta_description.trim().length > 0) ||
      (typeof page?.seo_description === "string" && page.seo_description.trim().length > 0),
  };

  return Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([field]) => makeIssue(`api.${slug}.${field}`, `Unexpected or missing ${field}`));
}

async function checkApi(config, slug) {
  const url = buildApiUrl(config.apiBaseUrl, slug);
  const issues = [];
  let fetched;

  try {
    fetched = await fetchText(url, config, "application/json,*/*");
  } catch (error) {
    return [makeIssue(`api.${slug}.request`, error instanceof Error ? error.message : String(error))];
  }

  if (fetched.response.status !== 200) {
    issues.push(makeIssue(`api.${slug}.status`, `Expected 200, got ${fetched.response.status}`));
    return issues;
  }

  try {
    issues.push(...evaluateContentPagePayload(slug, JSON.parse(fetched.body)));
  } catch (error) {
    issues.push(makeIssue(`api.${slug}.json`, error instanceof Error ? error.message : String(error)));
  }

  return issues;
}

async function checkSitemap(config) {
  const url = `${config.siteBaseUrl}/sitemap.xml`;
  const issues = [];
  let fetched;

  try {
    fetched = await fetchText(url, config, "application/xml,text/xml,text/plain,*/*");
  } catch (error) {
    return [makeIssue("sitemap.request", error instanceof Error ? error.message : String(error))];
  }

  if (fetched.response.status !== 200) {
    return [makeIssue("sitemap.status", `Expected 200, got ${fetched.response.status}`)];
  }

  for (const slug of SCIENCE_CONTENTPAGE_SLUGS) {
    const route = `/en/${slug}`;
    if (!includesRoute(fetched.body, config.siteBaseUrl, route)) {
      issues.push(makeIssue(`sitemap.${slug}`, `Missing ${route}`));
    }
  }

  return issues;
}

async function checkLlms(config) {
  const url = `${config.siteBaseUrl}/llms.txt`;
  const issues = [];
  let fetched;

  try {
    fetched = await fetchText(url, config, "text/plain,text/markdown,*/*");
  } catch (error) {
    return [makeIssue("llms.request", error instanceof Error ? error.message : String(error))];
  }

  if (fetched.response.status !== 200) {
    return [makeIssue("llms.status", `Expected 200, got ${fetched.response.status}`)];
  }

  for (const slug of SCIENCE_CONTENTPAGE_SLUGS) {
    const route = `/en/${slug}`;
    if (!includesRoute(fetched.body, config.siteBaseUrl, route)) {
      issues.push(makeIssue(`llms.${slug}`, `Missing ${route}`));
    }
  }

  return issues;
}

async function checkFooter(config) {
  const url = `${config.siteBaseUrl}/en/science`;
  const issues = [];
  let fetched;

  try {
    fetched = await fetchText(url, config, "text/html,application/xhtml+xml,*/*");
  } catch (error) {
    return [makeIssue("footer.request", error instanceof Error ? error.message : String(error))];
  }

  if (fetched.response.status !== 200) {
    return [makeIssue("footer.status", `Expected 200, got ${fetched.response.status}`)];
  }

  for (const slug of SCIENCE_CONTENTPAGE_SLUGS) {
    const route = `/en/${slug}`;
    if (!hasFooterHref(fetched.body, route)) {
      issues.push(makeIssue(`footer.${slug}`, `Missing footer href ${route}`));
    }
  }

  return issues;
}

export async function runScienceContentPageLiveExposureCheck(config = buildConfig()) {
  const apiIssueGroups = await Promise.all(SCIENCE_CONTENTPAGE_SLUGS.map((slug) => checkApi(config, slug)));
  const issues = [
    ...apiIssueGroups.flat(),
    ...(await checkSitemap(config)),
    ...(await checkLlms(config)),
    ...(await checkFooter(config)),
  ];

  return {
    ok: issues.length === 0,
    checked_slugs: SCIENCE_CONTENTPAGE_SLUGS,
    site_base_url: config.siteBaseUrl,
    api_base_url: config.apiBaseUrl,
    checks: {
      api: SCIENCE_CONTENTPAGE_SLUGS.length,
      sitemap: 1,
      llms: 1,
      footer: 1,
    },
    issues,
  };
}

async function main() {
  let result;

  try {
    result = await runScienceContentPageLiveExposureCheck();
  } catch (error) {
    console.error(`[science-contentpage-live] config_error=${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }

  console.log(
    `[science-contentpage-live] site=${result.site_base_url} api=${result.api_base_url} slugs=${result.checked_slugs.length} ok=${result.ok}`
  );

  for (const issue of result.issues) {
    console.log(`[science-contentpage-live:bad] ${JSON.stringify(issue)}`);
  }

  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
