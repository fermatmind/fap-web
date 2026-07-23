import {
  analyticsReferrerHostname,
  isBlockedAnalyticsRoutePath,
  isLocalBrowserAnalyticsHostname,
  isPollutingBrowserAnalyticsReferrer,
  parseBrowserAnalyticsAllowedHosts,
  shouldLoadBrowserAnalyticsScripts,
} from "@/lib/tracking/browserAnalyticsSuppression";

export type AnalyticsRuntimeDecision = {
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

type AnalyticsRuntimeInput = {
  analyticsEnabled?: boolean;
  hostname?: string | null;
  pathname?: string | null;
  search?: string | null;
  referrer?: string | null;
  deploymentEnvironment?: string | null;
  allowedHosts?: string | readonly string[] | null;
};

const DEFAULT_ANALYTICS_ALLOWED_HOSTS = ["fermatmind.com", "www.fermatmind.com"] as const;
const BUILD_TIME_ANALYTICS_ENV = process.env.NEXT_PUBLIC_ANALYTICS_ENV;
const BUILD_TIME_VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const BUILD_TIME_NODE_ENV = process.env.NODE_ENV;
const BUILD_TIME_ANALYTICS_ALLOWED_HOSTS = process.env.NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS;

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

export function parseAnalyticsAllowedHosts(value?: string | readonly string[] | null): string[] {
  return parseBrowserAnalyticsAllowedHosts(value ?? DEFAULT_ANALYTICS_ALLOWED_HOSTS);
}

export function isLocalAnalyticsHostname(hostname?: string | null): boolean {
  return isLocalBrowserAnalyticsHostname(hostname);
}

export function isBlockedAnalyticsRoute(pathname?: string | null): boolean {
  return isBlockedAnalyticsRoutePath(pathname);
}

export function referrerHostname(referrer?: string | null): string {
  return analyticsReferrerHostname(referrer);
}

export function isPollutingAnalyticsReferrer(referrer?: string | null): boolean {
  return isPollutingBrowserAnalyticsReferrer(referrer);
}

export function getAnalyticsDeploymentEnvironment(env?: Partial<NodeJS.ProcessEnv>): string {
  if (env) {
    return normalizeDeploymentEnvironment(
      env.NEXT_PUBLIC_ANALYTICS_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV ?? env.VERCEL_ENV ?? env.NODE_ENV
    );
  }

  return normalizeDeploymentEnvironment(
    BUILD_TIME_ANALYTICS_ENV ?? BUILD_TIME_VERCEL_ENV ?? BUILD_TIME_NODE_ENV
  );
}

export function shouldAllowAnalyticsRuntime(input: AnalyticsRuntimeInput): AnalyticsRuntimeDecision {
  return shouldLoadBrowserAnalyticsScripts({
    analyticsEnabled: input.analyticsEnabled,
    env: normalizeDeploymentEnvironment(input.deploymentEnvironment),
    host: normalizeHostname(input.hostname),
    pathname: input.pathname,
    search: input.search,
    referrer: input.referrer,
    allowedHosts: input.allowedHosts,
    consent: true,
  });
}

export function shouldAllowBrowserAnalyticsRuntime({
  analyticsEnabled = true,
  deploymentEnvironment = getAnalyticsDeploymentEnvironment(),
  allowedHosts = BUILD_TIME_ANALYTICS_ALLOWED_HOSTS,
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
    search: window.location.search,
    referrer: document.referrer,
  });
}
