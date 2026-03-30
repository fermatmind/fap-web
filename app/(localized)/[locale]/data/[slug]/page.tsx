import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CanonicalLinkCluster } from "@/components/content/CanonicalLinkCluster";
import { Container } from "@/components/layout/Container";
import {
  BoundaryNoteBlock,
  ConclusionSummaryBlock,
  MethodologyBlock,
  SampleInfoBlock,
} from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataPageBySlug, getDataPageSeoBySlug } from "@/lib/cms/data-pages";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { resolveLocale } from "@/lib/i18n/getDict";
import { mergeGraphLinks, requiredGraphLinks } from "@/lib/navigation/contentGraph";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";

export const dynamic = "force-dynamic";

function pathFromCanonicalUrl(value: string | null | undefined, fallbackPath: string): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallbackPath;
  }

  try {
    return new URL(normalized).pathname || fallbackPath;
  } catch {
    return normalized.startsWith("/") ? normalized : fallbackPath;
  }
}

function renderDataBody(bodyHtml: string, bodyMd: string) {
  if (bodyHtml.trim()) {
    return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
  }

  const renderedMarkdown = renderVeliteMdx(bodyMd);
  if (renderedMarkdown) {
    return renderedMarkdown;
  }

  if (bodyMd.trim()) {
    return <div className="whitespace-pre-wrap">{bodyMd}</div>;
  }

  return null;
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return localizedPath(`/data/${slug}`, locale);
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [page, seo] = await Promise.all([
    getDataPageBySlug(slug, locale),
    getDataPageSeoBySlug(slug, locale),
  ]);

  if (!page) {
    return {
      title: "Data Page Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildCanonicalPath(page.slug, locale);
  const seoCanonicalPath = pathFromCanonicalUrl(seo?.surface?.canonicalUrl ?? seo?.meta.canonical, canonicalPath);
  const title = seo?.surface?.title || seo?.meta.title || page.title;
  const description = seo?.surface?.description || seo?.meta.description || page.excerpt;
  const noindex = !page.isIndexable || shouldNoindex(seo?.meta.robots);

  return buildSeoMetadata({
    pageType: "data",
    locale,
    pathname: seoCanonicalPath,
    title,
    description,
    imagePath: seo?.surface?.og.image ?? seo?.meta.og.image ?? page.coverImageUrl ?? undefined,
    seoSurface: seo?.surface,
    noindex: !seo?.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildCanonicalPath(page.slug, "en"),
      zh: buildCanonicalPath(page.slug, "zh"),
      xDefault: "/",
    },
    canonical: seo?.surface?.canonicalUrl ?? seo?.meta.canonical,
    metaAlternates: {
      en: seo?.meta.alternates.en,
      "zh-CN": seo?.meta.alternates["zh-CN"],
    },
    ogType: "article",
  });
}

export default async function DataDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const page = await getDataPageBySlug(slug, locale);

  if (!page) {
    return notFound();
  }

  const seo = await getDataPageSeoBySlug(page.slug, locale);
  const canonicalPath = pathFromCanonicalUrl(
    seo?.surface?.canonicalUrl ?? seo?.meta.canonical,
    buildCanonicalPath(page.slug, locale)
  );
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `data-${page.slug}`,
    pageType: "data",
    locale,
    canonicalPath,
    title: page.title,
    description: page.excerpt,
    primary: seo?.jsonld,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
      { name: locale === "zh" ? "数据" : "Data", path: localizedPath("/data", locale) },
      { name: page.title, path: canonicalPath },
    ],
    articleMeta: {
      datePublished: page.publishedAt ?? page.updatedAt ?? new Date().toISOString(),
      dateModified: page.updatedAt ?? page.publishedAt ?? new Date().toISOString(),
      authorName: "FermatMind Editorial",
    },
  });
  const landingSurface = page.landingSurface;
  const graphLinks = mergeGraphLinks(
    locale,
    (landingSurface?.ctaBundle ?? []).map((cta) => ({ href: cta.href, label: cta.label })),
    requiredGraphLinks("data", locale)
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}

      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "数据" : "Data", href: localizedPath("/data", locale) },
          { label: page.title },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        {page.heroKicker ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {page.heroKicker}
          </p>
        ) : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{page.title}</h1>
        {page.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{page.subtitle}</p> : null}
        {page.excerpt ? <p className="m-0 text-[var(--fm-text-muted)]">{page.excerpt}</p> : null}
      </section>

      <AnswerSurfaceSection surface={page.answerSurface} locale={locale} testId="data-detail-answer-surface" />

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={page.summaryStatementMd || page.excerpt}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <SampleInfoBlock
        title={locale === "zh" ? "样本与口径" : "Sample and scope"}
        items={[
          { label: locale === "zh" ? "样本量" : "Sample size", value: page.sampleSizeLabel },
          { label: locale === "zh" ? "时间窗口" : "Time window", value: page.timeWindowLabel },
        ]}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "统计口径" : "Methodology"}
        body={page.methodologyMd || (locale === "zh"
          ? "请在数据页中明确说明样本口径、统计方式和限制说明。"
          : "Each data page should clearly state sample framing, statistical method, and limitations.")}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
        <CardHeader className="space-y-3">
          <CardTitle className="font-serif text-[var(--fm-text)]">{page.title}</CardTitle>
          {page.excerpt ? <p className="m-0 text-sm text-[var(--fm-text-muted)]">{page.excerpt}</p> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <article
            data-testid="data-detail-content"
            className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_h2]:mt-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:font-semibold [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5"
          >
            {renderDataBody(page.bodyHtml, page.bodyMd)}
          </article>

          <BoundaryNoteBlock
            title={locale === "zh" ? "边界说明" : "Boundary note"}
            body={page.limitationsMd || (locale === "zh"
              ? "数据页反映的是群体层面的聚合趋势，不应直接推导为个体结论。"
              : "Data pages reflect aggregated group trends and should not be treated as direct conclusions about an individual.")}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          />

          <div className="flex flex-wrap gap-3">
            <Link
              href={normalizePublicHref(localizedPath("/data", locale), locale)}
              className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
            >
              {locale === "zh" ? "返回数据中心" : "Back to data pages"}
            </Link>
            {landingSurface?.ctaBundle.map((cta) => (
              <Link
                key={cta.key}
                href={normalizePublicHref(cta.href, locale)}
                className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <CanonicalLinkCluster
        title={locale === "zh" ? "图谱必连页面" : "Required graph links"}
        items={graphLinks}
        locale={locale}
        testId="data-required-graph-links"
      />
    </Container>
  );
}
