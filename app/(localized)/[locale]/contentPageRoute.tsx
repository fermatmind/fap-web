import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageTemplate } from "@/components/content-pages/ContentPageTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildContentPagePath, getContentPage } from "@/lib/cms/content-pages";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateContentPageMetadata({
  params,
  slug,
}: {
  params: Promise<{ locale: string }>;
  slug: string;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const page = await getContentPage(slug, locale).catch(() => null);

  if (!page) {
    return {
      title: "Page Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: buildContentPagePath(page.slug, locale),
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.summary,
    noindex: !page.isIndexable,
    alternatesByLocale: {
      en: buildContentPagePath(page.slug, "en"),
      zh: buildContentPagePath(page.slug, "zh"),
      xDefault: buildContentPagePath(page.slug, "zh"),
    },
  });
}

export async function renderContentPage({
  params,
  slug,
}: {
  params: Promise<{ locale: string }>;
  slug: string;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const page = await getContentPage(slug, locale).catch(() => null);

  if (!page) {
    notFound();
  }

  const canonicalPath = buildContentPagePath(page.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    {
      name: page.kind === "policy" ? (locale === "zh" ? "条款与政策" : "Terms & policies") : locale === "zh" ? "公司" : "Company",
      path: page.kind === "policy" ? buildContentPagePath("policies", locale) : buildContentPagePath("about", locale),
    },
    { name: page.title, path: canonicalPath },
  ]);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: page.title,
    description: page.summary,
    locale: locale as Locale,
  });

  return (
    <>
      <JsonLd id={`content-page-webpage-${page.slug}`} data={webPageJsonLd} />
      <JsonLd id={`content-page-breadcrumb-${page.slug}`} data={breadcrumbJsonLd} />
      <ContentPageTemplate page={page} locale={locale} />
    </>
  );
}
