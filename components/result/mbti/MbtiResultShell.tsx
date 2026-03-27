"use client";

import Link from "next/link";
import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MbtiChapterSection } from "@/components/result/mbti/MbtiChapterSection";
import { buildDominantTraitItems } from "@/components/result/mbti/MbtiDominantTraitsSection";
import { MbtiHighlightsSection } from "@/components/result/mbti/MbtiHighlightsSection";
import { MbtiMobileChrome } from "@/components/result/mbti/MbtiMobileChrome";
import { MbtiOfferComparisonSection } from "@/components/result/mbti/MbtiOfferComparisonSection";
import { MbtiPostPurchaseSection } from "@/components/result/mbti/MbtiPostPurchaseSection";
import { MbtiRecommendedReadsSection } from "@/components/result/mbti/MbtiRecommendedReadsSection";
import { MbtiStickyRail } from "@/components/result/mbti/MbtiStickyRail";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canEnterReportPage,
  canDownloadReportPdf,
  isProjectionLocked,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
import { ApiError } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import {
  createAttemptShare,
  createCheckoutOrOrder,
  type OfferPayload,
  type ReportCta,
  type ReportIdentityLayer,
  type ReportRecommendedRead,
  type ReportResponse,
} from "@/lib/api/v0_3";
import { buildOrderWaitPath, regionFromLocale, resolveCheckoutAction } from "@/lib/commerce/checkoutAction";
import { clearPendingOrder, readPendingOrder, writePendingOrder } from "@/lib/commerce/pendingOrder";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { normalizeMbtiAccessHub } from "@/lib/mbti/accessHub";
import {
  appendMbtiActionJourneyQuery,
} from "@/lib/mbti/actionJourney";
import {
  appendMbtiContinuityQuery,
} from "@/lib/mbti/continuity";
import {
  appendMbtiAdaptiveSelectionQuery,
} from "@/lib/mbti/adaptiveSelection";
import { captureError } from "@/lib/observability/sentry";
import {
  buildMbtiCareerRecommendationHref,
  type MbtiPublicProjectionDimensionViewModel,
  type MbtiResultProjectionSectionViewModel,
  type MbtiResultProjectionViewModel,
} from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiActionCompletionTendency,
  summarizeMbtiActionEffectWeights,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCompletedActionKeys,
  summarizeMbtiCareerActionPriorityKeys,
  summarizeMbtiCareerJourneyKeys,
  summarizeMbtiCareerReadingKeys,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiContentFeedbackWeights,
  summarizeMbtiCtaEffectWeights,
  summarizeMbtiCtaPriorityKeys,
  summarizeMbtiCurrentIntentCluster,
  summarizeMbtiFeedbackCoverage,
  summarizeMbtiFeedbackSentiment,
  summarizeMbtiAdaptiveContractVersion,
  summarizeMbtiAdaptiveFingerprint,
  summarizeMbtiAdaptiveRewriteReason,
  summarizeMbtiNextBestActionKey,
  summarizeMbtiNextBestActionReason,
  summarizeMbtiNextBestActionSection,
  summarizeMbtiJourneyContractVersion,
  summarizeMbtiJourneyFingerprint,
  summarizeMbtiJourneyScope,
  summarizeMbtiJourneyState,
  summarizeMbtiLastDeepReadSection,
  summarizeMbtiMemoryContractVersion,
  summarizeMbtiMemoryFingerprint,
  summarizeMbtiMemoryProgressionState,
  summarizeMbtiMemoryRewriteKeys,
  summarizeMbtiMemoryRewriteReason,
  summarizeMbtiMemoryScope,
  summarizeMbtiMemoryState,
  summarizeMbtiBehaviorDeltaKeys,
  summarizeMbtiDominantInterestKeys,
  summarizeMbtiOrderedActionKeys,
  summarizeMbtiOrderedRecommendationKeys,
  summarizeMbtiOrderedSectionKeys,
  summarizeMbtiProfileSeedKey,
  summarizeMbtiProgressState,
  summarizeMbtiPulsePromptKeys,
  summarizeMbtiPulseState,
  summarizeMbtiRecommendationPriorityKeys,
  summarizeMbtiRecommendationEffectWeights,
  summarizeMbtiRecommendationSelectionKeys,
  summarizeMbtiRecommendedNextPulseKeys,
  summarizeMbtiResumeBiasKeys,
  summarizeMbtiRevisitReorderReason,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiSectionHistoryKeys,
  summarizeMbtiSectionSelectionKeys,
  summarizeMbtiSelectionFingerprint,
  summarizeMbtiActionSelectionKeys,
  summarizeMbtiSameTypeDivergenceKeys,
  summarizeMbtiSecondaryFocusKeys,
  summarizeMbtiUserState,
  summarizeMbtiVariantKeys,
} from "@/lib/mbti/personalizationTelemetry";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type {
  HighlightCard,
  MbtiSectionUnlock,
  ReportSection,
  ResolvedOffer,
  RichResultHeadline,
} from "@/components/result/RichResultReport";

type MbtiResultShellProps = {
  locale: Locale;
  scaleCode: "MBTI";
  reportData: ReportResponse;
  accessProjection?: AttemptReportAccessView | null;
  headline: RichResultHeadline;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  projectionViewModel?: MbtiResultProjectionViewModel | null;
  highlights?: HighlightCard[];
  recommendedReads?: ReportRecommendedRead[];
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  onInternalNavigate?: (path: string) => void;
  onExternalNavigate?: (url: string) => void;
};

const CHAPTER_ORDER = ["traits", "career", "growth", "relationships"] as const;
const OFFER_FULL_HASH = "#offer-full";
const OFFER_SECTION_ID = "offer-full";
const OFFER_SCROLL_ALIGNMENT: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "center",
  inline: "nearest",
};

const CHAPTER_PROJECTION_KEYS = {
  career: [
    "career.summary",
    "career.collaboration_fit",
    "career.work_environment",
    "career.work_experiments",
    "career.advantages",
    "career.weaknesses",
    "career.preferred_roles",
    "career.next_step",
    "career.upgrade_suggestions",
  ],
  growth: [
    "growth.summary",
    "growth.stability_confidence",
    "growth.next_actions",
    "growth.weekly_experiments",
    "growth.strengths",
    "growth.weaknesses",
    "growth.stress_recovery",
    "growth.watchouts",
    "growth.motivators",
    "growth.drainers",
  ],
  traits: [
    "letters_intro",
    "overview",
    "trait_overview",
    "traits.why_this_type",
    "traits.close_call_axes",
    "traits.adjacent_type_contrast",
    "traits.decision_style",
  ],
  relationships: [
    "relationships.summary",
    "relationships.strengths",
    "relationships.weaknesses",
    "relationships.communication_style",
    "relationships.try_this_week",
    "relationships.rel_advantages",
    "relationships.rel_risks",
  ],
} as const;

const MBTI_FULL_EFFECTIVE_SKU = "MBTI_REPORT_FULL_199";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function resolveMbtiModuleLabel(moduleCode: string, locale: Locale): string {
  const normalized = moduleCode.trim().toLowerCase();
  const labels: Record<string, { zh: string; en: string }> = {
    core_free: { zh: "结果摘要", en: "Result summary" },
    core_full: { zh: "完整人格判读", en: "Full personality reading" },
    career: { zh: "职业映射", en: "Career mapping" },
    relationships: { zh: "关系映射", en: "Relationship mapping" },
  };

  return labels[normalized]?.[locale] ?? moduleCode;
}

function resolveVisibleModuleLabels(modulesAllowed: string[], locale: Locale): string[] {
  return Array.from(
    new Set(
      normalizeStringArray(modulesAllowed)
        .map((moduleCode) => resolveMbtiModuleLabel(moduleCode, locale))
        .filter(Boolean)
    )
  );
}

function resolveShareCtaLabel(
  locale: Locale,
  shareStatus: "idle" | "copied" | "failed",
  isSharing: boolean
) {
  if (isSharing) {
    return locale === "zh" ? "正在生成分享链接..." : "Preparing share link...";
  }

  if (shareStatus === "copied") {
    return locale === "zh" ? "已复制分享链接" : "Share link copied";
  }

  if (shareStatus === "failed") {
    return locale === "zh" ? "重试分享" : "Retry share";
  }

  return locale === "zh" ? "分享结果" : "Share result";
}

function resolveDimensionStatLabel(code: string, locale: Locale): string {
  const labels: Record<string, { zh: string; en: string }> = {
    EI: { zh: "能量方向", en: "Energy direction" },
    SN: { zh: "信息偏好", en: "Information preference" },
    TF: { zh: "决策偏好", en: "Decision preference" },
    JP: { zh: "行动节奏", en: "Execution rhythm" },
    AT: { zh: "稳定度", en: "Stability" },
  };

  return labels[code]?.[locale] ?? code;
}

function resolveDimensionPercent(value: Record<string, unknown>): number {
  const raw = Number(value.percent ?? value.score ?? value.value ?? 0);
  if (!Number.isFinite(raw)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(raw)));
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function resolveProjectionDimensions(
  dimensions: MbtiPublicProjectionDimensionViewModel[]
): Array<Record<string, unknown>> {
  return dimensions.map((dimension) => ({
    code: dimension.code,
    label: dimension.label || dimension.code,
    percent: dimension.percent,
    winnerLabel: normalizeText(dimension.sideLabel, dimension.summary, dimension.state),
  }));
}

function extractProjectionSectionLead(
  section?: MbtiResultProjectionSectionViewModel | null,
  preferredKinds: string[] = []
): string {
  if (!section) {
    return "";
  }

  const payload = asRecord(section.payload);
  const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
  for (const preferredKind of preferredKinds) {
    for (const block of blocks) {
      const record = asRecord(block);
      const kind = normalizeText(record?.kind);
      if (kind !== preferredKind) {
        continue;
      }

      const text = normalizeText(record?.text, record?.body, record?.description);
      if (text) {
        return text;
      }
    }
  }

  for (const block of blocks) {
    const record = asRecord(block);
    const text = normalizeText(record?.text, record?.body, record?.description);
    if (text) {
      return text;
    }
  }

  return normalizeText(section.bodyMd);
}

function buildCareerBridgeTelemetryPayload(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale,
  personalization?: MbtiResultProjectionViewModel["personalization"] | null,
  options?: {
    attemptId?: string;
    ctaKey?: string;
    ctaRank?: number;
  }
) {
  const payload = asRecord(section.payload);
  const personalizationPayload = asRecord(payload?.personalization);
  const overviewVariantKey =
    normalizeText(personalization?.variantKeys.overview, section.variantKey) || section.variantKey;

  return {
    slug: "mbti-result-shell",
    scale_code: "MBTI",
    visual_kind: "mbti_career_bridge",
    attempt_id: normalizeText(options?.attemptId),
    sectionKey: section.key,
    sceneKey: normalizeText(personalizationPayload?.scene_key, "career"),
    styleKey: normalizeText(personalizationPayload?.style_key),
    variantKey: normalizeText(section.variantKey),
    ctaKey: normalizeText(options?.ctaKey),
    ctaRank: options?.ctaRank ?? 0,
    userState: summarizeMbtiUserState(personalization),
    primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
    secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
    orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
    orderedRecommendationKeys: summarizeMbtiOrderedRecommendationKeys(personalization),
    orderedActionKeys: summarizeMbtiOrderedActionKeys(personalization),
    recommendationPriorityKeys: summarizeMbtiRecommendationPriorityKeys(personalization),
    actionPriorityKeys: summarizeMbtiActionPriorityKeys(personalization),
    readingFocusKey: normalizeText(personalization?.readingFocusKey),
    actionFocusKey: normalizeText(personalization?.actionFocusKey),
    careerFocusKey: normalizeText(personalization?.workingLife?.careerFocusKey),
    careerJourneyKeys: summarizeMbtiCareerJourneyKeys(personalization),
    careerActionPriorityKeys: summarizeMbtiCareerActionPriorityKeys(personalization),
    careerReadingKeys: summarizeMbtiCareerReadingKeys(personalization),
    ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
    carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
    carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
    recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
    carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
    carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
    profileSeedKey: summarizeMbtiProfileSeedKey(personalization),
    sameTypeDivergenceKeys: summarizeMbtiSameTypeDivergenceKeys(personalization),
    sectionSelectionKeys: summarizeMbtiSectionSelectionKeys(personalization),
    actionSelectionKeys: summarizeMbtiActionSelectionKeys(personalization),
    recommendationSelectionKeys: summarizeMbtiRecommendationSelectionKeys(personalization),
    selectionFingerprint: summarizeMbtiSelectionFingerprint(personalization),
    variantKeys: summarizeMbtiVariantKeys(personalization),
    sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
    boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
    axisBands: summarizeMbtiAxisBands(personalization),
    overviewVariantKey,
    typeCode: normalizeText(personalization?.typeCode),
    identity: normalizeText(personalization?.identity),
    packId: normalizeText(personalization?.packId),
    engineVersion: normalizeText(personalization?.engineVersion),
    locale,
    feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
    feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
    actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
    lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
    currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
  };
}

function resolveShareMessages(locale: Locale, shareStatus: "idle" | "copied" | "failed") {
  if (shareStatus === "copied") {
    return locale === "zh" ? "结果链接已复制。" : "Result link copied.";
  }

  if (shareStatus === "failed") {
    return locale === "zh" ? "当前环境不支持自动分享，请手动复制链接。" : "Sharing is unavailable here. Copy the URL manually.";
  }

  return "";
}

function resolvePrimaryCtaLabel(locale: Locale) {
  return locale === "zh" ? "解锁完整报告" : "Unlock full report";
}

function resolveCtaRank(ctaPriorityKeys: string[], ctaKey: string): number {
  const index = ctaPriorityKeys.findIndex((value) => value === ctaKey);
  return index >= 0 ? index + 1 : 0;
}

function resolveCtaRankLabel(locale: Locale, rank: number): string {
  return locale === "zh" ? `优先入口 ${rank}` : `Priority ${rank}`;
}

function sortProjectionSectionsByOrder(
  sections: MbtiResultProjectionSectionViewModel[],
  orderedSectionKeys: string[]
): MbtiResultProjectionSectionViewModel[] {
  if (orderedSectionKeys.length === 0 || sections.length <= 1) {
    return sections;
  }

  const orderMap = new Map(orderedSectionKeys.map((key, index) => [key, index] as const));
  return [...sections].sort((left, right) => {
    const leftRank = orderMap.get(left.key);
    const rightRank = orderMap.get(right.key);

    if (leftRank === undefined && rightRank === undefined) {
      return 0;
    }

    if (leftRank === undefined) {
      return 1;
    }

    if (rightRank === undefined) {
      return -1;
    }

    return leftRank - rightRank;
  });
}

function resolveProjectionSectionActionKey(section: MbtiResultProjectionSectionViewModel): string {
  const payload = asRecord(section.payload);
  const personalizationPayload = asRecord(payload?.personalization);

  return normalizeText(personalizationPayload?.action_key);
}

function sortProjectionSectionsByActionOrder(
  sections: MbtiResultProjectionSectionViewModel[],
  orderedActionKeys: string[]
): MbtiResultProjectionSectionViewModel[] {
  if (orderedActionKeys.length === 0 || sections.length <= 1) {
    return sections;
  }

  const orderMap = new Map(orderedActionKeys.map((key, index) => [key, index] as const));

  return [...sections].sort((left, right) => {
    const leftActionKey = resolveProjectionSectionActionKey(left);
    const rightActionKey = resolveProjectionSectionActionKey(right);

    if (!leftActionKey || !rightActionKey) {
      return 0;
    }

    const leftRank = orderMap.get(leftActionKey);
    const rightRank = orderMap.get(rightActionKey);

    if (leftRank === undefined && rightRank === undefined) {
      return 0;
    }

    if (leftRank === undefined) {
      return 1;
    }

    if (rightRank === undefined) {
      return -1;
    }

    return leftRank - rightRank;
  });
}

function sortProjectionSectionsForChapter(
  sections: MbtiResultProjectionSectionViewModel[],
  orderedSectionKeys: string[],
  orderedActionKeys: string[]
): MbtiResultProjectionSectionViewModel[] {
  const orderedSections = sortProjectionSectionsByOrder(sections, orderedSectionKeys);
  const orderedActionSections = sortProjectionSectionsByActionOrder(
    orderedSections.filter((section) => resolveProjectionSectionActionKey(section)),
    orderedActionKeys
  );

  if (orderedActionSections.length <= 1) {
    return orderedSections;
  }

  const queuedActionSections = [...orderedActionSections];

  return orderedSections.map((section) => {
    if (!resolveProjectionSectionActionKey(section)) {
      return section;
    }

    return queuedActionSections.shift() ?? section;
  });
}

function maskIdentifier(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  if (normalized.length <= 10) return normalized;
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

function resolveCheckoutServiceErrorMessage(locale: Locale): string {
  return locale === "zh" ? "支付服务暂时不可用，请稍后重试。" : "Payment is temporarily unavailable. Please try again.";
}

function resolveCheckoutErrorMessage(locale: Locale, cause: unknown): string {
  if (cause instanceof ApiError) {
    const normalizedMessage = normalizeText(cause.message);
    if (cause.status === 408 || cause.status >= 500) {
      return resolveCheckoutServiceErrorMessage(locale);
    }

    return normalizedMessage || resolveCheckoutServiceErrorMessage(locale);
  }

  return resolveCheckoutServiceErrorMessage(locale);
}

function resolveAttemptIdFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return normalizeText(segments[segments.length - 1]);
}

function resolveAbsoluteShareUrl(url: string): string {
  if (typeof window === "undefined") {
    return url;
  }

  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

function resolveLocalizedWaitFlowPath(
  action:
    | Extract<ReturnType<typeof resolveCheckoutAction>, { kind: "redirect" }>
    | Extract<ReturnType<typeof resolveCheckoutAction>, { kind: "order_wait" }>,
  locale: Locale
): string | null {
  if (action.kind === "order_wait") {
    return localizedPath(buildOrderWaitPath(action), locale);
  }

  if (action.waitUrl) {
    return localizedPath(action.waitUrl, locale);
  }

  const orderNo = normalizeText(action.orderNo);
  if (!orderNo) {
    return null;
  }

  const params = new URLSearchParams({ order_no: orderNo });
  if (action.provider) {
    params.set("provider", action.provider);
  }
  if (action.paymentRecoveryToken) {
    params.set("payment_recovery_token", action.paymentRecoveryToken);
  }

  return localizedPath(`/pay/wait?${params.toString()}`, locale);
}

function resolveOfferPayloads(reportData: ReportResponse): OfferPayload[] {
  const values: OfferPayload[] = [];

  if (Array.isArray(reportData.offers)) {
    values.push(...reportData.offers);
  } else {
    const singleOffer = asRecord(reportData.offers);
    if (singleOffer) {
      values.push(singleOffer as OfferPayload);
    }
  }

  const legacyOffer = asRecord(reportData.offer);
  if (legacyOffer) {
    values.push(legacyOffer as OfferPayload);
  }

  const deduped = new Map<string, OfferPayload>();
  for (const offer of values) {
    const key = normalizeText(offer.sku, offer.sku_code, offer.benefit_code, offer.title);
    if (!key || deduped.has(key)) continue;
    deduped.set(key, offer);
  }

  return Array.from(deduped.values());
}

function findFullOfferPayload(offers: OfferPayload[]): OfferPayload | null {
  for (const offer of offers) {
    const modules = normalizeStringArray(offer.modules_included);
    const sku = normalizeText(offer.sku, offer.sku_code, offer.benefit_code, offer.title).toUpperCase();

    if (modules.includes("core_full") || sku.includes("REPORT_FULL")) {
      return offer;
    }
  }

  return null;
}

function isMbtiPartialSku(sku: string): boolean {
  const normalized = sku.toUpperCase();
  return normalized.includes("MBTI_CAREER") || normalized.includes("MBTI_RELATIONSHIP");
}

function normalizeMbtiCheckoutSku(sku: string): string {
  const normalized = normalizeText(sku).toUpperCase();
  if (!normalized) {
    return "";
  }

  return normalized === "MBTI_REPORT_FULL" ? MBTI_FULL_EFFECTIVE_SKU : normalized;
}

function isUnlockedMbtiReport(reportData: ReportResponse): boolean {
  if (reportData.locked === true) {
    return false;
  }

  const variant = normalizeText(reportData.variant).toLowerCase();
  const accessLevel = normalizeText(reportData.access_level).toLowerCase();

  return variant === "full" || accessLevel === "paid" || accessLevel === "full";
}

export function resolveMbtiCheckoutSku(reportData: ReportResponse): string {
  const cta = (reportData.cta ?? null) as ReportCta | null;
  const effectiveSku = normalizeText(cta?.target_sku_effective);
  if (effectiveSku && !isMbtiPartialSku(effectiveSku)) {
    return normalizeMbtiCheckoutSku(effectiveSku);
  }

  const fullOffer = findFullOfferPayload(resolveOfferPayloads(reportData));
  const fullOfferSku = normalizeText(fullOffer?.sku, fullOffer?.sku_code);
  if (fullOfferSku) {
    return normalizeMbtiCheckoutSku(fullOfferSku);
  }

  const targetSku = normalizeText(cta?.target_sku);
  if (targetSku && !isMbtiPartialSku(targetSku)) {
    return normalizeMbtiCheckoutSku(targetSku);
  }

  throw new Error("MBTI checkout requires CTA target_sku_effective, target_sku, or a full-report offer sku.");
}

type MbtiResultShellLoadingShellProps = {
  locale: Locale;
  retakeHref: string;
  statusText?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  primaryCtaIsInternal: boolean;
  onShare?: () => void | Promise<void>;
};

export function MbtiResultShellLoadingShell({
  locale,
  retakeHref,
  statusText,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaIsInternal,
  onShare = () => {},
}: MbtiResultShellLoadingShellProps) {
  return (
    <div
      data-testid="mbti-result-shell"
      className="relative space-y-6 pb-28 md:space-y-8 xl:pb-0"
    >
      <MbtiMobileChrome
        locale={locale}
        retakeHref={retakeHref}
        primaryCtaLabel={primaryCtaLabel}
        primaryCtaHref={primaryCtaHref}
        primaryCtaIsInternal={primaryCtaIsInternal}
        onShare={onShare}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="space-y-6 md:space-y-8">
          <section
            id="hero"
            className="scroll-mt-28 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:p-8"
          >
            <div className="flex h-8 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-10 w-56 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-80 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-full max-w-3xl animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-11/12 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="h-44 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
              <div className="h-44 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
            </div>
          </section>

          <section
            id="intro"
            className="scroll-mt-28 space-y-3 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            <p className="m-0 h-5 w-28 animate-pulse rounded bg-slate-200" />
            <div className="space-y-2">
              <p className="m-0 h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <p className="m-0 h-6 w-11/12 animate-pulse rounded bg-slate-100" />
            </div>
            {statusText ? <p className="m-0 text-sm text-slate-500">{statusText}</p> : null}
          </section>

          {CHAPTER_ORDER.map((chapterKey) => (
            <section
              key={chapterKey}
              id={chapterKey}
              className="scroll-mt-28 space-y-3 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
            >
              <p className="m-0 h-4 w-20 animate-pulse rounded bg-slate-200" />
              <p className="m-0 h-7 w-56 animate-pulse rounded bg-slate-200" />
              <p className="m-0 h-5 w-56 animate-pulse rounded bg-slate-100" />
              <p className="m-0 h-5 w-44 animate-pulse rounded bg-slate-100" />
              <div className="h-40 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
            </section>
          ))}

          <section
            id="offer-full"
            className="scroll-mt-28 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            <p className="m-0 h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-6 w-52 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-40 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
          </section>

          <Card className="border-slate-200 bg-slate-950 text-white shadow-[0_22px_52px_rgba(15,23,42,0.22)]">
            <CardHeader>
              <CardTitle className="text-white">{locale === "zh" ? "页尾操作" : "Footer actions"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-5 w-80 animate-pulse rounded bg-white/30" />
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex h-10 w-28 animate-pulse rounded-full bg-white/20" />
                <span className="inline-flex h-10 w-28 animate-pulse rounded-full bg-white/20" />
                <span className="inline-flex h-10 w-32 animate-pulse rounded-full bg-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <MbtiStickyRail
          locale={locale}
          headline={{
            badge: locale === "zh" ? "MBTI 报告" : "MBTI report",
            typeCode: "—",
            displayName: locale === "zh" ? "人格结果预览" : "Type preview",
            supportingLine: "",
            summary: "",
            rarity: "",
          }}
          tags={[]}
          historyHref={localizedPath("/history/mbti", locale)}
          retakeHref={retakeHref}
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaHref={primaryCtaHref}
          primaryCtaIsInternal={primaryCtaIsInternal}
          onShare={onShare}
        />
      </div>
    </div>
  );
}

export function MbtiResultShell({
  locale,
  scaleCode,
  reportData,
  accessProjection,
  headline,
  tags,
  dimensions,
  projectionViewModel,
  highlights = [],
  recommendedReads = [],
  sections,
  sectionUnlocks,
  offers,
  onInternalNavigate,
  onExternalNavigate,
}: MbtiResultShellProps) {
  const pathname = usePathname();
  const offerScrollFrameRef = useRef<number | null>(null);
  const resultViewTrackedRef = useRef(false);
  const careerBridgeImpressionTrackedRef = useRef(false);
  const actionJourneyImpressionTrackedRef = useRef(false);
  const carryoverImpressionTrackedRef = useRef(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [isSharing, setIsSharing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP[scaleCode]}/take`, locale);
  const payload = asRecord(reportData.report);
  const reportMeta = asRecord(reportData.meta);
  const identityCard = asRecord(payload?.identity_card);
  const profile = asRecord(payload?.profile);
  const layers = asRecord(payload?.layers);
  const identityLayer = (asRecord(layers?.identity) ?? null) as ReportIdentityLayer | null;
  const personalization = projectionViewModel?.personalization ?? null;
  const comparative = personalization?.comparative ?? null;
  const culturalCalibration = personalization?.culturalCalibration ?? null;
  const cta = (reportData.cta ?? null) as ReportCta | null;
  const primaryCtaLabel = resolvePrimaryCtaLabel(locale);
  const isUnlockedPostPurchase = accessProjection ? canEnterReportPage(accessProjection) : isUnlockedMbtiReport(reportData);
  const projectionLocked = accessProjection ? isProjectionLocked(accessProjection) : reportData.locked === true;
  const accessVariant = accessProjection?.variant ?? reportData.variant;
  const accessLevel = accessProjection?.accessLevel ?? reportData.access_level;
  const accessHub = normalizeMbtiAccessHub(reportData.mbti_access_hub_v1 ?? null, locale);
  const historyHref = accessProjection?.actions.historyHref ?? accessHub?.links.historyHref ?? localizedPath("/history/mbti", locale);
  const orderLookupHref = accessProjection?.actions.lookupHref ?? accessHub?.links.lookupHref ?? localizedPath("/orders/lookup", locale);
  const orderDetailHref = accessHub?.links.orderHref ?? "";
  const relationshipHubHref = accessHub?.recovery.compareInviteId
    ? localizedPath("/relationships/mbti", locale)
    : "";
  const pdfHref = accessProjection?.actions.pdfHref ?? accessHub?.pdfAccess.href ?? "";
  const canDownloadPdf = accessProjection
    ? canDownloadReportPdf(accessProjection) && Boolean(pdfHref || accessProjection.attemptId)
    : accessHub?.pdfAccess.canDownloadPdf === true && Boolean(pdfHref || accessHub?.reportAccess.attemptId);
  const modulesAllowed =
    accessProjection?.modulesAllowed && accessProjection.modulesAllowed.length > 0
      ? accessProjection.modulesAllowed
      : Array.isArray(reportData.modules_allowed)
        ? reportData.modules_allowed
        : [];
  const modulesPreview =
    accessProjection?.modulesPreview && accessProjection.modulesPreview.length > 0
      ? accessProjection.modulesPreview
      : Array.isArray(reportData.modules_preview)
        ? reportData.modules_preview
        : [];
  const nonCoreAllowedModules = normalizeStringArray(modulesAllowed).filter((moduleCode) => moduleCode.toLowerCase() !== "core_free");
  const publicTypeCode = normalizeText(projectionViewModel?.displayType, headline.typeCode);
  const publicTitle = normalizeText(projectionViewModel?.title, headline.displayName);
  const publicSubtitle = normalizeText(projectionViewModel?.subtitle, projectionViewModel?.tagline, headline.supportingLine);
  const publicSummary = normalizeText(projectionViewModel?.summary, projectionViewModel?.heroSummary, headline.summary);
  const publicRarity = normalizeText(projectionViewModel?.rarity, headline.rarity);
  const publicTypeName = normalizeText(projectionViewModel?.typeName, headline.displayName);
  const publicNickname = normalizeText(projectionViewModel?.nickname, profile?.tagline);
  const publicTags =
    projectionViewModel?.publicTags && projectionViewModel.publicTags.length > 0
      ? projectionViewModel.publicTags
      : projectionViewModel?.keywords && projectionViewModel.keywords.length > 0
        ? projectionViewModel.keywords
        : tags;
  const publicDimensions =
    projectionViewModel?.dimensions && projectionViewModel.dimensions.length > 0
      ? resolveProjectionDimensions(projectionViewModel.dimensions)
      : dimensions;
  const visibleModuleLabels = resolveVisibleModuleLabels(
    nonCoreAllowedModules.length > 0 ? nonCoreAllowedModules : modulesAllowed.length > 0 ? modulesAllowed : modulesPreview,
    locale
  );
  const previewModuleLabels =
    nonCoreAllowedModules.length === 0
      ? resolveVisibleModuleLabels(modulesPreview, locale)
      : [];
  const careerSummarySection =
    projectionViewModel?.sections.find((section) => section.key === "career.summary") ?? null;
  const careerNextStepSection =
    projectionViewModel?.sections.find((section) => section.key === "career.next_step") ?? null;
  const careerRecommendationHref = buildMbtiCareerRecommendationHref(
    locale,
    projectionViewModel?.displayType
  );
  const careerSummaryLead = extractProjectionSectionLead(careerSummarySection, ["work_style", "scene"]);
  const careerNextStepLead = extractProjectionSectionLead(careerNextStepSection, ["career_next_step"]);
  const careerNextStepBody = careerNextStepLead
    ? careerNextStepLead
    : careerSummaryLead
    ? locale === "zh"
      ? `先从公开职业页开始：${careerSummaryLead}`
      : `Start with the public career page: ${careerSummaryLead}`
    : locale === "zh"
      ? "下一步可以直接进入现有职业推荐页，继续查看这个人格类型在公开职业路径里的高匹配方向。"
      : "Continue into the public career recommendation page to see which directions this personality type tends to match best.";
  const publicHeadline: RichResultHeadline = {
    ...headline,
    typeCode: publicTypeCode || headline.typeCode,
    displayName: publicTitle || headline.displayName,
    supportingLine: publicSubtitle || headline.supportingLine,
    summary: publicSummary || headline.summary,
    rarity: publicRarity || headline.rarity,
  };
  const terminalPrimaryCtaLabel = isUnlockedPostPurchase
    ? locale === "zh"
      ? "我的 MBTI 报告"
      : "My MBTI reports"
    : primaryCtaLabel;
  const terminalPrimaryCtaHref = isUnlockedPostPurchase ? historyHref : "#offer-full";
  const globalTraits = buildDominantTraitItems({
    locale,
    roleCard: asRecord(layers?.role_card) ?? undefined,
    strategyCard: asRecord(layers?.strategy_card) ?? undefined,
    identityLayer,
    identityTags: normalizeStringArray(identityCard?.tags),
    profileKeywords: normalizeStringArray(profile?.keywords),
    fallbackTags: publicTags,
  });
  const legacySectionsByKey = new Map(sections.map((section) => [normalizeText(section.key).toLowerCase(), section]));
  const projectionSectionsByKey = new Map(
    (projectionViewModel?.sections ?? []).map((section) => [section.key, section] as const)
  );
  const shareMessage = resolveShareMessages(locale, shareStatus);
  const shareCtaLabel = resolveShareCtaLabel(locale, shareStatus, isSharing);
  const attemptId = resolveAttemptIdFromPathname(pathname ?? "");
  const variantKeysSummary = summarizeMbtiVariantKeys(personalization);
  const sceneFingerprintSummary = summarizeMbtiSceneFingerprint(personalization);
  const boundaryFlagsSummary = summarizeMbtiBoundaryFlags(personalization);
  const axisBandsSummary = summarizeMbtiAxisBands(personalization);
  const userStateSummary = summarizeMbtiUserState(personalization);
  const feedbackSentimentSummary = summarizeMbtiFeedbackSentiment(personalization);
  const feedbackCoverageSummary = summarizeMbtiFeedbackCoverage(personalization);
  const actionCompletionTendencySummary = summarizeMbtiActionCompletionTendency(personalization);
  const lastDeepReadSectionSummary = summarizeMbtiLastDeepReadSection(personalization);
  const currentIntentClusterSummary = summarizeMbtiCurrentIntentCluster(personalization);
  const secondaryFocusKeysSummary = summarizeMbtiSecondaryFocusKeys(personalization);
  const orderedSectionKeysSummary = summarizeMbtiOrderedSectionKeys(personalization);
  const orderedRecommendationKeysSummary = summarizeMbtiOrderedRecommendationKeys(personalization);
  const orderedActionKeysSummary = summarizeMbtiOrderedActionKeys(personalization);
  const recommendationPriorityKeysSummary = summarizeMbtiRecommendationPriorityKeys(personalization);
  const actionPriorityKeysSummary = summarizeMbtiActionPriorityKeys(personalization);
  const ctaPriorityKeysSummary = summarizeMbtiCtaPriorityKeys(personalization);
  const careerJourneyKeysSummary = summarizeMbtiCareerJourneyKeys(personalization);
  const careerActionPriorityKeysSummary = summarizeMbtiCareerActionPriorityKeys(personalization);
  const careerReadingKeysSummary = summarizeMbtiCareerReadingKeys(personalization);
  const recommendedResumeKeysSummary = summarizeMbtiCarryoverResumeKeys(personalization);
  const carryoverSceneKeysSummary = summarizeMbtiCarryoverSceneKeys(personalization);
  const carryoverActionKeysSummary = summarizeMbtiCarryoverActionKeys(personalization);
  const profileSeedKeySummary = summarizeMbtiProfileSeedKey(personalization);
  const sameTypeDivergenceKeysSummary = summarizeMbtiSameTypeDivergenceKeys(personalization);
  const sectionSelectionKeysSummary = summarizeMbtiSectionSelectionKeys(personalization);
  const actionSelectionKeysSummary = summarizeMbtiActionSelectionKeys(personalization);
  const recommendationSelectionKeysSummary = summarizeMbtiRecommendationSelectionKeys(personalization);
  const selectionFingerprintSummary = summarizeMbtiSelectionFingerprint(personalization);
  const memoryContractVersionSummary = summarizeMbtiMemoryContractVersion(personalization);
  const memoryFingerprintSummary = summarizeMbtiMemoryFingerprint(personalization);
  const memoryScopeSummary = summarizeMbtiMemoryScope(personalization);
  const memoryStateSummary = summarizeMbtiMemoryState(personalization);
  const memoryProgressionStateSummary = summarizeMbtiMemoryProgressionState(personalization);
  const sectionHistoryKeysSummary = summarizeMbtiSectionHistoryKeys(personalization);
  const behaviorDeltaKeysSummary = summarizeMbtiBehaviorDeltaKeys(personalization);
  const dominantInterestKeysSummary = summarizeMbtiDominantInterestKeys(personalization);
  const resumeBiasKeysSummary = summarizeMbtiResumeBiasKeys(personalization);
  const memoryRewriteKeysSummary = summarizeMbtiMemoryRewriteKeys(personalization);
  const memoryRewriteReasonSummary = summarizeMbtiMemoryRewriteReason(personalization);
  const adaptiveContractVersionSummary = summarizeMbtiAdaptiveContractVersion(personalization);
  const adaptiveFingerprintSummary = summarizeMbtiAdaptiveFingerprint(personalization);
  const adaptiveRewriteReasonSummary = summarizeMbtiAdaptiveRewriteReason(personalization);
  const contentFeedbackWeightsSummary = summarizeMbtiContentFeedbackWeights(personalization);
  const actionEffectWeightsSummary = summarizeMbtiActionEffectWeights(personalization);
  const recommendationEffectWeightsSummary = summarizeMbtiRecommendationEffectWeights(personalization);
  const ctaEffectWeightsSummary = summarizeMbtiCtaEffectWeights(personalization);
  const nextBestActionKeySummary = summarizeMbtiNextBestActionKey(personalization);
  const nextBestActionSectionSummary = summarizeMbtiNextBestActionSection(personalization);
  const nextBestActionReasonSummary = summarizeMbtiNextBestActionReason(personalization);
  const journeyContractVersionSummary = summarizeMbtiJourneyContractVersion(personalization);
  const journeyFingerprintSummary = summarizeMbtiJourneyFingerprint(personalization);
  const journeyScopeSummary = summarizeMbtiJourneyScope(personalization);
  const journeyStateSummary = summarizeMbtiJourneyState(personalization);
  const progressStateSummary = summarizeMbtiProgressState(personalization);
  const completedActionKeysSummary = summarizeMbtiCompletedActionKeys(personalization);
  const recommendedNextPulseKeysSummary = summarizeMbtiRecommendedNextPulseKeys(personalization);
  const revisitReorderReasonSummary = summarizeMbtiRevisitReorderReason(personalization);
  const pulseStateSummary = summarizeMbtiPulseState(personalization);
  const pulsePromptKeysSummary = summarizeMbtiPulsePromptKeys(personalization);
  const overviewVariantKey = normalizeText(personalization?.variantKeys.overview);
  const personalizationTypeCode = normalizeText(personalization?.typeCode, publicTypeCode);
  const personalizationIdentity = normalizeText(personalization?.identity, projectionViewModel?.variantCode);
  const personalizationPackId = normalizeText(personalization?.packId, reportMeta?.pack_id);
  const actionJourney = personalization?.actionJourney ?? null;
  const pulseCheck = personalization?.pulseCheck ?? null;
  const adaptiveSelection = personalization?.adaptiveSelection ?? null;
  const personalizationEngineVersion = normalizeText(
    personalization?.engineVersion,
    reportMeta?.report_engine_version
  );
  const rawOffers = resolveOfferPayloads(reportData);
  const fullRawOffer = findFullOfferPayload(rawOffers);
  const fullResolvedOffer =
    offers.find((offer) => offer.moduleCodes.includes("core_full") || offer.key.toUpperCase().includes("REPORT_FULL"))
    ?? null;
  const primaryFocusKey = normalizeText(personalization?.orchestration?.primaryFocusKey);
  const orderedSectionKeys = personalization?.orchestration?.orderedSectionKeys ?? [];
  const orderedActionKeys = personalization?.orderedActionKeys ?? [];
  const ctaPriorityKeys = personalization?.orchestration?.ctaPriorityKeys ?? [];
  const workingLife = personalization?.workingLife ?? null;
  const careerFocusKey = normalizeText(workingLife?.careerFocusKey, primaryFocusKey.startsWith("career.") ? primaryFocusKey : "");
  const readingFocusKey = normalizeText(personalization?.readingFocusKey);
  const actionFocusKey = normalizeText(personalization?.actionFocusKey);
  const carryoverFocusKey = normalizeText(personalization?.continuity?.carryoverFocusKey);
  const carryoverReason = normalizeText(personalization?.continuity?.carryoverReason);
  const continuityCareerHref = careerRecommendationHref
    ? appendMbtiContinuityQuery(careerRecommendationHref, personalization?.continuity)
    : "";
  const continuityWorkspaceHref = isUnlockedPostPurchase
    ? appendMbtiContinuityQuery(accessHub?.workspaceLite.href ?? historyHref, personalization?.continuity)
    : "";
  const continuityHistoryHref = historyHref
    ? appendMbtiAdaptiveSelectionQuery(
        appendMbtiContinuityQuery(historyHref, personalization?.continuity),
        adaptiveSelection
      )
    : "";
  const journeyHistoryHref = continuityHistoryHref
    ? appendMbtiActionJourneyQuery(continuityHistoryHref, actionJourney, pulseCheck)
    : historyHref
      ? appendMbtiActionJourneyQuery(historyHref, actionJourney, pulseCheck)
      : "";
  const carryoverEntryHref = normalizeText(
    carryoverFocusKey.startsWith("career.") ? continuityCareerHref : "",
    isUnlockedPostPurchase ? continuityWorkspaceHref : "",
    continuityCareerHref,
    isUnlockedPostPurchase ? continuityHistoryHref : ""
  );
  const carryoverTarget =
    carryoverEntryHref && carryoverEntryHref === continuityCareerHref
      ? "career_bridge"
      : carryoverEntryHref && (carryoverEntryHref === continuityWorkspaceHref || carryoverEntryHref === continuityHistoryHref)
        ? "workspace_lite"
        : "";
  const resolvedTerminalPrimaryCtaHref = isUnlockedPostPurchase
    ? normalizeText(continuityWorkspaceHref, continuityHistoryHref, terminalPrimaryCtaHref)
    : terminalPrimaryCtaHref;
  const isRevisit = personalization?.userState?.isRevisit === true;
  const unlockCtaRank = resolveCtaRank(ctaPriorityKeys, "unlock_full_report");
  const careerBridgeCtaRank = resolveCtaRank(ctaPriorityKeys, "career_bridge");
  const workspaceLiteCtaRank = resolveCtaRank(ctaPriorityKeys, "workspace_lite");
  const shareCtaRank = resolveCtaRank(ctaPriorityKeys, "share_result");
  const calibrationSectionKeysSummary =
    culturalCalibration?.calibratedSectionKeys.join("|") ?? "";
  const personalizationTelemetryContext = useMemo(
    () => ({
      typeCode: personalizationTypeCode,
      identity: personalizationIdentity,
      variantKey: overviewVariantKey,
      variantKeys: variantKeysSummary,
      sceneFingerprint: sceneFingerprintSummary,
      boundaryFlags: boundaryFlagsSummary,
      axisBands: axisBandsSummary,
      packId: personalizationPackId,
      engineVersion: personalizationEngineVersion,
      userState: userStateSummary,
      feedbackSentiment: feedbackSentimentSummary,
      feedbackCoverage: feedbackCoverageSummary,
      actionCompletionTendency: actionCompletionTendencySummary,
      lastDeepReadSection: lastDeepReadSectionSummary,
      currentIntentCluster: currentIntentClusterSummary,
      primaryFocusKey,
      secondaryFocusKeys: secondaryFocusKeysSummary,
      orderedSectionKeys: orderedSectionKeysSummary,
      orderedRecommendationKeys: orderedRecommendationKeysSummary,
      orderedActionKeys: orderedActionKeysSummary,
      recommendationPriorityKeys: recommendationPriorityKeysSummary,
      actionPriorityKeys: actionPriorityKeysSummary,
      readingFocusKey,
      actionFocusKey,
      ctaPriorityKeys: ctaPriorityKeysSummary,
      careerFocusKey,
      careerJourneyKeys: careerJourneyKeysSummary,
      careerActionPriorityKeys: careerActionPriorityKeysSummary,
      careerReadingKeys: careerReadingKeysSummary,
      localeContext: normalizeText(culturalCalibration?.localeContext),
      culturalContext: normalizeText(culturalCalibration?.culturalContext),
      calibratedSectionKeys: calibrationSectionKeysSummary,
      calibrationFingerprint: normalizeText(culturalCalibration?.calibrationFingerprint),
      calibrationContractVersion: normalizeText(culturalCalibration?.calibrationContractVersion),
      comparativeContractVersion: normalizeText(comparative?.comparativeContractVersion),
      comparativeFingerprint: normalizeText(comparative?.comparativeFingerprint),
      comparativeNormingVersion: normalizeText(comparative?.normingVersion),
      comparativeNormingScope: normalizeText(comparative?.normingScope),
      comparativeNormingSource: normalizeText(comparative?.normingSource),
      carryoverFocusKey,
      carryoverReason,
      recommendedResumeKeys: recommendedResumeKeysSummary,
      carryoverSceneKeys: carryoverSceneKeysSummary,
      carryoverActionKeys: carryoverActionKeysSummary,
      profileSeedKey: profileSeedKeySummary,
      sameTypeDivergenceKeys: sameTypeDivergenceKeysSummary,
      sectionSelectionKeys: sectionSelectionKeysSummary,
      actionSelectionKeys: actionSelectionKeysSummary,
      recommendationSelectionKeys: recommendationSelectionKeysSummary,
      selectionFingerprint: selectionFingerprintSummary,
      memoryContractVersion: memoryContractVersionSummary,
      memoryFingerprint: memoryFingerprintSummary,
      memoryScope: memoryScopeSummary,
      memoryState: memoryStateSummary,
      memoryProgressionState: memoryProgressionStateSummary,
      sectionHistoryKeys: sectionHistoryKeysSummary,
      behaviorDeltaKeys: behaviorDeltaKeysSummary,
      dominantInterestKeys: dominantInterestKeysSummary,
      resumeBiasKeys: resumeBiasKeysSummary,
      memoryRewriteKeys: memoryRewriteKeysSummary,
      memoryRewriteReason: memoryRewriteReasonSummary,
      adaptiveContractVersion: adaptiveContractVersionSummary,
      adaptiveFingerprint: adaptiveFingerprintSummary,
      selectionRewriteReason: adaptiveRewriteReasonSummary,
      contentFeedbackWeights: contentFeedbackWeightsSummary,
      actionEffectWeights: actionEffectWeightsSummary,
      recommendationEffectWeights: recommendationEffectWeightsSummary,
      ctaEffectWeights: ctaEffectWeightsSummary,
      nextBestActionKey: nextBestActionKeySummary,
      nextBestActionSection: nextBestActionSectionSummary,
      nextBestActionReason: nextBestActionReasonSummary,
      journeyContractVersion: journeyContractVersionSummary,
      journeyFingerprint: journeyFingerprintSummary,
      journeyScope: journeyScopeSummary,
      journeyState: journeyStateSummary,
      progressState: progressStateSummary,
      completedActionKeys: completedActionKeysSummary,
      recommendedNextPulseKeys: recommendedNextPulseKeysSummary,
      revisitReorderReason: revisitReorderReasonSummary,
      pulseState: pulseStateSummary,
      pulsePromptKeys: pulsePromptKeysSummary,
      locale,
    }),
    [
      actionCompletionTendencySummary,
      actionSelectionKeysSummary,
      actionEffectWeightsSummary,
      actionFocusKey,
      actionPriorityKeysSummary,
      adaptiveContractVersionSummary,
      adaptiveFingerprintSummary,
      adaptiveRewriteReasonSummary,
      axisBandsSummary,
      behaviorDeltaKeysSummary,
      boundaryFlagsSummary,
      calibrationSectionKeysSummary,
      carryoverActionKeysSummary,
      carryoverFocusKey,
      carryoverReason,
      carryoverSceneKeysSummary,
      careerActionPriorityKeysSummary,
      careerFocusKey,
      careerJourneyKeysSummary,
      careerReadingKeysSummary,
      comparative,
      completedActionKeysSummary,
      contentFeedbackWeightsSummary,
      ctaEffectWeightsSummary,
      ctaPriorityKeysSummary,
      culturalCalibration,
      currentIntentClusterSummary,
      dominantInterestKeysSummary,
      feedbackCoverageSummary,
      feedbackSentimentSummary,
      journeyContractVersionSummary,
      journeyFingerprintSummary,
      journeyScopeSummary,
      journeyStateSummary,
      lastDeepReadSectionSummary,
      locale,
      memoryContractVersionSummary,
      memoryFingerprintSummary,
      memoryProgressionStateSummary,
      memoryRewriteKeysSummary,
      memoryRewriteReasonSummary,
      memoryScopeSummary,
      memoryStateSummary,
      nextBestActionKeySummary,
      nextBestActionReasonSummary,
      nextBestActionSectionSummary,
      orderedActionKeysSummary,
      orderedRecommendationKeysSummary,
      orderedSectionKeysSummary,
      overviewVariantKey,
      personalizationEngineVersion,
      personalizationIdentity,
      personalizationPackId,
      personalizationTypeCode,
      primaryFocusKey,
      profileSeedKeySummary,
      progressStateSummary,
      pulsePromptKeysSummary,
      pulseStateSummary,
      readingFocusKey,
      recommendationEffectWeightsSummary,
      recommendationSelectionKeysSummary,
      recommendationPriorityKeysSummary,
      recommendedNextPulseKeysSummary,
      recommendedResumeKeysSummary,
      resumeBiasKeysSummary,
      revisitReorderReasonSummary,
      sameTypeDivergenceKeysSummary,
      sceneFingerprintSummary,
      secondaryFocusKeysSummary,
      sectionHistoryKeysSummary,
      sectionSelectionKeysSummary,
      selectionFingerprintSummary,
      userStateSummary,
      variantKeysSummary,
    ]
  );

  const cancelScheduledOfferScroll = useCallback(() => {
    if (offerScrollFrameRef.current === null || typeof window === "undefined") {
      return;
    }

    window.cancelAnimationFrame(offerScrollFrameRef.current);
    offerScrollFrameRef.current = null;
  }, []);

  const scrollOfferIntoCenter = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    cancelScheduledOfferScroll();

    const scheduleSecondFrame = () => {
      offerScrollFrameRef.current = window.requestAnimationFrame(() => {
        offerScrollFrameRef.current = null;
        const offerSection =
          document.getElementById(OFFER_SECTION_ID)
          ?? document.getElementById("offer-full")?.closest("section")
          ?? document.getElementById("offer-full");

        if (!(offerSection instanceof HTMLElement)) {
          return;
        }

        offerSection.scrollIntoView(OFFER_SCROLL_ALIGNMENT);
      });
    };

    offerScrollFrameRef.current = window.requestAnimationFrame(scheduleSecondFrame);
  }, [cancelScheduledOfferScroll]);

  const syncOfferHashScroll = useCallback(() => {
    if (typeof window === "undefined" || window.location.hash !== OFFER_FULL_HASH) {
      return;
    }

    scrollOfferIntoCenter();
  }, [scrollOfferIntoCenter]);

  const handleOfferAnchorClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (typeof window === "undefined" || event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href="#offer-full"]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();

      const nextUrl = `${window.location.pathname}${window.location.search}${OFFER_FULL_HASH}`;
      if (window.location.hash === OFFER_FULL_HASH) {
        window.history.replaceState(null, "", nextUrl);
      } else {
        window.history.pushState(null, "", nextUrl);
      }

      scrollOfferIntoCenter();
    },
    [scrollOfferIntoCenter]
  );

  useEffect(() => {
    if (projectionLocked || !attemptId) {
      return;
    }

    const pendingOrder = readPendingOrder();
    if (pendingOrder?.attemptId === attemptId) {
      clearPendingOrder();
    }
  }, [attemptId, projectionLocked]);

  useEffect(() => {
    syncOfferHashScroll();
    window.addEventListener("hashchange", syncOfferHashScroll);

    return () => {
      window.removeEventListener("hashchange", syncOfferHashScroll);
      cancelScheduledOfferScroll();
    };
  }, [cancelScheduledOfferScroll, syncOfferHashScroll]);

  useEffect(() => {
    if (!attemptId || resultViewTrackedRef.current) {
      return;
    }

    resultViewTrackedRef.current = true;
    const basePayload = {
      attempt_id: attemptId,
      attemptIdMasked: maskIdentifier(attemptId),
      locked: projectionLocked,
      ...personalizationTelemetryContext,
    };

    trackEvent("view_result", basePayload);

    if (typeof window === "undefined" || !isRevisit) {
      return;
    }

    const revisitStorageKey = `fm_mbti_result_revisit:${attemptId}`;
    if (window.sessionStorage.getItem(revisitStorageKey) === "1") {
      return;
    }

    trackEvent("revisit_result", basePayload);
    window.sessionStorage.setItem(revisitStorageKey, "1");
  }, [attemptId, isRevisit, personalizationTelemetryContext, projectionLocked]);

  useEffect(() => {
    if (!careerRecommendationHref || !careerNextStepSection || careerBridgeImpressionTrackedRef.current) {
      return;
    }

    careerBridgeImpressionTrackedRef.current = true;
    trackEvent(
      "ui_card_impression",
      buildCareerBridgeTelemetryPayload(careerNextStepSection, locale, personalization, {
        attemptId,
        ctaKey: "career_bridge",
        ctaRank: careerBridgeCtaRank,
      })
    );
  }, [attemptId, careerBridgeCtaRank, careerRecommendationHref, careerNextStepSection, locale, personalization]);

  useEffect(() => {
    if (!actionJourney || !isRevisit || actionJourneyImpressionTrackedRef.current) {
      return;
    }

    actionJourneyImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "mbti_action_journey",
      attempt_id: attemptId,
      continueTarget: "history_continue",
      ...personalizationTelemetryContext,
    });
  }, [actionJourney, attemptId, isRevisit, personalizationTelemetryContext]);

  useEffect(() => {
    if (!carryoverEntryHref || carryoverImpressionTrackedRef.current) {
      return;
    }

    carryoverImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "mbti_carryover_entry",
      attempt_id: attemptId,
      continueTarget: carryoverTarget,
      ...personalizationTelemetryContext,
    });
  }, [attemptId, carryoverEntryHref, carryoverTarget, personalizationTelemetryContext]);

  async function handleShare() {
    if (typeof window === "undefined" || isSharing) return;
    if (!attemptId) {
      setShareStatus("failed");
      return;
    }

    const shareTitle = locale === "zh" ? "分享我的测试结果" : "Share my result";
    setIsSharing(true);

    try {
      const shareResponse = await createAttemptShare({
        attemptId,
        locale,
      });
      const shareUrl = resolveAbsoluteShareUrl(
        normalizeText(shareResponse.share_url, shareResponse.shareUrl, shareResponse.url)
      );
      if (!shareUrl) {
        throw new Error(locale === "zh" ? "分享链接生成失败。" : "Share link unavailable.");
      }

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        trackEvent("share_result", {
          attempt_id: attemptId,
          attemptIdMasked: maskIdentifier(attemptId),
          ...personalizationTelemetryContext,
          ctaKey: "share_result",
          ctaRank: shareCtaRank,
          shareMethod: "native",
        });
        setShareStatus("idle");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        trackEvent("share_result", {
          attempt_id: attemptId,
          attemptIdMasked: maskIdentifier(attemptId),
          ...personalizationTelemetryContext,
          ctaKey: "share_result",
          ctaRank: shareCtaRank,
          shareMethod: "clipboard",
        });
        setShareStatus("copied");
        return;
      }
    } catch {
      // Fall through to failed state.
    } finally {
      setIsSharing(false);
    }

    setShareStatus("failed");
  }

  async function handleCheckout() {
    if (typeof window === "undefined") return;

    if (!attemptId) {
      setCheckoutError(locale === "zh" ? "无法定位当前测评记录。" : "Unable to locate the current attempt.");
      return;
    }

    let sku = "";

    try {
      sku = resolveMbtiCheckoutSku(reportData);
    } catch (cause) {
      setCheckoutError(cause instanceof Error ? cause.message : String(cause));
      return;
    }

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      trackEvent("click_unlock", {
        attempt_id: attemptId,
        attemptIdMasked: maskIdentifier(attemptId),
        sku,
        priceShown:
          fullResolvedOffer?.price
          ?? (typeof fullRawOffer?.price_cents === "number"
            ? `${fullRawOffer.currency ?? ""} ${fullRawOffer.price_cents}`
            : ""),
        ...personalizationTelemetryContext,
        ctaKey: "unlock_full_report",
        ctaRank: unlockCtaRank,
      });

      const checkout = await createCheckoutOrOrder({
        attemptId,
        sku,
        idempotencyKey: `mbti_result_checkout_${attemptId}_${sku}`,
        region: regionFromLocale(locale),
      });
      const action = resolveCheckoutAction(
        checkout,
        locale === "zh" ? "暂时无法发起支付。" : "Unable to start checkout."
      );
      const pendingOrderNo =
        normalizeText(checkout.order_no)
        || (action.kind === "order_wait"
          ? action.orderNo
          : action.kind === "redirect"
            ? normalizeText(action.orderNo)
            : "");
      const waitUrl =
        action.kind === "order_wait" || action.kind === "redirect"
          ? resolveLocalizedWaitFlowPath(action, locale)
          : null;
      const paymentRecoveryToken = normalizeText(
        checkout.payment_recovery_token,
        action.kind === "order_wait" || action.kind === "redirect" ? action.paymentRecoveryToken : null
      );
      const resultUrl = normalizeText(
        checkout.result_url,
        action.kind === "order_wait" || action.kind === "redirect" ? action.resultUrl : null
      );
      const resolvedProvider = normalizeText(
        checkout.provider,
        action.kind === "order_wait" || action.kind === "redirect" ? action.provider : null
      );

      if (!pendingOrderNo) {
        throw new Error(locale === "zh" ? "支付响应缺少订单号。" : "Checkout response is missing order_no.");
      }

      writePendingOrder({
        orderNo: pendingOrderNo,
        attemptId,
        sku,
        provider: resolvedProvider || null,
        waitUrl,
        paymentRecoveryToken: paymentRecoveryToken || null,
        resultUrl: resultUrl || null,
      });
      trackEvent("create_order", {
        attempt_id: attemptId,
        attemptIdMasked: maskIdentifier(attemptId),
        orderNoMasked: maskIdentifier(pendingOrderNo),
        sku,
        ...personalizationTelemetryContext,
        ctaKey: "unlock_full_report",
        ctaRank: unlockCtaRank,
      });

      if (action.kind === "redirect") {
        if (onExternalNavigate) {
          onExternalNavigate(action.url);
        } else {
          window.location.href = action.url;
        }
        return;
      }

      if (action.kind === "order_wait") {
        const path = waitUrl ?? localizedPath(buildOrderWaitPath(action), locale);
        if (onInternalNavigate) {
          onInternalNavigate(path);
        } else {
          window.location.assign(path);
        }
        return;
      }

      throw new Error(action.message);
    } catch (cause) {
      captureError(cause, {
        route: "/result/[attemptId]",
        scale_code: "MBTI",
        stage: "create_checkout",
        attempt_id: attemptId,
        sku,
      });
      setCheckoutError(resolveCheckoutErrorMessage(locale, cause));
    } finally {
      setIsCheckingOut(false);
    }
  }

  const ctaSurfaceEntries: Array<{ key: string; rank: number; node: ReactNode }> = [];

  if (careerRecommendationHref) {
    ctaSurfaceEntries.push({
      key: "career_bridge",
      rank: careerBridgeCtaRank > 0 ? careerBridgeCtaRank : 999,
      node: (
        <section
          id="career-next-step"
          data-testid="mbti-career-next-step"
          data-cta-key="career_bridge"
          data-cta-rank={careerBridgeCtaRank > 0 ? String(careerBridgeCtaRank) : undefined}
          className={`scroll-mt-28 rounded-[28px] border bg-gradient-to-br from-sky-50 via-white to-emerald-50/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:p-6 ${
            careerBridgeCtaRank === 1 ? "border-emerald-300 ring-1 ring-emerald-100" : "border-sky-200"
          }`}
        >
          <div className="space-y-3">
            {careerBridgeCtaRank > 0 ? (
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {resolveCtaRankLabel(locale, careerBridgeCtaRank)}
              </p>
            ) : null}
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              {locale === "zh" ? "职业下一步" : "Career next step"}
            </p>
            <div className="space-y-2">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                {locale === "zh"
                  ? `继续查看 ${projectionViewModel?.displayType || projectionViewModel?.canonicalTypeCode} 的职业推荐`
                  : `Continue with ${projectionViewModel?.displayType || projectionViewModel?.canonicalTypeCode} career recommendations`}
              </h2>
              <p className="m-0 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {careerNextStepBody}
              </p>
            </div>
            <Link
              data-testid="mbti-career-next-step-cta"
              href={continuityCareerHref || careerRecommendationHref}
              onClick={() => {
                if (!careerNextStepSection) {
                  return;
                }

                trackEvent("ui_card_interaction", {
                  ...buildCareerBridgeTelemetryPayload(careerNextStepSection, locale, personalization, {
                    attemptId,
                    ctaKey: "career_bridge",
                    ctaRank: careerBridgeCtaRank,
                  }),
                  interaction: "click_cta",
                });
              }}
              className={buttonVariants({ className: "bg-slate-950 text-white hover:bg-slate-800" })}
            >
              {locale === "zh" ? "查看职业推荐" : "View career recommendations"}
            </Link>
          </div>
        </section>
      ),
    });
  }

  if (isUnlockedPostPurchase && attemptId) {
    ctaSurfaceEntries.push({
      key: "workspace_lite",
      rank: workspaceLiteCtaRank > 0 ? workspaceLiteCtaRank : 999,
      node: (
        <MbtiPostPurchaseSection
          locale={locale}
          attemptId={attemptId}
          accessProjection={accessProjection}
          accessHub={accessHub}
          historyHref={journeyHistoryHref || continuityWorkspaceHref || continuityHistoryHref || historyHref}
          orderLookupHref={orderLookupHref}
          personalization={personalization}
          ctaRank={workspaceLiteCtaRank}
        />
      ),
    });
  } else {
    ctaSurfaceEntries.push({
      key: "unlock_full_report",
      rank: unlockCtaRank > 0 ? unlockCtaRank : 999,
      node: (
        <MbtiOfferComparisonSection
          locale={locale}
          attemptId={attemptId}
          offers={offers}
          cta={cta}
          personalization={personalization}
          ctaRank={unlockCtaRank}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
          checkoutError={checkoutError}
        />
      ),
    });
  }

  const orderedCtaSurfaceEntries = [...ctaSurfaceEntries]
    .sort((left, right) => {
      if (left.rank === right.rank) {
        return left.key.localeCompare(right.key);
      }

      return left.rank - right.rank;
    })
    ;

  const offerCtaEntry = orderedCtaSurfaceEntries.find(
    (entry) => entry.key === "unlock_full_report" || entry.key === "workspace_lite"
  );
  const auxiliaryCtaEntries = orderedCtaSurfaceEntries.filter((entry) => entry.key !== "unlock_full_report" && entry.key !== "workspace_lite");
  const chapterSectionNodes = CHAPTER_ORDER.map((chapterKey) => {
    const legacySection = legacySectionsByKey.get(chapterKey) ?? null;
    const projectionSections = sortProjectionSectionsForChapter(
      CHAPTER_PROJECTION_KEYS[chapterKey]
        .map((sectionKey) => projectionSectionsByKey.get(sectionKey))
        .filter((section): section is MbtiResultProjectionSectionViewModel => Boolean(section)),
      orderedSectionKeys,
      orderedActionKeys
    );

    if (!legacySection && projectionSections.length === 0) {
      return null;
    }

    return (
      <MbtiChapterSection
        key={chapterKey}
        locale={locale}
        attemptId={attemptId}
        chapterKey={chapterKey}
        legacySection={legacySection}
        projectionSections={projectionSections}
        projectionDimensions={projectionViewModel?.dimensions ?? []}
        globalTraits={globalTraits}
        unlock={sectionUnlocks[chapterKey] ?? null}
        identityLayer={identityLayer}
        personalization={personalization}
        primaryFocusKey={primaryFocusKey}
      />
    );
  }).filter(Boolean);
  const offerPrimaryLabel = isUnlockedPostPurchase ? terminalPrimaryCtaLabel : locale === "zh" ? "解锁完整报告" : "Unlock full report";
  const heroSurfaceClass = [
    "motion-reduce:transform-none motion-reduce:transition-none transition-all duration-500 ease-out",
    hasEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
  ].join(" ");
  const introSurfaceClass = [
    "motion-reduce:transform-none motion-reduce:transition-none transition-all duration-500 delay-75 ease-out",
    hasEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
  ].join(" ");
  const shellStateLabel = isUnlockedPostPurchase
    ? locale === "zh"
      ? "完整报告已解锁"
      : "Full report unlocked"
    : locale === "zh"
      ? "当前为免费预览"
      : "Currently on free preview";
  const shellStateBody = isUnlockedPostPurchase
    ? locale === "zh"
      ? "正文继续按章节阅读，工作台统一收口 PDF、历史、订单与后续回访入口。"
      : "Continue through the chapters while the workspace consolidates PDF, history, order, and revisit entry points."
    : locale === "zh"
      ? "先看公开层和四个正式章节，再在主方案区决定是否提升判读分辨率。"
      : "Read the public layer and the four formal chapters first, then decide whether to increase the reading resolution in the main unlock section.";
  const heroStatusCards = [
    {
      label: locale === "zh" ? "状态" : "Status",
      value: shellStateLabel,
      detail: shellStateBody,
    },
    {
      label: locale === "zh" ? "交付" : "Delivery",
      value: canDownloadPdf
        ? locale === "zh"
          ? "PDF 已就绪"
          : "PDF ready"
        : locale === "zh"
          ? "在线访问"
          : "Online access",
      detail: canDownloadPdf
        ? locale === "zh"
          ? "已解锁后可直接从工作台下载 PDF。"
          : "The PDF can be downloaded directly from the workspace after unlock."
        : locale === "zh"
          ? "PDF 保持独立 readiness，不等于已解锁。"
          : "PDF readiness stays independent from report unlock.",
    },
    {
      label: locale === "zh" ? "后续入口" : "Next entry",
      value: isUnlockedPostPurchase
        ? locale === "zh"
          ? "Workspace / 历史结果"
          : "Workspace / history"
        : locale === "zh"
          ? "主方案区解锁"
          : "Main unlock section",
      detail: isUnlockedPostPurchase
        ? locale === "zh"
          ? "当前结果会回收到 MBTI Workspace Lite。"
          : "This result folds back into MBTI Workspace Lite."
        : locale === "zh"
          ? "整页只有一个主解锁收口：#offer-full。"
          : "There is only one primary unlock sink on this page: #offer-full.",
    },
  ];
  const heroInsightItems = [
    {
      label: locale === "zh" ? "阅读模式" : "Reading mode",
      value: isUnlockedPostPurchase ? (locale === "zh" ? "完整判读" : "Full reading") : locale === "zh" ? "免费预览" : "Preview",
      detail: isUnlockedPostPurchase
        ? locale === "zh"
          ? "已开放完整章节与回访入口"
          : "Full chapters and revisit entry enabled"
        : locale === "zh"
          ? "先看公开层，再决定是否提升结果分辨率"
          : "Review the public layer before increasing result resolution",
    },
    {
      label: locale === "zh" ? "证据锚点" : "Evidence anchor",
      value: publicDimensions[0]
        ? `${resolveDimensionStatLabel(normalizeText(publicDimensions[0].code), locale)} · ${Math.round(
            Number(publicDimensions[0].percent ?? publicDimensions[0].score ?? publicDimensions[0].value ?? 0)
          )}%`
        : locale === "zh"
          ? "结构化判读"
          : "Structured reading",
      detail: locale === "zh"
        ? "结果由类型骨架、边界轴与场景映射共同解释"
        : "Explained through type structure, boundary axes, and scenario mapping",
    },
    {
      label: locale === "zh" ? "可见范围" : "Visible scope",
      value: visibleModuleLabels[0] ?? (locale === "zh" ? "结果摘要" : "Result summary"),
      detail: visibleModuleLabels.length > 1
        ? visibleModuleLabels.slice(1, 3).join(" · ")
        : previewModuleLabels.length > 1
          ? previewModuleLabels.slice(1, 3).join(" · ")
          : previewModuleLabels.length > 0
            ? locale === "zh"
              ? "当前预览会按模块逐步开放，完整报告再补齐完整判断依据与行动坐标。"
              : "The preview opens by module first, while the full report fills in the complete decision basis and action coordinates."
        : locale === "zh"
          ? "完整报告补齐更高分辨率的场景与行动坐标"
          : "The full report adds higher-resolution scenario and action coordinates",
    },
  ];
  const introGuideItems = [
    {
      title: locale === "zh" ? "先看类型骨架" : "Start with structure",
      body: locale === "zh"
        ? "先确认结果主轴、边界位置和稀有度，再进入四个章节。"
        : "Confirm the main axis, boundary position, and rarity before entering the chapters.",
    },
    {
      title: locale === "zh" ? "再看场景映射" : "Then scan scenarios",
      body: locale === "zh"
        ? "职业、成长与关系章节负责把类型翻译成场景，不再重复标签。"
        : "Career, growth, and relationship chapters translate the type into scenarios rather than labels.",
    },
    {
      title: locale === "zh" ? "最后判断是否升级" : "Then decide on depth",
      body: locale === "zh"
        ? "免费预览先给公开层；完整报告才补齐完整判断依据与行动坐标。"
        : "The preview exposes the public layer first; the full report completes the decision basis and action map.",
    },
  ];
  const memoryStatusTitle = memoryFingerprintSummary
    ? locale === "zh"
      ? "长期记忆已生效"
      : "Longitudinal memory active"
    : "";
  const adaptiveStatusTitle = adaptiveFingerprintSummary
    ? locale === "zh"
      ? "自适应修正已生效"
      : "Adaptive selection active"
    : "";
  const introStatusCards = [
    memoryStatusTitle
      ? {
          testId: "mbti-longitudinal-memory",
          title: memoryStatusTitle,
          body:
            normalizeText(memoryProgressionStateSummary, memoryRewriteReasonSummary, memoryStateSummary) ||
            (locale === "zh" ? "当前阅读会沿用你最近一次的结果上下文。" : "This reading reuses the context from your recent result."),
        }
      : null,
    adaptiveStatusTitle
      ? {
          testId: "mbti-adaptive-selection",
          title: adaptiveStatusTitle,
          body:
            normalizeText(adaptiveRewriteReasonSummary, adaptiveContractVersionSummary) ||
            (locale === "zh" ? "章节排序与动作线索会按当前上下文做微调。" : "Chapter order and action cues are lightly adjusted for the current context."),
        }
      : null,
  ].filter(Boolean) as Array<{ testId: string; title: string; body: string }>;
  const principleItems = locale === "zh"
    ? ["可解释", "可行动", "可追溯", "数据主权"]
    : ["Explainable", "Actionable", "Traceable", "Sovereignty"];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      data-testid="mbti-result-shell"
      data-profile-seed-key={profileSeedKeySummary || undefined}
      data-selection-fingerprint={selectionFingerprintSummary || undefined}
      data-same-type-divergence-keys={sameTypeDivergenceKeysSummary || undefined}
      data-memory-fingerprint={memoryFingerprintSummary || undefined}
      data-memory-state={memoryStateSummary || undefined}
      data-memory-rewrite-reason={memoryRewriteReasonSummary || undefined}
      data-adaptive-fingerprint={adaptiveFingerprintSummary || undefined}
      data-selection-rewrite-reason={adaptiveRewriteReasonSummary || undefined}
      data-next-best-action-key={nextBestActionKeySummary || undefined}
      className="relative space-y-6 pb-28 md:space-y-8 xl:pb-0"
      onClickCapture={handleOfferAnchorClickCapture}
    >
      <MbtiMobileChrome
        locale={locale}
        retakeHref={retakeHref}
        primaryCtaLabel={terminalPrimaryCtaLabel}
        primaryCtaHref={resolvedTerminalPrimaryCtaHref}
        primaryCtaIsInternal={isUnlockedPostPurchase}
        shareCtaLabel={shareCtaLabel}
        shareDisabled={isSharing}
        onShare={handleShare}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="space-y-6 md:space-y-8">
          <section
            id="hero"
            data-testid="mbti-hero"
            className={`scroll-mt-28 overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(236,253,245,0.92)_30%,rgba(241,245,249,0.98)_62%,rgba(255,255,255,1)_100%)] shadow-[0_24px_64px_rgba(15,23,42,0.12)] ${heroSurfaceClass}`}
          >
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
              <div className="pointer-events-none absolute -right-6 top-10 h-40 w-40 rounded-full bg-emerald-100/70 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-52 rounded-full bg-sky-100/70 blur-3xl" />
              <div className="space-y-7 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    {headline.badge}
                  </span>
                  {principleItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                    >
                      {item}
                    </span>
                  ))}
                  {(projectionLocked || normalizeText(accessVariant).toLowerCase() === "free" || normalizeText(accessLevel).toLowerCase() === "free") ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                      {locale === "zh" ? "免费预览" : "Free preview"}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                      {locale === "zh" ? "完整访问" : "Full access"}
                    </span>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)] lg:items-start">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {locale === "zh" ? "决策级人格结果" : "Decision-grade personality result"}
                      </p>
                      <div className="space-y-2">
                        <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
                          {publicHeadline.typeCode}
                          {publicHeadline.displayName ? (
                            <span className="block pt-2 text-[0.45em] font-medium tracking-[-0.02em] text-slate-600 md:inline md:pl-3 md:pt-0">
                              {publicHeadline.displayName}
                            </span>
                          ) : null}
                        </h1>
                        {publicTypeName || publicNickname ? (
                          <p data-testid="mbti-hero-identity-line" className="m-0 text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
                            {[publicTypeName, publicNickname].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {publicHeadline.supportingLine ? (
                      <p className="m-0 max-w-3xl text-lg font-medium leading-8 text-slate-700">{publicHeadline.supportingLine}</p>
                    ) : null}
                    {publicHeadline.summary ? (
                      <p className="m-0 max-w-3xl text-base leading-8 text-slate-600">{publicHeadline.summary}</p>
                    ) : null}

                    {publicTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {publicTags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-full border border-white/85 bg-white/75 px-3 py-1.5 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div
                      data-testid="mbti-dimensions"
                      className="grid gap-3 rounded-[28px] border border-white/70 bg-white/72 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:grid-cols-2"
                    >
                      {publicDimensions.slice(0, 4).map((dimension) => {
                        const code = normalizeText(dimension.code);
                        const label = normalizeText(
                          resolveDimensionStatLabel(code, locale),
                          dimension.label,
                          code
                        );
                        const percent = resolveDimensionPercent(dimension);
                        const winnerLabel = normalizeText(
                          dimension.winnerLabel,
                          dimension.label,
                          code
                        );

                        return (
                          <div
                            key={`${code}-${label}`}
                            className="rounded-2xl border border-slate-200/80 bg-white/85 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {label}
                              </p>
                              <span className="text-sm font-semibold text-slate-900">{percent}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-slate-950"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <p className="m-0 mt-3 text-sm font-medium text-slate-900">{winnerLabel}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] border border-slate-200/80 bg-slate-950 text-white shadow-[0_24px_48px_rgba(15,23,42,0.18)]">
                      <div className="space-y-5 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                              {locale === "zh" ? "当前状态" : "Current state"}
                            </p>
                            <p className="m-0 text-3xl font-semibold tracking-[-0.04em] text-white">
                              {publicHeadline.typeCode}
                            </p>
                            <p className="m-0 text-sm leading-6 text-slate-300">{shellStateBody}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                            <p className="m-0 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                              {locale === "zh" ? "常模位置" : "Norm anchor"}
                            </p>
                            <p className="m-0 mt-1 text-sm font-medium text-white">
                              {publicHeadline.rarity || (locale === "zh" ? "按章节读取" : "Read by chapter")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {heroStatusCards.map((item) => (
                            <div
                              key={item.label}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition duration-200 motion-reduce:transition-none hover:border-white/20 hover:bg-white/[0.08]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  {item.label}
                                </p>
                                <span className="text-sm font-medium text-white">{item.value}</span>
                              </div>
                              <p className="m-0 mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                            </div>
                          ))}
                        </div>

                        <a
                          href={isUnlockedPostPurchase ? "#offer-full" : "#offer-full"}
                          className={buttonVariants({
                            className:
                              "w-full bg-white text-slate-950 shadow-[0_12px_28px_rgba(255,255,255,0.16)] transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-300 active:translate-y-0",
                          })}
                        >
                          {isUnlockedPostPurchase
                            ? locale === "zh"
                              ? "打开完整结果工作台"
                              : "Open the full result workspace"
                            : locale === "zh"
                              ? "查看完整报告边界"
                              : "Review the full-report boundary"}
                        </a>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {heroInsightItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/70 bg-white/78 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                        >
                          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.label}
                          </p>
                          <p className="m-0 mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                          <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="intro"
            className={`scroll-mt-28 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] backdrop-blur ${introSurfaceClass} md:p-6`}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div className="space-y-3">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {locale === "zh" ? "如何阅读这份结果" : "How to read this result"}
                </p>
                <h2 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {locale === "zh" ? "先确认结构，再进入场景，再决定是否提升判读深度" : "Confirm structure first, then read scenarios, then decide on depth"}
                </h2>
                <p className="m-0 text-sm leading-7 text-slate-600">
                  {locale === "zh"
                    ? "这一页先交付公开层结果。四个章节依次解释人格骨架、职业映射、成长阻力与关系模式。完整报告负责补齐更高分辨率的判断依据与行动坐标。"
                    : "This page delivers the public layer first. The four chapters explain type structure, career mapping, growth friction, and relationship patterns before the full report adds higher-resolution evidence and action coordinates."}
                </p>
              </div>
              <div className="space-y-3">
                {introStatusCards.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {introStatusCards.map((item) => (
                      <div
                        key={item.testId}
                        data-testid={item.testId}
                        className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"
                      >
                        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          {item.title}
                        </p>
                        <p className="m-0 mt-2 text-sm leading-6 text-slate-700">{item.body}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-3">
                  {introGuideItems.map((item, index) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                    >
                      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {locale === "zh" ? `步骤 ${index + 1}` : `Step ${index + 1}`}
                      </p>
                      <p className="m-0 mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <MbtiHighlightsSection locale={locale} cards={highlights} />

          {chapterSectionNodes}

          {auxiliaryCtaEntries.map((entry) => (
            <div key={`mbti-cta-surface-${entry.key}-${entry.rank}`}>{entry.node}</div>
          ))}

          <section
            id={OFFER_SECTION_ID}
            data-testid="mbti-offer-full"
            className="scroll-mt-28 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            {offerCtaEntry?.node}
          </section>

          <MbtiRecommendedReadsSection
            locale={locale}
            reads={recommendedReads}
            personalization={personalization}
          />

          <Card
            id="footer-cta"
            data-testid="mbti-footer-cta"
            className="border-slate-950 bg-slate-950 text-white shadow-[0_22px_52px_rgba(15,23,42,0.22)]"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-white">{locale === "zh" ? "结果收束动作" : "Result actions"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">
                  <p className="m-0 text-sm leading-7 text-slate-300">
                    {isUnlockedPostPurchase
                      ? locale === "zh"
                        ? "结果正文保留在当前页，后续回访、PDF 与订单入口统一收在工作台与历史结果。"
                        : "The reading stays on this page while revisit, PDF, and order entry points consolidate into the workspace and history."
                      : locale === "zh"
                        ? "这里收口分享、重测与历史入口；唯一主解锁动作仍然回到 #offer-full。"
                        : "This footer keeps share, retake, and history entry points while the single primary unlock action still resolves to #offer-full."}
                  </p>
                  {shareMessage ? <p className="m-0 text-sm text-emerald-200">{shareMessage}</p> : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" disabled={isSharing} onClick={() => void handleShare()}>
                    {shareCtaLabel}
                  </Button>
                  <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
                    {locale === "zh" ? "重新测试" : "Retake test"}
                  </Link>
                  <Link href={historyHref} className={buttonVariants({ variant: "outline" })}>
                    {locale === "zh" ? "查看历史" : "View history"}
                  </Link>
                  {isUnlockedPostPurchase ? (
                    <Link
                      href={resolvedTerminalPrimaryCtaHref}
                      className={buttonVariants({ className: "bg-emerald-500 text-white hover:bg-emerald-600" })}
                    >
                      {terminalPrimaryCtaLabel}
                    </Link>
                  ) : (
                    <a href="#offer-full" className={buttonVariants({ className: "bg-emerald-500 text-white hover:bg-emerald-600" })}>
                      {offerPrimaryLabel}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <MbtiStickyRail
          locale={locale}
          headline={publicHeadline}
          tags={publicTags}
          locked={projectionLocked}
          accessLevel={accessLevel}
          variant={accessVariant}
          modulesAllowed={modulesAllowed}
          modulesPreview={modulesPreview}
          historyHref={historyHref}
          pdfHref={pdfHref}
          pdfReady={canDownloadPdf}
          orderLookupHref={orderLookupHref}
          orderDetailHref={orderDetailHref}
          relationshipHref={relationshipHubHref}
          retakeHref={retakeHref}
          primaryCtaLabel={terminalPrimaryCtaLabel}
          primaryCtaHref={resolvedTerminalPrimaryCtaHref}
          primaryCtaIsInternal={isUnlockedPostPurchase}
          shareCtaLabel={shareCtaLabel}
          shareStatusMessage={shareMessage}
          shareDisabled={isSharing}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}
