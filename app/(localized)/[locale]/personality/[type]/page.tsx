import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { ReactElement } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { MbtiScenarioDeepDiveSection } from "@/components/content/MbtiScenarioDeepDiveSection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
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
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import {
  MBTI_ENTRY_TEST_SLUG,
  buildMbtiEntryHref,
  buildMbtiEntryTrackingPayload,
} from "@/lib/mbti/entryTracking";
import { buildMbtiPersonalityScenarioDeepModules } from "@/lib/mbti/sceneDeepContent";
import { getMbtiPersonalityContent } from "@/lib/mbti/mbtiTypeContentPack";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
const PUBLIC_PERSONALITY_VARIANT_RE = /^[ie][ns][ft][jp]-[at]$/i;

type PersonalitySceneRenderBlock = {
  summary: string;
  bottleneck: string;
  advice: string;
  strengths: readonly string[];
  risks: readonly string[];
  why: string;
  variantDeltaA: string;
  variantDeltaT: string;
  nextLinks: {
    key: string;
    label: string;
    href: string;
  }[];
};

type MbtiTrackedLink = {
  href: string;
  eventProperties: ReturnType<typeof buildMbtiEntryTrackingPayload>;
};

function buildMbtiSceneTrackedLink(
  link: { href: string; key: string; label: string },
  sourcePath: string,
  locale: Locale,
  sourcePageType: "personality_detail",
  targetAction: string
): MbtiTrackedLink | null {
  if (!link.href.startsWith(`/tests/${MBTI_ENTRY_TEST_SLUG}`)) {
    return null;
  }

  return {
    href: buildMbtiEntryHref({
      locale,
      formCode: DEFAULT_MBTI_FORM_CODE,
      entrySurface: "mbti_scene_block",
      sourcePageType,
      targetAction,
      sourcePath,
    }),
    eventProperties: buildMbtiEntryTrackingPayload({
      locale,
      formCode: DEFAULT_MBTI_FORM_CODE,
      entrySurface: "mbti_scene_block",
      sourcePageType,
      targetAction,
      sourcePath,
    }),
  };
}

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

function normalizePublicPersonalityVariantSlug(value: string): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PUBLIC_PERSONALITY_VARIANT_RE.test(normalized) ? normalized : null;
}

function buildFallbackProjection(type: string, locale: Locale): PersonalityProjection {
  const displayType = type.toUpperCase();
  const summary =
    locale === "zh"
      ? `${displayType} 人格内容暂时不可用。你仍然可以从这里返回 16 型浏览，或重新做一次 MBTI 测试确认自己的类型。`
      : `${displayType} content is temporarily unavailable. You can still return to the 16-type browser or retake the MBTI test to confirm your type.`;

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
      ? `${displayType} 的详细内容暂时不可用。你可以先返回 16 型人格浏览，或重新做一次 MBTI 测试确认自己的类型。`
      : `${displayType} detail content is temporarily unavailable. You can return to the 16-type browser or retake the MBTI test to confirm your type.`;

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
  const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);
  const noindex = !detail.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
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
  });
  const canonical = canonicalUrl(canonicalPath);
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;
  const twitterImages = normalizeTwitterImages(
    normalizedSeo.surface?.twitter.image,
    normalizedSeo.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return {
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
  };
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
  const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);
  const isFallbackRoute =
    detail.projection.meta.routeMode === "fallback" ||
    detail.projection.meta.authoritySource === "frontend_gateway_fallback";
  const faqItems = detail.answerSurface?.faqBlocks.length
    ? detail.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : extractPersonalityFaqItems(detail.faqSections);
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
  const renderedProjectionSections = renderProjectionSections(detail.projection.sections, locale);
  const renderedSupplementalSections = renderPersonalitySections(
    [...detail.faqSections, ...detail.supplementalSections],
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
  const personalityBrowseHref = `${localizedPath("/personality", locale)}#type-groups`;
  const careerDirectionHref = localizedPath(`/career/recommendations/mbti/${detail.routeSlug}`, locale);
  const personalityScenarioDeepModules = buildMbtiPersonalityScenarioDeepModules({
    locale,
    typeCode: detail.canonicalTypeCode,
  });
  const personalityHasGrowthScene = personalityScenarioDeepModules.some((module) => module.sceneKey === "growth_planning");
  const personalityTypeContent = getMbtiPersonalityContent(detail.routeSlug, locale);

  const renderSceneBlock = (
    label: string,
    block: PersonalitySceneRenderBlock,
    comparisonBlock: PersonalitySceneRenderBlock,
    anchor: string,
    sourcePath: string
  ): ReactElement => (
    <Card id={anchor}>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">{block.summary}</p>
        {block.bottleneck ? (
          <p className="m-0">
            <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "瓶颈：" : "Bottleneck:"}</span>{" "}
            {block.bottleneck}
          </p>
        ) : null}
        {block.advice ? (
          <p className="m-0">
            <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "建议：" : "Advice:"}</span>{" "}
            {block.advice}
          </p>
        ) : null}
        <div className="space-y-2">
          <p className="m-0 font-medium text-[var(--fm-text)]">
            {locale === "zh" ? "核心优势" : "Core strengths"}
          </p>
          <ul className="m-0 space-y-1 pl-4 list-disc">
            {block.strengths.map((item) => (
              <li key={`${anchor}-strength-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="m-0 font-medium text-[var(--fm-text)]">
            {locale === "zh" ? "主要风险" : "Top risks"}
          </p>
          <ul className="m-0 space-y-1 pl-4 list-disc">
            {block.risks.map((item) => (
              <li key={`${anchor}-risk-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="m-0">
          <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "为何与该类型相关：" : "Type relevance:"}</span>{" "}
          {block.why}
        </p>
        <p className="m-0">
          <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "A 型：" : "A variant:"}</span>{" "}
          {comparisonBlock.variantDeltaA || block.variantDeltaA || comparisonBlock.variantDeltaT || block.variantDeltaT}
        </p>
        <p className="m-0">
          <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "T 型：" : "T variant:"}</span>{" "}
          {comparisonBlock.variantDeltaT || block.variantDeltaT || comparisonBlock.variantDeltaA || block.variantDeltaA}
        </p>
        <div className="flex flex-wrap gap-2">
          {block.nextLinks.slice(0, 3).map((link) => {
            const targetAction = `start_mbti_test_${anchor}_continuation`;
            const trackedLink = buildMbtiSceneTrackedLink(link, sourcePath, locale, "personality_detail", targetAction);
            if (!trackedLink) {
              return (
                <Link key={link.key} href={link.href} className="fm-help-chip-link">
                  {link.label}
                </Link>
              );
            }

            return (
              <TrackedEntryCtaLink
                key={link.key}
                href={trackedLink.href}
                className="fm-help-chip-link"
                eventProperties={trackedLink.eventProperties}
              >
                {link.label}
              </TrackedEntryCtaLink>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      {!isFallbackRoute ? <JsonLd id={`personality-jsonld-${detail.slug}`} data={normalizedSeo.jsonld} /> : null}
      {!isFallbackRoute ? <JsonLd id={`personality-webpage-${detail.slug}`} data={webPageJsonLd} /> : null}
      {!isFallbackRoute ? <JsonLd id={`personality-breadcrumb-${detail.slug}`} data={breadcrumbJsonLd} /> : null}
      {!isFallbackRoute && faqItems.length > 0 ? (
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
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{detail.title}</h1>
        {locale !== "zh" && detail.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{detail.summary}</p> : null}
        {detail.heroSummary && detail.heroSummary !== detail.summary ? (
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.heroSummary}</p>
        ) : null}
        <div className="space-y-3 pt-1" data-testid="personality-detail-next-steps">
          <div
            className="flex flex-wrap items-center gap-3"
            data-testid="mbti-personality-entry-cta-group"
            data-ads-surface="secondary"
          >
            <Link href={careerDirectionHref} className={buttonVariants({ size: "lg" })}>
              {locale === "zh" ? "看职业方向" : "See career direction"}
            </Link>
            <Link href={personalityBrowseHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {locale === "zh" ? "返回 16 型浏览" : "Back to 16 types"}
            </Link>
            <TrackedEntryCtaLink
              href={mbtiPrimaryCtaHref}
              prefetch
              data-testid="mbti-personality-primary-cta"
              eventProperties={mbtiPrimaryCtaTrackingProps}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {locale === "zh" ? "重新做 MBTI" : "Retake MBTI"}
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
        {personalityTypeContent ? (
          <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="mbti-personality-content-pack">
            <div className="space-y-2">
              <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
                {locale === "zh" ? `${detail.displayType} 人格解读` : `${detail.displayType} profile guide`}
              </h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "核心画像" : "Core profile"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-[var(--fm-text-muted)]">
                <p className="m-0">{personalityTypeContent.common.hero.summary}</p>
                <p className="m-0">{personalityTypeContent.common.hero.positioning}</p>
                <p className="m-0">{personalityTypeContent.common.hero.coreStrength}</p>
                <p className="m-0">{personalityTypeContent.common.hero.realWorldFriction}</p>
                <p className="m-0">{personalityTypeContent.common.hero.nextStepHint}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                    <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "A 型差异" : "A variant"}</p>
                    <p className="m-0 mt-1">{personalityTypeContent.common.hero.variantDeltaA}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                    <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "T 型差异" : "T variant"}</p>
                    <p className="m-0 mt-1">{personalityTypeContent.common.hero.variantDeltaT}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                    <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "下一步阅读" : "Next reading"}</p>
                    <p className="m-0 mt-1">{personalityTypeContent.common.hero.primaryCta}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              {renderSceneBlock(
                locale === "zh" ? "职业方向" : "Career direction",
                personalityTypeContent.variantCopy.careerDirection,
                personalityTypeContent.common.careerDirection,
                detail.canonicalTypeCode === "INTP" ? "intp-personality-scene-career" : "mbti-personality-scene-career",
                canonicalPath
              )}
              {renderSceneBlock(
                locale === "zh" ? "团队协作" : "Team collaboration",
                personalityTypeContent.variantCopy.teamCollaboration,
                personalityTypeContent.common.teamCollaboration,
                detail.canonicalTypeCode === "INTP" ? "intp-personality-scene-team" : "mbti-personality-scene-team",
                canonicalPath
              )}
              {renderSceneBlock(
                locale === "zh" ? "成长建议" : "Growth planning",
                personalityTypeContent.variantCopy.growthPlanning,
                personalityTypeContent.common.growthPlanning,
                detail.canonicalTypeCode === "INTP" ? "intp-personality-scene-growth" : "mbti-personality-scene-growth",
                canonicalPath
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{locale === "zh" ? "下一步阅读" : "Next reading"}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href={personalityTypeContent.support.recommendationBacklink.href} className="fm-help-chip-link">
                    {personalityTypeContent.support.recommendationBacklink.label}
                  </Link>
                  <Link href={personalityTypeContent.support.topicBacklink.href} className="fm-help-chip-link">
                    {personalityTypeContent.support.topicBacklink.label}
                  </Link>
                  <Link href={personalityTypeContent.support.testEntryLink.href} className="fm-help-chip-link">
                    {personalityTypeContent.support.testEntryLink.label}
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{locale === "zh" ? "相关阅读" : "Related reading"}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {personalityTypeContent.support.linkedGuides.map((link) => (
                    <Link key={link.key} href={link.href} className="fm-help-chip-link">
                      {link.label}
                    </Link>
                  ))}
                  {personalityTypeContent.support.linkedArticles.map((link) => (
                    <Link key={link.key} href={link.href} className="fm-help-chip-link">
                      {link.label}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        ) : null}
      </section>

      <MbtiSceneEntrySection
        locale={locale}
        sourcePageType="personality_detail"
        blocks={detail.answerSurface?.sceneSummaryBlocks}
        testId="personality-detail-scene-entry"
      />
      <MbtiScenarioDeepDiveSection
        locale={locale}
        modules={personalityScenarioDeepModules}
        sourcePageType="personality_detail"
        sourcePath={canonicalPath}
        testId="personality-detail-scene-deep-dive"
        heading={
          locale === "zh"
            ? personalityHasGrowthScene
              ? `${detail.canonicalTypeCode} 场景深化（职业 / 协作 / 专业 / 成长）`
              : `${detail.canonicalTypeCode} 场景深化（职业 / 协作 / 专业）`
            : personalityHasGrowthScene
              ? `${detail.canonicalTypeCode} scene depth (career / collaboration / major / growth)`
              : `${detail.canonicalTypeCode} scene depth (career / collaboration / major)`
        }
        subtitle={
          locale === "zh"
            ? ""
            : personalityHasGrowthScene
              ? "Use type detail as the primary layer for scenario explanation, next-step routing, and growth execution."
              : "Use type detail as the primary layer for scenario explanation and next-step routing."
        }
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
                  ? "当前语言下还没有可展示的正文内容，你可以先返回 16 型浏览或重新做 MBTI。"
                  : "No body content is available for this locale yet. You can return to the 16-type browser or retake MBTI."}
              </p>
            </CardContent>
          </Card>
        )}
        {!hasRenderableContent ? (
          <AnswerSurfaceSection
            surface={detail.answerSurface}
            locale={locale}
            testId="personality-detail-answer-surface"
            hideHeading={locale === "zh"}
            hideSummaryLabel={locale === "zh"}
          />
        ) : null}
      </div>
    </Container>
  );
}
