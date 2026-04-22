"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAttemptShare, type MeAttemptItem } from "@/lib/api/v0_3";
import { fetchRiasecHistory } from "@/lib/riasec/api";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { buildRiasecTakeHref } from "@/lib/riasec/forms";

type ShareState = "idle" | "loading" | "copied" | "failed";

type Row = {
  attemptId: string;
  submittedAt: string;
  typeCode: string;
  formCode: string | null;
  formLabel: string | null;
  questionCount: number | null;
  estimatedMinutes: number | null;
  accessSummary: MeAttemptItem["access_summary"] | null;
  shareEnabled: boolean;
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
    if (normalized) return normalized;
  }
  return "";
}

function normalizeNumber(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function normalizeRow(item: MeAttemptItem): Row {
  const form = item.riasec_form_v1;
  return {
    attemptId: String(item.attempt_id ?? ""),
    submittedAt: String(item.submitted_at ?? ""),
    typeCode: normalizeText(item.type_code),
    formCode: normalizeText(form?.form_code) || null,
    formLabel: normalizeText(form?.label, form?.short_label, form?.form_code) || null,
    questionCount: normalizeNumber(form?.question_count),
    estimatedMinutes: normalizeNumber(form?.estimated_minutes),
    accessSummary: item.access_summary ?? null,
    shareEnabled: item.share_summary?.enabled !== false,
  };
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

function resolveShareLabel(locale: "en" | "zh", state: ShareState): string {
  if (state === "loading") return locale === "zh" ? "生成分享链接..." : "Preparing share...";
  if (state === "copied") return locale === "zh" ? "分享链接已复制" : "Link copied";
  if (state === "failed") return locale === "zh" ? "分享失败，重试" : "Share failed, retry";
  return locale === "zh" ? "分享结果" : "Share result";
}

export default function RiasecHistoryClient() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = {
    title: locale === "zh" ? "RIASEC 历史记录" : "RIASEC History",
    scope:
      locale === "zh"
        ? "这里读取后端已完成的 RIASEC 作答记录，并保留正式结果页、分享和重新测试入口。"
        : "This reads completed RIASEC attempts from backend history and keeps formal result, share, and retake entry points.",
    loading: locale === "zh" ? "正在加载历史记录..." : "Loading history...",
    empty: locale === "zh" ? "还没有 RIASEC 测试记录。" : "No RIASEC attempts found yet.",
    attempt: locale === "zh" ? "测试记录" : "Attempt",
    topCode: locale === "zh" ? "霍兰德主码" : "Holland code",
    viewResult: locale === "zh" ? "打开正式结果页" : "Open formal result",
    retake: locale === "zh" ? "重新测试" : "Retake test",
    previous: locale === "zh" ? "上一页" : "Previous page",
    next: locale === "zh" ? "下一页" : "Next page",
  };

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [shareStateByAttemptId, setShareStateByAttemptId] = useState<Record<string, ShareState>>({});

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await fetchRiasecHistory({ page, pageSize: 10, locale });
        const normalizedRows = (history.items ?? []).map(normalizeRow).filter((row) => row.attemptId);
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
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [locale, page]);

  async function handleShare(attemptId: string) {
    if (typeof window === "undefined" || shareStateByAttemptId[attemptId] === "loading") {
      return;
    }

    setShareStateByAttemptId((current) => ({ ...current, [attemptId]: "loading" }));
    const shareTitle = locale === "zh" ? "分享我的 RIASEC 职业兴趣结果" : "Share my RIASEC career interest result";

    try {
      const shareResponse = await createAttemptShare({ attemptId, locale });
      const shareUrl = resolveAbsoluteShareUrl(
        normalizeText(shareResponse.share_url, shareResponse.shareUrl, shareResponse.url)
      );
      if (!shareUrl) throw new Error("share_url_missing");

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl });
        setShareStateByAttemptId((current) => ({ ...current, [attemptId]: "idle" }));
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStateByAttemptId((current) => ({ ...current, [attemptId]: "copied" }));
        return;
      }

      throw new Error("share_transport_missing");
    } catch {
      setShareStateByAttemptId((current) => ({ ...current, [attemptId]: "failed" }));
    }
  }

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
          const resultHref = row.accessSummary?.actions?.page_href || localizedPath(`/result/${row.attemptId}`, locale);
          const retakeHref = buildRiasecTakeHref(SCALE_CANONICAL_SLUG_MAP.RIASEC, locale, row.formCode ?? undefined);
          const shareState = shareStateByAttemptId[row.attemptId] ?? "idle";
          const formMeta = [
            row.formLabel,
            typeof row.questionCount === "number" ? `${row.questionCount}${locale === "zh" ? " 题" : " questions"}` : "",
            typeof row.estimatedMinutes === "number" ? `${locale === "zh" ? "约 " : "about "}${row.estimatedMinutes}${locale === "zh" ? " 分钟" : " minutes"}` : "",
          ].filter(Boolean).join(" · ");

          return (
            <Card key={row.attemptId} data-testid={`riasec-history-row-${row.attemptId}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{parseDate(row.submittedAt)}</CardTitle>
                    <p className="m-0 text-sm text-slate-600">
                      {copy.attempt}: {row.attemptId}
                    </p>
                  </div>
                  {formMeta ? (
                    <span
                      data-testid={`riasec-history-row-form-${row.attemptId}`}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {formMeta}
                    </span>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                {row.typeCode ? (
                  <p className="m-0" data-testid={`riasec-history-row-code-${row.attemptId}`}>
                    {copy.topCode}: {row.typeCode}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={resultHref} className={buttonVariants({ size: "sm" })}>
                    {copy.viewResult}
                  </Link>
                  {row.shareEnabled ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      data-testid={`riasec-history-row-share-${row.attemptId}`}
                      onClick={() => void handleShare(row.attemptId)}
                      disabled={shareState === "loading"}
                    >
                      {resolveShareLabel(locale, shareState)}
                    </Button>
                  ) : null}
                  <Link href={retakeHref} className={buttonVariants({ size: "sm", variant: "outline" })}>
                    {copy.retake}
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          {copy.previous}
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((current) => current + 1)}>
          {copy.next}
        </Button>
      </div>
    </div>
  );
}
