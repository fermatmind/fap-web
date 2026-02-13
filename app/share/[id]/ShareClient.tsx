"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getShareSummary, type ShareSummaryResponse } from "@/lib/api/v0_3";
import { captureError } from "@/lib/observability/sentry";

function normalizeDimensions(data: ShareSummaryResponse) {
  return Array.isArray(data.dimensions) ? data.dimensions : [];
}

export default function ShareClient({ shareId }: { shareId: string }) {
  const [data, setData] = useState<ShareSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getShareSummary({ shareId });
        if (!active) return;
        setData(response);
      } catch (cause) {
        if (!active) return;
        const message = cause instanceof Error ? cause.message : "Share not available.";
        setError(message);
        captureError(cause, {
          route: "/share/[id]",
          shareId,
          stage: "load_share_summary",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [shareId]);

  const dimensions = useMemo(() => (data ? normalizeDimensions(data) : []), [data]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Alert>{error ?? "Share not available."}</Alert>
      </main>
    );
  }

  const title = data.title ?? "Shared summary";
  const summary = data.summary ?? "No summary available.";
  const typeCode = data.typeCode;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeCode ? <p className="m-0 text-sm text-slate-700">Type: {typeCode}</p> : null}
          <p className="m-0 text-sm text-slate-700">{summary}</p>

          {dimensions.length ? (
            <div className="space-y-3">
              {dimensions.map((item, index) => {
                const label =
                  typeof item.label === "string"
                    ? item.label
                    : typeof item.code === "string"
                    ? item.code
                    : `Dimension ${index + 1}`;
                const raw =
                  typeof item.percent === "number"
                    ? item.percent
                    : typeof item.score === "number"
                    ? item.score
                    : 0;
                const percent = raw > 1 ? raw : raw * 100;

                return (
                  <div key={`${label}-${index}`} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>{label}</span>
                      <span>{Math.max(0, Math.min(100, Math.round(percent)))}%</span>
                    </div>
                    <Progress value={percent} />
                  </div>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
