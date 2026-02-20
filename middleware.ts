import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { stripLocalePrefix } from "@/lib/i18n/locales";

const NOINDEX_VALUE = "noindex, nofollow, noarchive";
const ANON_COOKIE_NAME = "fap_anonymous_id_v1";
const ANON_COOKIE_MAX_AGE_SECONDS = 31536000;

function isSensitivePath(pathname: string): boolean {
  if (pathname.startsWith("/result/")) return true;
  if (pathname.startsWith("/share/")) return true;
  if (pathname.startsWith("/orders/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/og/")) return true;

  const isTestsTake = pathname.startsWith("/tests/") && pathname.includes("/take");
  const isLegacyTestTake = pathname.startsWith("/test/") && pathname.includes("/take");

  return isTestsTake || isLegacyTestTake;
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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const strippedPath = stripLocalePrefix(pathname);

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
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

  if (isSensitivePath(strippedPath)) {
    response.headers.set("X-Robots-Tag", NOINDEX_VALUE);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-en.xml|sitemap-zh.xml).*)"],
};
