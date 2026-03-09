/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const tests = require("./.velite/tests.json");
const blog = require("./.velite/blog.json");
const careerIndustries = require("./.velite/careerIndustries.json");
const careerGuides = require("./.velite/careerGuides.json");
const careerRecommendationProfiles = require("./.velite/careerRecommendationProfiles.json");
const { shouldIncludeInSitemap } = require("./lib/seo/indexingPolicy.cjs");

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

function normalizeBlogLocale(value) {
  const raw = String(value || "").toLowerCase();
  return raw === "en" ? "en" : "zh";
}

function hasIndexableFlagFalse(item) {
  return item && item.is_indexable === false;
}

function isEnglishArticleIndexable(item) {
  return normalizeBlogLocale(item?.locale) === "en" && item?.translation_ready === true;
}

const indexableEnglishArticleSlugs = new Set(
  blog
    .filter((item) => isEnglishArticleIndexable(item))
    .map((item) => normalizeSlug(item.slug))
    .filter(Boolean)
);

const hasIndexableEnglishArticles = indexableEnglishArticleSlugs.size > 0;

function shouldIncludeArticlePath(pathname) {
  const normalized = normalizePath(pathname);
  if (normalized === "/en/articles") {
    return hasIndexableEnglishArticles;
  }

  const articleMatch = normalized.match(/^\/en\/articles\/([^/]+)$/i);
  if (!articleMatch) return true;

  const slug = normalizeSlug(articleMatch[1]);
  return indexableEnglishArticleSlugs.has(slug);
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

function buildArticlePaths() {
  const paths = new Set();
  for (const item of blog) {
    const slug = normalizeSlug(item?.slug);
    if (!slug) continue;

    const locale = normalizeBlogLocale(item?.locale);
    if (locale === "en") {
      if (item?.translation_ready === true) {
        paths.add(`/en/articles/${slug}`);
      }
      continue;
    }

    paths.add(`/zh/articles/${slug}`);
  }
  return [...paths];
}

function buildLandingPaths() {
  const base = [
    "/",
    "/en",
    "/zh",
    "/en/tests",
    "/zh/tests",
    "/zh/articles",
    "/en/career",
    "/zh/career",
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
    "/en/career/tests/riasec/result",
    "/zh/career/tests/riasec/result",
  ];
  if (hasIndexableEnglishArticles) {
    base.push("/en/articles");
  }
  return base;
}

function buildCareerPaths() {
  const paths = new Set();

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

function buildPersonalityPaths() {
  const mbtiTypes = new Set();

  for (const item of careerRecommendationProfiles) {
    if (String(item?.profile_type) !== "mbti") continue;
    const key = normalizeSlug(item?.key).toLowerCase();
    if (!key) continue;
    mbtiTypes.add(key);
  }

  const paths = ["/en/personality", "/zh/personality"];

  for (const type of mbtiTypes) {
    paths.push(`/en/personality/${type}`);
    paths.push(`/zh/personality/${type}`);
  }

  return paths;
}

const generatedPaths = [
  ...new Set([
    ...buildLandingPaths(),
    ...buildTestPaths(),
    ...buildArticlePaths(),
    ...buildCareerPaths(),
    ...buildPersonalityPaths(),
  ]),
];

module.exports = {
  siteUrl,
  generateRobotsTxt: false,
  sitemapSize: 5000,
  exclude: [
    "/server-sitemap.xml",
    "/en/career/jobs",
    "/zh/career/jobs",
    "/en/career/jobs/*",
    "/zh/career/jobs/*",
    "/en/topics",
    "/zh/topics",
    "/en/topics/*",
    "/zh/topics/*",
  ],
  transform: async (_config, path) => {
    const normalized = normalizePath(path);
    if (!shouldIncludeInSitemap(normalized)) return null;
    if (!shouldIncludeArticlePath(normalized)) return null;

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
      .filter((path) => shouldIncludeArticlePath(path))
      .map((loc) => ({
        loc,
        changefreq: "weekly",
        priority: loc === "/" ? 1.0 : 0.7,
      })),
};
