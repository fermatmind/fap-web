"use client";

import { useEffect, useMemo, useState } from "react";
import { buildApiUrl } from "@/lib/api-base";
import {
  LIVE_COMPLETED_COUNT_BASELINE,
  LIVE_COMPLETED_COUNT_METRICS_PATH,
} from "@/lib/marketing/completionStats";

type LiveCompletedCounterProps = {
  className?: string;
  prefix?: string;
  suffix?: string;
};

type PublicTestMetricsSummaryResponse = {
  test_metrics_summary?: {
    cumulative_successful_attempts?: unknown;
  };
};

function normalizeCount(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }

  return Math.floor(numeric);
}

export function LiveCompletedCounter({ className, prefix = "", suffix = "" }: LiveCompletedCounterProps) {
  const [backendSuccessfulAttempts, setBackendSuccessfulAttempts] = useState(0);
  const completedCount = LIVE_COMPLETED_COUNT_BASELINE + backendSuccessfulAttempts;
  const formattedCount = useMemo(() => new Intl.NumberFormat("en-US").format(completedCount), [completedCount]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    fetch(buildApiUrl(LIVE_COMPLETED_COUNT_METRICS_PATH), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: PublicTestMetricsSummaryResponse | null) => {
        if (!isMounted) {
          return;
        }

        setBackendSuccessfulAttempts(
          normalizeCount(payload?.test_metrics_summary?.cumulative_successful_attempts)
        );
      })
      .catch(() => {
        if (isMounted) {
          setBackendSuccessfulAttempts(0);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <span className={className} aria-live="polite">
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}
