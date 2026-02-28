import type { Locale } from "@/lib/i18n/locales";

export type ContentIndexabilityState = {
  hasLocalizedContent?: boolean;
  hasFallbackContent?: boolean;
  enforceLocalizedContent?: boolean;
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
  /^\/payment(\/|$)/i,
  /^\/pay(\/|$)/i,
  /^\/quiz(\/|$)/i,
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

export function shouldNoindex(
  pathname: string,
  locale: Locale | null | undefined,
  contentState?: ContentIndexabilityState
): boolean {
  if (!isIndexablePath(pathname)) return true;

  if (contentState?.enforceLocalizedContent && locale) {
    if (contentState.hasLocalizedContent === false) return true;
    if (locale === "en" && contentState.hasFallbackContent === true) return true;
  }

  return false;
}

export function shouldIncludeInSitemap(pathname: string): boolean {
  return isIndexablePath(pathname);
}
