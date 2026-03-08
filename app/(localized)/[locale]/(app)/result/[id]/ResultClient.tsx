"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnticipationSkeleton } from "@/components/design/AnticipationSkeleton";
import { DimensionBars } from "@/components/result/DimensionBars";
import { ResultSummary } from "@/components/result/ResultSummary";
import { Alert } from "@/components/ui/alert";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { isGuestTokenRequestError } from "@/lib/auth/fmToken";
import { fetchAttemptResult, type ResultResponse } from "@/lib/api/v0_3";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { captureError } from "@/lib/observability/sentry";
import type { ScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";

const RESULT_POLL_FALLBACK_MS = 3000;
const RESULT_POLL_MAX = 10;

type ResultDimension = {
  code?: string;
  key?: string;
  label?: string;
  score?: number;
  percent?: number;
  value?: number;
};

function resolveRetryMs(retryAfterSeconds: number | undefined): number {
  const retryAfterValue = typeof retryAfterSeconds === "number" ? retryAfterSeconds : Number.NaN;
  if (!Number.isFinite(retryAfterValue)) return RESULT_POLL_FALLBACK_MS;

  const retryMs = Math.floor(retryAfterValue * 1000);
  if (retryMs <= 0) return RESULT_POLL_FALLBACK_MS;
  return Math.min(10000, Math.max(1000, retryMs));
}

function resolveResultRetryMs(result: ResultResponse | null): number {
  if (!result?.meta || typeof result.meta !== "object" || Array.isArray(result.meta)) {
    return RESULT_POLL_FALLBACK_MS;
  }

  const retryAfterSeconds =
    typeof result.meta.retry_after_seconds === "number"
      ? result.meta.retry_after_seconds
      : typeof result.meta.retry_after === "number"
        ? result.meta.retry_after
        : undefined;

  return resolveRetryMs(retryAfterSeconds);
}

function hasReadyResultPayload(result: ResultResponse | null): result is ResultResponse & {
  result: NonNullable<ResultResponse["result"]>;
} {
  return Boolean(result?.result && typeof result.result === "object");
}

function normalizeDimensions(result: NonNullable<ResultResponse["result"]>): ResultDimension[] {
  if (!Array.isArray(result.dimensions)) return [];

  return result.dimensions
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => item as ResultDimension);
}

function resolveGuestTokenTelemetry(error: unknown): {
  statusCode?: number;
  errorCode: string;
  requestId?: string;
} {
  if (isGuestTokenRequestError(error)) {
    return {
      statusCode: error.status,
      errorCode: error.errorCode ?? error.reason.toUpperCase(),
      requestId: error.requestId,
    };
  }

  return {
    errorCode: "UNKNOWN",
  };
}

export default function ResultClient({
  attemptId,
  rolloutEnv: _rolloutEnv,
}: {
  attemptId: string;
  rolloutEnv: ScaleRolloutEnvSnapshot;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const [resultData, setResultData] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const routeScaleCodeRef = useRef("UNKNOWN");

  const runWithAuthRetry = useCallback(
    async <T,>(runner: () => Promise<T>): Promise<T> =>
      runWithGuestTokenRetry({
        runner,
        anonId,
        locale,
        onGuestTokenFailure: (guestTokenError) => {
          const telemetry = resolveGuestTokenTelemetry(guestTokenError);
          trackEvent("auth_guest_token_failure", {
            scale_code: routeScaleCodeRef.current,
            stage: "result_load",
            status_code: telemetry.statusCode,
            error_code: telemetry.errorCode,
            request_id: telemetry.requestId,
            route: "/result/[id]",
            locale,
          });
        },
      }),
    [anonId, locale]
  );

  useEffect(() => {
    let active = true;
    let retryTimer: number | null = null;

    const load = async (attempt = 0) => {
      if (attempt === 0) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await runWithAuthRetry(() => fetchAttemptResult({ attemptId, anonId }));
        if (!active) return;

        setResultData(response);
        const nextScaleCode =
          typeof response.meta?.scale_code === "string" && response.meta.scale_code.trim().length > 0
            ? response.meta.scale_code.trim().toUpperCase()
            : "UNKNOWN";
        routeScaleCodeRef.current = nextScaleCode;

        if (!hasReadyResultPayload(response)) {
          setProcessing(true);
          if (attempt < RESULT_POLL_MAX - 1) {
            retryTimer = window.setTimeout(() => {
              void load(attempt + 1);
            }, resolveResultRetryMs(response));
          }
          return;
        }

        setProcessing(false);
      } catch (cause) {
        if (!active) return;

        setResultData(null);
        setProcessing(false);
        const message = cause instanceof Error ? cause.message : dict.result.reportUnavailable;
        setError(message);

        const classified = classifyApiError(cause);
        trackEvent("result_load_failure", {
          scale_code: routeScaleCodeRef.current,
          stage: "load_result",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          route: "/result/[id]",
          locale,
        });
        captureError(cause, {
          route: "/result/[id]",
          attemptId,
          scaleCode: routeScaleCodeRef.current,
          stage: "load_result",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [anonId, attemptId, dict.result.reportUnavailable, locale, runWithAuthRetry]);

  const viewState: "processing" | "ready" | "failed" =
    loading || processing
      ? "processing"
      : error || !hasReadyResultPayload(resultData)
        ? "failed"
        : "ready";

  if (viewState === "processing") {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        <Alert>{dict.orders.reportGenerating}</Alert>
        <AnticipationSkeleton phases={dict.loading.phases} />
      </div>
    );
  }

  if (viewState === "failed") {
    return <Alert>{error ?? dict.result.reportUnavailable}</Alert>;
  }

  if (!hasReadyResultPayload(resultData)) {
    return <Alert>{dict.result.reportUnavailable}</Alert>;
  }

  const result = resultData.result;
  const typeCode = typeof result.type_code === "string" ? result.type_code : undefined;
  const summary = typeof result.summary === "string" ? result.summary : undefined;
  const dimensions = normalizeDimensions(result);

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      <ResultSummary typeCode={typeCode} summary={summary} />
      <DimensionBars dimensions={dimensions} />
    </div>
  );
}
