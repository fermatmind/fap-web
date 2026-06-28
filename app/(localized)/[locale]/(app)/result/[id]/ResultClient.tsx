"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnticipationSkeleton } from "@/components/design/AnticipationSkeleton";
import { MbtiResultShellLoadingShell } from "@/components/result/mbti/MbtiResultShell";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { isEqV5ReportResponse } from "@/components/result/eq/utils";
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
  bindAttemptEmail,
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
import { getFmToken, isGuestTokenRequestError } from "@/lib/auth/fmToken";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, type Locale } from "@/lib/i18n/locales";
import { isIqScaleCode } from "@/lib/iq/constants";
import { buildDefaultPublicPersonalitySlug } from "@/lib/cms/personality";
import { classifyApiError } from "@/lib/observability/httpError";
import { logInfo, logWarn } from "@/lib/observability/logger";
import { captureError } from "@/lib/observability/sentry";
import { installPrivateResultPrintUrlRedaction } from "@/lib/result/privatePrintUrlRedaction";
import type { ScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { assembleRiasecResultViewModel, hasRiasecProjection } from "@/lib/riasec/resultAssembler";
import { Button } from "@/components/ui/button";

const RESULT_POLL_FALLBACK_MS = 3000;
const RESULT_POLL_MAX = 10;
const INVITE_PROGRESS_POLL_MS = 15000;
const MBTI_PDF_READY_ANCHORS = [
  "mbti-desktop-traits",
  "mbti-desktop-career",
  "mbti-desktop-growth",
  "mbti-desktop-relationships",
] as const;

declare global {
  interface Window {
    __FERMAT_PDF_READY__?: boolean;
  }
}

type ResultClientStatus = "loading" | "generating" | "ready" | "failed" | "email_required";

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

function isEmailBindRequiredProblem(error: unknown): error is ApiError {
  return error instanceof ApiError && error.errorCode === "EMAIL_BIND_REQUIRED";
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

  const reportPayload = asRecord(reportData?.report);
  const directReportScaleCode = normalizeText(reportData?.scale_code, reportPayload?.scale_code).toUpperCase();
  if (directReportScaleCode) {
    return directReportScaleCode;
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

function hasMbtiReportAccessRouteHint(response: AttemptReportAccessResponse): boolean {
  const actions = asRecord(response?.actions);
  const historyHref = normalizeText(actions?.history_href).toLowerCase();
  return historyHref.includes("/history/mbti");
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

function resolveReportGeneratingMessage(locale: Locale, scaleCode: string): string {
  const normalized = scaleCode.toUpperCase();

  if (normalized === "EQ_60") {
    return locale === "zh"
      ? "情商测试结果正在生成中，系统会自动刷新；通常只需要几秒钟。"
      : "Your EQ result is still generating. This page refreshes automatically and usually completes in a few seconds.";
  }

  if (normalized === "RIASEC") {
    return locale === "zh"
      ? "霍兰德职业兴趣测试结果正在生成中，系统会自动刷新；通常只需要几秒钟。"
      : "Your Holland/RIASEC result is still generating. This page refreshes automatically and usually completes in a few seconds.";
  }

  return locale === "zh"
    ? "结果正在生成中，系统会自动刷新；通常只需要几秒钟。"
    : "Your result is still generating. This page refreshes automatically and usually completes in a few seconds.";
}

function isAttemptResubmitConflictMessage(message: string | null | undefined): boolean {
  const normalized = normalizeText(message).toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized.includes("attempt already submitted with different answers")
    || normalized.includes("already submitted with different answers")
    || normalized.includes("submitted with different answers");
}

function buildForcedFreshAttemptHref(baseHref: string): string {
  const separator = baseHref.includes("?") ? "&" : "?";
  return `${baseHref}${separator}force_new_attempt=1&reason=submission_conflict`;
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

type InviteProgressSnapshot = {
  completedInvitees: number;
  requiredInvitees: number;
  unlockStage: "locked" | "partial" | "full" | null;
  unlockSource: "none" | "invite" | "payment" | "mixed" | null;
};

function resolveUnlockStageRank(stage: AttemptReportAccessView["unlockStage"] | AttemptInviteUnlockProgressView["unlockStage"]): number {
  if (stage === "full") return 3;
  if (stage === "partial") return 2;
  if (stage === "locked") return 1;
  return 0;
}

function resolveUnlockSourceMerge({
  previousSource,
  nextSource,
}: {
  previousSource: AttemptReportAccessView["unlockSource"];
  nextSource: AttemptInviteUnlockProgressView["unlockSource"];
}): AttemptReportAccessView["unlockSource"] {
  if (!nextSource) {
    return previousSource;
  }

  if (!previousSource || previousSource === "none") {
    return nextSource;
  }

  if (nextSource === "mixed") {
    return "mixed";
  }

  return previousSource;
}

function mergeAccessUnlockStateFromInviteProgress({
  previousStage,
  previousSource,
  nextStage,
  nextSource,
}: {
  previousStage: AttemptReportAccessView["unlockStage"];
  previousSource: AttemptReportAccessView["unlockSource"];
  nextStage: AttemptInviteUnlockProgressView["unlockStage"];
  nextSource: AttemptInviteUnlockProgressView["unlockSource"];
}): {
  unlockStage: AttemptReportAccessView["unlockStage"];
  unlockSource: AttemptReportAccessView["unlockSource"];
  changed: boolean;
} {
  if (!nextStage && !nextSource) {
    return {
      unlockStage: previousStage,
      unlockSource: previousSource,
      changed: false,
    };
  }

  const previousRank = resolveUnlockStageRank(previousStage);
  const nextRank = resolveUnlockStageRank(nextStage);
  if (nextRank < previousRank) {
    return {
      unlockStage: previousStage,
      unlockSource: previousSource,
      changed: false,
    };
  }
  const stageCanUpgrade = nextRank >= previousRank;
  const mergedStage = stageCanUpgrade && nextStage ? nextStage : previousStage;
  const mergedSource = stageCanUpgrade && nextRank > previousRank
    ? resolveUnlockSourceMerge({
        previousSource: previousSource,
        nextSource,
      })
    : resolveUnlockSourceMerge({
        previousSource,
        nextSource,
      });

  return {
    unlockStage: mergedStage,
    unlockSource: mergedSource,
    changed: mergedStage !== previousStage || mergedSource !== previousSource,
  };
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

function canLoadResultProjection(
  view: AttemptReportAccessView | null,
  options: { allowLockedPreview: boolean }
): boolean {
  if (!view?.actions.pageHref || view.reportState !== "ready") {
    return false;
  }

  return view.accessState === "ready" || options.allowLockedPreview;
}

export default function ResultClient({
  attemptId,
  rolloutEnv,
  printMode = false,
}: {
  attemptId: string;
  rolloutEnv: ScaleRolloutEnvSnapshot;
  printMode?: boolean;
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
  const [mbtiAccessPath, setMbtiAccessPath] = useState(false);
  const [status, setStatus] = useState<ResultClientStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailGateError, setEmailGateError] = useState<string | null>(null);
  const [emailBindFeedback, setEmailBindFeedback] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailRecoverySaved, setEmailRecoverySaved] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const resultAccessToken = useMemo(
    () => normalizeText(searchParams.get("access_token"), searchParams.get("result_access_token")),
    [searchParams]
  );

  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const routeScaleCodeRef = useRef("UNKNOWN");
  const inviteProgressSnapshotRef = useRef<InviteProgressSnapshot | null>(null);
  const mbtiBootstrapPhaseTrackedRef = useRef(false);

  useEffect(() => {
    if (printMode) {
      return () => {};
    }

    return installPrivateResultPrintUrlRedaction(locale);
  }, [locale, printMode]);

  useEffect(() => {
    const authToken = getFmToken();
    if (!authToken) {
      return;
    }

    const candidateAttemptIds = Array.from(new Set([attemptId, ...readPendingAnonLinkAttempts()]));
    if (
      candidateAttemptIds.length === 0
      || !shouldLinkAnonAttemptsOnLoginSuccess({
        authToken,
        anonId,
        attemptIds: candidateAttemptIds,
      })
    ) {
      return;
    }

    void linkAnonAttemptsOnceOnLoginSuccess({
      authToken,
      anonId,
      attemptIds: candidateAttemptIds,
    }).catch(() => {
      // Keep result entry non-blocking.
    });
  }, [anonId, attemptId]);

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

  const showEmailGateForError = useCallback((cause: unknown): boolean => {
    if (!isEmailBindRequiredProblem(cause)) {
      return false;
    }

    setReportData(null);
    setResultData(null);
    setAccessView(null);
    setInviteUnlockProgress(null);
    setStatus("email_required");
    setEmailGateError(null);
    setEmailBindFeedback(null);

    trackEvent("result_email_gate_required", {
      attempt_id: attemptId,
      route: "/result/[id]",
      locale,
    });

    return true;
  }, [attemptId, locale]);

  const handleEmailBindSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setEmailGateError(locale === "zh" ? "请输入邮箱。" : "Enter an email address.");
      return;
    }

    setEmailSubmitting(true);
    setEmailGateError(null);
    setEmailBindFeedback(null);

    try {
      await runWithAuthRetry(() => bindAttemptEmail({
        attemptId,
        email: normalizedEmail,
        anonId,
        locale,
        surface: "result_gate",
      }));
      setEmailBindFeedback(locale === "zh" ? "邮箱已保存，正在打开结果。" : "Email saved. Opening the result.");
      setStatus("loading");
      setReloadNonce((value) => value + 1);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setEmailGateError(message || (locale === "zh" ? "邮箱保存失败，请稍后再试。" : "Could not save this email. Try again later."));
      trackEvent("result_email_bind_failed", {
        attempt_id: attemptId,
        route: "/result/[id]",
        locale,
      });
    } finally {
      setEmailSubmitting(false);
    }
  }, [anonId, attemptId, email, locale, runWithAuthRetry]);

  const handleEmailRecoverySubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setEmailGateError(locale === "zh" ? "请输入邮箱。" : "Enter an email address.");
      return;
    }

    setEmailSubmitting(true);
    setEmailGateError(null);
    setEmailBindFeedback(null);

    try {
      await runWithAuthRetry(() => bindAttemptEmail({
        attemptId,
        email: normalizedEmail,
        anonId,
        locale,
        surface: "result_recovery",
      }));
      setEmailRecoverySaved(true);
      setEmailBindFeedback(
        locale === "zh"
          ? "邮箱已保存，访问链接会发送到该邮箱。你可以继续查看当前结果。"
          : "Email saved. An access link will be sent there, and this result remains available here."
      );
      trackEvent("result_email_bind_saved", {
        attempt_id: attemptId,
        route: "/result/[id]",
        locale,
        surface: "result_recovery",
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setEmailGateError(message || (locale === "zh" ? "邮箱保存失败，请稍后再试。" : "Could not save this email. Try again later."));
      trackEvent("result_email_bind_failed", {
        attempt_id: attemptId,
        route: "/result/[id]",
        locale,
        surface: "result_recovery",
      });
    } finally {
      setEmailSubmitting(false);
    }
  }, [anonId, attemptId, email, locale, runWithAuthRetry]);

  const fetchReportAccessWithAuthMismatchRetry = useCallback(async () => {
    try {
      return await runWithAuthRetry(() => fetchAttemptReportAccess({
        attemptId,
        anonId,
        locale,
        ...(resultAccessToken ? { accessToken: resultAccessToken } : {}),
      }));
    } catch (error) {
      if (!hasAuthOrAnonContext(anonId) || !isAttemptNotFoundProblem(error)) {
        throw error;
      }

      return fetchAttemptReportAccess({
        attemptId,
        anonId,
        locale,
        skipAuth: true,
        ...(resultAccessToken ? { accessToken: resultAccessToken } : {}),
      });
    }
  }, [anonId, attemptId, locale, resultAccessToken, runWithAuthRetry]);

  const fetchReportWithAuthMismatchRetry = useCallback(async () => {
    try {
      return await runWithAuthRetry(() => fetchAttemptReport({
        attemptId,
        anonId,
        locale,
        ...(resultAccessToken ? { accessToken: resultAccessToken } : {}),
      }));
    } catch (error) {
      if (!hasAuthOrAnonContext(anonId) || !isAttemptNotFoundProblem(error)) {
        throw error;
      }

      return fetchAttemptReport({
        attemptId,
        anonId,
        locale,
        skipAuth: true,
        ...(resultAccessToken ? { accessToken: resultAccessToken } : {}),
      });
    }
  }, [anonId, attemptId, locale, resultAccessToken, runWithAuthRetry]);

  const fetchInviteUnlockProgressWithAuthMismatchRetry = useCallback(async () => {
    try {
      return await runWithAuthRetry(() => fetchAttemptInviteUnlockProgress({ attemptId, anonId, locale }));
    } catch (error) {
      if (!hasAuthOrAnonContext(anonId) || !isAttemptNotFoundProblem(error)) {
        throw error;
      }

      return fetchAttemptInviteUnlockProgress({
        attemptId,
        anonId,
        locale,
        skipAuth: true,
      });
    }
  }, [anonId, attemptId, locale, runWithAuthRetry]);

  const canLoadRichReport = useCallback((
    view: AttemptReportAccessView | null,
    options: { allowLockedPreview: boolean }
  ) => {
    return canLoadResultProjection(view, options);
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

        const mergedUnlockState = mergeAccessUnlockStateFromInviteProgress({
          previousStage: previous.unlockStage,
          previousSource: previous.unlockSource,
          nextStage: normalizedProgress.unlockStage,
          nextSource: normalizedProgress.unlockSource,
        });
        if (!mergedUnlockState.changed) {
          return previous;
        }

        logInfo("result_invite_unlock_status_synced", {
          attempt_id: attemptId,
          from_unlock_stage: previous.unlockStage,
          to_unlock_stage: mergedUnlockState.unlockStage,
          from_unlock_source: previous.unlockSource,
          to_unlock_source: mergedUnlockState.unlockSource,
          completed_invitees: normalizedProgress.completedInvitees,
          required_invitees: normalizedProgress.requiredInvitees,
          diagnostic_status: normalizedProgress.diagnostics?.status ?? null,
        });

        return {
          ...previous,
          unlockStage: mergedUnlockState.unlockStage,
          unlockSource: mergedUnlockState.unlockSource,
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

        if (normalizedProgress) {
          const previousSnapshot = inviteProgressSnapshotRef.current;
          const currentSnapshot: InviteProgressSnapshot = {
            completedInvitees: normalizedProgress.completedInvitees,
            requiredInvitees: normalizedProgress.requiredInvitees,
            unlockStage: normalizedProgress.unlockStage,
            unlockSource: normalizedProgress.unlockSource,
          };
          const progressAdvanced = previousSnapshot === null
            || previousSnapshot.completedInvitees !== currentSnapshot.completedInvitees
            || previousSnapshot.requiredInvitees !== currentSnapshot.requiredInvitees
            || previousSnapshot.unlockStage !== currentSnapshot.unlockStage
            || previousSnapshot.unlockSource !== currentSnapshot.unlockSource;

          if (progressAdvanced) {
            trackEvent("invite_progress_advanced", {
              scale_code: "MBTI",
              attempt_id: attemptId,
              target_attempt_id: normalizedProgress.targetAttemptId ?? attemptId,
              completed_invitees: currentSnapshot.completedInvitees,
              required_invitees: currentSnapshot.requiredInvitees,
              unlock_stage: currentSnapshot.unlockStage ?? undefined,
              unlock_source: currentSnapshot.unlockSource ?? undefined,
              previous_completed_invitees: previousSnapshot?.completedInvitees,
              previous_required_invitees: previousSnapshot?.requiredInvitees,
              previous_unlock_stage: previousSnapshot?.unlockStage ?? undefined,
              previous_unlock_source: previousSnapshot?.unlockSource ?? undefined,
              reason,
              entry_surface: "result_page",
              locale,
            });
          }

          inviteProgressSnapshotRef.current = currentSnapshot;
        }

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
      const response = await runWithAuthRetry(() => fetchAttemptResult({
        attemptId,
        anonId,
        locale,
        ...(resultAccessToken ? { accessToken: resultAccessToken } : {}),
      }));
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
        setMbtiAccessPath(false);
        setEmailGateError(null);
        setEmailBindFeedback(null);
        inviteProgressSnapshotRef.current = null;
        mbtiBootstrapPhaseTrackedRef.current = false;

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

        const mbtiReportAccessPath = isMbtiReportAccessResponse(accessResponse);
        const allowMbtiLockedPreview = mbtiReportAccessPath || hasMbtiReportAccessRouteHint(accessResponse);
        if (mbtiReportAccessPath) {
          setMbtiAccessPath(true);
          if (!mbtiBootstrapPhaseTrackedRef.current) {
            mbtiBootstrapPhaseTrackedRef.current = true;
            trackEvent("ui_report_loading_phase", {
              scale_code: "MBTI",
              phase: "result_bootstrap_start",
              stage_detail: "access_projection_loaded",
              locked: nextAccessView?.accessState !== "ready",
              variant: nextAccessView?.variant ?? undefined,
              locale,
            });
          }
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

        if (!canLoadRichReport(nextAccessView, { allowLockedPreview: allowMbtiLockedPreview })) {
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

        const eqReportReady = isEqV5ReportResponse(reportResponse);
        const richReportReady = canRenderRichResultReport(reportResponse);
        if (eqReportReady || richReportReady) {
          setStatus("ready");
          return;
        }

        if (isGeneratingReportResponse(reportResponse)) {
          setStatus("generating");
          scheduleRetry(attempt, resolveResponseRetryMs(reportResponse));
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
        if (showEmailGateForError(reportCause)) return;

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
          if (showEmailGateForError(resultCause)) return;

          try {
            const submissionFallback = await loadSubmissionFallback(attempt);
            if (!active || submissionFallback.handled) return;
          } catch (submissionCause) {
            if (showEmailGateForError(submissionCause)) return;
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
    reloadNonce,
    resultAccessToken,
    runWithAuthRetry,
    showEmailGateForError,
  ]);

  const hasEqV5Report = reportData ? isEqV5ReportResponse(reportData) : false;
  const hasRichReport = reportData ? canRenderRichResultReport(reportData) : false;
  const projectionUnavailable = isProjectionUnavailable(accessView);
  const projectionLocked = isProjectionLocked(accessView);
  const resolvedScaleCode = resolveScaleCodeForTelemetry(reportData, resultData);
  const isMbtiReadyPath = mbtiAccessPath
    || Boolean(reportData?.mbti_public_projection_v1)
    || Boolean(reportData?.mbti_access_hub_v1)
    || (hasReadyResultPayload(resultData) && normalizeText(resultData.meta?.scale_code).toUpperCase() === "MBTI")
    || resolveScaleCodeForTelemetry(reportData, resultData) === "MBTI";
  const renderEmailRecoveryCard = () => (
    <section
      className="rounded-[8px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] sm:p-6"
      data-testid="result-email-recovery-card"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-[var(--fm-text-muted)]">
          {locale === "zh" ? "结果找回" : "Result recovery"}
        </p>
        <h2 className="text-xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "保存邮箱，随时找回这份结果" : "Save an email to recover this result"}
        </h2>
        <p className="text-sm leading-6 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "这不会阻塞当前免费结果预览。保存后，我们会把访问链接发送到你的邮箱，方便换设备或稍后继续查看。"
            : "This does not block the free result preview. After saving, we send an access link so you can reopen the result later or on another device."}
        </p>
      </div>

      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleEmailRecoverySubmit}>
        <label className="sr-only" htmlFor="result-email-recovery-input">
          {locale === "zh" ? "邮箱" : "Email"}
        </label>
        <input
          id="result-email-recovery-input"
          data-testid="result-email-recovery-input"
          type="email"
          value={email}
          autoComplete="email"
          inputMode="email"
          required
          disabled={emailRecoverySaved}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full rounded-[8px] border border-[var(--fm-border)] bg-white px-4 text-base text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-trust-blue)] focus:ring-2 focus:ring-[var(--fm-focus)] disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="you@example.com"
        />
        <Button
          type="submit"
          disabled={emailSubmitting || emailRecoverySaved}
          data-testid="result-email-recovery-submit"
        >
          {emailSubmitting
            ? locale === "zh"
              ? "保存中..."
              : "Saving..."
            : emailRecoverySaved
              ? locale === "zh"
                ? "已保存"
                : "Saved"
              : locale === "zh"
                ? "保存并发送链接"
                : "Save and send link"}
        </Button>
      </form>

      {emailGateError ? (
        <div className="mt-3" data-testid="result-email-recovery-error">
          <Alert>{emailGateError}</Alert>
        </div>
      ) : null}
      {emailBindFeedback ? (
        <p className="mt-3 text-sm text-[var(--fm-trust-blue)]" role="status" data-testid="result-email-recovery-feedback">
          {emailBindFeedback}
        </p>
      ) : null}
    </section>
  );
  const renderOptionalEmailRecoveryCard = () => (printMode ? null : renderEmailRecoveryCard());

  const viewState: "processing" | "ready" | "failed" =
    status === "loading" || status === "generating"
      ? "processing"
      : status === "ready" && (hasEqV5Report || hasRichReport || hasReadyResultPayload(resultData))
        ? "ready"
        : "failed";
  const mbtiPdfReadyCandidate = printMode && resolvedScaleCode === "MBTI" && viewState === "ready" && hasRichReport && Boolean(reportData);

  useEffect(() => {
    if (!printMode) {
      return;
    }

    window.__FERMAT_PDF_READY__ = false;
    document.querySelector('[data-pdf-mode="true"]')?.setAttribute("data-pdf-ready", "false");

    if (!mbtiPdfReadyCandidate) {
      return;
    }

    let cancelled = false;

    const markReady = async () => {
      await document.fonts?.ready.catch(() => undefined);
      const images = Array.from(document.images);
      await Promise.all(images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }));

      const modulesReady = MBTI_PDF_READY_ANCHORS.every((id) => document.getElementById(id));
      if (cancelled || !modulesReady) {
        return;
      }

      document.querySelector('[data-pdf-mode="true"]')?.setAttribute("data-pdf-ready", "true");
      window.__FERMAT_PDF_READY__ = true;
    };

    void markReady();

    return () => {
      cancelled = true;
      window.__FERMAT_PDF_READY__ = false;
    };
  }, [mbtiPdfReadyCandidate, printMode]);

  if (status === "email_required") {
    return (
      <section
        className="mx-auto flex min-h-[420px] w-full max-w-xl flex-col justify-center space-y-6 rounded-[8px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)] sm:p-8"
        data-testid="result-email-gate"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-[var(--fm-text-muted)]">
            {locale === "zh" ? "结果访问" : "Result access"}
          </p>
          <h1 className="text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "先保存邮箱，再查看结果" : "Save an email to view this result"}
          </h1>
          <p className="text-sm leading-6 text-[var(--fm-text-muted)]">
            输入邮箱即可查看并找回该邮箱下保存的结果，请使用你自己的邮箱。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailBindSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--fm-text)]">
              {locale === "zh" ? "邮箱" : "Email"}
            </span>
            <input
              data-testid="result-email-gate-input"
              type="email"
              value={email}
              autoComplete="email"
              inputMode="email"
              required
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-[8px] border border-[var(--fm-border)] bg-white px-4 text-base text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-trust-blue)] focus:ring-2 focus:ring-[var(--fm-focus)]"
              placeholder="you@example.com"
            />
          </label>

          {emailGateError ? (
            <Alert>{emailGateError}</Alert>
          ) : null}
          {emailBindFeedback ? (
            <p className="text-sm text-[var(--fm-trust-blue)]" role="status">
              {emailBindFeedback}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={emailSubmitting}
            className="w-full"
            data-testid="result-email-gate-submit"
          >
            {emailSubmitting
              ? locale === "zh"
                ? "保存中..."
                : "Saving..."
              : locale === "zh"
                ? "查看结果"
                : "View result"}
          </Button>
        </form>
      </section>
    );
  }

  if (isMbtiReadyPath && viewState === "processing") {
    const retakeHref = resolveRetakeHrefByScale(locale, resolvedScaleCode === "MBTI" ? resolvedScaleCode : "MBTI");
    const statusText = resolveMbtiLoadingStatusText(locale, viewState, error);
    const primaryCtaLabel = locale === "zh" ? "解锁完整报告" : "Unlock full report";

    return (
      <MbtiResultShellLoadingShell
        locale={locale}
        retakeHref={retakeHref}
        statusText={statusText}
        unlockStage={accessView?.unlockStage ?? null}
        inviteUnlockProgress={inviteUnlockProgress}
        primaryCtaLabel={primaryCtaLabel}
        primaryCtaHref="#offer-full"
        primaryCtaIsInternal={false}
      />
    );
  }

  if (viewState === "processing") {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        <Alert>{resolveReportGeneratingMessage(locale, resolvedScaleCode)}</Alert>
        <AnticipationSkeleton phases={dict.loading.phases} />
      </div>
    );
  }

  if (viewState === "failed") {
    if (isMbtiReadyPath) {
      const retakeHref = resolveRetakeHrefByScale(
        locale,
        resolvedScaleCode === "MBTI" ? resolvedScaleCode : "MBTI"
      );
      const isSubmissionConflict = isAttemptResubmitConflictMessage(error);
      const failureMessage = isSubmissionConflict
        ? (locale === "zh"
          ? "检测到该答卷已提交过另一套答案，当前结果不可恢复。请重新开始测评，我们会强制创建新的作答会话。"
          : "This attempt was already submitted with different answers and cannot be recovered. Please restart the assessment with a fresh attempt.")
        : (error ?? dict.result.reportUnavailable);

      return (
        <div className="space-y-[var(--fm-gap-sm)]">
          <Alert>{failureMessage}</Alert>
          {isSubmissionConflict ? (
            <a
              data-testid="mbti-result-force-retake-link"
              href={buildForcedFreshAttemptHref(retakeHref)}
              className="inline-flex text-sm font-semibold text-slate-900 underline underline-offset-2"
            >
              {locale === "zh" ? "重新开始测评" : "Restart assessment"}
            </a>
          ) : null}
        </div>
      );
    }

    if (projectionLocked) {
      return <Alert>{dict.result.reportUnavailable}</Alert>;
    }

    if (projectionUnavailable) {
      return <Alert>{dict.result.reportUnavailable}</Alert>;
    }

    return <Alert>{error ?? dict.result.reportUnavailable}</Alert>;
  }

  if (isIqScaleCode(resolvedScaleCode)) {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        {renderOptionalEmailRecoveryCard()}
        <IqResultShell
          locale={locale}
          reportData={reportData}
          resultData={hasReadyResultPayload(resultData) ? resultData : null}
          accessView={accessView}
        />
      </div>
    );
  }

  if (hasEqV5Report && reportData) {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        {renderOptionalEmailRecoveryCard()}
        <EQResultV5
          locale={locale}
          reportData={reportData}
          attemptId={attemptId}
          agentContextAccess={{ anonId, accessToken: resultAccessToken }}
        />
      </div>
    );
  }

  if (hasRichReport && reportData) {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        {renderOptionalEmailRecoveryCard()}
        <RichResultReport
          locale={locale}
          reportData={reportData}
          accessProjection={accessView}
          inviteUnlockProgress={inviteUnlockProgress}
        />
      </div>
    );
  }

  if (!hasReadyResultPayload(resultData)) {
    return <Alert>{dict.result.reportUnavailable}</Alert>;
  }

  if (hasRiasecProjection(resultData)) {
    return (
      <div className="space-y-[var(--fm-gap-md)]">
        {renderOptionalEmailRecoveryCard()}
        <RiasecResultShell
          locale={locale}
          viewModel={assembleRiasecResultViewModel(resultData)}
          attemptId={attemptId}
        />
      </div>
    );
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
  const mbtiPersonalityHref =
    resolvedScaleCode === "MBTI" && typeCode
      ? localizedPath(`/personality/${buildDefaultPublicPersonalitySlug(typeCode)}`, locale)
      : "";

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      {renderOptionalEmailRecoveryCard()}
      <ResultSummary
        title={
          mbtiPersonalityHref
            ? locale === "zh"
              ? "你的类型是"
              : "Your type is"
            : undefined
        }
        typeCode={typeCode}
        summary={summary}
      />
      {mbtiPersonalityHref ? (
        <Link
          href={mbtiPersonalityHref}
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          data-testid="mbti-result-personality-next-step"
        >
          {locale === "zh" ? "查看人格类型内容" : "Open personality profile"}
        </Link>
      ) : null}
      <DimensionBars dimensions={dimensions} />
    </div>
  );
}
