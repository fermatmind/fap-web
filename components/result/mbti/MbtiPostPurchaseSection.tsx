"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AttemptPdfDownloadButton } from "@/components/commerce/AttemptPdfDownloadButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
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
  accessHub,
  historyHref,
  orderLookupHref,
  personalization,
  ctaRank = 0,
}: {
  locale: Locale;
  attemptId?: string | null;
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
  const pdfUrl = accessHub?.pdfAccess.href ?? null;
  const canShowPdf = accessHub ? accessHub.pdfAccess.canDownloadPdf && Boolean(pdfUrl || resolvedAttemptId) : Boolean(resolvedAttemptId);
  const canShowWorkspaceEntry = accessHub?.workspaceLite.hasEntry ?? true;
  const carryoverFocusKey = String(personalization?.continuity?.carryoverFocusKey ?? "").trim();
  const carryoverReason = String(personalization?.continuity?.carryoverReason ?? "").trim();
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(carryoverFocusKey, locale);
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(carryoverReason, locale);
  const telemetryPayload = {
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
  };

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
      className="border-emerald-200 bg-gradient-to-br from-white via-emerald-50/75 to-sky-50 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
    >
      <CardHeader className="space-y-2 pb-4">
        {ctaRank > 0 ? (
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {isZh ? `优先入口 ${ctaRank}` : `Priority ${ctaRank}`}
          </p>
        ) : null}
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {isZh ? "正式留存入口" : "Post-purchase access"}
        </p>
        <CardTitle className="text-2xl text-slate-950">{isZh ? "已解锁完整报告" : "Full report unlocked"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="m-0 text-sm leading-7 text-slate-600">
          {isZh
            ? "你的完整报告已可再次查看与下载。这里统一收口 PDF、订单详情、找回入口，以及 Workspace Lite 回访入口。"
            : "Your full report is ready to revisit and download. This section now unifies PDF delivery, order detail, recovery, and the Workspace Lite re-entry point."}
        </p>
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
              label={isZh ? "下载 PDF" : "Download PDF"}
              loadingLabel={isZh ? "正在下载 PDF..." : "Downloading PDF..."}
              errorMessage={isZh ? "PDF 下载失败，请稍后重试。" : "Failed to download the PDF. Please try again."}
              filenamePrefix="mbti-report"
              pdfVariant="mbti_result_post_purchase"
              pdfUrl={pdfUrl}
              buttonClassName="w-full"
              testId="mbti-post-purchase-download"
            />
          ) : null}
          {canShowWorkspaceEntry ? (
            <Link
              href={workspaceHref}
              className={buttonVariants({ className: "w-full" })}
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
              className={buttonVariants({ variant: "outline", className: "w-full" })}
              data-testid="mbti-post-purchase-private-relationship"
            >
              {isZh ? "关系回访入口" : "Relationship hub"}
            </Link>
          ) : null}
          {orderDetailHref ? (
            <Link
              href={orderDetailHref}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
              data-testid="mbti-post-purchase-order-detail"
            >
              {isZh ? "订单详情" : "Order details"}
            </Link>
          ) : null}
          {lookupHref ? (
            <Link
              href={lookupHref}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
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
