"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ReportCta } from "@/lib/api/v0_3";
import {
  resolveAbsoluteInviteUnlockUrl,
  type AttemptInviteUnlockProgressView,
} from "@/lib/access/inviteUnlock";
import type { UnifiedUnlockSource, UnifiedUnlockStage } from "@/lib/access/unifiedAccess";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";
import {
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
import { buttonVariants } from "@/components/ui/button";

type MbtiOfferComparisonSectionProps = {
  locale: Locale;
  attemptId: string;
  offers: ResolvedOffer[];
  cta?: ReportCta | null;
  unlockStage?: UnifiedUnlockStage | null;
  unlockSource?: UnifiedUnlockSource | null;
  inviteUnlockProgress?: AttemptInviteUnlockProgressView | null;
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

function resolveInviteCtaLabel(
  locale: Locale,
  inviteStatus: "idle" | "copying" | "copied" | "failed"
): string {
  if (inviteStatus === "copying") {
    return locale === "zh" ? "正在生成邀请链接..." : "Preparing invite link...";
  }

  if (inviteStatus === "copied") {
    return locale === "zh" ? "已复制邀请链接" : "Invite link copied";
  }

  if (inviteStatus === "failed") {
    return locale === "zh" ? "重试复制邀请链接" : "Retry invite link";
  }

  return locale === "zh" ? "邀请好友完成测试" : "Invite a friend to finish the test";
}

function resolveInviteProgress({
  requiredInvitees,
  completedInvitees,
  unlockStage,
}: {
  requiredInvitees: number;
  completedInvitees: number;
  unlockStage: UnifiedUnlockStage | null | undefined;
}) {
  const normalizedRequired = requiredInvitees > 0 ? requiredInvitees : 2;
  if (completedInvitees >= 0) {
    return Math.min(normalizedRequired, completedInvitees);
  }

  if (unlockStage === "full") {
    return normalizedRequired;
  }

  if (unlockStage === "partial") {
    return Math.min(normalizedRequired, 1);
  }

  return 0;
}

export function MbtiOfferComparisonSection({
  locale,
  attemptId,
  offers,
  cta,
  unlockStage = null,
  unlockSource = null,
  inviteUnlockProgress = null,
  personalization = null,
  ctaRank = 0,
  onCheckout,
  isCheckingOut = false,
  checkoutError = null,
}: MbtiOfferComparisonSectionProps) {
  const primaryOffer = offers.find((offer) => isFullOffer(offer)) ?? offers[0] ?? null;
  const impressionTrackedRef = useRef(false);
  const inviteProgressTrackedRef = useRef(false);
  const inviteCtaTrackedRef = useRef(false);
  const inviteResultRevisitTrackedRef = useRef(false);
  const [inviteStatus, setInviteStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const ctaTitle = normalizeText(cta?.title) || (locale === "zh" ? "解锁完整 MBTI 报告" : "Unlock the full MBTI report");
  const ctaSubtitle =
    normalizeText(cta?.subtitle) ||
    (locale === "zh"
      ? "一次解锁，补齐完整人格、成长、职业与关系的判断依据与行动坐标。"
      : "Unlock once to complete the personality, growth, career, and relationship interpretation.");
  const benefits = Array.isArray(cta?.benefit_bullets)
    ? cta.benefit_bullets.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const checkoutLabel = isCheckingOut
    ? locale === "zh"
      ? "正在跳转..."
      : "Redirecting..."
    : locale === "zh"
      ? "解锁完整报告"
      : "Unlock full report";
  const inviteLabel = resolveInviteCtaLabel(locale, inviteStatus);
  const requiredInvitees = inviteUnlockProgress?.requiredInvitees ?? 2;
  const completedInvitees = resolveInviteProgress({
    requiredInvitees,
    completedInvitees: inviteUnlockProgress?.completedInvitees ?? -1,
    unlockStage,
  });
  const inviteProgressText = `${completedInvitees}/${requiredInvitees}`;
  const hasInviteLink = Boolean(
    resolveAbsoluteInviteUnlockUrl({
      progress: inviteUnlockProgress,
      locale,
    })
  );
  const showInvitePrimaryCta = unlockStage !== "full";
  const showPaymentCta = unlockStage !== "full";
  const fullUnlockSourceHint =
    unlockSource === "invite"
      ? locale === "zh"
        ? "已通过邀请解锁全部结果。"
        : "Fully unlocked through invites."
      : unlockSource === "mixed"
      ? locale === "zh"
        ? "已通过邀请与支付组合解锁全部结果。"
        : "Fully unlocked through invite and payment."
      : unlockSource === "payment"
      ? locale === "zh"
        ? "已通过支付解锁全部结果。"
        : "Fully unlocked through payment."
      : locale === "zh"
      ? "已全部解锁。"
      : "Fully unlocked.";
  const progressHint =
    unlockStage === "partial"
      ? locale === "zh"
        ? "职业章节已解锁，再邀请 1 位好友即可解锁全部结果。"
        : "Career is unlocked. Invite one more friend to unlock the full result."
      : unlockStage === "full"
      ? fullUnlockSourceHint
      : locale === "zh"
      ? "邀请 1 位好友完成测试，先解锁职业章节；邀请 2 位解锁全部结果。"
      : "Invite one friend to unlock Career first, and two friends to unlock everything.";
  const inviteDiagnosticStatus = normalizeText(inviteUnlockProgress?.diagnostics?.status);
  const unlockStatusLabel =
    unlockStage === "full"
      ? unlockSource === "mixed"
        ? locale === "zh"
          ? "混合解锁"
          : "Mixed unlock"
        : unlockSource === "payment"
          ? locale === "zh"
            ? "支付完全解锁"
            : "Payment full unlock"
          : locale === "zh"
            ? "邀请完全解锁"
            : "Invite full unlock"
      : unlockStage === "partial"
        ? locale === "zh"
          ? "部分解锁"
          : "Partial unlock"
        : locale === "zh"
          ? "未解锁"
          : "Locked";
  const unlockStatusDescription = inviteDiagnosticStatus
    ? locale === "zh"
      ? `诊断状态：${inviteDiagnosticStatus}`
      : `Diagnostic status: ${inviteDiagnosticStatus}`
    : null;
  const compactFacts = [
    {
      label: locale === "zh" ? "覆盖模块" : "Coverage",
      value:
        primaryOffer.modules.length > 0
          ? `${primaryOffer.modules.length} ${locale === "zh" ? "个模块" : "modules"}`
          : locale === "zh"
            ? "完整报告层"
            : "Full report layer",
    },
    {
      label: locale === "zh" ? "模式" : "Mode",
      value: locale === "zh" ? "一次性付费" : "One-time access",
    },
  ];

  async function handleInviteAction() {
    if (!showInvitePrimaryCta || inviteStatus === "copying") {
      return;
    }

    const inviteUrl = resolveAbsoluteInviteUnlockUrl({
      progress: inviteUnlockProgress,
      locale,
    });

    if (!inviteUrl) {
      setInviteStatus("failed");
      return;
    }

    setInviteStatus("copying");

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        trackEvent("invite_link_copied", {
          scale_code: "MBTI",
          attempt_id: normalizeText(attemptId),
          unlock_stage: unlockStage,
          unlock_source: unlockSource,
          completed_invitees: completedInvitees,
          required_invitees: requiredInvitees,
          locale,
        });
        setInviteStatus("copied");
        return;
      }
    } catch {
      // Fall through to failed state.
    }

    setInviteStatus("failed");
  }

  useEffect(() => {
    if (primaryOffer === null || impressionTrackedRef.current) {
      return;
    }

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

  useEffect(() => {
    if (inviteProgressTrackedRef.current) {
      return;
    }

    inviteProgressTrackedRef.current = true;
    trackEvent("invite_progress_viewed", {
      scale_code: "MBTI",
      attempt_id: normalizeText(attemptId),
      unlock_stage: unlockStage,
      unlock_source: unlockSource,
      completed_invitees: completedInvitees,
      required_invitees: requiredInvitees,
      locale,
    });
  }, [
    attemptId,
    completedInvitees,
    locale,
    requiredInvitees,
    unlockSource,
    unlockStage,
  ]);

  useEffect(() => {
    if (inviteResultRevisitTrackedRef.current) {
      return;
    }

    const hasInviteRevisitSignal = completedInvitees > 0 || unlockSource === "invite" || unlockSource === "mixed";
    if (!hasInviteRevisitSignal) {
      return;
    }

    inviteResultRevisitTrackedRef.current = true;
    trackEvent("result_revisit_after_invite", {
      scale_code: "MBTI",
      attempt_id: normalizeText(attemptId),
      unlock_stage: unlockStage,
      unlock_source: unlockSource,
      completed_invitees: completedInvitees,
      required_invitees: requiredInvitees,
      entry_surface: "result_page",
      locale,
    });
  }, [
    attemptId,
    completedInvitees,
    locale,
    requiredInvitees,
    unlockSource,
    unlockStage,
  ]);

  useEffect(() => {
    if (!showInvitePrimaryCta || inviteCtaTrackedRef.current) {
      return;
    }

    inviteCtaTrackedRef.current = true;
    trackEvent("invite_cta_shown", {
      scale_code: "MBTI",
      attempt_id: normalizeText(attemptId),
      unlock_stage: unlockStage,
      unlock_source: unlockSource,
      completed_invitees: completedInvitees,
      required_invitees: requiredInvitees,
      locale,
    });
  }, [
    attemptId,
    completedInvitees,
    locale,
    requiredInvitees,
    showInvitePrimaryCta,
    unlockSource,
    unlockStage,
  ]);

  if (primaryOffer === null) {
    return null;
  }

  return (
    <section
      data-testid="mbti-offer-comparison"
      data-cta-key="unlock_full_report"
      data-cta-rank={ctaRank > 0 ? String(ctaRank) : undefined}
      className="scroll-mt-28"
    >
      <div className="rounded-3xl border border-emerald-200 bg-[#EAF7EE] p-5 shadow-[0_22px_56px_rgba(15,23,42,0.12)] md:p-6 xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(240px,1fr)_minmax(520px,2fr)] xl:items-start">
          <div className="space-y-4 rounded-2xl border border-emerald-300 bg-white p-4 shadow-[0_14px_34px_rgba(34,197,94,0.16)]">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {locale === "zh" ? "Fermat MBTI" : "Fermat MBTI"}
            </p>
            <p className="m-0 text-3xl font-semibold text-slate-900">MBTI</p>
            <p className="m-0 text-sm leading-7 text-slate-600">
              {locale === "zh"
                ? "基于当前结果的完整人格报告与行动建议"
                : "Full report with complete personality interpretation and action guidance"}
            </p>
          </div>

          <div className="space-y-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {locale === "zh" ? "收口区" : "Final offer"}
            </p>
            <h2 className="m-0 text-2xl font-semibold text-slate-900 xl:text-3xl">
              {ctaTitle}
            </h2>
            <p className="m-0 max-w-3xl text-sm leading-7 text-slate-700">{ctaSubtitle}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {compactFacts.map((fact) => (
                <article key={fact.label} className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3">
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{fact.label}</p>
                  <p className="m-0 mt-1 text-sm font-semibold text-slate-900">{fact.value}</p>
                </article>
              ))}
            </div>

            {primaryOffer.modules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {primaryOffer.modules.map((module) => (
                  <span
                    key={module}
                    className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-emerald-900"
                  >
                    {resolveOfferModuleLabel(module, locale)}
                  </span>
                ))}
              </div>
            ) : null}

            {benefits.length > 0 ? (
              <ul className="m-0 grid list-disc gap-2 pl-5 text-sm leading-7 text-slate-700 md:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}

            <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {locale === "zh" ? "邀请解锁进度" : "Invite unlock progress"}
              </p>
              <p className="m-0 mt-1 text-lg font-semibold text-slate-900" data-testid="mbti-invite-progress-value">
                {inviteProgressText}
              </p>
              <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" data-testid="mbti-invite-progress-status">
                {unlockStatusLabel}
              </p>
              <p className="m-0 mt-2 text-sm leading-7 text-slate-600" data-testid="mbti-invite-progress-hint">
                {progressHint}
              </p>
              {unlockStatusDescription ? (
                <p className="m-0 mt-1 text-xs text-slate-500">{unlockStatusDescription}</p>
              ) : null}
              {showInvitePrimaryCta ? (
                <button
                  type="button"
                  data-testid="mbti-offers-invite-cta"
                  onClick={() => {
                    void handleInviteAction();
                  }}
                  disabled={inviteStatus === "copying" || !hasInviteLink}
                  className={buttonVariants({
                    className:
                      "mt-3 inline-flex min-h-[44px] min-w-[220px] items-center justify-center rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70",
                  })}
                >
                  {inviteLabel}
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "zh" ? "价格" : "Price"}
                </p>
                <p className="m-0 mt-1 text-3xl font-semibold text-slate-900">{primaryOffer.price}</p>
                {primaryOffer.description ? <p className="m-0 mt-2 text-sm text-slate-500">{primaryOffer.description}</p> : null}
              </div>
              {showPaymentCta ? (
                <button
                  type="button"
                  data-testid="mbti-offers-primary-cta"
                  disabled={isCheckingOut}
                  className={buttonVariants({
                    className:
                      "inline-flex min-h-[44px] min-w-[180px] items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70",
                  })}
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
              ) : null}
            </div>

            {checkoutError ? (
              <p className="m-0 text-sm text-rose-700" data-testid="mbti-offers-checkout-error">
                {checkoutError}
              </p>
            ) : null}
            {showPaymentCta ? (
              <p className="m-0 text-xs text-slate-500">
                {locale === "zh"
                  ? "支付成功后立即解锁完整报告，并进入统一结果工作台。"
                  : "After payment, the full report is unlocked and available in your workspace."}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
