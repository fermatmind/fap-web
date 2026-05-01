import { localizedPath, type Locale } from "@/lib/i18n/locales";

export type ReportActionHrefKind = "page" | "pdf" | "wait" | "history" | "lookup";

const FIRST_PARTY_HOSTS = new Set([
  "fermatmind.com",
  "www.fermatmind.com",
  "staging.fermatmind.com",
  "web.example.test",
  "example.test",
  "localhost",
  "127.0.0.1",
]);

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function hasExplicitScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isProtocolRelative(value: string): boolean {
  return value.startsWith("//");
}

function isLocalDevelopmentHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized.endsWith(".example.test");
}

function isFirstPartyHost(hostname: string): boolean {
  return FIRST_PARTY_HOSTS.has(hostname.toLowerCase());
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value, "https://fermatmind.com");
  } catch {
    return null;
  }
}

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|zh)(?=\/|$)/, "") || "/";
}

function normalizeFirstPartyPath(value: unknown): string | null {
  const normalized = normalizeText(value);
  if (!normalized || normalized.includes("\\")) {
    return null;
  }

  const explicitScheme = hasExplicitScheme(normalized);
  if (explicitScheme && !/^https?:\/\//i.test(normalized)) {
    return null;
  }

  const parsed = parseUrl(normalized);
  if (!parsed) {
    return null;
  }

  const absolute = explicitScheme || isProtocolRelative(normalized);
  const allowedProtocol =
    parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalDevelopmentHost(parsed.hostname));
  if (absolute && (!allowedProtocol || !isFirstPartyHost(parsed.hostname))) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function addLocaleIfNeeded(path: string, locale: Locale): string {
  const firstSegment = path.split("/").filter(Boolean)[0];
  if (firstSegment === "en" || firstSegment === "zh" || path.startsWith("/api/")) {
    return path;
  }

  return localizedPath(path, locale);
}

function isAllowedPagePath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return (
    path.startsWith("/result/")
    || /^\/attempts\/[^/]+\/(?:result|report)(?:\/|$)/.test(path)
  );
}

function isAllowedPdfPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return (
    /^\/api\/v0\.3\/attempts\/[^/]+\/report(?:\.pdf)?$/.test(path)
    || /^\/attempts\/[^/]+\/report(?:\.pdf)?$/.test(path)
  );
}

function isAllowedWaitPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path === "/pay/wait" || path.startsWith("/result/") || /^\/attempts\/[^/]+\/report(?:\/|$)/.test(path);
}

function isAllowedHistoryPath(pathname: string): boolean {
  return stripLocalePrefix(pathname).startsWith("/history/");
}

function isAllowedLookupPath(pathname: string): boolean {
  return stripLocalePrefix(pathname) === "/orders/lookup";
}

function isAllowedReportActionPath(kind: ReportActionHrefKind, pathname: string): boolean {
  switch (kind) {
    case "page":
      return isAllowedPagePath(pathname);
    case "pdf":
      return isAllowedPdfPath(pathname);
    case "wait":
      return isAllowedWaitPath(pathname);
    case "history":
      return isAllowedHistoryPath(pathname);
    case "lookup":
      return isAllowedLookupPath(pathname);
    default:
      return false;
  }
}

export function normalizeReportActionHref(
  value: unknown,
  locale: Locale,
  kind: ReportActionHrefKind
): string | null {
  const firstPartyPath = normalizeFirstPartyPath(value);
  if (!firstPartyPath) {
    return null;
  }

  const parsed = parseUrl(firstPartyPath);
  if (!parsed || !isAllowedReportActionPath(kind, parsed.pathname)) {
    return null;
  }

  return addLocaleIfNeeded(`${parsed.pathname}${parsed.search}${parsed.hash}`, locale);
}

export function normalizeRecommendedReadHref(value: unknown): string | null {
  const firstPartyPath = normalizeFirstPartyPath(value);
  if (!firstPartyPath) {
    return null;
  }

  const parsed = parseUrl(firstPartyPath);
  if (!parsed || parsed.pathname.startsWith("/api/")) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
