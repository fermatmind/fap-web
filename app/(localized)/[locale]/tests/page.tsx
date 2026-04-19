import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { TestsHubMinimalShell } from "@/components/marketing/tests/TestsHubMinimalShell";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/generateSchema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const content = await getTestsHubContent(locale).catch(() => null);
  const pathname = locale === "zh" ? "/zh/tests" : "/en/tests";

  if (!content) {
    return buildPageMetadata({
      locale,
      pathname,
      title: "FermatMind Tests",
      description: "FermatMind Tests",
      noindex: true,
      alternatesByLocale: {
        en: "/en/tests",
        zh: "/zh/tests",
        xDefault: "/",
      },
    });
  }

  return buildPageMetadata({
    locale,
    pathname,
    title: content.seo.title,
    description: content.seo.description,
    alternatesByLocale: {
      en: "/en/tests",
      zh: "/zh/tests",
      xDefault: "/",
    },
  });
}

function buildTestsHubJsonLd(locale: Locale, content: Awaited<ReturnType<typeof getTestsHubContent>>) {
  const path = locale === "zh" ? "/zh/tests" : "/en/tests";

  return {
    breadcrumb: buildBreadcrumbJsonLd([
      { name: "FermatMind", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "测评入口" : "Tests Hub", path },
    ]),
    collectionPage: buildCollectionPageJsonLd({
      path,
      title: content.seo.title,
      description: content.seo.description,
      locale,
    }),
    quickStart: buildItemListJsonLd({
      path,
      idSuffix: "quickstart-itemlist",
      title: locale === "zh" ? "按问题开始的测评入口" : "Question-led test entry points",
      description: locale === "zh" ? "用户可以按问题选择更适合的测评起点。" : "Visible question-led entry points for choosing where to start.",
      locale,
      items: content.quickStart.items.map((item) => ({
        name: item.title,
        path: item.href,
        description: item.description,
      })),
    }),
    families: buildItemListJsonLd({
      path,
      idSuffix: "family-itemlist",
      title: locale === "zh" ? "测评家族浏览" : "Test family explorer",
      description: locale === "zh" ? "按家族浏览代表测试与分类入口。" : "Visible family-level routes for representative tests and category hubs.",
      locale,
      items: content.families.items.map((family) => ({
        name: family.title,
        path: family.exploreHref,
        description: family.description,
      })),
    }),
  };
}

export default async function TestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const content = await getTestsHubContent(locale).catch(() => null);

  if (!content) {
    return <TestsHubMinimalShell locale={locale} />;
  }

  const jsonLd = buildTestsHubJsonLd(locale, content);

  return (
    <main>
      <JsonLd id={`tests-hub-breadcrumb-${locale}`} data={jsonLd.breadcrumb} />
      <JsonLd id={`tests-hub-collection-${locale}`} data={jsonLd.collectionPage} />
      <JsonLd id={`tests-hub-quickstart-${locale}`} data={jsonLd.quickStart} />
      <JsonLd id={`tests-hub-families-${locale}`} data={jsonLd.families} />
      <TestsHubExperience content={content} locale={locale} />
    </main>
  );
}
