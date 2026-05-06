"use strict";

const PRIVATE_FLOW_ROUTE_EXCLUDES = [
  "/result/*",
  "/orders/*",
  "/share/*",
  "/pay/*",
  "/payment/*",
  "/history/*",
  "/tests/*/take",
];

const SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS = [
  /^\/api(\/|$)/i,
  /^\/og(\/|$)/i,
  /^\/history(\/|$)/i,
  /^\/result(\/|$)/i,
  /^\/results(\/|$)/i,
  /^\/orders(\/|$)/i,
  /^\/share(\/|$)/i,
  /^\/payment(\/|$)/i,
  /^\/pay(\/|$)/i,
  /^\/tests\/[^/]+\/take(\/|$)/i,
  /^\/test\/[^/]+\/take(\/|$)/i,
];

const LOCALE_PREFIX_RE = /^\/(en|zh)(?=\/|$)/i;

function normalizeDiscoverabilityPath(pathname) {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";
  const withoutQuery = (raw.split("?")[0] || raw).split("#")[0] || raw;
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function stripDiscoverabilityLocalePrefix(pathname) {
  const normalized = normalizeDiscoverabilityPath(pathname);
  const stripped = normalized.replace(LOCALE_PREFIX_RE, "");
  return stripped.length > 0 ? stripped : "/";
}

function hasDiscoverabilityLocalePrefix(pathname) {
  return LOCALE_PREFIX_RE.test(normalizeDiscoverabilityPath(pathname));
}

function isSharedDiscoverabilityDeniedPath(pathname) {
  const stripped = stripDiscoverabilityLocalePrefix(pathname);
  return SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

module.exports = {
  PRIVATE_FLOW_ROUTE_EXCLUDES,
  SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS,
  hasDiscoverabilityLocalePrefix,
  isSharedDiscoverabilityDeniedPath,
  normalizeDiscoverabilityPath,
  stripDiscoverabilityLocalePrefix,
};
