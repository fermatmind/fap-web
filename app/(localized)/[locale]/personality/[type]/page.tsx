import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import {
  getPersonalityComparisonBySlug,
  buildPersonalityFrontendUrl,
  buildDefaultPublicPersonalitySlug,
  getPersonalityProjectionDetailBySlugOrType,
  getPersonalitySeoBySlugOrType,
  type CmsPersonalitySection,
  isCanonicalPersonalityBaseSlug,
  normalizePersonalitySeoPayload,
  type PersonalityComparisonBlockViewModel,
  type PersonalityComparisonVariantViewModel,
  type PersonalityComparisonViewModel,
  type PersonalityProjection,
  type PersonalityProjectionViewModel,
} from "@/lib/cms/personality";
import {
  extractPersonalityFaqItems,
  extractProjectionFaqItems,
  renderPersonalitySections,
  renderProjectionSections,
} from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import {
  buildMbtiEntryHref,
  buildMbtiEntryTrackingPayload,
} from "@/lib/mbti/entryTracking";
import {
  buildPersonalityComparisonFrontendUrl,
  isPersonalityComparisonSlug,
} from "@/lib/mbti/personalityComparison";
import { resolvePersonalityFallbackProjectionGate } from "@/lib/seo/articlePersonalityAuthority";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;
const PUBLIC_PERSONALITY_VARIANT_RE = /^[ie][ns][ft][jp]-[at]$/i;

type PersonalityIntentLink = {
  key: string;
  label: string;
  href: string;
  kind: "anchor" | "test";
};

type PersonalitySectionShortcut = PersonalityIntentLink & {
  description: string;
};

function normalizeDisplayText(value: string | null | undefined): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function publicNameFromJsonLd(value: unknown): string | null {
  const record = asPlainRecord(value);
  const name = normalizeDisplayText(typeof record?.name === "string" ? record.name : null);

  return name || null;
}

function stripZhPersonalityTypeSuffix(value: string): string {
  return value.replace(/型$/u, "").trim();
}

function formatPersonalityDetailHeading(detail: PersonalityProjectionViewModel, locale: Locale): string {
  const promotedName = publicNameFromJsonLd(detail.projection.seo.jsonld);
  if (promotedName) {
    return promotedName;
  }

  const displayType = normalizeDisplayText(detail.displayType || detail.projection.runtimeTypeCode || detail.canonicalTypeCode).toUpperCase();
  const rawTypeName = normalizeDisplayText(detail.typeName);
  const typeName = locale === "zh" ? stripZhPersonalityTypeSuffix(rawTypeName) : rawTypeName;

  if (!displayType) {
    return detail.title;
  }

  if (typeName && !typeName.toUpperCase().includes(displayType)) {
    return locale === "zh" ? `${displayType} ${typeName}人格` : `${displayType} ${typeName} Personality`;
  }

  return locale === "zh" ? `${displayType} 人格` : `${displayType} Personality`;
}

function formatPersonalityDetailImageAlt(detail: PersonalityProjectionViewModel, locale: Locale): string {
  const heading = formatPersonalityDetailHeading(detail, locale);
  return locale === "zh" ? `${heading} 人格图像` : `${heading} personality illustration`;
}

function firstAvailableSectionHref(sectionKeys: Set<string>, fallbackHref: string, ...candidates: string[]): string {
  const matched = candidates.find((key) => sectionKeys.has(key));

  return matched ? `#${matched}` : fallbackHref;
}

function buildPersonalitySectionShortcuts(
  locale: Locale,
  sections: PersonalityProjection["sections"],
  testHref: string
): PersonalitySectionShortcut[] {
  const sectionKeys = new Set(sections.map((section) => section.key).filter(Boolean));
  const whatHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "letters_intro", "overview");
  const traitsHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "trait_overview", "overview");
  const variantHref = firstAvailableSectionHref(sectionKeys, whatHref, "letters_intro", "trait_overview");
  const relationshipsHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "relationships.summary");
  const careerHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "career.summary", "career.preferred_roles");
  const workHref = firstAvailableSectionHref(sectionKeys, careerHref, "career.preferred_roles", "career.summary");
  const strengthsHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "growth.strengths", "growth.weaknesses");

  return locale === "zh"
    ? [
        { key: "what", label: "是什么", description: "类型定义", href: whatHref, kind: "anchor" },
        { key: "traits", label: "常见特征", description: "维度倾向", href: traitsHref, kind: "anchor" },
        { key: "variant", label: "A/T 差异", description: "状态差异", href: variantHref, kind: "anchor" },
        { key: "relationships", label: "爱情 / 关系", description: "相处模式", href: relationshipsHref, kind: "anchor" },
        { key: "career", label: "职业", description: "职业倾向", href: careerHref, kind: "anchor" },
        { key: "best_fit_work", label: "适合工作", description: "岗位簇", href: workHref, kind: "anchor" },
        { key: "strengths", label: "优缺点", description: "优势与弱点", href: strengthsHref, kind: "anchor" },
        { key: "take_test", label: "立即测试", description: "确认类型", href: testHref, kind: "test" },
      ]
    : [
        { key: "what", label: "What it means", description: "Type definition", href: whatHref, kind: "anchor" },
        { key: "traits", label: "Common traits", description: "Trait pattern", href: traitsHref, kind: "anchor" },
        { key: "variant", label: "A/T difference", description: "Variant state", href: variantHref, kind: "anchor" },
        { key: "relationships", label: "Relationships", description: "Relating style", href: relationshipsHref, kind: "anchor" },
        { key: "career", label: "Careers", description: "Career direction", href: careerHref, kind: "anchor" },
        { key: "best_fit_work", label: "Best-fit work", description: "Role clusters", href: workHref, kind: "anchor" },
        { key: "strengths", label: "Strengths / weak spots", description: "Growth levers", href: strengthsHref, kind: "anchor" },
        // Contract marker: Take the test.
        { key: "take_test", label: "Start the free test", description: "Confirm your type", href: testHref, kind: "test" },
      ];
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

export function applyPersonalityMetadataTitleTemplateGuard(metadata: Metadata, sourceTitle: string): Metadata {
  const title = sourceTitle.replace(/\s+/g, " ").trim();
  if (!/\|\s*FermatMind\s*$/i.test(title)) {
    return metadata;
  }

  return {
    ...metadata,
    title: {
      absolute: title,
    },
  };
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildPersonalityFrontendUrl(locale, slug);
}

function buildComparisonCanonicalPath(slug: string, locale: Locale): string {
  return buildPersonalityComparisonFrontendUrl(locale, slug);
}

function redirectLegacyBaseRouteIfNeeded(type: string, locale: Locale): void {
  if (!isCanonicalPersonalityBaseSlug(type)) {
    return;
  }

  permanentRedirect(buildPersonalityFrontendUrl(locale, buildDefaultPublicPersonalitySlug(type)));
}

function normalizePublicPersonalityVariantSlug(value: string): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PUBLIC_PERSONALITY_VARIANT_RE.test(normalized) ? normalized : null;
}

function formatMbtiTestCtaLabel(locale: Locale): string {
  return locale === "zh" ? "MBTI免费测试" : "Free MBTI test";
}

function buildFallbackProjection(type: string, locale: Locale): PersonalityProjection {
  const displayType = type.toUpperCase();
  const summary =
    locale === "zh"
      ? `${displayType} 人格内容暂时不可用。你仍然可以从这里返回 A/T 人格入口，或重新做一次 MBTI 测试确认自己的类型。`
      : `${displayType} content is temporarily unavailable. You can still return to the A/T variant browser or retake the MBTI test to confirm your type.`;

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
      subtitle: locale === "zh" ? "人格类型内容" : "Personality type content",
      summary,
      tagline: locale === "zh" ? "继续浏览人格内容" : "Continue browsing personality content",
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
      robots: "noindex,nofollow",
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
  const subtitle = locale === "zh" ? "人格类型内容" : "Personality type content";
  const summary =
    locale === "zh"
      ? `${displayType} 的详细内容暂时不可用。你可以先返回 A/T 人格入口，或重新做一次 MBTI 测试确认自己的类型。`
      : `${displayType} detail content is temporarily unavailable. You can return to the A/T variant browser or retake the MBTI test to confirm your type.`;

  return {
    slug: routeSlug,
    routeSlug,
    locale,
    isIndexable: false,
    heroKicker: locale === "zh" ? "人格类型" : "Personality type",
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

async function loadPersonalityComparison(type: string, locale: Locale): Promise<PersonalityComparisonViewModel | null> {
  if (!isPersonalityComparisonSlug(type)) {
    return null;
  }

  return getPersonalityComparisonBySlug(type, locale);
}

function comparisonSeoDescription(comparison: PersonalityComparisonViewModel): string {
  return comparison.seoSurface?.description || comparison.description || comparison.seoMeta?.seoDescription || "";
}

function comparisonSeoTitle(comparison: PersonalityComparisonViewModel): string {
  return comparison.seoSurface?.title || comparison.title || comparison.seoMeta?.seoTitle || comparison.comparisonSlug.toUpperCase();
}

function comparisonPageHeading(comparison: PersonalityComparisonViewModel): string {
  return comparison.title || comparisonSeoTitle(comparison);
}

function comparisonQuickAnswerBody(comparison: PersonalityComparisonViewModel): string {
  const answerSurfaceSummary = comparison.answerSurface?.summaryBlocks
    .map((block) => normalizeDisplayText(block.body))
    .find(Boolean);

  return answerSurfaceSummary || comparison.description || comparisonSeoDescription(comparison);
}

function comparisonVariantSummary(variant: PersonalityComparisonVariantViewModel): string {
  return variant.summaryCard.summary || variant.heroSummary || variant.seo.description || "";
}

function asPlainRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeQuickAnswerText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function projectionQuickAnswerBody(sections: PersonalityProjection["sections"]): string | null {
  const section = sections.find((item) => item.key === "quick_answer" && item.isEnabled !== false);
  if (!section) {
    return null;
  }

  const payload = asPlainRecord(section.payload);
  const body = normalizeQuickAnswerText(section.bodyMd)
    || normalizeQuickAnswerText(payload?.body)
    || normalizeQuickAnswerText(payload?.summary)
    || normalizeQuickAnswerText(payload?.answer);

  return body || null;
}

function cmsQuickAnswerBody(sections: CmsPersonalitySection[]): string | null {
  const section = sections.find((item) => item.sectionKey === "quick_answer" && item.isEnabled !== false);
  if (!section) {
    return null;
  }

  const payload = asPlainRecord(section.payloadJson);
  const raw = asPlainRecord(payload?.raw);
  const body = normalizeQuickAnswerText(section.bodyMd)
    || normalizeQuickAnswerText(payload?.body)
    || normalizeQuickAnswerText(payload?.summary)
    || normalizeQuickAnswerText(payload?.answer)
    || normalizeQuickAnswerText(raw?.body);

  return body || null;
}

function ComparisonVariantCard({
  variant,
  locale,
}: {
  variant: PersonalityComparisonVariantViewModel;
  locale: Locale;
}) {
  const href = buildPersonalityFrontendUrl(locale, variant.publicRouteSlug);
  const summary = comparisonVariantSummary(variant);

  return (
    <Link
      href={href}
      className="grid min-h-56 content-between rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--fm-accent)]"
      data-testid={`personality-comparison-variant-${variant.variantCode.toLowerCase()}`}
    >
      <div className="space-y-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-accent)]">
          {variant.runtimeTypeCode}
        </p>
        <h2 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{variant.typeName || variant.displayType}</h2>
        {variant.nickname ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{variant.nickname}</p> : null}
        {summary ? <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{summary}</p> : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {variant.rarity ? (
          <span className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-xs text-[var(--fm-text-muted)]">
            {variant.rarity}
          </span>
        ) : null}
        {variant.keywords.slice(0, 3).map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-xs text-[var(--fm-text-muted)]"
          >
            {keyword}
          </span>
        ))}
      </div>
    </Link>
  );
}

function ComparisonBlock({
  block,
  assertiveLabel,
  turbulentLabel,
}: {
  block: PersonalityComparisonBlockViewModel;
  assertiveLabel: string;
  turbulentLabel: string;
}) {
  return (
    <article
      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={`personality-comparison-block-${block.key}`}
      data-authority-source={block.source ?? "comparison_public_projection_v1"}
    >
      <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{block.title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{assertiveLabel}</p>
          {block.variants.a ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.variants.a}</p> : null}
        </div>
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{turbulentLabel}</p>
          {block.variants.t ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.variants.t}</p> : null}
        </div>
      </div>
    </article>
  );
}

function PersonalityComparisonPage({
  comparison,
  locale,
}: {
  comparison: PersonalityComparisonViewModel;
  locale: Locale;
}) {
  const canonicalPath = buildComparisonCanonicalPath(comparison.comparisonSlug, locale);
  const title = comparisonSeoTitle(comparison);
  const heading = comparisonPageHeading(comparison);
  const description = comparisonSeoDescription(comparison);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
    { name: heading, path: canonicalPath },
  ]);
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_comparison",
    sourcePageType: "personality_comparison",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const assertiveLabel = comparison.variants.a.runtimeTypeCode;
  const turbulentLabel = comparison.variants.t.runtimeTypeCode;
  const quickAnswerBody = comparisonQuickAnswerBody(comparison);
  const renderedComparisonSections = renderPersonalitySections(comparison.sections, locale);
  const comparisonFaqItems = extractPersonalityFaqItems(comparison.sections);

  return (
    <main
      className="mx-auto w-full max-w-6xl space-y-6 px-[var(--fm-container-gutter)] py-10"
      data-testid="personality-comparison-page"
      data-authority-source="comparison_public_projection_v1"
      data-comparison-contract-version={comparison.comparisonContractVersion}
    >
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <JsonLd id={`personality-comparison-jsonld-${comparison.comparisonSlug}`} data={comparison.jsonld} />
      <JsonLd id={`personality-comparison-breadcrumb-${comparison.comparisonSlug}`} data={breadcrumbJsonLd} />
      {comparisonFaqItems.length > 0 ? (
        <JsonLd id={`personality-comparison-faq-${comparison.comparisonSlug}`} data={buildFAQPageJsonLd(comparisonFaqItems)} />
      ) : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: title },
        ]}
      />

      <section className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-accent)]">
          {comparison.baseTypeCode}
        </p>
        <h1 className="m-0 mt-3 font-serif text-3xl font-semibold text-[var(--fm-text)] md:text-5xl">{heading}</h1>
        {description ? <p className="m-0 mt-4 max-w-3xl text-base leading-8 text-[var(--fm-text-muted)]">{description}</p> : null}
      </section>

      {quickAnswerBody ? (
        <section
          className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          data-testid="personality-comparison-quick-answer"
        >
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {locale === "zh" ? "快速答案" : "Quick answer"}
          </p>
          <p className="m-0 mt-2 text-base leading-8 text-[var(--fm-text-muted)]">{quickAnswerBody}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2" data-testid="personality-comparison-variants">
        <ComparisonVariantCard variant={comparison.variants.a} locale={locale} />
        <ComparisonVariantCard variant={comparison.variants.t} locale={locale} />
      </section>

      {comparison.comparisonBlocks.length ? (
        <section className="space-y-4" data-testid="personality-comparison-blocks">
          {comparison.comparisonBlocks.map((block) => (
            <ComparisonBlock
              key={block.key}
              block={block}
              assertiveLabel={assertiveLabel}
              turbulentLabel={turbulentLabel}
            />
          ))}
        </section>
      ) : null}

      {renderedComparisonSections.length > 0 ? (
        <section className="space-y-4" data-testid="personality-comparison-promoted-sections">
          {renderedComparisonSections}
        </section>
      ) : null}

      <AnswerSurfaceSection
        surface={comparison.answerSurface}
        locale={locale}
        testId="personality-comparison-answer-surface"
        pageFamily="personality_detail"
      />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);

  if (isPersonalityComparisonSlug(type)) {
    const comparison = await loadPersonalityComparison(type, locale);
    if (!comparison) {
      return { title: "Not Found", robots: { index: false, follow: false } };
    }

    const canonicalPath = buildComparisonCanonicalPath(comparison.comparisonSlug, locale);
    const title = comparisonSeoTitle(comparison);
    const effectiveMetadataTitle = comparison.seoSurface?.title || title;
    const description = comparisonSeoDescription(comparison);
    const noindex = !comparison.isIndexable || shouldNoindex(comparison.seoSurface?.robotsPolicy ?? comparison.seoMeta?.robots);
    const metadata = buildPageMetadata({
      locale,
      pathname: canonicalPath,
      title,
      description,
      imagePath: comparison.seoSurface?.og.image ?? comparison.seoMeta?.ogImageUrl ?? undefined,
      seoSurface: comparison.seoSurface,
      noindex: !comparison.seoSurface ? noindex : undefined,
      alternatesByLocale: {
        en: comparison.alternates.en ?? buildComparisonCanonicalPath(comparison.comparisonSlug, "en"),
        zh: comparison.alternates["zh-CN"] ?? buildComparisonCanonicalPath(comparison.comparisonSlug, "zh"),
        xDefault: "/",
      },
    });
    const canonical = canonicalUrl(canonicalPath);
    const ogImage = comparison.seoSurface?.og.image ?? comparison.seoMeta?.ogImageUrl ?? null;
    const twitterImages = normalizeTwitterImages(
      comparison.seoSurface?.twitter.image,
      comparison.seoMeta?.twitterImageUrl,
      ogImage,
      metadata.twitter?.images,
    );

    return applyPersonalityMetadataTitleTemplateGuard({
      ...metadata,
      alternates: {
        ...metadata.alternates,
        canonical,
      },
      openGraph: {
        type: "article",
        url: canonical,
        title: comparison.seoSurface?.og.title || comparison.seoMeta?.ogTitle || title,
        description: comparison.seoSurface?.og.description || comparison.seoMeta?.ogDescription || description,
        images: ogImage ? [ogImage] : undefined,
        locale: locale === "zh" ? "zh_CN" : "en_US",
      },
      twitter: {
        card: resolveTwitterCard(comparison.seoSurface?.twitter.card ?? "summary_large_image"),
        title: comparison.seoSurface?.twitter.title || comparison.seoMeta?.twitterTitle || title,
        description: comparison.seoSurface?.twitter.description || comparison.seoMeta?.twitterDescription || description,
        images: twitterImages,
      },
    }, effectiveMetadataTitle);
  }

  redirectLegacyBaseRouteIfNeeded(type, locale);

  const { detail, seo } = await loadPersonalityPublicDetail(type, locale);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);
  const noindex = !detail.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const effectiveMetadataTitle = normalizedSeo.surface?.title || normalizedSeo.meta.title;
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: effectiveMetadataTitle,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: normalizedSeo.meta.alternates.en ?? buildPersonalityFrontendUrl("en", detail.routeSlug),
      zh: normalizedSeo.meta.alternates["zh-CN"] ?? buildPersonalityFrontendUrl("zh", detail.routeSlug),
      xDefault: "/",
    },
  });
  const canonical = canonicalUrl(canonicalPath);
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;
  const twitterImages = normalizeTwitterImages(
    normalizedSeo.surface?.twitter.image,
    normalizedSeo.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return applyPersonalityMetadataTitleTemplateGuard({
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: normalizedSeo.surface?.og.title || normalizedSeo.meta.og.title,
      description: normalizedSeo.surface?.og.description || normalizedSeo.meta.og.description,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.surface?.twitter.card ?? normalizedSeo.meta.twitter.card),
      title: normalizedSeo.surface?.twitter.title || normalizedSeo.meta.twitter.title,
      description: normalizedSeo.surface?.twitter.description || normalizedSeo.meta.twitter.description,
      images: twitterImages,
    },
  }, effectiveMetadataTitle);
}

export default async function PersonalityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);

  if (isPersonalityComparisonSlug(type)) {
    const comparison = await loadPersonalityComparison(type, locale);
    if (!comparison) {
      return notFound();
    }

    return <PersonalityComparisonPage comparison={comparison} locale={locale} />;
  }

  redirectLegacyBaseRouteIfNeeded(type, locale);
  const { detail, seo } = await loadPersonalityPublicDetail(type, locale);

  if (!detail) {
    return notFound();
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);
  const fallbackProjectionGate = resolvePersonalityFallbackProjectionGate(detail);
  const answerSurfaceFaqItems = detail.answerSurface?.faqBlocks.length
    ? detail.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : [];
  const projectionFaqItems = extractProjectionFaqItems(detail.projection.sections);
  const legacyFaqItems = extractPersonalityFaqItems(detail.faqSections);
  const faqItems = answerSurfaceFaqItems.length
    ? answerSurfaceFaqItems
    : projectionFaqItems.length
      ? projectionFaqItems
      : legacyFaqItems;
  const quickAnswerBody = projectionQuickAnswerBody(detail.projection.sections) || cmsQuickAnswerBody(detail.supplementalSections);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const renderedProjectionSections = renderProjectionSections(
    answerSurfaceFaqItems.length
      ? detail.projection.sections.filter((section) => !(section.key === "faq" && section.render === "faq") && section.key !== "quick_answer")
      : detail.projection.sections.filter((section) => section.key !== "quick_answer"),
    locale
  );
  const renderedSupplementalSections = renderPersonalitySections(
    [...detail.supplementalSections.filter((section) => section.sectionKey !== "quick_answer"), ...detail.faqSections],
    locale
  );
  const hasRenderableContent = renderedProjectionSections.length > 0 || renderedSupplementalSections.length > 0;
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiIntentCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_intent_chip",
    sourcePath: canonicalPath,
  });
  const mbtiIntentCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_intent_chip",
    sourcePath: canonicalPath,
  });
  const heroHeading = formatPersonalityDetailHeading(detail, locale);
  const intentLinks = buildPersonalitySectionShortcuts(locale, detail.projection.sections, mbtiIntentCtaHref);
  const personalityBrowseHref = `${localizedPath("/personality", locale)}#type-groups`;
  const careerDirectionHref = fallbackProjectionGate.canRenderCareerOrRecommendationClaims
    ? localizedPath(`/career/recommendations/mbti/${detail.routeSlug}`, locale)
    : null;

  return (
    <main
      className="mx-auto w-full max-w-6xl px-[var(--fm-container-gutter)] space-y-6 py-10"
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
    >
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      {fallbackProjectionGate.canRenderPublicSchema ? <JsonLd id={`personality-jsonld-${detail.slug}`} data={normalizedSeo.jsonld} /> : null}
      {fallbackProjectionGate.canRenderPublicSchema ? <JsonLd id={`personality-webpage-${detail.slug}`} data={webPageJsonLd} /> : null}
      {fallbackProjectionGate.canRenderPublicSchema ? <JsonLd id={`personality-breadcrumb-${detail.slug}`} data={breadcrumbJsonLd} /> : null}
      {fallbackProjectionGate.canRenderPublicSchema && faqItems.length > 0 ? (
        <JsonLd id={`personality-faq-${detail.slug}`} data={buildFAQPageJsonLd(faqItems)} />
      ) : null}
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
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem] md:items-start">
          <div className="space-y-4">
            <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{heroHeading}</h1>
            {locale !== "zh" && detail.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{detail.summary}</p> : null}
            {detail.heroSummary && detail.heroSummary !== detail.summary ? (
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.heroSummary}</p>
            ) : null}
            {quickAnswerBody ? (
              <aside
                className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm leading-7 text-[var(--fm-text-muted)]"
                data-testid="personality-detail-quick-answer"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                  {locale === "zh" ? "快速答案" : "Quick answer"}
                </p>
                <p className="mb-0 mt-2">{quickAnswerBody}</p>
              </aside>
            ) : null}
          </div>
          {detail.heroImageUrl ? (
            <div
              className="justify-self-center rounded-[1.75rem] border border-[var(--fm-border)] bg-white p-3 shadow-[var(--fm-shadow-sm)] md:justify-self-end"
              data-testid="personality-detail-hero-image"
            >
              <Image
                src={detail.heroImageUrl}
                alt={formatPersonalityDetailImageAlt(detail, locale)}
                width={192}
                height={192}
                sizes="(min-width: 768px) 12rem, 10rem"
                priority
                className="h-40 w-40 object-contain md:h-48 md:w-48"
              />
            </div>
          ) : (
            <div
              className="grid h-40 w-40 place-items-center justify-self-center rounded-[1.75rem] border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] text-2xl font-semibold text-[var(--fm-text)] md:h-48 md:w-48 md:justify-self-end"
              data-testid="personality-detail-hero-image-fallback"
              aria-label={formatPersonalityDetailImageAlt(detail, locale)}
            >
              {detail.displayType}
            </div>
          )}
        </div>
        <nav
          aria-label={locale === "zh" ? "人格页面重点入口" : "Personality page intent shortcuts"}
          className="flex flex-wrap gap-2"
          data-testid="personality-detail-intent-links"
        >
          {intentLinks.map((link) =>
            link.kind === "test" ? (
              <TrackedEntryCtaLink
                key={link.key}
                href={link.href}
                prefetch
                eventProperties={mbtiIntentCtaTrackingProps}
                className="fm-help-chip-link"
              >
                {link.label}
              </TrackedEntryCtaLink>
            ) : (
              <Link key={link.key} href={link.href} className="fm-help-chip-link">
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="personality-detail-section-map"
          data-authority-source={detail.projection.meta.authoritySource ?? "cms_projection"}
        >
          {intentLinks.map((link) =>
            link.kind === "test" ? (
              <TrackedEntryCtaLink
                key={`section-map-${link.key}`}
                href={link.href}
                prefetch
                eventProperties={mbtiIntentCtaTrackingProps}
                className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3 text-left text-sm transition hover:border-[var(--fm-accent)] hover:bg-[var(--fm-surface)]"
              >
                <span className="block font-semibold text-[var(--fm-text)]">{link.label}</span>
                <span className="mt-1 block text-xs text-[var(--fm-text-muted)]">{link.description}</span>
              </TrackedEntryCtaLink>
            ) : (
              <Link
                key={`section-map-${link.key}`}
                href={link.href}
                className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3 text-left text-sm transition hover:border-[var(--fm-accent)] hover:bg-[var(--fm-surface)]"
              >
                <span className="block font-semibold text-[var(--fm-text)]">{link.label}</span>
                <span className="mt-1 block text-xs text-[var(--fm-text-muted)]">{link.description}</span>
              </Link>
            )
          )}
        </div>
        <div className="space-y-3 pt-1" data-testid="personality-detail-next-steps">
          <div
            className="flex flex-wrap items-center gap-3"
            data-testid="mbti-personality-entry-cta-group"
            data-ads-surface="secondary"
          >
            {careerDirectionHref ? (
              <Link href={careerDirectionHref} className={buttonVariants({ size: "lg" })}>
                {locale === "zh" ? "看职业方向" : "See career direction"}
              </Link>
            ) : null}
            <Link href={personalityBrowseHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {locale === "zh" ? "返回 A/T 入口" : "Back to A/T variants"}
            </Link>
            <TrackedEntryCtaLink
              href={mbtiPrimaryCtaHref}
              prefetch
              data-testid="mbti-personality-primary-cta"
              eventProperties={mbtiPrimaryCtaTrackingProps}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {formatMbtiTestCtaLabel(locale)}
            </TrackedEntryCtaLink>
          </div>
        </div>
        {(detail.typeName || detail.nickname || detail.rarity || detail.keywords.length > 0) ? (
          <div className="space-y-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <div className="flex flex-wrap gap-3 text-sm text-[var(--fm-text-muted)]">
              {detail.typeName ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "类型名称" : "Type name"}:</span>{" "}
                  {detail.typeName}
                </p>
              ) : null}
              {detail.nickname ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "别名" : "Nickname"}:</span>{" "}
                  {detail.nickname}
                </p>
              ) : null}
              {detail.rarity ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "稀有度" : "Rarity"}:</span>{" "}
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

      <MbtiSceneEntrySection
        locale={locale}
        sourcePageType="personality_detail"
        blocks={detail.answerSurface?.sceneSummaryBlocks}
        testId="personality-detail-scene-entry"
      />
      <div className="space-y-4">
        {hasRenderableContent ? (
          <>
            {renderedProjectionSections}
            {renderedSupplementalSections}
            <AnswerSurfaceSection
              surface={detail.answerSurface}
              locale={locale}
              testId="personality-detail-answer-surface"
              pageFamily="personality_detail"
              hideHeading={locale === "zh"}
              hideSummaryLabel={locale === "zh"}
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
                  ? "当前语言下还没有可展示的正文内容，你可以先返回 A/T 人格入口，或通过 MBTI免费测试确认自己的类型。"
                  : "No body content is available for this locale yet. You can return to the A/T variant browser or use the Free MBTI test to confirm your type."}
              </p>
            </CardContent>
          </Card>
        )}
        {!hasRenderableContent ? (
          <AnswerSurfaceSection
            surface={detail.answerSurface}
            locale={locale}
            testId="personality-detail-answer-surface"
            pageFamily="personality_detail"
            hideHeading={locale === "zh"}
            hideSummaryLabel={locale === "zh"}
          />
        ) : null}
      </div>
    </main>
  );
}
