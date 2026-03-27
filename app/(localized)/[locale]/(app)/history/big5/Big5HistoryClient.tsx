"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { fetchBig5History } from "@/lib/big5/api";
import { normalizeBig5HistoryRows, resolveBig5CompareAttemptPair } from "@/lib/big5/secondarySurfaceNormalizer";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type Row = {
  attemptId: string;
  submittedAt: string;
  topDomains: string[];
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
          ? accessSummary.actions as Record<string, unknown>
          : {},
    },
    locale
  );
}

export default function Big5HistoryClient() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = {
    compareLatest: locale === "zh" ? "对比最近两次结果" : "Compare latest two",
    loading: locale === "zh" ? "正在加载历史记录..." : "Loading history...",
    empty: locale === "zh" ? "还没有 Big Five 测试记录。" : "No BIG5 attempts found yet.",
    scope:
      locale === "zh"
        ? "这里保持轻量结果中心列表。每条记录会直接镜像正式结果页的可访问状态，但不会发起额外的 access 请求。"
        : "This stays a lightweight result-center list. Each row mirrors formal-result availability without issuing extra access requests.",
    attempt: locale === "zh" ? "测试记录" : "Attempt",
    topDomains: locale === "zh" ? "主导维度" : "Lead domains",
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
  const [comparePair, setComparePair] = useState<{ current: string; previous: string } | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await fetchBig5History({ page, pageSize: 10 });
        const normalizedRows = normalizeBig5HistoryRows(history.items, locale).map((row) => ({
          attemptId: row.attemptId,
          submittedAt: row.submittedAt,
          topDomains: row.topDomains,
          accessView: normalizeHistoryAccessView(row.attemptId, row.accessSummary ?? null, locale),
        }));
        const pair = resolveBig5CompareAttemptPair(history, "", "");

        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(normalizedRows);
        setComparePair(pair);
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

  const compareLink = useMemo(() => {
    if (!comparePair?.current || !comparePair?.previous) return null;
    return localizedPath(`/history/big5/compare?current=${comparePair.current}&previous=${comparePair.previous}`, locale);
  }, [comparePair, locale]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">BIG5 History</h1>
          <p className="m-0 text-sm text-slate-600">{copy.scope}</p>
        </div>
        {compareLink ? (
          <Link href={compareLink} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            {copy.compareLatest}
          </Link>
        ) : null}
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? <Card><CardContent className="py-6 text-sm text-slate-600">{copy.loading}</CardContent></Card> : null}

      {!loading && rows.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{copy.empty}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {rows.map((row) => (
          <Card key={row.attemptId} data-testid={`big5-history-row-${row.attemptId}`}>
            <CardHeader>
              <CardTitle className="text-base">{parseDate(row.submittedAt)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p className="m-0">{copy.attempt}: {row.attemptId}</p>
              {row.topDomains.length > 0 ? <p className="m-0">{copy.topDomains}: {row.topDomains.join(", ")}</p> : null}
              {(() => {
                const accessView = row.accessView;
                const reportReady = canEnterReportPage(accessView);
                const reportLocked = isProjectionLocked(accessView);
                const reportProcessing = isProjectionProcessing(accessView);
                const reportUnavailable = isProjectionUnavailable(accessView);
                const resultHref = accessView?.actions.pageHref ?? localizedPath(`/result/${row.attemptId}`, locale);
                const resultLabel = reportProcessing
                  ? copy.checkStatus
                  : reportLocked
                    ? copy.viewPreview
                    : copy.viewResult;
                const statusLabel = reportUnavailable
                  ? copy.statusUnavailable
                  : reportProcessing
                    ? copy.statusProcessing
                    : reportLocked
                      ? copy.statusLocked
                      : reportReady
                        ? copy.statusReady
                        : copy.viewResult;
                const showPdf = accessView
                  && !reportUnavailable
                  && !reportProcessing
                  && (canDownloadReportPdf(accessView) || reportLocked);

                return (
                  <>
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{statusLabel}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {!reportUnavailable ? (
                        <Link
                          href={resultHref}
                          className="inline-flex text-sm font-semibold text-sky-700 hover:text-sky-800"
                        >
                          {resultLabel}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-500">{copy.unavailable}</span>
                      )}
                      {showPdf ? (
                        <div data-testid={`big5-history-row-pdf-${row.attemptId}`}>
                          <PdfDownloadButton
                            attemptId={row.attemptId}
                            locked={reportLocked}
                            accessProjection={accessView}
                            locale={locale}
                          />
                        </div>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          {copy.previous}
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
          {copy.next}
        </Button>
      </div>
    </div>
  );
}
