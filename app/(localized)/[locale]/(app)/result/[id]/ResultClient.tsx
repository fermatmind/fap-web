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
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { isGuestTokenRequestError } from "@/lib/auth/fmToken";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, type Locale } from "@/lib/i18n/locales";
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
  leftLabel?: string;
  rightLabel?: string;
  winnerLabel?: string;
};

const MBTI_DIMENSION_META: Record<
  string,
  {
    label: { en: string; zh: string };
    left: { en: string; zh: string };
    right: { en: string; zh: string };
  }
> = {
  EI: {
    label: { en: "E / I", zh: "E / I" },
    left: { en: "Extraversion", zh: "外向 E" },
    right: { en: "Introversion", zh: "内向 I" },
  },
  SN: {
    label: { en: "S / N", zh: "S / N" },
    left: { en: "Sensing", zh: "实感 S" },
    right: { en: "Intuition", zh: "直觉 N" },
  },
  TF: {
    label: { en: "T / F", zh: "T / F" },
    left: { en: "Thinking", zh: "理性 T" },
    right: { en: "Feeling", zh: "情感 F" },
  },
  JP: {
    label: { en: "J / P", zh: "J / P" },
    left: { en: "Judging", zh: "判断 J" },
    right: { en: "Perceiving", zh: "知觉 P" },
  },
  AT: {
    label: { en: "A / T", zh: "A / T" },
    left: { en: "Assertive", zh: "自信 A" },
    right: { en: "Turbulent", zh: "敏感 T" },
  },
};

const RESULT_DIMENSION_ORDER = ["EI", "SN", "TF", "JP", "AT"] as const;

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

function normalizeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value >= 0 && value <= 1) {
    return value * 100;
  }

  return Math.max(0, Math.min(100, value));
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

function normalizeLegacyDimensions(result: NonNullable<ResultResponse["result"]>): ResultDimension[] {
  if (!Array.isArray(result.dimensions)) return [];

  return result.dimensions
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => item as ResultDimension);
}

function normalizeDimensionsFromScoreMap(
  scores: Record<string, unknown>,
  locale: Locale
): ResultDimension[] {
  return Object.entries(scores)
    .map<ResultDimension | null>(([key, value]) => {
      const percent = normalizeNumber(value);
      if (percent === null) {
        return null;
      }

      const meta = MBTI_DIMENSION_META[key];
      if (!meta) {
        return {
          code: key,
          label: key,
          percent,
        };
      }

      const winner = percent >= 50 ? meta.left[locale] : meta.right[locale];

      return {
        code: key,
        label: meta.label[locale],
        percent,
        leftLabel: meta.left[locale],
        rightLabel: meta.right[locale],
        winnerLabel:
          locale === "zh"
            ? `当前更偏向 ${winner}`
            : `Currently leaning toward ${winner}`,
      };
    })
    .filter((item): item is ResultDimension => item !== null)
    .sort((left, right) => {
      const leftIndex = RESULT_DIMENSION_ORDER.indexOf((left.code ?? left.key ?? "") as (typeof RESULT_DIMENSION_ORDER)[number]);
      const rightIndex = RESULT_DIMENSION_ORDER.indexOf(
        (right.code ?? right.key ?? "") as (typeof RESULT_DIMENSION_ORDER)[number]
      );

      const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

      return normalizedLeft - normalizedRight;
    });
}

function normalizeDimensions(
  response: ResultResponse & {
    result: NonNullable<ResultResponse["result"]>;
  },
  locale: Locale
): ResultDimension[] {
  const legacyDimensions = normalizeLegacyDimensions(response.result);
  if (legacyDimensions.length > 0) {
    return legacyDimensions;
  }

  const responseRecord = asRecord(response);
  const resultRecord = asRecord(response.result);
  const breakdown = asRecord(resultRecord?.breakdown_json);
  const axisScores = asRecord(resultRecord?.axis_scores_json);
  const scoreMap =
    asRecord(responseRecord?.scores_pct) ??
    asRecord(breakdown?.dimensions) ??
    asRecord(axisScores?.scores_pct);

  if (!scoreMap) {
    return [];
  }

  return normalizeDimensionsFromScoreMap(scoreMap, locale);
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

        try {
          await ensureFmTokenReady({
            anonId,
            locale,
          });
        } catch (guestTokenError) {
          const telemetry = resolveGuestTokenTelemetry(guestTokenError);
          trackEvent("auth_guest_token_failure", {
            scale_code: routeScaleCodeRef.current,
            stage: "result_bootstrap",
            status_code: telemetry.statusCode,
            error_code: telemetry.errorCode,
            request_id: telemetry.requestId,
            route: "/result/[id]",
            locale,
          });
        }
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
  const responseRecord = asRecord(resultData);
  const typeCode =
    typeof result.type_code === "string"
      ? result.type_code
      : typeof responseRecord?.type_code === "string"
        ? responseRecord.type_code
        : undefined;
  const summary = typeof result.summary === "string" ? result.summary : undefined;
  const dimensions = normalizeDimensions(resultData, locale);

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      <ResultSummary typeCode={typeCode} summary={summary} />
      <DimensionBars dimensions={dimensions} />
    </div>
  );
}
