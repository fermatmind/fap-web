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

const NOINDEX_VALUE = "noindex, nofollow, noarchive";
const ANON_COOKIE_NAME = "fap_anonymous_id_v1";
const ANON_COOKIE_MAX_AGE_SECONDS = 31536000;
const ANON_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const FORCE_GONE_PATTERNS = [/^\/professions(\/|$)/i];
const LOCALE_REDIRECT_PREFIXES = ["articles", "career", "topics", "personality"] as const;
const MBTI_TYPE_RE = /^[ie][ns][ft][jp]$/i;

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
    /^\/tests\/[^/]+\/take(?:\/|$)/i.test(strippedPath)
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

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const strippedPath = stripLocalePrefix(pathname);

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/zh" || pathname === "/zh/") {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    return NextResponse.redirect(target, 308);
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
    return NextResponse.redirect(target, 308);
  }

  if (FORCE_GONE_PATTERNS.some((pattern) => pattern.test(strippedPath))) {
    return createGoneResponse();
  }

  if (
    !hasLocalePrefix(pathname) &&
    LOCALE_REDIRECT_PREFIXES.some((prefix) => new RegExp(`^/${prefix}(/|$)`, "i").test(strippedPath))
  ) {
    const target = request.nextUrl.clone();
    target.pathname = localizedPath(strippedPath, preferredLocale);
    return NextResponse.redirect(target, 308);
  }

  if (resolveLegacyPathMode() === "gone" && isLegacyPath(strippedPath)) {
    return createGoneResponse();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-anon-id");
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

  if (shouldNoindex(strippedPath, null)) {
    response.headers.set("X-Robots-Tag", NOINDEX_VALUE);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-en.xml|sitemap-zh.xml|llms.txt|llms-full.txt).*)",
  ],
};
