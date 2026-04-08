/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const tests = require("./.velite/tests.json");
const blog = require("./.velite/blog.json");
const careerGuidesContent = require("./.velite/careerGuides.json");
const careerJobs = require("./.velite/careerJobs.json");
const careerIndustries = require("./.velite/careerIndustries.json");
const careerRecommendationProfiles = require("./.velite/careerRecommendationProfiles.json");
const { shouldIncludeInSitemap } = require("./lib/seo/indexingPolicy.cjs");
const {
  isValidCmsApiRoute,
  buildInvalidCmsSitemapExcludes,
  shouldIncludeCmsSitemapPath,
} = require("./lib/seo/cmsRoutePolicy.cjs");
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
  "/en/relationships/*",
  "/zh/relationships/*",
  "/en/take/*",
  "/zh/take/*",
];
const CMS_LOCALES = [
  { localePrefix: "en", apiLocale: "en" },
  { localePrefix: "zh", apiLocale: "zh-CN" },
];
const MBTI_BASE_SLUG_RE = /^[ie][ns][ft][jp]$/i;
const MBTI_RUNTIME_SLUG_RE = /^[ie][ns][ft][jp]-[at]$/i;

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

function isPublicIndexable(item) {
  return item && item.is_public !== false && item.is_indexable !== false;
}

function buildDefaultPublicPersonalitySlug(value) {
  const normalized = normalizeSlug(value).toLowerCase();
  if (!normalized) return "";
  if (MBTI_RUNTIME_SLUG_RE.test(normalized)) return normalized;
  return MBTI_BASE_SLUG_RE.test(normalized) ? `${normalized}-a` : normalized;
}

function extractPathFromCanonicalUrl(value) {
  const normalized = normalizeSlug(value);
  if (!normalized) return "";

  try {
    const url = /^https?:\/\//i.test(normalized) ? new URL(normalized) : new URL(normalized, siteUrl);
    return normalizePath(url.pathname);
  } catch {
    return "";
  }
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

function buildLocalArticlePaths() {
  const paths = new Set();

  for (const item of blog) {
    const slug = normalizeSlug(item?.slug);
    const locale = normalizeSlug(item?.locale).toLowerCase();
    const translationReady = item?.translation_ready !== false;
    if (!slug) continue;
    if (locale !== "en") {
      paths.add(`/zh/articles/${slug}`);
      continue;
    }
    if (translationReady) {
      paths.add(`/en/articles/${slug}`);
    }
  }

  return [...paths];
}

function buildLocalCareerGuidePaths() {
  const paths = new Set();

  for (const item of careerGuidesContent) {
    const slug = normalizeSlug(item?.slug);
    const locale = normalizeSlug(item?.locale).toLowerCase();
    if (!slug) continue;
    if (locale === "zh" || locale === "zh-cn") {
      paths.add(`/zh/career/guides/${slug}`);
      continue;
    }
    if (locale === "en") {
      paths.add(`/en/career/guides/${slug}`);
    }
  }

  return [...paths];
}

function buildLandingPaths() {
  return [
    "/",
    "/en",
    "/zh",
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
    ...buildLocalArticlePaths(),
    ...buildLocalCareerGuidePaths(),
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

async function fetchPaginatedItems(path, queryParams = {}, timeoutMs = 1500) {
  const items = [];
  let page = 1;
  let lastPage = 1;

  do {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({
      ...queryParams,
      page,
      per_page: 100,
    })) {
      if (value === undefined || value === null || value === "") continue;
      params.set(key, String(value));
    }

    const payload = await fetchJsonWithTimeout(`${buildApiUrl(path)}?${params.toString()}`, timeoutMs);
    const pageItems = Array.isArray(payload?.items) ? payload.items : [];
    items.push(...pageItems);

    const reportedLastPage = Number(payload?.pagination?.last_page);
    lastPage = Number.isFinite(reportedLastPage) && reportedLastPage > 0 ? reportedLastPage : page;
    page += 1;
  } while (page <= lastPage);

  return items;
}

async function buildCmsDetailPaths(path, queryBuilder, toPath, timeoutMs = 1500) {
  try {
    const paths = new Set();

    for (const { localePrefix, apiLocale } of CMS_LOCALES) {
      const items = await fetchPaginatedItems(path, queryBuilder(apiLocale), timeoutMs);

      for (const item of items) {
        if (!isPublicIndexable(item)) continue;

        const loc = normalizePath(toPath(item, localePrefix, apiLocale));
        if (loc && loc !== "/") {
          paths.add(loc);
        }
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

async function buildArticlePaths() {
  return buildCmsDetailPaths(
    "/v0.5/articles",
    (apiLocale) => ({ locale: apiLocale, org_id: 0 }),
    (item, localePrefix) => {
      const slug = normalizeSlug(item?.slug);
      return slug ? `/${localePrefix}/articles/${slug}` : "";
    }
  );
}

async function buildCareerGuideDetailPaths() {
  return buildCmsDetailPaths(
    "/v0.5/career-guides",
    (apiLocale) => ({ locale: apiLocale, org_id: 0 }),
    (item, localePrefix) => {
      const slug = normalizeSlug(item?.slug);
      return slug ? `/${localePrefix}/career/guides/${slug}` : "";
    }
  );
}

async function buildMethodDetailPaths() {
  return buildCmsDetailPaths(
    "/v0.5/methods",
    (apiLocale) => ({ locale: apiLocale, org_id: 0 }),
    (item, localePrefix) => {
      const slug = normalizeSlug(item?.slug);
      return slug ? `/${localePrefix}/methods/${slug}` : "";
    }
  );
}

async function buildDataDetailPaths() {
  return buildCmsDetailPaths(
    "/v0.5/data",
    (apiLocale) => ({ locale: apiLocale, org_id: 0 }),
    (item, localePrefix) => {
      const slug = normalizeSlug(item?.slug);
      return slug ? `/${localePrefix}/data/${slug}` : "";
    }
  );
}

async function buildCareerJobDetailPathsFromApi() {
  return buildCmsDetailPaths(
    "/v0.5/career-jobs",
    (apiLocale) => ({ locale: apiLocale, org_id: 0 }),
    (item, localePrefix) => {
      const slug = normalizeSlug(item?.slug);
      return slug ? `/${localePrefix}/career/jobs/${slug}` : "";
    }
  );
}

async function buildTopicDetailPathsFromApi() {
  return buildCmsDetailPaths(
    "/v0.5/topics",
    (apiLocale) => ({ locale: apiLocale, org_id: 0 }),
    (item, localePrefix) => {
      const slug = normalizeSlug(item?.slug);
      return slug ? `/${localePrefix}/topics/${slug}` : "";
    }
  );
}

async function buildPersonalityDetailPaths() {
  return buildCmsDetailPaths(
    "/v0.5/personality",
    (apiLocale) => ({ locale: apiLocale, org_id: 0, scale_code: "MBTI" }),
    (item, localePrefix) => {
      const canonicalPath = extractPathFromCanonicalUrl(item?.seo_meta?.canonical_url);
      if (canonicalPath) {
        return canonicalPath;
      }

      const slug = buildDefaultPublicPersonalitySlug(item?.slug || item?.type_code);
      return slug ? `/${localePrefix}/personality/${slug}` : "";
    }
  );
}

async function buildValidatedCmsPaths(apiRoute, builder) {
  if (!isValidCmsApiRoute(apiRoute)) {
    return [];
  }

  try {
    return await builder();
  } catch {
    return [];
  }
}

module.exports = {
  siteUrl,
  generateRobotsTxt: false,
  sitemapSize: 5000,
  exclude: [
    "/server-sitemap.xml",
    ...NON_PAGE_ROUTE_EXCLUDES,
    ...buildInvalidCmsSitemapExcludes(),
  ],
  transform: async (_config, path) => {
    const normalized = normalizePath(path);
    if (!shouldIncludeCmsSitemapPath(normalized)) return null;
    if (!shouldIncludeInSitemap(normalized)) return null;

    return {
      loc: normalized,
      changefreq: "weekly",
      priority: normalized === "/" ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async () => {
    const [
      articlePaths,
      careerGuidePaths,
      methodPaths,
      dataPaths,
      careerJobApiPaths,
      personalityPaths,
      topicApiPaths,
    ] = await Promise.all([
      buildValidatedCmsPaths("/v0.5/articles", buildArticlePaths),
      buildValidatedCmsPaths("/v0.5/career-guides", buildCareerGuideDetailPaths),
      buildValidatedCmsPaths("/v0.5/methods", buildMethodDetailPaths),
      buildValidatedCmsPaths("/v0.5/data", buildDataDetailPaths),
      buildValidatedCmsPaths("/v0.5/career-jobs", buildCareerJobDetailPathsFromApi),
      buildValidatedCmsPaths("/v0.5/personality", buildPersonalityDetailPaths),
      buildValidatedCmsPaths("/v0.5/topics", buildTopicDetailPathsFromApi),
    ]);

    return [...new Set([
      ...generatedPaths,
      ...articlePaths,
      ...careerGuidePaths,
      ...methodPaths,
      ...dataPaths,
      ...careerJobApiPaths,
      ...personalityPaths,
      ...topicApiPaths,
    ])]
      .map((path) => normalizePath(path))
      .filter((path) => shouldIncludeCmsSitemapPath(path))
      .filter((path) => shouldIncludeInSitemap(path))
      .map((loc) => ({
        loc,
        changefreq: "weekly",
        priority: loc === "/" ? 1.0 : 0.7,
      }));
  },
};
