import type { Locale } from "@/lib/i18n/locales";
import {
  SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS,
  hasDiscoverabilityLocalePrefix,
  stripDiscoverabilityLocalePrefix,
} from "@/lib/seo/discoverabilityExposurePolicy";

export type ContentIndexabilityState = {
  hasLocalizedContent?: boolean;
  hasFallbackContent?: boolean;
  enforceLocalizedContent?: boolean;
};

export type ExplicitIndexGate = {
  indexEligible?: boolean | null;
  indexState?: string | null;
};

const DENY_PATH_PATTERNS: RegExp[] = [
  ...SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS,
  /^\/attempts(\/|$)/i,
  /^\/relationships(\/|$)/i,
  /^\/quiz(\/|$)/i,
  /^\/professions(\/|$)/i,
  /^\/types(\/|$)/i,
];

function extractQueryString(pathname: string): string {
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

export function stripLocalePrefix(pathname: string): string {
  return stripDiscoverabilityLocalePrefix(pathname);
}

export function hasLocalePrefix(pathname: string): boolean {
  return hasDiscoverabilityLocalePrefix(pathname);
}

export function isIndexablePath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return !DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

export function isCareerJobsQueryPage(pathname: string): boolean {
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

export function isCareerJobsIndexLaunchQuarantined(pathname: string): boolean {
  // PR-07 launch quarantine: keep the heavy jobs index reachable for users, but out of
  // sitemap/llms/paid/backlink exposure until the performance/cache gate passes.
  return stripLocalePrefix(pathname) === "/career/jobs" && !isCareerJobsQueryPage(pathname);
}

function normalizeIndexState(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function isExplicitlyExcludedFromIndex(gate?: ExplicitIndexGate | null): boolean {
  const indexState = normalizeIndexState(gate?.indexState);

  if (gate?.indexEligible === false) {
    return true;
  }

  return indexState === "noindex" || indexState === "blocked" || indexState === "excluded";
}

export function shouldNoindex(
  pathname: string,
  locale: Locale | null | undefined,
  contentState?: ContentIndexabilityState,
  explicitGate?: ExplicitIndexGate | null
): boolean {
  if (!isIndexablePath(pathname)) return true;
  if (isCareerJobsQueryPage(pathname)) return true;
  if (isExplicitlyExcludedFromIndex(explicitGate)) return true;

  if (contentState?.enforceLocalizedContent && locale) {
    if (contentState.hasLocalizedContent === false) return true;
    if (locale === "en" && contentState.hasFallbackContent === true) return true;
  }

  return false;
}

export function shouldIncludeInSitemap(pathname: string, explicitGate?: ExplicitIndexGate | null): boolean {
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
