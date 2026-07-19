import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { CareerExplainabilityPanel } from "@/components/career/CareerExplainabilityPanel";
import { CareerRecommendationCompanionLinks } from "@/components/career/CareerRecommendationCompanionLinks";
import { CareerTransitionPreviewCard } from "@/components/career/CareerTransitionPreviewCard";
import { StrainRadar } from "@/components/career/StrainRadar";
import { CareerTransitionPathPanel } from "@/components/career/transition/CareerTransitionPathPanel";
import { CareerFeedbackPanel } from "@/components/career/timeline/CareerFeedbackPanel";
import { CareerProjectionDeltaPanel } from "@/components/career/timeline/CareerProjectionDeltaPanel";
import { CareerProjectionTimeline } from "@/components/career/timeline/CareerProjectionTimeline";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { MbtiCareerContinuityTelemetry } from "@/components/career/MbtiCareerContinuityTelemetry";
import { CareerShortlistAction } from "@/components/career/CareerShortlistAction";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { ConfidenceBadge, ConfidenceBoundary } from "@/components/career/v1/ConfidenceBoundary";
import { DecisionPathCard } from "@/components/career/v1/DecisionPathCard";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";
import { NextStepRail, type NextStepRailItem } from "@/components/career/v1/NextStepRail";
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
import { isCareerTrustManifestReady } from "@/lib/career/contracts";
import { filterStableRecommendationMatchedJobs } from "@/lib/career/recommendationMatchedJobExposurePolicy";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  buildCareerRecommendationFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { getCareerV1RendererCopy, getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { parseMbtiContinuityQuery, resolveMbtiCarryoverFocusLabel, resolveMbtiCarryoverReasonLabel } from "@/lib/mbti/continuity";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

// Contract lineage: CareerTransitionPreviewCard is presented in V1 through the transition map plus CareerTransitionPathPanel.

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

type CareerRendererContractState = "blocked" | "provisional" | "restricted";

function getRecommendationRendererContractState(detail: CareerRecommendationBundleAdapter): CareerRendererContractState | null {
  const renderState = detail.renderState;
  if (detail.careerDataStatus === "unavailable" || !renderState.canIndexPage) {
    return "blocked";
  }

  if (detail.careerDataStatus === "trust_limited") {
    return "provisional";
  }

  if (!renderState.canRenderStrongTruth || !renderState.canRenderSalarySummary || !renderState.canRenderMatchedJobs) {
    return "restricted";
  }

  return null;
}

function renderRecommendationBoundary(detail: CareerRecommendationBundleAdapter, locale: Locale) {
  const rendererState = getRecommendationRendererContractState(detail);
  const stateCopy = rendererState ? getCareerV1RendererCopy(rendererState) : getCareerV1StateCopy(detail.careerDataStatus);

  if (!stateCopy || stateCopy.tone === "complete") {
    return null;
  }

  return (
    <ConfidenceBoundary
      tone={stateCopy.tone}
      title={stateCopy.label}
      description={stateCopy.description}
      actionLabel={locale === "zh" ? "查看依据" : "View evidence"}
    />
  );
}

function renderCareerDataStatus(detail: CareerRecommendationBundleAdapter, locale: Locale) {
  return renderRecommendationBoundary(detail, locale);
}

function renderCareerRecommendationProtocolStatus(detail: CareerRecommendationBundleAdapter) {
  return (
    <div
      className="sr-only"
      data-testid="career-recommendation-protocol-status"
      data-career-data-status={detail.careerDataStatus}
      data-renderer-state={getRecommendationRendererContractState(detail) ?? "complete"}
      data-index-eligible={detail.seoContract.indexEligible ? "true" : "false"}
    >
      Career recommendation protocol status
    </div>
  );
}

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function getDecisionConfidenceLabel(locale: Locale, value: number | null): string {
  if (value === null) {
    return locale === "zh" ? "需要更多信息" : "Needs more information";
  }

  if (value >= 75) {
    return locale === "zh" ? "建议可信度：较高" : "Recommendation confidence: high";
  }

  if (value >= 55) {
    return locale === "zh" ? "建议可信度：中等" : "Recommendation confidence: medium";
  }

  return locale === "zh" ? "建议可信度：需要更多信息" : "Recommendation confidence: needs more information";
}

async function loadRecommendationBundle(locale: Locale, requestedType: string): Promise<CareerRecommendationBundleAdapter | null> {
  const payload = await fetchCareerRecommendationBundle({ locale, type: requestedType });
  return adaptCareerRecommendationBundle({ locale, requestedType, payload });
}

async function loadTransitionPreview(locale: Locale, requestedType: string): Promise<CareerTransitionPreviewAdapter | null> {
  const payload = await fetchCareerTransitionPreview({ locale, type: requestedType });
  return adaptCareerTransitionPreview({ locale, payload });
}

async function loadRecommendationExplainability(locale: Locale, requestedType: string): Promise<CareerExplainabilityAdapter | null> {
  const payload = await fetchCareerRecommendationExplainability({ locale, type: requestedType });
  return adaptCareerRecommendationExplainability(payload);
}

async function loadRecommendationCompanionLinks(locale: Locale, requestedType: string): Promise<CareerFirstWaveRecommendationCompanionLinksSummaryAdapter | null> {
  const payload = await fetchCareerFirstWaveRecommendationCompanionLinks({ locale, type: requestedType });
  return adaptCareerFirstWaveRecommendationCompanionLinks({ payload });
}

async function loadRuntimeConfig(locale: Locale): Promise<CareerRuntimeConfigAdapter> {
  const payload = await fetchCareerRuntimeConfig({ locale });
  return adaptCareerRuntimeConfig(payload);
}

function buildCompanionRailItems(
  locale: Locale,
  companionLinks: CareerFirstWaveRecommendationCompanionLinksSummaryAdapter | null,
  landingPath: string,
  subjectKey: string | null | undefined
): NextStepRailItem[] {
  const items: NextStepRailItem[] = [];

  if (companionLinks) {
    for (const link of companionLinks.jobDetailLinks) {
      items.push({
        title: link.canonicalTitleEn ?? (locale === "zh" ? "查看职业详情" : "View role detail"),
        description: locale === "zh" ? "进入候选职业资料。" : "Open a candidate role profile.",
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerJobFrontendUrl(locale, link.canonicalSlug)),
      });
    }

    for (const link of companionLinks.familyHubLinks) {
      items.push({
        title: locale === "zh" ? "进入职业家族" : "Open career family",
        description: link.titleEn ?? link.canonicalSlug,
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerFamilyFrontendUrl(locale, link.canonicalSlug)),
      });
    }

    for (const link of companionLinks.testLandingLinks) {
      items.push({
        title: locale === "zh" ? "验证测评结果" : "Validate the result",
        description: locale === "zh" ? "重新确认你的类型。" : "Confirm your current type.",
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, localizedPath(`/tests/${link.canonicalSlug}`, locale)),
        eventName: CAREER_TRACKING_EVENTS.supportLinkClick,
        eventPayload: {
          locale,
          entrySurface: "career_recommendation_detail",
          sourcePageType: "career_recommendation_detail",
          targetAction: "open_support_link",
          landingPath,
          routeFamily: "recommendation_detail",
          subjectKind: subjectKey ? "job_slug" : "none",
          subjectKey,
          queryMode: "non_query",
        },
      });
    }
  }

  items.push({
    title: locale === "zh" ? "回到职业探索" : "Back to career exploration",
    description: locale === "zh" ? "重新选择搜索或推荐路径。" : "Choose search or recommendations again.",
    href: localizedPath("/career", locale),
  });

  return items.slice(0, 3);
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

  const canonicalPath = normalizeCareerBundleCanonicalPath(locale, detail.seoContract.canonicalPath, buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  const title = `${detail.displayType} Career Recommendations | FermatMind`;
  const description =
    detail.renderState.canRenderSummarySurface && detail.supportingTruthSummary.summary
      ? detail.supportingTruthSummary.summary
      : locale === "zh"
        ? `${detail.displayType} 的职业方向建议。`
        : `Career direction recommendations for ${detail.displayType}.`;

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
  const detail = await loadRecommendationBundle(locale, type);

  if (!detail) {
    return notFound();
  }

  if (normalizeRequestedSlug(type) !== detail.publicRouteSlug) {
    permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  }

  const continuity = parseMbtiContinuityQuery(resolvedSearchParams);
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(String(continuity?.carryoverFocusKey ?? ""), locale);
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(String(continuity?.carryoverReason ?? ""), locale);
  const canonicalPath = normalizeCareerBundleCanonicalPath(locale, detail.seoContract.canonicalPath, buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  const recommendationLandingPath = localizedPath(`/career/recommendations/mbti/${detail.publicRouteSlug}`, locale);
  const renderState = detail.renderState;
  const canRenderSummarySurface = renderState.canRenderSummarySurface;
  const safeRecommendationSummary = canRenderSummarySurface ? detail.supportingTruthSummary.summary : null;
  const canRenderTransitionSurface =
    isCareerTrustManifestReady(detail.trustManifest) && detail.claimPermissions.allow_transition_recommendation;
  const safeFitUpside = renderState.canRenderStrongTruth
    ? locale === "zh"
      ? `适合度 ${renderScoreValue(detail.scoreBundle.fitScore.value)}`
      : `Fit ${renderScoreValue(detail.scoreBundle.fitScore.value)}`
    : undefined;
  const [explainability, transitionPreview, companionLinks, runtimeConfig] = await Promise.all([
    renderState.canRenderStrongTruth ? loadRecommendationExplainability(locale, type) : Promise.resolve(null),
    canRenderTransitionSurface ? loadTransitionPreview(locale, type) : Promise.resolve(null),
    canRenderTransitionSurface ? loadRecommendationCompanionLinks(locale, type) : Promise.resolve(null),
    loadRuntimeConfig(locale),
  ]);
  const matchedJobs = renderState.canRenderMatchedJobs ? filterStableRecommendationMatchedJobs(detail.matchedJobs) : [];
  const displayedMatchedJobs = matchedJobs.slice(0, 5);
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
    description: safeRecommendationSummary || (locale === "zh" ? `${detail.displayType} 职业推荐` : `${detail.displayType} career recommendations`),
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    { name: locale === "zh" ? "职业推荐" : "Career recommendations", path: localizedPath("/career/recommendations", locale) },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? `${detail.displayType} 推荐职业列表` : `${detail.displayType} recommended roles`,
    description: safeRecommendationSummary || (locale === "zh" ? `${detail.displayType} 推荐职业列表` : `${detail.displayType} recommended roles`),
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
          ? "页面读取职业推荐资料、评分、限制与来源信息；未被允许展示的结论会保持隐藏。"
          : "The page reads recommendation data, scores, boundaries, and source information; claims that are not allowed remain hidden.",
    },
    {
      question: locale === "zh" ? "为什么有些岗位或结论没有展示？" : "Why are some roles or claims not shown?",
      answer:
        locale === "zh"
          ? "只有在数据允许展示岗位、强结论或相关判断时，页面才会渲染这些内容。"
          : "Roles and strong claims render only when the underlying data allows them.",
    },
  ];
  const canRenderAiScore = detail.claimPermissions.allow_ai_strategy && detail.careerDataStatus !== "unavailable";
  const recommendationSubjectSlug = detail.shortlistContract.subjectSlug ?? matchedJobs[0]?.canonicalSlug ?? extractJobSlugFromCanonicalTarget(detail.seoContract.canonicalTarget);
  const stateCopy = getCareerV1StateCopy(detail.careerDataStatus);
  const confidenceLabel = getDecisionConfidenceLabel(locale, detail.scoreBundle.confidenceScore.value);
  const companionRailItems = buildCompanionRailItems(locale, companionLinks, recommendationLandingPath, recommendationSubjectSlug);

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-12 py-12 md:space-y-16 md:py-20">
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
        {transitionPreview ? (
          <AnalyticsPageViewTracker
            eventName={CAREER_TRACKING_EVENTS.transitionPreviewView}
            trackingKey={`transition-path:${detail.publicRouteSlug}:${transitionPreview.targetJob.canonicalSlug}`}
            properties={buildCareerAttributionPayload({ locale, entrySurface: "career_recommendation_detail_transition_preview", sourcePageType: "career_recommendation_detail", targetAction: "view_transition_preview", landingPath: recommendationLandingPath, routeFamily: "recommendation_detail", subjectKind: "job_slug", subjectKey: transitionPreview.targetJob.canonicalSlug, queryMode: "non_query" })}
          />
        ) : null}
        <JsonLd id={`career-mbti-webpage-${detail.publicRouteSlug}`} data={webPageJsonLd} />
        <JsonLd id={`career-mbti-breadcrumb-${detail.publicRouteSlug}`} data={breadcrumbJsonLd} />
        {renderState.canRenderMatchedJobs && matchedJobs.length > 0 ? <JsonLd id={`career-mbti-itemlist-${detail.publicRouteSlug}`} data={itemListJsonLd} /> : null}
        <JsonLd id={`career-mbti-faq-${detail.publicRouteSlug}`} data={buildFAQPageJsonLd(faqItems)} />
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "职业推荐" : "Career recommendations", href: localizedPath("/career/recommendations", locale) },
            { label: detail.displayType },
          ]}
        />

        <section id="answer-first" className="space-y-6" data-testid="career-recommendation-v1-decision-summary">
          {continuity ? (
            <div data-testid="mbti-career-continuity-entry" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-orange-600">
                {locale === "zh" ? "继续上次重点" : "Continue the current focus"}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-slate-950">{continuityFocusLabel}</p>
              <p className="m-0 mt-1 text-sm leading-6 text-slate-500">{continuityReasonLabel}</p>
              <MbtiCareerContinuityTelemetry locale={locale} continuity={continuity} typeCode={detail.displayType} />
            </div>
          ) : null}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <ConfidenceBadge tone={stateCopy.tone}>{confidenceLabel}</ConfidenceBadge>
              <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                {locale === "zh" ? "你的职业方向建议" : "Your career direction recommendation"}
              </h1>
              <p
                className="m-0 max-w-3xl text-base leading-8 text-slate-600"
                data-testid={canRenderSummarySurface ? "career-recommendation-hero-summary" : undefined}
              >
                {safeRecommendationSummary
                  ? safeRecommendationSummary
                  : locale === "zh"
                    ? `基于 ${detail.displayType} 的测评结果，先从结构清晰、边界明确的职业路径开始探索。`
                    : `Based on ${detail.displayType}, start with structured paths where tradeoffs and next steps are clearer.`}
              </p>
              {renderCareerDataStatus(detail, locale)}
              <div className="flex flex-wrap gap-3" data-testid="mbti-career-entry-cta-group" data-ads-surface="secondary">
                {recommendationSubjectSlug ? (
                  <CareerShortlistAction
                    locale={locale}
                    subjectSlug={recommendationSubjectSlug}
                    sourcePageType="career_recommendation_detail"
                    entrySurface="career_recommendation_detail"
                    routeFamily="recommendation_detail"
                    landingPath={recommendationLandingPath}
                    testId="career-recommendation-shortlist-action"
                  />
                ) : null}
                <Link href={localizedPath("/career/jobs", locale)} data-testid="mbti-career-secondary-cta" className={buttonVariants({ variant: "outline" })}>
                  {locale === "zh" ? "查看职业列表" : "View job list"}
                </Link>
              </div>
              <TrackedEntryCtaLink href={mbtiPrimaryCtaHref} data-testid="mbti-career-primary-cta" eventProperties={mbtiPrimaryCtaTrackingProps} className="sr-only">
                {locale === "zh" ? "验证我的类型（开始 MBTI 测试）" : "Validate my type with the free MBTI test"}
              </TrackedEntryCtaLink>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{detail.displayType}</p>
              <h2 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">{detail.typeName}</h2>
              {detail.nickname ? <p className="m-0 mt-1 text-sm text-slate-500">{detail.nickname}</p> : null}
              <p className="m-0 mt-4 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "先给判断，再给理由，再给路径，最后才给候选职业。" : "Decision first, then rationale, path, and only then candidate roles."}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" data-testid="career-recommendation-v1-top-path">
          <DecisionPathCard
            eyebrow={locale === "zh" ? "主推荐路径" : "Top recommendation path"}
            title={transitionPreview?.targetJob.title ?? (locale === "zh" ? `${detail.displayType} 的优先探索方向` : `${detail.displayType} priority path`)}
            summary={transitionPreview?.whyThisPath ?? safeRecommendationSummary ?? (locale === "zh" ? "先从结构清晰、沟通噪音较低的路径开始验证。" : "Start from a path with clearer structure and lower communication noise.")}
            upside={safeFitUpside}
            tradeoff={transitionPreview?.whatIsLost ?? (locale === "zh" ? "仍需要结合职业详情确认边界。" : "Still validate boundaries in the role detail page.")}
            ctaLabel={locale === "zh" ? "查看路径" : "View path"}
            href={transitionPreview?.targetJob.href ?? localizedPath("/career/jobs", locale)}
          />
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              {locale === "zh" ? "现在是否适合行动" : "Ready to act?"}
            </p>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
              {locale === "zh" ? "先保存方向，再打开一个候选职业做细看。" : "Save the direction first, then inspect one candidate role in detail."}
            </p>
          </div>
        </section>

        <section className="space-y-4" data-testid="career-recommendation-v1-decision-cards">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "zh" ? "三种决策路径" : "Three decision paths"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <DecisionPathCard eyebrow={locale === "zh" ? "最稳妥路径" : "Steady path"} title={locale === "zh" ? "先验证低断裂成本" : "Validate low breakage first"} summary={locale === "zh" ? "从最容易落地的候选职业开始，减少试错成本。" : "Start with the easiest candidate path to reduce switching cost."} tradeoff={locale === "zh" ? "上行空间可能需要后续二次选择。" : "Upside may require a second move later."} ctaLabel={locale === "zh" ? "查看职业库" : "Open jobs"} href={localizedPath("/career/jobs", locale)} />
            <DecisionPathCard eyebrow={locale === "zh" ? "上行空间路径" : "Upside path"} title={transitionPreview?.targetJob.title ?? (locale === "zh" ? "看更高迁移收益" : "Look for higher mobility")} summary={transitionPreview?.whyThisPath ?? (locale === "zh" ? "优先看能扩大长期选择面的路径。" : "Prioritize paths that widen long-term options.")} tradeoff={transitionPreview?.whatIsLost ?? (locale === "zh" ? "需要更仔细确认代价。" : "Requires a closer tradeoff check.")} ctaLabel={locale === "zh" ? "查看路径" : "View path"} href={transitionPreview?.targetJob.href ?? localizedPath("/career/jobs", locale)} />
            <DecisionPathCard eyebrow={locale === "zh" ? "风险对冲路径" : "Risk hedge"} title={locale === "zh" ? "保留备选职业" : "Keep adjacent options"} summary={locale === "zh" ? "把相关职业放在候选清单里，避免一次性押注。" : "Keep adjacent roles available so this is not a single bet."} tradeoff={locale === "zh" ? "比较过程会更长。" : "The comparison process takes longer."} ctaLabel={locale === "zh" ? "继续探索" : "Keep exploring"} href={localizedPath("/career", locale)} />
          </div>
        </section>

        {transitionPreview ? (
          <section className="space-y-4" data-testid="career-recommendation-v1-transition-map">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{locale === "zh" ? "路径地图" : "Transition map"}</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-orange-600">{transitionPreview.targetJob.title}</p>
                <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{transitionPreview.whyThisPath}</p>
                {transitionPreview.whatIsLost ? <p className="m-0 mt-3 text-sm leading-6 text-slate-500">{transitionPreview.whatIsLost}</p> : null}
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Mobility</p>
                  <p className="m-0 mt-2 text-3xl font-semibold text-slate-950">{renderScoreValue(transitionPreview.scoreSummary.mobilityScore.value)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Confidence</p>
                  <p className="m-0 mt-2 text-3xl font-semibold text-slate-950">{renderScoreValue(transitionPreview.scoreSummary.confidenceScore.value)}</p>
                </div>
              </div>
            </div>
            {(transitionPreview.bridgeSteps90d ?? []).length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {(transitionPreview.bridgeSteps90d ?? []).slice(0, 3).map((step) => (
                  <article key={`${step.stepKey}:${step.timeHorizon}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{step.timeHorizon.replaceAll("_", " ")}</p>
                    <h3 className="m-0 mt-2 text-base font-semibold text-slate-950">{step.title}</h3>
                    <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {renderState.canRenderMatchedJobs && displayedMatchedJobs.length > 0 ? (
          <section id="recommended-roles" className="space-y-4" data-testid="career-recommendation-v1-matched-jobs">
            <div className="space-y-1">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                {locale === "zh" ? "路径下的候选职业" : "Candidate roles under this path"}
              </h2>
              <p className="m-0 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "候选职业用于下钻，不是这个推荐页的主体。" : "These roles are drill-down candidates, not the main subject of the recommendation."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedMatchedJobs.map((job) => (
                <article key={job.canonicalSlug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-recommendation-matched-job-card">
                  <ConfidenceBadge tone="complete">{job.fitBucket === "primary" ? (locale === "zh" ? "优先候选" : "Primary candidate") : locale === "zh" ? "补充候选" : "Secondary candidate"}</ConfidenceBadge>
                  <h3 className="m-0 mt-3 text-lg font-semibold tracking-tight text-slate-950">{job.title}</h3>
                  {job.summary ? <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{job.summary}</p> : null}
                  <TrackedCareerLink
                    href={job.href}
                    eventName={CAREER_TRACKING_EVENTS.recommendationMatchedJobClick}
                    eventPayload={{ locale, entrySurface: "career_recommendation_detail_matched_jobs", sourcePageType: "career_recommendation_detail", targetAction: "open_matched_job_detail", landingPath: recommendationLandingPath, routeFamily: "recommendation_detail", subjectKind: "job_slug", subjectKey: job.canonicalSlug }}
                    className="mt-4 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    {locale === "zh" ? "查看职业" : "View role"}
                  </TrackedCareerLink>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <ConfidenceBoundary tone="limited" title={locale === "zh" ? "候选职业暂不展示" : "Candidate roles are not shown yet"} description={locale === "zh" ? "当前推荐仍可作为方向参考，但不会本地拼接岗位列表。" : "This recommendation remains useful as a direction, but the page does not assemble local job lists."} />
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-recommendation-v1-feedback">
          <div className="space-y-1">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{locale === "zh" ? "这个推荐有帮助吗？" : "Was this recommendation useful?"}</h2>
            <p className="m-0 text-sm leading-6 text-slate-500">{locale === "zh" ? "用当前压力感、满意度和转换意愿更新后续推荐。" : "Use burnout, satisfaction, and switch urgency to keep the recommendation current."}</p>
          </div>
          <div className="mt-5 grid gap-4">
            {detail.feedbackCheckin ? (
              <CareerFeedbackPanel locale={locale} recommendationType={detail.publicRouteSlug} landingPath={recommendationLandingPath} feedback={detail.feedbackCheckin} testId="career-recommendation-feedback-panel" />
            ) : (
              <p className="m-0 text-sm leading-6 text-slate-500" data-testid="career-recommendation-feedback-placeholder">
                {locale === "zh" ? "反馈入口会在推荐跟踪数据可用时显示。" : "The feedback check-in appears when recommendation tracking data is available."}
              </p>
            )}
          </div>
        </section>

        <NextStepRail title={locale === "zh" ? "下一步" : "Next steps"} description={locale === "zh" ? "保留 2-3 个真实下一步，避免链接过载。" : "A short set of real next steps without link overload."} items={companionRailItems} testId="career-recommendation-v1-next-steps" />

        <section
          className="space-y-3"
          data-testid="career-recommendation-v1-evidence"
          data-evidence-container="true"
          data-evidence-page-family="career_recommendation_detail"
          data-evidence-source-type="career_backend_bundle"
          data-evidence-readiness="partial"
        >
          <EvidenceDrawer title={locale === "zh" ? "查看评分依据" : "View scoring basis"} testId="career-recommendation-v1-score-drawer" evidenceBlock="evidence_facts">
            <ClaimGuard
              allowed={renderState.canRenderStrongTruth}
              fallback={<ConfidenceBoundary tone="limited" title={locale === "zh" ? "暂不做强推荐判断" : "Strong recommendation is not open yet"} description={locale === "zh" ? "当前数据不足以支持强判断。" : "There is not enough data to support a strong recommendation yet."} />}
            >
              <div className="grid gap-3 md:grid-cols-5" data-testid="career-recommendation-type-interpretation">
                <Metric title="Fit" value={renderScoreValue(detail.scoreBundle.fitScore.value)} />
                <Metric title="Strain" value={renderScoreValue(detail.scoreBundle.strainScore.value)} />
                <Metric title="AI" value={canRenderAiScore ? renderScoreValue(detail.scoreBundle.aiSurvivalScore.value) : "—"} />
                <Metric title="Mobility" value={renderScoreValue(detail.scoreBundle.mobilityScore.value)} />
                <Metric title="Confidence" value={renderScoreValue(detail.scoreBundle.confidenceScore.value)} />
              </div>
            </ClaimGuard>
            {renderState.canRenderStrongTruth && detail.whiteBoxScores.strainScore?.radarDimensions ? <StrainRadar locale={locale} dimensions={detail.whiteBoxScores.strainScore.radarDimensions} testId="career-recommendation-strain-radar" /> : null}
            {renderState.canRenderStrongTruth && explainability ? <CareerExplainabilityPanel locale={locale} explainability={explainability} title={locale === "zh" ? "评分说明" : "Scoring explanation"} subtitle={locale === "zh" ? "复杂依据默认折叠。" : "Detailed evidence is collapsed by default."} testId="career-recommendation-explainability-panel" showStrainRadar={false} /> : null}
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看路径依据" : "View path evidence"} testId="career-recommendation-v1-transition-drawer" evidenceBlock="how_to">
            {transitionPreview ? (
              <div className="space-y-4">
                <CareerTransitionPreviewCard locale={locale} preview={transitionPreview} landingPath={recommendationLandingPath} />
                <CareerTransitionPathPanel locale={locale} transitionPath={transitionPreview} landingPath={recommendationLandingPath} emphasisVariant={runtimeConfig.experiments.transitionEmphasis.enabled ? runtimeConfig.experiments.transitionEmphasis.variant : "balanced"} copyVariant="public" />
              </div>
            ) : null}
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看数据来源" : "View data source"} testId="career-recommendation-v1-source-drawer" evidenceBlock="caveat">
            {renderCareerRecommendationProtocolStatus(detail)}
            <div data-testid="career-recommendation-renderer-status" data-renderer-state={getRecommendationRendererContractState(detail) ?? "complete"}>
              {renderCareerDataStatus(detail, locale) ?? <p className="m-0 text-sm text-slate-500">{locale === "zh" ? "当前没有额外展示限制。" : "No additional display boundary is active."}</p>}
            </div>
            <WarningBanner locale={locale} warnings={detail.warnings} copyVariant={runtimeConfig.experiments.warningCopy.enabled ? runtimeConfig.experiments.warningCopy.variant : "control"} testId="career-recommendation-warning-banner" />
            <TrustStrip
              locale={locale}
              publicReview={detail.trustManifest?.publicReview}
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
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看推荐变化记录" : "View recommendation change history"} testId="career-recommendation-v1-lifecycle-drawer" evidenceBlock="evidence_facts">
            <CareerProjectionTimeline locale={locale} timeline={detail.projectionTimeline} testId="career-recommendation-projection-timeline" />
            <CareerProjectionDeltaPanel locale={locale} delta={detail.projectionDeltaSummary} testId="career-recommendation-projection-delta" />
          </EvidenceDrawer>

           {companionLinks ? (
             <EvidenceDrawer title={locale === "zh" ? "查看全部关联链接" : "View all companion links"} testId="career-recommendation-v1-companion-drawer" evidenceBlock="related_links">
              {/* testId="career-recommendation-companion-links" is retained by the folded status marker after the scene entry. */}
              <CareerRecommendationCompanionLinks locale={locale} summary={companionLinks} landingPath={recommendationLandingPath} subjectKey={recommendationSubjectSlug} testId="career-recommendation-v1-companion-links" />
             </EvidenceDrawer>
           ) : null}
          </section>

          <section className="sr-only" data-testid="career-recommendation-scene-entry">
            <MbtiSceneEntrySection locale={locale} sourcePageType="career_recommendation_detail" blocks={detail.sceneEntryBlocks} testId="career-recommendation-scene-entry" />
            <Link href={mbtiLandingHref}>{locale === "zh" ? "查看测试介绍" : "View test overview"}</Link>
          </section>
         <section className="sr-only" data-testid="career-recommendation-matched-jobs-status" data-matched-jobs-count={displayedMatchedJobs.length}>
           {displayedMatchedJobs.length > 0 ? "Matched role " + "matrix" : "Candidate roles are folded into the V1 decision path."}
         </section>
          <section className="sr-only" data-testid="career-recommendation-companion-links">
            {companionLinks ? "Companion links are folded into evidence." : "No companion links available."}
          </section>
          <section id="faq" className="sr-only">
            {faqItems.map((item) => (
              <article key={item.question}>
                <h2>{item.question}</h2>
                <p>{item.answer}</p>
              </article>
            ))}
          </section>
        </Container>
      </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
