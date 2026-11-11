import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { CAREER_INTJ_TAIWAN_COPY } from "@/lib/career/explorationPilotTaiwan";
import { CAREER_EXPLORATION_PILOT } from "@/lib/career/explorationPilot";
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
import { DESIGN_COMPARE_HREF, DESIGN_COMPARE_LABEL, DESIGN_MBTI_EXPLORATION_NOTE, findDesignCareersByMbtiType } from "@/lib/career/designComparePilot";
import { filterStableRecommendationMatchedJobs } from "@/lib/career/recommendationMatchedJobExposurePolicy";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  buildCareerRecommendationFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { getCareerV1RendererCopy, getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, normalizeDisplayLocale, type DisplayLocale, type Locale } from "@/lib/i18n/locales";
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

function renderRecommendationBoundary(detail: CareerRecommendationBundleAdapter, locale: DisplayLocale) {
  const rendererState = getRecommendationRendererContractState(detail);
  const stateCopy = rendererState ? getCareerV1RendererCopy(rendererState, locale) : getCareerV1StateCopy(detail.careerDataStatus, locale);

  if (!stateCopy || stateCopy.tone === "complete") {
    return null;
  }

  return (
    <ConfidenceBoundary
      tone={stateCopy.tone}
      title={stateCopy.label}
      description={stateCopy.description}
      actionLabel={locale === "zh-TW" ? "查看依據" : locale === "zh" ? "查看依据" : "View evidence"}
    />
  );
}

function renderCareerDataStatus(detail: CareerRecommendationBundleAdapter, locale: DisplayLocale) {
  return renderRecommendationBoundary(detail, locale);
}

function renderCareerRecommendationProtocolStatus(detail: CareerRecommendationBundleAdapter, displayLocale: DisplayLocale) {
  return (
    <div
      className="sr-only"
      data-testid="career-recommendation-protocol-status"
      data-career-data-status={detail.careerDataStatus}
      data-renderer-state={getRecommendationRendererContractState(detail) ?? "complete"}
      data-index-eligible={detail.seoContract.indexEligible ? "true" : "false"}
    >
      {displayLocale === "zh-TW" ? "職涯建議資料狀態" : "Career recommendation protocol status"}
    </div>
  );
}

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function getDecisionConfidenceLabel(locale: DisplayLocale, value: number | null): string {
  if (value === null) {
    return locale === "zh-TW" ? "需要更多資訊" : locale === "zh" ? "需要更多信息" : "Needs more information";
  }

  if (value >= 75) {
    return locale === "zh-TW" ? "建議可信度較高" : locale === "zh" ? "建议可信度：较高" : "Recommendation confidence: high";
  }

  if (value >= 55) {
    return locale === "zh-TW" ? "建議可信度中等" : locale === "zh" ? "建议可信度：中等" : "Recommendation confidence: medium";
  }

  return locale === "zh-TW" ? "判斷建議可信度需要更多資訊" : locale === "zh" ? "建议可信度：需要更多信息" : "Recommendation confidence: needs more information";
}

async function loadRecommendationBundle(locale: DisplayLocale, requestedType: string): Promise<CareerRecommendationBundleAdapter | null> {
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
  displayLocale: DisplayLocale,
  traditionalJobTitles: ReadonlyMap<string, string> | undefined,
  companionLinks: CareerFirstWaveRecommendationCompanionLinksSummaryAdapter | null,
  landingPath: string,
  subjectKey: string | null | undefined
): NextStepRailItem[] {
  const linkHref = (href: string) => displayLocale === "zh-TW" ? traditionalPath(href) ?? href : href;
  const items: NextStepRailItem[] = [];

  if (companionLinks) {
    for (const link of companionLinks.jobDetailLinks) {
      items.push({
        title: traditionalJobTitles?.get(link.canonicalSlug) ?? link.canonicalTitleEn ?? (displayLocale === "zh-TW" ? "查看職業詳情" : locale === "zh" ? "查看职业详情" : "View role detail"),
        description: displayLocale === "zh-TW" ? "查看候選職業的資料。" : locale === "zh" ? "进入候选职业资料。" : "Open a candidate role profile.",
        href: linkHref(normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerJobFrontendUrl(locale, link.canonicalSlug))),
      });
    }

    for (const link of companionLinks.familyHubLinks) {
      items.push({
        title: displayLocale === "zh-TW" ? "瀏覽職業群組" : locale === "zh" ? "进入职业家族" : "Open career family",
        description: link.titleEn ?? link.canonicalSlug,
        href: linkHref(normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerFamilyFrontendUrl(locale, link.canonicalSlug))),
      });
    }

    for (const link of companionLinks.testLandingLinks) {
      items.push({
        title: displayLocale === "zh-TW" ? "驗證測驗結果" : locale === "zh" ? "验证测评结果" : "Validate the result",
        description: displayLocale === "zh-TW" ? "重新確認你的類型。" : locale === "zh" ? "重新确认你的类型。" : "Confirm your current type.",
        href: linkHref(normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, localizedPath(`/tests/${link.canonicalSlug}`, locale))),
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
    title: displayLocale === "zh-TW" ? "回到職涯探索" : locale === "zh" ? "回到职业探索" : "Back to career exploration",
    description: displayLocale === "zh-TW" ? "重新搜尋或瀏覽職涯建議。" : locale === "zh" ? "重新选择搜索或推荐路径。" : "Choose search or recommendations again.",
    href: linkHref(localizedPath("/career", locale)),
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
  const traditional = normalizeDisplayLocale(localeParam) === "zh-TW";
  const copy = (simplified: string, taiwan: string) => traditional ? taiwan : simplified;
  const detail = await loadRecommendationBundle(traditional ? "zh-TW" : locale, type);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  if (traditional) {
    return {
      title: `${detail.displayType} 職涯方向建議`,
      description: `查看 ${detail.displayType} 的職涯探索建議、資料限制和可行的下一步。`,
      alternates: { canonical: canonicalUrl(`/zh-TW/career/recommendations/mbti/${detail.publicRouteSlug}`) },
      robots: { index: false, follow: !isConfiguredStagingSiteUrl() },
    };
  }

  const canonicalPath = normalizeCareerBundleCanonicalPath(locale, detail.seoContract.canonicalPath, buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  const intjCopy = detail.publicRouteSlug === "intj" ? CAREER_EXPLORATION_PILOT.intj.copy[locale] : undefined;
  const title = intjCopy?.title ?? `${detail.displayType} Career Recommendations | FermatMind`;
  const description =
    detail.renderState.canRenderSummarySurface && detail.supportingTruthSummary.summary
      ? detail.supportingTruthSummary.summary
      : locale === "zh"
        ? copy(`${detail.displayType} 的职业方向建议。`, `${detail.displayType} 的職業方向建議。`)
        : `Career direction recommendations for ${detail.displayType}.`;

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title,
    description: intjCopy?.summary ?? description,
    explicitIndexGate: {
      indexEligible: detail.seoContract.indexEligible,
      indexState: detail.seoContract.indexState,
    },
    // The pilot's editorial examples do not qualify the shared recommendation data for indexing.
    noindex: Boolean(intjCopy) || !detail.renderState.canIndexPage || shouldNoindex(detail.seoContract.indexState),
    noindexFollow: Boolean(intjCopy),
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
  const traditional = normalizeDisplayLocale(localeParam) === "zh-TW";
  const copy = (simplified: string, taiwan: string) => traditional ? taiwan : simplified;
  const displayLocale = traditional ? "zh-TW" : locale;
  const withLocale = (pathname: string) => {
    const href = localizedPath(pathname, locale);
    return traditional ? traditionalPath(`/zh-TW${pathname}`) ?? href : href;
  };
  const PageRoot = traditional ? "div" : "main";
  const detail = await loadRecommendationBundle(traditional ? "zh-TW" : locale, type);

  if (!detail) {
    return notFound();
  }

  const recommendationLandingPath = withLocale(`/career/recommendations/mbti/${detail.publicRouteSlug}`);
  if (normalizeRequestedSlug(type) !== detail.publicRouteSlug) {
    if (traditional) permanentRedirect(recommendationLandingPath);
    permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  }

  const continuity = parseMbtiContinuityQuery(resolvedSearchParams);
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(String(continuity?.carryoverFocusKey ?? ""), displayLocale);
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(String(continuity?.carryoverReason ?? ""), displayLocale);
  const canonicalPath = traditional ? recommendationLandingPath : normalizeCareerBundleCanonicalPath(locale, detail.seoContract.canonicalPath, buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  const renderState = detail.renderState;
  const canRenderSummarySurface = renderState.canRenderSummarySurface;
  const safeRecommendationSummary = canRenderSummarySurface ? detail.supportingTruthSummary.summary : null;
  const canRenderTransitionSurface =
    isCareerTrustManifestReady(detail.trustManifest) && detail.claimPermissions.allow_transition_recommendation;
  const safeFitUpside = renderState.canRenderStrongTruth
    ? locale === "zh"
      ? copy(`适合度 ${renderScoreValue(detail.scoreBundle.fitScore.value)}`, `適合度 ${renderScoreValue(detail.scoreBundle.fitScore.value)}`)
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
  const isIntjPilot = detail.publicRouteSlug === "intj";
  const intjCopy = isIntjPilot ? (traditional ? CAREER_INTJ_TAIWAN_COPY : CAREER_EXPLORATION_PILOT.intj.copy[locale]) : undefined;
  const designExamples = locale === "zh" && !isIntjPilot ? findDesignCareersByMbtiType(detail.canonicalTypeCode) : [];
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
    title: intjCopy?.title ?? `${detail.displayType} Career Recommendations | FermatMind`,
    description: intjCopy?.summary ?? (safeRecommendationSummary || (locale === "zh" ? copy(`${detail.displayType} 职业推荐`, `${detail.displayType} 職業推薦`) : `${detail.displayType} career recommendations`)),
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? copy("首页", "首頁") : "Home", path: traditional ? "/zh-TW" : localizedPath("/", locale) },
    { name: locale === "zh" ? copy("职业", "職業") : "Career", path: withLocale("/career") },
    { name: locale === "zh" ? copy("职业匹配", "職涯配對") : "Career fit", path: withLocale("/career/recommendations") },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? copy(`${detail.displayType} 推荐职业列表`, `${detail.displayType} 推薦職業列表`) : `${detail.displayType} recommended roles`,
    description: safeRecommendationSummary || (locale === "zh" ? copy(`${detail.displayType} 推荐职业列表`, `${detail.displayType} 推薦職業列表`) : `${detail.displayType} recommended roles`),
    locale,
    items: (isIntjPilot ? displayedMatchedJobs : matchedJobs).map((job) => ({
      name: job.title,
      path: traditional ? job.href : localizedPath(`/career/jobs/${job.canonicalSlug}`, locale),
      description: job.summary,
    })),
  });
  const faqItems = [
    {
      question: locale === "zh" ? copy("这页的职业推荐依据来自哪里？", "這頁的職業推薦依據來自哪裡？") : "Where do the recommendation signals on this page come from?",
      answer:
        locale === "zh"
          ? copy("页面读取职业推荐资料、评分、限制与来源信息；未被允许展示的结论会保持隐藏。", "頁面讀取職業推薦資料、評分、限制與來源資訊；未被允許展示的結論會保持隱藏。")
          : "The page reads recommendation data, scores, boundaries, and source information; claims that are not allowed remain hidden.",
    },
    {
      question: locale === "zh" ? copy("为什么有些岗位或结论没有展示？", "為什麼有些職位或結論沒有展示？") : "Why are some roles or claims not shown?",
      answer:
        locale === "zh"
          ? copy("只有在数据允许展示岗位、强结论或相关判断时，页面才会渲染这些内容。", "只有在資料允許展示職位、強結論或相關判斷時，頁面才會渲染這些內容。")
          : "Roles and strong claims render only when the underlying data allows them.",
    },
  ];
  const canRenderAiScore = detail.claimPermissions.allow_ai_strategy && detail.careerDataStatus !== "unavailable";
  const recommendationSubjectSlug = detail.shortlistContract.subjectSlug ?? matchedJobs[0]?.canonicalSlug ?? extractJobSlugFromCanonicalTarget(detail.seoContract.canonicalTarget);
  const stateCopy = getCareerV1StateCopy(detail.careerDataStatus, displayLocale);
  const confidenceLabel = getDecisionConfidenceLabel(displayLocale, detail.scoreBundle.confidenceScore.value);
  const traditionalJobTitles = traditional
    ? new Map(detail.matchedJobs.filter(job => job.href.startsWith("/zh-TW/")).map(job => [job.canonicalSlug, job.title]))
    : undefined;
  const companionRailItems = buildCompanionRailItems(locale, displayLocale, traditionalJobTitles, companionLinks, recommendationLandingPath, recommendationSubjectSlug);

  return (
    <PageRoot className="min-h-screen bg-slate-50">
      {traditional && (
        <nav aria-label="頁面語言" className="mx-auto flex max-w-6xl flex-wrap gap-5 px-4 text-sm">
          <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
          <Link href={canonicalPath.replace(/^\/zh-TW(?=\/)/, "/zh")} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
          <Link href={canonicalPath.replace(/^\/zh-TW(?=\/)/, "/en")} lang="en" className="min-h-11 py-2 underline">English</Link>
        </nav>
      )}
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
            { label: locale === "zh" ? copy("首页", "首頁") : "Home", href: traditional ? "/zh-TW" : localizedPath("/", locale) },
            { label: locale === "zh" ? copy("职业", "職業") : "Career", href: withLocale("/career") },
            { label: locale === "zh" ? copy("职业匹配", "職涯配對") : "Career fit", href: withLocale("/career/recommendations") },
            { label: detail.displayType },
          ]}
        />

        <section id="answer-first" className="space-y-6" data-testid="career-recommendation-v1-decision-summary">
          {continuity ? (
            <div data-testid="mbti-career-continuity-entry" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-orange-600">
                {locale === "zh" ? copy("继续上次重点", "繼續上次重點") : "Continue the current focus"}
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
                {intjCopy?.title ?? (locale === "zh" ? copy("你的职业方向建议", "你的職業方向建議") : "Your career direction recommendation")}
              </h1>
              <p
                className="m-0 max-w-3xl text-base leading-8 text-slate-600"
                data-testid={canRenderSummarySurface ? "career-recommendation-hero-summary" : undefined}
              >
                {intjCopy?.summary ?? (safeRecommendationSummary
                  ? safeRecommendationSummary
                  : locale === "zh"
                    ? copy(`基于 ${detail.displayType} 的测评结果，先从结构清晰、边界明确的职业路径开始探索。`, `基於 ${detail.displayType} 的測驗結果，先從結構清晰、邊界明確的職業路徑開始探索。`)
                    : `Based on ${detail.displayType}, start with structured paths where tradeoffs and next steps are clearer.`)}
              </p>
              {renderCareerDataStatus(detail, displayLocale)}
              <div className="flex flex-wrap gap-3" data-testid="mbti-career-entry-cta-group" data-ads-surface="secondary">
                {recommendationSubjectSlug ? (
                  <CareerShortlistAction
                    locale={locale}
                    displayLocale={displayLocale}
                    subjectSlug={recommendationSubjectSlug}
                    sourcePageType="career_recommendation_detail"
                    entrySurface="career_recommendation_detail"
                    routeFamily="recommendation_detail"
                    landingPath={recommendationLandingPath}
                    testId="career-recommendation-shortlist-action"
                  />
                ) : null}
                <Link href={withLocale("/career")} data-testid="mbti-career-secondary-cta" className={buttonVariants({ variant: "outline" })}>
                  {locale === "zh" ? copy("查看职业列表", "查看職業列表") : "View job list"}
                </Link>
              </div>
              <TrackedEntryCtaLink href={mbtiPrimaryCtaHref} data-testid="mbti-career-primary-cta" eventProperties={mbtiPrimaryCtaTrackingProps} className="sr-only">
                {locale === "zh" ? copy("验证我的类型（开始 MBTI 测试）", "驗證我的類型（開始 MBTI 測試）") : "Validate my type with the free MBTI test"}
              </TrackedEntryCtaLink>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{detail.displayType}</p>
              <h2 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">{detail.typeName}</h2>
              {detail.nickname ? <p className="m-0 mt-1 text-sm text-slate-500">{detail.nickname}</p> : null}
              <p className="m-0 mt-4 text-sm leading-6 text-slate-500">
                {locale === "zh" ? copy("先给判断，再给理由，再给路径，最后才给候选职业。", "先給判斷，再給理由，再給路徑，最後才給候選職業。") : "Decision first, then rationale, path, and only then candidate roles."}
              </p>
            </div>
          </div>
        </section>

        {isIntjPilot && <CareerExplorationPilot pilot="intj" locale={traditional ? "zh-TW" : locale} />}
        {designExamples.length > 0 ? (
          <section id="design-mbti-exploration" className="scroll-mt-24 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="m-0 text-xl font-semibold text-slate-950">{detail.canonicalTypeCode} {copy(" 的设计职业探索示例", " 的設計職業探索示例")}</h2>
            <p className="m-0 text-sm leading-6 text-slate-600">{copy(DESIGN_MBTI_EXPLORATION_NOTE, "這些類型由編輯選作工作方式的探索範例。評估職業時，請一併查看實際任務與入行條件。")}</p>
            {designExamples.map(career => (
              <div key={career.slug} className="rounded-xl bg-slate-50 p-4">
                <Link href={traditional ? withLocale(`/career/jobs/${career.slug}`) : buildCareerJobFrontendUrl(locale, career.slug)} className="font-semibold text-[var(--fm-accent)] underline underline-offset-4">{traditional ? career.traditional.name : career.name}</Link>
                <p className="m-0 mt-2 text-sm leading-6 text-slate-700">{traditional ? career.traditional.task : career.task} {traditional ? career.traditional.explorationQuestion : career.explorationQuestion}</p>
              </div>
            ))}
            <Link href={traditional ? DESIGN_COMPARE_HREF.replace("/zh/", "/zh-TW/") : DESIGN_COMPARE_HREF} className={buttonVariants({ variant: "outline", className: "h-auto min-h-11 whitespace-normal text-center" })}>{copy(DESIGN_COMPARE_LABEL, "比較工業設計師與平面設計師")}</Link>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" data-testid="career-recommendation-v1-top-path">
          <DecisionPathCard displayLocale={displayLocale}
            eyebrow={locale === "zh" ? copy("主推荐路径", "主推薦路徑") : "Top recommendation path"}
            title={transitionPreview?.targetJob.title ?? (locale === "zh" ? copy(`${detail.displayType} 的优先探索方向`, `${detail.displayType} 的優先探索方向`) : `${detail.displayType} priority path`)}
            summary={transitionPreview?.whyThisPath ?? safeRecommendationSummary ?? (locale === "zh" ? copy("先从结构清晰、沟通噪音较低的路径开始验证。", "先了解工作流程清楚、溝通干擾較少的職涯方向。") : "Start from a path with clearer structure and lower communication noise.")}
            upside={safeFitUpside}
            tradeoff={transitionPreview?.whatIsLost ?? (locale === "zh" ? copy("仍需要结合职业详情确认边界。", "仍需要結合職業詳情確認邊界。") : "Still validate boundaries in the role detail page.")}
            ctaLabel={locale === "zh" ? copy("查看路径", "查看路徑") : "View path"}
            href={transitionPreview?.targetJob.href ?? localizedPath("/career", locale)}
          />
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              {locale === "zh" ? copy("现在是否适合行动", "現在是否適合行動") : "Ready to act?"}
            </p>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
              {locale === "zh" ? copy("先保存方向，再打开一个候选职业做细看。", "先儲存探索方向，再選一個候選職業深入了解。") : "Save the direction first, then inspect one candidate role in detail."}
            </p>
          </div>
        </section>

        <section className="space-y-4" data-testid="career-recommendation-v1-decision-cards">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "zh" ? copy("三种决策路径", "三種決策路徑") : "Three decision paths"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <DecisionPathCard displayLocale={displayLocale} eyebrow={locale === "zh" ? copy("最稳妥路径", "最穩妥路徑") : "Steady path"} title={locale === "zh" ? copy("先验证低断裂成本", "先確認哪些選擇能減少轉職對現況的影響") : "Validate low breakage first"} summary={locale === "zh" ? copy("从最容易落地的候选职业开始，减少试错成本。", "先探索最容易付諸行動的職業，降低嘗試的成本。") : "Start with the easiest candidate path to reduce switching cost."} tradeoff={locale === "zh" ? copy("上行空间可能需要后续二次选择。", "上行空間可能需要後續二次選擇。") : "Upside may require a second move later."} ctaLabel={locale === "zh" ? copy("查看职业库", "查看職業庫") : "Open jobs"} href={withLocale("/career")} />
            <DecisionPathCard displayLocale={displayLocale} eyebrow={locale === "zh" ? copy("上行空间路径", "長期發展路徑") : "Upside path"} title={transitionPreview?.targetJob.title ?? (locale === "zh" ? copy("看更高迁移收益", "比較轉職後的長期發展機會") : "Look for higher mobility")} summary={transitionPreview?.whyThisPath ?? (locale === "zh" ? copy("优先看能扩大长期选择面的路径。", "優先看能擴大長期選擇面的路徑。") : "Prioritize paths that widen long-term options.")} tradeoff={transitionPreview?.whatIsLost ?? (locale === "zh" ? copy("需要更仔细确认代价。", "需要更仔細確認代價。") : "Requires a closer tradeoff check.")} ctaLabel={locale === "zh" ? copy("查看路径", "查看路徑") : "View path"} href={transitionPreview?.targetJob.href ?? localizedPath("/career", locale)} />
            <DecisionPathCard displayLocale={displayLocale} eyebrow={locale === "zh" ? copy("风险对冲路径", "保留備選方案") : "Risk hedge"} title={locale === "zh" ? copy("保留备选职业", "保留備選職業") : "Keep adjacent options"} summary={locale === "zh" ? copy("把相关职业放在候选清单里，避免一次性押注。", "將相關職業列入候選清單，保留其他選擇。") : "Keep adjacent roles available so this is not a single bet."} tradeoff={locale === "zh" ? copy("比较过程会更长。", "比較過程會更長。") : "The comparison process takes longer."} ctaLabel={locale === "zh" ? copy("继续探索", "繼續探索") : "Keep exploring"} href={withLocale("/career")} />
          </div>
        </section>

        {transitionPreview ? (
          <section className="space-y-4" data-testid="career-recommendation-v1-transition-map">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{locale === "zh" ? copy("路径地图", "路徑地圖") : "Transition map"}</h2>
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
                {locale === "zh" ? copy("路径下的候选职业", "路徑下的候選職業") : "Candidate roles under this path"}
              </h2>
              <p className="m-0 text-sm leading-6 text-slate-500">
                {locale === "zh" ? copy("候选职业用于下钻，不是这个推荐页的主体。", "候選職業用於進一步探索，不是這個推薦頁的主體。") : "These roles are drill-down candidates, not the main subject of the recommendation."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedMatchedJobs.map((job) => (
                <article key={job.canonicalSlug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-recommendation-matched-job-card">
                  <ConfidenceBadge tone="complete">{job.fitBucket === "primary" ? (locale === "zh" ? copy("优先候选", "優先候選") : "Primary candidate") : locale === "zh" ? copy("补充候选", "補充候選") : "Secondary candidate"}</ConfidenceBadge>
                  <h3 className="m-0 mt-3 text-lg font-semibold tracking-tight text-slate-950">{job.title}</h3>
                  {job.summary ? <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{job.summary}</p> : null}
                  <TrackedCareerLink
                    href={job.href}
                    eventName={CAREER_TRACKING_EVENTS.recommendationMatchedJobClick}
                    eventPayload={{ locale, entrySurface: "career_recommendation_detail_matched_jobs", sourcePageType: "career_recommendation_detail", targetAction: "open_matched_job_detail", landingPath: recommendationLandingPath, routeFamily: "recommendation_detail", subjectKind: "job_slug", subjectKey: job.canonicalSlug }}
                    className="mt-4 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    {locale === "zh" ? copy("查看职业", "查看職業") : "View role"}
                  </TrackedCareerLink>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <ConfidenceBoundary tone="limited" title={locale === "zh" ? copy("候选职业暂不展示", "候選職業暫不展示") : "Candidate roles are not shown yet"} description={locale === "zh" ? copy("当前推荐仍可作为方向参考，但不会本地拼接岗位列表。", "你仍可參考目前的建議來探索方向。職位清單會在資料可用時顯示。") : "This recommendation remains useful as a direction, but the page does not assemble local job lists."} />
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-recommendation-v1-feedback">
          <div className="space-y-1">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{locale === "zh" ? copy("这个推荐有帮助吗？", "這個推薦有幫助嗎？") : "Was this recommendation useful?"}</h2>
            <p className="m-0 text-sm leading-6 text-slate-500">{locale === "zh" ? copy("用当前压力感、满意度和转换意愿更新后续推荐。", "用目前壓力感、滿意度和轉換意願更新後續推薦。") : "Use burnout, satisfaction, and switch urgency to keep the recommendation current."}</p>
          </div>
          <div className="mt-5 grid gap-4">
            {detail.feedbackCheckin ? (
              <CareerFeedbackPanel locale={locale} displayLocale={displayLocale} recommendationType={detail.publicRouteSlug} landingPath={recommendationLandingPath} feedback={detail.feedbackCheckin} testId="career-recommendation-feedback-panel" />
            ) : (
              <p className="m-0 text-sm leading-6 text-slate-500" data-testid="career-recommendation-feedback-placeholder">
                {locale === "zh" ? copy("反馈入口会在推荐跟踪数据可用时显示。", "回饋入口會在推薦追蹤資料可用時顯示。") : "The feedback check-in appears when recommendation tracking data is available."}
              </p>
            )}
          </div>
        </section>

        <NextStepRail title={locale === "zh" ? "下一步" : "Next steps"} description={locale === "zh" ? copy("保留 2-3 个真实下一步，避免链接过载。", "從 2 至 3 個可以實際進行的步驟中選擇。") : "A short set of real next steps without link overload."} items={companionRailItems} testId="career-recommendation-v1-next-steps" />

        <section
          className="space-y-3"
          data-testid="career-recommendation-v1-evidence"
          data-evidence-container="true"
          data-evidence-page-family="career_recommendation_detail"
          data-evidence-source-type="career_backend_bundle"
          data-evidence-readiness="partial"
        >
          <EvidenceDrawer title={locale === "zh" ? copy("查看评分依据", "查看評分依據") : "View scoring basis"} testId="career-recommendation-v1-score-drawer" evidenceBlock="evidence_facts">
            <ClaimGuard
              allowed={renderState.canRenderStrongTruth}
              fallback={<ConfidenceBoundary tone="limited" title={locale === "zh" ? copy("暂不做强推荐判断", "暫無足夠資料提出明確推薦") : "Strong recommendation is not open yet"} description={locale === "zh" ? copy("当前数据不足以支持强判断。", "目前資料不足以支持明確的推薦。") : "There is not enough data to support a strong recommendation yet."} />}
            >
              <div className="grid gap-3 md:grid-cols-5" data-testid="career-recommendation-type-interpretation">
                <Metric title="Fit" value={renderScoreValue(detail.scoreBundle.fitScore.value)} />
                <Metric title="Strain" value={renderScoreValue(detail.scoreBundle.strainScore.value)} />
                <Metric title="AI" value={canRenderAiScore ? renderScoreValue(detail.scoreBundle.aiSurvivalScore.value) : "—"} />
                <Metric title="Mobility" value={renderScoreValue(detail.scoreBundle.mobilityScore.value)} />
                <Metric title="Confidence" value={renderScoreValue(detail.scoreBundle.confidenceScore.value)} />
              </div>
            </ClaimGuard>
            {renderState.canRenderStrongTruth && detail.whiteBoxScores.strainScore?.radarDimensions ? <StrainRadar locale={displayLocale} dimensions={detail.whiteBoxScores.strainScore.radarDimensions} testId="career-recommendation-strain-radar" /> : null}
            {renderState.canRenderStrongTruth && explainability ? <CareerExplainabilityPanel locale={displayLocale} explainability={explainability} title={locale === "zh" ? copy("评分说明", "評分說明") : "Scoring explanation"} subtitle={locale === "zh" ? copy("复杂依据默认折叠。", "複雜依據預設摺疊。") : "Detailed evidence is collapsed by default."} testId="career-recommendation-explainability-panel" showStrainRadar={false} /> : null}
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? copy("查看路径依据", "查看路徑依據") : "View path evidence"} testId="career-recommendation-v1-transition-drawer" evidenceBlock="how_to">
            {transitionPreview ? (
              <div className="space-y-4">
                <CareerTransitionPreviewCard locale={locale} preview={transitionPreview} landingPath={recommendationLandingPath} />
                <CareerTransitionPathPanel locale={locale} displayLocale={displayLocale} transitionPath={transitionPreview} landingPath={recommendationLandingPath} emphasisVariant={runtimeConfig.experiments.transitionEmphasis.enabled ? runtimeConfig.experiments.transitionEmphasis.variant : "balanced"} copyVariant="public" />
              </div>
            ) : null}
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? copy("查看数据来源", "查看資料來源") : "View data source"} testId="career-recommendation-v1-source-drawer" evidenceBlock="caveat">
            {renderCareerRecommendationProtocolStatus(detail, displayLocale)}
            <div data-testid="career-recommendation-renderer-status" data-renderer-state={getRecommendationRendererContractState(detail) ?? "complete"}>
              {renderCareerDataStatus(detail, displayLocale) ?? <p className="m-0 text-sm text-slate-500">{locale === "zh" ? copy("当前没有额外展示限制。", "目前沒有額外展示限制。") : "No additional display boundary is active."}</p>}
            </div>
            <WarningBanner locale={displayLocale} warnings={detail.warnings} copyVariant={runtimeConfig.experiments.warningCopy.enabled ? runtimeConfig.experiments.warningCopy.variant : "control"} testId="career-recommendation-warning-banner" />
            <TrustStrip
              locale={displayLocale}
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

          <EvidenceDrawer title={locale === "zh" ? copy("查看推荐变化记录", "查看推薦變化記錄") : "View recommendation change history"} testId="career-recommendation-v1-lifecycle-drawer" evidenceBlock="evidence_facts">
            <CareerProjectionTimeline locale={displayLocale} timeline={detail.projectionTimeline} testId="career-recommendation-projection-timeline" />
            <CareerProjectionDeltaPanel locale={displayLocale} delta={detail.projectionDeltaSummary} testId="career-recommendation-projection-delta" />
          </EvidenceDrawer>

           {companionLinks ? (
             <EvidenceDrawer title={locale === "zh" ? copy("查看全部关联链接", "查看全部關聯連結") : "View all companion links"} testId="career-recommendation-v1-companion-drawer" evidenceBlock="related_links">
              {/* testId="career-recommendation-companion-links" is retained by the folded status marker after the scene entry. */}
              <CareerRecommendationCompanionLinks locale={locale} displayLocale={displayLocale} traditionalJobTitles={traditionalJobTitles} summary={companionLinks} landingPath={recommendationLandingPath} subjectKey={recommendationSubjectSlug} testId="career-recommendation-v1-companion-links" />
             </EvidenceDrawer>
           ) : null}
          </section>

          <section className="sr-only" data-testid="career-recommendation-scene-entry">
            <MbtiSceneEntrySection locale={locale} displayLocale={displayLocale} sourcePageType="career_recommendation_detail" blocks={detail.sceneEntryBlocks} testId="career-recommendation-scene-entry" />
            <Link href={mbtiLandingHref}>{locale === "zh" ? copy("查看测试介绍", "查看測試介紹") : "View test overview"}</Link>
          </section>
         <section className="sr-only" data-testid="career-recommendation-matched-jobs-status" data-matched-jobs-count={displayedMatchedJobs.length}>
           {displayedMatchedJobs.length > 0
             ? (traditional ? "候選職業清單" : "Matched role " + "matrix")
             : (traditional ? "可在職涯路徑區查看候選職業資訊。" : "Candidate roles are folded into the V1 decision path.")}
         </section>
          <section className="sr-only" data-testid="career-recommendation-companion-links">
            {companionLinks
              ? (traditional ? "可展開資料區查看相關連結。" : "Companion links are folded into evidence.")
              : (traditional ? "目前沒有相關連結。" : "No companion links available.")}
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
      </PageRoot>
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
