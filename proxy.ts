import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildDefaultPublicPersonalitySlug } from "@/lib/cms/personality";
import {
  LOCALE_COOKIE_NAME,
  resolveCountryCodeFromHeaders,
  resolvePreferredLocale,
} from "@/lib/i18n/localeNegotiation";
import { localizedPath, stripLocalePrefix } from "@/lib/i18n/locales";
import { isLegacyPath, resolveLegacyPathMode } from "@/lib/legacyCompatibility";
import { shouldNoindex } from "@/lib/seo/indexingPolicy";
import {
  PRIVATE_ANALYTICS_SUPPRESSION_HEADER,
  getBrowserAnalyticsSuppressionDecision,
  isPrivateAnalyticsSuppressedPath,
} from "@/lib/tracking/browserAnalyticsSuppression";
import {
  createStagingDiscoverabilityGoneResponse,
  createStagingRobotsResponse,
  isStagingMachineDiscoverabilityPath,
  isStagingRequestHost,
  withStagingNoindexHeader,
} from "@/lib/seo/stagingDiscoverability";

const NOINDEX_VALUE = "noindex, nofollow, noarchive";
const PRIVATE_NOINDEX_VALUE = "noindex, nofollow, noarchive, nocache";
const PRIVATE_CACHE_CONTROL_VALUE = "private, no-store, max-age=0, must-revalidate";
const RESULT_PAGE_SNAPSHOT_SURFACE = "mbti.result_page_snapshot.v4";
const RESULT_PAGE_SNAPSHOT_SHELL_HEADER = "x-fermat-result-print-snapshot-shell";
const ANON_COOKIE_NAME = "fap_anonymous_id_v1";
const ANON_COOKIE_MAX_AGE_SECONDS = 31536000;
const ANON_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const FORCE_GONE_PATTERNS = [/^\/professions(\/|$)/i];
const LOCALE_REDIRECT_PREFIXES = ["articles", "career", "topics", "personality"] as const;
const MBTI_TYPE_RE = /^[ie][ns][ft][jp]$/i;
const DAILY_GIVING_PUBLIC_API_PATH_RE = /^\/api\/v0\.5\/foundation\/giving-records(?:\/|$)/i;
const DAILY_GIVING_PUBLIC_API_ALLOWED_METHODS = ["GET", "HEAD"] as const;

function hasLocalePrefix(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment === "en" || segment === "zh";
}

function getLocaleFromPathname(pathname: string): "en" | "zh" | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "en" || segment === "zh") {
    return segment;
  }
  return null;
}

function createGoneResponse() {
  const response = new NextResponse("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
  response.headers.set("X-Robots-Tag", NOINDEX_VALUE);
  return response;
}

function createMethodNotAllowedResponse(allowedMethods: readonly string[]) {
  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: {
      "Allow": allowedMethods.join(", "),
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function isDailyGivingPublicApiRequest(pathname: string): boolean {
  return DAILY_GIVING_PUBLIC_API_PATH_RE.test(pathname);
}

function isDailyGivingPublicApiMethodAllowed(method: string): boolean {
  const normalized = method.toUpperCase();
  return DAILY_GIVING_PUBLIC_API_ALLOWED_METHODS.includes(
    normalized as (typeof DAILY_GIVING_PUBLIC_API_ALLOWED_METHODS)[number],
  );
}

function resolveTypesRedirectPath(pathname: string, fallbackLocale: "en" | "zh"): string | null {
  const strippedPath = stripLocalePrefix(pathname);
  const match = strippedPath.match(/^\/types(?:\/([^/]+))?\/?$/i);

  if (!match) {
    return null;
  }

  const locale = getLocaleFromPathname(pathname) ?? fallbackLocale;
  const rawCode = String(match[1] ?? "").trim();
  const targetPath = MBTI_TYPE_RE.test(rawCode)
    ? `/personality/${buildDefaultPublicPersonalitySlug(rawCode)}`
    : "/personality";

  return localizedPath(targetPath, locale);
}

function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  return /\/[^/]+\.[a-zA-Z0-9]+$/.test(pathname);
}

function buildFallbackAnonId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateAnonId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return buildFallbackAnonId();
}

function normalizeCookieAnonId(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  return ANON_ID_PATTERN.test(normalized) ? normalized : "";
}

function shouldAttachAnonIdentity(strippedPath: string): boolean {
  if (!strippedPath || strippedPath === "/") {
    return false;
  }

  return (
    /^\/tests\/[^/]+\/?$/i.test(strippedPath)
    || /^\/test\/[^/]+\/?$/i.test(strippedPath)
    || /^\/quiz\/[^/]+\/?$/i.test(strippedPath)
    || /^\/tests\/[^/]+\/take(?:\/|$)/i.test(strippedPath)
    || /^\/test\/[^/]+\/take(?:\/|$)/i.test(strippedPath)
    || /^\/quiz\/[^/]+\/take(?:\/|$)/i.test(strippedPath)
    || /^\/attempts(?:\/|$)/i.test(strippedPath)
    || /^\/result(?:\/|$)/i.test(strippedPath)
    || /^\/share(?:\/|$)/i.test(strippedPath)
    || /^\/compare(?:\/|$)/i.test(strippedPath)
    || /^\/orders(?:\/|$)/i.test(strippedPath)
    || /^\/api\/v0\.3\/attempts(?:\/|$)/i.test(strippedPath)
  );
}

function isResultPageSnapshotPrintRequest(pathname: string, surface: string | null | undefined): boolean {
  if (surface !== RESULT_PAGE_SNAPSHOT_SURFACE) {
    return false;
  }

  const strippedPath = stripLocalePrefix(pathname);
  return /^\/result\/[^/]+\/print\/?$/i.test(strippedPath);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const strippedPath = stripLocalePrefix(pathname);
  const isStagingHost = isStagingRequestHost(request.headers.get("host") ?? request.nextUrl.host);

  if (isDailyGivingPublicApiRequest(pathname) && !isDailyGivingPublicApiMethodAllowed(request.method)) {
    return createMethodNotAllowedResponse(DAILY_GIVING_PUBLIC_API_ALLOWED_METHODS);
  }

  if (isStagingHost && pathname === "/robots.txt") {
    return createStagingRobotsResponse();
  }

  if (isStagingHost && isStagingMachineDiscoverabilityPath(pathname)) {
    return createStagingDiscoverabilityGoneResponse(pathname.includes("sitemap") ? "sitemap" : "llms");
  }

  if (isStaticAsset(pathname)) {
    const response = NextResponse.next();

    return isStagingHost ? withStagingNoindexHeader(response) : response;
  }

  if (pathname === "/zh" || pathname === "/zh/") {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    const response = NextResponse.redirect(target, 308);

    return isStagingHost ? withStagingNoindexHeader(response) : response;
  }

  const preferredLocale = resolvePreferredLocale({
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null,
    acceptLanguage: request.headers.get("accept-language"),
    countryCode: resolveCountryCodeFromHeaders(request.headers),
  });
  const typesRedirectPath = resolveTypesRedirectPath(pathname, preferredLocale);

  if (typesRedirectPath) {
    const target = request.nextUrl.clone();
    target.pathname = typesRedirectPath;
    const response = NextResponse.redirect(target, 308);

    return isStagingHost ? withStagingNoindexHeader(response) : response;
  }

  if (FORCE_GONE_PATTERNS.some((pattern) => pattern.test(strippedPath))) {
    const response = createGoneResponse();

    return isStagingHost ? withStagingNoindexHeader(response) : response;
  }

  if (
    !hasLocalePrefix(pathname) &&
    LOCALE_REDIRECT_PREFIXES.some((prefix) => new RegExp(`^/${prefix}(/|$)`, "i").test(strippedPath))
  ) {
    const target = request.nextUrl.clone();
    target.pathname = localizedPath(strippedPath, preferredLocale);
    const response = NextResponse.redirect(target, 308);

    return isStagingHost ? withStagingNoindexHeader(response) : response;
  }

  if (resolveLegacyPathMode() === "gone" && isLegacyPath(strippedPath)) {
    const response = createGoneResponse();

    return isStagingHost ? withStagingNoindexHeader(response) : response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-anon-id");
  requestHeaders.delete(PRIVATE_ANALYTICS_SUPPRESSION_HEADER);
  requestHeaders.delete(RESULT_PAGE_SNAPSHOT_SHELL_HEADER);
  if (isResultPageSnapshotPrintRequest(pathname, request.nextUrl.searchParams.get("surface"))) {
    requestHeaders.set(RESULT_PAGE_SNAPSHOT_SHELL_HEADER, "true");
  }
  const analyticsSuppression = getBrowserAnalyticsSuppressionDecision({
    pathname,
    search: request.nextUrl.search,
  });
  const suppressAnalyticsBootstrap = analyticsSuppression.suppressed;
  const hardenPrivateResponse = isPrivateAnalyticsSuppressedPath(pathname) || shouldNoindex(strippedPath, null);

  if (suppressAnalyticsBootstrap) {
    requestHeaders.set(PRIVATE_ANALYTICS_SUPPRESSION_HEADER, "true");
  }

  const cookieAnonId = normalizeCookieAnonId(request.cookies.get(ANON_COOKIE_NAME)?.value);
  const shouldAttachAnon = shouldAttachAnonIdentity(strippedPath);
  const resolvedAnonId = shouldAttachAnon ? (cookieAnonId || generateAnonId()) : "";

  if (shouldAttachAnon && resolvedAnonId) {
    requestHeaders.set("x-anon-id", resolvedAnonId);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (shouldAttachAnon && resolvedAnonId && (!cookieAnonId || cookieAnonId !== resolvedAnonId)) {
    response.cookies.set({
      name: ANON_COOKIE_NAME,
      value: resolvedAnonId,
      path: "/",
      maxAge: ANON_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:",
    });
  }

  if (isStagingHost) {
    response.headers.set("X-Robots-Tag", NOINDEX_VALUE);
  }

  if (hardenPrivateResponse) {
    response.headers.set("X-Robots-Tag", PRIVATE_NOINDEX_VALUE);
    response.headers.set("Cache-Control", PRIVATE_CACHE_CONTROL_VALUE);
    response.headers.set("Referrer-Policy", "no-referrer");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
