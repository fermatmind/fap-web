export type BrowserAnalyticsSuppressionDecision =
  | {
      suppressed: true;
      reason: "private_route" | "sensitive_query";
    }
  | {
      suppressed: false;
      reason: "not_suppressed";
    };

export type BrowserAnalyticsScriptDecision = {
  allowed: boolean;
  reason:
    | "allowed"
    | "disabled"
    | "missing_consent"
    | "non_production_environment"
    | "local_hostname"
    | "host_not_allowed"
    | "blocked_route"
    | "polluting_referrer"
    | "private_route"
    | "sensitive_query";
};

export type BrowserAnalyticsScriptInput = {
  pathname?: string | null;
  search?: string | null;
  env?: string | null;
  host?: string | null;
  referrer?: string | null;
  consent?: boolean | null;
  analyticsEnabled?: boolean;
  allowedHosts?: string | readonly string[] | null;
};

const LOCALE_SEGMENTS = new Set(["zh", "en"]);
const PRIVATE_ANALYTICS_ROUTE_SEGMENTS = new Set([
  "result",
  "orders",
  "share",
  "pay",
  "payment",
  "history",
]);
const BLOCKED_ANALYTICS_ROUTE_SEGMENTS = new Set(["admin", "dashboard", "internal", "analytics-dashboard"]);
const SENSITIVE_QUERY_KEYS = new Set([
  "orderno",
  "order_no",
  "orderid",
  "transaction_id",
  "payment_id",
  "resultid",
  "attemptid",
  "reportid",
  "token",
]);
const DEFAULT_ANALYTICS_ALLOWED_HOSTS = ["fermatmind.com", "www.fermatmind.com"] as const;
const POLLUTING_REFERRER_HOSTS = new Set(["tongji.baidu.com", "analytics.google.com"]);

export const PRIVATE_ANALYTICS_SUPPRESSION_HEADER = "x-fm-private-analytics-suppressed";

function normalizeToken(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeHostname(value: string | null | undefined): string {
  return normalizeToken(value).replace(/:\d+$/, "");
}

function normalizeDeploymentEnvironment(value: string | null | undefined): string {
  const normalized = normalizeToken(value);
  return normalized || "unknown";
}

export function firstContentRouteSegment(pathname?: string | null): string {
  const normalized = normalizeToken(pathname).split("?")[0] ?? "";
  const segments = normalized.split("/").filter(Boolean);
  return LOCALE_SEGMENTS.has(segments[0] ?? "") ? segments[1] ?? "" : segments[0] ?? "";
}

export function isPrivateAnalyticsSuppressedPath(pathname?: string | null): boolean {
  const segment = firstContentRouteSegment(pathname);
  return Boolean(segment && PRIVATE_ANALYTICS_ROUTE_SEGMENTS.has(segment));
}

export function isNoindexAnalyticsSuppressedPath(pathname?: string | null): boolean {
  return isPrivateAnalyticsSuppressedPath(pathname);
}

export function isBlockedAnalyticsRoutePath(pathname?: string | null): boolean {
  const segment = firstContentRouteSegment(pathname);
  return Boolean(segment && BLOCKED_ANALYTICS_ROUTE_SEGMENTS.has(segment));
}

export function hasSensitiveAnalyticsQuery(search?: string | null): boolean {
  const raw = typeof search === "string" ? search.trim() : "";
  if (!raw) return false;

  const query = raw.startsWith("?") ? raw.slice(1) : raw;
  if (!query) return false;

  try {
    const params = new URLSearchParams(query);
    for (const key of params.keys()) {
      if (SENSITIVE_QUERY_KEYS.has(key.trim().toLowerCase())) return true;
    }
  } catch {
    return query
      .split("&")
      .map((part) => part.split("=")[0]?.trim().toLowerCase())
      .some((key) => Boolean(key && SENSITIVE_QUERY_KEYS.has(key)));
  }

  return false;
}

export function getBrowserAnalyticsSuppressionDecision({
  pathname,
  search,
}: {
  pathname?: string | null;
  search?: string | null;
}): BrowserAnalyticsSuppressionDecision {
  if (isNoindexAnalyticsSuppressedPath(pathname)) {
    return { suppressed: true, reason: "private_route" };
  }
  if (hasSensitiveAnalyticsQuery(search)) {
    return { suppressed: true, reason: "sensitive_query" };
  }
  return { suppressed: false, reason: "not_suppressed" };
}

export function shouldSuppressServerAnalyticsBootstrap({
  pathname,
  search,
}: {
  pathname?: string | null;
  search?: string | null;
}): boolean {
  return getBrowserAnalyticsSuppressionDecision({ pathname, search }).suppressed;
}

export function parseBrowserAnalyticsAllowedHosts(value?: string | readonly string[] | null): string[] {
  const rawHosts = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : DEFAULT_ANALYTICS_ALLOWED_HOSTS;
  const hosts = rawHosts.map((host) => normalizeHostname(host)).filter(Boolean);
  return hosts.length > 0 ? Array.from(new Set(hosts)) : [...DEFAULT_ANALYTICS_ALLOWED_HOSTS];
}

export function isLocalBrowserAnalyticsHostname(hostname?: string | null): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".local")
  );
}

export function analyticsReferrerHostname(referrer?: string | null): string {
  const normalized = typeof referrer === "string" ? referrer.trim() : "";
  if (!normalized) return "";

  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return normalized.toLowerCase();
  }
}

export function isPollutingBrowserAnalyticsReferrer(referrer?: string | null): boolean {
  const host = analyticsReferrerHostname(referrer);
  return Boolean(host && POLLUTING_REFERRER_HOSTS.has(host));
}

export function shouldLoadBrowserAnalyticsScripts(input: BrowserAnalyticsScriptInput): BrowserAnalyticsScriptDecision {
  if (input.analyticsEnabled === false) {
    return { allowed: false, reason: "disabled" };
  }

  const suppression = getBrowserAnalyticsSuppressionDecision({
    pathname: input.pathname,
    search: input.search,
  });
  if (suppression.suppressed) {
    return { allowed: false, reason: suppression.reason };
  }

  if (input.consent === false) {
    return { allowed: false, reason: "missing_consent" };
  }

  const deploymentEnvironment = normalizeDeploymentEnvironment(input.env);
  if (deploymentEnvironment !== "production") {
    return { allowed: false, reason: "non_production_environment" };
  }

  const hostname = normalizeHostname(input.host);
  if (isLocalBrowserAnalyticsHostname(hostname)) {
    return { allowed: false, reason: "local_hostname" };
  }

  const allowedHosts = parseBrowserAnalyticsAllowedHosts(input.allowedHosts);
  if (!hostname || !allowedHosts.includes(hostname)) {
    return { allowed: false, reason: "host_not_allowed" };
  }

  if (isBlockedAnalyticsRoutePath(input.pathname)) {
    return { allowed: false, reason: "blocked_route" };
  }

  if (isPollutingBrowserAnalyticsReferrer(input.referrer)) {
    return { allowed: false, reason: "polluting_referrer" };
  }

  return { allowed: true, reason: "allowed" };
}
