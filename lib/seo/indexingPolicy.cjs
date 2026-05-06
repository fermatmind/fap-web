/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const {
  SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS,
  hasDiscoverabilityLocalePrefix,
  stripDiscoverabilityLocalePrefix,
} = require("./discoverabilityExposurePolicy.cjs");

const DENY_PATH_PATTERNS = [
  ...SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS,
  /^\/attempts(\/|$)/i,
  /^\/relationships(\/|$)/i,
  /^\/quiz(\/|$)/i,
  /^\/professions(\/|$)/i,
  /^\/types(\/|$)/i,
];

function extractQueryString(pathname) {
  const raw = String(pathname || "").trim();
  const queryIndex = raw.indexOf("?");
  if (queryIndex === -1) {
    return "";
  }

  const hashIndex = raw.indexOf("#", queryIndex);
  if (hashIndex === -1) {
    return raw.slice(queryIndex + 1);
  }

  return raw.slice(queryIndex + 1, hashIndex);
}

function stripLocalePrefix(pathname) {
  return stripDiscoverabilityLocalePrefix(pathname);
}

function hasLocalePrefix(pathname) {
  return hasDiscoverabilityLocalePrefix(pathname);
}

function isIndexablePath(pathname) {
  const stripped = stripLocalePrefix(pathname);
  return !DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

function isCareerJobsQueryPage(pathname) {
  const stripped = stripLocalePrefix(pathname);
  if (stripped !== "/career/jobs") {
    return false;
  }

  const query = extractQueryString(pathname);
  if (!query) {
    return false;
  }

  const params = new URLSearchParams(query);
  const rawQuery = params.get("q");

  return typeof rawQuery === "string" && rawQuery.trim().length > 0;
}

function isCareerJobsIndexLaunchQuarantined(pathname) {
  // PR-07 launch quarantine: keep the heavy jobs index reachable for users, but out of
  // sitemap/llms/paid/backlink exposure until the performance/cache gate passes.
  return stripLocalePrefix(pathname) === "/career/jobs" && !isCareerJobsQueryPage(pathname);
}

function normalizeIndexState(value) {
  return String(value || "").trim().toLowerCase();
}

function isExplicitlyExcludedFromIndex(gate) {
  const indexState = normalizeIndexState(gate && gate.indexState);

  if (gate && gate.indexEligible === false) {
    return true;
  }

  return indexState === "noindex" || indexState === "blocked" || indexState === "excluded";
}

function shouldNoindex(pathname, locale, contentState, explicitGate) {
  if (!isIndexablePath(pathname)) return true;
  if (isCareerJobsQueryPage(pathname)) return true;
  if (isExplicitlyExcludedFromIndex(explicitGate)) return true;

  if (contentState && contentState.enforceLocalizedContent && locale) {
    if (contentState.hasLocalizedContent === false) return true;
    if (locale === "en" && contentState.hasFallbackContent === true) return true;
  }

  return false;
}

function shouldIncludeInSitemap(pathname, explicitGate) {
  if (!isIndexablePath(pathname)) {
    return false;
  }

  if (isCareerJobsQueryPage(pathname)) {
    return false;
  }

  if (isCareerJobsIndexLaunchQuarantined(pathname)) {
    return false;
  }

  if (explicitGate && explicitGate.indexEligible !== true) {
    return false;
  }

  return !isExplicitlyExcludedFromIndex(explicitGate);
}

module.exports = {
  isIndexablePath,
  isCareerJobsQueryPage,
  isCareerJobsIndexLaunchQuarantined,
  shouldNoindex,
  shouldIncludeInSitemap,
  hasLocalePrefix,
  stripLocalePrefix,
};
