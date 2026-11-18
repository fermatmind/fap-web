import { JUNG_TEST_SLUG, jungLandingCopy } from "@/lib/tests/freeAssessmentLanding";
import { InteractiveStoryLibrary } from "@/components/entertainment/InteractiveStoryLibrary";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { TestsHubMinimalShell } from "@/components/marketing/tests/TestsHubMinimalShell";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { getAllTests } from "@/lib/content";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";
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
      xDefault: "/zh/tests",
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
  const [content, catalog] = await Promise.all([
    getTestsHubContent(locale).catch(() => null),
    getAllTests(locale).catch(() => []),
  ]);
  const zh = locale === "zh";
  const jung = jungLandingCopy(locale);
  const hasJungForms = catalog.some(entry => entry.is_active === true && entry.is_public === true
    && ["JUNG_ARCHETYPES", "JUNG_COGNITIVE_FUNCTIONS"].includes(entry.scale_code ?? ""));
  const jungCards: HubTestCardItem[] = hasJungForms ? [{
    key: JUNG_TEST_SLUG,
    title: jung.title,
    description: jung.intro,
    questionsLabel: zh ? "48 / 64 题" : "48 / 64 questions",
    durationLabel: zh ? "约 10 / 13 分钟" : "About 10 / 13 min",
    outputLabel: zh ? "完整报告免费" : "Free full reports",
    href: `/${locale}${jung.path}`,
    primaryLabel: zh ? "查看两套测试" : "View both tests",
    previewVariant: "bars",
  }] : [];

  if (!content) {
    return (
      <>
        <TestsHubMinimalShell locale={locale} />
        <MoreTests locale={locale} coreTests={jungCards} />
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
      <TestsHubExperience content={content} locale={locale} additionalCoreTests={jungCards} />
    </main>
  );
}
