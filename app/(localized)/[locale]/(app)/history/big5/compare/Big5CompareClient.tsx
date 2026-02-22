"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttemptReport } from "@/lib/api/v0_3";
import { fetchBig5History } from "@/lib/big5/api";

type ReportPayload = {
  attemptId: string;
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

function parsePercentile(text: string): number | null {
  const matched = text.match(/(?:percentile|百分位)\s*([0-9]{1,3})/i);
  if (!matched) return null;
  const value = Number(matched[1]);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, value));
}

function extractPercentiles(report: unknown): { domainPercentiles: Record<string, number>; facetPercentiles: Record<string, number> } {
  const domainPercentiles: Record<string, number> = {};
  const facetPercentiles: Record<string, number> = {};

  const sections =
    report && typeof report === "object" && Array.isArray((report as { sections?: unknown }).sections)
      ? ((report as { sections: Array<Record<string, unknown>> }).sections ?? [])
      : [];

  const domainSection = sections.find((section) => section.key === "domains_overview");
  const domainBlocks = Array.isArray(domainSection?.blocks) ? domainSection.blocks : [];
  for (const block of domainBlocks) {
    const label = String(block.title ?? block.metric_code ?? "").trim();
    const value = parsePercentile(String(block.body ?? ""));
    if (!label || value === null) continue;

    const code = label.startsWith("O")
      ? "O"
      : label.startsWith("C")
        ? "C"
        : label.startsWith("E")
          ? "E"
          : label.startsWith("A")
            ? "A"
            : label.startsWith("N")
              ? "N"
              : label.slice(0, 1).toUpperCase();

    if (["O", "C", "E", "A", "N"].includes(code)) {
      domainPercentiles[code] = value;
    }
  }

  const facetSection = sections.find((section) => section.key === "facet_table");
  const facetBlocks = Array.isArray(facetSection?.blocks) ? facetSection.blocks : [];
  for (const block of facetBlocks) {
    const code = String(block.metric_code ?? block.title ?? "").trim();
    const value = parsePercentile(String(block.body ?? ""));
    if (!code || value === null) continue;
    facetPercentiles[code] = value;
  }

  return { domainPercentiles, facetPercentiles };
}

async function resolveAttemptIds(queryCurrent: string, queryPrevious: string): Promise<{ current: string; previous: string } | null> {
  if (queryCurrent && queryPrevious) {
    return {
      current: queryCurrent,
      previous: queryPrevious,
    };
  }

  const history = await fetchBig5History({ pageSize: 2, page: 1 });
  const items = Array.isArray(history.items) ? history.items : [];
  if (items.length < 2) return null;

  return {
    current: String(items[0].attempt_id ?? ""),
    previous: String(items[1].attempt_id ?? ""),
  };
}

export default function Big5CompareClient() {
  const searchParams = useSearchParams();
  const queryCurrent = searchParams.get("current") ?? "";
  const queryPrevious = searchParams.get("previous") ?? "";

  const [current, setCurrent] = useState<ReportPayload | null>(null);
  const [previous, setPrevious] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const pair = await resolveAttemptIds(queryCurrent, queryPrevious);
        if (!pair) {
          throw new Error("Not enough history records to compare.");
        }

        const [currentReport, previousReport] = await Promise.all([
          getAttemptReport({ attemptId: pair.current }),
          getAttemptReport({ attemptId: pair.previous }),
        ]);

        const currentExtract = extractPercentiles(currentReport.report);
        const previousExtract = extractPercentiles(previousReport.report);

        if (!active) return;

        setCurrent({
          attemptId: pair.current,
          domainPercentiles: currentExtract.domainPercentiles,
          facetPercentiles: currentExtract.facetPercentiles,
        });
        setPrevious({
          attemptId: pair.previous,
          domainPercentiles: previousExtract.domainPercentiles,
          facetPercentiles: previousExtract.facetPercentiles,
        });
      } catch (cause) {
        if (!active) return;
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
  }, [queryCurrent, queryPrevious]);

  const domainDeltaRows = useMemo(() => {
    if (!current || !previous) return [];

    return ["O", "C", "E", "A", "N"].map((domain) => {
      const currRaw = current.domainPercentiles[domain];
      const prevRaw = previous.domainPercentiles[domain];
      const curr = typeof currRaw === "number" ? Math.max(0, Math.min(100, Number(currRaw))) : null;
      const prev = typeof prevRaw === "number" ? Math.max(0, Math.min(100, Number(prevRaw))) : null;
      const comparable = curr !== null && prev !== null;
      const delta = comparable ? Number((curr - prev).toFixed(2)) : null;
      return {
        domain,
        current: curr,
        previous: prev,
        delta,
        comparable,
      };
    });
  }, [current, previous]);

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
      const comparable = curr !== null && prev !== null;
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
  }, [current, previous]);

  const formatValue = (value: number | null) => (value === null ? "N/A" : String(value));
  const formatDelta = (row: { delta: number | null; comparable: boolean }) => {
    if (!row.comparable || row.delta === null) return "--";
    return `${row.delta > 0 ? "+" : ""}${row.delta}`;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">BIG5 Compare</h1>

      {error ? <Alert>{error}</Alert> : null}
      {loading ? <Card><CardContent className="py-6 text-sm text-slate-600">Loading compare data...</CardContent></Card> : null}

      {current && previous ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Domain percentile delta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p className="m-0">Current: {current.attemptId}</p>
              <p className="m-0">Previous: {previous.attemptId}</p>

              <div className="grid gap-2">
                {domainDeltaRows.map((row) => (
                  <div key={row.domain} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <span className="font-semibold">{row.domain}</span>
                    <span>Now {formatValue(row.current)}</span>
                    <span>Prev {formatValue(row.previous)}</span>
                    <span className={!row.comparable ? "text-amber-700" : row.delta && row.delta > 0 ? "text-emerald-700" : row.delta && row.delta < 0 ? "text-rose-700" : "text-slate-600"}>
                      {formatDelta(row)}
                    </span>
                    {!row.comparable ? <span className="col-span-4 text-xs text-amber-700">Not comparable</span> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top changed facets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {comparableFacets.length === 0 ? (
                <p className="m-0 text-slate-600">No comparable facet percentile data.</p>
              ) : (
                comparableFacets.map((row) => (
                  <div key={row.key} className="grid grid-cols-[1fr_90px_90px_90px] gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <span>{row.key}</span>
                    <span>Now {formatValue(row.current)}</span>
                    <span>Prev {formatValue(row.previous)}</span>
                    <span className={!row.comparable ? "text-amber-700" : row.delta && row.delta > 0 ? "text-emerald-700" : row.delta && row.delta < 0 ? "text-rose-700" : "text-slate-600"}>
                      {formatDelta(row)}
                    </span>
                  </div>
                ))
              )}

              {unavailableFacets.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-amber-700">Unavailable facets (N/A)</p>
                  {unavailableFacets.map((row) => (
                    <div key={`na-${row.key}`} className="grid grid-cols-[1fr_90px_90px_90px] gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <span>{row.key}</span>
                      <span>Now {formatValue(row.current)}</span>
                      <span>Prev {formatValue(row.previous)}</span>
                      <span className="text-amber-700">--</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
