import type { Metadata } from "next";
import { getSiteUrlOrThrow } from "@/lib/site";
import { shouldNoindex, type ExplicitIndexGate } from "@/lib/seo/indexingPolicy";
import type { SeoSurfaceViewModel } from "@/lib/seo/seoSurface";

export type TwitterImages = NonNullable<NonNullable<Metadata["twitter"]>["images"]>;
type TwitterImageItem = TwitterImages extends Array<infer Item> ? Item : never;

type BuildPageMetadataInput = {
  locale: "en" | "zh";
  pathname: string;
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

function toAbsoluteUrl(pathname: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const siteUrl = getSiteUrlOrThrow();
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${normalized}`;
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
  const canonical = toAbsoluteUrl(input.seoSurface?.canonicalUrl || input.pathname);
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
