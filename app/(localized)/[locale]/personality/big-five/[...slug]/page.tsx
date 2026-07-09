import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBigFivePublicContentAsset,
  type PersonalityPublicContentAsset,
} from "@/lib/cms/personality-public-content-assets";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import {
  buildBigFivePublicContentPath,
  resolveBigFivePublicRouteEntry,
  type BigFivePublicRouteEntry,
} from "@/lib/personality/bigFivePublicRoutes";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type DimensionPageParams = {
  locale: string;
  slug: string[];
};

function localizedBigFiveLabel(locale: Locale): string {
  return locale === "zh" ? "大五人格" : "Big Five";
}

function buildFallbackMetadata(locale: Locale, entry: BigFivePublicRouteEntry | null): Metadata {
  const fallbackPath = entry ? buildBigFivePublicContentPath(locale, entry) : `/${locale}/personality/big-five`;
  const alternateEntry = entry ?? { entityType: "hub" as const, code: "big-five", routeSlug: "", pathSuffix: "" };

  return buildPageMetadata({
    locale,
    pathname: fallbackPath,
    title: localizedBigFiveLabel(locale),
    description: localizedBigFiveLabel(locale),
    noindex: true,
    noindexFollow: true,
    alternatesByLocale: {
      en: buildBigFivePublicContentPath("en", alternateEntry),
      zh: buildBigFivePublicContentPath("zh", alternateEntry),
      xDefault: buildBigFivePublicContentPath("en", alternateEntry),
    },
  });
}

function robotsAllowsFollow(robots: string): boolean {
  return !robots.toLowerCase().split(",").map((part) => part.trim()).includes("nofollow");
}

function robotsAllowsIndex(asset: PersonalityPublicContentAsset): boolean {
  const robots = asset.robots.toLowerCase().split(",").map((part) => part.trim());

  return asset.indexEligible === true && !robots.includes("noindex");
}

function alternatePath(assetPath: string | null | undefined, fallback: string): string {
  return assetPath && assetPath.startsWith("/") ? assetPath : fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DimensionPageParams>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveBigFivePublicRouteEntry(slug);
  if (!entry) {
    return buildFallbackMetadata(locale, null);
  }

  const asset = await getBigFivePublicContentAsset(locale, entry);
  if (!asset) {
    return buildFallbackMetadata(locale, entry);
  }

  const pathname = buildBigFivePublicContentPath(locale, entry);
  const shouldIndex = robotsAllowsIndex(asset);
  return buildPageMetadata({
    locale,
    pathname,
    canonicalCandidate: asset.canonicalPath,
    title: asset.seo.title,
    description: asset.seo.description,
    imagePath: asset.media.imageUrl ?? undefined,
    noindex: !shouldIndex,
    noindexFollow: robotsAllowsFollow(asset.robots),
    explicitIndexGate: {
      indexEligible: asset.indexEligible,
      indexState: shouldIndex ? "indexed" : "noindex",
    },
    alternatesByLocale: {
      en: alternatePath(asset.hreflang.en, buildBigFivePublicContentPath("en", entry)),
      zh: alternatePath(asset.hreflang["zh-CN"], buildBigFivePublicContentPath("zh", entry)),
      xDefault: alternatePath(asset.hreflang.en, buildBigFivePublicContentPath("en", entry)),
    },
  });
}

export default async function BigFiveDimensionPage({
  params,
}: {
  params: Promise<DimensionPageParams>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveBigFivePublicRouteEntry(slug);
  if (!entry) {
    notFound();
  }

  const asset = await getBigFivePublicContentAsset(locale, entry);
  if (!asset) {
    notFound();
  }

  const pathname = buildBigFivePublicContentPath(locale, entry);
  const personalityHref = `/${locale}/personality`;
  const hubHref = buildBigFivePublicContentPath(locale, { entityType: "hub", code: "big-five", routeSlug: "", pathSuffix: "" });
  const breadcrumbItems = [
    { name: locale === "zh" ? "人格" : "Personality", path: personalityHref },
    { name: localizedBigFiveLabel(locale), path: hubHref },
    { name: asset.title, path: pathname },
  ];
  const visibleFaq = asset.faq.filter((item) => item.question && item.answer);
  const pageJsonLd = asset.schemaRuntimeEligible
    ? asset.entityType === "hub" || asset.entityType === "facet_hub"
      ? null
      : buildWebPageJsonLd({
          path: pathname,
          title: asset.title,
          description: asset.seo.description || asset.summary,
          locale,
        })
    : null;

  return (
    <>
      {pageJsonLd ? <JsonLd id="big-five-dimension-page-jsonld" data={pageJsonLd} /> : null}
      {asset.schemaRuntimeEligible ? (
        <JsonLd id="big-five-dimension-breadcrumb-jsonld" data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      ) : null}
      {asset.schemaRuntimeEligible && visibleFaq.length > 0 ? (
        <JsonLd id="big-five-dimension-faq-jsonld" data={buildFAQPageJsonLd(visibleFaq)} />
      ) : null}
      <div className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)] px-5 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb
            items={[
              { label: locale === "zh" ? "人格" : "Personality", href: personalityHref },
              { label: localizedBigFiveLabel(locale), href: hubHref },
              { label: asset.title },
            ]}
          />
        </div>
      </div>
      <PublicContentAssetRenderer asset={asset} locale={locale} />
    </>
  );
}
