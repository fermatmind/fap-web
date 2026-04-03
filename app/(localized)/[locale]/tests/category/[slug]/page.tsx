import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestCategoryExperience } from "@/components/marketing/tests/TestCategoryExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import {
  getTestsCategoryContent,
  listTestsCategorySlugs,
  type TestsCategorySlug,
} from "@/lib/marketing/testsHubContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/generateSchema";

function isTestsCategorySlug(value: string): value is TestsCategorySlug {
  return value === "personality" || value === "career";
}

export function generateStaticParams() {
  return listTestsCategorySlugs().flatMap((slug) => [{ slug }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);

  if (!isTestsCategorySlug(slug)) {
    return {};
  }

  const content = getTestsCategoryContent(locale, slug);
  const pathname = locale === "zh" ? `/zh/tests/category/${slug}` : `/en/tests/category/${slug}`;

  return buildPageMetadata({
    locale,
    pathname,
    title: content.seo.title,
    description: content.seo.description,
    alternatesByLocale: {
      en: `/en/tests/category/${slug}`,
      zh: `/zh/tests/category/${slug}`,
      xDefault: "/",
    },
  });
}

function buildCategoryJsonLd(locale: Locale, slug: TestsCategorySlug) {
  const content = getTestsCategoryContent(locale, slug);
  const path = locale === "zh" ? `/zh/tests/category/${slug}` : `/en/tests/category/${slug}`;

  return {
    breadcrumb: buildBreadcrumbJsonLd(
      content.breadcrumb.map((item) => ({
        name: item.label,
        path: item.path ?? path,
      }))
    ),
    collectionPage: buildCollectionPageJsonLd({
      path,
      title: content.seo.title,
      description: content.seo.description,
      locale,
    }),
    featured: buildItemListJsonLd({
      path,
      idSuffix: "featured-itemlist",
      title: locale === "zh" ? "代表测试" : "Featured tests",
      description:
        locale === "zh"
          ? "当前分类页可见的代表测试入口。"
          : "Visible representative test entries on this category hub.",
      locale,
      items: content.featured.items.map((item) => ({
        name: item.title,
        path: item.href,
        description: item.description,
      })),
    }),
    allTests: buildItemListJsonLd({
      path,
      idSuffix: "all-tests-itemlist",
      title: locale === "zh" ? "分类内全部测试" : "All tests in category",
      description:
        locale === "zh"
          ? "当前分类页完整可见的测试列表。"
          : "Full visible test list on the category page.",
      locale,
      items: content.allTests.items.map((item) => ({
        name: item.title,
        path: item.href,
        description: item.description,
      })),
    }),
  };
}

export default async function TestsCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);

  if (!isTestsCategorySlug(slug)) {
    notFound();
  }

  const content = getTestsCategoryContent(locale, slug);
  const jsonLd = buildCategoryJsonLd(locale, slug);

  return (
    <main>
      <JsonLd id={`tests-category-breadcrumb-${locale}-${slug}`} data={jsonLd.breadcrumb} />
      <JsonLd id={`tests-category-collection-${locale}-${slug}`} data={jsonLd.collectionPage} />
      <JsonLd id={`tests-category-featured-${locale}-${slug}`} data={jsonLd.featured} />
      <JsonLd id={`tests-category-all-${locale}-${slug}`} data={jsonLd.allTests} />
      <TestCategoryExperience locale={locale} content={content} />
    </main>
  );
}
