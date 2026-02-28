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
  /^\/payment(\/|$)/i,
  /^\/pay(\/|$)/i,
  /^\/quiz(\/|$)/i,
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

function shouldNoindex(pathname, locale, contentState) {
  if (!isIndexablePath(pathname)) return true;

  if (contentState && contentState.enforceLocalizedContent && locale) {
    if (contentState.hasLocalizedContent === false) return true;
    if (locale === "en" && contentState.hasFallbackContent === true) return true;
  }

  return false;
}

function shouldIncludeInSitemap(pathname) {
  return isIndexablePath(pathname);
}

module.exports = {
  isIndexablePath,
  shouldNoindex,
  shouldIncludeInSitemap,
  stripLocalePrefix,
};
