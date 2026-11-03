import { InteractiveStoryLibrary } from "@/components/entertainment/InteractiveStoryLibrary";
import { MoreTests } from "@/components/entertainment/MoreTests";
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

function buildTestsHubJsonLd(
  locale: Locale,
  content: Awaited<ReturnType<typeof getTestsHubContent>>,
) {
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
    return (
      <>
        <TestsHubMinimalShell locale={locale} />
        <MoreTests locale={locale} />
        <InteractiveStoryLibrary locale={locale} />
      </>
    );
  }

  const jsonLd = buildTestsHubJsonLd(locale, content);

  return (
    <main>
      <JsonLd id={`tests-hub-breadcrumb-${locale}`} data={jsonLd.breadcrumb} />
      <JsonLd
        id={`tests-hub-collection-${locale}`}
        data={jsonLd.collectionPage}
      />
      <TestsHubExperience content={content} locale={locale} />
    </main>
  );
}
