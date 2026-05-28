/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const { shouldIncludeInSitemap } = require("./lib/seo/indexingPolicy.cjs");
const {
  isSharedDiscoverabilityDeniedPath,
} = require("./lib/seo/discoverabilityExposurePolicy.cjs");
const {
  isValidCmsApiRoute,
  buildInvalidCmsSitemapExcludes,
  shouldIncludeCmsSitemapPath,
} = require("./lib/seo/cmsRoutePolicy.cjs");
const {
  CMS_LOCALES,
  HIDDEN_PUBLIC_TEST_ENTRY_SLUGS,
  NON_PAGE_ROUTE_EXCLUDES,
  SITEMAP_FINAL_PATH_DENY_PATTERNS,
  SITEMAP_ROUTE_EXCLUDES,
  buildStaticGeneratedPaths,
  normalizePath,
  normalizeSlug,
  resolveSitemapSiteUrl,
} = require("./lib/seo/sitemapAuthorityAdapters.cjs");
const CAREER_JOB_DETAIL_PARTS_RE = /^\/(en|zh)\/career\/jobs\/([^/]+)$/i;
const PERSONALITY_DETAIL_PARTS_RE = /^\/(en|zh)\/personality\/([ie][ns][ft][jp]-[at])$/i;
const WAVE_1_EN_CONTENT_PAGE_KEYS = ["brand", "charter", "foundation", "careers", "policies"];
const EXCLUDED_CAREER_JOB_DETAIL_SLUGS = new Set([
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
]);

const siteUrl = resolveSitemapSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://api.fermatmind.com").replace(/\/$/, "");
const cmsSitemapTimeoutMs = Number.parseInt(process.env.CMS_SITEMAP_TIMEOUT_MS || "10000", 10) || 10000;
const careerSitemapTimeoutMs =
  Number.parseInt(process.env.CAREER_SITEMAP_TIMEOUT_MS || process.env.CMS_SITEMAP_TIMEOUT_MS || "30000", 10) ||
  30000;
const careerSeoAuthorityConcurrency =
  Number.parseInt(process.env.CAREER_SEO_AUTHORITY_CONCURRENCY || "8", 10) || 8;

function isHiddenPublicTestEntrySlug(value) {
  return HIDDEN_PUBLIC_TEST_ENTRY_SLUGS.has(normalizeSlug(value).toLowerCase());
}

function hasIndexableFlagFalse(item) {
  return item && item.is_indexable === false;
}

function isPublicIndexable(item) {
  return item && item.is_public !== false && item.is_indexable !== false;
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
  return shouldIncludeGeneratedSitemapPath(path, resolveCareerExplicitGate(item));
}

function isForbiddenFinalSitemapPath(path) {
  const normalized = normalizePath(path);
  return (
    isSharedDiscoverabilityDeniedPath(normalized) ||
    SITEMAP_FINAL_PATH_DENY_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function isCareerJobDetailPath(path) {
  return /^\/(?:en|zh)\/career\/jobs\/[^/]+$/i.test(normalizePath(path));
}

function parseCareerJobDetailPath(path) {
  const normalized = normalizePath(path);
  const match = normalized.match(CAREER_JOB_DETAIL_PARTS_RE);
  const locale = match?.[1]?.toLowerCase();
  const slug = match?.[2]?.toLowerCase();

  if ((locale !== "en" && locale !== "zh") || !slug) {
    return null;
  }

  return {
    locale,
    slug,
    path: normalized,
  };
}

function parsePersonalityDetailPath(path) {
  const normalized = normalizePath(path);
  const match = normalized.match(PERSONALITY_DETAIL_PARTS_RE);
  const locale = match?.[1]?.toLowerCase();
  const slug = match?.[2]?.toLowerCase();

  if ((locale !== "en" && locale !== "zh") || !slug) {
    return null;
  }

  return {
    locale,
    slug,
    path: normalized,
  };
}

function shouldKeepBackendSitemapCareerJobDetailPath(path) {
  const normalized = normalizePath(path);
  const parsed = parseCareerJobDetailPath(normalized);

  return (
    isCareerJobDetailPath(normalized) &&
    Boolean(parsed) &&
    !EXCLUDED_CAREER_JOB_DETAIL_SLUGS.has(parsed.slug) &&
    shouldIncludeGeneratedSitemapPath(normalized, {
      indexEligible: true,
      indexState: "indexed",
    })
  );
}

function shouldKeepBackendSitemapPersonalityDetailPath(path) {
  const normalized = normalizePath(path);
  return Boolean(parsePersonalityDetailPath(normalized)) && shouldIncludeGeneratedSitemapPath(normalized);
}

function shouldIncludeGeneratedSitemapPath(path, explicitGate) {
  const normalized = normalizePath(path);
  if (isForbiddenFinalSitemapPath(normalized) && !(isCareerJobDetailPath(normalized) && explicitGate?.indexEligible === true)) {
    return false;
  }
  if (!shouldIncludeCmsSitemapPath(normalized)) return false;
  return shouldIncludeInSitemap(normalized, explicitGate);
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

const staticGeneratedPaths = buildStaticGeneratedPaths();

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
        if (!slug || isHiddenPublicTestEntrySlug(slug) || hasIndexableFlagFalse(item) || !isPublicIndexable(item)) continue;
        paths.add(`/${localePrefix}/tests/${slug}`);
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

let backendSitemapSourcePayloadCache = null;
let backendSitemapSourceCareerJobPathCache = null;
let backendSitemapSourcePersonalityPathCache = null;
const careerJobSeoAuthorityCache = new Map();

function extractBackendSitemapSourceCareerJobPaths(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const paths = new Set();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    const parsed = parseCareerJobDetailPath(path);
    if (parsed && shouldKeepBackendSitemapCareerJobDetailPath(parsed.path)) {
      paths.add(parsed.path);
    }
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

function toCareerSeoAuthorityLocale(locale) {
  return locale === "zh" ? "zh-CN" : "en";
}

function toCareerJobIndexApiLocale(locale) {
  return locale === "zh" ? "zh-CN" : "en";
}

function isIndexableCareerIndexState(value) {
  const normalized = normalizeSlug(value).toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized === "indexable" || normalized === "indexed" || normalized === "promotion_candidate") {
    return true;
  }
  if (normalized === "noindex" || normalized === "blocked" || normalized === "excluded") {
    return false;
  }
  return null;
}

function hasPolicyToken(value, token) {
  return normalizeSlug(value)
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes(token);
}

async function fetchCareerJobSeoAuthority(locale, slug) {
  const cacheKey = `${locale}:${slug}`;
  if (careerJobSeoAuthorityCache.has(cacheKey)) {
    return careerJobSeoAuthorityCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    locale: toCareerSeoAuthorityLocale(locale),
    org_id: "0",
  });
  const promise = fetchJsonWithTimeout(
    buildApiUrl(`/v0.5/career-jobs/${encodeURIComponent(slug)}/seo?${params.toString()}`),
    careerSitemapTimeoutMs
  ).catch(() => null);
  careerJobSeoAuthorityCache.set(cacheKey, promise);
  return promise;
}

function isCareerSeoAuthorityDiscoverable(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const surface = payload.seo_surface_v1 && typeof payload.seo_surface_v1 === "object" ? payload.seo_surface_v1 : {};
  const meta = payload.meta && typeof payload.meta === "object" ? payload.meta : {};
  const robotsPolicy = normalizeSlug(surface.robots_policy || meta.robots);
  const indexabilityState = normalizeSlug(surface.indexability_state).toLowerCase();
  const sitemapState = normalizeSlug(surface.sitemap_state).toLowerCase();
  const llmsExposureState = normalizeSlug(surface.llms_exposure_state).toLowerCase();

  if (hasPolicyToken(robotsPolicy, "noindex")) {
    return false;
  }

  if (robotsPolicy && !hasPolicyToken(robotsPolicy, "index")) {
    return false;
  }

  if (indexabilityState && indexabilityState !== "indexable") {
    return false;
  }

  if (sitemapState && sitemapState !== "included") {
    return false;
  }

  if (llmsExposureState && llmsExposureState !== "allow") {
    return false;
  }

  return true;
}

async function filterCareerJobPathsBySeoAuthority(paths) {
  const results = new Array(paths.length).fill(null);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < paths.length) {
      const index = nextIndex;
      nextIndex += 1;
      const path = paths[index];
      const parsed = parseCareerJobDetailPath(path);
      if (!parsed) {
        results[index] = null;
        continue;
      }

      const payload = await fetchCareerJobSeoAuthority(parsed.locale, parsed.slug);
      results[index] = isCareerSeoAuthorityDiscoverable(payload) ? parsed.path : null;
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(careerSeoAuthorityConcurrency, paths.length) }, () => worker())
  );

  return results.filter(Boolean).sort((left, right) => left.localeCompare(right));
}

function extractBackendSitemapSourcePersonalityPaths(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const paths = new Set();

  for (const item of items) {
    const path = extractPathFromCanonicalUrl(item?.loc);
    if (shouldKeepBackendSitemapPersonalityDetailPath(path)) {
      paths.add(normalizePath(path));
    }
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

async function fetchBackendSitemapSourcePayload() {
  if (backendSitemapSourcePayloadCache) {
    return backendSitemapSourcePayloadCache;
  }

  backendSitemapSourcePayloadCache = await fetchJsonWithTimeout(
    buildApiUrl("/v0.5/seo/sitemap-source"),
    careerSitemapTimeoutMs
  );

  return backendSitemapSourcePayloadCache;
}

async function fetchCareerJobIndex(locale) {
  const params = new URLSearchParams({
    locale: toCareerJobIndexApiLocale(locale),
    org_id: "0",
  });
  try {
    const payload = await fetchJsonWithTimeout(
      `${buildApiUrl("/v0.5/career/jobs")}?${params.toString()}`,
      careerSitemapTimeoutMs
    );
    return Array.isArray(payload?.items) ? payload.items : [];
  } catch {
    return [];
  }
}

function pathFromCareerJobIndexItem(locale, item) {
  const slug = normalizeSlug(item?.identity?.canonical_slug).toLowerCase();
  if (!slug || EXCLUDED_CAREER_JOB_DETAIL_SLUGS.has(slug)) {
    return null;
  }

  const seoContract = item?.seo_contract && typeof item.seo_contract === "object" ? item.seo_contract : {};
  const indexEligible = typeof seoContract.index_eligible === "boolean" ? seoContract.index_eligible : null;
  const indexState = normalizeSlug(seoContract.index_state);
  const robotsPolicy = normalizeSlug(seoContract.robots_policy);
  const explicitIndexableState = isIndexableCareerIndexState(indexState);
  if (indexEligible !== true || explicitIndexableState === false || hasPolicyToken(robotsPolicy, "noindex")) {
    return null;
  }

  const path = `/${locale}/career/jobs/${slug}`;
  return shouldKeepBackendSitemapCareerJobDetailPath(path) ? path : null;
}

async function fetchCareerJobIndexAuthorityPaths() {
  const paths = new Set();
  const [enItems, zhItems] = await Promise.all([
    fetchCareerJobIndex("en"),
    fetchCareerJobIndex("zh"),
  ]);

  for (const item of enItems) {
    const path = pathFromCareerJobIndexItem("en", item);
    if (path) paths.add(path);
  }

  for (const item of zhItems) {
    const path = pathFromCareerJobIndexItem("zh", item);
    if (path) paths.add(path);
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

async function fetchBackendSitemapSourceCareerJobPaths() {
  if (backendSitemapSourceCareerJobPathCache) {
    return backendSitemapSourceCareerJobPathCache;
  }

  let paths = await fetchCareerJobIndexAuthorityPaths();

  if (paths.length === 0) {
    const payload = await fetchBackendSitemapSourcePayload();
    paths = await filterCareerJobPathsBySeoAuthority(extractBackendSitemapSourceCareerJobPaths(payload));
  }

  backendSitemapSourceCareerJobPathCache = paths;

  return paths;
}

async function fetchBackendSitemapSourcePersonalityPaths() {
  if (backendSitemapSourcePersonalityPathCache) {
    return backendSitemapSourcePersonalityPathCache;
  }

  const payload = await fetchBackendSitemapSourcePayload();
  const paths = extractBackendSitemapSourcePersonalityPaths(payload);
  backendSitemapSourcePersonalityPathCache = paths;

  return paths;
}

async function fetchPaginatedItems(path, queryParams = {}, timeoutMs = cmsSitemapTimeoutMs) {
  const items = [];
  let page = 1;
  let lastPage;

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
    return await fetchBackendSitemapSourceCareerJobPaths();
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

async function buildWave1EnglishContentPagePaths() {
  try {
    const paths = new Set();

    for (const key of WAVE_1_EN_CONTENT_PAGE_KEYS) {
      const params = new URLSearchParams({ locale: "en", org_id: "0" });
      const payload = await fetchJsonWithTimeout(
        buildApiUrl(`/v0.5/content-pages/${encodeURIComponent(key)}?${params.toString()}`)
      );
      const page = payload?.page;
      if (!isPublicIndexable(page)) continue;

      const slug = normalizeSlug(page?.slug) || key;
      const path = normalizePath(`/en/${slug}`);
      if (shouldIncludeGeneratedSitemapPath(path)) {
        paths.add(path);
      }
    }

    return [...paths];
  } catch {
    return [];
  }
}

async function buildPersonalityDetailPathsFromAuthority() {
  try {
    return await fetchBackendSitemapSourcePersonalityPaths();
  } catch {
    return [];
  }
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
  autoLastmod: false,
  sitemapSize: 5000,
  exclude: [
    "/server-sitemap.xml",
    ...NON_PAGE_ROUTE_EXCLUDES,
    ...SITEMAP_ROUTE_EXCLUDES,
    ...buildInvalidCmsSitemapExcludes(),
  ],
  transform: async (_config, path) => {
    const normalized = normalizePath(path);
    if (!shouldIncludeGeneratedSitemapPath(normalized)) return null;

    return {
      loc: normalized,
      changefreq: "weekly",
      priority: normalized === "/" ? 1.0 : 0.7,
    };
  },
  additionalPaths: async () => {
    const [
      articlePaths,
      careerGuidePaths,
      methodPaths,
      dataPaths,
      careerJobApiPaths,
      careerRecommendationApiPaths,
      personalityPaths,
      topicApiPaths,
      wave1ContentPagePaths,
      testApiPaths,
    ] = await Promise.all([
      buildValidatedCmsPaths("/v0.5/articles", buildArticlePaths),
      buildValidatedCmsPaths("/v0.5/career-guides", buildCareerGuideDetailPaths),
      buildValidatedCmsPaths("/v0.5/methods", buildMethodDetailPaths),
      buildValidatedCmsPaths("/v0.5/data", buildDataDetailPaths),
      buildCareerJobDetailPathsFromAuthority(),
      buildCareerRecommendationDetailPathsFromAuthority(),
      buildPersonalityDetailPathsFromAuthority(),
      buildValidatedCmsPaths("/v0.5/topics", buildTopicDetailPathsFromApi),
      buildValidatedCmsPaths("/v0.5/content-pages", buildWave1EnglishContentPagePaths),
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
      ...careerRecommendationApiPaths,
      ...personalityPaths,
      ...topicApiPaths,
      ...wave1ContentPagePaths,
    ])]
      .map((path) => normalizePath(path))
      .filter((path) =>
        shouldIncludeGeneratedSitemapPath(path, isCareerJobDetailPath(path) ? { indexEligible: true, indexState: "indexed" } : null)
      )
      .map((loc) => ({
        loc,
        changefreq: "weekly",
        priority: loc === "/" ? 1.0 : 0.7,
      }));
  },
};
