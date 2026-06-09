import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildContentPagePath, getContentPage, type ContentPage } from "@/lib/cms/content-pages";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { FAQItem } from "@/lib/seo/generateSchema";

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

function normalizeVisibleText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForFaqParity(value: string): string {
  return normalizeVisibleText(
    value
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*_`>[\]()+.!?,:;'"-]+/g, " ")
  ).toLowerCase();
}

function buildCmsHelpFaqItems(page: ContentPage): FAQItem[] {
  if (page.kind !== "help" || !page.schemaEnabled || page.faqItems.length === 0) {
    return [];
  }

  const visibleText = normalizeForFaqParity(`${page.contentMd}\n${page.contentHtml}`);

  return page.faqItems.filter((item) => {
    const question = normalizeForFaqParity(item.question);
    const answer = normalizeForFaqParity(item.answer);

    return Boolean(question && answer && visibleText.includes(question) && visibleText.includes(answer));
  });
}

function buildVisibleHelpFaqJsonLd(faq: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
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
    noindex: !page.isIndexable,
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
  const faqItems = buildCmsHelpFaqItems(page);
  const faqJsonLd = faqItems.length > 0 ? buildVisibleHelpFaqJsonLd(faqItems) : null;

  return (
    <>
      <JsonLd id={`help-webpage-${page.slug}`} data={webPageJsonLd} />
      <JsonLd id={`help-breadcrumb-${page.slug}`} data={breadcrumbJsonLd} />
      {faqJsonLd ? <JsonLd id={`help-faq-${page.slug}`} data={faqJsonLd} /> : null}
      <ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale={locale} />
    </>
  );
}
