const DEFAULT_SITE_URL = "http://localhost:3000";
export const CANONICAL_SITE_URL = "https://fermatmind.com";
const CANONICAL_SITE_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);
const STAGING_SITE_HOSTS = new Set(["staging.fermatmind.com"]);

function normalizeSiteUrl(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\/$/, "");
}

function convergeCanonicalSiteUrl(value: string): string {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return CANONICAL_SITE_HOSTS.has(hostname) || STAGING_SITE_HOSTS.has(hostname) ? CANONICAL_SITE_URL : value;
  } catch {
    return value;
  }
}

function isLocalhostUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

export function getSiteUrlOrThrow(): string {
  const candidate = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const fallback = DEFAULT_SITE_URL;
  const isProductionBuild = process.env.NODE_ENV === "production";
  const resolved = convergeCanonicalSiteUrl(candidate || fallback);

  if (isProductionBuild && (!candidate || isLocalhostUrl(candidate))) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be set to a production absolute URL (non-localhost).");
  }

  return resolved;
}

export const SITE_URL = getSiteUrlOrThrow();

export function isStagingSiteUrl(value: string | null | undefined): boolean {
  const normalized = normalizeSiteUrl(value);
  if (!normalized) {
    return false;
  }

  try {
    return STAGING_SITE_HOSTS.has(new URL(normalized).hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function isConfiguredStagingSiteUrl(): boolean {
  return isStagingSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function canonicalUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function getSiteHost(): string {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return SITE_URL;
  }
}
