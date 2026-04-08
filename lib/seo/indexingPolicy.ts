import type { Locale } from "@/lib/i18n/locales";

export type ContentIndexabilityState = {
  hasLocalizedContent?: boolean;
  hasFallbackContent?: boolean;
  enforceLocalizedContent?: boolean;
};

export type ExplicitIndexGate = {
  indexEligible?: boolean | null;
  indexState?: string | null;
};

const LOCALE_PREFIX_RE = /^\/(en|zh)(?=\/|$)/i;
const DENY_PATH_PATTERNS: RegExp[] = [
  /^\/api(\/|$)/i,
  /^\/og(\/|$)/i,
  /^\/history(\/|$)/i,
  /^\/result(\/|$)/i,
  /^\/orders(\/|$)/i,
  /^\/share(\/|$)/i,
  /^\/attempts(\/|$)/i,
  /^\/relationships(\/|$)/i,
  /^\/payment(\/|$)/i,
  /^\/pay(\/|$)/i,
  /^\/quiz(\/|$)/i,
  /^\/professions(\/|$)/i,
  /^\/types(\/|$)/i,
  /^\/tests\/[^/]+\/take(\/|$)/i,
  /^\/test\/[^/]+\/take(\/|$)/i,
];

function normalizePathname(pathname: string): string {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";
  const withoutQuery = raw.split("?")[0]?.split("#")[0] ?? raw;
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

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
  const normalized = normalizePathname(pathname);
  const stripped = normalized.replace(LOCALE_PREFIX_RE, "");
  return stripped.length > 0 ? stripped : "/";
}

export function hasLocalePrefix(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return LOCALE_PREFIX_RE.test(normalized);
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

  if (explicitGate && explicitGate.indexEligible !== true) {
    return false;
  }

  return !isExplicitlyExcludedFromIndex(explicitGate);
}
