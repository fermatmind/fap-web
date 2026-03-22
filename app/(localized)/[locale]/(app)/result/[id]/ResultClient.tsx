"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnticipationSkeleton } from "@/components/design/AnticipationSkeleton";
import {
  canRenderRichResultReport,
  isGeneratingReportResponse,
  resolveReportScaleCode,
  RichResultReport,
} from "@/components/result/RichResultReport";
import { DimensionBars } from "@/components/result/DimensionBars";
import { ResultSummary } from "@/components/result/ResultSummary";
import { Alert } from "@/components/ui/alert";
import {
  canEnterReportPage,
  isProjectionLocked,
  isProjectionProcessing,
  isProjectionUnavailable,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import {
  fetchAttemptReport,
  fetchAttemptReportAccess,
  fetchAttemptResult,
  type ReportResponse,
  type ResultResponse,
} from "@/lib/api/v0_3";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { isGuestTokenRequestError } from "@/lib/auth/fmToken";
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function resolveRetryMs(retryAfterSeconds: number | undefined): number {
  const retryAfterValue = typeof retryAfterSeconds === "number" ? retryAfterSeconds : Number.NaN;
  if (!Number.isFinite(retryAfterValue)) return RESULT_POLL_FALLBACK_MS;

  const retryMs = Math.floor(retryAfterValue * 1000);
  if (retryMs <= 0) return RESULT_POLL_FALLBACK_MS;
  return Math.min(10000, Math.max(1000, retryMs));
}

function resolveResponseRetryMs(
  response:
    | ResultResponse
    | ReportResponse
    | {
        retry_after_seconds?: number;
        retry_after?: number;
        meta?: Record<string, unknown>;
      }
    | null
): number {
  const responseRecord = asRecord(response);
  const meta = asRecord(responseRecord?.meta);
  const retryAfterSeconds =
    typeof responseRecord?.retry_after_seconds === "number"
      ? responseRecord.retry_after_seconds
      : typeof responseRecord?.retry_after === "number"
        ? responseRecord.retry_after
        : typeof meta?.retry_after_seconds === "number"
          ? meta.retry_after_seconds
          : typeof meta?.retry_after === "number"
            ? meta.retry_after
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

function resolveScaleCodeForTelemetry(reportData: ReportResponse | null, resultData: ResultResponse | null): string {
  const reportScaleCode = resolveReportScaleCode(reportData);
  if (reportScaleCode) {
    return reportScaleCode;
  }

  const resultScaleCode = normalizeText(resultData?.meta?.scale_code).toUpperCase();
  if (resultScaleCode) {
    return resultScaleCode;
  }

  const metaScaleCode = normalizeText(reportData?.meta?.scale_code).toUpperCase();
  return metaScaleCode || "UNKNOWN";
}

export default function ResultClient({
  attemptId,
  rolloutEnv,
}: {
  attemptId: string;
  rolloutEnv: ScaleRolloutEnvSnapshot;
}) {
  void rolloutEnv;

  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [resultData, setResultData] = useState<ResultResponse | null>(null);
  const [accessView, setAccessView] = useState<AttemptReportAccessView | null>(null);
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

    const scheduleRetry = (attempt: number, delayMs: number) => {
      if (attempt >= RESULT_POLL_MAX - 1) {
        return;
      }

      retryTimer = window.setTimeout(() => {
        void load(attempt + 1);
      }, delayMs);
    };

    const loadFallbackResult = async (attempt: number) => {
      const response = await runWithAuthRetry(() => fetchAttemptResult({ attemptId, anonId }));
      if (!active) {
        return { ready: false };
      }

      setResultData(response);
      const nextScaleCode = normalizeText(response.meta?.scale_code).toUpperCase();
      if (nextScaleCode) {
        routeScaleCodeRef.current = nextScaleCode;
      }

      if (!hasReadyResultPayload(response)) {
        setProcessing(true);
        scheduleRetry(attempt, resolveResponseRetryMs(response));
        return { ready: false };
      }

      setProcessing(false);
      return { ready: true, response };
    };

    const load = async (attempt = 0) => {
      if (attempt === 0) {
        setLoading(true);
      }
      setError(null);

      try {
        const accessResponse = await runWithAuthRetry(() => fetchAttemptReportAccess({ attemptId, anonId }));
        if (!active) return;

        const nextAccessView = normalizeAttemptReportAccess(accessResponse, locale);
        setAccessView(nextAccessView);

        if (!nextAccessView) {
          throw new Error(dict.result.reportUnavailable);
        }

        if (isProjectionProcessing(nextAccessView)) {
          setReportData(null);
          setResultData(null);
          setProcessing(true);
          scheduleRetry(attempt, RESULT_POLL_FALLBACK_MS);
          return;
        }

        if (isProjectionLocked(nextAccessView)) {
          setReportData(null);
          setResultData(null);
          setProcessing(false);
          setError(dict.result.reportUnavailable);
          return;
        }

        if (isProjectionUnavailable(nextAccessView) || !canEnterReportPage(nextAccessView)) {
          setReportData(null);
          setResultData(null);
          setProcessing(false);
          setError(dict.result.reportUnavailable);
          return;
        }

        const reportResponse = await runWithAuthRetry(() => fetchAttemptReport({ attemptId, anonId }));
        if (!active) return;

        setReportData(reportResponse);
        setResultData(null);
        routeScaleCodeRef.current = resolveScaleCodeForTelemetry(reportResponse, null);

        if (isGeneratingReportResponse(reportResponse)) {
          setProcessing(true);
          scheduleRetry(attempt, resolveResponseRetryMs(reportResponse));
          return;
        }

        const richReportReady = canRenderRichResultReport(reportResponse);
        if (richReportReady) {
          setProcessing(false);
          return;
        }

        await loadFallbackResult(attempt);
      } catch (reportCause) {
        if (!active) return;

        setReportData(null);

        try {
          await loadFallbackResult(attempt);
        } catch (resultCause) {
          if (!active) return;

          setResultData(null);
          setProcessing(false);
          const message = resultCause instanceof Error ? resultCause.message : dict.result.reportUnavailable;
          setError(message);

          const classified = classifyApiError(resultCause);
          trackEvent("result_load_failure", {
            scale_code: routeScaleCodeRef.current,
            stage: "load_result",
            status_group: classified.statusGroup,
            status_code: classified.statusCode,
            error_code: classified.errorCode,
            route: "/result/[id]",
            locale,
          });
          captureError(resultCause, {
            route: "/result/[id]",
            attemptId,
            scaleCode: routeScaleCodeRef.current,
            stage: "load_result",
            reportCause: reportCause instanceof Error ? reportCause.message : String(reportCause),
          });
        }
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

  const hasRichReport = reportData ? canRenderRichResultReport(reportData) : false;
  const projectionUnavailable = isProjectionUnavailable(accessView);
  const projectionLocked = isProjectionLocked(accessView);
  const projectionProcessing = isProjectionProcessing(accessView);

  const viewState: "processing" | "ready" | "failed" =
    loading || processing || projectionProcessing
      ? "processing"
      : hasRichReport || hasReadyResultPayload(resultData)
        ? "ready"
        : "failed";

  if (viewState === "processing") {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        <Alert>{dict.orders.reportGenerating}</Alert>
        <AnticipationSkeleton phases={dict.loading.phases} />
      </div>
    );
  }

  if (viewState === "failed") {
    if (projectionLocked) {
      return <Alert>{dict.result.reportUnavailable}</Alert>;
    }

    if (projectionUnavailable) {
      return <Alert>{dict.result.reportUnavailable}</Alert>;
    }

    return <Alert>{error ?? dict.result.reportUnavailable}</Alert>;
  }

  if (hasRichReport && reportData) {
    return <RichResultReport locale={locale} reportData={reportData} accessProjection={accessView} />;
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
