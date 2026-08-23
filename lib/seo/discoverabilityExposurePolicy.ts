export const PRIVATE_FLOW_ROUTE_EXCLUDES = [
  "/result/*",
  "/orders/*",
  "/share/*",
  "/pay/*",
  "/payment/*",
  "/history/*",
  "/tests/*/take",
] as const;

export const SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS: readonly RegExp[] = [
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

export function normalizeDiscoverabilityPath(pathname: string): string {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";
  const withoutQuery = raw.split("?")[0]?.split("#")[0] ?? raw;
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

export function stripDiscoverabilityLocalePrefix(pathname: string): string {
  const normalized = normalizeDiscoverabilityPath(pathname);
  const stripped = normalized.replace(LOCALE_PREFIX_RE, "");
  return stripped.length > 0 ? stripped : "/";
}

export function hasDiscoverabilityLocalePrefix(pathname: string): boolean {
  return LOCALE_PREFIX_RE.test(normalizeDiscoverabilityPath(pathname));
}

export function isSharedDiscoverabilityDeniedPath(pathname: string): boolean {
  const stripped = stripDiscoverabilityLocalePrefix(pathname);
  return SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}
