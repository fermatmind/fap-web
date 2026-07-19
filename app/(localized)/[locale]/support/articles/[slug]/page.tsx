import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { SupportTrustDetailTemplate } from "@/components/support/SupportTrustDetailTemplate";
import { buildSupportArticlePath, getSupportArticle, listSupportArticles } from "@/lib/cms/supportTrust";
import { resolveLocale } from "@/lib/i18n/getDict";
import { type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

function labels(locale: Locale) {
  return locale === "zh"
    ? {
        eyebrow: "支持文章",
        backLabel: "返回支持与信任中心",
      }
    : {
        eyebrow: "Support article",
        backLabel: "Back to Support & Trust Center",
      };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const article = await getSupportArticle(slug, locale);

  if (!article) {
    return {
      title: "Support Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: buildSupportArticlePath(article.slug, locale),
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    alternatesByLocale: {
      en: buildSupportArticlePath(article.slug, "en"),
      zh: buildSupportArticlePath(article.slug, "zh"),
      xDefault: buildSupportArticlePath(article.slug, "zh"),
    },
  });
}

export default async function SupportArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const article = await getSupportArticle(slug, locale);

  if (!article) {
    notFound();
  }

  const related = await listSupportArticles(locale).catch(() => []);
  const relatedLinks = related
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(0, 4)
    .map((candidate) => ({
      href: buildSupportArticlePath(candidate.slug, locale),
      label: candidate.title,
    }));

  const canonicalPath = buildSupportArticlePath(article.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/" : "/en" },
    { name: locale === "zh" ? "支持与信任中心" : "Support & Trust Center", path: locale === "zh" ? "/zh/support" : "/en/support" },
    { name: article.title, path: canonicalPath },
  ]);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: article.title,
    description: article.summary,
    locale,
  });
  const copy = labels(locale);

  return (
    <>
      <JsonLd id={`support-article-webpage-${article.slug}`} data={webPageJsonLd} />
      <JsonLd id={`support-article-breadcrumb-${article.slug}`} data={breadcrumbJsonLd} />
      <SupportTrustDetailTemplate
        locale={locale}
        eyebrow={copy.eyebrow}
        title={article.title}
        summary={article.summary}
        bodyMd={article.bodyMd}
        bodyHtml={article.bodyHtml}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        publicReview={article.publicReview}
        primaryCtaLabel={article.primaryCtaLabel}
        primaryCtaUrl={article.primaryCtaUrl}
        backHref={locale === "zh" ? "/zh/support" : "/en/support"}
        backLabel={copy.backLabel}
        relatedLinks={relatedLinks}
        testId={`support-article-${article.slug}`}
      />
    </>
  );
}
