#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const DEFAULT_API_ORIGIN = "https://staging-api.fermatmind.com";
const DEFAULT_WEB_ORIGIN = "https://staging.fermatmind.com";
const DEFAULT_ORG_ID = "0";
const DEFAULT_TIMEOUT_MS = 10000;
export const REQUIRED_RECOMMENDED_ARTICLE_COUNT = 6;
const LOCALES = [
  { app: "en", api: "en" },
  { app: "zh", api: "zh-CN" },
];
const RECOMMENDED_BLOCK_KEYS = new Set(["recommended_articles", "homepage_recommended_articles"]);
const REQUIRED_CONTENT_PAGE_SLUGS = ["about", "privacy", "terms"];
const RELATED_ARTICLE_GROUPS = [
  { key: "mbti", labels: ["mbti", "myers-briggs"] },
  { key: "big-five", labels: ["big-five", "big5", "ocean"] },
  { key: "enneagram", labels: ["enneagram", "nine-type"] },
];

const BASELINE_PLAN = {
  api: [
    "GET /api/v0.5/landing-surfaces/home for en and zh-CN",
    "GET /api/v0.5/articles?page=1&per_page=20 for en and zh-CN",
    "GET /api/v0.5/articles?page=1&per_page=100 for related-article coverage",
    "GET /api/v0.5/articles/{slug}/seo for sampled article SEO metadata",
    "GET /api/v0.5/internal/content-pages for en and zh-CN",
  ],
  web: [
    "GET /sitemap.xml",
    "GET /llms.txt",
    "GET /llms-full.txt",
  ],
  invariants: [
    "homepage recommended_articles block has exactly 6 published public articles per locale",
    "article lists expose at least 20 published public articles per locale",
    "MBTI, Big Five, and Enneagram related articles are present",
    "sampled articles have title, description, cover image, SEO, and social image metadata",
    "about, privacy, terms, and at least one help content page exist per locale",
    "sitemap and llms enumeration include CMS article slugs",
  ],
};

function parseArgs(argv) {
  const args = {
    apiOrigin: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_ORIGIN,
    webOrigin: process.env.STAGING_WEB_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_WEB_ORIGIN,
    timeoutMs: Number.parseInt(process.env.CMS_BASELINE_TIMEOUT_MS || "", 10) || DEFAULT_TIMEOUT_MS,
    orgId: process.env.CMS_BASELINE_ORG_ID || DEFAULT_ORG_ID,
    dryRun: true,
    json: false,
    printPlan: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--print-plan") {
      args.printPlan = true;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--api-url" && next) {
      args.apiOrigin = next;
      index += 1;
    } else if (arg.startsWith("--api-url=")) {
      args.apiOrigin = arg.slice("--api-url=".length);
    } else if (arg === "--web-url" && next) {
      args.webOrigin = next;
      index += 1;
    } else if (arg.startsWith("--web-url=")) {
      args.webOrigin = arg.slice("--web-url=".length);
    } else if (arg === "--timeout-ms" && next) {
      args.timeoutMs = Number.parseInt(next, 10);
      index += 1;
    } else if (arg.startsWith("--timeout-ms=")) {
      args.timeoutMs = Number.parseInt(arg.slice("--timeout-ms=".length), 10);
    } else if (arg === "--org-id" && next) {
      args.orgId = next;
      index += 1;
    } else if (arg.startsWith("--org-id=")) {
      args.orgId = arg.slice("--org-id=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  args.apiOrigin = normalizeOrigin(args.apiOrigin, "api URL");
  args.webOrigin = normalizeOrigin(args.webOrigin, "web URL");
  args.timeoutMs = Number.isFinite(args.timeoutMs) && args.timeoutMs > 0 ? args.timeoutMs : DEFAULT_TIMEOUT_MS;
  return args;
}

function normalizeOrigin(value, label) {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error(`Invalid ${label}: ${value || "<empty>"}`);
  }
  return normalized;
}

function printHelp() {
  console.log(`Usage: node scripts/validate-staging-cms-baseline.mjs [options]

Validates the staging CMS content baseline without mutating CMS or frontend files.

Options:
  --dry-run              Run read-only validation. This is the default.
  --api-url <url>        CMS API origin. Defaults to NEXT_PUBLIC_API_URL or ${DEFAULT_API_ORIGIN}.
  --web-url <url>        Staging web origin. Defaults to STAGING_WEB_URL, NEXT_PUBLIC_SITE_URL, or ${DEFAULT_WEB_ORIGIN}.
  --timeout-ms <ms>      Request timeout. Defaults to ${DEFAULT_TIMEOUT_MS}.
  --org-id <id>          CMS org id. Defaults to ${DEFAULT_ORG_ID}.
  --json                 Emit JSON result.
  --print-plan           Print the baseline validation plan and exit without network calls.
  --help                 Show this help.
`);
}

function apiUrl(args, path, params = {}) {
  const url = new URL(`/api${path.startsWith("/") ? path : `/${path}`}`, args.apiOrigin);
  for (const [key, value] of Object.entries({ ...params, org_id: args.orgId })) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

function webUrl(args, path) {
  return new URL(path.startsWith("/") ? path : `/${path}`, args.webOrigin);
}

async function fetchJson(url, args) {
  const response = await fetchWithTimeout(url, args);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON from ${url}, received ${contentType || "unknown content type"}`);
  }
  return response.json();
}

async function fetchText(url, args) {
  const response = await fetchWithTimeout(url, args);
  return response.text();
}

async function fetchWithTimeout(url, args) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), args.timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/json,text/plain,*/*" },
    });

    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function text(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function localeMatches(value, locale) {
  const normalized = text(value).toLowerCase();
  if (locale.app === "zh") {
    return normalized === "zh" || normalized === "zh-cn";
  }
  return normalized === "en";
}

function imageUrlFromArticle(article) {
  const variants = asRecord(article.cover_image_variants) || asRecord(asRecord(article.cover_image)?.variants);
  const variantUrls = variants
    ? Object.values(variants)
        .map((variant) => (typeof variant === "string" ? variant : text(asRecord(variant)?.url)))
        .filter(Boolean)
    : [];

  return text(article.cover_image_url) || text(asRecord(article.cover_image)?.url) || variantUrls[0] || "";
}

function normalizeArticleItem(value) {
  const wrapper = asRecord(value);
  return asRecord(wrapper?.article) || wrapper || null;
}

export function getRecommendedItems(surface) {
  const blocks = array(surface?.surface?.page_blocks);
  const block = blocks
    .filter((item) => item?.is_enabled !== false)
    .filter((item) => RECOMMENDED_BLOCK_KEYS.has(text(item?.block_key)))
    .sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0))[0];
  const payload = block?.payload_json;
  return array(payload?.items).length > 0 ? array(payload.items) : array(payload?.articles);
}

export function publishedPublicArticles(items, locale) {
  return items
    .map(normalizeArticleItem)
    .filter(Boolean)
    .filter((article) => localeMatches(article.locale, locale))
    .filter((article) => text(article.slug) && text(article.title))
    .filter((article) => text(article.status || "published") === "published")
    .filter((article) => article.is_public !== false);
}

export function validateRecommendedArticlesExactCount(items, locale) {
  const articles = publishedPublicArticles(items, locale);
  return {
    articles,
    count: articles.length,
    expected: REQUIRED_RECOMMENDED_ARTICLE_COUNT,
    ok: articles.length === REQUIRED_RECOMMENDED_ARTICLE_COUNT,
  };
}

function hasRelatedCoverage(article, group) {
  const haystack = [
    article.related_test_slug,
    article.category?.slug,
    article.category?.name,
    ...array(article.tags).flatMap((tag) => [tag?.slug, tag?.name]),
    article.slug,
    article.title,
  ]
    .map(text)
    .join(" ")
    .toLowerCase();

  return group.labels.some((label) => haystack.includes(label));
}

function seoImage(seo) {
  return text(seo?.meta?.og?.image) || text(seo?.meta?.twitter?.image);
}

function articleHref(locale, slug) {
  return `/${locale.app}/articles/${slug}`;
}

function pass(checks, name, details = "") {
  checks.push({ name, status: "passed", details });
}

function fail(checks, name, details) {
  checks.push({ name, status: "failed", details });
}

async function validateLocale(args, locale, checks) {
  const landingSurface = await fetchJson(
    apiUrl(args, "/v0.5/landing-surfaces/home", { locale: locale.api }),
    args
  );
  const recommendedResult = validateRecommendedArticlesExactCount(getRecommendedItems(landingSurface), locale);
  const recommended = recommendedResult.articles;
  if (recommendedResult.ok) {
    pass(checks, `homepage recommended articles ${locale.api}`, "exactly 6 published public articles configured");
  } else {
    const details =
      recommendedResult.expected === 6
        ? `expected 6 exactly, found ${recommendedResult.count}`
        : `expected ${recommendedResult.expected} exactly, found ${recommendedResult.count}`;
    fail(
      checks,
      `homepage recommended articles ${locale.api}`,
      details
    );
  }

  const articleList = await fetchJson(
    apiUrl(args, "/v0.5/articles", { locale: locale.api, page: 1, per_page: 20 }),
    args
  );
  const firstPageArticles = publishedPublicArticles(array(articleList.items), locale);
  if (firstPageArticles.length >= 20) {
    pass(checks, `article list first page ${locale.api}`, `${firstPageArticles.length} published public articles`);
  } else {
    fail(checks, `article list first page ${locale.api}`, `expected at least 20, found ${firstPageArticles.length}`);
  }

  const enumeration = await fetchJson(
    apiUrl(args, "/v0.5/articles", { locale: locale.api, page: 1, per_page: 100 }),
    args
  );
  const enumeratedArticles = publishedPublicArticles(array(enumeration.items), locale);
  for (const group of RELATED_ARTICLE_GROUPS) {
    if (enumeratedArticles.some((article) => hasRelatedCoverage(article, group))) {
      pass(checks, `${group.key} related articles ${locale.api}`);
    } else {
      fail(checks, `${group.key} related articles ${locale.api}`, "no matching related_test_slug, category, tag, slug, or title");
    }
  }

  const sampledArticles = firstPageArticles.slice(0, 6);
  for (const article of sampledArticles) {
    const slug = text(article.slug);
    if (!slug) continue;

    if (text(article.title) && text(article.excerpt) && imageUrlFromArticle(article)) {
      pass(checks, `article media metadata ${locale.api}/${slug}`);
    } else {
      fail(checks, `article media metadata ${locale.api}/${slug}`, "title, excerpt, and cover image are required");
    }

    const seo = await fetchJson(
      apiUrl(args, `/v0.5/articles/${encodeURIComponent(slug)}/seo`, { locale: locale.api }),
      args
    );
    if (text(seo?.meta?.title) && text(seo?.meta?.description) && text(seo?.meta?.canonical) && seoImage(seo)) {
      pass(checks, `article SEO metadata ${locale.api}/${slug}`);
    } else {
      fail(checks, `article SEO metadata ${locale.api}/${slug}`, "title, description, canonical, and social image are required");
    }
  }

  const contentPagesPayload = await fetchJson(
    apiUrl(args, "/v0.5/internal/content-pages", { locale: locale.api }),
    args
  );
  const contentPages = array(contentPagesPayload.items).filter((page) => page?.is_public !== false);
  const slugs = new Set(contentPages.map((page) => text(page.slug)));
  for (const slug of REQUIRED_CONTENT_PAGE_SLUGS) {
    if (slugs.has(slug)) {
      pass(checks, `content page ${locale.api}/${slug}`);
    } else {
      fail(checks, `content page ${locale.api}/${slug}`, "required public content page missing");
    }
  }

  const helpCount = contentPages.filter((page) => text(page.kind).toLowerCase() === "help" || text(page.slug).startsWith("help-")).length;
  if (helpCount > 0) {
    pass(checks, `help content pages ${locale.api}`, `${helpCount} help pages`);
  } else {
    fail(checks, `help content pages ${locale.api}`, "expected at least one public help content page");
  }

  return {
    locale,
    recommended,
    firstPageArticles,
  };
}

async function validateWebEnumeration(args, checks, localeSummaries) {
  const sitemap = await fetchText(webUrl(args, "/sitemap.xml"), args);
  const llms = await fetchText(webUrl(args, "/llms.txt"), args);
  const llmsFull = await fetchText(webUrl(args, "/llms-full.txt"), args);
  const articleHrefs = localeSummaries.flatMap((summary) =>
    summary.firstPageArticles.slice(0, 5).map((article) => articleHref(summary.locale, text(article.slug)))
  );

  for (const href of articleHrefs) {
    if (sitemap.includes(href)) {
      pass(checks, `sitemap article enumeration ${href}`);
    } else {
      fail(checks, `sitemap article enumeration ${href}`, "article href missing from /sitemap.xml");
    }

    if (llms.includes(href) || llmsFull.includes(href)) {
      pass(checks, `llms article enumeration ${href}`);
    } else {
      fail(checks, `llms article enumeration ${href}`, "article href missing from /llms.txt and /llms-full.txt");
    }
  }
}

async function runValidation(args) {
  const checks = [];
  const localeSummaries = [];

  for (const locale of LOCALES) {
    localeSummaries.push(await validateLocale(args, locale, checks));
  }

  await validateWebEnumeration(args, checks, localeSummaries);

  const failures = checks.filter((check) => check.status === "failed");
  return {
    dryRun: args.dryRun,
    apiOrigin: args.apiOrigin,
    webOrigin: args.webOrigin,
    checkedAt: new Date().toISOString(),
    checks,
    ok: failures.length === 0,
  };
}

function printResult(result, json) {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`[cms-baseline] dry-run=${result.dryRun}`);
  console.log(`[cms-baseline] api=${result.apiOrigin}`);
  console.log(`[cms-baseline] web=${result.webOrigin}`);

  for (const check of result.checks) {
    const mark = check.status === "passed" ? "PASS" : "FAIL";
    console.log(`[cms-baseline] ${mark} ${check.name}${check.details ? ` - ${check.details}` : ""}`);
  }

  console.log(result.ok ? "[cms-baseline] OK: staging baseline is complete." : "[cms-baseline] FAILED: staging baseline is incomplete.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.printPlan) {
    const payload = {
      dryRun: true,
      mutatesCms: false,
      mutatesFrontendContent: false,
      ...BASELINE_PLAN,
    };
    console.log(args.json ? JSON.stringify(payload, null, 2) : JSON.stringify(payload, null, 2));
    return;
  }

  const result = await runValidation(args);
  printResult(result, args.json);
  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[cms-baseline] ERROR: ${message}`);
    process.exit(1);
  });
}
