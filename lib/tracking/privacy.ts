const REDACTED_TRACKING_VALUE = "redacted";

const SENSITIVE_QUERY_KEY_PATTERNS = [
  /(^|[_-])tokens?($|[_-])/i,
  /bearer/i,
  /auth/i,
  /^fm[_-]/i,
  /attempt/i,
  /checkout/i,
  /invite/i,
  /order/i,
  /payment/i,
  /recovery/i,
  /report/i,
  /resume/i,
  /secret/i,
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

const SENSITIVE_PATH_VALUE_PATTERNS = [
  /^attempt[-_]/i,
  /^ord(?:er)?[-_]/i,
  /^fm[-_]/i,
  /bearer/i,
  /recovery/i,
  /secret/i,
  /token/i,
];

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

function redactSearchParams(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  for (const [key, value] of searchParams.entries()) {
    if (isSensitiveQueryKey(key) || shouldRedactUrlValue(value)) {
      next.set(key, REDACTED_TRACKING_VALUE);
      continue;
    }

    if (looksLikeUrlOrPath(value)) {
      next.set(key, sanitizeTrackingUrl(value) ?? "");
    }
  }

  return next;
}

function redactPathname(pathname: string): string {
  let redactNextSegment = false;
  const segments = pathname.split("/").map((segment) => {
    if (!segment) return segment;

    const decodedSegment = safeDecodeURIComponent(segment);
    if (redactNextSegment || SENSITIVE_PATH_VALUE_PATTERNS.some((pattern) => pattern.test(decodedSegment))) {
      redactNextSegment = false;
      return REDACTED_TRACKING_VALUE;
    }

    redactNextSegment = SENSITIVE_PATH_CONTAINER_SEGMENTS.has(decodedSegment.toLowerCase());
    return segment;
  });

  return segments.join("/") || "/";
}

export function sanitizeTrackingUrl(value: unknown): string | null {
  const normalized = normalizeTrackingText(value, 2048);
  if (!normalized) return null;
  if (!looksLikeUrlOrPath(normalized)) return normalized;

  try {
    const isAbsolute = /^[a-z][a-z\d+\-.]*:\/\//i.test(normalized);
    const parsed = new URL(normalized, "https://tracking.local");
    const search = redactSearchParams(parsed.searchParams).toString();
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
    normalized === "referrer" ||
    normalized === "continuetarget" ||
    normalized.endsWith("_url") ||
    normalized.endsWith("url")
  );
}
