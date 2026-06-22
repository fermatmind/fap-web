#!/usr/bin/env node

import fs from "node:fs";
import { pathToFileURL } from "node:url";

const DEFAULT_SITE_BASE_URL = "https://fermatmind.com";
const DEFAULT_API_BASE_URL = "https://api.fermatmind.com";
const DEFAULT_ALLOWED_HOSTS = ["fermatmind.com", "api.fermatmind.com"];
const DEFAULT_TIMEOUT_MS = 30_000;

const PLAN_VERSION = "seo.six_assessment_hub_parity.v1";
const LIVE_REPORT_VERSION = "seo.six_assessment_hub_parity.live.v1";
const REQUIRED_CHECKS = [
  "page_status_200",
  "self_canonical",
  "not_noindex",
  "self_and_sibling_alternates",
  "live_sitemap_contains_route",
  "live_llms_contains_route",
  "live_llms_full_contains_route",
  "lookup_ok",
  "lookup_is_indexable",
  "sitemap_source_includes_slug",
  "sitemap_source_is_indexable",
];

export const SIX_ASSESSMENT_SCALES = [
  {
    scale_code: "MBTI",
    slug: "mbti-personality-test-16-personality-types",
    review_gate_status: "standard",
  },
  {
    scale_code: "BIG5",
    slug: "big-five-personality-test-ocean-model",
    review_gate_status: "standard",
  },
  {
    scale_code: "ENNEAGRAM",
    slug: "enneagram-personality-test-nine-types",
    review_gate_status: "standard",
  },
  {
    scale_code: "RIASEC",
    slug: "holland-career-interest-test-riasec",
    review_gate_status: "standard",
  },
  {
    scale_code: "IQ",
    slug: "iq-test-intelligence-quotient-assessment",
    review_gate_status: "manual_review_required",
  },
  {
    scale_code: "EQ",
    slug: "eq-test-emotional-intelligence-assessment",
    review_gate_status: "standard",
  },
];

export const SIX_ASSESSMENT_SURFACES = SIX_ASSESSMENT_SCALES.flatMap((scale) =>
  ["en", "zh"].map((locale) => ({
    id: `${scale.scale_code.toLowerCase()}_${locale}`,
    scale_code: scale.scale_code,
    slug: scale.slug,
    locale,
    route: `/${locale}/tests/${scale.slug}`,
    review_gate_status: scale.review_gate_status,
    required_checks: REQUIRED_CHECKS,
  }))
);

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

function normalizeUrlForCompare(value) {
  const url = new URL(value);
  url.hash = "";
  url.pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

function readAllowedHosts(env) {
  return String(env.SIX_ASSESSMENT_PARITY_ALLOWED_HOSTS || DEFAULT_ALLOWED_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function buildConfig(env = process.env) {
  const siteBaseUrl = normalizeBaseUrl(
    env.SIX_ASSESSMENT_PARITY_SITE_BASE_URL || env.NEXT_PUBLIC_SITE_URL,
    DEFAULT_SITE_BASE_URL
  );
  const apiBaseUrl = normalizeBaseUrl(
    env.SIX_ASSESSMENT_PARITY_API_BASE_URL || env.NEXT_PUBLIC_API_URL,
    DEFAULT_API_BASE_URL
  );
  const allowedHosts = readAllowedHosts(env);
  const timeoutMs = readPositiveInt(env.SIX_ASSESSMENT_PARITY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

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

function readAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s\"'>]+))`, "i");
  const match = tag.match(pattern);
  return match ? match[2] ?? match[3] ?? match[4] ?? "" : "";
}

function hasToken(value, token) {
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .some((part) => part === token);
}

function findMetaRobotsNoindex(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.some((tag) => {
    const name = readAttribute(tag, "name").toLowerCase();
    const content = readAttribute(tag, "content").toLowerCase();
    return name === "robots" && content.includes("noindex");
  });
}

function isNoindexHeader(headers) {
  const value = headers.get("x-robots-tag") || "";
  return value.toLowerCase().includes("noindex");
}

function findCanonicalHref(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = readAttribute(tag, "rel");
    if (hasToken(rel, "canonical")) {
      return readAttribute(tag, "href") || null;
    }
  }
  return null;
}

function findAlternateLinks(html, baseUrl) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  return tags
    .filter((tag) => hasToken(readAttribute(tag, "rel"), "alternate"))
    .map((tag) => {
      const href = readAttribute(tag, "href");
      if (!href) {
        return null;
      }

      try {
        return {
          hreflang: readAttribute(tag, "hreflang").toLowerCase(),
          href: new URL(href, baseUrl).toString(),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function includesRoute(body, siteBaseUrl, route) {
  const absolute = `${siteBaseUrl}${route}`;
  return body.includes(absolute) || body.includes(route);
}

function makeIssue(check, detail) {
  return { check, detail };
}

function buildLookupUrl(apiBaseUrl, slug, locale) {
  return `${apiBaseUrl}/api/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`;
}

function buildSitemapSourceUrl(apiBaseUrl, locale) {
  return `${apiBaseUrl}/api/v0.3/scales/sitemap-source?locale=${encodeURIComponent(locale)}`;
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
        "User-Agent": "FermatMind six-assessment hub parity verifier",
      },
    });
    const body = await response.text().catch(() => "");
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, config) {
  const fetched = await fetchText(url, config, "application/json,*/*");
  let json = null;

  try {
    json = JSON.parse(fetched.body);
  } catch {
    json = null;
  }

  return {
    response: fetched.response,
    body: fetched.body,
    json,
  };
}

export function buildPlan(config = buildConfig()) {
  return {
    version: PLAN_VERSION,
    description:
      "Read-only six-assessment parity plan for the public test detail hubs. This artifact defines the exact live checks without changing runtime behavior.",
    site_base_url: config.siteBaseUrl,
    api_base_url: config.apiBaseUrl,
    scale_count: SIX_ASSESSMENT_SCALES.length,
    surface_count: SIX_ASSESSMENT_SURFACES.length,
    required_checks: REQUIRED_CHECKS,
    surfaces: SIX_ASSESSMENT_SURFACES.map((surface) => ({
      ...surface,
      public_url: `${config.siteBaseUrl}${surface.route}`,
      lookup_url: buildLookupUrl(config.apiBaseUrl, surface.slug, surface.locale),
      sitemap_source_url: buildSitemapSourceUrl(config.apiBaseUrl, surface.locale),
    })),
    out_of_scope: [
      "frontend runtime changes",
      "CMS writes",
      "search submission",
      "sitemap, robots, llms, canonical, or hreflang runtime mutation",
      "payment, report, attempt, take, or result behavior changes",
    ],
    commands: {
      live_check: "pnpm seo:check-six-assessment-hub-parity",
      regenerate_plan:
        "node scripts/seo/check-six-assessment-hub-parity.mjs --plan --write docs/seo/generated/six-assessment-hub-parity.v1.json",
    },
  };
}

async function checkSurface(surface, shared, config) {
  const publicUrl = `${config.siteBaseUrl}${surface.route}`;
  const siblingLocale = surface.locale === "en" ? "zh" : "en";
  const siblingUrl = `${config.siteBaseUrl}/${siblingLocale}/tests/${surface.slug}`;
  const issues = [];

  let page;
  try {
    page = await fetchText(publicUrl, config, "text/html,application/xhtml+xml,*/*");
  } catch (error) {
    return {
      ...surface,
      public_url: publicUrl,
      parity_status: "request_failed",
      issues: [makeIssue("page.request", error instanceof Error ? error.message : String(error))],
    };
  }

  if (page.response.status !== 200) {
    issues.push(makeIssue("page.status", `Expected 200, got ${page.response.status}`));
  }

  if (isNoindexHeader(page.response.headers)) {
    issues.push(makeIssue("page.x_robots", page.response.headers.get("x-robots-tag") || "noindex header present"));
  }

  if (findMetaRobotsNoindex(page.body)) {
    issues.push(makeIssue("page.meta_robots", "meta robots contains noindex"));
  }

  const canonicalHref = findCanonicalHref(page.body);
  if (!canonicalHref) {
    issues.push(makeIssue("page.canonical", "Missing canonical link"));
  } else {
    const resolvedCanonical = new URL(canonicalHref, publicUrl).toString();
    if (normalizeUrlForCompare(resolvedCanonical) !== normalizeUrlForCompare(publicUrl)) {
      issues.push(makeIssue("page.canonical", `Expected ${publicUrl}, got ${resolvedCanonical}`));
    }
  }

  const alternateLinks = findAlternateLinks(page.body, publicUrl);
  const normalizedAlternateHrefs = new Set(alternateLinks.map((link) => normalizeUrlForCompare(link.href)));
  if (!normalizedAlternateHrefs.has(normalizeUrlForCompare(publicUrl))) {
    issues.push(makeIssue("page.alternates", `Missing self alternate ${publicUrl}`));
  }
  if (!normalizedAlternateHrefs.has(normalizeUrlForCompare(siblingUrl))) {
    issues.push(makeIssue("page.alternates", `Missing sibling alternate ${siblingUrl}`));
  }

  if (shared.sitemap.status !== 200) {
    issues.push(makeIssue("sitemap.status", `Expected 200, got ${shared.sitemap.status}`));
  } else if (!includesRoute(shared.sitemap.body, config.siteBaseUrl, surface.route)) {
    issues.push(makeIssue("sitemap.route", `Missing ${surface.route}`));
  }

  if (shared.llms.status !== 200) {
    issues.push(makeIssue("llms.status", `Expected 200, got ${shared.llms.status}`));
  } else if (!includesRoute(shared.llms.body, config.siteBaseUrl, surface.route)) {
    issues.push(makeIssue("llms.route", `Missing ${surface.route}`));
  }

  if (shared.llmsFull.status !== 200) {
    issues.push(makeIssue("llms_full.status", `Expected 200, got ${shared.llmsFull.status}`));
  } else if (!includesRoute(shared.llmsFull.body, config.siteBaseUrl, surface.route)) {
    issues.push(makeIssue("llms_full.route", `Missing ${surface.route}`));
  }

  const lookup = shared.lookupBySurface.get(surface.id);
  if (!lookup || lookup.response.status !== 200) {
    issues.push(makeIssue("lookup.status", `Expected 200, got ${lookup?.response.status ?? "request_failed"}`));
  } else {
    if (lookup.json?.ok !== true) {
      issues.push(makeIssue("lookup.ok", "lookup response ok !== true"));
    }
    if (lookup.json?.slug !== surface.slug) {
      issues.push(makeIssue("lookup.slug", `Expected ${surface.slug}, got ${String(lookup.json?.slug ?? "")}`));
    }
    if (lookup.json?.is_indexable !== true) {
      issues.push(makeIssue("lookup.is_indexable", `Expected true, got ${String(lookup.json?.is_indexable ?? "")}`));
    }
  }

  const sitemapSource = shared.sitemapSourceByLocale.get(surface.locale);
  if (!sitemapSource || sitemapSource.response.status !== 200) {
    issues.push(
      makeIssue("sitemap_source.status", `Expected 200, got ${sitemapSource?.response.status ?? "request_failed"}`)
    );
  } else {
    const matchingItem = Array.isArray(sitemapSource.json?.items)
      ? sitemapSource.json.items.find((item) => item?.slug === surface.slug)
      : null;
    if (!matchingItem) {
      issues.push(makeIssue("sitemap_source.slug", `Missing ${surface.slug}`));
    } else if (matchingItem.is_indexable !== true) {
      issues.push(
        makeIssue("sitemap_source.is_indexable", `Expected true, got ${String(matchingItem.is_indexable ?? "")}`)
      );
    }
  }

  return {
    ...surface,
    public_url: publicUrl,
    parity_status: issues.length === 0 ? "parity_ok" : "parity_mismatch",
    issues,
  };
}

export async function runSixAssessmentHubParityCheck(config = buildConfig()) {
  const plan = buildPlan(config);
  const [sitemap, llms, llmsFull] = await Promise.all([
    fetchText(`${config.siteBaseUrl}/sitemap.xml`, config, "application/xml,text/xml,text/plain,*/*").catch((error) => ({
      response: { status: 0, headers: new Headers() },
      body: error instanceof Error ? error.message : String(error),
    })),
    fetchText(`${config.siteBaseUrl}/llms.txt`, config, "text/plain,text/markdown,*/*").catch((error) => ({
      response: { status: 0, headers: new Headers() },
      body: error instanceof Error ? error.message : String(error),
    })),
    fetchText(`${config.siteBaseUrl}/llms-full.txt`, config, "text/plain,text/markdown,*/*").catch((error) => ({
      response: { status: 0, headers: new Headers() },
      body: error instanceof Error ? error.message : String(error),
    })),
  ]);

  const sitemapSourceByLocale = new Map();
  for (const locale of ["en", "zh"]) {
    try {
      sitemapSourceByLocale.set(locale, await fetchJson(buildSitemapSourceUrl(config.apiBaseUrl, locale), config));
    } catch (error) {
      sitemapSourceByLocale.set(locale, {
        response: { status: 0, headers: new Headers() },
        json: null,
        body: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const lookupBySurface = new Map();
  for (const surface of SIX_ASSESSMENT_SURFACES) {
    try {
      lookupBySurface.set(surface.id, await fetchJson(buildLookupUrl(config.apiBaseUrl, surface.slug, surface.locale), config));
    } catch (error) {
      lookupBySurface.set(surface.id, {
        response: { status: 0, headers: new Headers() },
        json: null,
        body: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const shared = {
    sitemap: { status: sitemap.response.status, body: sitemap.body },
    llms: { status: llms.response.status, body: llms.body },
    llmsFull: { status: llmsFull.response.status, body: llmsFull.body },
    sitemapSourceByLocale,
    lookupBySurface,
  };

  const surfaces = [];
  for (const surface of SIX_ASSESSMENT_SURFACES) {
    surfaces.push(await checkSurface(surface, shared, config));
  }

  return {
    version: LIVE_REPORT_VERSION,
    plan_version: plan.version,
    ok: surfaces.every((surface) => surface.issues.length === 0),
    site_base_url: config.siteBaseUrl,
    api_base_url: config.apiBaseUrl,
    required_checks: REQUIRED_CHECKS,
    shared_resources: {
      sitemap_status: shared.sitemap.status,
      llms_status: shared.llms.status,
      llms_full_status: shared.llmsFull.status,
      sitemap_source_status_by_locale: Object.fromEntries(
        Array.from(shared.sitemapSourceByLocale.entries()).map(([locale, value]) => [locale, value.response.status])
      ),
    },
    summary: {
      scale_count: SIX_ASSESSMENT_SCALES.length,
      surface_count: SIX_ASSESSMENT_SURFACES.length,
      failing_surfaces: surfaces.filter((surface) => surface.issues.length > 0).length,
    },
    surfaces,
  };
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const writeIndex = argv.indexOf("--write");
  return {
    planOnly: args.has("--plan"),
    json: args.has("--json"),
    writePath: writeIndex >= 0 ? argv[writeIndex + 1] : null,
  };
}

function emitResult(result, { json, writePath }) {
  const serialized = json === false ? JSON.stringify(result, null, 2) : JSON.stringify(result, null, 2);
  if (writePath) {
    fs.writeFileSync(writePath, `${serialized}\n`);
  } else {
    process.stdout.write(`${serialized}\n`);
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const config = buildConfig();

  if (options.planOnly) {
    emitResult(buildPlan(config), options);
    return;
  }

  const result = await runSixAssessmentHubParityCheck(config);
  emitResult(result, options);
  process.exit(result.ok ? 0 : 1);
}

const isDirectExecution = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectExecution) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
}
