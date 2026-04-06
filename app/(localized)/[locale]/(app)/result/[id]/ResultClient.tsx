"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnticipationSkeleton } from "@/components/design/AnticipationSkeleton";
import { MbtiResultShellLoadingShell } from "@/components/result/mbti/MbtiResultShell";
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
  normalizeAttemptInviteUnlockProgress,
  type AttemptInviteUnlockProgressView,
} from "@/lib/access/inviteUnlock";
import {
  isProjectionLocked,
  isProjectionProcessing,
  isProjectionUnavailable,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
import { getOrCreateAnonId, readPendingAnonLinkAttempts } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import {
  fetchAttemptReport,
  fetchAttemptReportAccess,
  fetchAttemptInviteUnlockProgress,
  fetchAttemptResult,
  fetchAttemptSubmission,
  linkAnonAttemptsOnceOnLoginSuccess,
  shouldLinkAnonAttemptsOnLoginSuccess,
  type AttemptReportAccessResponse,
  type AttemptSubmissionResponse,
  type ReportResponse,
  type ResultResponse,
} from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { getFmToken, isGuestTokenRequestError, setFmToken } from "@/lib/auth/fmToken";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, type Locale } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { logInfo, logWarn } from "@/lib/observability/logger";
import { captureError } from "@/lib/observability/sentry";
import type { ScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

const RESULT_POLL_FALLBACK_MS = 3000;
const RESULT_POLL_MAX = 10;
const RESULT_PAGE_READY_STATE = "ready";
const INVITE_PROGRESS_POLL_MS = 15000;

type ResultClientStatus = "loading" | "generating" | "ready" | "failed";

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
    | AttemptSubmissionResponse
    | {
        retry_after_seconds?: number;
        retry_after?: number;
        meta?: Record<string, unknown> | null;
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

function resolveAccessResponseRetryMs(response: {
  retry_after_seconds?: number | null;
  retry_after?: number | null;
  meta?: Record<string, unknown> | null;
} | null): number {
  return resolveResponseRetryMs({
    retry_after_seconds:
      typeof response?.retry_after_seconds === "number" ? response.retry_after_seconds : undefined,
    retry_after:
      typeof response?.retry_after === "number" ? response.retry_after : undefined,
    meta: response?.meta ?? undefined,
  });
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

function isMbtiReportAccessResponse(response: AttemptReportAccessResponse): boolean {
  if (response?.mbti_form_v1 && typeof response.mbti_form_v1 === "object") {
    return true;
  }

  const payload = asRecord(response?.payload);
  const payloadScaleCode = normalizeText(payload?.scale_code, payload?.scaleCode).toUpperCase();
  return payloadScaleCode === "MBTI";
}

function resolveRetakeHrefByScale(locale: Locale, scaleCode: string): string {
  const normalized = scaleCode.toUpperCase();
  const canonicalSlug = SCALE_CANONICAL_SLUG_MAP[normalized as keyof typeof SCALE_CANONICAL_SLUG_MAP] ?? "mbti";
  return localizedPath(`/tests/${canonicalSlug}/take`, locale);
}

function resolveMbtiLoadingStatusText(locale: Locale, state: "processing" | "failed", error: string | null) {
  if (state === "processing") {
    return locale === "zh" ? "正在生成你的结果..." : "We are generating your result...";
  }

  return error ?? (locale === "zh" ? "结果暂时无法读取，请返回后再试。" : "The result is temporarily unavailable, please try again.");
}

function isNotFoundApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 404;
}

function isAttemptNotFoundProblem(error: unknown): error is ApiError {
  if (!(error instanceof ApiError) || error.status !== 404) {
    return false;
  }

  const details = asRecord(error.details);
  const nestedDetails = asRecord(details?.details);
  const normalizedErrorCodes = [
    normalizeText(error.errorCode),
    normalizeText(details?.error_code, details?.errorCode, details?.reason_code, details?.reasonCode, details?.code),
    normalizeText(
      nestedDetails?.error_code,
      nestedDetails?.errorCode,
      nestedDetails?.reason_code,
      nestedDetails?.reasonCode,
      nestedDetails?.code
    ),
  ]
    .map((value) => value.toUpperCase())
    .filter(Boolean);

  if (normalizedErrorCodes.includes("ATTEMPT_NOT_FOUND")) {
    return true;
  }

  return normalizeText(error.message).toLowerCase().includes("attempt not found");
}

function hasAuthOrAnonContext(anonId: string): boolean {
  return anonId.trim().length > 0 || Boolean(getFmToken());
}

function resolveSubmissionFailureMessage(
  response: AttemptSubmissionResponse | null,
  fallbackMessage: string
): string {
  return normalizeText(
    response?.submission?.error_message,
    response?.submission?.error_code,
    fallbackMessage
  );
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
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [resultData, setResultData] = useState<ResultResponse | null>(null);
  const [accessView, setAccessView] = useState<AttemptReportAccessView | null>(null);
  const [inviteUnlockProgress, setInviteUnlockProgress] = useState<AttemptInviteUnlockProgressView | null>(null);
  const [status, setStatus] = useState<ResultClientStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const routeScaleCodeRef = useRef("UNKNOWN");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
    if (!tokenFromUrl.startsWith("fm_")) {
      return;
    }

    setFmToken(tokenFromUrl);

    const candidateAttemptIds = Array.from(new Set([attemptId, ...readPendingAnonLinkAttempts()]));
    if (
      candidateAttemptIds.length === 0
      || !shouldLinkAnonAttemptsOnLoginSuccess({
        tokenFromUrl,
        anonId,
        attemptIds: candidateAttemptIds,
      })
    ) {
      return;
    }

    void linkAnonAttemptsOnceOnLoginSuccess({
      tokenFromUrl,
      anonId,
      attemptIds: candidateAttemptIds,
    }).catch(() => {
      // Keep result entry non-blocking.
    });
  }, [anonId, attemptId, searchParams]);

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

  const fetchReportAccessWithAuthMismatchRetry = useCallback(async () => {
    try {
      return await runWithAuthRetry(() => fetchAttemptReportAccess({ attemptId, anonId, locale }));
    } catch (error) {
      if (!hasAuthOrAnonContext(anonId) || !isAttemptNotFoundProblem(error)) {
        throw error;
      }

      return fetchAttemptReportAccess({
        attemptId,
        locale,
        skipAuth: true,
        includeAnonId: false,
      });
    }
  }, [anonId, attemptId, locale, runWithAuthRetry]);

  const fetchReportWithAuthMismatchRetry = useCallback(async () => {
    try {
      return await runWithAuthRetry(() => fetchAttemptReport({ attemptId, anonId, locale }));
    } catch (error) {
      if (!hasAuthOrAnonContext(anonId) || !isAttemptNotFoundProblem(error)) {
        throw error;
      }

      return fetchAttemptReport({
        attemptId,
        locale,
        skipAuth: true,
        includeAnonId: false,
      });
    }
  }, [anonId, attemptId, locale, runWithAuthRetry]);

  const fetchInviteUnlockProgressWithAuthMismatchRetry = useCallback(async () => {
    try {
      return await runWithAuthRetry(() => fetchAttemptInviteUnlockProgress({ attemptId, anonId, locale }));
    } catch (error) {
      if (!hasAuthOrAnonContext(anonId) || !isAttemptNotFoundProblem(error)) {
        throw error;
      }

      return fetchAttemptInviteUnlockProgress({
        attemptId,
        locale,
        skipAuth: true,
        includeAnonId: false,
      });
    }
  }, [anonId, attemptId, locale, runWithAuthRetry]);

  const canLoadRichReport = useCallback((view: AttemptReportAccessView | null) => {
    return view?.reportState === RESULT_PAGE_READY_STATE;
  }, []);

  useEffect(() => {
    let active = true;
    let retryTimer: number | null = null;
    let inviteProgressTimer: number | null = null;
    let inviteProgressRequested = false;

    const scheduleRetry = (attempt: number, delayMs: number) => {
      if (attempt >= RESULT_POLL_MAX - 1) {
        return;
      }

      retryTimer = window.setTimeout(() => {
        void load(attempt + 1);
      }, delayMs);
    };

    const stopInviteProgressSync = () => {
      if (inviteProgressTimer !== null) {
        window.clearInterval(inviteProgressTimer);
        inviteProgressTimer = null;
      }
    };

    const applyInviteProgressToAccessView = (normalizedProgress: AttemptInviteUnlockProgressView | null) => {
      if (!normalizedProgress) {
        return;
      }

      setAccessView((previous) => {
        if (!previous) {
          return previous;
        }

        const nextUnlockStage = normalizedProgress.unlockStage ?? previous.unlockStage;
        const nextUnlockSource = normalizedProgress.unlockSource ?? previous.unlockSource;
        const stageChanged = previous.unlockStage !== nextUnlockStage;
        const sourceChanged = previous.unlockSource !== nextUnlockSource;
        if (!stageChanged && !sourceChanged) {
          return previous;
        }

        logInfo("result_invite_unlock_status_synced", {
          attempt_id: attemptId,
          from_unlock_stage: previous.unlockStage,
          to_unlock_stage: nextUnlockStage,
          from_unlock_source: previous.unlockSource,
          to_unlock_source: nextUnlockSource,
          completed_invitees: normalizedProgress.completedInvitees,
          required_invitees: normalizedProgress.requiredInvitees,
          diagnostic_status: normalizedProgress.diagnostics?.status ?? null,
        });

        return {
          ...previous,
          unlockStage: nextUnlockStage,
          unlockSource: nextUnlockSource,
        };
      });
    };

    const requestInviteProgress = async (reason: "initial" | "poll") => {
      try {
        const progressResponse = await fetchInviteUnlockProgressWithAuthMismatchRetry();
        if (!active) {
          return;
        }

        const normalizedProgress = normalizeAttemptInviteUnlockProgress(progressResponse, locale);
        setInviteUnlockProgress(normalizedProgress);
        applyInviteProgressToAccessView(normalizedProgress);
        logInfo("result_invite_unlock_progress_refreshed", {
          attempt_id: attemptId,
          reason,
          unlock_stage: normalizedProgress?.unlockStage ?? null,
          unlock_source: normalizedProgress?.unlockSource ?? null,
          completed_invitees: normalizedProgress?.completedInvitees ?? null,
          required_invitees: normalizedProgress?.requiredInvitees ?? null,
          progress_percent: normalizedProgress?.diagnostics?.progressPercent ?? null,
          diagnostic_status: normalizedProgress?.diagnostics?.status ?? null,
        });

        if (normalizedProgress?.unlockStage === "full") {
          stopInviteProgressSync();
        }
      } catch (cause) {
        if (!active) {
          return;
        }

        const message = cause instanceof Error ? cause.message : String(cause);
        logWarn("result_invite_unlock_progress_refresh_failed", {
          attempt_id: attemptId,
          reason,
          message,
        });

        if (reason === "initial") {
          // Invite progress should not break the result-delivery chain.
          setInviteUnlockProgress(null);
        }
      }
    };

    const startInviteProgressSync = () => {
      if (inviteProgressRequested) {
        return;
      }

      inviteProgressRequested = true;
      void requestInviteProgress("initial");
      inviteProgressTimer = window.setInterval(() => {
        void requestInviteProgress("poll");
      }, INVITE_PROGRESS_POLL_MS);
    };

    const loadFallbackResult = async () => {
      const response = await runWithAuthRetry(() => fetchAttemptResult({ attemptId, anonId, locale }));
      if (!active) {
        return { ready: false };
      }

      setResultData(response);
      const nextScaleCode = normalizeText(response.meta?.scale_code).toUpperCase();
      if (nextScaleCode) {
        routeScaleCodeRef.current = nextScaleCode;
      }

      if (!hasReadyResultPayload(response)) {
        return { ready: false };
      }

      setStatus("ready");
      return { ready: true, response };
    };

    const loadSubmissionFallback = async (attempt: number) => {
      try {
        const response = await runWithAuthRetry(() => fetchAttemptSubmission({ attemptId, anonId }));
        if (!active) {
          return { handled: false };
        }

        const submissionState = normalizeText(response.submission?.state).toLowerCase();
        if (response.generating === true || submissionState === "pending" || submissionState === "running") {
          setReportData(null);
          setResultData(null);
          setStatus("generating");
          scheduleRetry(attempt, resolveResponseRetryMs(response));

          return { handled: true };
        }

        if (submissionState === "succeeded") {
          setReportData(null);
          setResultData(null);
          setStatus("generating");
          scheduleRetry(attempt, RESULT_POLL_FALLBACK_MS);

          return { handled: true };
        }

        if (submissionState === "failed") {
          setReportData(null);
          setResultData(null);
          setStatus("failed");
          setError(resolveSubmissionFailureMessage(response, dict.result.reportUnavailable));

          return { handled: true };
        }

        return { handled: false };
      } catch (submissionCause) {
        if (isNotFoundApiError(submissionCause)) {
          return { handled: false };
        }

        throw submissionCause;
      }
    };

    const load = async (attempt = 0) => {
      if (attempt === 0) {
        setStatus("loading");
        setInviteUnlockProgress(null);

        try {
          await ensureFmTokenReady({
            anonId,
            locale,
            forceRefresh: true,
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
        const accessResponse = await fetchReportAccessWithAuthMismatchRetry();
        if (!active) return;

        const nextAccessView = normalizeAttemptReportAccess(accessResponse, locale);
        setAccessView(nextAccessView);
        const inviteDiagnostic = asRecord(accessResponse.invite_unlock_diag_v1);
        logInfo("result_report_access_diagnostic", {
          attempt_id: attemptId,
          access_state: accessResponse.access_state ?? null,
          report_state: accessResponse.report_state ?? null,
          unlock_stage: nextAccessView?.unlockStage ?? null,
          unlock_source: nextAccessView?.unlockSource ?? null,
          diagnostic_status: normalizeText(inviteDiagnostic?.status),
          diagnostic_reason: normalizeText(inviteDiagnostic?.status_reason),
          diagnostic_progress_percent:
            typeof inviteDiagnostic?.progress_percent === "number" ? inviteDiagnostic.progress_percent : null,
          diagnostic_snapshot_at: normalizeText(inviteDiagnostic?.snapshot_at),
        });

        if (isMbtiReportAccessResponse(accessResponse)) {
          startInviteProgressSync();
        }

        if (!nextAccessView) {
          throw new Error(dict.result.reportUnavailable);
        }

        if (isProjectionProcessing(nextAccessView)) {
          setReportData(null);
          setResultData(null);
          setStatus("generating");
          scheduleRetry(attempt, resolveAccessResponseRetryMs(accessResponse));
          return;
        }

        if (isProjectionUnavailable(nextAccessView)) {
          const submissionFallback = await loadSubmissionFallback(attempt);
          if (!active || submissionFallback.handled) return;

          setReportData(null);
          setResultData(null);
          setStatus("failed");
          setError(dict.result.reportUnavailable);
          return;
        }

        if (!canLoadRichReport(nextAccessView)) {
          setReportData(null);
          const fallback = await loadFallbackResult();
          if (!active) return;

          if (fallback.ready) {
            return;
          }

          setResultData(null);
          setStatus("failed");
          setError(dict.result.reportUnavailable);
          return;
        }

        const reportResponse = await fetchReportWithAuthMismatchRetry();
        if (!active) return;

        setReportData(reportResponse);
        setResultData(null);
        const reportScaleCode = resolveScaleCodeForTelemetry(reportResponse, null);
        routeScaleCodeRef.current = reportScaleCode;

        if (reportScaleCode === "MBTI") {
          startInviteProgressSync();
        }

        if (isGeneratingReportResponse(reportResponse)) {
          setStatus("generating");
          scheduleRetry(attempt, resolveResponseRetryMs(reportResponse));
          return;
        }

        const richReportReady = canRenderRichResultReport(reportResponse);
        if (richReportReady) {
          setStatus("ready");
          return;
        }

        setReportData(null);
        const fallback = await loadFallbackResult();
        if (!active) return;

        if (fallback.ready) {
          return;
        }

        const submissionFallback = await loadSubmissionFallback(attempt);
        if (!active || submissionFallback.handled) return;

        setResultData(null);
        setStatus("failed");
        setError(dict.result.reportUnavailable);
      } catch (reportCause) {
        if (!active) return;

        setReportData(null);

        try {
          const fallback = await loadFallbackResult();
          if (!active) return;

          if (fallback.ready) {
            return;
          }

          const submissionFallback = await loadSubmissionFallback(attempt);
          if (!active || submissionFallback.handled) return;

          setResultData(null);
          setStatus("failed");
          setError(dict.result.reportUnavailable);
        } catch (resultCause) {
          if (!active) return;

          try {
            const submissionFallback = await loadSubmissionFallback(attempt);
            if (!active || submissionFallback.handled) return;
          } catch (submissionCause) {
            resultCause = submissionCause;
          }

          setResultData(null);
          setStatus("failed");
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
          setStatus((current) => (current === "loading" ? "failed" : current));
        }
      }
    };

    void load();

    return () => {
      active = false;
      stopInviteProgressSync();
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [
    anonId,
    attemptId,
    canLoadRichReport,
    dict.result.reportUnavailable,
    fetchInviteUnlockProgressWithAuthMismatchRetry,
    fetchReportAccessWithAuthMismatchRetry,
    fetchReportWithAuthMismatchRetry,
    locale,
    runWithAuthRetry,
  ]);

  const hasRichReport = reportData ? canRenderRichResultReport(reportData) : false;
  const projectionUnavailable = isProjectionUnavailable(accessView);
  const projectionLocked = isProjectionLocked(accessView);
  const resolvedScaleCode = resolveScaleCodeForTelemetry(reportData, resultData);
  const isMbtiReadyPath =
    (hasReadyResultPayload(resultData) && normalizeText(resultData.meta?.scale_code).toUpperCase() === "MBTI") ||
    resolveScaleCodeForTelemetry(reportData, resultData) === "MBTI";

  const viewState: "processing" | "ready" | "failed" =
    status === "loading" || status === "generating"
      ? "processing"
      : status === "ready" && (hasRichReport || hasReadyResultPayload(resultData))
        ? "ready"
        : "failed";

  if (isMbtiReadyPath && viewState !== "ready") {
    const retakeHref = resolveRetakeHrefByScale(locale, resolvedScaleCode === "MBTI" ? resolvedScaleCode : "MBTI");
    const statusText = resolveMbtiLoadingStatusText(locale, viewState, error);
    const primaryCtaLabel = locale === "zh" ? "解锁完整报告" : "Unlock full report";

    return (
      <MbtiResultShellLoadingShell
        locale={locale}
        retakeHref={retakeHref}
        statusText={statusText}
        primaryCtaLabel={primaryCtaLabel}
        primaryCtaHref="#offer-full"
        primaryCtaIsInternal={false}
      />
    );
  }

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
    return (
      <RichResultReport
        locale={locale}
        reportData={reportData}
        accessProjection={accessView}
        inviteUnlockProgress={inviteUnlockProgress}
      />
    );
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
