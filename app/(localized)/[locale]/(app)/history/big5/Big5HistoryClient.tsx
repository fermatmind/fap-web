"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBig5History } from "@/lib/big5/api";
import { normalizeBig5HistoryRows, resolveBig5CompareAttemptPair } from "@/lib/big5/secondarySurfaceNormalizer";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type Row = {
  attemptId: string;
  submittedAt: string;
  topDomains: string[];
};

function parseDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
        ? "这里保持轻量历史列表。解锁、PDF 与正式结果动作统一回到正式结果页处理。"
        : "This view stays lightweight. Unlock, PDF, and formal result actions are all handled from the formal result page.",
    attempt: locale === "zh" ? "测试记录" : "Attempt",
    topDomains: locale === "zh" ? "主导维度" : "Lead domains",
    viewResult: locale === "zh" ? "打开正式结果页" : "Open formal result",
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
        const normalizedRows = normalizeBig5HistoryRows(history.items, locale);
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
          <Card key={row.attemptId}>
            <CardHeader>
              <CardTitle className="text-base">{parseDate(row.submittedAt)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p className="m-0">{copy.attempt}: {row.attemptId}</p>
              {row.topDomains.length > 0 ? <p className="m-0">{copy.topDomains}: {row.topDomains.join(", ")}</p> : null}
              <Link
                href={localizedPath(`/result/${row.attemptId}`, locale)}
                className="inline-flex text-sm font-semibold text-sky-700 hover:text-sky-800"
              >
                {copy.viewResult}
              </Link>
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
