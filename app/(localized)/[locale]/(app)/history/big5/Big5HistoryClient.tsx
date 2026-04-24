"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { createAttemptShare } from "@/lib/api/v0_3";
import { fetchBig5History } from "@/lib/big5/api";
import {
  normalizeBig5HistoryRows,
  resolveBig5CompareAttemptPair,
  type Big5HistoryFacetSummary,
  type Big5HistoryNormsSummary,
  type Big5HistoryOfferSummary,
  type Big5HistoryQualitySummary,
  type Big5HistoryShareSummary,
} from "@/lib/big5/secondarySurfaceNormalizer";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type ShareState = "idle" | "loading" | "copied" | "failed";

type Row = {
  attemptId: string;
  submittedAt: string;
  formCode: string | null;
  formSummaryLabel: string | null;
  topDomains: string[];
  topFacets: Big5HistoryFacetSummary[];
  qualitySummary: Big5HistoryQualitySummary | null;
  normsSummary: Big5HistoryNormsSummary | null;
  offerSummary: Big5HistoryOfferSummary | null;
  shareSummary: Big5HistoryShareSummary | null;
  accessView: AttemptReportAccessView | null;
};

function parseDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
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

function resolveAbsoluteShareUrl(url: string): string {
  if (!url) return "";
  if (typeof window === "undefined") return url;

  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

function resolveShareButtonLabel(locale: "en" | "zh", state: ShareState): string {
  if (state === "loading") {
    return locale === "zh" ? "生成分享链接..." : "Preparing share...";
  }

  if (state === "copied") {
    return locale === "zh" ? "分享链接已复制" : "Link copied";
  }

  if (state === "failed") {
    return locale === "zh" ? "分享失败，重试" : "Share failed, retry";
  }

  return locale === "zh" ? "分享结果" : "Share result";
}

function renderFacetChip(facet: Big5HistoryFacetSummary): string {
  if (typeof facet.percentile === "number") {
    return `${facet.label} · P${facet.percentile}`;
  }

  return facet.label;
}

function renderQualityBadge(locale: "en" | "zh", summary: Big5HistoryQualitySummary | null): string | null {
  if (!summary?.level) return null;
  const badge = summary.grade ?? summary.level;
  return `${locale === "zh" ? "质量" : "Quality"} · ${badge}`;
}

function renderNormsBadge(locale: "en" | "zh", summary: Big5HistoryNormsSummary | null): string | null {
  if (!summary?.status) return null;
  const version = summary.normsVersion ? ` · ${summary.normsVersion}` : "";
  return `${locale === "zh" ? "常模" : "Norms"} · ${summary.status}${version}`;
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
        ? "这里保持单次 history 读取，不额外发 /report 或 /report-access。每条记录会直接展开成结果中心卡片。"
        : "This stays on the single history payload. Each row expands into a compact result-center card without extra /report or /report-access requests.",
    attempt: locale === "zh" ? "测试记录" : "Attempt",
    topDomains: locale === "zh" ? "主导维度" : "Lead domains",
    topFacets: locale === "zh" ? "关键维度面" : "Key facets",
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
  const [comparePair, setComparePair] = useState<{ current: string; previous: string } | null>(null);
  const [shareStateByAttemptId, setShareStateByAttemptId] = useState<Record<string, ShareState>>({});

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
          formCode: row.formCode,
          formSummaryLabel: row.formSummaryLabel,
          topDomains: row.topDomains,
          topFacets: row.topFacets,
          qualitySummary: row.qualitySummary,
          normsSummary: row.normsSummary,
          offerSummary: row.offerSummary,
          shareSummary: row.shareSummary,
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

  async function handleShare(attemptId: string) {
    if (typeof window === "undefined" || shareStateByAttemptId[attemptId] === "loading") {
      return;
    }

    setShareStateByAttemptId((current) => ({
      ...current,
      [attemptId]: "loading",
    }));

    const shareTitle = locale === "zh" ? "分享我的 Big Five 结果" : "Share my BIG5 result";

    try {
      const shareResponse = await createAttemptShare({
        attemptId,
        locale,
      });
      const shareUrl = resolveAbsoluteShareUrl(
        normalizeText(shareResponse.share_url, shareResponse.shareUrl, shareResponse.url)
      );

      if (!shareUrl) {
        throw new Error("share_url_missing");
      }

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        setShareStateByAttemptId((current) => ({
          ...current,
          [attemptId]: "idle",
        }));
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStateByAttemptId((current) => ({
          ...current,
          [attemptId]: "copied",
        }));
        return;
      }

      throw new Error("share_transport_missing");
    } catch {
      setShareStateByAttemptId((current) => ({
        ...current,
        [attemptId]: "failed",
      }));
    }
  }

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
          const shareEnabled = !reportUnavailable && !reportProcessing && (row.shareSummary?.enabled ?? true);
          const shareState = shareStateByAttemptId[row.attemptId] ?? "idle";
          const qualityBadge = renderQualityBadge(locale, row.qualitySummary);
          const normsBadge = renderNormsBadge(locale, row.normsSummary);

          return (
            <Card key={row.attemptId} data-testid={`big5-history-row-${row.attemptId}`}>
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
                        data-testid={`big5-history-row-form-${row.attemptId}`}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {row.formSummaryLabel}
                      </span>
                    ) : null}
                    {qualityBadge ? (
                      <span
                        data-testid={`big5-history-row-quality-${row.attemptId}`}
                        className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {qualityBadge}
                      </span>
                    ) : null}
                    {normsBadge ? (
                      <span
                        data-testid={`big5-history-row-norms-${row.attemptId}`}
                        className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {normsBadge}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                {row.topDomains.length > 0 ? (
                  <p className="m-0">
                    {copy.topDomains}: {row.topDomains.join(", ")}
                  </p>
                ) : null}

                {row.topFacets.length > 0 ? (
                  <div className="space-y-2">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.topFacets}</p>
                    <div className="flex flex-wrap gap-2">
                      {row.topFacets.slice(0, 4).map((facet) => (
                        <span
                          key={`${row.attemptId}-${facet.key}`}
                          data-testid={`big5-history-row-facet-${row.attemptId}-${facet.key}`}
                          className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800"
                        >
                          {renderFacetChip(facet)}
                        </span>
                      ))}
                    </div>
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
                    {compareLink ? (
                      <Link href={compareLink} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        {copy.compareLatest}
                      </Link>
                    ) : null}
                    {shareEnabled ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid={`big5-history-row-share-${row.attemptId}`}
                        onClick={() => void handleShare(row.attemptId)}
                        disabled={shareState === "loading"}
                      >
                        {resolveShareButtonLabel(locale, shareState)}
                      </Button>
                    ) : null}
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
                </div>

                {showUnlockCard && row.offerSummary?.primaryOffer ? (
                  <div className="space-y-3" data-testid={`big5-history-row-offer-${row.attemptId}`}>
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
