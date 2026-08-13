"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createAttemptShare } from "@/lib/api/v0_3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { trackEvent, trackObservableFunnelEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { buildRiasecTakeHref, getRiasecVariantLabel } from "@/lib/riasec/forms";
import {
  getRenderableRiasecDeepContentSlots,
  getRiasecModuleVisibility,
  type RiasecDeepContentSlot,
  type RiasecResultViewModel,
} from "@/lib/riasec/resultAssembler";
import {
  buildRiasecTrustedResultTrackingPayload,
  buildRiasecViewResultTrackingPayload,
  RIASEC_TRACKING_EVENTS,
} from "@/lib/riasec/tracking";
import { TRACKING_EVENTS } from "@/lib/tracking/events";

const RIASEC_DEBUG_RENDER_PATTERNS = [
  /\bBUTTON\s+LABEL\b/gi,
  /\bBUT\s+TON\s+LABEL\b/gi,
  /\bscore space\b/gi,
  /\braw score\b/gi,
  /\briasec_60_likert5_activity_sum_space(?:\.v\d+)?\b/gi,
  /\bminimal_answer_completion_only\b/gi,
  /\bcontent_example_not_registry_match(?:_without_reviewed_registry_source)?\b/gi,
  /\bphysical_implementation\b/gi,
  /\btools_and_equipment\b/gi,
  /\bfield_troubleshooting\b/gi,
  /\bprototypes_and_tangible_outputs\b/gi,
  /\bhands_on_systems\b/gi,
  /\banalyze_complex_problems\b/gi,
  /\borganize_evidence_materials\b/gi,
  /\bmodel_systems\b/gi,
  /\btest_hypotheses\b/gi,
  /\bresearch_and_explain\b/gi,
];

const RIASEC_DEEP_CONTENT_LABELS: Record<string, { zh: string; en: string }> = {
  core_reading: { zh: "核心解读", en: "Core reading" },
  core_drive: { zh: "兴趣线索", en: "Interest signal" },
  positive_value: { zh: "可观察价值", en: "What to observe" },
  real_world_cost: { zh: "现实条件", en: "Real-world conditions" },
  common_misread: { zh: "常见误读", en: "Common misreading" },
  primary_activity_chain: { zh: "主要活动线索", en: "Primary activity signal" },
  secondary_support_line: { zh: "辅助活动线索", en: "Secondary activity signal" },
  tertiary_stabilizer: { zh: "补充活动线索", en: "Additional activity signal" },
  ordered_code_handling: { zh: "代码阅读方式", en: "How to read the code" },
  high_score_reading: { zh: "较高分解读", en: "Higher-score reading" },
  medium_score_reading: { zh: "中等分解读", en: "Middle-score reading" },
  low_score_safe_reading: { zh: "较低分解读", en: "Lower-score reading" },
  work_activity_examples: { zh: "可尝试的活动", en: "Activities to try" },
  activities_to_validate: { zh: "可验证的活动", en: "Activities to validate" },
  activity_chain: { zh: "活动线索组合", en: "Activity signal combination" },
  activity_sequence: { zh: "活动顺序", en: "Activity sequence" },
  deep_report_extension: { zh: "深入阅读", en: "Further reading" },
  first_experiment: { zh: "首次尝试", en: "First experiment" },
  free_page_teaser: { zh: "页面摘要", en: "Page summary" },
  likely_tension: { zh: "可能的张力", en: "Possible tension" },
  low_risk_validation: { zh: "低风险验证", en: "Low-risk validation" },
  pair_label: { zh: "兴趣组合", en: "Interest combination" },
  short_label: { zh: "简要标签", en: "Short label" },
  strategy_label: { zh: "阅读主题", en: "Reading theme" },
  when_not_to_overread: { zh: "避免过度解读", en: "When not to overread" },
  when_to_use_140q: { zh: "何时考虑 140 题", en: "When to consider the 140-item form" },
  environment_card: { zh: "环境线索", en: "Environment signals" },
  example_question: { zh: "示例问题", en: "Example question" },
  question: { zh: "探索问题", en: "Exploration question" },
  role_responsibility_card: { zh: "角色责任线索", en: "Role-responsibility signals" },
  selection_basis: { zh: "选择依据", en: "Selection basis" },
  task_activity_card: { zh: "任务活动线索", en: "Task-activity signals" },
  what_user_sees: { zh: "你会看到什么", en: "What you will see" },
  possible_drains: { zh: "可能影响体验的条件", en: "Conditions that may affect the experience" },
  action_advice: { zh: "下一步", en: "Next step" },
  interest_activity_focus: { zh: "活动关注点", en: "Activity focus" },
  context_costs: { zh: "情境成本", en: "Context costs" },
  misread_guardrails: { zh: "阅读边界", en: "Reading guardrails" },
  validation_questions: { zh: "验证问题", en: "Questions to explore" },
  chemistry: { zh: "组合关系", en: "Combination pattern" },
  micro_experiment: { zh: "小实验", en: "Small experiment" },
  result_page_teaser: { zh: "结果提示", en: "Result note" },
  deep_report_extension_hint: { zh: "深入阅读", en: "Further reading" },
  copy: { zh: "阅读提示", en: "Reading note" },
};

export function RiasecResultShell({
  locale,
  viewModel,
  attemptId,
}: {
  locale: Locale;
  viewModel: RiasecResultViewModel;
  attemptId?: string | null;
}) {
  const isZh = locale === "zh";
  const [shareState, setShareState] = useState<"idle" | "loading" | "copied" | "failed">("idle");
  const trackingPayload = useMemo(
    () => buildRiasecTrustedResultTrackingPayload(viewModel, locale),
    [locale, viewModel]
  );
  const enhancedVisible =
    Object.keys(viewModel.enhancedBreakdown.activity).length > 0 ||
    Object.keys(viewModel.enhancedBreakdown.environment).length > 0 ||
    Object.keys(viewModel.enhancedBreakdown.role).length > 0;
  const canonicalSlug = SCALE_CANONICAL_SLUG_MAP.RIASEC;
  const retakeHref = buildRiasecTakeHref(canonicalSlug, locale, viewModel.formCode);
  const historyHref = localizedPath("/history/riasec", locale);
  const formLabel =
    viewModel.formLabel || (viewModel.formCode ? getRiasecVariantLabel(viewModel.formCode, locale) : null);
  const heroVisibility = getRiasecModuleVisibility(viewModel, "hero_activity_chain");
  const dimensionMapVisibility = getRiasecModuleVisibility(viewModel, "six_dimension_map");
  const activityExplorerVisibility = getRiasecModuleVisibility(viewModel, "activity_explorer");
  const occupationExamplesVisibility = getRiasecModuleVisibility(viewModel, "occupation_examples");
  const contextCardsVisibility = getRiasecModuleVisibility(viewModel, "140q_context_cards");
  const shareVisibility = getRiasecModuleVisibility(viewModel, "share_card");
  const historyVisibility = getRiasecModuleVisibility(viewModel, "history");
  const showHeroReading = heroVisibility !== "hidden";
  const showDimensionMap = dimensionMapVisibility !== "hidden";
  const showActivityExplorer = activityExplorerVisibility !== "hidden";
  const showOccupationExamples = occupationExamplesVisibility !== "hidden";
  const showContextCards = contextCardsVisibility !== "hidden";
  const showShareAction = shareVisibility !== "hidden";
  const showHistoryAction = historyVisibility !== "hidden";
  const deepContentSlots = getRenderableRiasecDeepContentSlots(viewModel);
  const formMeta = [
    formLabel,
    typeof viewModel.questionCount === "number" ? `${viewModel.questionCount}${isZh ? " 题" : " questions"}` : "",
    typeof viewModel.estimatedMinutes === "number" ? `${isZh ? "约 " : "about "}${viewModel.estimatedMinutes}${isZh ? " 分钟" : " minutes"}` : "",
  ].filter(Boolean).join(" · ");
  const trustedCard = viewModel.trustedResultCard;
  const boundaryRows = trustedCard
    ? [
        [isZh ? "解读边界" : "Interpretation boundary", trustedCard.scoreSpaceVersion ? (isZh ? "按本次题型独立解读" : "Interpreted within this form") : ""],
        [isZh ? "作答校验" : "Response check", trustedCard.qualityRuleStatus ? formatRiasecQualityRule(trustedCard.qualityRuleStatus, locale) : ""],
        [isZh ? "报告快照" : "Snapshot", trustedCard.snapshotBound ? (isZh ? "已绑定" : "bound") : (isZh ? "未绑定" : "not bound")],
        [isZh ? "跨表分数对比" : "Cross-form numeric compare", trustedCard.rawScoreDeltaAllowed ? (isZh ? "开启" : "enabled") : (isZh ? "关闭" : "disabled")],
      ].filter(([, value]) => Boolean(value))
    : [];

  useEffect(() => {
    trackObservableFunnelEvent(
      TRACKING_EVENTS.VIEW_RESULT,
      buildRiasecViewResultTrackingPayload({
        viewModel,
        locale,
        attemptId,
      })
    );
    trackEvent(RIASEC_TRACKING_EVENTS.resultView, trackingPayload);
  }, [attemptId, locale, trackingPayload, viewModel]);

  useEffect(() => {
    if (!viewModel.activityExplorer) {
      return;
    }

    trackEvent(RIASEC_TRACKING_EVENTS.activityExplorerView, trackingPayload);
  }, [trackingPayload, viewModel.activityExplorer]);

  useEffect(() => {
    if (!viewModel.feedbackOverlay) {
      return;
    }

    trackEvent(RIASEC_TRACKING_EVENTS.feedbackOverlayView, trackingPayload);
  }, [trackingPayload, viewModel.feedbackOverlay]);

  async function handleShare() {
    if (!attemptId || shareState === "loading") {
      setShareState("failed");
      return;
    }

    setShareState("loading");
    try {
      const response = await createAttemptShare({ attemptId, locale });
      const rawUrl = String(response.share_url ?? response.shareUrl ?? response.url ?? "").trim();
      if (!rawUrl) {
        throw new Error("share_url_missing");
      }

      trackEvent(RIASEC_TRACKING_EVENTS.shareView, trackingPayload);

      const shareUrl = typeof window === "undefined" ? rawUrl : new URL(rawUrl, window.location.origin).toString();
      const shareTitle = isZh ? "分享我的 RIASEC 职业兴趣结果" : "Share my RIASEC career interest result";

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl });
        setShareState("idle");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareState("copied");
        return;
      }

      throw new Error("share_transport_missing");
    } catch {
      setShareState("failed");
    }
  }

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      <section
        data-testid="riasec-trusted-result-card"
        className="rounded-2xl border border-[var(--fm-border)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]"
      >
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
          {isZh ? "3 分钟结果卡" : "3-minute result card"}
        </div>
        <h1 className="mt-[var(--fm-space-2)] text-4xl font-bold text-[var(--fm-text)]">
          {viewModel.interpretationState?.tieDisplay?.headline || viewModel.topCode}
        </h1>
        {formMeta ? (
          <p className="mt-[var(--fm-space-2)] text-sm font-medium text-[var(--fm-text-muted)]">{formMeta}</p>
        ) : null}
        {showHeroReading ? (
          <p className="mt-[var(--fm-space-3)] max-w-3xl text-base leading-7 text-[var(--fm-text-muted)]">
            {viewModel.interpretationState?.tieDisplay?.note || (isZh
              ? `本次较突出的兴趣维度包括 ${viewModel.primaryType}、${viewModel.secondaryType}、${viewModel.tertiaryType}。`
              : `The more prominent dimensions in this result include ${viewModel.primaryType}, ${viewModel.secondaryType}, and ${viewModel.tertiaryType}.`)}
          </p>
        ) : null}
        {viewModel.interpretationState?.tieDisplay?.alternateCodes.length ? (
          <p className="mt-2 text-sm text-[var(--fm-text-muted)]">
            {isZh ? "可同时参考的阅读顺序" : "Additional reading order"}: {viewModel.interpretationState.tieDisplay.alternateCodes.join(" / ")}
          </p>
        ) : null}
        {viewModel.interpretationState?.tieDisplay?.boundary ? (
          <p className="mt-2 text-xs leading-5 text-[var(--fm-text-muted)]">{viewModel.interpretationState.tieDisplay.boundary}</p>
        ) : null}
        {boundaryRows.length > 0 ? (
          <dl className="mt-[var(--fm-space-5)] grid gap-3 sm:grid-cols-2" data-testid="riasec-measurement-boundary">
            {boundaryRows.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[var(--fm-border)] bg-slate-50 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">{label}</dt>
                <dd className="mt-1 break-words text-sm font-medium text-[var(--fm-text)]">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {trustedCard?.occupationExamplesPolicy ? (
          <p className="mt-[var(--fm-space-3)] text-sm leading-6 text-[var(--fm-text-muted)]">
            {formatRiasecOccupationPolicy(trustedCard.occupationExamplesPolicy, locale)}
          </p>
        ) : null}
        {viewModel.qualityDisplay ? (
          <section className="mt-[var(--fm-space-4)] rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" data-testid="riasec-quality-display">
            <h2 className="font-semibold">{viewModel.qualityDisplay.headline}</h2>
            {viewModel.qualityDisplay.reasons.length > 0 ? (
              <div className="mt-3">
                <div className="font-medium">{isZh ? "为什么会有这条提示" : "Why this note appears"}</div>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {viewModel.qualityDisplay.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            ) : null}
            {viewModel.qualityDisplay.improvements.length > 0 ? (
              <div className="mt-3">
                <div className="font-medium">{isZh ? "如何让下次结果更稳定" : "How to improve a future result"}</div>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {viewModel.qualityDisplay.improvements.map((improvement) => <li key={improvement}>{improvement}</li>)}
                </ul>
              </div>
            ) : null}
            {viewModel.qualityDisplay.readingBoundary ? <p className="mt-3 text-amber-800">{viewModel.qualityDisplay.readingBoundary}</p> : null}
          </section>
        ) : null}
        <div className="mt-[var(--fm-space-5)] flex flex-wrap gap-3">
          {showShareAction ? (
            <Button type="button" variant="secondary" onClick={() => void handleShare()} disabled={shareState === "loading"}>
              {shareState === "loading"
                ? isZh ? "生成分享链接..." : "Preparing share..."
                : shareState === "copied"
                  ? isZh ? "分享链接已复制" : "Link copied"
                  : shareState === "failed"
                    ? isZh ? "重试分享" : "Retry share"
                    : isZh ? "分享结果" : "Share result"}
            </Button>
          ) : null}
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重新测试" : "Retake test"}
          </Link>
          {showHistoryAction ? (
            <Link href={historyHref} className={buttonVariants({ variant: "ghost" })}>
              {isZh ? "查看历史记录" : "View history"}
            </Link>
          ) : null}
        </div>
      </section>

      {showDimensionMap ? (
        <Card data-testid="riasec-six-dimension-map">
          <CardHeader>
            <CardTitle>{isZh ? "六维兴趣地图" : "Six-dimension interest map"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-[var(--fm-gap-sm)]">
            {viewModel.dimensions.map((dimension) => (
              <div key={dimension.code} className="space-y-2" data-testid={`riasec-dimension-${dimension.code}`}>
                <div className="flex items-center justify-between gap-[var(--fm-gap-sm)] text-sm font-semibold">
                  <span>{dimension.code} · {dimension.label}</span>
                  <span>{Math.round(dimension.score)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[var(--fm-trust-blue)]" style={{ width: `${Math.max(0, Math.min(100, dimension.score))}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {deepContentSlots.length > 0 ? (
        <RiasecDeepContentSlotsSection slots={deepContentSlots} isZh={isZh} />
      ) : null}

      {showActivityExplorer ? (
      <Card data-testid="riasec-governed-copy-surface">
        <CardHeader>
          <CardTitle>{isZh ? "职业活动探索" : "Career activity explorer"}</CardTitle>
        </CardHeader>
        <CardContent>
          {viewModel.activityExplorer ? (
            <div className="space-y-[var(--fm-gap-md)]">
              <div className="rounded-lg border border-[var(--fm-border)] bg-slate-50 px-3 py-2 text-sm text-[var(--fm-text-muted)]">
                <span className="font-medium text-[var(--fm-text)]">
                  {formatRiasecSourceStatus(viewModel.activityExplorer.sourceStatus, locale)}
                </span>
                {viewModel.activityExplorer.occupationExamplesPolicy ? (
                  <span> · {formatRiasecOccupationPolicy(viewModel.activityExplorer.occupationExamplesPolicy, locale)}</span>
                ) : null}
              </div>
              {viewModel.activityExplorer.dimensionActivityFamilies.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3" data-testid="riasec-activity-families">
                  {viewModel.activityExplorer.dimensionActivityFamilies.map((family) => (
                    <section key={family.dimension} className="rounded-lg border border-[var(--fm-border)] p-3">
                      <div className="text-sm font-semibold text-[var(--fm-text)]">
                        {family.dimension} · {sanitizeRiasecRenderableText(family.label) || family.dimension}
                      </div>
                      {family.coreDrive ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                          {sanitizeRiasecRenderableText(family.coreDrive)}
                        </p>
                      ) : null}
                      {family.activityFamilies.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {family.activityFamilies.map((activityFamily) => formatRiasecActivityFamily(activityFamily, locale)).filter(Boolean).map((activityFamily) => (
                            <span key={activityFamily} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-[var(--fm-text-muted)]">
                              {activityFamily}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ))}
                </div>
              ) : null}
              {viewModel.activityExplorer.codeActivityPack.activities.length > 0 ? (
                <div className="space-y-3" data-testid="riasec-activity-pack">
                  {viewModel.activityExplorer.codeActivityPack.activities.map((activity) => (
                    <section key={activity.activityKey} className="rounded-lg border border-[var(--fm-border)] p-3">
                      <div className="text-sm font-semibold text-[var(--fm-text)]">
                        {formatRiasecActivityLabel(activity.activityLabel, activity.activityKey, locale)}
                      </div>
                      {activity.activityUserCopy ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                          {sanitizeRiasecRenderableText(activity.activityUserCopy)}
                        </p>
                      ) : null}
                      {activity.taskExamples.length > 0 ? (
                        <div className="mt-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                            {isZh ? "任务例子" : "Task examples"}
                          </div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                            {activity.taskExamples.map((task) => formatRiasecDetailValue(task)).filter(Boolean).map((task) => (
                              <li key={task}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {showOccupationExamples && activity.occupationExamples.length > 0 ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2" data-testid="riasec-occupation-examples">
                          {activity.occupationExamples.map((example) => (
                            <article key={example.occupationExample} className="rounded-lg border border-[var(--fm-border)] bg-white p-3">
                              <div className="text-sm font-semibold text-[var(--fm-text)]">
                                {sanitizeRiasecRenderableText(example.occupationExample)}
                              </div>
                              <div className="mt-1 text-xs text-[var(--fm-text-muted)]">
                                {sanitizeRiasecRenderableText(example.displayLabel) || formatRiasecSourceStatus(example.sourceStatus, locale)}
                              </div>
                              {example.commonTasks.length > 0 ? (
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--fm-text-muted)]">
                                  {example.commonTasks.map((task) => formatRiasecDetailValue(task)).filter(Boolean).map((task) => (
                                    <li key={task}>{task}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--fm-text-muted)]" data-testid="riasec-governed-copy-empty">
                  {isZh ? "当前结果没有可渲染的后端活动内容。" : "No backend-governed activity content is available for this result."}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--fm-text-muted)]" data-testid="riasec-governed-copy-empty">
              {isZh ? "当前结果没有可渲染的后端活动内容。" : "No backend-governed activity content is available for this result."}
            </p>
          )}
        </CardContent>
      </Card>
      ) : null}

      {showContextCards && enhancedVisible ? (
        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "增强版分层结果" : "Enhanced form breakdown"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-[var(--fm-gap-sm)] md:grid-cols-3">
            {[
              [isZh ? "活动兴趣" : "Activity", viewModel.enhancedBreakdown.activity],
              [isZh ? "环境偏好" : "Environment", viewModel.enhancedBreakdown.environment],
              [isZh ? "角色偏好" : "Role", viewModel.enhancedBreakdown.role],
            ].map(([label, values]) => (
              <div key={String(label)} className="rounded-xl border border-[var(--fm-border)] p-[var(--fm-space-4)]">
                <div className="text-sm font-semibold text-[var(--fm-text)]">{String(label)}</div>
                <div className="mt-[var(--fm-space-3)] space-y-2 text-sm text-[var(--fm-text-muted)]">
                  {Object.entries(values as Record<string, number>).map(([code, value]) => (
                    <div key={code} className="flex justify-between">
                      <span>{code}</span>
                      <span>{Math.round(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function RiasecDeepContentSlotsSection({
  slots,
  isZh,
}: {
  slots: RiasecDeepContentSlot[];
  isZh: boolean;
}) {
  const boundary = slots
    .map((slot) => sanitizeRiasecRenderableText(slot.boundaries.userVisibleBoundary))
    .find(Boolean);

  return (
    <Card data-testid="riasec-deep-content-slots">
      <CardHeader>
        <CardTitle>{isZh ? "深度内容" : "Deep content"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-[var(--fm-gap-sm)]">
        {slots.map((slot) => (
          <RiasecDeepContentSlotCard key={slot.slotId || `${slot.slotKey}-${slot.moduleKey}`} slot={slot} isZh={isZh} />
        ))}
        {boundary ? (
          <p className="text-xs leading-5 text-[var(--fm-text-muted)]" data-testid="riasec-deep-content-boundary">{boundary}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RiasecDeepContentSlotCard({ slot, isZh }: { slot: RiasecDeepContentSlot; isZh: boolean }) {
  const [expanded, setExpanded] = useState(!slot.selection || slot.selection.isTopThree);
  const { content } = slot;
  const title = sanitizeRiasecRenderableText(content.title);
  const summary = sanitizeRiasecRenderableText(content.summary);
  const body = sanitizeRiasecRenderableText(content.body);
  const detailEntries = Object.entries(content)
    .filter(([key]) => !["title", "summary", "body"].includes(key))
    .map(([key, value]) => {
      const label = formatDeepContentKey(key, isZh);
      const values = Array.isArray(value)
        ? value.map((item) => formatRiasecDetailValue(item)).filter(Boolean)
        : formatRiasecDetailValue(value);

      return { key, label, values };
    })
    .filter(({ label, values }) => Boolean(label) && (Array.isArray(values) ? values.length > 0 : Boolean(values)));

  return (
    <section
      className="rounded-lg border border-[var(--fm-border)] bg-white p-3"
      data-testid="riasec-deep-content-slot"
    >
      <div>
        <button
          type="button"
          className="w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-expanded={expanded}
          aria-controls={`riasec-slot-${slot.slotId.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
          onClick={() => setExpanded((value) => !value)}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {title ? <h3 className="text-sm font-semibold text-[var(--fm-text)]">{title}</h3> : null}
              {summary ? <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{summary}</p> : null}
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-[var(--fm-text-muted)]">
              {slot.selection
                ? slot.selection.isTopThree
                  ? isZh ? "重点维度" : "Key dimension"
                  : isZh ? "更多维度" : "More dimensions"
                : formatRiasecSlotVisibility(slot.slotVisibility, isZh ? "zh" : "en")}
            </span>
          </div>
        </button>
        <div id={`riasec-slot-${slot.slotId.replace(/[^a-zA-Z0-9_-]/g, "-")}`} hidden={!expanded}>
        {body ? <p className="mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">{body}</p> : null}
        {detailEntries.length > 0 ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {detailEntries.map(({ key, label, values }) => (
              <div key={key} className="rounded-md bg-slate-50 px-3 py-2">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">{label}</div>
                {Array.isArray(values) ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                    {values.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{values}</p>}
              </div>
            ))}
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}

function formatDeepContentKey(key: string, isZh: boolean): string {
  const label = RIASEC_DEEP_CONTENT_LABELS[key];
  return label ? label[isZh ? "zh" : "en"] : "";
}

function formatRiasecQualityRule(value: string, locale: Locale): string {
  if (value === "minimal_answer_completion_only") {
    return locale === "zh" ? "已完成基础作答完整性校验" : "Basic answer-completion check passed";
  }

  return locale === "zh" ? "已完成作答校验" : "Response check complete";
}

function formatRiasecOccupationPolicy(value: string, locale: Locale): string {
  if (value.includes("content_example_not_registry_match")) {
    return locale === "zh"
      ? "职业例子仅用于说明兴趣线索，不代表职业数据库匹配或推荐。"
      : "Occupation examples illustrate interest signals only; they are not database matches or recommendations.";
  }

  return locale === "zh"
    ? "职业例子仅作边界说明。"
    : "Occupation examples are boundary-only examples.";
}

function formatRiasecSourceStatus(value: string, locale: Locale): string {
  if (value === "content_example_not_registry_match") {
    return locale === "zh" ? "内容示例，非职业数据库匹配" : "Content example, not an occupation database match";
  }

  return locale === "zh" ? "后端内容示例" : "Backend content example";
}

function formatRiasecActivityFamily(value: string, locale: Locale): string {
  const labels: Record<string, { zh: string; en: string }> = {
    physical_implementation: { zh: "实物操作", en: "Hands-on implementation" },
    tools_and_equipment: { zh: "工具与设备", en: "Tools and equipment" },
    field_troubleshooting: { zh: "现场排查", en: "Field troubleshooting" },
    prototypes_and_tangible_outputs: { zh: "原型与实物产出", en: "Prototypes and tangible outputs" },
    hands_on_systems: { zh: "动手系统", en: "Hands-on systems" },
    analyze_complex_problems: { zh: "复杂问题分析", en: "Complex problem analysis" },
    organize_evidence_materials: { zh: "证据材料整理", en: "Evidence organization" },
    model_systems: { zh: "系统建模", en: "Systems modeling" },
    test_hypotheses: { zh: "假设检验", en: "Hypothesis testing" },
    research_and_explain: { zh: "研究与解释", en: "Research and explanation" },
  };
  const label = labels[value];
  if (label) {
    return label[locale];
  }

  if (!value || /_/.test(value)) {
    return "";
  }

  return value;
}

function formatRiasecActivityLabel(label: string, key: string, locale: Locale): string {
  return (
    sanitizeRiasecRenderableText(label) ||
    formatRiasecActivityFamily(key, locale) ||
    (locale === "zh" ? "活动示例" : "Activity example")
  );
}

function formatRiasecSlotVisibility(value: string, locale: Locale): string {
  if (value === "visible") {
    return locale === "zh" ? "可阅读" : "available";
  }

  if (value === "collapsed") {
    return locale === "zh" ? "摘要" : "summary";
  }

  return locale === "zh" ? "内容" : "content";
}

function formatRiasecDetailValue(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = sanitizeRiasecRenderableText(value);
  if (!trimmed || /(?:[a-z]+_){1,}[a-z0-9]+/.test(trimmed)) {
    return "";
  }

  return trimmed;
}

function sanitizeRiasecRenderableText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  let text = value.trim();
  if (/^(?:visible|collapsed)$/i.test(text)) {
    return "";
  }

  for (const pattern of RIASEC_DEBUG_RENDER_PATTERNS) {
    text = text.replace(pattern, "");
  }

  return text.replace(/\s{2,}/g, " ").replace(/^[\s:;|,，、-]+|[\s:;|,，、-]+$/g, "").trim();
}
