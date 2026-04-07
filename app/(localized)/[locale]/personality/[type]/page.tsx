import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
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
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";
import { getIntpPersonalityContent } from "@/lib/mbti/intpContentPack";

export const dynamic = "force-dynamic";
const PUBLIC_PERSONALITY_VARIANT_RE = /^[ie][ns][ft][jp]-[at]$/i;

type IntpSceneRenderBlock = {
  summary: string;
  strengths: string[];
  risks: string[];
  why: string;
  variantDelta: string;
  nextLinks: {
    key: string;
    label: string;
    href: string;
  }[];
};

type IntpTrackedLink = {
  href: string;
  eventProperties: ReturnType<typeof buildMbtiEntryTrackingPayload>;
};

function buildIntpTrackedLink(
  link: { href: string; key: string; label: string },
  sourcePath: string,
  locale: Locale,
  sourcePageType: "personality_detail",
  targetAction: string
): IntpTrackedLink | null {
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
  const subtitle = locale === "zh" ? "公开人格入口" : "Public personality entry";
  const summary =
    locale === "zh"
      ? `${displayType} 的公开内容入口已保持可访问。当前显示的是 SEO-safe gateway fallback，不会替代权威的人格内容真相。`
      : `The public entry for ${displayType} stays reachable with an SEO-safe gateway fallback. This does not replace the authoritative personality content truth.`;

  return {
    slug: routeSlug,
    routeSlug,
    locale,
    isIndexable: false,
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
  const intpPersonalityContent = getIntpPersonalityContent(detail.routeSlug, locale);
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
  const landingSurface = detail.landingSurface;
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "entry_view",
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_primary",
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiLandingHref = localizedPath("/tests/mbti-personality-test-16-personality-types", locale);
  const personalityScenarioDeepModules = buildMbtiPersonalityScenarioDeepModules({
    locale,
    typeCode: detail.canonicalTypeCode,
  });
  const personalityHasGrowthScene = personalityScenarioDeepModules.some((module) => module.sceneKey === "growth_planning");
  const shouldShowIntpSceneBlocks = !!intpPersonalityContent;

  const renderIntpSceneBlock = (
    label: string,
    block: IntpSceneRenderBlock,
    anchor: string,
    sourcePath: string
  ): JSX.Element => (
    <Card id={anchor}>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">{block.summary}</p>
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
          <span className="font-medium text-[var(--fm-text)]">
            {locale === "zh" ? "A/T 差异：" : "A/T split:"}
          </span>{" "}
          {block.variantDelta}
        </p>
        <div className="flex flex-wrap gap-2">
          {block.nextLinks.slice(0, 3).map((link) => {
            const targetAction = `start_mbti_test_${anchor}_continuation`;
            const trackedLink = buildIntpTrackedLink(link, sourcePath, locale, "personality_detail", targetAction);
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
        <div className="flex flex-wrap items-center gap-3 pt-1" data-testid="mbti-personality-entry-cta-group">
          <TrackedEntryCtaLink
            href={mbtiPrimaryCtaHref}
            prefetch
            data-testid="mbti-personality-primary-cta"
            eventProperties={mbtiPrimaryCtaTrackingProps}
            className={buttonVariants({ size: "lg" })}
          >
            {locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test"}
          </TrackedEntryCtaLink>
          <Link
            href={mbtiLandingHref}
            data-testid="mbti-personality-secondary-cta"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {locale === "zh" ? "查看测试介绍" : "View test overview"}
          </Link>
        </div>
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
        {shouldShowIntpSceneBlocks ? (
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "INTP 场景定位补充" : "INTP scene positioning"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">
                  {locale === "zh" ? "定位句" : "Positioning"}
                </span>{" "}
                {intpPersonalityContent.heroPositioning}
              </p>
              <p className="m-0">{intpPersonalityContent.heroCoreStrength}</p>
              <p className="m-0">{intpPersonalityContent.heroRealWorldFriction}</p>
              <p className="m-0">{intpPersonalityContent.heroNextStepHint}</p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">
                  {locale === "zh" ? "A/T 分化" : "A/T distinction"}
                </span>{" "}
                {intpPersonalityContent.variantDelta}
              </p>
            </CardContent>
          </Card>
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
            ? personalityHasGrowthScene
              ? "在类型页里直接完成场景解释与下一步路径选择，并补上成长建议的执行路径。"
              : "在类型页里直接完成场景解释与下一步路径选择。"
            : personalityHasGrowthScene
              ? "Use type detail as the primary layer for scenario explanation, next-step routing, and growth execution."
              : "Use type detail as the primary layer for scenario explanation and next-step routing."
        }
      />
      {shouldShowIntpSceneBlocks && intpPersonalityContent ? (
        <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "INTP-Hub：职业 / 协作 / 成长" : "INTP hub: career / collaboration / growth"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "在类型页完成 4 大核心场景的差异化解释，让“能理解”变成“可执行”。"
              : "Deliver differentiated explanations for the four core scenarios so understanding turns into execution."}
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {renderIntpSceneBlock(
              locale === "zh" ? "职业方向" : "Career direction",
              intpPersonalityContent.careerDirection,
              "intp-personality-scene-career",
              canonicalPath
            )}
            {renderIntpSceneBlock(
              locale === "zh" ? "团队协作" : "Team collaboration",
              intpPersonalityContent.teamCollaboration,
              "intp-personality-scene-team",
              canonicalPath
            )}
            {renderIntpSceneBlock(
              locale === "zh" ? "成长建议" : "Growth planning",
              intpPersonalityContent.growthPlanning,
              "intp-personality-scene-growth",
              canonicalPath
            )}
          </div>
        </section>
      ) : null}

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
          {shouldShowIntpSceneBlocks && intpPersonalityContent ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{locale === "zh" ? "Next steps / 继续入口" : "Next steps / Continue"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                  <div className="space-y-2">
                    <Link href={intpPersonalityContent.topicBacklink.href} className="fm-help-chip-link">
                      {intpPersonalityContent.topicBacklink.label}
                    </Link>
                    <Link href={intpPersonalityContent.recommendationBacklink.href} className="fm-help-chip-link">
                      {intpPersonalityContent.recommendationBacklink.label}
                    </Link>
                    <Link href={intpPersonalityContent.testEntryLink.href} className="fm-help-chip-link">
                      {intpPersonalityContent.testEntryLink.label}
                    </Link>
                  </div>
                  <p className="m-0 text-xs text-[var(--fm-text-muted)]">
                    {locale === "zh" ? "通过以下内容承接：职业、协作与成长场景。" : "Continue via career, collaboration and growth contexts."}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{locale === "zh" ? "相关阅读" : "Related guides / articles"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                  <div className="flex flex-wrap gap-2">
                    {[...intpPersonalityContent.linkedGuides, ...intpPersonalityContent.linkedArticles].map((link) => (
                      <Link key={link.key} href={link.href} className="fm-help-chip-link">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
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
                  <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                    {cta.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

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
