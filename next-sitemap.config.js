/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const { shouldIncludeInSitemap } = require("./lib/seo/indexingPolicy.cjs");
const {
  isValidCmsApiRoute,
  buildInvalidCmsSitemapExcludes,
  shouldIncludeCmsSitemapPath,
} = require("./lib/seo/cmsRoutePolicy.cjs");
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
const MBTI_BASE_SLUG_RE = /^[ie][ns][ft][jp]$/i;
const MBTI_RUNTIME_SLUG_RE = /^[ie][ns][ft][jp]-[at]$/i;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://api.fermatmind.com").replace(/\/$/, "");
const cmsSitemapTimeoutMs = Number.parseInt(process.env.CMS_SITEMAP_TIMEOUT_MS || "10000", 10) || 10000;

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

function isExplicitCareerIndexableState(value) {
  const normalized = normalizeSlug(value).toLowerCase();
  if (!normalized) return null;
  if (normalized === "indexable" || normalized === "promotion_candidate" || normalized === "seed_index") {
    return true;
  }
  if (normalized === "noindex" || normalized === "blocked" || normalized === "excluded") {
    return false;
  }
  return null;
}

function resolveCareerExplicitGate(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const seoContract = item.seo_contract && typeof item.seo_contract === "object" ? item.seo_contract : null;
  const seoSurface = item.seo_surface_v1 && typeof item.seo_surface_v1 === "object" ? item.seo_surface_v1 : null;
  const indexState = normalizeSlug(
    (seoContract && seoContract.index_state) ||
      item.index_state ||
      (seoSurface && (seoSurface.index_state || seoSurface.indexability_state))
  );
  const explicitBoolean =
    (seoContract && typeof seoContract.index_eligible === "boolean" ? seoContract.index_eligible : null) ??
    (typeof item.index_eligible === "boolean" ? item.index_eligible : null) ??
    (seoSurface && typeof seoSurface.index_eligible === "boolean" ? seoSurface.index_eligible : null);
  const derivedBoolean = explicitBoolean === null ? isExplicitCareerIndexableState(indexState) : explicitBoolean;

  if (derivedBoolean === null && !indexState) {
    return { indexEligible: null, indexState: null };
  }

  return {
    indexEligible: derivedBoolean,
    indexState: indexState || null,
  };
}

function shouldIncludeCareerSitemapPath(path, item) {
  return shouldIncludeInSitemap(path, resolveCareerExplicitGate(item));
}

function extractAuthorityItems(payload) {
  if (Array.isArray(payload && payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload && payload.data)) {
    return payload.data;
  }

  return [];
}

function buildLocalizedAuthorityCareerPath(localePrefix, canonicalPath, fallbackPath) {
  const normalizedCanonical = normalizePath(canonicalPath || "");
  if (/^\/(en|zh)(\/|$)/i.test(normalizedCanonical)) {
    return normalizedCanonical;
  }

  if (normalizedCanonical.startsWith("/career/")) {
    return `/${localePrefix}${normalizedCanonical}`;
  }

  return normalizePath(fallbackPath);
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
    "/en/datasets/occupations",
    "/zh/datasets/occupations",
    "/en/datasets/occupations/method",
    "/zh/datasets/occupations/method",
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

const staticGeneratedPaths = [
  ...new Set([
    ...buildLandingPaths(),
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

async function fetchJsonWithTimeout(url, timeoutMs = cmsSitemapTimeoutMs) {
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

async function buildTestPathsFromApi() {
  try {
    const paths = new Set();

    for (const { localePrefix, apiLocale } of CMS_LOCALES) {
      const params = new URLSearchParams({ locale: apiLocale });
      const payload = await fetchJsonWithTimeout(`${buildApiUrl("/v0.3/scales/catalog")}?${params.toString()}`);
      const items = Array.isArray(payload?.items) ? payload.items : [];

      for (const item of items) {
        const slug = normalizeSlug(item?.slug);
        if (!slug || hasIndexableFlagFalse(item) || !isPublicIndexable(item)) continue;
        paths.add(`/${localePrefix}/tests/${slug}`);
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

function normalizeDiscoverabilityState(value) {
  const normalized = normalizeSlug(value).toLowerCase();
  if (normalized === "discoverable" || normalized === "excluded") {
    return normalized;
  }
  return null;
}

function extractCareerDiscoverabilityManifestRoutes(payload) {
  const rows = Array.isArray(payload?.routes) ? payload.routes : [];

  return rows
    .filter((row) => row && typeof row === "object")
    .map((row) => {
      const routeKind = normalizeSlug(row.route_kind);
      const canonicalPath = normalizePath(row.canonical_path || "");
      const canonicalSlug = normalizeSlug(row.canonical_slug).toLowerCase();
      const discoverabilityState = normalizeDiscoverabilityState(row.discoverability_state);

      if (!routeKind || !canonicalPath || !canonicalSlug || !discoverabilityState) {
        return null;
      }

      return {
        routeKind,
        canonicalPath,
        canonicalSlug,
        discoverabilityState,
      };
    })
    .filter(Boolean);
}

const careerDiscoverabilityManifestRouteCache = new Map();

async function fetchCareerDiscoverabilityManifestRoutes(apiLocale) {
  const cacheKey = normalizeSlug(apiLocale).toLowerCase() || "default";
  if (careerDiscoverabilityManifestRouteCache.has(cacheKey)) {
    return careerDiscoverabilityManifestRouteCache.get(cacheKey);
  }

  const params = new URLSearchParams({ locale: apiLocale });
  const payload = await fetchJsonWithTimeout(
    `${buildApiUrl("/v0.5/career/first-wave/discoverability-manifest")}?${params.toString()}`
  );
  const routes = extractCareerDiscoverabilityManifestRoutes(payload);
  careerDiscoverabilityManifestRouteCache.set(cacheKey, routes);

  return routes;
}

async function fetchPaginatedItems(path, queryParams = {}, timeoutMs = cmsSitemapTimeoutMs) {
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

async function buildCmsDetailPaths(path, queryBuilder, toPath, timeoutMs = cmsSitemapTimeoutMs) {
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

async function buildCareerJobDetailPathsFromAuthority() {
  try {
    const paths = new Set();

    for (const { localePrefix, apiLocale } of CMS_LOCALES) {
      const routes = await fetchCareerDiscoverabilityManifestRoutes(apiLocale);

      for (const route of routes) {
        if (route.routeKind !== "career_job_detail" || route.discoverabilityState !== "discoverable") {
          continue;
        }

        paths.add(
          buildLocalizedAuthorityCareerPath(
            localePrefix,
            route.canonicalPath,
            `/${localePrefix}/career/jobs/${route.canonicalSlug}`
          )
        );
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

async function buildCareerRecommendationDetailPathsFromAuthority() {
  try {
    const paths = new Set();

    for (const { localePrefix, apiLocale } of CMS_LOCALES) {
      const params = new URLSearchParams({ locale: apiLocale });
      const payload = await fetchJsonWithTimeout(
        `${buildApiUrl("/v0.5/career/recommendations/mbti")}?${params.toString()}`
      );
      const items = extractAuthorityItems(payload);

      for (const item of items) {
        const routeSlug = normalizeSlug(
          item?.recommendation_subject_meta?.public_route_slug ||
          item?.recommendation_subject_meta?.canonical_type_code ||
          item?.recommendation_subject_meta?.type_code
        ).toLowerCase();
        if (!routeSlug) continue;
        const path = buildLocalizedAuthorityCareerPath(
          localePrefix,
          item?.seo_contract?.canonical_path,
          `/${localePrefix}/career/recommendations/mbti/${routeSlug}`
        );
        if (shouldIncludeCareerSitemapPath(path, item)) {
          paths.add(path);
        }
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

async function buildCareerFamilyDetailPathsFromAuthority() {
  try {
    const paths = new Set();

    for (const { localePrefix, apiLocale } of CMS_LOCALES) {
      const routes = await fetchCareerDiscoverabilityManifestRoutes(apiLocale);

      for (const route of routes) {
        if (route.routeKind !== "career_family_hub" || route.discoverabilityState !== "discoverable") {
          continue;
        }

        paths.add(
          buildLocalizedAuthorityCareerPath(
            localePrefix,
            route.canonicalPath,
            `/${localePrefix}/career/family/${route.canonicalSlug}`
          )
        );
      }
    }

    return [...paths];
  } catch {
    return [];
  }
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
  generateIndexSitemap: false,
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
      careerFamilyApiPaths,
      careerRecommendationApiPaths,
      personalityPaths,
      topicApiPaths,
      testApiPaths,
    ] = await Promise.all([
      buildValidatedCmsPaths("/v0.5/articles", buildArticlePaths),
      buildValidatedCmsPaths("/v0.5/career-guides", buildCareerGuideDetailPaths),
      buildValidatedCmsPaths("/v0.5/methods", buildMethodDetailPaths),
      buildValidatedCmsPaths("/v0.5/data", buildDataDetailPaths),
      buildCareerJobDetailPathsFromAuthority(),
      buildCareerFamilyDetailPathsFromAuthority(),
      buildCareerRecommendationDetailPathsFromAuthority(),
      buildValidatedCmsPaths("/v0.5/personality", buildPersonalityDetailPaths),
      buildValidatedCmsPaths("/v0.5/topics", buildTopicDetailPathsFromApi),
      buildTestPathsFromApi(),
    ]);

    return [...new Set([
      ...staticGeneratedPaths,
      ...testApiPaths,
      ...articlePaths,
      ...careerGuidePaths,
      ...methodPaths,
      ...dataPaths,
      ...careerJobApiPaths,
      ...careerFamilyApiPaths,
      ...careerRecommendationApiPaths,
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
