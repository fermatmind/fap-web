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
  normalizeEnneagramHistoryRows,
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
    previous: locale === "zh" ? "上一页" : "Previous page",
    next: locale === "zh" ? "下一页" : "Next page",
  };

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

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
        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(normalizedRows);
        setHasNextPage(Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage);
      } catch (cause) {
        if (!active) return;
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
