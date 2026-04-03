"use client";

import Link from "next/link";
import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import {
  getMbtiDesktopAnchorHash,
  getMbtiDesktopAnchorId,
} from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { MbtiOfferComparisonSection } from "@/components/result/mbti/MbtiOfferComparisonSection";
import { MbtiPostPurchaseSection } from "@/components/result/mbti/MbtiPostPurchaseSection";
import { MbtiRecommendedReadsSection } from "@/components/result/mbti/MbtiRecommendedReadsSection";
import { buttonVariants } from "@/components/ui/button";
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
  type ReportRecommendedRead,
  type ReportResponse,
} from "@/lib/api/v0_3";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneAssetSlot,
} from "@/lib/cms/personality-desktop-clone";
import { buildOrderWaitPath, regionFromLocale, resolveCheckoutAction } from "@/lib/commerce/checkoutAction";
import { clearPendingOrder, readPendingOrder, writePendingOrder } from "@/lib/commerce/pendingOrder";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { normalizeMbtiAccessHub } from "@/lib/mbti/accessHub";
import { buildMbtiFormDisplayLabel, normalizeMbtiFormSummary } from "@/lib/mbti/formSummary";
import type { MbtiPreviewViewModel } from "@/lib/mbti/preview";
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
  previewView?: MbtiPreviewViewModel | null;
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  onInternalNavigate?: (path: string) => void;
  onExternalNavigate?: (url: string) => void;
};

const CHAPTER_ORDER = ["traits", "career", "growth", "relationships"] as const;
const OFFER_FULL_HASH = "#offer-full";
const OFFER_SECTION_ID = "offer-full";
const DESKTOP_OFFER_FULL_HASH = getMbtiDesktopAnchorHash("offerFull");
const DESKTOP_OFFER_SECTION_ID = getMbtiDesktopAnchorId("offerFull");
const OFFER_SCROLL_ALIGNMENT: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "center",
  inline: "nearest",
};

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

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
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

function resolveOfferScrollTargetId(hash: string): string | null {
  const prefersDesktopTarget =
    typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(min-width: 1280px)").matches;

  if (hash === OFFER_FULL_HASH) {
    return prefersDesktopTarget ? DESKTOP_OFFER_SECTION_ID : OFFER_SECTION_ID;
  }

  if (hash === DESKTOP_OFFER_FULL_HASH) {
    return DESKTOP_OFFER_SECTION_ID;
  }

  return null;
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
  void locale;
  void retakeHref;
  void primaryCtaLabel;
  void onShare;
  void primaryCtaHref;
  void primaryCtaIsInternal;

  return (
    <div
      data-testid="mbti-result-shell"
      className="relative flex min-h-screen flex-col gap-16 pb-28 xl:pb-0"
    >
      <div className="mx-auto flex w-full max-w-[904px] flex-col gap-12 px-4 md:px-6">
        <section
          id="hero"
          className="scroll-mt-28 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:gap-8 md:p-8"
        >
          <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-10 w-56 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-80 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-full max-w-3xl animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-11/12 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-100/70 p-4 md:grid-cols-2">
            <div className="h-44 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
            <div className="h-44 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
          </div>
        </section>

        <section
          id="intro"
          className="scroll-mt-28 flex flex-col gap-6 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)] md:gap-8 md:p-8"
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
            className="scroll-mt-28 flex flex-col gap-6 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)] md:gap-8 md:p-8"
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
          className="scroll-mt-28 flex flex-col gap-6 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)] md:gap-8 md:p-8"
        >
          <p className="m-0 h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
          <div className="h-40 rounded-2xl border border-slate-100 bg-slate-100/70 p-4" />
        </section>

        <section
          id="footer-cta"
          data-testid="mbti-footer-loading"
          className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_22px_52px_rgba(15,23,42,0.22)] md:gap-8 md:p-8"
        >
          <p className="m-0 h-5 w-80 animate-pulse rounded bg-white/30" />
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex h-10 w-28 animate-pulse rounded bg-white/20" />
            <span className="inline-flex h-10 w-28 animate-pulse rounded bg-white/20" />
            <span className="inline-flex h-10 w-32 animate-pulse rounded bg-white/20" />
          </div>
        </section>
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
  previewView = null,
  sections,
  sectionUnlocks,
  offers,
  onInternalNavigate,
  onExternalNavigate,
}: MbtiResultShellProps) {
  void previewView;
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
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP[scaleCode]}/take`, locale);
  const reportMeta = asRecord(reportData.meta);
  const personalization = projectionViewModel?.personalization ?? null;
  const comparative = personalization?.comparative ?? null;
  const culturalCalibration = personalization?.culturalCalibration ?? null;
  const cta = (reportData.cta ?? null) as ReportCta | null;
  const primaryCtaLabel = resolvePrimaryCtaLabel(locale);
  const isUnlockedPostPurchase = accessProjection ? canEnterReportPage(accessProjection) : isUnlockedMbtiReport(reportData);
  const projectionLocked = accessProjection ? isProjectionLocked(accessProjection) : reportData.locked === true;
  const accessHub = normalizeMbtiAccessHub(reportData.mbti_access_hub_v1 ?? null, locale);
  const mbtiFormSummary = normalizeMbtiFormSummary(reportData.mbti_form_v1 ?? null);
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
  const publicTypeCode = normalizeText(projectionViewModel?.displayType, headline.typeCode);
  const publicTitle = normalizeText(projectionViewModel?.title, headline.displayName);
  const publicSubtitle = normalizeText(projectionViewModel?.subtitle, projectionViewModel?.tagline, headline.supportingLine);
  const publicSummary = normalizeText(projectionViewModel?.summary, projectionViewModel?.heroSummary, headline.summary);
  const publicRarity = normalizeText(projectionViewModel?.rarity, headline.rarity);
  const publicTags =
    projectionViewModel?.publicTags && projectionViewModel.publicTags.length > 0
      ? projectionViewModel.publicTags
      : projectionViewModel?.keywords && projectionViewModel.keywords.length > 0
        ? projectionViewModel.keywords
        : tags;
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
  const formAwareBadge = buildMbtiFormDisplayLabel(mbtiFormSummary, { includeScaleCode: true }) ?? publicHeadline.badge;
  const fullCodeForStorage = useMemo(
    () => normalizeText(publicHeadline.typeCode, projectionViewModel?.displayType).toUpperCase() || "MBTI",
    [publicHeadline.typeCode, projectionViewModel?.displayType],
  );
  const [desktopCloneSnapshot, setDesktopCloneSnapshot] = useState<{
    locale: Locale;
    fullCode: string;
    content: MbtiDesktopCloneContent | null;
    assetSlots: PersonalityDesktopCloneAssetSlot[] | null;
  } | null>(null);
  const activeDesktopCloneSnapshot =
    desktopCloneSnapshot && desktopCloneSnapshot.locale === locale && desktopCloneSnapshot.fullCode === fullCodeForStorage
      ? desktopCloneSnapshot
      : null;
  const terminalPrimaryCtaLabel = isUnlockedPostPurchase
    ? locale === "zh"
      ? "我的 MBTI 报告"
      : "My MBTI reports"
    : primaryCtaLabel;
  const terminalPrimaryCtaHref = isUnlockedPostPurchase ? historyHref : DESKTOP_OFFER_FULL_HASH;
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
  const desktopClonePrimaryCtaHref = isUnlockedPostPurchase ? resolvedTerminalPrimaryCtaHref : DESKTOP_OFFER_FULL_HASH;
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

  const scrollOfferIntoCenter = useCallback((targetId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    cancelScheduledOfferScroll();

    const scheduleSecondFrame = () => {
      offerScrollFrameRef.current = window.requestAnimationFrame(() => {
        offerScrollFrameRef.current = null;
        const offerSection = document.getElementById(targetId);

        if (!(offerSection instanceof HTMLElement)) {
          return;
        }

        offerSection.scrollIntoView(OFFER_SCROLL_ALIGNMENT);
      });
    };

    offerScrollFrameRef.current = window.requestAnimationFrame(scheduleSecondFrame);
  }, [cancelScheduledOfferScroll]);

  const syncOfferHashScroll = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const targetId = resolveOfferScrollTargetId(window.location.hash);
    if (!targetId) {
      return;
    }

    scrollOfferIntoCenter(targetId);
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

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href")?.trim() ?? "";
      const targetId = resolveOfferScrollTargetId(href);
      if (!targetId) {
        return;
      }

      if (anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();

      const nextUrl = `${window.location.pathname}${window.location.search}${href}`;
      if (window.location.hash === href) {
        window.history.replaceState(null, "", nextUrl);
      } else {
        window.history.pushState(null, "", nextUrl);
      }

      scrollOfferIntoCenter(targetId);
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
      form_code: mbtiFormSummary?.formCode,
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
  }, [attemptId, isRevisit, mbtiFormSummary?.formCode, personalizationTelemetryContext, projectionLocked]);

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
          form_code: mbtiFormSummary?.formCode,
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
          form_code: mbtiFormSummary?.formCode,
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
        form_code: mbtiFormSummary?.formCode,
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
        form_code: mbtiFormSummary?.formCode,
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
              className="text-sm text-neutral-400 underline underline-offset-2 hover:text-white"
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
  const offerPrimaryLabel = isUnlockedPostPurchase ? terminalPrimaryCtaLabel : locale === "zh" ? "解锁完整报告" : "Unlock full report";
  const footerPrimaryCtaHref = isUnlockedPostPurchase ? resolvedTerminalPrimaryCtaHref : DESKTOP_OFFER_FULL_HASH;

  useEffect(() => {
    let active = true;

    if (locale !== "zh") {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const payload = await fetchPersonalityDesktopCloneContent(fullCodeForStorage, locale);
      if (active) {
        setDesktopCloneSnapshot({
          locale,
          fullCode: fullCodeForStorage,
          content: payload?.content ?? null,
          assetSlots: payload?.assetSlots ?? null,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [fullCodeForStorage, locale]);

  const supplementaryNodes = auxiliaryCtaEntries.map((entry) =>
    entry.key === "career_bridge" ? (
      <div
        key={`mbti-cta-surface-${entry.key}-${entry.rank}`}
        className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700"
      >
        {entry.node}
      </div>
    ) : (
      <div key={`mbti-cta-surface-${entry.key}-${entry.rank}`}>{entry.node}</div>
    )
  );
  const recommendedReadsNode = (
    <MbtiRecommendedReadsSection
      locale={locale}
      reads={recommendedReads}
      personalization={personalization}
    />
  );
  const footerNode = (
    <section
      id="footer-cta"
      data-testid="mbti-footer-cta"
      className="flex flex-col gap-4 rounded-2xl border border-slate-950 bg-slate-950 p-6 shadow-[0_22px_52px_rgba(15,23,42,0.22)] text-white md:p-8"
    >
      <div className="space-y-2">
        <p className="m-0 text-sm leading-7 text-slate-300">
          {isUnlockedPostPurchase
            ? locale === "zh"
              ? "结果正文保留在当前页，后续回访、PDF 与订单入口统一收在工作台与历史结果。"
              : "The reading stays on this page while revisit, PDF, and order entry points consolidate into the workspace and history."
            : locale === "zh"
              ? "这里收口分享、重测与历史入口；唯一主解锁动作仍然回到结果页内的完整报告收口。"
              : "This footer keeps share, retake, and history entry points while the single primary unlock action still resolves to the in-page full-report closure."}
        </p>
        {shareMessage ? <p className="m-0 text-sm text-emerald-200">{shareMessage}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="text-sm text-neutral-400 underline underline-offset-2 hover:text-white"
          disabled={isSharing}
          onClick={() => void handleShare()}
        >
          {shareCtaLabel}
        </button>
        <Link href={retakeHref} className="text-sm text-neutral-400 underline underline-offset-2 hover:text-white">
          {locale === "zh" ? "重新测试" : "Retake test"}
        </Link>
        <Link href={historyHref} className="text-sm text-neutral-400 underline underline-offset-2 hover:text-white">
          {locale === "zh" ? "查看历史" : "View history"}
        </Link>
        {isUnlockedPostPurchase ? (
          <Link
            href={footerPrimaryCtaHref}
            className={buttonVariants({ className: "text-sm text-neutral-950 hover:text-white" })}
          >
            {terminalPrimaryCtaLabel}
          </Link>
        ) : (
          <a
            href={footerPrimaryCtaHref}
            className={buttonVariants({
              className: "text-sm text-neutral-400 underline underline-offset-2 hover:text-white",
              variant: "outline",
            })}
          >
            {offerPrimaryLabel}
          </a>
        )}
      </div>
    </section>
  );

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
      className="relative flex min-h-screen flex-col gap-16 pb-28 md:gap-8 xl:pb-0"
      onClickCapture={handleOfferAnchorClickCapture}
    >
      <MbtiDesktopCloneShell
        locale={locale}
        headline={{ ...publicHeadline, badge: formAwareBadge }}
        tags={publicTags}
        dimensions={dimensions}
        highlights={highlights}
        sections={sections}
        sectionUnlocks={sectionUnlocks}
        offers={offers}
        projectionViewModel={projectionViewModel}
        isUnlocked={isUnlockedPostPurchase}
        shareCtaLabel={shareCtaLabel}
        shareDisabled={isSharing}
        onShare={handleShare}
        retakeHref={retakeHref}
        historyHref={historyHref}
        workspaceHref={desktopClonePrimaryCtaHref}
        orderLookupHref={orderLookupHref}
        orderDetailHref={orderDetailHref}
        relationshipHref={relationshipHubHref}
        pdfHref={pdfHref}
        pdfReady={canDownloadPdf}
        primaryCtaLabel={terminalPrimaryCtaLabel}
        primaryCtaHref={desktopClonePrimaryCtaHref}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
        checkoutError={checkoutError}
        unlockedOfferNode={offerCtaEntry?.node}
        supplementaryNodes={supplementaryNodes}
        recommendedReadsNode={recommendedReadsNode}
        footerNode={footerNode}
        storageContentOverride={activeDesktopCloneSnapshot?.content}
        storageAssetSlotsOverride={activeDesktopCloneSnapshot?.assetSlots}
        storageManagedExternally
      />
    </div>
  );
}
