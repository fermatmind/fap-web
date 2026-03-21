"use client";

import Link from "next/link";
import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DimensionBars } from "@/components/result/DimensionBars";
import { MbtiChapterSection } from "@/components/result/mbti/MbtiChapterSection";
import {
  buildDominantTraitItems,
  MbtiDominantTraitsSection,
} from "@/components/result/mbti/MbtiDominantTraitsSection";
import { MbtiMobileChrome } from "@/components/result/mbti/MbtiMobileChrome";
import { MbtiSceneFingerprintSummary } from "@/components/result/mbti/MbtiSceneFingerprintSummary";
import { MbtiOfferComparisonSection } from "@/components/result/mbti/MbtiOfferComparisonSection";
import { MbtiPostPurchaseSection } from "@/components/result/mbti/MbtiPostPurchaseSection";
import { MbtiRecommendedReadsSection } from "@/components/result/mbti/MbtiRecommendedReadsSection";
import { MbtiStickyRail } from "@/components/result/mbti/MbtiStickyRail";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  buildMbtiActionJourneyTelemetryFields,
  resolveMbtiJourneyStateLabel,
  resolveMbtiProgressStateLabel,
  resolveMbtiPulsePromptLabel,
  resolveMbtiRevisitReorderReasonLabel,
} from "@/lib/mbti/actionJourney";
import {
  appendMbtiContinuityQuery,
  resolveMbtiCarryoverFocusLabel,
  resolveMbtiCarryoverReasonLabel,
} from "@/lib/mbti/continuity";
import {
  resolveMbtiMemoryRewriteReasonLabel,
} from "@/lib/mbti/longitudinalMemory";
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
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCompletedActionKeys,
  summarizeMbtiCareerActionPriorityKeys,
  summarizeMbtiCareerJourneyKeys,
  summarizeMbtiCareerReadingKeys,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiCtaPriorityKeys,
  summarizeMbtiCurrentIntentCluster,
  summarizeMbtiFeedbackCoverage,
  summarizeMbtiFeedbackSentiment,
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
  headline: RichResultHeadline;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  projectionViewModel?: MbtiResultProjectionViewModel | null;
  highlights: HighlightCard[];
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  onInternalNavigate?: (path: string) => void;
  onExternalNavigate?: (url: string) => void;
};

const CHAPTER_ORDER = ["career", "growth", "traits", "relationships"] as const;
const OFFER_FULL_HASH = "#offer-full";
const OFFER_SECTION_ID = "offers";
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

function resolvePrimaryCtaLabel(locale: Locale, _cta?: ReportCta | null) {
  return locale === "zh" ? "解锁完整报告" : "Unlock full report";
}

function resolveCtaRank(ctaPriorityKeys: string[], ctaKey: string): number {
  const index = ctaPriorityKeys.findIndex((value) => value === ctaKey);
  return index >= 0 ? index + 1 : 0;
}

function resolveCtaRankLabel(locale: Locale, rank: number): string {
  return locale === "zh" ? `优先入口 ${rank}` : `Priority ${rank}`;
}

function resolveCareerJourneyLabel(locale: Locale, key: string): string {
  switch (key) {
    case "career.next_step":
      return locale === "zh" ? "职业下一步" : "Career next step";
    case "career.work_experiments":
      return locale === "zh" ? "工作实验" : "Work experiments";
    case "career.work_environment":
      return locale === "zh" ? "工作环境" : "Work environment";
    case "career.collaboration_fit":
      return locale === "zh" ? "协作匹配" : "Collaboration fit";
    case "career_bridge":
      return locale === "zh" ? "职业推荐入口" : "Career bridge";
    case "workspace_lite":
      return locale === "zh" ? "我的报告入口" : "Workspace entry";
    default:
      return key;
  }
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

export function MbtiResultShell({
  locale,
  scaleCode,
  reportData,
  headline,
  tags,
  dimensions,
  projectionViewModel,
  highlights,
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
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP[scaleCode]}/take`, locale);
  const payload = asRecord(reportData.report);
  const reportMeta = asRecord(reportData.meta);
  const identityCard = asRecord(payload?.identity_card);
  const profile = asRecord(payload?.profile);
  const layers = asRecord(payload?.layers);
  const identityLayer = (asRecord(layers?.identity) ?? null) as ReportIdentityLayer | null;
  const personalization = projectionViewModel?.personalization ?? null;
  const comparative = personalization?.comparative ?? null;
  const controlledNarrative = personalization?.controlledNarrative ?? null;
  const culturalCalibration = personalization?.culturalCalibration ?? null;
  const recommendedReads = Array.isArray(payload?.recommended_reads)
    ? (payload?.recommended_reads as ReportRecommendedRead[])
    : [];
  const cta = (reportData.cta ?? null) as ReportCta | null;
  const primaryCtaLabel = resolvePrimaryCtaLabel(locale, cta);
  const isUnlockedPostPurchase = isUnlockedMbtiReport(reportData);
  const accessHub = normalizeMbtiAccessHub(reportData.mbti_access_hub_v1 ?? null, locale);
  const historyHref = accessHub?.links.historyHref ?? localizedPath("/history/mbti", locale);
  const orderLookupHref = accessHub?.links.lookupHref ?? localizedPath("/orders/lookup", locale);
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
  const terminalPrimaryCtaHref = isUnlockedPostPurchase ? accessHub?.workspaceLite.href ?? historyHref : "#offer-full";
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
  const actionPlanSummary = normalizeText(personalization?.actionPlanSummary);
  const actionJourney = personalization?.actionJourney ?? null;
  const pulseCheck = personalization?.pulseCheck ?? null;
  const longitudinalMemory = personalization?.longitudinalMemory ?? null;
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
  const careerJourneyKeys = workingLife?.careerJourneyKeys ?? [];
  const careerActionPriorityKeys = workingLife?.careerActionPriorityKeys ?? [];
  const careerReadingKeys = workingLife?.careerReadingKeys ?? [];
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
    ? appendMbtiContinuityQuery(historyHref, personalization?.continuity)
    : "";
  const journeyHistoryHref = continuityHistoryHref
    ? appendMbtiActionJourneyQuery(continuityHistoryHref, actionJourney, pulseCheck)
    : historyHref
      ? appendMbtiActionJourneyQuery(historyHref, actionJourney, pulseCheck)
      : "";
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(carryoverFocusKey, locale);
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(carryoverReason, locale);
  const journeyStateLabel = resolveMbtiJourneyStateLabel(journeyStateSummary, locale);
  const progressStateLabel = resolveMbtiProgressStateLabel(progressStateSummary, locale);
  const revisitReorderLabel = resolveMbtiRevisitReorderReasonLabel(revisitReorderReasonSummary, locale);
  const pulsePromptLabels = (pulseCheck?.pulsePromptKeys ?? []).map((key) =>
    resolveMbtiPulsePromptLabel(key, locale)
  );
  const memoryRewriteLabel = resolveMbtiMemoryRewriteReasonLabel(memoryRewriteReasonSummary, locale);
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
  const actionPlanFocused = [
    "growth.next_actions",
    "growth.weekly_experiments",
    "growth.watchouts",
  ].includes(primaryFocusKey);
  const unlockCtaRank = resolveCtaRank(ctaPriorityKeys, "unlock_full_report");
  const careerBridgeCtaRank = resolveCtaRank(ctaPriorityKeys, "career_bridge");
  const workspaceLiteCtaRank = resolveCtaRank(ctaPriorityKeys, "workspace_lite");
  const shareCtaRank = resolveCtaRank(ctaPriorityKeys, "share_result");
  const workingLifeFocused = careerFocusKey !== "";
  const workingLifeJourney = careerJourneyKeys.length > 0
    ? careerJourneyKeys
    : ["career.next_step", "career.work_experiments", "career.work_environment", "career.collaboration_fit"];
  const workingLifeActionPriority = careerActionPriorityKeys.length > 0
    ? careerActionPriorityKeys
    : ["career.next_step", "career.work_experiments", "career_bridge"];
  const workingLifeReadingFocus = normalizeText(careerReadingKeys[0], readingFocusKey);
  const calibrationNarrativeIntro = normalizeText(culturalCalibration?.narrativeIntro);
  const calibrationNarrativeSummary = normalizeText(culturalCalibration?.narrativeSummary);
  const calibrationWorkingLifeSummary = normalizeText(culturalCalibration?.workingLifeSummary);
  const calibrationSectionKeysSummary =
    culturalCalibration?.calibratedSectionKeys.join("|") ?? "";
  const comparativePercentileValue =
    typeof comparative?.percentileValue === "number" ? comparative.percentileValue : null;
  const comparativePercentileLabel = normalizeText(comparative?.percentileMetricLabel);
  const comparativePositionLabel = normalizeText(comparative?.cohortRelativePosition?.label);
  const comparativePositionSummary = normalizeText(comparative?.cohortRelativePosition?.summary);
  const comparativeSameTypeLabel = normalizeText(comparative?.sameTypeContrast?.label);
  const comparativeSameTypeSummary = normalizeText(comparative?.sameTypeContrast?.summary);
  const personalizationTelemetryContext = {
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
  };

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
    if (reportData.locked === true || !attemptId) {
      return;
    }

    const pendingOrder = readPendingOrder();
    if (pendingOrder?.attemptId === attemptId) {
      clearPendingOrder();
    }
  }, [attemptId, reportData.locked]);

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
      locked: reportData.locked === true,
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
  }, [
    attemptId,
    actionFocusKey,
    actionPriorityKeysSummary,
    axisBandsSummary,
    boundaryFlagsSummary,
    ctaPriorityKeysSummary,
    isRevisit,
    locale,
    overviewVariantKey,
    orderedSectionKeysSummary,
    orderedActionKeysSummary,
    orderedRecommendationKeysSummary,
    personalizationEngineVersion,
    personalizationIdentity,
    personalizationPackId,
    personalizationTypeCode,
    primaryFocusKey,
    readingFocusKey,
    recommendationPriorityKeysSummary,
    reportData.locked,
    sceneFingerprintSummary,
    secondaryFocusKeysSummary,
    userStateSummary,
    variantKeysSummary,
    feedbackSentimentSummary,
    feedbackCoverageSummary,
    actionCompletionTendencySummary,
    lastDeepReadSectionSummary,
    currentIntentClusterSummary,
    carryoverActionKeysSummary,
    carryoverFocusKey,
    carryoverReason,
    carryoverSceneKeysSummary,
    recommendedResumeKeysSummary,
  ]);

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
  }, [
    attemptId,
    axisBandsSummary,
    boundaryFlagsSummary,
    carryoverActionKeysSummary,
    carryoverEntryHref,
    carryoverFocusKey,
    carryoverReason,
    carryoverSceneKeysSummary,
    carryoverTarget,
    ctaPriorityKeysSummary,
    locale,
    orderedActionKeysSummary,
    orderedRecommendationKeysSummary,
    orderedSectionKeysSummary,
    personalizationEngineVersion,
    personalizationIdentity,
    personalizationPackId,
    personalizationTypeCode,
    primaryFocusKey,
    readingFocusKey,
    actionFocusKey,
    actionPriorityKeysSummary,
    recommendedResumeKeysSummary,
    recommendationPriorityKeysSummary,
    sceneFingerprintSummary,
    secondaryFocusKeysSummary,
    userStateSummary,
    variantKeysSummary,
    feedbackSentimentSummary,
    feedbackCoverageSummary,
    actionCompletionTendencySummary,
    lastDeepReadSectionSummary,
    currentIntentClusterSummary,
  ]);

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

  const orderedCtaSurfaceNodes = [...ctaSurfaceEntries]
    .sort((left, right) => {
      if (left.rank === right.rank) {
        return left.key.localeCompare(right.key);
      }

      return left.rank - right.rank;
    })
    .map((entry) => entry.node);

  return (
    <div
      data-testid="mbti-result-shell"
      data-profile-seed-key={profileSeedKeySummary || undefined}
      data-selection-fingerprint={selectionFingerprintSummary || undefined}
      data-same-type-divergence-keys={sameTypeDivergenceKeysSummary || undefined}
      data-memory-fingerprint={memoryFingerprintSummary || undefined}
      data-memory-state={memoryStateSummary || undefined}
      data-memory-rewrite-reason={memoryRewriteReasonSummary || undefined}
      className="relative space-y-6 pb-28 md:space-y-8 xl:pb-0"
      onClickCapture={handleOfferAnchorClickCapture}
    >
      <MbtiMobileChrome
        locale={locale}
        retakeHref={retakeHref}
        primaryCtaLabel={terminalPrimaryCtaLabel}
        primaryCtaHref={resolvedTerminalPrimaryCtaHref}
        primaryCtaIsInternal={isUnlockedPostPurchase}
        onShare={handleShare}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="space-y-6 md:space-y-8">
          <section
            id="hero"
            data-testid="mbti-hero"
            className="scroll-mt-28 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
          >
            <div className="space-y-6 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {headline.badge}
                </span>
                {(reportData.locked === true || normalizeText(reportData.variant).toLowerCase() === "free") ? (
                  <span className="inline-flex rounded-full border border-white/85 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {locale === "zh" ? "免费预览" : "Free preview"}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h1 className="m-0 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                        {publicHeadline.typeCode}
                        {publicHeadline.displayName ? <span className="text-slate-600"> · {publicHeadline.displayName}</span> : null}
                      </h1>
                      {publicTypeName || publicNickname ? (
                        <p data-testid="mbti-hero-identity-line" className="m-0 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                          {[publicTypeName, publicNickname].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      {publicHeadline.supportingLine ? <p className="m-0 text-lg font-medium text-slate-700">{publicHeadline.supportingLine}</p> : null}
                      {publicHeadline.summary ? <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{publicHeadline.summary}</p> : null}
                      {controlledNarrative?.enabled ? (
                        <div
                          data-testid="mbti-controlled-narrative"
                          data-runtime-mode={controlledNarrative.runtimeMode}
                          data-narrative-fingerprint={controlledNarrative.narrativeFingerprint}
                          className="rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                        >
                          {controlledNarrative.narrativeIntro ? (
                            <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">
                              {controlledNarrative.narrativeIntro}
                            </p>
                          ) : null}
                          {controlledNarrative.narrativeSummary ? (
                            <p className="m-0 mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {controlledNarrative.narrativeSummary}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {comparative?.enabled && comparativePercentileValue !== null ? (
                        <div
                          data-testid="mbti-comparative"
                          data-comparative-fingerprint={comparative.comparativeFingerprint || undefined}
                          data-norming-version={comparative.normingVersion || undefined}
                          data-norming-scope={comparative.normingScope || undefined}
                          data-norming-source={comparative.normingSource || undefined}
                          className="rounded-2xl border border-violet-100 bg-violet-50/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                        >
                          <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-violet-700">
                            {locale === "zh" ? "相对参照" : "Comparative reference"}
                          </p>
                          <p className="m-0 mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {locale === "zh"
                              ? `${comparativePercentileLabel || "主轴"} 位于第 ${comparativePercentileValue} 百分位。${comparativePositionLabel || comparativePositionSummary}`
                              : `${comparativePercentileLabel || "Lead signal"} lands at the ${comparativePercentileValue}th percentile. ${comparativePositionLabel || comparativePositionSummary}`}
                          </p>
                          {comparativeSameTypeLabel || comparativeSameTypeSummary ? (
                            <p className="m-0 mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-600">
                              {[comparativeSameTypeLabel, comparativeSameTypeSummary].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {culturalCalibration?.enabled && (calibrationNarrativeIntro || calibrationNarrativeSummary) ? (
                        <div
                          data-testid="mbti-cultural-calibration"
                          data-locale-context={culturalCalibration.localeContext || undefined}
                          data-cultural-context={culturalCalibration.culturalContext || undefined}
                          data-calibration-fingerprint={culturalCalibration.calibrationFingerprint || undefined}
                          className="rounded-2xl border border-amber-100 bg-amber-50/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                        >
                          {calibrationNarrativeIntro ? (
                            <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
                              {calibrationNarrativeIntro}
                            </p>
                          ) : null}
                          {calibrationNarrativeSummary ? (
                            <p className="m-0 mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {calibrationNarrativeSummary}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {longitudinalMemory ? (
                        <div
                          data-testid="mbti-longitudinal-memory"
                          data-memory-fingerprint={memoryFingerprintSummary || undefined}
                          data-memory-state={memoryStateSummary || undefined}
                          data-memory-rewrite-reason={memoryRewriteReasonSummary || undefined}
                          className="rounded-2xl border border-emerald-100 bg-emerald-50/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                        >
                          <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            {locale === "zh" ? "长期记忆已生效" : "Longitudinal memory active"}
                          </p>
                          <p className="m-0 mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {memoryRewriteLabel}
                          </p>
                          {(resumeBiasKeysSummary || dominantInterestKeysSummary) ? (
                            <p className="m-0 mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-600">
                              {locale === "zh"
                                ? `延续重点：${resumeBiasKeysSummary || "未显式给出"} · 持续关注：${dominantInterestKeysSummary || "未显式给出"}`
                                : `Resume bias: ${resumeBiasKeysSummary || "not explicit"} · Dominant interests: ${dominantInterestKeysSummary || "not explicit"}`}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {publicTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {publicTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-full border border-white/80 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                          >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                    {locale === "zh" ? "阅读入口" : "Reading entry"}
                  </p>
                  <p className="m-0 mt-3 text-3xl font-bold tracking-tight text-slate-950">{publicHeadline.typeCode}</p>
                  {publicHeadline.rarity ? (
                    <p className="m-0 mt-3 text-sm leading-7 text-slate-600">
                      {locale === "zh" ? "稀有度：" : "Rarity: "}
                      {publicHeadline.rarity}
                    </p>
                  ) : null}
                  <a href="#offer-full" className={buttonVariants({ className: "mt-4 w-full" })}>
                    {locale === "zh" ? "解锁完整报告" : "Unlock full report"}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section
            id="dimensions"
            data-testid="mbti-dimensions"
            className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {locale === "zh" ? "维度概览" : "Dimension overview"}
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
                {locale === "zh" ? "先看结果的整体受力方向" : "Start with the overall directional balance"}
              </h2>
            </div>
            <DimensionBars dimensions={publicDimensions} />
          </section>

          <MbtiSceneFingerprintSummary locale={locale} personalization={personalization} />

          <MbtiDominantTraitsSection
            locale={locale}
            roleCard={asRecord(layers?.role_card) ?? undefined}
            strategyCard={asRecord(layers?.strategy_card) ?? undefined}
            identityLayer={identityLayer}
            identityTags={normalizeStringArray(identityCard?.tags)}
            profileKeywords={normalizeStringArray(profile?.keywords)}
            fallbackTags={tags}
          />

          <section
            id="highlights"
            data-testid="mbti-highlights"
            className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {locale === "zh" ? "高频亮点" : "High-frequency highlights"}
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
                {locale === "zh" ? "当前免费结果已经公开的正式亮点" : "The formal highlights already open in the free result"}
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {highlights.map((card, index) => (
                <Card
                  key={`${card.title}-${index}`}
                  className="border-slate-200 bg-white/95 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-700">
                    <p className="m-0 whitespace-pre-wrap leading-7">{card.body}</p>
                    {card.tips.length > 0 ? (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3">
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          {locale === "zh" ? "行动提示" : "Action tip"}
                        </p>
                        <ul className="mb-0 mt-2 list-disc space-y-1 pl-4">
                          {card.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {actionPlanSummary ? (
            <section
              id="action-plan"
              data-testid="mbti-action-plan-summary"
              data-primary-focus={actionPlanFocused ? "true" : undefined}
              className={`scroll-mt-28 rounded-[28px] border bg-gradient-to-br from-amber-50 via-white to-emerald-50/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6 ${
                actionPlanFocused ? "border-emerald-300 ring-1 ring-emerald-100" : "border-amber-200"
              }`}
            >
              <div className="space-y-3">
                {actionPlanFocused ? (
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {locale === "zh" ? "当前重点" : "Current focus"}
                  </p>
                ) : null}
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                  {locale === "zh" ? "行动总览" : "Action plan"}
                </p>
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                    {locale === "zh"
                      ? "把接下来最值得做的事缩成可重复的小动作"
                      : "Turn the next useful move into repeatable small actions"}
                  </h2>
                  <p className="m-0 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {actionPlanSummary}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {actionJourney && isRevisit ? (
            <section
              id="action-journey"
              data-testid="mbti-action-journey"
              data-journey-scope={journeyScopeSummary || undefined}
              data-journey-state={journeyStateSummary || undefined}
              data-progress-state={progressStateSummary || undefined}
              data-journey-fingerprint={journeyFingerprintSummary || undefined}
              className="scroll-mt-28 rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {locale === "zh" ? "行动旅程" : "Action journey"}
                  </p>
                  <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                    {journeyStateLabel}
                  </h2>
                  <p className="m-0 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {revisitReorderLabel}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-4">
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {locale === "zh" ? "当前进展" : "Progress band"}
                    </p>
                    <p className="m-0 text-sm font-medium text-slate-900">{progressStateLabel}</p>
                    {actionFocusKey ? (
                      <p className="m-0 text-xs leading-6 text-slate-600">
                        {locale === "zh"
                          ? `当前动作焦点：${actionFocusKey}`
                          : `Current action focus: ${actionFocusKey}`}
                      </p>
                    ) : null}
                    {completedActionKeysSummary ? (
                      <p className="m-0 text-xs leading-6 text-slate-600">
                        {locale === "zh"
                          ? `已形成推进信号：${completedActionKeysSummary}`
                          : `Completed action signals: ${completedActionKeysSummary}`}
                      </p>
                    ) : null}
                  </div>
                  <div
                    data-testid="mbti-pulse-check"
                    data-pulse-state={pulseStateSummary || undefined}
                    className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-4"
                  >
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {locale === "zh" ? "本次 pulse" : "Current pulse"}
                    </p>
                    <p className="m-0 text-sm font-medium text-slate-900">
                      {pulseCheck?.pulseState
                        ? resolveMbtiPulsePromptLabel(
                            pulseCheck.pulsePromptKeys[0] ?? pulseCheck.pulseState,
                            locale
                          )
                        : locale === "zh"
                          ? "继续当前最值得延续的动作"
                          : "Continue the most useful next action"}
                    </p>
                    {pulsePromptLabels.length > 0 ? (
                      <ul className="mb-0 list-disc space-y-1 pl-4 text-xs leading-6 text-slate-600">
                        {pulsePromptLabels.map((label) => (
                          <li key={label}>{label}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
                {journeyHistoryHref ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      data-testid="mbti-action-journey-cta"
                      href={journeyHistoryHref}
                      className={buttonVariants({ className: "bg-slate-950 text-white hover:bg-slate-800" })}
                      onClick={() => {
                        trackEvent("ui_card_interaction", {
                          slug: "mbti-result-shell",
                          scale_code: "MBTI",
                          visual_kind: "mbti_action_journey",
                          interaction: "click_cta",
                          attempt_id: attemptId,
                          continueTarget: "history_continue",
                          ...personalizationTelemetryContext,
                          ...buildMbtiActionJourneyTelemetryFields(actionJourney, pulseCheck),
                        });
                      }}
                    >
                      {locale === "zh" ? "带着当前动作继续回访" : "Continue with the current action loop"}
                    </Link>
                    {recommendedNextPulseKeysSummary ? (
                      <p className="m-0 self-center text-xs leading-6 text-slate-600">
                        {locale === "zh"
                          ? `下一步建议：${recommendedNextPulseKeysSummary}`
                          : `Recommended next pulse: ${recommendedNextPulseKeysSummary}`}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {workingLifeFocused ? (
            <section
              id="working-life-focus"
              data-testid="mbti-working-life-focus"
              data-career-focus-key={careerFocusKey || undefined}
              data-career-journey-keys={careerJourneyKeysSummary || undefined}
              data-career-action-priority-keys={careerActionPriorityKeysSummary || undefined}
              data-career-reading-keys={careerReadingKeysSummary || undefined}
              className="scroll-mt-28 rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6"
            >
              <div className="space-y-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                  {locale === "zh" ? "Working-Life OS" : "Working-Life OS"}
                </p>
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                    {locale === "zh"
                      ? `当前职业焦点：${resolveCareerJourneyLabel(locale, careerFocusKey)}`
                      : `Current working-life focus: ${resolveCareerJourneyLabel(locale, careerFocusKey)}`}
                  </h2>
                  <p className="m-0 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {calibrationWorkingLifeSummary
                      ? calibrationWorkingLifeSummary
                      : careerNextStepLead
                      ? careerNextStepLead
                      : careerSummaryLead
                        ? careerSummaryLead
                        : locale === "zh"
                          ? "把职业下一步、工作实验和环境匹配放在同一条连续主链里，会比分散阅读更容易形成真实推进。"
                          : "Treating the next career step, work experiments, and environment fit as one continuous chain is more useful than reading them as isolated sections."}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-4">
                      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {locale === "zh" ? "主链顺序" : "Journey order"}
                      </p>
                    <div className="flex flex-wrap gap-2">
                      {workingLifeJourney.map((journeyKey, index) => (
                        <span
                          key={journeyKey}
                          data-career-journey-key={journeyKey}
                          data-career-action-rank={String(index + 1)}
                          className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {index + 1}. {resolveCareerJourneyLabel(locale, journeyKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-4">
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {locale === "zh" ? "优先动作" : "Priority actions"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workingLifeActionPriority.map((actionKey, index) => (
                        <span
                          key={actionKey}
                          data-career-journey-key={actionKey}
                          data-career-action-rank={String(index + 1)}
                          className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {index + 1}. {resolveCareerJourneyLabel(locale, actionKey)}
                        </span>
                      ))}
                    </div>
                    {workingLifeReadingFocus ? (
                      <p className="m-0 text-xs leading-6 text-slate-600">
                        {locale === "zh"
                          ? `当前优先阅读：${workingLifeReadingFocus}`
                          : `Current reading focus: ${workingLifeReadingFocus}`}
                      </p>
                    ) : null}
                    {culturalCalibration?.enabled ? (
                      <p
                        className="m-0 text-xs leading-6 text-slate-500"
                        data-calibration-fingerprint={culturalCalibration.calibrationFingerprint || undefined}
                      >
                        {locale === "zh"
                          ? `当前语境校准：${culturalCalibration.culturalContext || culturalCalibration.localeContext}`
                          : `Current calibration context: ${culturalCalibration.culturalContext || culturalCalibration.localeContext}`}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {carryoverEntryHref ? (
            <section
              id="carryover"
              data-testid="mbti-carryover-entry"
              data-carryover-focus-key={carryoverFocusKey || undefined}
              data-carryover-reason={carryoverReason || undefined}
              className="scroll-mt-28 rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6"
            >
              <div className="space-y-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                  {locale === "zh" ? "继续阅读" : "Continue reading"}
                </p>
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                    {locale === "zh"
                      ? `继续看 ${continuityFocusLabel || (carryoverTarget === "career_bridge" ? "职业下一步" : "当前重点")}`
                      : `Continue with ${continuityFocusLabel || (carryoverTarget === "career_bridge" ? "career next step" : "the current focus")}`}
                  </h2>
                  <p className="m-0 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {continuityReasonLabel}
                  </p>
                </div>
                <Link
                  data-testid="mbti-carryover-entry-cta"
                  href={carryoverEntryHref}
                  className={buttonVariants({ className: "bg-slate-950 text-white hover:bg-slate-800" })}
                  onClick={() => {
                    trackEvent("ui_card_interaction", {
                      slug: "mbti-result-shell",
                      scale_code: "MBTI",
                      visual_kind: "mbti_carryover_entry",
                      interaction: "click_cta",
                      attempt_id: attemptId,
                      continueTarget: carryoverTarget,
                      ...personalizationTelemetryContext,
                    });
                  }}
                >
                  {locale === "zh"
                    ? carryoverTarget === "workspace_lite"
                      ? "回到你当前最相关的入口"
                      : "继续看这里"
                    : carryoverTarget === "workspace_lite"
                      ? "Return to your current entry"
                      : "Continue here"}
                </Link>
              </div>
            </section>
          ) : null}

          {CHAPTER_ORDER.map((chapterKey) => {
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
          })}

          {orderedCtaSurfaceNodes.map((node, index) => (
            <div key={`mbti-cta-surface-${index}`}>{node}</div>
          ))}

          <MbtiRecommendedReadsSection locale={locale} reads={recommendedReads} personalization={personalization} />

          <Card
            id="footer-cta"
            data-testid="mbti-footer-cta"
            className="border-slate-950 bg-slate-950 text-white shadow-[0_22px_52px_rgba(15,23,42,0.22)]"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-white">{locale === "zh" ? "继续阅读或继续行动" : "Keep reading or take the next step"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="m-0 text-sm leading-7 text-slate-300">
                {isUnlockedPostPurchase
                  ? locale === "zh"
                    ? "页尾仍保留分享与重测，而正式再次进入入口会直接带你回到 MBTI 历史页。"
                    : "The footer keeps share and retake, while the formal re-entry action now sends you to your MBTI history."
                  : locale === "zh"
                    ? "页尾只保留三件事：分享结果、重新测试、或者回看当前结果页对应的解锁方案。"
                    : "The footer keeps only three actions: share, retake, or jump back to the unlock options tied to this result page."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={() => void handleShare()}>
                  {locale === "zh" ? "分享结果" : "Share result"}
                </Button>
                <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
                  {locale === "zh" ? "重新测试" : "Retake test"}
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
                    {terminalPrimaryCtaLabel}
                  </a>
                )}
              </div>
              {shareMessage ? <p className="m-0 text-sm text-emerald-200">{shareMessage}</p> : null}
            </CardContent>
          </Card>
        </div>

        <MbtiStickyRail
          locale={locale}
          headline={publicHeadline}
          tags={publicTags}
          locked={reportData.locked}
          accessLevel={reportData.access_level}
          variant={reportData.variant}
          modulesAllowed={Array.isArray(reportData.modules_allowed) ? reportData.modules_allowed : []}
          retakeHref={retakeHref}
          primaryCtaLabel={terminalPrimaryCtaLabel}
          primaryCtaHref={resolvedTerminalPrimaryCtaHref}
          primaryCtaIsInternal={isUnlockedPostPurchase}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}
