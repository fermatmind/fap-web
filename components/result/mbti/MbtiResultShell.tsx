"use client";

import Link from "next/link";
import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useRef, useState } from "react";
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
import { captureError } from "@/lib/observability/sentry";
import {
  buildMbtiCareerRecommendationHref,
  type MbtiPublicProjectionDimensionViewModel,
  type MbtiResultProjectionSectionViewModel,
  type MbtiResultProjectionViewModel,
} from "@/lib/mbti/publicProjection";
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
    "career.advantages",
    "career.weaknesses",
    "career.preferred_roles",
    "career.upgrade_suggestions",
  ],
  growth: [
    "growth.summary",
    "growth.strengths",
    "growth.weaknesses",
    "growth.motivators",
    "growth.drainers",
  ],
  traits: ["letters_intro", "overview", "trait_overview"],
  relationships: [
    "relationships.summary",
    "relationships.strengths",
    "relationships.weaknesses",
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

function summarizeSceneFingerprint(
  personalization: MbtiResultProjectionViewModel["personalization"] | null | undefined
): string {
  return Object.entries(personalization?.sceneFingerprint ?? {})
    .map(([sceneKey, entry]) => `${sceneKey}:${normalizeText(entry.styleKey)}`)
    .filter(Boolean)
    .join("|");
}

function summarizeBoundaryFlags(
  personalization: MbtiResultProjectionViewModel["personalization"] | null | undefined
): string {
  return Object.entries(personalization?.boundaryFlags ?? {})
    .filter(([, enabled]) => enabled === true)
    .map(([axisCode]) => axisCode)
    .join("|");
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
  const careerRecommendationHref = buildMbtiCareerRecommendationHref(
    locale,
    projectionViewModel?.displayType
  );
  const careerSummaryLead = normalizeText(careerSummarySection?.bodyMd);
  const careerNextStepBody = careerSummaryLead
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
  const variantKeysSummary = Object.entries(personalization?.variantKeys ?? {})
    .map(([sectionKey, variantKey]) => `${sectionKey}:${normalizeText(variantKey)}`)
    .filter(Boolean)
    .join("|");
  const sceneFingerprintSummary = summarizeSceneFingerprint(personalization);
  const boundaryFlagsSummary = summarizeBoundaryFlags(personalization);
  const overviewVariantKey = normalizeText(personalization?.variantKeys.overview);
  const personalizationTypeCode = normalizeText(personalization?.typeCode, publicTypeCode);
  const personalizationIdentity = normalizeText(personalization?.identity, projectionViewModel?.variantCode);
  const personalizationPackId = normalizeText(personalization?.packId, reportMeta?.pack_id);
  const personalizationEngineVersion = normalizeText(
    personalization?.engineVersion,
    reportMeta?.report_engine_version
  );
  const rawOffers = resolveOfferPayloads(reportData);
  const fullRawOffer = findFullOfferPayload(rawOffers);
  const fullResolvedOffer =
    offers.find((offer) => offer.moduleCodes.includes("core_full") || offer.key.toUpperCase().includes("REPORT_FULL"))
    ?? null;

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
      attemptIdMasked: maskIdentifier(attemptId),
      locked: reportData.locked === true,
      typeCode: personalizationTypeCode,
      identity: personalizationIdentity,
      variantKey: overviewVariantKey,
      variantKeys: variantKeysSummary,
      sceneFingerprint: sceneFingerprintSummary,
      boundaryFlags: boundaryFlagsSummary,
      packId: personalizationPackId,
      engineVersion: personalizationEngineVersion,
      locale,
    };

    trackEvent("view_result", basePayload);

    if (typeof window === "undefined") {
      return;
    }

    const revisitStorageKey = `fm_mbti_result_revisit:${attemptId}`;
    const seenBefore = window.sessionStorage.getItem(revisitStorageKey) === "1";
    if (seenBefore) {
      trackEvent("revisit_result", basePayload);
      return;
    }

    window.sessionStorage.setItem(revisitStorageKey, "1");
  }, [
    attemptId,
    boundaryFlagsSummary,
    locale,
    overviewVariantKey,
    personalizationEngineVersion,
    personalizationIdentity,
    personalizationPackId,
    personalizationTypeCode,
    reportData.locked,
    sceneFingerprintSummary,
    variantKeysSummary,
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
          attemptIdMasked: maskIdentifier(attemptId),
          typeCode: personalizationTypeCode,
          identity: personalizationIdentity,
          variantKey: overviewVariantKey,
          variantKeys: variantKeysSummary,
          sceneFingerprint: sceneFingerprintSummary,
          boundaryFlags: boundaryFlagsSummary,
          packId: personalizationPackId,
          engineVersion: personalizationEngineVersion,
          shareMethod: "native",
          locale,
        });
        setShareStatus("idle");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        trackEvent("share_result", {
          attemptIdMasked: maskIdentifier(attemptId),
          typeCode: personalizationTypeCode,
          identity: personalizationIdentity,
          variantKey: overviewVariantKey,
          variantKeys: variantKeysSummary,
          sceneFingerprint: sceneFingerprintSummary,
          boundaryFlags: boundaryFlagsSummary,
          packId: personalizationPackId,
          engineVersion: personalizationEngineVersion,
          shareMethod: "clipboard",
          locale,
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
        attemptIdMasked: maskIdentifier(attemptId),
        sku,
        priceShown:
          fullResolvedOffer?.price
          ?? (typeof fullRawOffer?.price_cents === "number"
            ? `${fullRawOffer.currency ?? ""} ${fullRawOffer.price_cents}`
            : ""),
        typeCode: personalizationTypeCode,
        identity: personalizationIdentity,
        variantKey: overviewVariantKey,
        variantKeys: variantKeysSummary,
        sceneFingerprint: sceneFingerprintSummary,
        boundaryFlags: boundaryFlagsSummary,
        packId: personalizationPackId,
        engineVersion: personalizationEngineVersion,
        locale,
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
        attemptIdMasked: maskIdentifier(attemptId),
        orderNoMasked: maskIdentifier(pendingOrderNo),
        sku,
        typeCode: personalizationTypeCode,
        identity: personalizationIdentity,
        variantKey: overviewVariantKey,
        variantKeys: variantKeysSummary,
        sceneFingerprint: sceneFingerprintSummary,
        boundaryFlags: boundaryFlagsSummary,
        packId: personalizationPackId,
        engineVersion: personalizationEngineVersion,
        locale,
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

  return (
    <div
      data-testid="mbti-result-shell"
      className="relative space-y-6 pb-28 md:space-y-8 xl:pb-0"
      onClickCapture={handleOfferAnchorClickCapture}
    >
      <MbtiMobileChrome
        locale={locale}
        retakeHref={retakeHref}
        primaryCtaLabel={terminalPrimaryCtaLabel}
        primaryCtaHref={terminalPrimaryCtaHref}
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

          {CHAPTER_ORDER.map((chapterKey) => {
            const legacySection = legacySectionsByKey.get(chapterKey) ?? null;
            const projectionSections = CHAPTER_PROJECTION_KEYS[chapterKey]
              .map((sectionKey) => projectionSectionsByKey.get(sectionKey))
              .filter((section): section is MbtiResultProjectionSectionViewModel => Boolean(section));

            if (!legacySection && projectionSections.length === 0) {
              return null;
            }

            return (
              <MbtiChapterSection
                key={chapterKey}
                locale={locale}
                chapterKey={chapterKey}
                legacySection={legacySection}
                projectionSections={projectionSections}
                projectionDimensions={projectionViewModel?.dimensions ?? []}
                globalTraits={globalTraits}
                unlock={sectionUnlocks[chapterKey] ?? null}
                identityLayer={identityLayer}
                personalization={personalization}
              />
            );
          })}

          {careerRecommendationHref ? (
            <section
              id="career-next-step"
              data-testid="mbti-career-next-step"
              className="scroll-mt-28 rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:p-6"
            >
              <div className="space-y-3">
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
                  href={careerRecommendationHref}
                  className={buttonVariants({ className: "bg-slate-950 text-white hover:bg-slate-800" })}
                >
                  {locale === "zh" ? "查看职业推荐" : "View career recommendations"}
                </Link>
              </div>
            </section>
          ) : null}

          <MbtiRecommendedReadsSection locale={locale} reads={recommendedReads} />

          <MbtiOfferComparisonSection
            locale={locale}
            offers={offers}
            cta={cta}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
            checkoutError={checkoutError}
          />

          {isUnlockedPostPurchase && attemptId ? (
            <MbtiPostPurchaseSection
              locale={locale}
              attemptId={attemptId}
              accessHub={accessHub}
              historyHref={historyHref}
              orderLookupHref={orderLookupHref}
            />
          ) : null}

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
                    href={historyHref}
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
          primaryCtaHref={terminalPrimaryCtaHref}
          primaryCtaIsInternal={isUnlockedPostPurchase}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}
