import type { Metadata } from "next";
import type { SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFAQPageJsonLd,
  buildItemPageJsonLd,
  buildWebPageJsonLd,
  type BreadcrumbItem,
  type FAQItem,
} from "@/lib/seo/generateSchema";
import { normalizeBreadcrumbItems } from "@/lib/navigation/publicLinking";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export type SeoPageType = "guide" | "entity" | "hub" | "method" | "data" | "test";

type LocaleCode = "en" | "zh";

type AlternatesByLocale = {
  en: string;
  zh: string;
  xDefault?: string;
};

type BuildSeoMetadataInput = {
  pageType: SeoPageType;
  locale: LocaleCode;
  pathname: string;
  title: string;
  description: string;
  imagePath?: string;
  seoSurface?: SeoSurfaceViewModel | null;
  noindex?: boolean;
  alternatesByLocale: AlternatesByLocale;
  canonical?: string | null;
  metaAlternates?: {
    en?: string | null;
    "zh-CN"?: string | null;
  };
  ogType?: "article" | "website";
};

type BuildStructuredDataBundleInput = {
  idPrefix: string;
  pageType: SeoPageType;
  locale: LocaleCode;
  canonicalPath: string;
  title: string;
  description: string;
  primary?: unknown;
  breadcrumbItems?: BreadcrumbItem[];
  faqItems?: FAQItem[];
  articleMeta?: {
    datePublished: string;
    dateModified: string;
    authorName: string;
  };
  mainEntity?: Record<string, unknown>;
  extraNodes?: Array<{
    idSuffix: string;
    data: unknown;
  }>;
};

export type StructuredDataNode = {
  id: string;
  data: unknown;
};

function resolvePrimarySchema(input: BuildStructuredDataBundleInput): unknown {
  if (input.primary) {
    return input.primary;
  }

  switch (input.pageType) {
    case "guide":
    case "method":
    case "data":
      return buildArticleJsonLd({
        path: input.canonicalPath,
        title: input.title,
        description: input.description,
        locale: input.locale,
        datePublished: input.articleMeta?.datePublished ?? new Date().toISOString(),
        dateModified: input.articleMeta?.dateModified ?? new Date().toISOString(),
        authorName: input.articleMeta?.authorName ?? "FermatMind Editorial",
      });
    case "entity":
      return buildItemPageJsonLd({
        path: input.canonicalPath,
        title: input.title,
        description: input.description,
        locale: input.locale,
        mainEntity: input.mainEntity,
      });
    case "hub":
      return buildCollectionPageJsonLd({
        path: input.canonicalPath,
        title: input.title,
        description: input.description,
        locale: input.locale,
      });
    case "test":
    default:
      return buildWebPageJsonLd({
        path: input.canonicalPath,
        title: input.title,
        description: input.description,
        locale: input.locale,
      });
  }
}

export function buildSeoMetadata(input: BuildSeoMetadataInput): Metadata {
  const metadata = buildPageMetadata({
    locale: input.locale,
    pathname: input.pathname,
    title: input.title,
    description: input.description,
    imagePath: input.imagePath,
    seoSurface: input.seoSurface,
    noindex: input.noindex,
    alternatesByLocale: input.alternatesByLocale,
  });

  const canonical = input.canonical ?? input.seoSurface?.canonicalUrl ?? canonicalUrl(input.pathname);
  const ogImage = input.seoSurface?.og.image ?? input.seoSurface?.twitter.image ?? input.imagePath ?? null;
  const twitterImages = normalizeTwitterImages(
    input.seoSurface?.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
      languages: {
        ...metadata.alternates?.languages,
        en: input.metaAlternates?.en ?? metadata.alternates?.languages?.en,
        "zh-CN": input.metaAlternates?.["zh-CN"] ?? metadata.alternates?.languages?.["zh-CN"],
      },
    },
    openGraph: {
      ...metadata.openGraph,
      type: input.ogType ?? (input.pageType === "guide" || input.pageType === "method" || input.pageType === "data" ? "article" : "website"),
      url: input.seoSurface?.og.url ?? canonical,
      title: input.seoSurface?.og.title || input.title,
      description: input.seoSurface?.og.description || input.description,
      images: ogImage ? [ogImage] : metadata.openGraph?.images,
      locale: input.locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      ...metadata.twitter,
      card: resolveTwitterCard(input.seoSurface?.twitter.card),
      title: input.seoSurface?.twitter.title || input.title,
      description: input.seoSurface?.twitter.description || input.description,
      images: twitterImages,
    },
  };
}

export function buildStructuredDataBundle(input: BuildStructuredDataBundleInput): StructuredDataNode[] {
  const normalizedBreadcrumbItems =
    input.breadcrumbItems && input.breadcrumbItems.length > 0
      ? normalizeBreadcrumbItems(input.breadcrumbItems, input.locale)
      : undefined;

  const nodes: StructuredDataNode[] = [
    {
      id: `${input.idPrefix}-primary`,
      data: resolvePrimarySchema(input),
    },
  ];

  if (normalizedBreadcrumbItems && normalizedBreadcrumbItems.length > 0) {
    nodes.push({
      id: `${input.idPrefix}-breadcrumb`,
      data: buildBreadcrumbJsonLd(normalizedBreadcrumbItems),
    });
  }

  if (input.faqItems && input.faqItems.length > 0) {
    nodes.push({
      id: `${input.idPrefix}-faq`,
      data: buildFAQPageJsonLd(input.faqItems),
    });
  }

  if (input.extraNodes && input.extraNodes.length > 0) {
    for (const extraNode of input.extraNodes) {
      nodes.push({
        id: `${input.idPrefix}-${extraNode.idSuffix}`,
        data: extraNode.data,
      });
    }
  }

  return nodes;
}
