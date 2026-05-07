/* eslint-disable @typescript-eslint/no-require-imports */
const { PRIVATE_FLOW_ROUTE_EXCLUDES } = require("./discoverabilityExposurePolicy.cjs");

const TOPIC_SLUGS = ["mbti", "big-five", "iq-eq"];
const CAREER_DATASET_FAMILY_SLUGS = [
  "architecture-and-engineering",
  "arts-and-design",
  "building-and-grounds-cleaning",
  "business-and-financial",
  "community-and-social-service",
  "computer-and-information-technology",
  "construction-and-extraction",
  "education-training-and-library",
  "entertainment-and-sports",
  "farming-fishing-and-forestry",
  "food-preparation-and-serving",
  "healthcare",
  "installation-maintenance-and-repair",
  "legal",
  "life-physical-and-social-science",
  "management",
  "math",
  "media-and-communication",
  "military",
  "office-and-administrative-support",
  "personal-care-and-service",
  "production",
  "protective-service",
  "sales",
  "transportation-and-material-moving",
];
const HELP_PAGE_SLUGS = [
  "faq",
  "about",
  "team",
  "used-and-mentioned",
  "for-business-and-research",
  "contact",
];
const STATIC_PUBLIC_PAGE_PATHS = [
  "/en/about",
  "/zh/about",
  "/zh/brand",
  "/en/business",
  "/zh/business",
  "/zh/careers",
  "/zh/charter",
  "/zh/foundation",
  "/zh/policies",
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
  "/en/fun/sbti",
  "/zh/fun/sbti",
  "/en/fun/sbti/*",
  "/zh/fun/sbti/*",
];
const CMS_LOCALES = [
  { localePrefix: "en", apiLocale: "en" },
  { localePrefix: "zh", apiLocale: "zh-CN" },
];
const CANONICAL_SITE_URL = "https://fermatmind.com";
const OWNED_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);
const SITEMAP_FINAL_PATH_DENY_PATTERNS = [
  /^\/zh$/i,
  /^\/tests(?:\/|$)/i,
  /^\/(?:en|zh)\/results\/lookup$/i,
  /^\/(?:en|zh)\/blog$/i,
  /^\/(?:en|zh)\/help$/i,
  /^\/(?:en|zh)\/refund$/i,
  /^\/zh\/help\/(?:about|team|used-and-mentioned)$/i,
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
  "/en/refund",
  "/zh/refund",
  "/zh/help/about",
  "/zh/help/team",
  "/zh/help/used-and-mentioned",
  "/en/brand",
  "/en/careers",
  "/en/charter",
  "/en/foundation",
  "/en/policies",
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

function resolveSitemapSiteUrl(value) {
  const normalized = normalizeSlug(value) || CANONICAL_SITE_URL;

  try {
    const url = new URL(normalized);
    return OWNED_CANONICAL_HOSTS.has(url.hostname.toLowerCase())
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
    "/en/career/industries",
    "/zh/career/industries",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
  ];
}

function buildCareerPaths() {
  const paths = new Set();

  for (const item of CAREER_DATASET_FAMILY_SLUGS) {
    const slug = normalizeSlug(item);
    if (!slug) continue;
    paths.add(`/en/career/industries/${slug}`);
    paths.add(`/zh/career/industries/${slug}`);
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
  resolveSitemapSiteUrl,
};
