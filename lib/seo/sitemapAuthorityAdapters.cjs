/* eslint-disable @typescript-eslint/no-require-imports */
const { PRIVATE_FLOW_ROUTE_EXCLUDES } = require("./discoverabilityExposurePolicy.cjs");

const TOPIC_SLUGS = ["mbti", "big-five", "iq-eq"];
const HELP_PAGE_SLUGS = [
];
const STATIC_PUBLIC_PAGE_PATHS = [
  "/en/about",
  "/zh/about",
  "/en/business",
  "/zh/business",
  "/en/method-boundaries",
  "/zh/method-boundaries",
  "/en/privacy",
  "/zh/privacy",
  "/en/support",
  "/zh/support",
  "/en/terms",
  "/zh/terms",
  "/en/tests/category/career",
  "/zh/tests/category/career",
  "/en/tests/category/personality",
  "/zh/tests/category/personality",
];
const HIDDEN_PUBLIC_TEST_ENTRY_SLUGS = new Set([
  "clinical-depression-anxiety-assessment-professional-edition",
  "depression-screening-test-standard-edition",
]);
const P0_SITEMAP_ALLOWLIST_PATHS = new Set([
  "/",
  "/en",
  "/en/about",
  "/zh/about",
  "/en/articles",
  "/zh/articles",
  "/en/career",
  "/zh/career",
  "/en/method-boundaries",
  "/zh/method-boundaries",
  "/en/personality",
  "/zh/personality",
  "/en/privacy",
  "/zh/privacy",
  "/en/support",
  "/zh/support",
  "/en/terms",
  "/zh/terms",
  "/en/tests",
  "/zh/tests",
  "/en/tests/mbti-personality-test-16-personality-types",
  "/zh/tests/mbti-personality-test-16-personality-types",
  "/en/tests/big-five-personality-test-ocean-model",
  "/zh/tests/big-five-personality-test-ocean-model",
  "/en/tests/enneagram-personality-test-nine-types",
  "/zh/tests/enneagram-personality-test-nine-types",
  "/en/tests/holland-career-interest-test-riasec",
  "/zh/tests/holland-career-interest-test-riasec",
  "/en/tests/iq-test-intelligence-quotient-assessment",
  "/zh/tests/iq-test-intelligence-quotient-assessment",
  "/en/tests/eq-test-emotional-intelligence-assessment",
  "/zh/tests/eq-test-emotional-intelligence-assessment",
]);
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
  "/en/relationships/*",
  "/zh/relationships/*",
  "/en/take/*",
  "/zh/take/*",
];
const CMS_LOCALES = [
  { localePrefix: "en", apiLocale: "en" },
  { localePrefix: "zh", apiLocale: "zh-CN" },
];
const CANONICAL_SITE_URL = "https://fermatmind.com";
const OWNED_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);
const STAGING_SITE_HOSTS = new Set(["staging.fermatmind.com"]);
const SITEMAP_FINAL_PATH_DENY_PATTERNS = [
  /^\/zh$/i,
  /^\/tests(?:\/|$)/i,
  /^\/(?:en|zh)\/results\/lookup$/i,
  /^\/(?:en|zh)\/blog$/i,
  /^\/(?:en|zh)\/help$/i,
  /^\/(?:en|zh)\/refund$/i,
  /^\/(?:en|zh)\/help\/(?:about|contact|faq|for-business-and-research|team|used-and-mentioned)$/i,
  /^\/zh\/policies$/i,
  /^\/en\/(?:brand|careers|charter|foundation|policies)$/i,
  /^\/datasets\/occupations(?:\/method)?$/i,
  /^\/(?:en|zh)\/datasets\/occupations(?:\/method)?$/i,
  /^\/career\/jobs\/[^/]+$/i,
  /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i,
  /^\/ops(?:\/|$)/i,
  /^\/(?:en|zh)\/ops(?:\/|$)/i,
];
const SITEMAP_ROUTE_EXCLUDES = [
  "/zh",
  "/tests",
  "/tests/*",
  "/en/blog",
  "/zh/blog",
  "/en/help",
  "/zh/help",
  "/en/help/about",
  "/en/help/contact",
  "/en/help/faq",
  "/en/help/for-business-and-research",
  "/en/help/team",
  "/en/help/used-and-mentioned",
  "/zh/help/about",
  "/zh/help/contact",
  "/zh/help/faq",
  "/zh/help/for-business-and-research",
  "/en/refund",
  "/zh/refund",
  "/zh/help/team",
  "/zh/help/used-and-mentioned",
  "/en/brand",
  "/en/careers",
  "/en/charter",
  "/en/foundation",
  "/en/policies",
  "/zh/policies",
  "/en/results/lookup",
  "/zh/results/lookup",
  "/api/*",
  ...PRIVATE_FLOW_ROUTE_EXCLUDES,
  "/datasets/occupations",
  "/datasets/occupations/method",
  "/en/datasets/occupations",
  "/zh/datasets/occupations",
  "/en/datasets/occupations/method",
  "/zh/datasets/occupations/method",
  "/en/career/jobs/*",
  "/zh/career/jobs/*",
  "/ops/*",
  "/en/ops/*",
  "/zh/ops/*",
];

function normalizeSlug(value) {
  return String(value || "").trim();
}

function normalizePath(path) {
  const value = String(path || "").trim() || "/";
  if (value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function isP0SitemapAllowlistedPath(path) {
  return P0_SITEMAP_ALLOWLIST_PATHS.has(normalizePath(path));
}

function resolveSitemapSiteUrl(value) {
  const normalized = normalizeSlug(value) || CANONICAL_SITE_URL;

  try {
    const url = new URL(normalized);
    return OWNED_CANONICAL_HOSTS.has(url.hostname.toLowerCase()) || STAGING_SITE_HOSTS.has(url.hostname.toLowerCase())
      ? CANONICAL_SITE_URL
      : normalized.replace(/\/$/, "");
  } catch {
    return CANONICAL_SITE_URL;
  }
}

function buildLandingPaths() {
  return [
    "/",
    "/en",
    "/en/articles",
    "/zh/articles",
    "/en/methods",
    "/zh/methods",
    "/en/data",
    "/zh/data",
    "/en/personality",
    "/zh/personality",
    "/en/topics",
    "/zh/topics",
    "/en/help",
    "/zh/help",
    "/en/tests",
    "/zh/tests",
    "/en/career",
    "/zh/career",
    "/en/career/guides",
    "/zh/career/guides",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
  ];
}

function buildCareerPaths() {
  return [];
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

function buildStaticGeneratedPaths() {
  return [
    ...new Set([
      ...buildLandingPaths(),
      ...buildCareerPaths(),
      ...buildTopicPaths(),
      ...buildHelpPaths(),
      ...STATIC_PUBLIC_PAGE_PATHS,
    ]),
  ];
}

module.exports = {
  CMS_LOCALES,
  HIDDEN_PUBLIC_TEST_ENTRY_SLUGS,
  P0_SITEMAP_ALLOWLIST_PATHS,
  NON_PAGE_ROUTE_EXCLUDES,
  SITEMAP_FINAL_PATH_DENY_PATTERNS,
  SITEMAP_ROUTE_EXCLUDES,
  buildCareerPaths,
  buildHelpPaths,
  buildLandingPaths,
  buildStaticGeneratedPaths,
  buildTopicPaths,
  normalizePath,
  normalizeSlug,
  isP0SitemapAllowlistedPath,
  resolveSitemapSiteUrl,
};
