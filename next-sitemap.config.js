/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const tests = require("./.velite/tests.json");
const blog = require("./.velite/blog.json");
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
  const base = ["/", "/en", "/zh", "/en/tests", "/zh/tests", "/zh/articles"];
  if (hasIndexableEnglishArticles) {
    base.push("/en/articles");
  }
  return base;
}

const generatedPaths = [...new Set([...buildLandingPaths(), ...buildTestPaths(), ...buildArticlePaths()])];

module.exports = {
  siteUrl,
  generateRobotsTxt: false,
  sitemapSize: 5000,
  exclude: ["/server-sitemap.xml"],
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
