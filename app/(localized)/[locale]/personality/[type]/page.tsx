import type { Metadata } from "next";
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
  buildMbtiEntryHref,
  buildMbtiEntryTrackingPayload,
} from "@/lib/mbti/entryTracking";
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

function stripZhPersonalityTypeSuffix(value: string): string {
  return value.replace(/型$/u, "").trim();
}

function formatPersonalityDetailHeading(detail: PersonalityProjectionViewModel, locale: Locale): string {
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
        { key: "take_test", label: "Take the test", description: "Confirm your type", href: testHref, kind: "test" },
      ];
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
  const fallbackProjectionGate = resolvePersonalityFallbackProjectionGate(detail);
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
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{heroHeading}</h1>
        {locale !== "zh" && detail.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{detail.summary}</p> : null}
        {detail.heroSummary && detail.heroSummary !== detail.summary ? (
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.heroSummary}</p>
        ) : null}
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
