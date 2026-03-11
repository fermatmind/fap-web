"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyAttempts, type MeAttemptItem } from "@/lib/api/v0_3";
import { SCALE_CANONICAL_SLUG_MAP, normalizeSupportedScaleCode } from "@/lib/assessmentSlugMap";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type Row = {
  attemptId: string;
  submittedAt: string;
  typeCode: string;
};

function formatSubmittedAt(value: string, locale: "en" | "zh"): string {
  if (!value) return locale === "zh" ? "时间待同步" : "Pending sync";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return locale === "zh"
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolveMbtiRow(item: MeAttemptItem): Row | null {
  const attemptId = String(item.attempt_id ?? "").trim();
  if (!attemptId) return null;

  const normalizedScaleCode = normalizeSupportedScaleCode(String(item.scale_code ?? "").trim());
  if (normalizedScaleCode && normalizedScaleCode !== "MBTI") {
    return null;
  }

  return {
    attemptId,
    submittedAt: String(item.submitted_at ?? ""),
    typeCode: String(item.type_code ?? "").trim() || "MBTI",
  };
}

export default function MbtiHistoryClient() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const isZh = locale === "zh";
  const startTestHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}/take`, locale);

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
        const history = await getMyAttempts({
          scaleCode: "MBTI",
          page,
          pageSize: 10,
        });
        const items = Array.isArray(history.items) ? history.items : [];
        const filteredRows = items
          .map((item) => resolveMbtiRow(item))
          .filter((item): item is Row => item !== null);

        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(filteredRows);
        setHasNextPage(Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage);
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : isZh ? "MBTI 历史加载失败。" : "Failed to load MBTI history.");
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
  }, [isZh, page]);

  return (
    <div data-testid="mbti-history-client" className="space-y-4">
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {isZh ? "MBTI 历史" : "MBTI history"}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{isZh ? "我的 MBTI 报告" : "My MBTI reports"}</h1>
        <p className="m-0 text-sm leading-7 text-slate-600">
          {isZh
            ? "这里保留你已经完成的 MBTI 结果，后续再次进入时直接回到对应报告页。"
            : "This page keeps your completed MBTI results so you can jump straight back into each report."}
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{isZh ? "正在加载 MBTI 历史..." : "Loading MBTI history..."}</CardContent>
        </Card>
      ) : null}

      {!loading && rows.length === 0 ? (
        <Card data-testid="mbti-history-empty">
          <CardContent className="space-y-4 py-6">
            <p className="m-0 text-sm text-slate-600">
              {isZh ? "你还没有可再次进入的 MBTI 报告。" : "You do not have any MBTI reports to revisit yet."}
            </p>
            <Link href={startTestHref} className={buttonVariants({ className: "w-full sm:w-auto" })}>
              {isZh ? "开始 MBTI 测试" : "Start MBTI test"}
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {rows.map((row) => (
          <Card key={row.attemptId} data-testid="mbti-history-card">
            <CardHeader className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {isZh ? "已完成" : "Completed"}
              </p>
              <CardTitle className="text-base text-slate-950">{row.typeCode}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p className="m-0">
                {isZh ? "提交时间：" : "Submitted at: "}
                {formatSubmittedAt(row.submittedAt, locale)}
              </p>
              <p className="m-0">
                {isZh ? "状态：" : "Status: "}
                {isZh ? "可再次查看" : "Ready to revisit"}
              </p>
              <Link
                href={localizedPath(`/result/${row.attemptId}`, locale)}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                data-testid={`mbti-history-open-${row.attemptId}`}
              >
                {isZh ? "查看报告" : "View report"}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          {isZh ? "上一页" : "Previous page"}
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
          {isZh ? "下一页" : "Next page"}
        </Button>
      </div>
    </div>
  );
}
