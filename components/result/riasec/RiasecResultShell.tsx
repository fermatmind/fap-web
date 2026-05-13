"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createAttemptShare } from "@/lib/api/v0_3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { buildRiasecTakeHref, getRiasecVariantLabel } from "@/lib/riasec/forms";
import type { RiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import {
  buildRiasecTrustedResultTrackingPayload,
  RIASEC_TRACKING_EVENTS,
} from "@/lib/riasec/tracking";

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
  const formMeta = [
    formLabel,
    typeof viewModel.questionCount === "number" ? `${viewModel.questionCount}${isZh ? " 题" : " questions"}` : "",
    typeof viewModel.estimatedMinutes === "number" ? `${isZh ? "约 " : "about "}${viewModel.estimatedMinutes}${isZh ? " 分钟" : " minutes"}` : "",
  ].filter(Boolean).join(" · ");
  const trustedCard = viewModel.trustedResultCard;
  const boundaryRows = trustedCard
    ? [
        [isZh ? "分数空间" : "Score space", trustedCard.scoreSpaceVersion],
        [isZh ? "质量规则" : "Quality rule", trustedCard.qualityRuleStatus],
        [isZh ? "报告快照" : "Snapshot", trustedCard.snapshotBound ? (isZh ? "已绑定" : "bound") : (isZh ? "未绑定" : "not bound")],
        [isZh ? "跨表分数对比" : "Cross-form numeric compare", trustedCard.rawScoreDeltaAllowed ? (isZh ? "开启" : "enabled") : (isZh ? "关闭" : "disabled")],
      ].filter(([, value]) => Boolean(value))
    : [];

  useEffect(() => {
    trackEvent(RIASEC_TRACKING_EVENTS.resultView, trackingPayload);
  }, [trackingPayload]);

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
        <h1 className="mt-[var(--fm-space-2)] text-4xl font-bold text-[var(--fm-text)]">{viewModel.topCode}</h1>
        {formMeta ? (
          <p className="mt-[var(--fm-space-2)] text-sm font-medium text-[var(--fm-text-muted)]">{formMeta}</p>
        ) : null}
        <p className="mt-[var(--fm-space-3)] max-w-3xl text-base leading-7 text-[var(--fm-text-muted)]">
          {isZh
            ? `你的前三个兴趣维度依次是 ${viewModel.primaryType}、${viewModel.secondaryType}、${viewModel.tertiaryType}。清晰度指数 ${viewModel.clarityIndex}，兴趣广度 ${viewModel.breadthIndex}。`
            : `Your top three interest dimensions are ${viewModel.primaryType}, ${viewModel.secondaryType}, and ${viewModel.tertiaryType}. Clarity index ${viewModel.clarityIndex}, breadth index ${viewModel.breadthIndex}.`}
        </p>
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
            {isZh ? "职业例子策略" : "Occupation example policy"}: {trustedCard.occupationExamplesPolicy}
          </p>
        ) : null}
        {viewModel.qualityGrade !== "A" || viewModel.qualityFlags.length > 0 ? (
          <p className="mt-[var(--fm-space-3)] text-sm text-amber-700">
            {isZh ? "作答质量提示" : "Response quality"}: {viewModel.qualityGrade}
            {viewModel.qualityFlags.length > 0 ? ` · ${viewModel.qualityFlags.join(", ")}` : ""}
          </p>
        ) : null}
        <div className="mt-[var(--fm-space-5)] flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void handleShare()} disabled={shareState === "loading"}>
            {shareState === "loading"
              ? isZh ? "生成分享链接..." : "Preparing share..."
              : shareState === "copied"
                ? isZh ? "分享链接已复制" : "Link copied"
                : shareState === "failed"
                  ? isZh ? "重试分享" : "Retry share"
                  : isZh ? "分享结果" : "Share result"}
          </Button>
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重新测试" : "Retake test"}
          </Link>
          <Link href={historyHref} className={buttonVariants({ variant: "ghost" })}>
            {isZh ? "查看历史记录" : "View history"}
          </Link>
        </div>
      </section>

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

      <Card data-testid="riasec-governed-copy-surface">
        <CardHeader>
          <CardTitle>{isZh ? "职业活动探索" : "Career activity explorer"}</CardTitle>
        </CardHeader>
        <CardContent>
          {viewModel.activityExplorer ? (
            <div className="space-y-[var(--fm-gap-md)]">
              <div className="rounded-lg border border-[var(--fm-border)] bg-slate-50 px-3 py-2 text-sm text-[var(--fm-text-muted)]">
                <span className="font-medium text-[var(--fm-text)]">
                  {viewModel.activityExplorer.sourceStatus}
                </span>
                {viewModel.activityExplorer.occupationExamplesPolicy ? (
                  <span> · {viewModel.activityExplorer.occupationExamplesPolicy}</span>
                ) : null}
              </div>
              {viewModel.activityExplorer.dimensionActivityFamilies.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3" data-testid="riasec-activity-families">
                  {viewModel.activityExplorer.dimensionActivityFamilies.map((family) => (
                    <section key={family.dimension} className="rounded-lg border border-[var(--fm-border)] p-3">
                      <div className="text-sm font-semibold text-[var(--fm-text)]">{family.dimension} · {family.label}</div>
                      {family.coreDrive ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{family.coreDrive}</p>
                      ) : null}
                      {family.activityFamilies.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {family.activityFamilies.map((activityFamily) => (
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
                      <div className="text-sm font-semibold text-[var(--fm-text)]">{activity.activityLabel || activity.activityKey}</div>
                      {activity.activityUserCopy ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{activity.activityUserCopy}</p>
                      ) : null}
                      {activity.taskExamples.length > 0 ? (
                        <div className="mt-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                            {isZh ? "任务例子" : "Task examples"}
                          </div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                            {activity.taskExamples.map((task) => (
                              <li key={task}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {activity.occupationExamples.length > 0 ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2" data-testid="riasec-occupation-examples">
                          {activity.occupationExamples.map((example) => (
                            <article key={example.occupationExample} className="rounded-lg border border-[var(--fm-border)] bg-white p-3">
                              <div className="text-sm font-semibold text-[var(--fm-text)]">{example.occupationExample}</div>
                              <div className="mt-1 text-xs text-[var(--fm-text-muted)]">{example.displayLabel || example.sourceStatus}</div>
                              {example.commonTasks.length > 0 ? (
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--fm-text-muted)]">
                                  {example.commonTasks.map((task) => (
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

      {enhancedVisible ? (
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
