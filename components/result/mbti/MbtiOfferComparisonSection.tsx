"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import type { ReportCta } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiCtaPriorityKeys,
  summarizeMbtiOrderedActionKeys,
  summarizeMbtiOrderedRecommendationKeys,
  summarizeMbtiOrderedSectionKeys,
  summarizeMbtiRecommendationPriorityKeys,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiSecondaryFocusKeys,
  summarizeMbtiUserState,
  summarizeMbtiVariantKeys,
} from "@/lib/mbti/personalizationTelemetry";
import type { ResolvedOffer } from "@/components/result/RichResultReport";

type MbtiOfferComparisonSectionProps = {
  locale: Locale;
  attemptId: string;
  offers: ResolvedOffer[];
  cta?: ReportCta | null;
  personalization?: MbtiResultPersonalizationViewModel | null;
  ctaRank?: number;
  onCheckout?: () => void | Promise<void>;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function isFullOffer(offer: ResolvedOffer): boolean {
  const key = offer.key.toUpperCase();
  return offer.moduleCodes.includes("core_full") || key.includes("REPORT_FULL");
}

export function MbtiOfferComparisonSection({
  locale,
  attemptId,
  offers,
  cta,
  personalization = null,
  ctaRank = 0,
  onCheckout,
  isCheckingOut = false,
  checkoutError = null,
}: MbtiOfferComparisonSectionProps) {
  const primaryOffer = offers.find((offer) => isFullOffer(offer)) ?? offers[0] ?? null;
  const impressionTrackedRef = useRef(false);
  const ctaBadge = normalizeText(cta?.badge);
  const ctaTitle =
    normalizeText(cta?.title) ||
    (locale === "zh" ? "解锁完整 MBTI 报告" : "Unlock the full MBTI report");
  const ctaSubtitle =
    normalizeText(cta?.subtitle) ||
    (locale === "zh"
      ? "一次支付 ¥1.99，解锁完整人格、成长、职业与关系内容。"
      : "Pay once to unlock the full personality, growth, career, and relationship reading.");
  const benefitBullets = Array.isArray(cta?.benefit_bullets)
    ? cta.benefit_bullets.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const primaryCtaLabel = locale === "zh" ? "解锁完整报告" : "Unlock full report";
  const checkoutLabel = isCheckingOut
    ? locale === "zh"
      ? "正在跳转..."
      : "Redirecting..."
    : primaryCtaLabel;

  useEffect(() => {
    if (primaryOffer === null || impressionTrackedRef.current) return;
    impressionTrackedRef.current = true;

    trackEvent("ui_card_impression", {
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "offer_primary_cta",
      attempt_id: normalizeText(attemptId),
      ctaKey: "unlock_full_report",
      ctaRank,
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
      ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
      carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
      carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
      recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
      carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
      carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
      variantKeys: summarizeMbtiVariantKeys(personalization),
      sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
      boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
      axisBands: summarizeMbtiAxisBands(personalization),
      typeCode: normalizeText(personalization?.typeCode),
      identity: normalizeText(personalization?.identity),
      packId: normalizeText(personalization?.packId),
      engineVersion: normalizeText(personalization?.engineVersion),
      locale,
    });
  }, [attemptId, ctaRank, locale, personalization, primaryOffer]);

  if (primaryOffer === null) {
    return null;
  }

  return (
    <section
      id="offers"
      data-testid="mbti-offer-comparison"
      data-cta-key="unlock_full_report"
      data-cta-rank={ctaRank > 0 ? String(ctaRank) : undefined}
      className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="space-y-2">
        {ctaRank > 0 ? (
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {locale === "zh" ? `优先入口 ${ctaRank}` : `Priority ${ctaRank}`}
          </p>
        ) : null}
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "解锁方案" : "Unlock options"}
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
          {ctaTitle}
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">{ctaSubtitle}</p>
      </div>

      <Card
        id="offer-full"
        data-testid="mbti-offer-card-full"
        className="border-slate-950 bg-slate-950 text-white shadow-[0_22px_48px_rgba(15,23,42,0.2)]"
      >
        <CardHeader className="space-y-2 pb-3">
          {ctaBadge ? (
            <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
              {ctaBadge}
            </span>
          ) : null}
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
            {locale === "zh" ? "完整报告" : "Full report"}
          </p>
          <CardTitle className="text-2xl text-white">{primaryOffer.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="m-0 text-4xl font-bold tracking-tight text-white">{primaryOffer.price}</p>
          <p className="m-0 text-sm leading-7 text-slate-200">{primaryOffer.description}</p>
          {benefitBullets.length > 0 ? (
            <ul className="mb-0 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-200">
              {benefitBullets.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          ) : null}
          {primaryOffer.modules.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {primaryOffer.modules.map((module) => (
                <span
                  key={module}
                  className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90"
                >
                  {module}
                </span>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            data-testid="mbti-offers-primary-cta"
            disabled={isCheckingOut}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[var(--fm-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--fm-shadow-sm)] transition hover:opacity-95"
            onClick={() => {
              trackEvent("ui_card_interaction", {
                slug: "mbti-result-shell",
                scale_code: "MBTI",
                visual_kind: "offer_primary_cta",
                interaction: "click",
                attempt_id: normalizeText(attemptId),
                ctaKey: "unlock_full_report",
                ctaRank,
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
                ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
                carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
                carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
                recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
                carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
                carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
                variantKeys: summarizeMbtiVariantKeys(personalization),
                sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
                boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
                axisBands: summarizeMbtiAxisBands(personalization),
                typeCode: normalizeText(personalization?.typeCode),
                identity: normalizeText(personalization?.identity),
                packId: normalizeText(personalization?.packId),
                engineVersion: normalizeText(personalization?.engineVersion),
                locale,
              });
              void onCheckout?.();
            }}
          >
            {checkoutLabel}
          </button>
          {checkoutError ? (
            <p className="mb-0 text-sm text-rose-300" data-testid="mbti-offers-checkout-error">
              {checkoutError}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
