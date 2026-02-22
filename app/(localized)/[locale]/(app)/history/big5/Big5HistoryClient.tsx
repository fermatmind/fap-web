"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttemptReport } from "@/lib/api/v0_3";
import { fetchBig5History } from "@/lib/big5/api";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type Row = {
  attemptId: string;
  submittedAt: string;
  qualityLevel: string;
  normsVersion: string;
  tags: string[];
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
        const history = await fetchBig5History({ page, pageSize: 10 });
        const items = Array.isArray(history.items) ? history.items : [];

        const enriched = await Promise.all(
          items.map(async (item) => {
            const attemptId = String(item.attempt_id ?? "");
            let qualityLevel = "unknown";
            let normsVersion = "unknown";
            let tags: string[] = [];

            if (attemptId) {
              try {
                const report = await getAttemptReport({ attemptId });
                qualityLevel = String(report.quality?.level ?? "unknown");
                normsVersion = String(report.norms?.norms_version ?? "unknown");

                const sections = Array.isArray(report.report?.sections) ? report.report?.sections : [];
                const topFacetsSection = sections.find((section) => section.key === "top_facets");
                const topBlocks = Array.isArray(topFacetsSection?.blocks) ? topFacetsSection.blocks : [];
                tags = topBlocks
                  .map((block) => String(block.title ?? "").trim())
                  .filter(Boolean)
                  .slice(0, 3);
              } catch {
                // Keep fallback values.
              }
            }

            return {
              attemptId,
              submittedAt: String(item.submitted_at ?? ""),
              qualityLevel,
              normsVersion,
              tags,
            } as Row;
          })
        );

        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(enriched);
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
  }, [page]);

  const compareLink = useMemo(() => {
    if (rows.length < 2) return null;
    return localizedPath(`/history/big5/compare?current=${rows[0].attemptId}&previous=${rows[1].attemptId}`, locale);
  }, [locale, rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">BIG5 History</h1>
        {compareLink ? (
          <Link href={compareLink} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            Compare latest two
          </Link>
        ) : null}
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? <Card><CardContent className="py-6 text-sm text-slate-600">Loading history...</CardContent></Card> : null}

      {!loading && rows.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">No BIG5 attempts found yet.</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {rows.map((row) => (
          <Card key={row.attemptId}>
            <CardHeader>
              <CardTitle className="text-base">{parseDate(row.submittedAt)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p className="m-0">Attempt: {row.attemptId}</p>
              <p className="m-0">Quality: {row.qualityLevel}</p>
              <p className="m-0">Norms version: {row.normsVersion}</p>
              {row.tags.length > 0 ? <p className="m-0">Profile tags: {row.tags.join(", ")}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          Previous page
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
          Next page
        </Button>
      </div>
    </div>
  );
}
