/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const tests = require("./.velite/tests.json");
const careerJobs = require("./.velite/careerJobs.json");
const careerIndustries = require("./.velite/careerIndustries.json");
const careerRecommendationProfiles = require("./.velite/careerRecommendationProfiles.json");
const { shouldIncludeInSitemap } = require("./lib/seo/indexingPolicy.cjs");
const TOPIC_SLUGS = ["mbti", "big-five", "iq-eq"];
const HELP_PAGE_SLUGS = [
  "faq",
  "about",
  "team",
  "used-and-mentioned",
  "for-business-and-research",
  "contact",
];
const NON_PAGE_ROUTE_EXCLUDES = [
  "/robots.txt",
  "/en/types",
  "/zh/types",
  "/en/types/*",
  "/zh/types/*",
  "/en/share/*",
  "/zh/share/*",
  "/en/compare/*",
  "/zh/compare/*",
  "/en/result/*",
  "/zh/result/*",
  "/en/history/*",
  "/zh/history/*",
  "/en/take/*",
  "/zh/take/*",
];

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://api.fermatmind.com").replace(/\/$/, "");

function normalizeSlug(value) {
  return String(value || "").trim();
}

function normalizePath(path) {
  const value = String(path || "").trim() || "/";
  if (value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function hasIndexableFlagFalse(item) {
  return item && item.is_indexable === false;
}

function buildTestPaths() {
  const uniqueSlugs = new Set();
  for (const item of tests) {
    const slug = normalizeSlug(item?.slug);
    if (!slug || hasIndexableFlagFalse(item)) continue;
    uniqueSlugs.add(slug);
  }

  const paths = [];
  for (const slug of uniqueSlugs) {
    paths.push(`/en/tests/${slug}`);
    paths.push(`/zh/tests/${slug}`);
  }
  return paths;
}

function buildLandingPaths() {
  return [
    "/",
    "/en",
    "/zh",
    "/en/topics",
    "/zh/topics",
    "/en/help",
    "/zh/help",
    "/en/tests",
    "/zh/tests",
    "/en/career",
    "/zh/career",
    "/en/career/jobs",
    "/zh/career/jobs",
    "/en/career/industries",
    "/zh/career/industries",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
    "/en/career/tests/riasec",
    "/zh/career/tests/riasec",
  ];
}

function buildCareerPaths() {
  const paths = new Set();

  for (const item of careerJobs) {
    const slug = normalizeSlug(item?.slug);
    if (!slug) continue;
    paths.add(`/en/career/jobs/${slug}`);
    paths.add(`/zh/career/jobs/${slug}`);
  }

  for (const item of careerIndustries) {
    const slug = normalizeSlug(item?.slug);
    if (!slug) continue;
    paths.add(`/en/career/industries/${slug}`);
    paths.add(`/zh/career/industries/${slug}`);
  }

  for (const item of careerRecommendationProfiles) {
    const profileType = normalizeSlug(item?.profile_type).toLowerCase();
    const key = normalizeSlug(item?.key);
    if (!profileType || !key) continue;

    if (profileType === "big5") {
      const trait = key.toLowerCase();
      paths.add(`/en/career/recommendations/big5/${trait}`);
      paths.add(`/zh/career/recommendations/big5/${trait}`);
    }
  }

  return [...paths];
}

function buildTopicPaths() {
  const paths = new Set();

  for (const slug of TOPIC_SLUGS) {
    paths.add(`/en/topics/${slug}`);
    paths.add(`/zh/topics/${slug}`);
  }

  return [...paths];
}

function buildHelpPaths() {
  return HELP_PAGE_SLUGS.flatMap((slug) => [`/en/help/${slug}`, `/zh/help/${slug}`]);
}

const generatedPaths = [
  ...new Set([
    ...buildLandingPaths(),
    ...buildTestPaths(),
    ...buildCareerPaths(),
    ...buildTopicPaths(),
    ...buildHelpPaths(),
  ]),
];

function buildApiUrl(path) {
  const normalized = String(path || "").startsWith("/") ? String(path) : `/${String(path || "")}`;
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/api/")) {
    return `${apiOrigin}${normalized}`;
  }

  return `${apiOrigin}/api${normalized}`;
}

async function fetchJsonWithTimeout(url, timeoutMs = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function buildCareerRecommendationPaths() {
  try {
    const [enPayload, zhPayload] = await Promise.all([
      fetchJsonWithTimeout(buildApiUrl("/v0.5/career-recommendations/mbti?locale=en&org_id=0")),
      fetchJsonWithTimeout(buildApiUrl("/v0.5/career-recommendations/mbti?locale=zh-CN&org_id=0")),
    ]);
    const paths = new Set();

    for (const [localePrefix, payload] of [
      ["en", enPayload],
      ["zh", zhPayload],
    ]) {
      const items = Array.isArray(payload?.items) ? payload.items : [];

      for (const item of items) {
        const slug = normalizeSlug(item?.public_route_slug).toLowerCase();
        if (!slug) continue;
        paths.add(`/${localePrefix}/career/recommendations/mbti/${slug}`);
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

module.exports = {
  siteUrl,
  generateRobotsTxt: false,
  sitemapSize: 5000,
  exclude: ["/server-sitemap.xml", ...NON_PAGE_ROUTE_EXCLUDES],
  transform: async (_config, path) => {
    const normalized = normalizePath(path);
    if (!shouldIncludeInSitemap(normalized)) return null;

    return {
      loc: normalized,
      changefreq: "weekly",
      priority: normalized === "/" ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async () => {
    const careerRecommendationPaths = await buildCareerRecommendationPaths();

    return [...new Set([...generatedPaths, ...careerRecommendationPaths])]
      .map((path) => normalizePath(path))
      .filter((path) => shouldIncludeInSitemap(path))
      .map((loc) => ({
        loc,
        changefreq: "weekly",
        priority: loc === "/" ? 1.0 : 0.7,
      }));
  },
};
