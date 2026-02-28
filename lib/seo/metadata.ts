import type { Metadata } from "next";
import { getSiteUrlOrThrow } from "@/lib/site";
import { shouldNoindex } from "@/lib/seo/indexingPolicy";

type BuildPageMetadataInput = {
  locale: "en" | "zh";
  pathname: string;
  title: string;
  description: string;
  imagePath?: string;
  noindex?: boolean;
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

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const canonical = toAbsoluteUrl(input.pathname);
  const xDefaultPath = input.alternatesByLocale.xDefault ?? "/";
  const noindex = typeof input.noindex === "boolean" ? input.noindex : shouldNoindex(input.pathname, input.locale);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: {
        en: toAbsoluteUrl(input.alternatesByLocale.en),
        "zh-CN": toAbsoluteUrl(input.alternatesByLocale.zh),
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
      type: "website",
      title: input.title,
      description: input.description,
      url: canonical,
      locale: input.locale === "zh" ? "zh_CN" : "en_US",
      images: input.imagePath ? [toAbsoluteUrl(input.imagePath)] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.imagePath ? [toAbsoluteUrl(input.imagePath)] : undefined,
    },
  };
}
