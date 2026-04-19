import type { Metadata } from "next";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getCmsArticles } from "@/lib/cms/articles";
import { DEFAULT_SHARE_IMAGE_URL } from "@/lib/cms/media";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const pathname = isZh ? "/" : "/en";
  const copy = await getHomePageContent(locale);

  return buildPageMetadata({
    locale,
    pathname: isZh ? "/zh" : pathname,
    canonicalPathname: pathname,
    title: copy.seo.title,
    description: copy.seo.description,
    imagePath: DEFAULT_SHARE_IMAGE_URL,
    alternatesByLocale: {
      en: "/en",
      zh: "/",
      xDefault: "/",
    },
  });
}

async function buildHomeJsonLd(locale: Locale) {
  const copy = await getHomePageContent(locale);
  const path = locale === "zh" ? "/" : "/en";

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
        path: localizedPath(item.href, locale),
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
        path: localizedPath(item.exploreHref, locale),
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
  const copy = await getHomePageContent(locale);
  const jsonLd = await buildHomeJsonLd(locale);
  const { items: articles } = await getCmsArticles({
    locale,
    page: 1,
    perPage: 6,
    allowLocalFallback: false,
  });

  return (
    <main className="fm-homepage">
      <AnalyticsPageViewTracker eventName="view_landing" />
      <JsonLd id={`home-webpage-${locale}`} data={jsonLd.webPage} />
      <JsonLd id={`home-quickstart-${locale}`} data={jsonLd.quickStart} />
      <JsonLd id={`home-families-${locale}`} data={jsonLd.families} />
      <JsonLd id={`home-organization-${locale}`} data={jsonLd.organization} />
      <HomePageExperience locale={locale} copy={copy} articles={articles.slice(0, 6)} />
    </main>
  );
}
