import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { SupportTrustDetailTemplate } from "@/components/support/SupportTrustDetailTemplate";
import { buildInterpretationGuidePath, getInterpretationGuide, listInterpretationGuides } from "@/lib/cms/supportTrust";
import { resolveLocale } from "@/lib/i18n/getDict";
import { type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

function labels(locale: Locale) {
  return locale === "zh"
    ? {
        eyebrow: "结果解读指南",
        backLabel: "返回支持与信任中心",
      }
    : {
        eyebrow: "Interpretation guide",
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
  const guide = await getInterpretationGuide(slug, locale);

  if (!guide) {
    return {
      title: "Interpretation Guide Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: buildInterpretationGuidePath(guide.slug, locale),
    title: guide.seoTitle || guide.title,
    description: guide.seoDescription || guide.summary,
    alternatesByLocale: {
      en: buildInterpretationGuidePath(guide.slug, "en"),
      zh: buildInterpretationGuidePath(guide.slug, "zh"),
      xDefault: buildInterpretationGuidePath(guide.slug, "zh"),
    },
  });
}

export default async function InterpretationGuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const guide = await getInterpretationGuide(slug, locale);

  if (!guide) {
    notFound();
  }

  const related = await listInterpretationGuides(locale).catch(() => []);
  const relatedLinks = related
    .filter((candidate) => candidate.slug !== guide.slug)
    .slice(0, 4)
    .map((candidate) => ({
      href: buildInterpretationGuidePath(candidate.slug, locale),
      label: candidate.title,
    }));

  const canonicalPath = buildInterpretationGuidePath(guide.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/" : "/en" },
    { name: locale === "zh" ? "支持与信任中心" : "Support & Trust Center", path: locale === "zh" ? "/zh/support" : "/en/support" },
    { name: guide.title, path: canonicalPath },
  ]);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: guide.title,
    description: guide.summary,
    locale,
  });
  const copy = labels(locale);

  return (
    <>
      <JsonLd id={`interpretation-guide-webpage-${guide.slug}`} data={webPageJsonLd} />
      <JsonLd id={`interpretation-guide-breadcrumb-${guide.slug}`} data={breadcrumbJsonLd} />
      <SupportTrustDetailTemplate
        locale={locale}
        eyebrow={copy.eyebrow}
        title={guide.title}
        summary={guide.summary}
        bodyMd={guide.bodyMd}
        bodyHtml={guide.bodyHtml}
        publishedAt={guide.publishedAt}
        updatedAt={guide.updatedAt}
        publicReview={guide.publicReview}
        backHref={locale === "zh" ? "/zh/support" : "/en/support"}
        backLabel={copy.backLabel}
        relatedLinks={relatedLinks}
        testId={`interpretation-guide-${guide.slug}`}
      />
    </>
  );
}
