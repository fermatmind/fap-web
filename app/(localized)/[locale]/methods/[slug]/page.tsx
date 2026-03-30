import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CanonicalLinkCluster } from "@/components/content/CanonicalLinkCluster";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMethodBySlug, getMethodSeoBySlug } from "@/lib/cms/methods";
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

function renderMethodBody(bodyHtml: string, bodyMd: string) {
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
  return localizedPath(`/methods/${slug}`, locale);
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
  const [method, seo] = await Promise.all([
    getMethodBySlug(slug, locale),
    getMethodSeoBySlug(slug, locale),
  ]);

  if (!method) {
    return {
      title: "Method Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildCanonicalPath(method.slug, locale);
  const seoCanonicalPath = pathFromCanonicalUrl(seo?.surface?.canonicalUrl ?? seo?.meta.canonical, canonicalPath);
  const title = seo?.surface?.title || seo?.meta.title || method.title;
  const description = seo?.surface?.description || seo?.meta.description || method.excerpt;
  const noindex = !method.isIndexable || shouldNoindex(seo?.meta.robots);

  return buildSeoMetadata({
    pageType: "method",
    locale,
    pathname: seoCanonicalPath,
    title,
    description,
    imagePath: seo?.surface?.og.image ?? seo?.meta.og.image ?? method.coverImageUrl ?? undefined,
    seoSurface: seo?.surface,
    noindex: !seo?.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildCanonicalPath(method.slug, "en"),
      zh: buildCanonicalPath(method.slug, "zh"),
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

export default async function MethodDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const method = await getMethodBySlug(slug, locale);

  if (!method) {
    return notFound();
  }

  const seo = await getMethodSeoBySlug(method.slug, locale);
  const canonicalPath = pathFromCanonicalUrl(
    seo?.surface?.canonicalUrl ?? seo?.meta.canonical,
    buildCanonicalPath(method.slug, locale)
  );
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `method-${method.slug}`,
    pageType: "method",
    locale,
    canonicalPath,
    title: method.title,
    description: method.excerpt,
    primary: seo?.jsonld,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
      { name: locale === "zh" ? "方法" : "Methods", path: localizedPath("/methods", locale) },
      { name: method.title, path: canonicalPath },
    ],
    articleMeta: {
      datePublished: method.publishedAt ?? method.updatedAt ?? new Date().toISOString(),
      dateModified: method.updatedAt ?? method.publishedAt ?? new Date().toISOString(),
      authorName: "FermatMind Editorial",
    },
  });
  const landingSurface = method.landingSurface;
  const graphLinks = mergeGraphLinks(
    locale,
    (landingSurface?.ctaBundle ?? []).map((cta) => ({ href: cta.href, label: cta.label })),
    requiredGraphLinks("method", locale)
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}

      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "方法" : "Methods", href: localizedPath("/methods", locale) },
          { label: method.title },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        {method.heroKicker ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {method.heroKicker}
          </p>
        ) : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{method.title}</h1>
        {method.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{method.subtitle}</p> : null}
        {method.excerpt ? <p className="m-0 text-[var(--fm-text-muted)]">{method.excerpt}</p> : null}
      </section>

      <AnswerSurfaceSection surface={method.answerSurface} locale={locale} testId="method-detail-answer-surface" />

      <ConclusionSummaryBlock
        title={locale === "zh" ? "定义摘要" : "Definition summary"}
        body={method.definitionSummaryMd || method.excerpt}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "方法口径" : "Method scope"}
        body={locale === "zh"
          ? "方法页用于公开说明费马测试的方法定义、解释边界与适用口径，结构化数据只复述页面可见信息。"
          : "Method pages explain definitions, interpretation boundaries, and usage scope. Structured data only restates visible facts on the page."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
        <CardHeader className="space-y-3">
          <CardTitle className="font-serif text-[var(--fm-text)]">{method.title}</CardTitle>
          {method.excerpt ? <p className="m-0 text-sm text-[var(--fm-text-muted)]">{method.excerpt}</p> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <article
            data-testid="method-detail-content"
            className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_h2]:mt-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:font-semibold [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5"
          >
            {renderMethodBody(method.bodyHtml, method.bodyMd)}
          </article>

          <BoundaryNoteBlock
            title={locale === "zh" ? "边界说明" : "Boundary note"}
            body={method.boundaryNotesMd || (locale === "zh"
              ? "方法页解释的是群体层面的测评方法与解释边界，不直接等同于个体诊断结论。"
              : "Method pages explain assessment framing and interpretation boundaries at the group level; they are not individual diagnoses.")}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          />

          <div className="flex flex-wrap gap-3">
            <Link
              href={normalizePublicHref(localizedPath("/methods", locale), locale)}
              className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
            >
              {locale === "zh" ? "返回方法中心" : "Back to methods"}
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
        testId="method-required-graph-links"
      />
    </Container>
  );
}
