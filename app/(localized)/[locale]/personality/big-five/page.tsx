import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import BigFiveHubContentScaffold from "@/components/personality/BigFiveHubContentScaffold";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  type PersonalityPublicContentAsset,
  withBigFiveVisibleAuthorityJsonLd,
} from "@/lib/cms/personality-public-content-assets";
import { getBigFivePublicContentAsset } from "@/lib/cms/personalityPublicAssetLoader";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import {
  buildBigFivePublicContentPath,
  resolveBigFivePublicRouteEntry,
  type BigFivePublicRouteEntry,
} from "@/lib/personality/bigFivePublicRoutes";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type HubPageParams = {
  locale: string;
};

type HubPageSearchParams = {
  layout_preview?: string;
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
  params: Promise<HubPageParams>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveBigFivePublicRouteEntry(undefined);
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

export default async function BigFiveHubPage({
  params,
  searchParams,
}: {
  params: Promise<HubPageParams>;
  searchParams: Promise<HubPageSearchParams>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveBigFivePublicRouteEntry(undefined);
  if (!entry) {
    notFound();
  }

  const asset = await getBigFivePublicContentAsset(locale, entry);
  if (!asset) {
    notFound();
  }

  const { layout_preview: layoutPreview } = await searchParams;
  const isPreviewMode = layoutPreview === "big-five-v2";

  const pathname = buildBigFivePublicContentPath(locale, entry);
  const personalityHref = `/${locale}/personality`;
  const hubHref = buildBigFivePublicContentPath(locale, {
    entityType: "hub",
    code: "big-five",
    routeSlug: "",
    pathSuffix: "",
  });
  const breadcrumbItems = [
    { name: locale === "zh" ? "人格" : "Personality", path: personalityHref },
    { name: localizedBigFiveLabel(locale), path: hubHref },
  ];
  const visibleFaq = asset.faq.filter((item) => item.question && item.answer);
  const pageJsonLd = asset.schemaRuntimeEligible
    ? withBigFiveVisibleAuthorityJsonLd(
        asset.entityType === "hub" || asset.entityType === "facet_hub"
          ? buildCollectionPageJsonLd({
              path: pathname,
              title: asset.title,
              description: asset.seo.description || asset.summary,
              locale,
            })
          : buildWebPageJsonLd({
              path: pathname,
              title: asset.title,
              description: asset.seo.description || asset.summary,
              locale,
            }),
        asset
      )
    : null;

  return (
    <>
      {pageJsonLd ? <JsonLd id="big-five-hub-page-jsonld" data={pageJsonLd} /> : null}
      {asset.schemaRuntimeEligible ? (
        <JsonLd id="big-five-hub-breadcrumb-jsonld" data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      ) : null}
      {asset.schemaRuntimeEligible && visibleFaq.length > 0 ? (
        <JsonLd id="big-five-hub-faq-jsonld" data={buildFAQPageJsonLd(visibleFaq)} />
      ) : null}
      <div className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)] px-5 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb
            items={[
              { label: locale === "zh" ? "人格" : "Personality", href: personalityHref },
              { label: localizedBigFiveLabel(locale) },
            ]}
          />
        </div>
      </div>
      {isPreviewMode ? (
        <BigFiveHubContentScaffold locale={locale} asset={asset} preview />
      ) : (
        <PublicContentAssetRenderer asset={asset} locale={locale} />
      )}
    </>
  );
}
