"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canDownloadReportPdf,
  canEnterReportPage,
  isProjectionLocked,
  isProjectionProcessing,
  isProjectionUnavailable,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
import { fetchEnneagramHistory } from "@/lib/enneagram/api";
import {
  normalizeEnneagramHistoryCompare,
  normalizeEnneagramHistoryRows,
  type EnneagramHistoryCompareSummary,
  type EnneagramHistoryRowSummary,
} from "@/lib/enneagram/secondarySurfaceNormalizer";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type Row = EnneagramHistoryRowSummary & {
  accessView: AttemptReportAccessView | null;
};

function parseDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeHistoryAccessView(
  attemptId: string,
  accessSummary: Record<string, unknown> | null | undefined,
  locale: "en" | "zh"
): AttemptReportAccessView | null {
  if (!accessSummary || typeof accessSummary !== "object" || Array.isArray(accessSummary)) {
    return null;
  }

  return normalizeAttemptReportAccess(
    {
      ok: true,
      attempt_id: attemptId,
      access_state: typeof accessSummary.access_state === "string" ? accessSummary.access_state : "locked",
      report_state: typeof accessSummary.report_state === "string" ? accessSummary.report_state : "unavailable",
      pdf_state: typeof accessSummary.pdf_state === "string" ? accessSummary.pdf_state : "unavailable",
      reason_code: typeof accessSummary.reason_code === "string" ? accessSummary.reason_code : null,
      access_level: typeof accessSummary.access_level === "string" ? accessSummary.access_level : null,
      variant: typeof accessSummary.variant === "string" ? accessSummary.variant : null,
      modules_allowed: Array.isArray(accessSummary.modules_allowed) ? accessSummary.modules_allowed : [],
      modules_preview: Array.isArray(accessSummary.modules_preview) ? accessSummary.modules_preview : [],
      actions:
        accessSummary.actions && typeof accessSummary.actions === "object" && !Array.isArray(accessSummary.actions)
          ? (accessSummary.actions as Record<string, unknown>)
          : {},
    },
    locale
  );
}

function renderTopTypes(row: Row): string {
  if (row.topTypes.length > 0) {
    return row.topTypes
      .map((type) => `${type.rank ? `#${type.rank} ` : ""}${type.label}`)
      .join(", ");
  }

  return row.primaryType?.label ?? "";
}

function observationActionLabel(action: string | null, locale: "en" | "zh"): string {
  switch (action) {
    case "observe_7_days":
      return locale === "zh" ? "继续观察" : "Continue observing";
    case "do_fc144":
      return locale === "zh" ? "可补做 FC144 深度版" : "FC144 follow-up is available";
    case "retest_same_form":
      return locale === "zh" ? "建议重测同一题型" : "Retake the same form";
    case "read_top3":
      return locale === "zh" ? "先阅读 Top3 与方法边界" : "Read Top 3 and the method boundary first";
    case "no_action":
      return locale === "zh" ? "暂无下一步" : "No immediate next step";
    default:
      return action ?? "";
  }
}

export default function EnneagramHistoryClient() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = {
    title: locale === "zh" ? "九型人格历史记录" : "Enneagram History",
    scope:
      locale === "zh"
        ? "查看你已完成的九型人格结果，并继续打开报告或下载 PDF。"
        : "Review completed Enneagram results, reopen reports, or download available PDFs.",
    loading: locale === "zh" ? "正在加载历史记录..." : "Loading history...",
    empty: locale === "zh" ? "还没有九型人格测试记录。" : "No Enneagram attempts found yet.",
    attempt: locale === "zh" ? "测试记录" : "Attempt",
    primaryType: locale === "zh" ? "主型" : "Primary type",
    topTypes: locale === "zh" ? "排序类型" : "Ranked types",
    unlockHeading: locale === "zh" ? "解锁完整模块" : "Unlock full modules",
    unlockBody:
      locale === "zh"
        ? "当前行仍处于预览访问，正式结果页的完整模块仍可解锁。"
        : "This row is still preview-only. The full formal-result modules remain unlockable.",
    viewResult: locale === "zh" ? "打开正式结果页" : "Open formal result",
    viewPreview: locale === "zh" ? "打开结果预览" : "Open result preview",
    checkStatus: locale === "zh" ? "查看结果状态" : "Check result status",
    unavailable: locale === "zh" ? "当前正式结果不可用" : "Formal result unavailable",
    statusReady: locale === "zh" ? "正式结果已就绪" : "Formal result ready",
    statusLocked: locale === "zh" ? "当前仍为预览访问" : "Preview access only",
    statusProcessing: locale === "zh" ? "结果仍在处理中" : "Result still processing",
    statusUnavailable: locale === "zh" ? "结果暂时不可用" : "Result unavailable",
    interpretationScope: locale === "zh" ? "解释状态" : "Interpretation state",
    closeCallPair: locale === "zh" ? "近邻竞争" : "Close call",
    compareHeading: locale === "zh" ? "题型比较边界" : "Compare boundary",
    compareAction: locale === "zh" ? "结果比较" : "Compare results",
    compareAllowed:
      locale === "zh"
        ? "同题型对比条件已满足。前端比较页会在后续 surface 中接入。"
        : "The same-form compare contract is ready. The compare surface will attach in the next UI step.",
    compareBlocked:
      locale === "zh"
        ? "这两次结果来自不同题型。它们都属于 FermatMind 九型模型，但分数空间不同，因此不直接比较数值差异。你可以查看两次 Top3 是否重叠，或回到结果页阅读方法边界。"
        : "These two results come from different forms within the FermatMind Enneagram model, but they do not share the same score space. Review Top 3 overlap or return to the result page for the methodology boundary.",
    observationStatus: locale === "zh" ? "观察状态" : "Observation status",
    observationProgress: locale === "zh" ? "观察进度" : "Observation progress",
    observationConfirmation: locale === "zh" ? "自我观察确认" : "Self-observation confirmation",
    observationNextAction: locale === "zh" ? "下一步建议" : "Suggested next action",
    observationDay7: locale === "zh" ? "Day7 已提交" : "Day 7 submitted",
    previous: locale === "zh" ? "上一页" : "Previous page",
    next: locale === "zh" ? "下一页" : "Next page",
  };

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [compareSummary, setCompareSummary] = useState<EnneagramHistoryCompareSummary | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await fetchEnneagramHistory({ page, pageSize: 10, locale });
        const normalizedRows = normalizeEnneagramHistoryRows(history.items, locale).map((row) => ({
          ...row,
          accessView: normalizeHistoryAccessView(row.attemptId, row.accessSummary ?? null, locale),
        }));
        const normalizedCompare = normalizeEnneagramHistoryCompare(history);
        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(normalizedRows);
        setCompareSummary(normalizedCompare);
        setHasNextPage(Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage);
      } catch (cause) {
        if (!active) return;
        setCompareSummary(null);
        setError(cause instanceof Error ? cause.message : "Failed to load history.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [locale, page]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
        <p className="m-0 text-sm text-slate-600">{copy.scope}</p>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {compareSummary ? (
        <Card data-testid="enneagram-history-compare-guard">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">{copy.compareHeading}</CardTitle>
                <p className="m-0 text-sm text-slate-600">
                  {compareSummary.currentAttemptId && compareSummary.previousAttemptId
                    ? `${compareSummary.currentAttemptId} / ${compareSummary.previousAttemptId}`
                    : copy.compareAction}
                </p>
              </div>
              <Button type="button" variant="outline" disabled={!compareSummary.canCompare}>
                {copy.compareAction}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p
              data-testid="enneagram-history-compare-copy"
              className={compareSummary.canCompare ? "m-0 text-slate-700" : "m-0 text-amber-800"}
            >
              {compareSummary.canCompare ? copy.compareAllowed : copy.compareBlocked}
            </p>
            {compareSummary.reason ? (
              <p className="m-0 text-xs uppercase tracking-[0.12em] text-slate-500">{compareSummary.reason}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{copy.loading}</CardContent>
        </Card>
      ) : null}

      {!loading && rows.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{copy.empty}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {rows.map((row) => {
          const accessView = row.accessView;
          const reportReady = canEnterReportPage(accessView);
          const reportLocked = isProjectionLocked(accessView);
          const reportProcessing = isProjectionProcessing(accessView);
          const reportUnavailable = isProjectionUnavailable(accessView);
          const resultHref = accessView?.actions.pageHref ?? localizedPath(`/result/${row.attemptId}`, locale);
          const resultLabel = reportProcessing ? copy.checkStatus : reportLocked ? copy.viewPreview : copy.viewResult;
          const statusLabel = reportUnavailable
            ? copy.statusUnavailable
            : reportProcessing
              ? copy.statusProcessing
              : reportLocked
                ? copy.statusLocked
                : reportReady
                  ? copy.statusReady
                  : copy.viewResult;
          const showPdf = Boolean(
            accessView && !reportUnavailable && !reportProcessing && (canDownloadReportPdf(accessView) || reportLocked)
          );
          const showUnlockCard = reportLocked && Boolean(row.offerSummary?.primaryOffer);
          const topTypes = renderTopTypes(row);

          return (
            <Card key={row.attemptId} data-testid={`enneagram-history-row-${row.attemptId}`}>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{parseDate(row.submittedAt)}</CardTitle>
                    <p className="m-0 text-sm text-slate-600">
                      {copy.attempt}: {row.attemptId}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.formSummaryLabel ? (
                      <span
                        data-testid={`enneagram-history-row-form-${row.attemptId}`}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {row.formSummaryLabel}
                      </span>
                    ) : null}
                    {row.qualityLevel ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {locale === "zh" ? "质量" : "Quality"} · {row.qualityLevel.toUpperCase()}
                      </span>
                    ) : null}
                    {row.confidenceLabel ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {locale === "zh" ? "置信" : "Confidence"} · {row.confidenceLabel}
                      </span>
                    ) : null}
                    {row.interpretationScope ? (
                      <span
                        data-testid={`enneagram-history-row-scope-${row.attemptId}`}
                        className="inline-flex rounded-full border border-amber-200 bg-amber-50/70 px-3 py-1 text-xs font-semibold text-amber-800"
                      >
                        {copy.interpretationScope} · {row.interpretationScope}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                {row.primaryType ? (
                  <p data-testid={`enneagram-history-row-primary-${row.attemptId}`} className="m-0">
                    {copy.primaryType}: {row.primaryType.label}
                  </p>
                ) : null}

                {topTypes ? (
                  <p data-testid={`enneagram-history-row-top-${row.attemptId}`} className="m-0">
                    {copy.topTypes}: {topTypes}
                  </p>
                ) : null}

                {row.closeCallPair?.typeA && row.closeCallPair?.typeB ? (
                  <p data-testid={`enneagram-history-row-close-call-${row.attemptId}`} className="m-0">
                    {copy.closeCallPair}: {row.closeCallPair.typeA} / {row.closeCallPair.typeB}
                  </p>
                ) : null}

                {row.observationSummary ? (
                  <div
                    data-testid={`enneagram-history-row-observation-${row.attemptId}`}
                    className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"
                  >
                    {row.observationSummary.status ? (
                      <p
                        data-testid={`enneagram-history-row-observation-status-${row.attemptId}`}
                        className="m-0 text-sm text-slate-700"
                      >
                        {copy.observationStatus} · {row.observationSummary.status}
                      </p>
                    ) : null}
                    {row.observationSummary.completionRate !== null ? (
                      <p
                        data-testid={`enneagram-history-row-observation-progress-${row.attemptId}`}
                        className="m-0 text-sm text-slate-700"
                      >
                        {copy.observationProgress} · {row.observationSummary.completionRate}%
                      </p>
                    ) : null}
                    {row.observationSummary.userConfirmedType ? (
                      <p
                        data-testid={`enneagram-history-row-observation-confirmed-${row.attemptId}`}
                        className="m-0 text-sm text-slate-700"
                      >
                        {copy.observationConfirmation} · {row.observationSummary.userConfirmedType}
                      </p>
                    ) : null}
                    {row.observationSummary.suggestedNextAction ? (
                      <p
                        data-testid={`enneagram-history-row-observation-next-${row.attemptId}`}
                        className="m-0 text-sm text-slate-700"
                      >
                        {copy.observationNextAction} ·{" "}
                        {observationActionLabel(row.observationSummary.suggestedNextAction, locale)}
                      </p>
                    ) : null}
                    {row.observationSummary.day7Submitted ? (
                      <p
                        data-testid={`enneagram-history-row-observation-day7-${row.attemptId}`}
                        className="m-0 text-xs uppercase tracking-[0.12em] text-slate-500"
                      >
                        {copy.observationDay7}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{statusLabel}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {!reportUnavailable ? (
                      <Link
                        href={resultHref}
                        className={buttonVariants({ variant: "ghost", size: "sm", className: "text-sky-700 hover:text-sky-800" })}
                      >
                        {resultLabel}
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">{copy.unavailable}</span>
                    )}
                    {showPdf ? (
                      <div data-testid={`enneagram-history-row-pdf-${row.attemptId}`}>
                        <PdfDownloadButton
                          attemptId={row.attemptId}
                          locked={reportLocked}
                          accessProjection={accessView}
                          locale={locale}
                          filenamePrefix="enneagram-report"
                          downloadLabel={row.formSummaryLabel}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {showUnlockCard && row.offerSummary?.primaryOffer ? (
                  <div className="space-y-3" data-testid={`enneagram-history-row-offer-${row.attemptId}`}>
                    <div className="space-y-1">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.unlockHeading}</p>
                      <p className="m-0 text-sm text-slate-600">{copy.unlockBody}</p>
                    </div>
                    <OfferCard offer={row.offerSummary.primaryOffer} locale={locale} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1 || loading}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          {copy.previous}
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
          {copy.next}
        </Button>
      </div>
    </div>
  );
}
