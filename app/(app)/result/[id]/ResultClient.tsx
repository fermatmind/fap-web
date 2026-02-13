"use client";

import { useEffect, useState } from "react";
import {
  fetchAttemptReport,
  fetchAttemptResult,
  type ReportResponse,
  type ResultResponse,
} from "@/lib/api/v0_3";
import { getAnonymousId } from "@/lib/analytics";

export default function ResultClient({ attemptId }: { attemptId: string }) {
  const [resultData, setResultData] = useState<ResultResponse | null>(null);
  const [resultLoading, setResultLoading] = useState(true);
  const [resultError, setResultError] = useState<string | null>(null);

  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setResultLoading(true);
      setResultError(null);

      try {
        const anonId = getAnonymousId();
        const response = await fetchAttemptResult({ attemptId, anonId });
        if (!active) return;

        setResultData(response);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Failed to load result.";
        setResultError(message);
      } finally {
        if (active) setResultLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [attemptId]);

  const handleLoadReport = async () => {
    setReportLoading(true);
    setReportError(null);

    try {
      const anonId = getAnonymousId();
      const response = await fetchAttemptReport({ attemptId, anonId });
      setReportData(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load report.";
      setReportError(message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {resultLoading ? <p className="m-0 text-slate-600">Loading result...</p> : null}
      {resultError ? <p className="m-0 text-red-700">{resultError}</p> : null}

      {!resultLoading && !resultError && resultData ? (
        <>
          <div className="space-y-1 text-sm text-slate-700">
            <p className="m-0">
              <strong>meta.scale_code:</strong> {resultData.meta?.scale_code ?? "N/A"}
            </p>
            <p className="m-0">
              <strong>result.type_code:</strong> {resultData.result?.type_code ?? "N/A"}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Result JSON</p>
            <pre className="m-0 max-h-80 overflow-auto text-xs text-slate-700">
              {JSON.stringify(resultData.result ?? null, null, 2)}
            </pre>
          </div>

          <button
            type="button"
            onClick={handleLoadReport}
            disabled={reportLoading}
            className="mt-4 rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
          >
            {reportLoading ? "Loading..." : "Load full report"}
          </button>

          {reportError ? <p className="mt-3 mb-0 text-red-700">{reportError}</p> : null}

          {reportData ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="m-0 text-sm text-slate-700">
                <strong>locked:</strong> {String(reportData.locked ?? null)}
              </p>
              <p className="m-0 text-sm text-slate-700">
                <strong>access_level:</strong> {reportData.access_level ?? "N/A"}
              </p>
              <p className="m-0 text-sm text-slate-700">
                <strong>offers:</strong> {JSON.stringify(reportData.offers ?? null)}
              </p>
              <pre className="mt-3 max-h-80 overflow-auto text-xs text-slate-700">
                {JSON.stringify(reportData.report ?? null, null, 2)}
              </pre>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
