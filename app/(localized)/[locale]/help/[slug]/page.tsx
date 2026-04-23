import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageTemplate } from "@/components/content-pages/ContentPageTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildContentPagePath, getContentPage } from "@/lib/cms/content-pages";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

const HELP_CENTER_SLUGS = [
  "faq",
  "about",
  "team",
  "used-and-mentioned",
  "for-business-and-research",
  "contact",
] as const;

function contentSlug(slug: string): string {
  return `help-${slug}`;
}

export function generateStaticParams() {
  return HELP_CENTER_SLUGS.flatMap((slug) => [
    { locale: "en", slug },
    { locale: "zh", slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const page = await getContentPage(contentSlug(slug), locale).catch(() => null);

  if (!page) {
    return {
      title: "Help Page Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: buildContentPagePath(page.slug, locale),
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.summary,
    alternatesByLocale: {
      en: buildContentPagePath(page.slug, "en"),
      zh: buildContentPagePath(page.slug, "zh"),
      xDefault: "/",
    },
  });
}

export default async function HelpDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const page = await getContentPage(contentSlug(slug), locale).catch(() => null);

  if (!page) {
    notFound();
  }

  const canonicalPath = buildContentPagePath(page.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "帮助中心" : "Help Center", path: localizedPath("/help", locale) },
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
      <JsonLd id={`help-webpage-${page.slug}`} data={webPageJsonLd} />
      <JsonLd id={`help-breadcrumb-${page.slug}`} data={breadcrumbJsonLd} />
      <ContentPageTemplate page={page} locale={locale} />
    </>
  );
}
