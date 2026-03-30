import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CanonicalLinkCluster } from "@/components/content/CanonicalLinkCluster";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
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
import { mergeGraphLinks, requiredGraphLinks } from "@/lib/navigation/contentGraph";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

export const dynamic = "force-dynamic";

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
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
  return buildSeoMetadata({
    pageType: "guide",
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
    canonical: normalizedSeo.surface?.canonicalUrl ?? normalizedSeo.meta.canonical,
    metaAlternates: {
      en: normalizedSeo.meta.alternates.en,
      "zh-CN": normalizedSeo.meta.alternates["zh-CN"],
    },
    ogType: (normalizedSeo.surface?.og.type ?? normalizedSeo.meta.og.type) === "website" ? "website" : "article",
  });
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
  const landingSurface = guide.landingSurface;
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `career-guide-${guide.slug}`,
    pageType: "guide",
    locale,
    canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    primary: normalizedSeo.jsonld,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
      { name: locale === "zh" ? "职业发展" : "Guides", path: locale === "zh" ? "/zh/career/guides" : "/en/career/guides" },
      { name: guide.title, path: canonicalPath },
    ],
    articleMeta: {
      datePublished: guide.publishedAt ?? guide.updatedAt ?? new Date().toISOString(),
      dateModified: guide.updatedAt ?? guide.publishedAt ?? new Date().toISOString(),
      authorName: "FermatMind Editorial",
    },
  });
  const metadataParts = [
    `${locale === "zh" ? "分类" : "Category"}: ${guide.category}`,
    guide.updatedAt
      ? `${locale === "zh" ? "更新于" : "Updated"}: ${guide.updatedAt}`
      : null,
  ].filter(Boolean);
  const graphLinks = mergeGraphLinks(
    locale,
    (landingSurface?.ctaBundle ?? []).map((cta) => ({ href: cta.href, label: cta.label })),
    requiredGraphLinks("guide", locale)
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
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
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="career-guide-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {metadataParts.length > 0 ? (
          <p className="m-0 text-xs text-[var(--fm-text-muted)]">{metadataParts.join(" · ")}</p>
        ) : null}
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={guide.summary}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "方法与口径" : "Method and scope"}
        body={
          locale === "zh"
            ? "本页优先输出可抓取 HTML 文本，并把页面正文、更新时间、规范链接与后台 SEO contract 对齐；结构化数据只作为理解辅助。"
            : "This page prioritizes crawlable HTML text and keeps body copy, update timestamps, canonical links, and the CMS SEO contract aligned. Structured data only assists understanding."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      {guide.bodyMd.trim() || guide.bodyHtml.trim() ? (
        <article className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline">
          {renderGuideBody(guide)}
        </article>
      ) : null}

      <AnswerSurfaceSection
        surface={guide.answerSurface}
        locale={locale}
        testId="career-guide-answer-surface"
      />

      <BoundaryNoteBlock
        title={locale === "zh" ? "边界说明" : "Boundary note"}
        body={
          locale === "zh"
            ? "职业指南用于帮助理解方向与决策因素，不等于个体录取、求职或职业结果承诺。"
            : "Career guides help explain direction and decision factors. They are not guarantees about admission, hiring, or career outcomes."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "相关职业" : "Related jobs"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[var(--fm-text-muted)]">
            {guide.relatedJobs.map((job) => (
              <p key={job.slug} className="m-0">
                <Link href={normalizePublicHref(job.href, locale)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
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
                <Link href={normalizePublicHref(industry.href, locale)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {industry.title}
                </Link>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <CanonicalLinkCluster
        title={locale === "zh" ? "图谱必连页面" : "Required graph links"}
        items={graphLinks}
        locale={locale}
        testId="career-guide-required-graph-links"
      />

      <div className="space-y-6">
        <RelatedContent title={locale === "zh" ? "相关文章" : "Related articles"} items={guide.relatedArticles} locale={locale} />
        <RelatedContent
          title={locale === "zh" ? "相关人格画像" : "Related personality profiles"}
          items={guide.relatedPersonalityProfiles}
          locale={locale}
        />
      </div>

      {landingSurface?.ctaBundle.length ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="career-guide-landing-cta">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "继续探索" : "Continue exploring"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={normalizePublicHref(cta.href, locale)} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Link href={normalizePublicHref(localizedPath("/career/guides", locale), locale)} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业发展" : "Back to career guides"}
      </Link>
    </Container>
  );
}
