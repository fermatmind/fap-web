import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  isEnneagramAuthoritySchemaEligible,
  withEnneagramVisibleAuthorityJsonLd,
} from "@/lib/cms/personality-public-content-assets";
import { getEnneagramPublicContentAsset } from "@/lib/cms/personalityPublicAssetLoader";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import {
  buildEnneagramPublicContentPath,
  hasBackendEnneagramMetadataAuthority,
  resolveEnneagramPublicRouteEntry,
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

function buildUnavailableMetadata(follow = true): Metadata {
  // Contract equivalent: noindex: true; canonical and hreflang are intentionally omitted.
  return {
    openGraph: null,
    twitter: null,
    robots: {
      index: false,
      follow,
      nocache: true,
      noarchive: true,
      googleBot: { index: false, follow, nocache: true, noarchive: true },
    },
  };
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
    return buildUnavailableMetadata();
  }

  const asset = await getEnneagramPublicContentAsset(locale, entry);
  if (!asset) {
    return buildUnavailableMetadata();
  }
  if (!hasBackendEnneagramMetadataAuthority(locale, entry, asset.canonicalPath, asset.hreflang)) {
    return buildUnavailableMetadata(robotsAllowsFollow(asset.robots));
  }

  const pathname = buildEnneagramPublicContentPath(locale, entry);
  return buildPageMetadata({
    locale,
    pathname,
    canonicalCandidate: asset.canonicalPath,
    title: asset.seo.title,
    description: asset.seo.description,
    noindex: !asset.indexEligible || asset.robots.includes("noindex"),
    noindexFollow: robotsAllowsFollow(asset.robots),
    explicitIndexGate: {
      indexEligible: asset.indexEligible,
      indexState: asset.robots.includes("noindex") ? "noindex" : null,
    },
    alternatesByLocale: {
      en: asset.hreflang.en!,
      zh: asset.hreflang["zh-CN"]!,
      xDefault: asset.hreflang.en!,
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
  const schemaEligible =
    hasBackendEnneagramMetadataAuthority(locale, entry, asset.canonicalPath, asset.hreflang) &&
    isEnneagramAuthoritySchemaEligible(asset);
  const pageJsonLd = asset.schemaRuntimeEligible && schemaEligible
    ? withEnneagramVisibleAuthorityJsonLd(
        buildCollectionPageJsonLd({
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
      {pageJsonLd ? <JsonLd id="enneagram-hub-page-jsonld" data={pageJsonLd} /> : null}
      {asset.schemaRuntimeEligible ? (
        schemaEligible ? (
          <JsonLd id="enneagram-hub-breadcrumb-jsonld" data={buildBreadcrumbJsonLd(breadcrumbItems)} />
        ) : null
      ) : null}
      {visibleFaq.length > 0 ? (
        schemaEligible ? (
          <JsonLd id="enneagram-hub-faq-jsonld" data={buildFAQPageJsonLd(visibleFaq)} />
        ) : null
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
