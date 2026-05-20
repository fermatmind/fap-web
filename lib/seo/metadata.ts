import type { Metadata } from "next";
import { getSiteUrlOrThrow } from "@/lib/site";
import { shouldNoindex, type ExplicitIndexGate } from "@/lib/seo/indexingPolicy";
import type { SeoSurfaceViewModel } from "@/lib/seo/seoSurface";

export type TwitterImages = NonNullable<NonNullable<Metadata["twitter"]>["images"]>;
type TwitterImageItem = TwitterImages extends Array<infer Item> ? Item : never;

export type CanonicalRouteFamily = "article_detail" | "research_detail" | "test_detail" | "generic";
export type CanonicalAuthorityStatus = "accepted" | "normalized" | "rejected" | "deferred";

export type CanonicalAuthorityDecision = {
  status: CanonicalAuthorityStatus;
  canonicalPathname: string;
  canonicalUrl: string;
  reason: string;
};

type BuildPageMetadataInput = {
  locale: "en" | "zh";
  pathname: string;
  canonicalPathname?: string;
  canonicalCandidate?: string | null;
  canonicalRouteFamily?: CanonicalRouteFamily;
  title: string;
  description: string;
  imagePath?: string;
  noindex?: boolean;
  seoSurface?: SeoSurfaceViewModel | null;
  explicitIndexGate?: ExplicitIndexGate | null;
  alternatesByLocale: {
    en: string;
    zh: string;
    xDefault?: string;
  };
};

const PRODUCTION_CANONICAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);

function toAbsoluteUrl(pathname: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const siteUrl = getSiteUrlOrThrow();
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${normalized}`;
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

function normalizeRoutePathname(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return normalizePathname(new URL(trimmed).pathname || "/");
    } catch {
      return normalizePathname(trimmed);
    }
  }

  return normalizePathname(trimmed);
}

function isAllowedCanonicalHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  if (PRODUCTION_CANONICAL_HOSTS.has(normalizedHostname)) {
    return true;
  }

  try {
    return new URL(getSiteUrlOrThrow()).hostname.toLowerCase() === normalizedHostname;
  } catch {
    return false;
  }
}

function routeLocalePrefix(locale: "en" | "zh"): string {
  return locale === "zh" ? "/zh" : "/en";
}

function isHomepagePath(pathname: string): boolean {
  return pathname === "/" || pathname === "/en" || pathname === "/zh";
}

function isPrivateCanonicalTarget(pathname: string): boolean {
  return [
    /^\/(?:en|zh)\/tests\/[^/]+\/take(?:\/|$)/,
    /^\/(?:en|zh)\/(?:take|result|results|orders|order|share|pay|checkout|account|profile|app)(?:\/|$)/,
    /^\/(?:take|result|results|orders|order|share|pay|checkout|account|profile|app)(?:\/|$)/,
  ].some((pattern) => pattern.test(pathname));
}

function parseCanonicalCandidate(value: string): { pathname: string; status: CanonicalAuthorityStatus } | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    try {
      const parsed = new URL(trimmed, "https://fermatmind.com");
      if (parsed.search || parsed.hash) {
        return null;
      }
    } catch {
      return null;
    }

    return { pathname: normalizePathname(trimmed), status: "normalized" };
  }

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    if (!isAllowedCanonicalHost(parsed.hostname)) {
      return null;
    }

    if (parsed.search || parsed.hash) {
      return null;
    }

    const status: CanonicalAuthorityStatus =
      parsed.origin === getSiteUrlOrThrow() ? "accepted" : "normalized";
    return { pathname: normalizePathname(parsed.pathname || "/"), status };
  } catch {
    return null;
  }
}

export function resolveCanonicalAuthority({
  candidate,
  expectedPathname,
  currentLocale,
  routeFamily = "generic",
}: {
  candidate?: string | null;
  expectedPathname: string;
  currentLocale: "en" | "zh";
  routeFamily?: CanonicalRouteFamily;
}): CanonicalAuthorityDecision {
  const expected = normalizeRoutePathname(expectedPathname);
  const detailRoute = routeFamily === "article_detail" || routeFamily === "research_detail" || routeFamily === "test_detail";
  const fallback = (status: CanonicalAuthorityStatus, reason: string): CanonicalAuthorityDecision => ({
    status,
    canonicalPathname: expected,
    canonicalUrl: toAbsoluteUrl(expected),
    reason,
  });

  const normalizedCandidate = String(candidate ?? "").trim();
  if (!normalizedCandidate) {
    return fallback("deferred", "no backend/CMS canonical candidate");
  }

  const parsed = parseCanonicalCandidate(normalizedCandidate);
  if (!parsed) {
    return fallback("rejected", "canonical candidate is not a safe same-host URL or relative path");
  }

  if (isPrivateCanonicalTarget(parsed.pathname)) {
    return fallback("rejected", "canonical candidate points to a private or noindex flow");
  }

  if (detailRoute && isHomepagePath(parsed.pathname)) {
    return fallback("rejected", "detail page canonical candidate points to homepage fallback");
  }

  if (!parsed.pathname.startsWith(`${routeLocalePrefix(currentLocale)}/`)) {
    return fallback("rejected", "canonical candidate locale does not match current route locale");
  }

  if (detailRoute && parsed.pathname !== expected) {
    return fallback("rejected", "detail page canonical candidate is not self-referential");
  }

  return {
    status: parsed.status,
    canonicalPathname: parsed.pathname,
    canonicalUrl: toAbsoluteUrl(parsed.pathname),
    reason:
      parsed.status === "accepted"
        ? "backend/CMS canonical candidate accepted"
        : "backend/CMS canonical candidate normalized to safe route path",
  };
}

export function resolveTwitterCard(
  value: string | null | undefined,
): "summary" | "summary_large_image" | "player" | "app" {
  if (value === "summary" || value === "player" || value === "app") {
    return value;
  }

  return "summary_large_image";
}

function isTwitterImageItem(value: unknown): value is TwitterImageItem {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (value instanceof URL) {
    return true;
  }

  return typeof value === "object" && value !== null;
}

export function normalizeTwitterImages(...candidates: unknown[]): TwitterImages | undefined {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (Array.isArray(candidate)) {
      const filtered = candidate.filter(isTwitterImageItem);
      if (filtered.length > 0) {
        return filtered as TwitterImages;
      }
      continue;
    }

    if (isTwitterImageItem(candidate)) {
      return [candidate] as TwitterImages;
    }
  }

  return undefined;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const canonicalDecision = resolveCanonicalAuthority({
    candidate: input.canonicalCandidate ?? input.seoSurface?.canonicalUrl,
    expectedPathname: input.canonicalPathname || input.pathname,
    currentLocale: input.locale,
    routeFamily: input.canonicalRouteFamily,
  });
  const canonical = canonicalDecision.canonicalUrl;
  const xDefaultPath = input.alternatesByLocale.xDefault ?? "/";
  const robotsPolicy = input.seoSurface?.robotsPolicy || "";
  const noindex =
    typeof input.noindex === "boolean"
      ? input.noindex
      : robotsPolicy
        ? robotsPolicy.toLowerCase().split(",").map((part) => part.trim()).includes("noindex")
        : shouldNoindex(input.pathname, input.locale, undefined, input.explicitIndexGate);
  const title = input.seoSurface?.title || input.title;
  const description = input.seoSurface?.description || input.description;
  const alternates = input.seoSurface?.alternates || {};
  const image = input.seoSurface?.og.image || input.seoSurface?.twitter.image || input.imagePath;
  const ogType = input.seoSurface?.og.type || "website";
  const twitterImages = normalizeTwitterImages(
    input.seoSurface?.twitter?.image,
    image ? toAbsoluteUrl(image) : undefined,
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: toAbsoluteUrl(alternates.en || input.alternatesByLocale.en),
        "zh-CN": toAbsoluteUrl(alternates["zh-CN"] || input.alternatesByLocale.zh),
        "x-default": toAbsoluteUrl(xDefaultPath),
      },
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          noarchive: true,
          googleBot: {
            index: false,
            follow: false,
            noarchive: true,
            nocache: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
    },
    openGraph: {
      type: ogType === "article" ? "article" : "website",
      title: input.seoSurface?.og.title || title,
      description: input.seoSurface?.og.description || description,
      url: input.seoSurface?.og.url || canonical,
      locale: input.locale === "zh" ? "zh_CN" : "en_US",
      images: image ? [toAbsoluteUrl(image)] : undefined,
    },
    twitter: {
      card: resolveTwitterCard(input.seoSurface?.twitter?.card),
      title: input.seoSurface?.twitter.title || title,
      description: input.seoSurface?.twitter.description || description,
      images: twitterImages,
    },
  };
}
