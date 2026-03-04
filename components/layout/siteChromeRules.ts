const COOKIE_SUPPRESSED_PATTERNS = [
  /^\/result(\/|$)/i,
  /^\/share(\/|$)/i,
  /^\/orders(\/|$)/i,
  /^\/tests\/[^/]+\/take(\/|$)/i,
  /^\/test\/[^/]+\/take(\/|$)/i,
];

export function isCookieSuppressedPath(pathname: string): boolean {
  return COOKIE_SUPPRESSED_PATTERNS.some((pattern) => pattern.test(pathname));
}
