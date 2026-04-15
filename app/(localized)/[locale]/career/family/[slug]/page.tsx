import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerFamilyHubPage } from "@/components/career/CareerFamilyHubPage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { adaptCareerFamilyHub } from "@/lib/career/adapters/adaptCareerFamilyHub";
import type { CareerFamilyHubAdapter } from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { buildCareerFamilyFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

async function loadCareerFamilyHub(
  locale: "en" | "zh",
  slug: string
): Promise<CareerFamilyHubAdapter | null> {
  const payload = await fetchCareerFamilyHub({ locale, slug });

  return adaptCareerFamilyHub({ locale, payload });
}

function shouldNoindex(indexEligible: boolean | null, indexState: string | null): boolean {
  if (indexEligible === false) {
    return true;
  }

  const normalizedState = String(indexState ?? "")
    .trim()
    .toLowerCase();

  return normalizedState === "noindex" || normalizedState === "blocked" || normalizedState === "excluded";
}

function buildRobotsFromPolicy(
  robotsPolicy: string | null,
  fallbackNoindex: boolean
): NonNullable<Metadata["robots"]> {
  const tokens = new Set(
    String(robotsPolicy ?? "")
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)
  );

  const index = fallbackNoindex ? false : tokens.has("noindex") ? false : tokens.has("index") ? true : true;
  const follow = tokens.has("nofollow") ? false : tokens.has("follow") ? true : !fallbackNoindex;

  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
    },
  };
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

  const canonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    hub.seoContract.canonicalPath,
    buildCareerFamilyFrontendUrl(locale, hub.family.canonicalSlug)
  );
  const noindex = shouldNoindex(hub.seoContract.indexEligible, hub.seoContract.indexState);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: hub.seoContract.canonicalTitle ?? `${hub.family.title} | FermatMind`,
    description: buildFamilyDescription(locale, hub.family.title),
    explicitIndexGate: {
      indexEligible: hub.seoContract.indexEligible,
      indexState: hub.seoContract.indexState,
    },
    noindex,
    alternatesByLocale: {
      en: buildCareerFamilyFrontendUrl("en", hub.family.canonicalSlug),
      zh: buildCareerFamilyFrontendUrl("zh", hub.family.canonicalSlug),
      xDefault: "/",
    },
  });

  return {
    ...metadata,
    robots: buildRobotsFromPolicy(hub.seoContract.robotsPolicy, noindex),
  };
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

  const landingPath = localizedPath(`/career/family/${hub.family.canonicalSlug}`, locale);

  return (
    <>
      <AnalyticsPageViewTracker
        eventName={CAREER_TRACKING_EVENTS.familyHubView}
        properties={buildCareerAttributionPayload({
          locale,
          entrySurface: "career_family_hub",
          sourcePageType: "career_family_hub",
          targetAction: "view_family_hub",
          landingPath,
          routeFamily: "family_hub",
          subjectKind: "family_slug",
          subjectKey: hub.family.canonicalSlug,
          queryMode: "non_query",
        })}
      />
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
