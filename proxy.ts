import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME, resolvePreferredLocale } from "@/lib/i18n/localeNegotiation";
import { localizedPath, stripLocalePrefix } from "@/lib/i18n/locales";
import { isLegacyPath, resolveLegacyPathMode } from "@/lib/legacyCompatibility";
import { shouldNoindex } from "@/lib/seo/indexingPolicy";

const NOINDEX_VALUE = "noindex, nofollow, noarchive";
const ANON_COOKIE_NAME = "fap_anonymous_id_v1";
const ANON_COOKIE_MAX_AGE_SECONDS = 31536000;
const FORCE_GONE_PATTERNS = [/^\/professions(\/|$)/i, /^\/types(\/|$)/i];
const LOCALE_REDIRECT_PREFIXES = ["articles", "career", "topics", "personality"] as const;

function hasLocalePrefix(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment === "en" || segment === "zh";
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

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const strippedPath = stripLocalePrefix(pathname);

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (FORCE_GONE_PATTERNS.some((pattern) => pattern.test(strippedPath))) {
    return createGoneResponse();
  }

  if (
    !hasLocalePrefix(pathname) &&
    LOCALE_REDIRECT_PREFIXES.some((prefix) => new RegExp(`^/${prefix}(/|$)`, "i").test(strippedPath))
  ) {
    const preferredLocale = resolvePreferredLocale({
      cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null,
      acceptLanguage: request.headers.get("accept-language"),
    });
    const target = request.nextUrl.clone();
    target.pathname = localizedPath(strippedPath, preferredLocale);
    return NextResponse.redirect(target, 308);
  }

  if (resolveLegacyPathMode() === "gone" && isLegacyPath(strippedPath)) {
    return createGoneResponse();
  }

  const requestHeaders = new Headers(request.headers);
  const requestAnonHeader = requestHeaders.get("x-anon-id")?.trim() ?? "";
  const cookieAnonId = request.cookies.get(ANON_COOKIE_NAME)?.value?.trim() ?? "";
  const resolvedAnonId = cookieAnonId || requestAnonHeader || generateAnonId();

  if (!requestAnonHeader && resolvedAnonId) {
    requestHeaders.set("x-anon-id", resolvedAnonId);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!cookieAnonId || cookieAnonId !== resolvedAnonId) {
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
