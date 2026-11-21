export const PRIVATE_FLOW_ROUTE_EXCLUDES = [
  "/email/*",
  "/account",
  "/account/*",
  "/result/*",
  "/orders/*",
  "/share/*",
  "/pay/*",
  "/payment/*",
  "/history/*",
  "/tests/*/take",
  "/career/assessment/take",
  "/tests/explore/*/take",
  "/tests/play/*/take",
] as const;

export const SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS: readonly RegExp[] = [
  /^\/tests\/(?:jung-cognitive-functions|(?:explore|play)\/cognitive-functions-test)(?:\/|$)/i,
  /^\/email(\/|$)/i,
  /^\/account(\/|$)/i,
  /^\/cms-preview(\/|$)/i,
  /^\/api(\/|$)/i,
  /^\/career\/recommendations\/mbti(?:\/|$)/i,
  /^\/og(\/|$)/i,
  /^\/history(\/|$)/i,
  /^\/result(\/|$)/i,
  /^\/results(\/|$)/i,
  /^\/orders(\/|$)/i,
  /^\/share(\/|$)/i,
  /^\/payment(\/|$)/i,
  /^\/pay(\/|$)/i,
  /^\/career\/assessment\/take(\/|$)/i,
  /^\/tests\/[^/]+\/take(\/|$)/i,
  /^\/tests\/(?:explore|play)\/[^/]+\/take(\/|$)/i,
  /^\/test\/[^/]+\/take(\/|$)/i,
];

const LOCALE_PREFIX_RE = /^\/(en|zh|zh-TW)(?=\/|$)/i;

// ENT-PRUNE-01. These public pages remain routable for existing shares.
const archivedEntertainmentEntries = new Set([
  "/tests/explore/number-context-reflection",
  "/tests/explore/spatial-thinking-reflection",
  "/tests/explore/time-of-year-context-reflection",
]);

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
  return isArchivedEntertainmentPath(stripped)
    || SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

export function isArchivedEntertainmentPath(pathname: string): boolean {
  const path = stripDiscoverabilityLocalePrefix(pathname).replace(/\/+$/, "");
  const entry = path.replace(/\/results\/[^/]+$/, "");
  return archivedEntertainmentEntries.has(entry);
}
