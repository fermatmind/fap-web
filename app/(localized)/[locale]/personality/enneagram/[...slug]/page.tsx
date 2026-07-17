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
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type SubPageParams = {
  locale: string;
  slug: string[];
};

function localizedEnneagramLabel(locale: Locale): string {
  return locale === "zh" ? "九型人格" : "Enneagram";
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

function robotsAllowsFollow(robots: string): boolean {
  return !robots.toLowerCase().split(",").map((part) => part.trim()).includes("nofollow");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<SubPageParams>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveEnneagramPublicRouteEntry(slug);
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

export default async function EnneagramSubPage({
  params,
}: {
  params: Promise<SubPageParams>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const entry = resolveEnneagramPublicRouteEntry(slug);
  if (!entry) {
    notFound();
  }

  const asset = await getEnneagramPublicContentAsset(locale, entry);
  if (!asset) {
    notFound();
  }

  const pathname = buildEnneagramPublicContentPath(locale, entry);
  const personalityHref = `/${locale}/personality`;
  const hubEntry = { entityType: "hub" as const, code: "enneagram", routeSlug: "", pathSuffix: "" };
  const hubHref = buildEnneagramPublicContentPath(locale, hubEntry);
  const breadcrumbItems = [
    { name: locale === "zh" ? "人格" : "Personality", path: personalityHref },
    { name: localizedEnneagramLabel(locale), path: hubHref },
    { name: asset.title, path: pathname },
  ];
  const visibleFaq = asset.faq.filter((item) => item.question && item.answer);
  const schemaEligible =
    hasBackendEnneagramMetadataAuthority(locale, entry, asset.canonicalPath, asset.hreflang) &&
    isEnneagramAuthoritySchemaEligible(asset);
  const pageJsonLd = schemaEligible
    ? withEnneagramVisibleAuthorityJsonLd(
        buildWebPageJsonLd({
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
      {pageJsonLd ? <JsonLd id="enneagram-sub-page-jsonld" data={pageJsonLd} /> : null}
      {schemaEligible ? (
        <JsonLd id="enneagram-sub-breadcrumb-jsonld" data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      ) : null}
      {schemaEligible && visibleFaq.length > 0 ? (
        <JsonLd id="enneagram-sub-faq-jsonld" data={buildFAQPageJsonLd(visibleFaq)} />
      ) : null}
      <div className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)] px-5 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb
            items={[
              { label: locale === "zh" ? "人格" : "Personality", href: personalityHref },
              { label: localizedEnneagramLabel(locale), href: hubHref },
              { label: asset.title },
            ]}
          />
        </div>
      </div>
      <PublicContentAssetRenderer asset={asset} locale={locale} />
    </>
  );
}
