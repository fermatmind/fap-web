/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const tests = require("./.velite/tests.json");
const careerJobs = require("./.velite/careerJobs.json");
const careerIndustries = require("./.velite/careerIndustries.json");
const careerGuides = require("./.velite/careerGuides.json");
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
    "/en/career/guides",
    "/zh/career/guides",
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

  for (const item of careerGuides) {
    const slug = normalizeSlug(item?.slug);
    if (!slug) continue;
    paths.add(`/en/career/guides/${slug}`);
    paths.add(`/zh/career/guides/${slug}`);
  }

  for (const item of careerRecommendationProfiles) {
    const profileType = normalizeSlug(item?.profile_type).toLowerCase();
    const key = normalizeSlug(item?.key);
    if (!profileType || !key) continue;

    if (profileType === "mbti") {
      const normalizedType = key.toUpperCase();
      paths.add(`/en/career/recommendations/mbti/${normalizedType}`);
      paths.add(`/zh/career/recommendations/mbti/${normalizedType}`);
      continue;
    }

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
  additionalPaths: async () =>
    generatedPaths
      .map((path) => normalizePath(path))
      .filter((path) => shouldIncludeInSitemap(path))
      .map((loc) => ({
        loc,
        changefreq: "weekly",
        priority: loc === "/" ? 1.0 : 0.7,
      })),
};
