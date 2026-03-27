"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import type { ReportCta } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiActionCompletionTendency,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiCtaPriorityKeys,
  summarizeMbtiCurrentIntentCluster,
  summarizeMbtiFeedbackCoverage,
  summarizeMbtiFeedbackSentiment,
  summarizeMbtiLastDeepReadSection,
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

function resolveOfferModuleLabel(moduleCode: string, locale: Locale): string {
  const normalized = moduleCode.trim().toLowerCase();
  const labels: Record<string, { zh: string; en: string }> = {
    core_free: { zh: "结果摘要", en: "Result summary" },
    core_full: { zh: "完整人格判读", en: "Full personality reading" },
    career: { zh: "职业映射", en: "Career mapping" },
    relationships: { zh: "关系映射", en: "Relationship mapping" },
  };

  return labels[normalized]?.[locale] ?? moduleCode;
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
  const comparisonRows = [
    {
      label: locale === "zh" ? "免费预览" : "Preview",
      value: locale === "zh" ? "公开结果层" : "Public result layer",
      detail: locale === "zh" ? "保留类型摘要、章节入口与部分公开正文。" : "Keeps the type summary, chapter entry, and selected public content.",
    },
    {
      label: locale === "zh" ? "完整报告" : "Full report",
      value: locale === "zh" ? "完整判断依据" : "Complete decision basis",
      detail: locale === "zh" ? "补齐边界解释、场景映射与行动坐标。" : "Adds boundary interpretation, scenario mapping, and action coordinates.",
    },
  ];
  const quickFacts = [
    {
      label: locale === "zh" ? "支付方式" : "Payment model",
      value: locale === "zh" ? "一次支付" : "One-time unlock",
    },
    {
      label: locale === "zh" ? "覆盖模块" : "Coverage",
      value:
        primaryOffer.modules.length > 0
          ? locale === "zh"
            ? `${primaryOffer.modules.length} 个模块`
            : `${primaryOffer.modules.length} modules`
          : locale === "zh"
            ? "完整报告层"
            : "Full report layer",
    },
    {
      label: locale === "zh" ? "解锁方式" : "Unlock path",
      value: locale === "zh" ? "统一在本区收口" : "Single unlock surface",
    },
  ];

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
      feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
      feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
      actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
      lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
      currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
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
      data-testid="mbti-offer-comparison"
      data-cta-key="unlock_full_report"
      data-cta-rank={ctaRank > 0 ? String(ctaRank) : undefined}
      className="scroll-mt-28 space-y-6 rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.97))] p-5 shadow-[0_22px_56px_rgba(15,23,42,0.09)] md:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-2">
            {ctaRank > 0 ? (
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {locale === "zh" ? `优先入口 ${ctaRank}` : `Priority ${ctaRank}`}
              </p>
            ) : null}
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
              {locale === "zh" ? "主解锁区" : "Primary unlock area"}
            </p>
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
              {ctaTitle}
            </h2>
            <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">{ctaSubtitle}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[20px] border border-slate-200 bg-white/92 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
              >
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {fact.label}
                </p>
                <p className="m-0 mt-2 text-sm font-semibold text-slate-900">{fact.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className={`rounded-[24px] border p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] ${
                  row.label === (locale === "zh" ? "完整报告" : "Full report")
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-slate-200 bg-white/90"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{row.label}</p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      row.label === (locale === "zh" ? "完整报告" : "Full report")
                        ? "border border-emerald-200 bg-white text-emerald-800"
                        : "border border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {row.label === (locale === "zh" ? "完整报告" : "Full report")
                      ? locale === "zh"
                        ? "主方案"
                        : "Primary plan"
                      : locale === "zh"
                        ? "当前可见"
                        : "Visible now"}
                  </span>
                </div>
                <p className="m-0 mt-3 text-base font-semibold tracking-[-0.02em] text-slate-950">{row.value}</p>
                <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{row.detail}</p>
              </div>
            ))}
          </div>

          {benefitBullets.length > 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {locale === "zh" ? "解锁后会得到什么" : "What unlock adds"}
              </p>
              <ul className="mb-0 mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                {benefitBullets.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <Card
          data-testid="mbti-offer-card-full"
          className="overflow-hidden border-slate-950 bg-slate-950 text-white shadow-[0_24px_54px_rgba(15,23,42,0.22)]"
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
            <CardTitle className="text-2xl tracking-[-0.03em] text-white">{primaryOffer.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="m-0 text-4xl font-bold tracking-tight text-white">{primaryOffer.price}</p>
                <p className="m-0 mt-2 text-sm leading-7 text-slate-300">{primaryOffer.description}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="m-0 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  {locale === "zh" ? "升级价值" : "Upgrade value"}
                </p>
                <p className="m-0 mt-1 text-sm font-medium text-white">
                  {locale === "zh" ? "获得更完整的判断依据与行动坐标" : "Gain a more complete decision basis and action map"}
                </p>
              </div>
            </div>
            {primaryOffer.modules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {primaryOffer.modules.map((module) => (
                  <span
                    key={module}
                    className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90"
                  >
                    {resolveOfferModuleLabel(module, locale)}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {locale === "zh" ? "为什么主 CTA 收口在这里" : "Why the primary CTA ends here"}
              </p>
              <p className="m-0 mt-2 text-sm leading-7 text-slate-300">
                {locale === "zh"
                  ? "结果页只保留一个正式解锁收口区。上方 hero、章节 teaser、footer 与 rail 都会回到这里，避免多套付费表达并行。"
                  : "The result page keeps one formal unlock sink. The hero, chapter teasers, footer, and rail all route back here instead of splitting commerce across multiple surfaces."}
              </p>
            </div>
            <button
              type="button"
              data-testid="mbti-offers-primary-cta"
              disabled={isCheckingOut}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_34px_rgba(255,255,255,0.14)] transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
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
                feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
                feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
                actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
                lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
                currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
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
      </div>
    </section>
  );
}
