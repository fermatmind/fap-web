import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEnneagramPublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import {
  buildEnneagramPublicContentPath,
  resolveEnneagramPublicRouteEntry,
  type EnneagramPublicRouteEntry,
} from "@/lib/personality/enneagramPublicRoutes";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type HubPageParams = {
  locale: string;
};

function localizedEnneagramLabel(locale: Locale): string {
  return locale === "zh" ? "九型人格" : "Enneagram";
}

function robotsAllowsFollow(robots: string): boolean {
  return !robots.toLowerCase().split(",").map((part) => part.trim()).includes("nofollow");
}

function buildFallbackMetadata(locale: Locale, entry: EnneagramPublicRouteEntry | null): Metadata {
  const fallbackPath = entry ? buildEnneagramPublicContentPath(locale, entry) : `/${locale}/personality/enneagram`;
  const alternateEntry = entry ?? { entityType: "hub" as const, code: "enneagram", routeSlug: "", pathSuffix: "" };

  return buildPageMetadata({
    locale,
    pathname: fallbackPath,
    title: localizedEnneagramLabel(locale),
    description: localizedEnneagramLabel(locale),
    noindex: true,
    noindexFollow: true,
    alternatesByLocale: {
      en: buildEnneagramPublicContentPath("en", alternateEntry),
      zh: buildEnneagramPublicContentPath("zh", alternateEntry),
      xDefault: buildEnneagramPublicContentPath("en", alternateEntry),
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<HubPageParams>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveEnneagramPublicRouteEntry(undefined);
  if (!entry) {
    return buildFallbackMetadata(locale, null);
  }

  const asset = await getEnneagramPublicContentAsset(locale, entry);
  if (!asset) {
    return buildFallbackMetadata(locale, entry);
  }

  const pathname = buildEnneagramPublicContentPath(locale, entry);
  return buildPageMetadata({
    locale,
    pathname,
    canonicalCandidate: asset.canonicalPath,
    title: asset.seo.title,
    description: asset.seo.description,
    imagePath: asset.media.imageUrl ?? undefined,
    noindex: !asset.indexEligible || asset.robots.includes("noindex"),
    noindexFollow: robotsAllowsFollow(asset.robots),
    explicitIndexGate: {
      indexEligible: asset.indexEligible,
      indexState: asset.robots.includes("noindex") ? "noindex" : null,
    },
    alternatesByLocale: {
      en: asset.hreflang.en ?? buildEnneagramPublicContentPath("en", entry),
      zh: asset.hreflang["zh-CN"] ?? buildEnneagramPublicContentPath("zh", entry),
      xDefault: asset.hreflang.en ?? buildEnneagramPublicContentPath("en", entry),
    },
  });
}

export default async function EnneagramHubPage({
  params,
}: {
  params: Promise<HubPageParams>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveEnneagramPublicRouteEntry(undefined);
  if (!entry) {
    notFound();
  }

  const asset = await getEnneagramPublicContentAsset(locale, entry);
  if (!asset) {
    notFound();
  }

  const pathname = buildEnneagramPublicContentPath(locale, entry);
  const personalityHref = `/${locale}/personality`;
  const hubHref = buildEnneagramPublicContentPath(locale, { entityType: "hub", code: "enneagram", routeSlug: "", pathSuffix: "" });
  const breadcrumbItems = [
    { name: locale === "zh" ? "人格" : "Personality", path: personalityHref },
    { name: localizedEnneagramLabel(locale), path: hubHref },
  ];
  const visibleFaq = asset.faq.filter((item) => item.question && item.answer);
  const pageJsonLd = asset.schemaRuntimeEligible
    ? buildCollectionPageJsonLd({
        path: pathname,
        title: asset.title,
        description: asset.seo.description || asset.summary,
        locale,
      })
    : null;

  return (
    <>
      {pageJsonLd ? <JsonLd id="enneagram-hub-page-jsonld" data={pageJsonLd} /> : null}
      {asset.schemaRuntimeEligible ? (
        <JsonLd id="enneagram-hub-breadcrumb-jsonld" data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      ) : null}
      {visibleFaq.length > 0 ? (
        <JsonLd id="enneagram-hub-faq-jsonld" data={buildFAQPageJsonLd(visibleFaq)} />
      ) : null}
      <div className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)] px-5 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb
            items={[
              { label: locale === "zh" ? "人格" : "Personality", href: personalityHref },
              { label: localizedEnneagramLabel(locale) },
            ]}
          />
        </div>
      </div>
      <PublicContentAssetRenderer asset={asset} locale={locale} />
    </>
  );
}
