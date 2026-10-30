"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
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
import { fetchBig5History, fetchBig5Report, fetchBig5ReportAccess } from "@/lib/big5/api";
import { normalizeBig5CompareSnapshot, resolveBig5CompareAttemptPair } from "@/lib/big5/secondarySurfaceNormalizer";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type ReportPayload = {
  attemptId: string;
  comparisonKey: string | null;
  domainPercentiles: Record<string, number>;
  facetPercentiles: Record<string, number>;
};

type CompareRow = {
  key: string;
  current: number | null;
  previous: number | null;
  delta: number | null;
  comparable: boolean;
};

export default function Big5CompareClient() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const isZh = locale === "zh";
  const searchParams = useSearchParams();
  const queryCurrent = searchParams.get("current") ?? "";
  const queryPrevious = searchParams.get("previous") ?? "";

  const [current, setCurrent] = useState<ReportPayload | null>(null);
  const [previous, setPrevious] = useState<ReportPayload | null>(null);
  const [accessView, setAccessView] = useState<AttemptReportAccessView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const history =
          queryCurrent.trim() && queryPrevious.trim()
            ? null
            : await fetchBig5History({ pageSize: 2, page: 1 });
        const pair = resolveBig5CompareAttemptPair(history, queryCurrent, queryPrevious);
        if (!pair) {
          throw new Error(locale === "zh" ? "还没有足够的历史记录可供比较。" : "Not enough history records to compare.");
        }

        const accessResponse = await fetchBig5ReportAccess({ attemptId: pair.current, locale }).catch(() => null);
        const nextAccessView = accessResponse ? normalizeAttemptReportAccess(accessResponse, locale) : null;

        if (!canEnterReportPage(nextAccessView)) {
          if (!active) return;

          setAccessView(nextAccessView);
          setCurrent({
            attemptId: pair.current,
            comparisonKey: null,
            domainPercentiles: {},
            facetPercentiles: {},
          });
          setPrevious({
            attemptId: pair.previous,
            comparisonKey: null,
            domainPercentiles: {},
            facetPercentiles: {},
          });
          return;
        }

        const [currentReport, previousReport] = await Promise.all([
          fetchBig5Report({ attemptId: pair.current }),
          fetchBig5Report({ attemptId: pair.previous }),
        ]);

        const currentExtract = normalizeBig5CompareSnapshot(currentReport);
        const previousExtract = normalizeBig5CompareSnapshot(previousReport);

        if (!active) return;

        setAccessView(nextAccessView);
        setCurrent({
          attemptId: pair.current,
          comparisonKey: currentExtract.comparisonKey,
          domainPercentiles: currentExtract.domainPercentiles,
          facetPercentiles: currentExtract.facetPercentiles,
        });
        setPrevious({
          attemptId: pair.previous,
          comparisonKey: previousExtract.comparisonKey,
          domainPercentiles: previousExtract.domainPercentiles,
          facetPercentiles: previousExtract.facetPercentiles,
        });
      } catch (cause) {
        if (!active) return;
        setAccessView(null);
        setError(cause instanceof Error ? cause.message : "Failed to compare attempts.");
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
  }, [locale, queryCurrent, queryPrevious]);

  const sameReference = Boolean(current?.comparisonKey && current.comparisonKey === previous?.comparisonKey);

  const domainDeltaRows = useMemo(() => {
    if (!current || !previous) return [];

    return ["O", "C", "E", "A", "N"].map((domain) => {
      const currRaw = current.domainPercentiles[domain];
      const prevRaw = previous.domainPercentiles[domain];
      const curr = typeof currRaw === "number" ? Math.max(0, Math.min(100, Number(currRaw))) : null;
      const prev = typeof prevRaw === "number" ? Math.max(0, Math.min(100, Number(prevRaw))) : null;
      const comparable = sameReference && curr !== null && prev !== null;
      const delta = comparable ? Number((curr - prev).toFixed(2)) : null;
      return {
        domain,
        current: curr,
        previous: prev,
        delta,
        comparable,
      };
    });
  }, [current, previous, sameReference]);

  const { topChangedFacets: comparableFacets, missingFacetRows: unavailableFacets } = useMemo(() => {
    if (!current || !previous) {
      return {
        topChangedFacets: [] as CompareRow[],
        missingFacetRows: [] as CompareRow[],
      };
    }

    const keys = new Set([...Object.keys(current.facetPercentiles), ...Object.keys(previous.facetPercentiles)]);
    const rows: CompareRow[] = [...keys].map((key) => {
      const currRaw = current.facetPercentiles[key];
      const prevRaw = previous.facetPercentiles[key];
      const curr = typeof currRaw === "number" ? Math.max(0, Math.min(100, Number(currRaw))) : null;
      const prev = typeof prevRaw === "number" ? Math.max(0, Math.min(100, Number(prevRaw))) : null;
      const comparable = sameReference && curr !== null && prev !== null;
      const delta = comparable ? Number((curr - prev).toFixed(2)) : null;

      return {
        key,
        current: curr,
        previous: prev,
        delta,
        comparable,
      };
    });

    const comparableRows = rows
      .filter((row) => row.comparable && row.delta !== null)
      .sort((a, b) => Math.abs((b.delta as number)) - Math.abs((a.delta as number)))
      .slice(0, 8);

    const missingRows = rows
      .filter((row) => !row.comparable)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(0, 8);

    return {
      topChangedFacets: comparableRows,
      missingFacetRows: missingRows,
    };
  }, [current, previous, sameReference]);

  const formatValue = (value: number | null) => (value === null ? "N/A" : String(value));
  const formatDelta = (row: { delta: number | null; comparable: boolean }) => {
    if (!row.comparable || row.delta === null) return "--";
    return `${row.delta > 0 ? "+" : ""}${row.delta}`;
  };
  const resultHref =
    current?.attemptId && (accessView?.actions.pageHref ?? localizedPath(`/result/${current.attemptId}`, locale));
  const pdfReady = canDownloadReportPdf(accessView);
  const reportReady = canEnterReportPage(accessView);
  const reportLocked = isProjectionLocked(accessView);
  const reportProcessing = isProjectionProcessing(accessView);
  const reportUnavailable = isProjectionUnavailable(accessView);
  const hasPreciseComparison = Boolean(
    current && previous && sameReference
    && Object.keys(current.domainPercentiles).length > 0
    && Object.keys(previous.domainPercentiles).length > 0
  );
  const accessHeadline = reportUnavailable
    ? (isZh ? "正式结果暂时不可用" : "Formal result unavailable")
    : reportProcessing
      ? (isZh ? "正式结果仍在处理中" : "Formal result is still processing")
      : reportLocked
        ? (isZh ? "当前结果仍是预览状态" : "Current result is still in preview")
        : reportReady
          ? (isZh ? "正式结果已就绪" : "Formal result ready")
          : (isZh ? "可继续查看正式结果页" : "Continue to the formal result page");
  const accessSummary = reportUnavailable
    ? (isZh
        ? "当前对比页不会伪装成正式结果页。请稍后再试，或回到历史页重新进入。"
        : "This compare view does not replace the formal result page. Please retry later or return to history.")
    : reportProcessing
      ? (isZh
          ? "正式结果仍在生成中。对比数据可以先看，但 PDF 与完整动作会以正式结果页状态为准。"
          : "The formal result is still generating. You can inspect the comparison now, but PDF and full actions still follow the result-page state.")
      : reportLocked
        ? (isZh
            ? "当前记录仅可预览。进入结果页可查看完整内容和 PDF 的实际可用状态。"
            : "This result is available as a preview. Open the result page to check full content and PDF availability.")
        : (isZh
            ? "可继续打开这次完整结果；PDF 是否可用以下载入口显示的状态为准。"
            : "You can open this full result. Check the download entry for PDF availability.");
  const resultCtaLabel = reportLocked
    ? (isZh ? "打开正式结果预览" : "Open formal result preview")
    : reportProcessing
      ? (isZh ? "查看正式结果状态" : "Check formal result status")
      : (isZh ? "打开正式结果页" : "Open formal result");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{isZh ? "大五结果比较" : "Big Five result comparison"}</h1>

      {error ? <Alert>{error}</Alert> : null}
      {loading ? <Card><CardContent className="py-6 text-sm text-slate-600">{isZh ? "正在加载比较资料…" : "Loading comparison…"}</CardContent></Card> : null}

      {current && previous ? (
        <>
          <Card data-testid="big5-compare-access-card">
            <CardHeader>
              <CardTitle>{accessHeadline}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p className="m-0">{accessSummary}</p>
              <div className="flex flex-wrap items-center gap-3">
                {resultHref && !reportUnavailable ? (
                  <Link
                    href={resultHref}
                    className={buttonVariants({ variant: reportReady ? "default" : "outline" })}
                  >
                    {resultCtaLabel}
                  </Link>
                ) : null}
                {accessView && (pdfReady || reportLocked) ? (
                  <div data-testid="big5-compare-pdf-entry">
                    <PdfDownloadButton
                      attemptId={current.attemptId}
                      locked={reportLocked}
                      accessProjection={accessView}
                      locale={locale}
                    />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {reportReady && !hasPreciseComparison ? <Alert>{isZh ? "当前资料不足以在相同题本和参照条件下比较精确百分位。请分别阅读两份结果；这里不推断人格是否变化。" : "These records do not provide comparable precise percentiles for the same form and reference. Read each result separately; this view does not infer personality change."}</Alert> : null}

          {reportReady && hasPreciseComparison ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{isZh ? "维度参照位置差异" : "Domain percentile differences"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  <p className="m-0">{isZh ? "相同题本和参照下的两次自报位置差，不证明能力或人格发生变化。" : "Differences in self-reported positions under the same form and reference do not establish changes in ability or personality."}</p>

                  <div className="grid gap-2">
                    {domainDeltaRows.map((row) => (
                      <div key={row.domain} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 rounded-lg border border-slate-200 px-3 py-2">
                        <span className="font-semibold">{row.domain}</span>
                        <span>{isZh ? "本次" : "Now"} {formatValue(row.current)}</span>
                        <span>{isZh ? "上次" : "Previous"} {formatValue(row.previous)}</span>
                        <span className={!row.comparable ? "text-amber-700" : row.delta && row.delta > 0 ? "text-emerald-700" : row.delta && row.delta < 0 ? "text-rose-700" : "text-slate-600"}>
                          {formatDelta(row)}
                        </span>
                        {!row.comparable ? <span className="col-span-4 text-xs text-amber-700">{isZh ? "不可比较" : "Not comparable"}</span> : null}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isZh ? "位置差异较大的面向" : "Facets with larger position differences"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  {comparableFacets.length === 0 ? (
                    <p className="m-0 text-slate-600">{isZh ? "没有可比较的面向百分位资料。" : "No comparable facet percentile data."}</p>
                  ) : (
                    comparableFacets.map((row) => (
                      <div key={row.key} className="grid grid-cols-[1fr_90px_90px_90px] gap-2 rounded-lg border border-slate-200 px-3 py-2">
                        <span>{row.key}</span>
                        <span>{isZh ? "本次" : "Now"} {formatValue(row.current)}</span>
                        <span>{isZh ? "上次" : "Previous"} {formatValue(row.previous)}</span>
                        <span className={!row.comparable ? "text-amber-700" : row.delta && row.delta > 0 ? "text-emerald-700" : row.delta && row.delta < 0 ? "text-rose-700" : "text-slate-600"}>
                          {formatDelta(row)}
                        </span>
                      </div>
                    ))
                  )}

                  {unavailableFacets.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-amber-700">{isZh ? "面向资料不可用（N/A）" : "Unavailable facets (N/A)"}</p>
                      {unavailableFacets.map((row) => (
                        <div key={`na-${row.key}`} className="grid grid-cols-[1fr_90px_90px_90px] gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                          <span>{row.key}</span>
                          <span>{isZh ? "本次" : "Now"} {formatValue(row.current)}</span>
                          <span>{isZh ? "上次" : "Previous"} {formatValue(row.previous)}</span>
                          <span className="text-amber-700">--</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
