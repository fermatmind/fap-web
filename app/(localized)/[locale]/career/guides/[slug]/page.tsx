import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCareerGuideFrontendUrl,
  getCareerGuideFromCmsBySlug,
  getCareerGuideSeoFromCmsBySlug,
  normalizeCareerGuideSeoPayload,
  type CareerGuideDetailViewModel,
} from "@/lib/cms/career-guides";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function resolveTwitterCard(
  value: string | null | undefined
): "summary" | "summary_large_image" | "player" | "app" {
  if (value === "summary" || value === "player" || value === "app") {
    return value;
  }

  return "summary_large_image";
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildCareerGuideFrontendUrl(locale, slug);
}

function renderGuideBody(guide: CareerGuideDetailViewModel) {
  if (guide.bodyHtml.trim()) {
    return <div dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />;
  }

  if (guide.bodyMd.trim()) {
    return renderSimpleMarkdown(guide.bodyMd);
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [guide, seo] = await Promise.all([
    getCareerGuideFromCmsBySlug(slug, locale),
    getCareerGuideSeoFromCmsBySlug(slug, locale),
  ]);

  if (!guide) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = buildCanonicalPath(guide.slug, locale);
  const normalizedSeo = normalizeCareerGuideSeoPayload(seo, guide, locale);
  const noindex = !guide.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.surface?.title || normalizedSeo.meta.title,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildCareerGuideFrontendUrl("en", guide.slug),
      zh: buildCareerGuideFrontendUrl("zh", guide.slug),
      xDefault: "/",
    },
  });
  const canonical = normalizedSeo.surface?.canonicalUrl ?? normalizedSeo.meta.canonical;
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
      languages: {
        ...metadata.alternates?.languages,
        en: normalizedSeo.meta.alternates.en ?? metadata.alternates?.languages?.en,
        "zh-CN":
          normalizedSeo.meta.alternates["zh-CN"] ??
          metadata.alternates?.languages?.["zh-CN"],
      },
    },
    openGraph: {
      type: (normalizedSeo.surface?.og.type ?? normalizedSeo.meta.og.type) === "website" ? "website" : "article",
      url: normalizedSeo.surface?.og.url ?? canonical ?? undefined,
      title: normalizedSeo.surface?.og.title || normalizedSeo.meta.og.title,
      description: normalizedSeo.surface?.og.description || normalizedSeo.meta.og.description,
      images: ogImage ? [ogImage] : metadata.openGraph?.images,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.surface?.twitter.card ?? normalizedSeo.meta.twitter.card),
      title: normalizedSeo.surface?.twitter.title || normalizedSeo.meta.twitter.title,
      description: normalizedSeo.surface?.twitter.description || normalizedSeo.meta.twitter.description,
      images: (normalizedSeo.surface?.twitter.image ?? normalizedSeo.meta.twitter.image ?? ogImage)
        ? [normalizedSeo.surface?.twitter.image ?? normalizedSeo.meta.twitter.image ?? ogImage]
        : metadata.twitter?.images,
    },
  };
}

export default async function CareerGuideDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [guide, seo] = await Promise.all([
    getCareerGuideFromCmsBySlug(slug, locale),
    getCareerGuideSeoFromCmsBySlug(slug, locale),
  ]);

  if (!guide) {
    return notFound();
  }

  const normalizedSeo = normalizeCareerGuideSeoPayload(seo, guide, locale);
  const canonicalPath = buildCanonicalPath(guide.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
    { name: locale === "zh" ? "职业发展" : "Guides", path: locale === "zh" ? "/zh/career/guides" : "/en/career/guides" },
    { name: guide.title, path: canonicalPath },
  ]);
  const metadataParts = [
    `${locale === "zh" ? "分类" : "Category"}: ${guide.category}`,
    guide.updatedAt
      ? `${locale === "zh" ? "更新于" : "Updated"}: ${guide.updatedAt}`
      : null,
  ].filter(Boolean);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`career-guide-jsonld-${guide.slug}`} data={normalizedSeo.jsonld} />
      <JsonLd id={`career-guide-breadcrumb-${guide.slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "职业发展" : "Guides", href: localizedPath("/career/guides", locale) },
          { label: guide.title },
        ]}
      />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{guide.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{guide.summary}</p>
        {metadataParts.length > 0 ? (
          <p className="m-0 text-xs text-[var(--fm-text-muted)]">{metadataParts.join(" · ")}</p>
        ) : null}
      </section>

      {guide.bodyMd.trim() || guide.bodyHtml.trim() ? (
        <article className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline">
          {renderGuideBody(guide)}
        </article>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "相关职业" : "Related jobs"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[var(--fm-text-muted)]">
            {guide.relatedJobs.map((job) => (
              <p key={job.slug} className="m-0">
                <Link href={job.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {job.title}
                </Link>
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "相关行业" : "Related industries"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[var(--fm-text-muted)]">
            {guide.relatedIndustries.map((industry) => (
              <p key={industry.slug} className="m-0">
                <Link href={industry.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {industry.title}
                </Link>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <RelatedContent
          title={locale === "zh" ? "相关文章" : "Related articles"}
          items={guide.relatedArticles}
        />
        <RelatedContent
          title={locale === "zh" ? "相关人格画像" : "Related personality profiles"}
          items={guide.relatedPersonalityProfiles}
        />
      </div>

      <Link href={localizedPath("/career/guides", locale)} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业发展" : "Back to career guides"}
      </Link>
    </Container>
  );
}
