"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { AttemptPdfDownloadButton } from "@/components/commerce/AttemptPdfDownloadButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { canDownloadReportPdf, type AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { MbtiAccessHubViewModel } from "@/lib/mbti/accessHub";
import { resolveMbtiCarryoverFocusLabel, resolveMbtiCarryoverReasonLabel } from "@/lib/mbti/continuity";
import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiActionCompletionTendency,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCompletedActionKeys,
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
  summarizeMbtiOrderedActionKeys,
  summarizeMbtiOrderedRecommendationKeys,
  summarizeMbtiOrderedSectionKeys,
  summarizeMbtiProgressState,
  summarizeMbtiPulsePromptKeys,
  summarizeMbtiPulseState,
  summarizeMbtiRecommendationPriorityKeys,
  summarizeMbtiRecommendedNextPulseKeys,
  summarizeMbtiRevisitReorderReason,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiSecondaryFocusKeys,
  summarizeMbtiUserState,
  summarizeMbtiVariantKeys,
} from "@/lib/mbti/personalizationTelemetry";

export function MbtiPostPurchaseSection({
  locale,
  attemptId,
  accessProjection,
  accessHub,
  historyHref,
  orderLookupHref,
  personalization,
  ctaRank = 0,
}: {
  locale: Locale;
  attemptId?: string | null;
  accessProjection?: AttemptReportAccessView | null;
  accessHub?: MbtiAccessHubViewModel | null;
  historyHref: string;
  orderLookupHref: string;
  personalization?: MbtiResultPersonalizationViewModel | null;
  ctaRank?: number;
}) {
  const impressionTrackedRef = useRef(false);
  const isZh = locale === "zh";
  const resolvedAttemptId =
    accessHub?.reportAccess.attemptId
    ?? accessHub?.recovery.attemptId
    ?? accessHub?.workspaceLite.attemptId
    ?? attemptId
    ?? null;
  const workspaceHref = accessHub?.workspaceLite.href ?? historyHref;
  const privateRelationshipHref = accessHub?.recovery.compareInviteId
    ? localizedPath("/relationships/mbti", locale)
    : null;
  const orderDetailHref = accessHub?.links.orderHref ?? null;
  const lookupHref = accessHub?.recovery.canLookupOrder === false ? null : accessHub?.links.lookupHref ?? orderLookupHref;
  const pdfUrl = accessProjection?.actions.pdfHref ?? accessHub?.pdfAccess.href ?? null;
  const canShowPdf = accessProjection
    ? canDownloadReportPdf(accessProjection) && Boolean(pdfUrl || resolvedAttemptId)
    : accessHub
      ? accessHub.pdfAccess.canDownloadPdf && Boolean(pdfUrl || resolvedAttemptId)
      : Boolean(resolvedAttemptId);
  const canShowWorkspaceEntry = accessHub?.workspaceLite.hasEntry ?? true;
  const carryoverFocusKey = String(personalization?.continuity?.carryoverFocusKey ?? "").trim();
  const carryoverReason = String(personalization?.continuity?.carryoverReason ?? "").trim();
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(carryoverFocusKey, locale);
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(carryoverReason, locale);
  const telemetryPayload = useMemo(
    () => ({
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "post_purchase_history_entry",
      continueTarget: "workspace_lite",
      variantKeys: summarizeMbtiVariantKeys(personalization),
      sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
      boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
      axisBands: summarizeMbtiAxisBands(personalization),
      userState: summarizeMbtiUserState(personalization),
      feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
      feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
      actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
      lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
      currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
      primaryFocusKey: String(personalization?.orchestration?.primaryFocusKey ?? ""),
      secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
      orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
      orderedRecommendationKeys: summarizeMbtiOrderedRecommendationKeys(personalization),
      orderedActionKeys: summarizeMbtiOrderedActionKeys(personalization),
      recommendationPriorityKeys: summarizeMbtiRecommendationPriorityKeys(personalization),
      actionPriorityKeys: summarizeMbtiActionPriorityKeys(personalization),
      readingFocusKey: String(personalization?.readingFocusKey ?? ""),
      actionFocusKey: String(personalization?.actionFocusKey ?? ""),
      ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
      carryoverFocusKey,
      carryoverReason,
      recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
      carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
      carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
      journeyContractVersion: summarizeMbtiJourneyContractVersion(personalization),
      journeyFingerprint: summarizeMbtiJourneyFingerprint(personalization),
      journeyScope: summarizeMbtiJourneyScope(personalization),
      journeyState: summarizeMbtiJourneyState(personalization),
      progressState: summarizeMbtiProgressState(personalization),
      completedActionKeys: summarizeMbtiCompletedActionKeys(personalization),
      recommendedNextPulseKeys: summarizeMbtiRecommendedNextPulseKeys(personalization),
      revisitReorderReason: summarizeMbtiRevisitReorderReason(personalization),
      pulseState: summarizeMbtiPulseState(personalization),
      pulsePromptKeys: summarizeMbtiPulsePromptKeys(personalization),
      ctaKey: "workspace_lite",
      ctaRank,
      typeCode: String(personalization?.typeCode ?? ""),
      identity: String(personalization?.identity ?? ""),
      packId: String(personalization?.packId ?? ""),
      engineVersion: String(personalization?.engineVersion ?? ""),
      locale,
    }),
    [carryoverFocusKey, carryoverReason, ctaRank, locale, personalization]
  );

  useEffect(() => {
    if (!canShowWorkspaceEntry || impressionTrackedRef.current) {
      return;
    }

    impressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      attempt_id: resolvedAttemptId ?? "",
      ...telemetryPayload,
    });
  }, [canShowWorkspaceEntry, resolvedAttemptId, telemetryPayload]);

  return (
    <Card
      data-testid="mbti-post-purchase-section"
      data-cta-key="workspace_lite"
      data-cta-rank={ctaRank > 0 ? String(ctaRank) : undefined}
      className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.92)_38%,rgba(241,245,249,0.98)_100%)] shadow-[0_22px_52px_rgba(15,23,42,0.09)]"
    >
      <CardHeader className="space-y-2 pb-4">
        {ctaRank > 0 ? (
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {isZh ? `优先入口 ${ctaRank}` : `Priority ${ctaRank}`}
          </p>
        ) : null}
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {isZh ? "完整结果工作台" : "Full result workspace"}
        </p>
        <CardTitle className="text-2xl tracking-[-0.03em] text-slate-950">{isZh ? "已解锁完整报告" : "Full report unlocked"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="m-0 text-sm leading-7 text-slate-600">
          {isZh
            ? "完整报告现已进入可回访状态。这里统一收口 PDF、订单、找回与历史入口，方便后续继续使用。"
            : "The full report is now ready for revisit. This section brings PDF, order, recovery, and history access into one place."}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isZh ? "状态" : "Status"}
            </p>
            <p className="m-0 mt-2 text-sm font-medium text-slate-900">
              {isZh ? "完整报告已开放" : "Full report available"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isZh ? "交付" : "Delivery"}
            </p>
            <p className="m-0 mt-2 text-sm font-medium text-slate-900">
              {canShowPdf ? (isZh ? "支持 PDF 下载" : "PDF delivery enabled") : (isZh ? "在线访问" : "Online access")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isZh ? "延续使用" : "Continue"}
            </p>
            <p className="m-0 mt-2 text-sm font-medium text-slate-900">
              {isZh ? "可从历史结果再次进入" : "Re-enter through report history"}
            </p>
          </div>
        </div>
        {carryoverFocusKey ? (
          <div
            data-testid="mbti-post-purchase-carryover"
            className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"
          >
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              {isZh ? "继续上次重点" : "Continue the current focus"}
            </p>
            <p className="m-0 mt-2 text-sm font-medium text-slate-900">{continuityFocusLabel}</p>
            <p className="m-0 mt-1 text-sm leading-7 text-slate-600">{continuityReasonLabel}</p>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {canShowPdf ? (
            <AttemptPdfDownloadButton
              attemptId={resolvedAttemptId}
              locale={locale}
              accessProjection={accessProjection}
              label={isZh ? "下载 PDF" : "Download PDF"}
              loadingLabel={isZh ? "正在下载 PDF..." : "Downloading PDF..."}
              errorMessage={isZh ? "PDF 下载失败，请稍后重试。" : "Failed to download the PDF. Please try again."}
              filenamePrefix="mbti-report"
              pdfVariant="mbti_result_post_purchase"
              pdfUrl={pdfUrl}
              buttonClassName="w-full bg-slate-950 text-white hover:bg-slate-800"
              testId="mbti-post-purchase-download"
            />
          ) : null}
          {canShowWorkspaceEntry ? (
            <Link
              href={workspaceHref}
              className={buttonVariants({ className: "w-full bg-slate-950 text-white hover:bg-slate-800" })}
              data-testid="mbti-post-purchase-history"
              onClick={() => {
                trackEvent("ui_card_interaction", {
                  attempt_id: resolvedAttemptId ?? "",
                  interaction: "click",
                  ...telemetryPayload,
                });
              }}
            >
              {isZh ? "我的 MBTI 报告" : "My MBTI reports"}
            </Link>
          ) : null}
          {privateRelationshipHref ? (
            <Link
              href={privateRelationshipHref}
              className={buttonVariants({ variant: "outline", className: "w-full border-slate-300 bg-white/80" })}
              data-testid="mbti-post-purchase-private-relationship"
            >
              {isZh ? "关系回访入口" : "Relationship hub"}
            </Link>
          ) : null}
          {orderDetailHref ? (
            <Link
              href={orderDetailHref}
              className={buttonVariants({ variant: "outline", className: "w-full border-slate-300 bg-white/80" })}
              data-testid="mbti-post-purchase-order-detail"
            >
              {isZh ? "订单详情" : "Order details"}
            </Link>
          ) : null}
          {lookupHref ? (
            <Link
              href={lookupHref}
              className={buttonVariants({ variant: "outline", className: "w-full border-slate-300 bg-white/80" })}
              data-testid="mbti-post-purchase-order-lookup"
            >
              {isZh ? "订单找回" : "Order lookup"}
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
