const CMS_ROUTE_TO_SITEMAP_PREFIXES = Object.freeze({
  "/v0.5/articles": ["/en/articles", "/zh/articles"],
  "/v0.5/career-guides": ["/en/career/guides", "/zh/career/guides"],
  "/v0.5/career-jobs": ["/en/career/jobs", "/zh/career/jobs"],
  "/v0.5/personality": ["/en/personality", "/zh/personality"],
  "/v0.5/topics": ["/en/topics", "/zh/topics"],
  "/v0.5/career-recommendations/mbti": [
    "/en/career/recommendations/mbti",
    "/zh/career/recommendations/mbti",
  ],
  "/v0.5/methods": ["/en/methods", "/zh/methods"],
  "/v0.5/data": ["/en/data", "/zh/data"],
});

function normalizePath(path) {
  const value = String(path || "").trim() || "/";
  if (value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function isProductionLikeEnv() {
  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  const appEnv = String(process.env.NEXT_PUBLIC_APP_ENV || "").toLowerCase();
  return nodeEnv === "production" || appEnv === "production";
}

const isMethodDataExplicitlyEnabled = process.env.SITEMAP_ENABLE_METHOD_DATA === "1";
const shouldDisableUndeployedCmsRoutes = !isMethodDataExplicitlyEnabled;

const VALID_CMS_ROUTES = Object.freeze({
  "/v0.5/articles": true,
  "/v0.5/career-guides": true,
  "/v0.5/career-jobs": true,
  "/v0.5/personality": true,
  "/v0.5/topics": true,
  "/v0.5/career-recommendations/mbti": true,
  "/v0.5/methods": !shouldDisableUndeployedCmsRoutes,
  "/v0.5/data": !shouldDisableUndeployedCmsRoutes,
});

function isValidCmsApiRoute(apiRoute) {
  return VALID_CMS_ROUTES[normalizePath(apiRoute)] === true;
}

function buildInvalidCmsSitemapExcludes() {
  const excludes = new Set();

  for (const [apiRoute, prefixes] of Object.entries(CMS_ROUTE_TO_SITEMAP_PREFIXES)) {
    if (isValidCmsApiRoute(apiRoute)) continue;

    for (const prefix of prefixes) {
      const normalized = normalizePath(prefix);
      excludes.add(normalized);
      excludes.add(`${normalized}/*`);
    }
  }

  return [...excludes];
}

function shouldIncludeCmsSitemapPath(path) {
  const normalizedPath = normalizePath(path);

  for (const [apiRoute, prefixes] of Object.entries(CMS_ROUTE_TO_SITEMAP_PREFIXES)) {
    if (isValidCmsApiRoute(apiRoute)) continue;

    for (const prefix of prefixes) {
      const normalizedPrefix = normalizePath(prefix);
      if (normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`)) {
        return false;
      }
    }
  }

  return true;
}

module.exports = {
  VALID_CMS_ROUTES,
  isValidCmsApiRoute,
  buildInvalidCmsSitemapExcludes,
  shouldIncludeCmsSitemapPath,
  isProductionLikeEnv,
};
