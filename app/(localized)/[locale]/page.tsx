import type { Metadata } from "next";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const pathname = isZh ? "/zh" : "/en";
  const copy = getHomePageContent(locale);

  return buildPageMetadata({
    locale,
    pathname,
    title: copy.seo.title,
    description: copy.seo.description,
    imagePath: "/share/mbti_wide_1200x630.png",
    alternatesByLocale: {
      en: "/en",
      zh: "/zh",
      xDefault: "/",
    },
  });
}

function buildHomeJsonLd(locale: Locale) {
  const copy = getHomePageContent(locale);
  const path = locale === "zh" ? "/zh" : "/en";

  return {
    webPage: buildWebPageJsonLd({
      path,
      title: copy.seo.title,
      description: copy.seo.description,
      locale,
    }),
    quickStart: buildItemListJsonLd({
      path,
      idSuffix: "quickstart-itemlist",
      title: copy.seo.quickStartListTitle,
      description: copy.seo.quickStartListDescription,
      locale,
      items: copy.quickStart.items.map((item) => ({
        name: item.title,
        path: item.href,
        description: item.description,
      })),
    }),
    families: buildItemListJsonLd({
      path,
      idSuffix: "family-itemlist",
      title: copy.seo.familyListTitle,
      description: copy.seo.familyListDescription,
      locale,
      items: copy.families.items.map((item) => ({
        name: item.title,
        path: item.exploreHref,
        description: item.description,
      })),
    }),
    organization: buildOrganizationJsonLd({
      path,
      locale,
      name: locale === "zh" ? "FermatMind / 费马测试" : "FermatMind",
      description: copy.seo.organizationDescription,
    }),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const jsonLd = buildHomeJsonLd(locale);

  return (
    <main className="fm-homepage">
      <AnalyticsPageViewTracker eventName="view_landing" />
      <JsonLd id={`home-webpage-${locale}`} data={jsonLd.webPage} />
      <JsonLd id={`home-quickstart-${locale}`} data={jsonLd.quickStart} />
      <JsonLd id={`home-families-${locale}`} data={jsonLd.families} />
      <JsonLd id={`home-organization-${locale}`} data={jsonLd.organization} />
      <HomePageExperience locale={locale} />
    </main>
  );
}
