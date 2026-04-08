"use strict";

const LOCALE_PREFIX_RE = /^\/(en|zh)(?=\/|$)/i;
const DENY_PATH_PATTERNS = [
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

function normalizePathname(pathname) {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";
  const withoutQuery = (raw.split("?")[0] || raw).split("#")[0] || raw;
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function stripLocalePrefix(pathname) {
  const normalized = normalizePathname(pathname);
  const stripped = normalized.replace(LOCALE_PREFIX_RE, "");
  return stripped.length > 0 ? stripped : "/";
}

function isIndexablePath(pathname) {
  const stripped = stripLocalePrefix(pathname);
  return !DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
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

  if (explicitGate && explicitGate.indexEligible !== true) {
    return false;
  }

  return !isExplicitlyExcludedFromIndex(explicitGate);
}

module.exports = {
  isIndexablePath,
  shouldNoindex,
  shouldIncludeInSitemap,
  stripLocalePrefix,
};
