import type { Metadata } from "next";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { HomeMinimalShell } from "@/components/marketing/HomeMinimalShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { DEFAULT_SHARE_IMAGE_URL } from "@/lib/cms/media";
import { localizedPath } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { getHomepageRecommendedArticles } from "@/lib/marketing/homepageRecommendedArticles";
import { listVisibleTestsHubCards } from "@/lib/marketing/testsHubContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";

const ROOT_LOCALE = "zh" as const;
const ROOT_PATH = "/";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getHomePageContent(ROOT_LOCALE).catch(() => null);

  if (!copy) {
    return buildPageMetadata({
      locale: ROOT_LOCALE,
      pathname: ROOT_PATH,
      title: "FermatMind",
      description: "FermatMind",
      imagePath: DEFAULT_SHARE_IMAGE_URL,
      noindex: true,
      alternatesByLocale: {
        en: "/en",
        zh: "/",
        xDefault: "/",
      },
    });
  }

  return buildPageMetadata({
    locale: ROOT_LOCALE,
    pathname: ROOT_PATH,
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

function buildRootHomeJsonLd(copy: Awaited<ReturnType<typeof getHomePageContent>>) {
  return {
    webPage: buildWebPageJsonLd({
      path: ROOT_PATH,
      title: copy.seo.title,
      description: copy.seo.description,
      locale: ROOT_LOCALE,
    }),
    quickStart: buildItemListJsonLd({
      path: ROOT_PATH,
      idSuffix: "quickstart-itemlist",
      title: copy.seo.quickStartListTitle,
      description: copy.seo.quickStartListDescription,
      locale: ROOT_LOCALE,
      items: copy.quickStart.items.map((item) => ({
        name: item.title,
        path: localizedPath(item.href, ROOT_LOCALE),
        description: item.description,
      })),
    }),
    families: buildItemListJsonLd({
      path: ROOT_PATH,
      idSuffix: "family-itemlist",
      title: copy.seo.familyListTitle,
      description: copy.seo.familyListDescription,
      locale: ROOT_LOCALE,
      items: copy.families.items.map((item) => ({
        name: item.title,
        path: localizedPath(item.exploreHref, ROOT_LOCALE),
        description: item.description,
      })),
    }),
    organization: buildOrganizationJsonLd({
      path: ROOT_PATH,
      locale: ROOT_LOCALE,
      name: "FermatMind / 费马测试",
      description: copy.seo.organizationDescription,
    }),
  };
}

export default async function RootHomePage() {
  const copy = await getHomePageContent(ROOT_LOCALE).catch(() => null);

  if (!copy) {
    return <HomeMinimalShell locale={ROOT_LOCALE} />;
  }

  const jsonLd = buildRootHomeJsonLd(copy);
  const [articles, supplementalTests] = await Promise.all([
    getHomepageRecommendedArticles(ROOT_LOCALE).catch(() => []),
    listVisibleTestsHubCards(ROOT_LOCALE).catch(() => []),
  ]);

  return (
    <main className="fm-homepage">
      <AnalyticsPageViewTracker eventName="view_landing" />
      <JsonLd id="home-webpage-root" data={jsonLd.webPage} />
      <JsonLd id="home-quickstart-root" data={jsonLd.quickStart} />
      <JsonLd id="home-families-root" data={jsonLd.families} />
      <JsonLd id="home-organization-root" data={jsonLd.organization} />
      <HomePageExperience locale={ROOT_LOCALE} copy={copy} articles={articles} supplementalTests={supplementalTests} />
    </main>
  );
}
