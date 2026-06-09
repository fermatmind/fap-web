const REDACTED_TRACKING_VALUE = "redacted";
const PRIVATE_ANALYTICS_ROUTE_MARKER_PREFIX = "private_route:";

export type PrivateAnalyticsRouteFamily =
  | "history"
  | "result"
  | "orders"
  | "share"
  | "pay"
  | "payment";

export const PRIVATE_PUBLIC_ANALYTICS_ROUTE_FAMILIES = [
  "history",
  "result",
  "orders",
  "share",
  "pay",
  "payment",
] as const satisfies readonly PrivateAnalyticsRouteFamily[];

const SENSITIVE_QUERY_KEY_PATTERNS = [
  /(^|[_-])tokens?($|[_-])/i,
  /access[_-]?token/i,
  /bearer/i,
  /auth/i,
  /^code$/i,
  /csrf/i,
  /^fm[_-]/i,
  /attempt/i,
  /checkout/i,
  /invite/i,
  /jwt/i,
  /email/i,
  /^name$/i,
  /order/i,
  /password/i,
  /payment/i,
  /phone/i,
  /recovery/i,
  /refresh[_-]?token/i,
  /report/i,
  /resume/i,
  /secret/i,
  /session/i,
  /^state$/i,
  /signature/i,
];

const URL_LIKE_PATTERN = /^(?:https?:\/\/|\/|[a-z]{2}(?:-[A-Z]{2})?\/)/;

const SENSITIVE_PATH_CONTAINER_SEGMENTS = new Set([
  "attempt",
  "attempts",
  "order",
  "orders",
  "report",
  "reports",
  "result",
  "results",
]);

const SAFE_SENSITIVE_CONTAINER_CHILD_SEGMENTS = new Set([
  "lookup",
]);

const SENSITIVE_PATH_VALUE_PATTERNS = [
  /^attempt[-_]/i,
  /^ord(?:er)?[-_]/i,
  /^fm[-_]/i,
  /bearer/i,
  /recovery/i,
  /secret/i,
  /token/i,
];

const PRIVATE_ANALYTICS_ROUTE_FAMILIES_BY_SEGMENT: Record<string, PrivateAnalyticsRouteFamily> = {
  history: "history",
  order: "orders",
  orders: "orders",
  pay: "pay",
  payment: "payment",
  result: "result",
  results: "result",
  share: "share",
};

function normalizeTrackingText(value: unknown, maxLength = 512): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function isSensitiveQueryKey(key: string): boolean {
  return SENSITIVE_QUERY_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function shouldRedactUrlValue(value: string): boolean {
  const decoded = safeDecodeURIComponent(value);
  return SENSITIVE_QUERY_KEY_PATTERNS.some((pattern) => pattern.test(decoded));
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function looksLikeUrlOrPath(value: string): boolean {
  return URL_LIKE_PATTERN.test(value) || value.includes("?");
}

function privateRouteMarker(family: PrivateAnalyticsRouteFamily): string {
  return `${PRIVATE_ANALYTICS_ROUTE_MARKER_PREFIX}${family}`;
}

function privateRouteFamilyFromMarker(value: string): PrivateAnalyticsRouteFamily | null {
  if (!value.startsWith(PRIVATE_ANALYTICS_ROUTE_MARKER_PREFIX)) return null;
  const family = value.slice(PRIVATE_ANALYTICS_ROUTE_MARKER_PREFIX.length);
  return Object.values(PRIVATE_ANALYTICS_ROUTE_FAMILIES_BY_SEGMENT).includes(family as PrivateAnalyticsRouteFamily)
    ? (family as PrivateAnalyticsRouteFamily)
    : null;
}

function routeSegments(pathname: string): string[] {
  const segments = pathname
    .split("/")
    .map((segment) => safeDecodeURIComponent(segment).trim().toLowerCase())
    .filter(Boolean);
  if (segments[0] === "zh" || segments[0] === "en") return segments.slice(1);
  return segments;
}

function privateRouteFamilyFromPathname(pathname: string): PrivateAnalyticsRouteFamily | null {
  const [segment] = routeSegments(pathname);
  return segment ? PRIVATE_ANALYTICS_ROUTE_FAMILIES_BY_SEGMENT[segment] ?? null : null;
}

export function getPrivateAnalyticsRouteFamily(value: unknown): PrivateAnalyticsRouteFamily | null {
  const normalized = normalizeTrackingText(value, 2048);
  if (!normalized) return null;

  const markerFamily = privateRouteFamilyFromMarker(normalized);
  if (markerFamily) return markerFamily;
  if (!looksLikeUrlOrPath(normalized)) return null;

  try {
    const parsed = new URL(normalized, "https://tracking.local");
    return privateRouteFamilyFromPathname(parsed.pathname || "/");
  } catch {
    const [pathname] = normalized.split("?");
    return privateRouteFamilyFromPathname(pathname || "");
  }
}

export function shouldSuppressAnalyticsForUrl(value: unknown): boolean {
  return getPrivateAnalyticsRouteFamily(value) !== null;
}

export function shouldHardStopPublicAnalyticsForUrl(value: unknown): boolean {
  return shouldSuppressAnalyticsForUrl(value);
}

type SanitizeTrackingUrlOptions = {
  redactPrivateRouteFamily?: boolean;
};

function redactSearchParams(searchParams: URLSearchParams, options: SanitizeTrackingUrlOptions = {}): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  for (const [key, value] of searchParams.entries()) {
    if (isSensitiveQueryKey(key) || shouldRedactUrlValue(value)) {
      next.set(key, REDACTED_TRACKING_VALUE);
      continue;
    }

    if (looksLikeUrlOrPath(value)) {
      next.set(key, sanitizeTrackingUrl(value, options) ?? "");
    }
  }

  return next;
}

function redactPathname(pathname: string): string {
  let redactNextSegment = false;
  const segments = pathname.split("/").map((segment) => {
    if (!segment) return segment;

    const decodedSegment = safeDecodeURIComponent(segment);
    if (redactNextSegment && SAFE_SENSITIVE_CONTAINER_CHILD_SEGMENTS.has(decodedSegment.toLowerCase())) {
      redactNextSegment = false;
      return segment;
    }

    if (redactNextSegment || SENSITIVE_PATH_VALUE_PATTERNS.some((pattern) => pattern.test(decodedSegment))) {
      redactNextSegment = false;
      return REDACTED_TRACKING_VALUE;
    }

    redactNextSegment = SENSITIVE_PATH_CONTAINER_SEGMENTS.has(decodedSegment.toLowerCase());
    return segment;
  });

  return segments.join("/") || "/";
}

export function sanitizeTrackingUrl(value: unknown, options: SanitizeTrackingUrlOptions = {}): string | null {
  const normalized = normalizeTrackingText(value, 2048);
  if (!normalized) return null;
  const privateRouteFamily = getPrivateAnalyticsRouteFamily(normalized);
  if (options.redactPrivateRouteFamily && privateRouteFamily) return privateRouteMarker(privateRouteFamily);
  if (!looksLikeUrlOrPath(normalized)) return normalized;

  try {
    const isAbsolute = /^[a-z][a-z\d+\-.]*:\/\//i.test(normalized);
    const parsed = new URL(normalized, "https://tracking.local");
    const search = redactSearchParams(parsed.searchParams, options).toString();
    const pathname = redactPathname(parsed.pathname || "/");
    const sanitizedPath = search ? `${pathname}?${search}` : pathname;

    if (isAbsolute) {
      return `${parsed.origin}${sanitizedPath}`;
    }

    if (normalized.startsWith("/")) {
      return sanitizedPath;
    }

    return sanitizedPath.startsWith("/") ? sanitizedPath.slice(1) : sanitizedPath;
  } catch {
    return shouldRedactUrlValue(normalized) ? REDACTED_TRACKING_VALUE : normalized;
  }
}

export function sanitizeAnalyticsTrackingUrl(value: unknown): string | null {
  return sanitizeTrackingUrl(value, { redactPrivateRouteFamily: true });
}

export function maskTrackingIdentifier(value: unknown): string | null {
  const normalized = normalizeTrackingText(value, 128);
  if (!normalized) return null;
  if (normalized.includes("...")) return normalized;
  if (normalized.length <= 8) return REDACTED_TRACKING_VALUE;
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

export function isSensitiveTrackingIdentifierField(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return (
    normalized === "attemptid" ||
    normalized === "targetattemptid" ||
    normalized === "attemptidmasked" ||
    normalized === "orderno" ||
    normalized === "ordernomasked" ||
    normalized === "orderid" ||
    normalized === "transactionid"
  );
}

export function isUrlValuedTrackingField(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    normalized === "current_path" ||
    normalized === "landing_path" ||
    normalized === "page_location" ||
    normalized === "source_path" ||
    normalized === "destination_path" ||
    normalized === "canonical_url" ||
    normalized === "referrer" ||
    normalized === "continuetarget" ||
    normalized.endsWith("_url") ||
    normalized.endsWith("url")
  );
}
