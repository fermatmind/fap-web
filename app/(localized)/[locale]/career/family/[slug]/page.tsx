import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerFamilyHubPage } from "@/components/career/CareerFamilyHubPage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { adaptCareerFamilyHub } from "@/lib/career/adapters/adaptCareerFamilyHub";
import type { CareerFamilyHubAdapter } from "@/lib/career/adapters/types";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

async function loadCareerFamilyHub(
  locale: "en" | "zh",
  slug: string
): Promise<CareerFamilyHubAdapter | null> {
  const payload = await fetchCareerFamilyHub({ locale, slug });

  return adaptCareerFamilyHub({ locale, payload });
}

function isCareerFamilyHubDiscoverable(hub: CareerFamilyHubAdapter): boolean {
  return hub.counts.visibleChildrenCount > 0;
}

function buildFamilyDescription(locale: "en" | "zh", familyTitle: string): string {
  return locale === "zh"
    ? `${familyTitle}职业家族的后端 authority 页面。`
    : `Backend authority page for the ${familyTitle} career family.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const hub = await loadCareerFamilyHub(locale, slug);

  if (!hub) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = buildCareerFamilyFrontendUrl(locale, hub.family.canonicalSlug);

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: `${hub.family.title} | FermatMind`,
    description: buildFamilyDescription(locale, hub.family.title),
    noindex: !isCareerFamilyHubDiscoverable(hub),
    alternatesByLocale: {
      en: buildCareerFamilyFrontendUrl("en", hub.family.canonicalSlug),
      zh: buildCareerFamilyFrontendUrl("zh", hub.family.canonicalSlug),
      xDefault: "/",
    },
  });
}

export default async function CareerFamilyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const hub = await loadCareerFamilyHub(locale, slug);

  if (!hub) {
    notFound();
  }

  return (
    <>
      {hub.structuredData.collectionPage ? (
        <JsonLd id="career-family-collection-jsonld" data={hub.structuredData.collectionPage} />
      ) : null}
      {hub.structuredData.itemList ? (
        <JsonLd id="career-family-item-list-jsonld" data={hub.structuredData.itemList} />
      ) : null}
      {hub.structuredData.breadcrumbList ? (
        <JsonLd id="career-family-breadcrumb-jsonld" data={hub.structuredData.breadcrumbList} />
      ) : null}
      <Container as="main" className="py-10">
        <CareerFamilyHubPage locale={locale} hub={hub} />
      </Container>
    </>
  );
}
