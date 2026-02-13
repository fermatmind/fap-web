const DEFAULT_SITE_URL = "http://localhost:3000";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");

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
