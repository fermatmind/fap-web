import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { CareerExplainabilityPanel } from "@/components/career/CareerExplainabilityPanel";
import { CareerRecommendationCompanionLinks } from "@/components/career/CareerRecommendationCompanionLinks";
import { StrainRadar } from "@/components/career/StrainRadar";
import { CareerTransitionPathPanel } from "@/components/career/transition/CareerTransitionPathPanel";
import { CareerFeedbackPanel } from "@/components/career/timeline/CareerFeedbackPanel";
import { CareerProjectionDeltaPanel } from "@/components/career/timeline/CareerProjectionDeltaPanel";
import { CareerProjectionTimeline } from "@/components/career/timeline/CareerProjectionTimeline";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { MbtiCareerContinuityTelemetry } from "@/components/career/MbtiCareerContinuityTelemetry";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { adaptCareerRecommendationExplainability } from "@/lib/career/adapters/adaptCareerExplainability";
import { adaptCareerFirstWaveRecommendationCompanionLinks } from "@/lib/career/adapters/adaptCareerFirstWaveRecommendationCompanionLinks";
import { adaptCareerRecommendationBundle } from "@/lib/career/adapters/adaptCareerRecommendationBundle";
import { adaptCareerRuntimeConfig } from "@/lib/career/adapters/adaptCareerRuntimeConfig";
import { adaptCareerTransitionPreview } from "@/lib/career/adapters/adaptCareerTransitionPreview";
import type {
  CareerExplainabilityAdapter,
  CareerFirstWaveRecommendationCompanionLinksSummaryAdapter,
  CareerRecommendationBundleAdapter,
  CareerRuntimeConfigAdapter,
  CareerTransitionPreviewAdapter,
} from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { fetchCareerFirstWaveRecommendationCompanionLinks } from "@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks";
import { fetchCareerRecommendationExplainability } from "@/lib/career/api/fetchCareerRecommendationExplainability";
import { fetchCareerRecommendationBundle } from "@/lib/career/api/fetchCareerRecommendationBundle";
import { fetchCareerRuntimeConfig } from "@/lib/career/api/fetchCareerRuntimeConfig";
import { fetchCareerTransitionPreview } from "@/lib/career/api/fetchCareerTransitionPreview";
import { filterStableRecommendationMatchedJobs } from "@/lib/career/recommendationMatchedJobExposurePolicy";
import { buildCareerRecommendationFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import {
  parseMbtiContinuityQuery,
  resolveMbtiCarryoverFocusLabel,
  resolveMbtiCarryoverReasonLabel,
} from "@/lib/mbti/continuity";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function normalizeRequestedSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function shouldNoindex(indexState: string | null | undefined): boolean {
  const normalized = String(indexState ?? "").trim().toLowerCase();
  return normalized === "blocked" || normalized === "noindex" || normalized === "unavailable";
}

function extractJobSlugFromCanonicalTarget(canonicalTarget: string | null): string | null {
  if (!canonicalTarget) {
    return null;
  }

  const match = canonicalTarget.match(/\/career\/jobs\/([^/?#]+)/i);
  const slug = match?.[1]?.trim().toLowerCase();
  return slug || null;
}

function renderCareerDataStatus(detail: CareerRecommendationBundleAdapter, locale: Locale) {
  if (detail.careerDataStatus === "available") {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950"
      data-testid="career-recommendation-protocol-status"
      data-career-data-status={detail.careerDataStatus}
    >
      <p className="m-0 font-medium">
        {detail.careerDataStatus === "trust_limited"
          ? locale === "zh"
            ? "当前为 trust-limited 渲染"
            : "Rendering in trust-limited mode"
          : locale === "zh"
            ? "当前内容不可用"
            : "Career data is currently unavailable"}
      </p>
      <p className="m-0 mt-2 leading-7">
        {locale === "zh"
          ? "当前 recommendation 页面只消费 backend authority bundle，并直接遵守 claim / trust / index gate。没有明确 bundle section 时，页面不会本地合成职业解释。"
          : "This recommendation page now consumes backend authority bundles only and follows explicit claim, trust, and index gates. When explicit bundle sections are missing, it does not synthesize local career explanations."}
      </p>
      {detail.renderState.missingFields.length > 0 ? (
        <p className="m-0 mt-2 text-xs uppercase tracking-[0.08em] text-amber-900/80">
          {locale === "zh" ? "缺失字段" : "Missing fields"}: {detail.renderState.missingFields.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

type CareerRendererContractState = "blocked" | "provisional" | "restricted";

function getRecommendationRendererContractState(
  detail: CareerRecommendationBundleAdapter
): CareerRendererContractState | null {
  const renderState = detail.renderState;
  if (detail.careerDataStatus === "unavailable" || !renderState.canIndexPage) {
    return "blocked";
  }

  if (detail.careerDataStatus === "trust_limited") {
    return "provisional";
  }

  if (
    !renderState.canRenderStrongTruth ||
    !renderState.canRenderSalarySummary ||
    !renderState.canRenderMatchedJobs
  ) {
    return "restricted";
  }

  return null;
}

function renderRecommendationRendererContractStatus(
  detail: CareerRecommendationBundleAdapter,
  locale: Locale
) {
  const state = getRecommendationRendererContractState(detail);
  if (!state) {
    return null;
  }

  const titleMap: Record<CareerRendererContractState, string> = {
    blocked: locale === "zh" ? "Renderer 状态：Blocked" : "Renderer state: Blocked",
    provisional: locale === "zh" ? "Renderer 状态：Provisional" : "Renderer state: Provisional",
    restricted: locale === "zh" ? "Renderer 状态：Restricted" : "Renderer state: Restricted",
  };

  const bodyMap: Record<CareerRendererContractState, string> = {
    blocked:
      locale === "zh"
        ? "当前推荐页只保留身份与边界信息，claim-sensitive 主内容保持阻断。"
        : "This recommendation page keeps identity and boundary information only; claim-sensitive primary content remains blocked.",
    provisional:
      locale === "zh"
        ? "当前推荐页处于 provisional 渲染，只展示后端明确可用的保守层。"
        : "This recommendation page is rendering in provisional mode and only shows conservative layers explicitly available from backend truth.",
    restricted:
      locale === "zh"
        ? "当前推荐页可渲染，但部分 claim-sensitive 区块受限。"
        : "This recommendation page is renderable, but part of the claim-sensitive surfaces are restricted.",
  };

  return (
    <section
      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid="career-recommendation-renderer-status"
      data-renderer-state={state}
    >
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{titleMap[state]}</h2>
      <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">{bodyMap[state]}</p>
    </section>
  );
}

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function ScoreCard({
  title,
  value,
  integrity,
}: {
  title: string;
  value: number | null;
  integrity: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{title}</p>
      <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">{renderScoreValue(value)}</p>
      <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">{integrity}</p>
    </div>
  );
}

async function loadRecommendationBundle(
  locale: Locale,
  requestedType: string
): Promise<CareerRecommendationBundleAdapter | null> {
  const payload = await fetchCareerRecommendationBundle({ locale, type: requestedType });
  return adaptCareerRecommendationBundle({
    locale,
    requestedType,
    payload,
  });
}

async function loadTransitionPreview(
  locale: Locale,
  requestedType: string
): Promise<CareerTransitionPreviewAdapter | null> {
  const payload = await fetchCareerTransitionPreview({ locale, type: requestedType });

  return adaptCareerTransitionPreview({
    locale,
    payload,
  });
}

async function loadRecommendationExplainability(
  locale: Locale,
  requestedType: string
): Promise<CareerExplainabilityAdapter | null> {
  const payload = await fetchCareerRecommendationExplainability({ locale, type: requestedType });
  return adaptCareerRecommendationExplainability(payload);
}

async function loadRecommendationCompanionLinks(
  locale: Locale,
  requestedType: string
): Promise<CareerFirstWaveRecommendationCompanionLinksSummaryAdapter | null> {
  const payload = await fetchCareerFirstWaveRecommendationCompanionLinks({ locale, type: requestedType });
  return adaptCareerFirstWaveRecommendationCompanionLinks({ payload });
}

async function loadRuntimeConfig(locale: Locale): Promise<CareerRuntimeConfigAdapter> {
  const payload = await fetchCareerRuntimeConfig({ locale });
  return adaptCareerRuntimeConfig(payload);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const detail = await loadRecommendationBundle(locale, type);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    detail.seoContract.canonicalPath,
    buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug)
  );
  const title = `${detail.displayType} Career Recommendations | FermatMind`;
  const description =
    detail.supportingTruthSummary.summary ||
    (locale === "zh"
      ? `${detail.displayType} 的职业推荐评分、信任边界与风险提示。`
      : `Career recommendation scores, trust boundaries, and warnings for ${detail.displayType}.`);

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title,
    description,
    explicitIndexGate: {
      indexEligible: detail.seoContract.indexEligible,
      indexState: detail.seoContract.indexState,
    },
    noindex: !detail.renderState.canIndexPage || shouldNoindex(detail.seoContract.indexState),
    alternatesByLocale: {
      en: buildCareerRecommendationFrontendUrl("en", detail.publicRouteSlug),
      zh: buildCareerRecommendationFrontendUrl("zh", detail.publicRouteSlug),
      xDefault: "/",
    },
  });
}

export default async function CareerMbtiRecommendationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, type } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const [detail, explainability, transitionPreview, companionLinks, runtimeConfig] = await Promise.all([
    loadRecommendationBundle(locale, type),
    loadRecommendationExplainability(locale, type),
    loadTransitionPreview(locale, type),
    loadRecommendationCompanionLinks(locale, type),
    loadRuntimeConfig(locale),
  ]);

  if (!detail) {
    return notFound();
  }

  if (normalizeRequestedSlug(type) !== detail.publicRouteSlug) {
    permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  }

  const continuity = parseMbtiContinuityQuery(resolvedSearchParams);
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(
    String(continuity?.carryoverFocusKey ?? ""),
    locale
  );
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(
    String(continuity?.carryoverReason ?? ""),
    locale
  );

  const canonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    detail.seoContract.canonicalPath,
    buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug)
  );
  const recommendationLandingPath = localizedPath(`/career/recommendations/mbti/${detail.publicRouteSlug}`, locale);
  const renderState = detail.renderState;
  const matchedJobs = renderState.canRenderMatchedJobs ? filterStableRecommendationMatchedJobs(detail.matchedJobs) : [];
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiLandingHref = withLocale("/tests/mbti-personality-test-16-personality-types");
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: `${detail.displayType} Career Recommendations | FermatMind`,
    description:
      detail.supportingTruthSummary.summary ||
      (locale === "zh" ? `${detail.displayType} 职业推荐` : `${detail.displayType} career recommendations`),
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    {
      name: locale === "zh" ? "职业推荐" : "Career recommendations",
      path: localizedPath("/career/recommendations", locale),
    },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? `${detail.displayType} 推荐职业列表` : `${detail.displayType} recommended roles`,
    description:
      detail.supportingTruthSummary.summary ||
      (locale === "zh" ? `${detail.displayType} 推荐职业列表` : `${detail.displayType} recommended roles`),
    locale,
    items: matchedJobs.map((job) => ({
      name: job.title,
      path: localizedPath(`/career/jobs/${job.canonicalSlug}`, locale),
      description: job.summary,
    })),
  });
  const faqItems = [
    {
      question: locale === "zh" ? "这页的职业推荐依据来自哪里？" : "Where do the recommendation signals on this page come from?",
      answer:
        locale === "zh"
          ? "当前页面直接消费 backend authority bundle，显式读取 score bundle、warnings、claim permissions、trust manifest 和 provenance meta，不在前端本地合成职业解释。"
          : "This page consumes the backend authority bundle directly and reads explicit score bundles, warnings, claim permissions, trust manifest, and provenance metadata without synthesizing local career explanations.",
    },
    {
      question: locale === "zh" ? "为什么有些岗位或结论没有展示？" : "Why are some roles or claims not shown?",
      answer:
        locale === "zh"
          ? "只有在 backend bundle 显式放行 matched jobs、strong truth 或相关 claim permission 时，页面才会渲染这些内容；否则保持保守隐藏。"
          : "The page only renders matched roles, strong-truth sections, or related claims when the backend bundle explicitly allows them; otherwise they stay conservatively hidden.",
    },
  ];
  const canRenderAiScore =
    detail.claimPermissions.allow_ai_strategy && detail.careerDataStatus !== "unavailable";
  const canRenderSummarySurface = renderState.canRenderSummarySurface;
  const canRenderSalarySummary = renderState.canRenderSalarySummary;
  const recommendationSubjectSlug =
    matchedJobs[0]?.canonicalSlug ??
    transitionPreview?.targetJob.canonicalSlug ??
    extractJobSlugFromCanonicalTarget(detail.seoContract.canonicalTarget);
  const recommendationSubjectKind = recommendationSubjectSlug ? "job_slug" : "none";
  const strongClaimBlocked =
    !renderState.canRenderStrongTruth &&
    !detail.claimPermissions.allow_strong_claim &&
    (detail.supportingTruthSummary.summary !== null ||
      detail.scoreBundle.fitScore.value !== null ||
      detail.matchedJobs.length > 0);
  const salaryClaimBlocked =
    !canRenderSalarySummary &&
    detail.supportingTruthSummary.medianPayUsdAnnual !== null &&
    !detail.claimPermissions.allow_salary_comparison;
  const aiStrategyClaimBlocked =
    renderState.canRenderStrongTruth &&
    !detail.claimPermissions.allow_ai_strategy &&
    detail.careerDataStatus !== "unavailable" &&
    detail.supportingTruthSummary.aiExposure !== null;
  const transitionRecommendationClaimBlocked =
    !renderState.canRenderMatchedJobs &&
    detail.matchedJobs.length > 0 &&
    !detail.claimPermissions.allow_transition_recommendation;

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <AnalyticsPageViewTracker
        eventName={CAREER_TRACKING_EVENTS.recommendationDetailView}
        properties={buildCareerAttributionPayload({
          locale,
          entrySurface: "career_recommendation_detail",
          sourcePageType: "career_recommendation_detail",
          targetAction: "view_surface",
          landingPath: recommendationLandingPath,
          routeFamily: "recommendation_detail",
          subjectKind: "recommendation_type",
          subjectKey: detail.publicRouteSlug,
        })}
      />
      {strongClaimBlocked ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
          trackingKey={`claim-blocked:strong-claim:${detail.publicRouteSlug}`}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_recommendation_detail",
            sourcePageType: "career_recommendation_detail",
            targetAction: "expose_claim_blocked_surface",
            landingPath: recommendationLandingPath,
            routeFamily: "recommendation_detail",
            subjectKind: recommendationSubjectKind,
            subjectKey: recommendationSubjectSlug,
            blockedClaimKind: "strong_claim",
          })}
        />
      ) : null}
      {salaryClaimBlocked ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
          trackingKey={`claim-blocked:salary:${detail.publicRouteSlug}`}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_recommendation_detail",
            sourcePageType: "career_recommendation_detail",
            targetAction: "expose_claim_blocked_surface",
            landingPath: recommendationLandingPath,
            routeFamily: "recommendation_detail",
            subjectKind: recommendationSubjectKind,
            subjectKey: recommendationSubjectSlug,
            blockedClaimKind: "salary",
          })}
        />
      ) : null}
      {aiStrategyClaimBlocked ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
          trackingKey={`claim-blocked:ai-strategy:${detail.publicRouteSlug}`}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_recommendation_detail",
            sourcePageType: "career_recommendation_detail",
            targetAction: "expose_claim_blocked_surface",
            landingPath: recommendationLandingPath,
            routeFamily: "recommendation_detail",
            subjectKind: recommendationSubjectKind,
            subjectKey: recommendationSubjectSlug,
            blockedClaimKind: "ai_strategy",
          })}
        />
      ) : null}
      {transitionRecommendationClaimBlocked ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
          trackingKey={`claim-blocked:transition:${detail.publicRouteSlug}`}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_recommendation_detail",
            sourcePageType: "career_recommendation_detail",
            targetAction: "expose_claim_blocked_surface",
            landingPath: recommendationLandingPath,
            routeFamily: "recommendation_detail",
            subjectKind: recommendationSubjectKind,
            subjectKey: recommendationSubjectSlug,
            blockedClaimKind: "transition_recommendation",
          })}
        />
      ) : null}
      {transitionPreview ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.transitionPreviewView}
          trackingKey={`transition-path:${detail.publicRouteSlug}:${transitionPreview.targetJob.canonicalSlug}`}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_recommendation_detail_transition_preview",
            sourcePageType: "career_recommendation_detail",
            targetAction: "view_transition_preview",
            landingPath: recommendationLandingPath,
            routeFamily: "recommendation_detail",
            subjectKind: "job_slug",
            subjectKey: transitionPreview.targetJob.canonicalSlug,
            queryMode: "non_query",
          })}
        />
      ) : null}
      <JsonLd id={`career-mbti-webpage-${detail.publicRouteSlug}`} data={webPageJsonLd} />
      <JsonLd id={`career-mbti-breadcrumb-${detail.publicRouteSlug}`} data={breadcrumbJsonLd} />
      {renderState.canRenderMatchedJobs && matchedJobs.length > 0 ? (
        <JsonLd id={`career-mbti-itemlist-${detail.publicRouteSlug}`} data={itemListJsonLd} />
      ) : null}
      <JsonLd id={`career-mbti-faq-${detail.publicRouteSlug}`} data={buildFAQPageJsonLd(faqItems)} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          {
            label: locale === "zh" ? "职业推荐" : "Career recommendations",
            href: localizedPath("/career/recommendations", locale),
          },
          { label: detail.displayType },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        {continuity ? (
          <>
            <div
              data-testid="mbti-career-continuity-entry"
              className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                {locale === "zh" ? "继续上次重点" : "Continue the current focus"}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-[var(--fm-text)]">{continuityFocusLabel}</p>
              <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{continuityReasonLabel}</p>
            </div>
            <MbtiCareerContinuityTelemetry
              locale={locale}
              continuity={continuity}
              typeCode={detail.displayType}
            />
          </>
        ) : null}
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {detail.displayType}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {detail.typeName}
          {detail.nickname ? <span className="text-[var(--fm-text-muted)]"> · {detail.nickname}</span> : null}
        </h1>
        {renderCareerDataStatus(detail, locale)}
        {canRenderSummarySurface && detail.supportingTruthSummary.summary ? (
          <p className="m-0 text-base leading-7 text-[var(--fm-text)]" data-testid="career-recommendation-hero-summary">
            {detail.supportingTruthSummary.summary}
          </p>
        ) : null}
        <div
          className="flex flex-wrap items-center gap-3 pt-1"
          data-testid="mbti-career-entry-cta-group"
          data-ads-surface="secondary"
        >
          <TrackedEntryCtaLink
            href={mbtiPrimaryCtaHref}
            prefetch
            data-testid="mbti-career-primary-cta"
            eventProperties={mbtiPrimaryCtaTrackingProps}
            className={buttonVariants({ size: "lg" })}
          >
            {locale === "zh" ? "验证我的类型（开始 MBTI 测试）" : "Validate my type (Start MBTI test)"}
          </TrackedEntryCtaLink>
          <Link
            href={mbtiLandingHref}
            data-testid="mbti-career-secondary-cta"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {locale === "zh" ? "查看测试介绍" : "View test overview"}
          </Link>
        </div>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]" data-testid="mbti-career-cta-guidance">
          {locale === "zh"
            ? "如果你是从职业意图进入，先用测试验证类型是否吻合，再用这页判断职业方向。"
            : "If you arrived with career intent, validate the type first so this recommendation page reflects your actual pattern."}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Authority route" : "Authority route"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">/{detail.publicRouteSlug}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Graph key" : "Graph key"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">{detail.graphTypeCode}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Canonical target" : "Canonical target"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">
              {detail.seoContract.canonicalTarget ?? detail.recommendationSubjectMeta.canonicalType ?? detail.graphTypeCode}
            </p>
          </div>
        </div>
      </section>

      <ClaimGuard allowed={renderState.canRenderStrongTruth}>
        <section
          className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          data-testid="career-recommendation-type-interpretation"
        >
          <div className="space-y-1">
            <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "推荐依据" : "Recommendation evidence"}
            </h2>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "这里展示的是 backend authority 已编译的 score bundle、warnings 与 claim gates。"
                : "This section shows backend-authoritative score bundles, warnings, and claim gates."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <ScoreCard title="Fit" value={detail.scoreBundle.fitScore.value} integrity={detail.scoreBundle.fitScore.integrity_state} />
            <ScoreCard title="Strain" value={detail.scoreBundle.strainScore.value} integrity={detail.scoreBundle.strainScore.integrity_state} />
            <ScoreCard title="AI" value={canRenderAiScore ? detail.scoreBundle.aiSurvivalScore.value : null} integrity={detail.scoreBundle.aiSurvivalScore.integrity_state} />
            <ScoreCard title="Mobility" value={detail.scoreBundle.mobilityScore.value} integrity={detail.scoreBundle.mobilityScore.integrity_state} />
            <ScoreCard title="Confidence" value={detail.scoreBundle.confidenceScore.value} integrity={detail.scoreBundle.confidenceScore.integrity_state} />
          </div>
        </section>
      </ClaimGuard>

      {detail.whiteBoxScores.strainScore?.radarDimensions ? (
        <StrainRadar
          locale={locale}
          dimensions={detail.whiteBoxScores.strainScore.radarDimensions}
          testId="career-recommendation-strain-radar"
        />
      ) : null}

      {explainability ? (
        <CareerExplainabilityPanel
          locale={locale}
          explainability={explainability}
          title={locale === "zh" ? "结构化 explainability" : "Structured explainability"}
          subtitle={
            locale === "zh"
              ? "这一节只消费 backend explainability authority payload 的结构化字段与受限 strain radar，不扩写为推荐建议或路径说明。"
              : "This section consumes structured fields and bounded strain-radar data from the backend explainability authority payload only, without turning them into recommendation advice or path guidance."
          }
          testId="career-recommendation-explainability-panel"
          showStrainRadar={false}
        />
      ) : null}

      {transitionPreview ? (
        <CareerTransitionPathPanel
          locale={locale}
          transitionPath={transitionPreview}
          landingPath={recommendationLandingPath}
          emphasisVariant={
            runtimeConfig.experiments.transitionEmphasis.enabled
              ? runtimeConfig.experiments.transitionEmphasis.variant
              : "balanced"
          }
        />
      ) : null}

      <CareerFeedbackPanel
        locale={locale}
        recommendationType={detail.publicRouteSlug}
        feedback={detail.feedbackCheckin}
        testId="career-recommendation-feedback-panel"
      />

      <CareerProjectionTimeline
        locale={locale}
        timeline={detail.projectionTimeline}
        testId="career-recommendation-projection-timeline"
      />

      <CareerProjectionDeltaPanel
        locale={locale}
        delta={detail.projectionDeltaSummary}
        testId="career-recommendation-projection-delta"
      />

      {renderRecommendationRendererContractStatus(detail, locale)}

      <WarningBanner
        locale={locale}
        warnings={detail.warnings}
        copyVariant={
          runtimeConfig.experiments.warningCopy.enabled ? runtimeConfig.experiments.warningCopy.variant : "control"
        }
        testId="career-recommendation-warning-banner"
      />

      <TrustStrip
        locale={locale}
        reviewerStatus={detail.trustManifest?.reviewer.reviewer_status}
        indexState={detail.seoContract.indexState}
        reasonCodes={detail.claimPermissions.reason_codes}
        contentVersion={detail.provenanceMeta.contentVersion}
        dataVersion={detail.provenanceMeta.dataVersion}
        logicVersion={detail.provenanceMeta.logicVersion}
        compilerVersion={detail.provenanceMeta.compilerVersion}
        compiledAt={detail.provenanceMeta.compiledAt}
        compileRunId={detail.provenanceMeta.compileRunId}
        truthMetricId={detail.provenanceMeta.truthMetricId}
        trustManifestId={detail.provenanceMeta.trustManifestId}
        indexStateId={detail.provenanceMeta.indexStateId}
        testId="career-recommendation-trust-strip"
      />

      <MbtiSceneEntrySection
        locale={locale}
        sourcePageType="career_recommendation_detail"
        blocks={detail.sceneEntryBlocks}
        testId="career-recommendation-scene-entry"
      />

      {canRenderSummarySurface &&
      (detail.supportingTruthSummary.summary ||
        detail.supportingTruthSummary.medianPayUsdAnnual !== null ||
        detail.supportingTruthSummary.outlookPct20242034 !== null ||
        detail.supportingTruthSummary.aiExposure !== null) ? (
        <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <div data-testid="career-recommendation-supporting-truth-summary" className="space-y-4">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "支持性事实摘要" : "Supporting truth summary"}
          </h2>
          <div className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            {detail.supportingTruthSummary.summary ? <p className="m-0">{detail.supportingTruthSummary.summary}</p> : null}
            {canRenderSalarySummary && detail.supportingTruthSummary.medianPayUsdAnnual !== null ? (
              <p className="m-0">median_pay_usd_annual: {detail.supportingTruthSummary.medianPayUsdAnnual}</p>
            ) : null}
            {detail.supportingTruthSummary.outlookPct20242034 !== null ? (
              <p className="m-0">outlook_pct_2024_2034: {detail.supportingTruthSummary.outlookPct20242034}%</p>
            ) : null}
            {canRenderAiScore && detail.supportingTruthSummary.aiExposure !== null ? (
              <p className="m-0">ai_exposure: {detail.supportingTruthSummary.aiExposure}</p>
            ) : null}
          </div>
          </div>
        </section>
      ) : null}

      {renderState.canRenderMatchedJobs && matchedJobs.length > 0 ? (
        <section
          id="recommended-roles"
          className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
        >
          <div className="space-y-1">
            <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "匹配岗位矩阵" : "Matched role matrix"}
            </h2>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "岗位列表只在 backend bundle 显式提供且 transition claim 放行时渲染。"
                : "The job list renders only when the backend bundle provides it explicitly and transition claims are allowed."}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--fm-border)] text-[var(--fm-text)]">
                  <th className="px-3 py-2">{locale === "zh" ? "Fit" : "Fit"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "岗位" : "Role"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "摘要" : "Summary"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "匹配编码" : "Matching codes"}</th>
                </tr>
              </thead>
              <tbody>
                {matchedJobs.map((job) => (
                  <tr
                    key={job.canonicalSlug}
                    className="border-b border-[var(--fm-border)] align-top text-[var(--fm-text-muted)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--fm-text)]">
                      {job.fitBucket === "primary" ? "Primary" : job.fitBucket === "secondary" ? "Secondary" : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <TrackedCareerLink
                        href={job.href}
                        eventName={CAREER_TRACKING_EVENTS.recommendationMatchedJobClick}
                        eventPayload={{
                          locale,
                          entrySurface: "career_recommendation_detail_matched_jobs",
                          sourcePageType: "career_recommendation_detail",
                          targetAction: "open_matched_job_detail",
                          landingPath: localizedPath(`/career/recommendations/mbti/${detail.publicRouteSlug}`, locale),
                          routeFamily: "recommendation_detail",
                          subjectKind: "job_slug",
                          subjectKey: job.canonicalSlug,
                        }}
                        className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                      >
                        {job.title}
                      </TrackedCareerLink>
                    </td>
                    <td className="px-3 py-3">{job.summary || "-"}</td>
                    <td className="px-3 py-3">
                      {[...job.fitPersonalityCodes, ...job.mbtiPrimaryCodes, ...job.mbtiSecondaryCodes].join(", ") || detail.graphTypeCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section
          className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          data-testid="career-recommendation-matched-jobs-status"
          data-career-data-status={detail.careerDataStatus}
        >
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "当前未拿到可渲染的 backend matched jobs，页面不会本地拼接岗位矩阵。"
              : "No renderable backend matched jobs are currently available, so this page does not assemble a local role matrix."}
          </p>
        </section>
      )}

      {companionLinks ? (
        <CareerRecommendationCompanionLinks
          locale={locale}
          summary={companionLinks}
          testId="career-recommendation-companion-links"
        />
      ) : null}

      {renderState.canRenderStrongTruth && detail.matchedGuides.length > 0 ? (
        <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "匹配指南" : "Matched guides"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {detail.matchedGuides.map((guide) => (
              <article key={guide.slug} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                <p className="m-0 text-lg font-semibold text-[var(--fm-text)]">
                  <Link href={guide.href} className="text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                    {guide.title}
                  </Link>
                </p>
                {guide.summary ? <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">{guide.summary}</p> : null}
                {guide.fitPersonalityCodes.length > 0 ? (
                  <p className="m-0 mt-2 text-xs text-[var(--fm-text-muted)]">
                    fit_personality_codes: {guide.fitPersonalityCodes.join(", ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="faq"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "常见问题" : "FAQ"}
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
              <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.question}</h3>
              <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

    </Container>
  );
}
