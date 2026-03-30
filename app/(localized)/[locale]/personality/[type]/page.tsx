import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CanonicalLinkCluster } from "@/components/content/CanonicalLinkCluster";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPersonalityFrontendUrl,
  buildDefaultPublicPersonalitySlug,
  getPersonalityProjectionDetailBySlugOrType,
  getPersonalitySeoBySlugOrType,
  isCanonicalPersonalityBaseSlug,
  normalizePersonalitySeoPayload,
  type PersonalityProjection,
  type PersonalityProjectionViewModel,
} from "@/lib/cms/personality";
import { extractPersonalityFaqItems, renderPersonalitySections, renderProjectionSections } from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { mergeGraphLinks, requiredGraphLinks } from "@/lib/navigation/contentGraph";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
const PUBLIC_PERSONALITY_VARIANT_RE = /^[ie][ns][ft][jp]-[at]$/i;

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildPersonalityFrontendUrl(locale, slug);
}

function redirectLegacyBaseRouteIfNeeded(type: string, locale: Locale): void {
  if (!isCanonicalPersonalityBaseSlug(type)) {
    return;
  }

  permanentRedirect(buildPersonalityFrontendUrl(locale, buildDefaultPublicPersonalitySlug(type)));
}

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

function normalizePublicPersonalityVariantSlug(value: string): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PUBLIC_PERSONALITY_VARIANT_RE.test(normalized) ? normalized : null;
}

function buildFallbackProjection(type: string, locale: Locale): PersonalityProjection {
  const displayType = type.toUpperCase();
  const summary =
    locale === "zh"
      ? `${displayType} 人格画像正在连接权威内容源。当前先展示一个稳定的公开入口，避免 public gateway 在内容接口暂时不可用时直接失败。`
      : `${displayType} personality content is reconnecting to the authoritative public source. This route stays available with a stable public fallback instead of failing when the content API is temporarily unavailable.`;

  return {
    runtimeTypeCode: displayType,
    canonicalTypeCode: displayType.slice(0, 4),
    displayType,
    variantCode: displayType.endsWith("-T") ? "T" : "A",
    profile: {
      typeName: displayType,
      nickname: null,
      rarity: null,
      keywords: [],
      heroSummary: summary,
    },
    summaryCard: {
      title: displayType,
      subtitle: locale === "zh" ? "公开人格入口" : "Public personality entry",
      summary,
      tagline: locale === "zh" ? "稳定的公开路由兜底" : "Stable public route fallback",
      publicTags: [],
    },
    dimensions: [],
    sections: [],
    seo: {
      title: null,
      description: summary,
      ogTitle: null,
      ogDescription: summary,
      ogImageUrl: null,
      twitterTitle: null,
      twitterDescription: summary,
      twitterImageUrl: null,
      canonicalUrl: null,
      robots: "index,follow",
      jsonld: null,
    },
    offerSet: null,
    meta: {
      authoritySource: "frontend_gateway_fallback",
      routeMode: "fallback",
      publicRouteType: "personality_detail",
      schemaVersion: "mbti.public_projection.v1",
      authorityMeta: null,
    },
  };
}

function buildFallbackPersonalityDetail(type: string, locale: Locale): PersonalityProjectionViewModel | null {
  const routeSlug = normalizePublicPersonalityVariantSlug(type);
  if (!routeSlug) {
    return null;
  }

  const displayType = routeSlug.toUpperCase();
  const title = locale === "zh" ? `${displayType} 人格类型` : `${displayType} personality type`;
  const subtitle = locale === "zh" ? "公开人格入口" : "Public personality entry";
  const summary =
    locale === "zh"
      ? `${displayType} 的公开内容入口已保持可访问。当前显示的是 SEO-safe gateway fallback，不会替代权威的人格内容真相。`
      : `The public entry for ${displayType} stays reachable with an SEO-safe gateway fallback. This does not replace the authoritative personality content truth.`;

  return {
    slug: routeSlug,
    routeSlug,
    locale,
    isIndexable: true,
    heroKicker: locale === "zh" ? "MBTI Public Gateway" : "MBTI Public Gateway",
    heroQuote: null,
    heroImageUrl: null,
    canonicalTypeCode: displayType.slice(0, 4),
    displayType,
    typeName: displayType,
    nickname: null,
    rarity: null,
    keywords: [],
    heroSummary: summary,
    title,
    subtitle,
    summary,
    projection: buildFallbackProjection(routeSlug, locale),
    faqSections: [],
    supplementalSections: [],
    seoMeta: null,
    landingSurface: null,
    answerSurface: null,
  };
}

async function loadPersonalityPublicDetail(
  type: string,
  locale: Locale
): Promise<{ detail: PersonalityProjectionViewModel | null; seo: Awaited<ReturnType<typeof getPersonalitySeoBySlugOrType>> | null }> {
  try {
    const [detail, seo] = await Promise.all([
      getPersonalityProjectionDetailBySlugOrType(type, locale),
      getPersonalitySeoBySlugOrType(type, locale),
    ]);

    return { detail, seo };
  } catch {
    return {
      detail: buildFallbackPersonalityDetail(type, locale),
      seo: null,
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  redirectLegacyBaseRouteIfNeeded(type, locale);

  const { detail, seo } = await loadPersonalityPublicDetail(type, locale);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = pathFromCanonicalUrl(
    normalizedSeo.meta.canonical,
    buildCanonicalPath(detail.routeSlug, locale)
  );
  const noindex = !detail.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  return buildSeoMetadata({
    pageType: "entity",
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.surface?.title || normalizedSeo.meta.title,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: normalizedSeo.meta.alternates.en ?? buildPersonalityFrontendUrl("en", detail.routeSlug),
      zh: normalizedSeo.meta.alternates["zh-CN"] ?? buildPersonalityFrontendUrl("zh", detail.routeSlug),
      xDefault: "/",
    },
    canonical: normalizedSeo.surface?.canonicalUrl ?? normalizedSeo.meta.canonical ?? canonicalUrl(canonicalPath),
    metaAlternates: {
      en: normalizedSeo.meta.alternates.en ?? canonicalUrl(buildPersonalityFrontendUrl("en", detail.routeSlug)),
      "zh-CN": normalizedSeo.meta.alternates["zh-CN"] ?? canonicalUrl(buildPersonalityFrontendUrl("zh", detail.routeSlug)),
    },
    ogType: "article",
  });
}

export default async function PersonalityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  redirectLegacyBaseRouteIfNeeded(type, locale);
  const { detail, seo } = await loadPersonalityPublicDetail(type, locale);

  if (!detail) {
    return notFound();
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = pathFromCanonicalUrl(
    normalizedSeo.meta.canonical,
    buildCanonicalPath(detail.routeSlug, locale)
  );
  const faqItems = detail.answerSurface?.faqBlocks.length
    ? detail.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : extractPersonalityFaqItems(detail.faqSections);
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `personality-${detail.slug}`,
    pageType: "entity",
    locale,
    canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    primary: normalizedSeo.jsonld,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
      { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
      { name: detail.displayType, path: canonicalPath },
    ],
    faqItems,
  });
  const renderedProjectionSections = renderProjectionSections(detail.projection.sections, locale);
  const renderedSupplementalSections = renderPersonalitySections(
    [...detail.faqSections, ...detail.supplementalSections],
    locale
  );
  const hasRenderableContent = renderedProjectionSections.length > 0 || renderedSupplementalSections.length > 0;
  const landingSurface = detail.landingSurface;
  const graphLinks = mergeGraphLinks(
    locale,
    (landingSurface?.ctaBundle ?? []).map((cta) => ({ href: cta.href, label: cta.label })),
    requiredGraphLinks("entity", locale)
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: detail.displayType },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {detail.displayType}
        </p>
        {detail.heroKicker ? <p className="m-0 text-sm font-medium text-[var(--fm-text-muted)]">{detail.heroKicker}</p> : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{detail.title}</h1>
        {detail.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{detail.subtitle}</p> : null}
        {detail.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{detail.summary}</p> : null}
        {detail.heroSummary && detail.heroSummary !== detail.summary ? (
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.heroSummary}</p>
        ) : null}
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="personality-detail-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {(detail.typeName || detail.nickname || detail.rarity || detail.keywords.length > 0) ? (
          <div className="space-y-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <div className="flex flex-wrap gap-3 text-sm text-[var(--fm-text-muted)]">
              {detail.typeName ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Type name" : "Type name"}:</span>{" "}
                  {detail.typeName}
                </p>
              ) : null}
              {detail.nickname ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Nickname" : "Nickname"}:</span>{" "}
                  {detail.nickname}
                </p>
              ) : null}
              {detail.rarity ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Rarity" : "Rarity"}:</span>{" "}
                  {detail.rarity}
                </p>
              ) : null}
            </div>
            {detail.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {detail.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-1 text-xs font-medium text-[var(--fm-text)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {detail.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {detail.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={detail.summary || detail.heroSummary || detail.projection.summaryCard.summary || ""}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "定义与使用口径" : "Definition and scope"}
        body={
          locale === "zh"
            ? "人格页优先用可见 HTML 给出类型定义、边界与关联入口，结构化数据只用于帮助搜索系统理解，不替代正文中的可见事实。"
            : "Personality pages prioritize visible HTML for type definitions, boundaries, and related entry points. Structured data only helps search systems understand the page and does not replace visible evidence."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <BoundaryNoteBlock
        title={locale === "zh" ? "边界说明" : "Boundary note"}
        body={
          locale === "zh"
            ? "该页面描述的是类型层面的倾向、沟通模式和常见特征，不等于对个体的定论，也不构成医疗、心理诊断或职业承诺。"
            : "This page describes type-level tendencies, communication patterns, and common traits. It is not a final judgment about an individual and does not constitute medical, psychological, or career diagnosis."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {hasRenderableContent ? (
            <>
              {renderedProjectionSections}
              {renderedSupplementalSections}
              <AnswerSurfaceSection
                surface={detail.answerSurface}
                locale={locale}
                testId="personality-detail-answer-surface"
              />
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "内容暂未同步" : "Content not yet available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "该人格画像已接入 CMS，但当前语言下尚未同步可渲染的 sections。"
                    : "This personality profile is connected to the CMS, but no renderable sections are available for this locale yet."}
                </p>
              </CardContent>
            </Card>
          )}
          {!hasRenderableContent ? (
            <AnswerSurfaceSection
              surface={detail.answerSurface}
              locale={locale}
              testId="personality-detail-answer-surface"
            />
          ) : null}
        </div>

        <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "Profile summary" : "Profile summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Type" : "Type"}:</span>{" "}
                  {detail.displayType}
                </p>
                {detail.displayType !== detail.canonicalTypeCode ? (
                  <p className="m-0">
                    <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Base type" : "Base type"}:</span>{" "}
                    {detail.canonicalTypeCode}
                  </p>
                ) : null}
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Locale" : "Locale"}:</span>{" "}
                  {detail.locale}
                </p>
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Planned URL" : "Planned URL"}:</span>{" "}
                  {normalizedSeo.meta.canonical ?? canonicalUrl(canonicalPath)}
                </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Indexing" : "Indexing"}:</span>{" "}
                {normalizedSeo.meta.robots}
              </p>
            </CardContent>
          </Card>

          {landingSurface?.ctaBundle.length ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "继续探索" : "Continue exploring"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2" data-testid="personality-detail-landing-cta">
                {landingSurface.ctaBundle.map((cta) => (
                  <Link key={cta.key} href={normalizePublicHref(cta.href, locale)} className="fm-help-chip-link">
                    {cta.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <CanonicalLinkCluster
            title={locale === "zh" ? "图谱必连页面" : "Required graph links"}
            items={graphLinks}
            locale={locale}
            testId="personality-required-graph-links"
          />

          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "SEO snapshot" : "SEO snapshot"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "Title" : "Title"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.title || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "Description" : "Description"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.description || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">Canonical</p>
                <p className="mb-0 mt-1 break-all">{normalizedSeo.meta.canonical || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
