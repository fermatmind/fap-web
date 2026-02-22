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
      const curr = Math.max(0, Math.min(100, Number(current.domainPercentiles[domain] ?? 0)));
      const prev = Math.max(0, Math.min(100, Number(previous.domainPercentiles[domain] ?? 0)));
      const delta = Number((curr - prev).toFixed(2));
      return {
        domain,
        current: curr,
        previous: prev,
        delta,
      };
    });
  }, [current, previous]);

  const topChangedFacets = useMemo(() => {
    if (!current || !previous) return [];

    const keys = new Set([...Object.keys(current.facetPercentiles), ...Object.keys(previous.facetPercentiles)]);

    return [...keys]
      .map((key) => {
        const curr = Math.max(0, Math.min(100, Number(current.facetPercentiles[key] ?? 0)));
        const prev = Math.max(0, Math.min(100, Number(previous.facetPercentiles[key] ?? 0)));
        const delta = Number((curr - prev).toFixed(2));
        return {
          key,
          current: curr,
          previous: prev,
          delta,
          absDelta: Math.abs(delta),
        };
      })
      .sort((a, b) => b.absDelta - a.absDelta)
      .slice(0, 8);
  }, [current, previous]);

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
                    <span>Now {row.current}</span>
                    <span>Prev {row.previous}</span>
                    <span className={row.delta > 0 ? "text-emerald-700" : row.delta < 0 ? "text-rose-700" : "text-slate-600"}>
                      {row.delta > 0 ? "+" : ""}
                      {row.delta}
                    </span>
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
              {topChangedFacets.length === 0 ? (
                <p className="m-0 text-slate-600">No comparable facet percentile data.</p>
              ) : (
                topChangedFacets.map((row) => (
                  <div key={row.key} className="grid grid-cols-[1fr_90px_90px_90px] gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <span>{row.key}</span>
                    <span>Now {row.current}</span>
                    <span>Prev {row.previous}</span>
                    <span className={row.delta > 0 ? "text-emerald-700" : row.delta < 0 ? "text-rose-700" : "text-slate-600"}>
                      {row.delta > 0 ? "+" : ""}
                      {row.delta}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
