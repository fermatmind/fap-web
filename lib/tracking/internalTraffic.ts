export type AnalyticsRuntimeDecision = {
  allowed: boolean;
  reason:
    | "allowed"
    | "disabled"
    | "non_production_environment"
    | "local_hostname"
    | "host_not_allowed"
    | "blocked_route"
    | "polluting_referrer";
};

type AnalyticsRuntimeInput = {
  analyticsEnabled?: boolean;
  hostname?: string | null;
  pathname?: string | null;
  referrer?: string | null;
  deploymentEnvironment?: string | null;
  allowedHosts?: string | readonly string[] | null;
};

const DEFAULT_ANALYTICS_ALLOWED_HOSTS = ["fermatmind.com", "www.fermatmind.com"] as const;
const BLOCKED_ROUTE_SEGMENTS = new Set(["admin", "dashboard", "internal", "analytics-dashboard"]);
const POLLUTING_REFERRER_HOSTS = new Set(["tongji.baidu.com", "analytics.google.com"]);

function normalizeToken(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeHostname(value: string | null | undefined): string {
  return normalizeToken(value).replace(/:\\d+$/, "");
}

function normalizeDeploymentEnvironment(value: string | null | undefined): string {
  const normalized = normalizeToken(value);
  return normalized || "unknown";
}

export function parseAnalyticsAllowedHosts(value?: string | readonly string[] | null): string[] {
  const rawHosts = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : DEFAULT_ANALYTICS_ALLOWED_HOSTS;
  const hosts = rawHosts.map((host) => normalizeHostname(host)).filter(Boolean);
  return hosts.length > 0 ? Array.from(new Set(hosts)) : [...DEFAULT_ANALYTICS_ALLOWED_HOSTS];
}

export function isLocalAnalyticsHostname(hostname?: string | null): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".local")
  );
}

export function isBlockedAnalyticsRoute(pathname?: string | null): boolean {
  const normalized = normalizeToken(pathname).split("?")[0] ?? "";
  const segments = normalized.split("/").filter(Boolean);
  const firstContentSegment = segments[0] === "zh" || segments[0] === "en" ? segments[1] : segments[0];
  return firstContentSegment ? BLOCKED_ROUTE_SEGMENTS.has(firstContentSegment) : false;
}

export function referrerHostname(referrer?: string | null): string {
  const normalized = typeof referrer === "string" ? referrer.trim() : "";
  if (!normalized) return "";

  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return normalized.toLowerCase();
  }
}

export function isPollutingAnalyticsReferrer(referrer?: string | null): boolean {
  const host = referrerHostname(referrer);
  return Boolean(host && POLLUTING_REFERRER_HOSTS.has(host));
}

export function getAnalyticsDeploymentEnvironment(env: Partial<NodeJS.ProcessEnv> = process.env): string {
  return normalizeDeploymentEnvironment(
    env.NEXT_PUBLIC_ANALYTICS_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV ?? env.VERCEL_ENV ?? env.NODE_ENV
  );
}

export function shouldAllowAnalyticsRuntime(input: AnalyticsRuntimeInput): AnalyticsRuntimeDecision {
  if (input.analyticsEnabled === false) {
    return { allowed: false, reason: "disabled" };
  }

  const deploymentEnvironment = normalizeDeploymentEnvironment(input.deploymentEnvironment);
  if (deploymentEnvironment !== "production") {
    return { allowed: false, reason: "non_production_environment" };
  }

  const hostname = normalizeHostname(input.hostname);
  if (isLocalAnalyticsHostname(hostname)) {
    return { allowed: false, reason: "local_hostname" };
  }

  const allowedHosts = parseAnalyticsAllowedHosts(input.allowedHosts);
  if (!hostname || !allowedHosts.includes(hostname)) {
    return { allowed: false, reason: "host_not_allowed" };
  }

  if (isBlockedAnalyticsRoute(input.pathname)) {
    return { allowed: false, reason: "blocked_route" };
  }

  if (isPollutingAnalyticsReferrer(input.referrer)) {
    return { allowed: false, reason: "polluting_referrer" };
  }

  return { allowed: true, reason: "allowed" };
}

export function shouldAllowBrowserAnalyticsRuntime({
  analyticsEnabled = true,
  deploymentEnvironment = getAnalyticsDeploymentEnvironment(),
  allowedHosts = process.env.NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS,
}: {
  analyticsEnabled?: boolean;
  deploymentEnvironment?: string | null;
  allowedHosts?: string | readonly string[] | null;
} = {}): AnalyticsRuntimeDecision {
  if (typeof window === "undefined") {
    return { allowed: false, reason: "non_production_environment" };
  }

  return shouldAllowAnalyticsRuntime({
    analyticsEnabled,
    deploymentEnvironment,
    allowedHosts,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    referrer: document.referrer,
  });
}
