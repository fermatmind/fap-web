"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuizTakeHeaderV2 } from "@/components/quiz/QuizTakeHeaderV2";
import { IqOptionBoard } from "@/components/quiz/iq/IqOptionBoard";
import { IqStemSvg } from "@/components/quiz/iq/IqStemSvg";
import { AdaptiveOptionGroup } from "@/components/quiz/immersive/AdaptiveOptionGroup";
import { ImmersiveTakeLayout } from "@/components/quiz/immersive/ImmersiveTakeLayout";
import { SubmitPhaseOverlay } from "@/components/quiz/immersive/SubmitPhaseOverlay";
import { V2LikertScale } from "@/components/quiz/immersive/V2LikertScale";
import {
  useAutoAdvanceFlow,
  type LastSelectionContext,
} from "@/components/quiz/immersive/useAutoAdvanceFlow";
import { QuizShell } from "@/components/quiz/QuizShell";
import { StaleDraftResetPrompt } from "@/components/quiz/StaleDraftResetPrompt";
import { Button } from "@/components/ui/button";
import { getOrCreateAnonId } from "@/lib/anon";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  isGuestTokenEndpointMissingError,
  isGuestTokenRequestError,
} from "@/lib/auth/fmToken";
import {
  fetchScaleQuestions,
  startAttempt,
  submitAttempt,
  type AttemptAttributionPayload,
} from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { trackEvent, trackObservableFunnelEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { isMbtiScaleCode, normalizeMbtiFormCode } from "@/lib/mbti/forms";
import { classifyApiError } from "@/lib/observability/httpError";
import { captureError } from "@/lib/observability/sentry";
import {
  getIqQuestions,
  startIqAttempt,
  submitIqAttempt,
} from "@/lib/iq/api";
import { IQ_CANONICAL_SCALE_CODE, isIqScaleCode } from "@/lib/iq/constants";
import { buildIqSubmitAnswers, type IqTakeQuestion, normalizeIqQuestionsForTake } from "@/lib/iq/take";
import { normalizeQuizQuestions } from "@/lib/quiz/normalizeQuestions";
import { QuizStoreProvider, useQuizStore } from "@/lib/quiz/store";
import { useConstrainQuizUrlTokens } from "@/lib/quiz/urlTokenGuard";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";
import { resolveResultAttemptId } from "@/lib/attempt/resolveResultAttemptId";
import {
  buildTrackingAttributionPayload,
  extractAttributionParamsFromSearchParams,
  readStoredTrackingAttributionPayload,
  toAttemptAttributionPayload,
  type TrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import {
  createTakeFlowController,
  recoverStaleAttemptSubmit,
  resolveStaleDraftResetMessage,
  shouldBlockInvalidDraftOnTakePage,
} from "@/lib/attempt/staleAttempt";

function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

function resolveAuthErrorMessage(locale: "en" | "zh"): string {
  if (locale === "zh") {
    return "登录状态已失效，请刷新页面后重试。";
  }
  return "Authentication expired. Please refresh and try again.";
}

function resolveGuestTokenFailureMessage(locale: "en" | "zh"): string {
  if (locale === "zh") {
    return "认证服务暂时不可用，请稍后重试。";
  }
  return "Authentication service is temporarily unavailable. Please retry later.";
}

function resolveNoTokenServiceMessage(locale: "en" | "zh"): string {
  if (locale === "zh") {
    return "提交通道暂时不可用（认证服务未配置），请稍后再试。";
  }
  return "Submission is temporarily unavailable because authentication service is not configured.";
}

function normalizeRetryAfterSeconds(value: unknown): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.max(1, Math.ceil(numeric));
}

function readRetryAfterSeconds(error: unknown): number | null {
  if (!(error instanceof ApiError)) {
    return null;
  }

  const details = error.details && typeof error.details === "object"
    ? (error.details as Record<string, unknown>)
    : null;

  const nestedDetails = details?.details && typeof details.details === "object"
    ? (details.details as Record<string, unknown>)
    : null;

  return normalizeRetryAfterSeconds(
    details?.retry_after_seconds
    ?? details?.retry_after
    ?? nestedDetails?.retry_after_seconds
    ?? nestedDetails?.retry_after
  );
}

function resolveRateLimitMessage(locale: "en" | "zh", retryAfterSeconds: number | null): string {
  if (retryAfterSeconds) {
    if (locale === "zh") {
      return `请求过于频繁，请等待 ${retryAfterSeconds} 秒后重试。`;
    }
    return `Too many requests. Please wait ${retryAfterSeconds} seconds before retrying.`;
  }

  if (locale === "zh") {
    return "请求过于频繁，请稍后重试。";
  }
  return "Too many requests. Please retry later.";
}

function resolveRetryButtonLabel(locale: "en" | "zh", retryAfterSeconds: number | null): string {
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    if (locale === "zh") {
      return `请等待 ${retryAfterSeconds} 秒`;
    }
    return `Wait ${retryAfterSeconds}s`;
  }

  return "Retry";
}

function resolveTakeLoadingCopy(locale: "en" | "zh", isIqScale: boolean): string {
  if (locale === "zh") {
    return isIqScale ? "正在加载智商测试题目..." : "正在加载题目...";
  }

  return isIqScale ? "Loading IQ questions..." : "Loading questions...";
}

function resolveTakeEmptyCopy(locale: "en" | "zh", isIqScale: boolean): string {
  if (locale === "zh") {
    return isIqScale ? "当前暂无可用的智商测试题目。" : "当前暂无可用题目。";
  }

  return isIqScale ? "No questions are available for this IQ test yet." : "No questions found for this test.";
}

function resolveUnsupportedQuestionCopy(locale: "en" | "zh"): string {
  if (locale === "zh") {
    return "当前题目格式暂不受此版本支持，请稍后再试。";
  }

  return "This question format is not supported in the current frontend yet.";
}

function resolveSubmitLabel(locale: "en" | "zh", submitting: boolean, fallback: string): string {
  if (!submitting) {
    return fallback;
  }

  return locale === "zh" ? "提交中..." : "Submitting...";
}

function resolveStatusTitle(locale: "en" | "zh", kind: "error" | "empty"): string {
  if (locale === "zh") {
    return kind === "error" ? "暂时无法继续" : "暂无内容";
  }

  return kind === "error" ? "Something went wrong" : "Nothing to show yet";
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

function toUiError(
  error: unknown,
  fallback: string,
  locale: "en" | "zh"
): {
  message: string;
  retryAfterSeconds: number | null;
} {
  if (isGuestTokenEndpointMissingError(error)) {
    return {
      message: resolveNoTokenServiceMessage(locale),
      retryAfterSeconds: null,
    };
  }
  if (isGuestTokenRequestError(error)) {
    return {
      message: resolveGuestTokenFailureMessage(locale),
      retryAfterSeconds: null,
    };
  }
  if (isUnauthorizedError(error)) {
    return {
      message: resolveAuthErrorMessage(locale),
      retryAfterSeconds: null,
    };
  }
  if (error instanceof ApiError && error.status === 429) {
    const retryAfterSeconds = readRetryAfterSeconds(error);
    return {
      message: resolveRateLimitMessage(locale, retryAfterSeconds),
      retryAfterSeconds,
    };
  }

  return {
    message: error instanceof Error && error.message ? error.message : fallback,
    retryAfterSeconds: null,
  };
}

function normalizeQueryValue(value: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function readTakeFlowAttribution(
  searchParams: ReadonlyURLSearchParams,
  scaleCode: string
): {
  attribution: AttemptAttributionPayload;
  compareIntent: boolean;
  entryContext: {
    entrySurface?: string;
    sourcePageType?: string;
    targetAction?: string;
    testSlug?: string;
    landingPath?: string;
  };
  trackingAttribution: TrackingAttributionPayload;
} {
  const isMbti = isMbtiScaleCode(scaleCode);
  const share_id = normalizeQueryValue(searchParams.get("share_id"));
  const compare_invite_id = normalizeQueryValue(searchParams.get("compare_invite_id"));
  const invite_unlock_code = isMbti
    ? normalizeQueryValue(searchParams.get("invite_code"))
      ?? normalizeQueryValue(searchParams.get("invite_unlock_code"))
    : undefined;
  const share_click_id = normalizeQueryValue(searchParams.get("share_click_id"));
  const entrypoint = normalizeQueryValue(searchParams.get("entrypoint"));
  const referrer = normalizeQueryValue(searchParams.get("referrer"));
  const landing_path = normalizeQueryValue(searchParams.get("landing_path"));
  const source = normalizeQueryValue(searchParams.get("utm_source"));
  const medium = normalizeQueryValue(searchParams.get("utm_medium"));
  const campaign = normalizeQueryValue(searchParams.get("utm_campaign"));
  const term = normalizeQueryValue(searchParams.get("utm_term"));
  const content = normalizeQueryValue(searchParams.get("utm_content"));
  const entrySurface = normalizeQueryValue(searchParams.get("entry_surface"));
  const sourcePageType = normalizeQueryValue(searchParams.get("source_page_type"));
  const targetAction = normalizeQueryValue(searchParams.get("target_action"));
  const testSlug = normalizeQueryValue(searchParams.get("test_slug"));
  const compareIntent = searchParams.get("compare_intent") === "true";
  const attributionParams = extractAttributionParamsFromSearchParams(
    new URLSearchParams(searchParams.toString())
  );
  const storedAttribution = readStoredTrackingAttributionPayload();
  const trackingAttribution = {
    ...storedAttribution,
    ...buildTrackingAttributionPayload(attributionParams, {
      referrer: referrer ?? storedAttribution.referrer,
      landingPath: landing_path ?? storedAttribution.landing_path,
    }),
  };
  const attemptAttribution = toAttemptAttributionPayload(trackingAttribution);

  return {
    attribution: {
      ...(share_id ? { share_id } : {}),
      ...(compare_invite_id ? { compare_invite_id } : {}),
      ...(invite_unlock_code ? { invite_unlock_code } : {}),
      ...(share_click_id ? { share_click_id } : {}),
      ...(entrypoint ? { entrypoint } : {}),
      ...attemptAttribution,
      ...(source || medium || campaign || term || content
        ? {
            utm: {
              source: source ?? null,
              medium: medium ?? null,
              campaign: campaign ?? null,
              term: term ?? null,
              content: content ?? null,
            },
          }
        : {}),
    },
    compareIntent,
    entryContext: {
      ...(entrySurface ? { entrySurface } : {}),
      ...(sourcePageType ? { sourcePageType } : {}),
      ...(targetAction ? { targetAction } : {}),
      ...(testSlug ? { testSlug } : {}),
      ...(landing_path ? { landingPath: landing_path } : {}),
    },
    trackingAttribution,
  };
}

type TakeQuestion = IqTakeQuestion;

export default function QuizTakeClient({
  slug,
  testTitle,
  scaleCode,
  formCode,
  estimatedMinutes,
  questionCount,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
  formCode?: string;
  estimatedMinutes?: number;
  questionCount?: number;
}) {
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const resolvedFormCode = useMemo(
    () => (isMbtiScaleCode(scaleCode) ? normalizeMbtiFormCode(formCode) : undefined),
    [formCode, scaleCode]
  );
  return (
    <QuizStoreProvider
      slug={slug}
      anonId={anonId || null}
      formCode={resolvedFormCode ?? null}
      initialQuestionIds={questionIds}
    >
      <QuizTakeInner
        slug={slug}
        testTitle={testTitle}
        scaleCode={scaleCode}
        formCode={resolvedFormCode}
        estimatedMinutes={estimatedMinutes}
        questionCount={questionCount}
        anonId={anonId}
        questions={questions}
        setQuestions={setQuestions}
      />
    </QuizStoreProvider>
  );
}

function QuizTakeInner({
  slug,
  testTitle,
  scaleCode,
  formCode,
  estimatedMinutes,
  questionCount,
  anonId,
  questions,
  setQuestions,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
  formCode?: string;
  estimatedMinutes?: number;
  questionCount?: number;
  anonId: string;
  questions: TakeQuestion[];
  setQuestions: (nextQuestions: TakeQuestion[]) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "/";
  useConstrainQuizUrlTokens({ pathname, router, searchParams });
  const locale = getLocaleFromPathname(pathname);
  const withLocale = (path: string) => localizedPath(path, locale);
  const dict = getDictSync(locale);
  const { attribution, compareIntent, entryContext, trackingAttribution } = useMemo(
    () => readTakeFlowAttribution(searchParams, scaleCode),
    [scaleCode, searchParams]
  );
  const forceNewAttemptRequested = searchParams.get("force_new_attempt") === "1";

  const currentIndex = useQuizStore((store) => store.state.currentIndex);
  const answers = useQuizStore((store) => store.state.answers);
  const startedAt = useQuizStore((store) => store.state.startedAt);
  const attemptId = useQuizStore((store) => store.state.attemptId);
  const savedScaleCode = useQuizStore((store) => store.state.scaleCode);
  const savedFormCode = useQuizStore((store) => store.state.formCode);

  const setAnswer = useQuizStore((store) => store.setAnswer);
  const jump = useQuizStore((store) => store.jump);
  const setAttemptMeta = useQuizStore((store) => store.setAttemptMeta);
  const clearAttemptMeta = useQuizStore((store) => store.clearAttemptMeta);
  const resetAttempt = useQuizStore((store) => store.resetAttempt);

  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [authBlockError, setAuthBlockError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [staleDraftError, setStaleDraftError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitOverlayVisible, setSubmitOverlayVisible] = useState(false);
  const [submitOverlayPhase, setSubmitOverlayPhase] = useState(0);
  const mountedRef = useRef(true);
  const takeFlowRef = useRef(createTakeFlowController());
  const latestAnswersRef = useRef<Record<string, string>>(answers);
  const ensureAttemptPromiseRef = useRef<Promise<string | null> | null>(null);
  const submitInFlightRef = useRef(false);
  const autoRecoveryAttemptedRef = useRef(false);
  const recoveringAttemptRef = useRef(false);
  const cancelAutoAdvanceRef = useRef<() => void>(() => {});
  const inviteLinkOpenedTrackedRef = useRef(false);
  const forceNewAttemptAppliedRef = useRef(false);
  const immersiveEnabled = isImmersiveSingleFlowEnabled();
  const showsMbtiQuizChrome = isMbtiScaleCode(scaleCode);
  const quizHeaderBrand = showsMbtiQuizChrome ? testTitle : dict.header.brand;
  const trackedStartRef = useRef(false);
  const resolvedFormCode = useMemo(
    () => (isMbtiScaleCode(scaleCode) ? normalizeMbtiFormCode(formCode) : undefined),
    [formCode, scaleCode]
  );
  const normalizedScaleCode = useMemo(() => scaleCode.trim().toUpperCase(), [scaleCode]);
  const isIqScale = useMemo(() => isIqScaleCode(normalizedScaleCode), [normalizedScaleCode]);
  const matchesSavedAttempt = useMemo(() => {
    if (!attemptId || savedScaleCode !== scaleCode) {
      return false;
    }
    if (!resolvedFormCode) {
      return true;
    }
    return savedFormCode === resolvedFormCode;
  }, [attemptId, resolvedFormCode, savedFormCode, savedScaleCode, scaleCode]);

  useEffect(() => {
    if (!attribution.invite_unlock_code || inviteLinkOpenedTrackedRef.current) {
      return;
    }

    inviteLinkOpenedTrackedRef.current = true;
    trackEvent("invite_link_opened", {
      scale_code: normalizedScaleCode,
      unlock_stage: "locked",
      unlock_source: "invite",
      completed_invitees: 0,
      required_invitees: 2,
      target_attempt_id: null,
      attempt_id: attemptId ?? null,
      form_code: resolvedFormCode ?? undefined,
      entry_surface: "quiz_take",
      locale,
    });
  }, [attemptId, attribution.invite_unlock_code, locale, normalizedScaleCode, resolvedFormCode]);

  const trackGuestTokenFailure = useCallback(
    (stage: "bootstrap" | "questions" | "start_attempt" | "submit_attempt", error: unknown) => {
      const telemetry = resolveGuestTokenTelemetry(error);
      trackEvent("auth_guest_token_failure", {
        scale_code: scaleCode,
        stage,
        status_code: telemetry.statusCode,
        error_code: telemetry.errorCode,
        request_id: telemetry.requestId,
        route: "/tests/[slug]/take",
        locale,
      });
    },
    [locale, scaleCode]
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      setAuthBlockError(null);

      try {
        await ensureFmTokenReady({
          anonId: anonId || undefined,
          locale,
        });
      } catch (error) {
        if (!active) return;

        trackGuestTokenFailure("bootstrap", error);

        if (isGuestTokenEndpointMissingError(error)) {
          setAuthBlockError(resolveNoTokenServiceMessage(locale));
          const telemetry = resolveGuestTokenTelemetry(error);
          trackEvent("submit_blocked_no_token_service", {
            scale_code: scaleCode,
            status_code: telemetry.statusCode,
            error_code: telemetry.errorCode,
            request_id: telemetry.requestId,
            route: "/tests/[slug]/take",
            locale,
          });
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, locale, scaleCode, trackGuestTokenFailure]);

  useEffect(() => {
    if (!retryAfterSeconds || retryAfterSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRetryAfterSeconds((current) => {
        if (!current || current <= 1) {
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [retryAfterSeconds]);

  const runWithAuthRetry = useCallback(
    async <T,>(
      stage: "questions" | "start_attempt" | "submit_attempt",
      runner: () => Promise<T>
    ): Promise<T> =>
      runWithGuestTokenRetry({
        runner,
        anonId,
        locale,
        onGuestTokenFailure: (guestTokenError) => {
          trackGuestTokenFailure(stage, guestTokenError);

          if (isGuestTokenEndpointMissingError(guestTokenError)) {
            setAuthBlockError(resolveNoTokenServiceMessage(locale));
            const telemetry = resolveGuestTokenTelemetry(guestTokenError);
            trackEvent("submit_blocked_no_token_service", {
              scale_code: scaleCode,
              status_code: telemetry.statusCode,
              error_code: telemetry.errorCode,
              request_id: telemetry.requestId,
              route: "/tests/[slug]/take",
              locale,
            });
          }
        },
      }),
    [anonId, locale, scaleCode, trackGuestTokenFailure]
  );

  const isFlowActive = useCallback((runId?: number) => (
    mountedRef.current && takeFlowRef.current.isActive(runId)
  ), []);

  const cancelPendingSubmitSideEffects = useCallback(() => {
    takeFlowRef.current.cancelCurrentRun();
    cancelAutoAdvanceRef.current();
    submitInFlightRef.current = false;
    recoveringAttemptRef.current = false;
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (authBlockError) {
        setQuestionsLoading(false);
        return;
      }

      setQuestionsLoading(true);
      setQuestionsError(null);

      try {
        if (isIqScale) {
          const response = await getIqQuestions({
            locale,
            anonId,
          });

          if (!active) return;

          const orderedQuestions = [...response.questions.items].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          const normalizedQuestions = normalizeIqQuestionsForTake({
            items: orderedQuestions,
            locale,
          });

          if (orderedQuestions.length > 0 && normalizedQuestions.length === 0) {
            setQuestions([]);
            setQuestionsError(resolveUnsupportedQuestionCopy(locale));
            setRetryAfterSeconds(null);
            return;
          }

          setQuestions(normalizedQuestions);
        } else {
          const response = await runWithAuthRetry("questions", () =>
            fetchScaleQuestions({ scaleCode, formCode: resolvedFormCode, anonId })
          );

          if (!active) return;

          const orderedQuestions = [...response.questions.items].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );

          setQuestions(
            normalizeQuizQuestions({
              items: orderedQuestions,
              locale,
              meta: response.meta,
              optionsFormat: response.options?.format,
            })
          );
        }
        setRetryAfterSeconds(null);
      } catch (error) {
        if (!active) return;
        const uiError = toUiError(error, "Failed to load questions.", locale);
        setQuestionsError(uiError.message);
        setRetryAfterSeconds(uiError.retryAfterSeconds);
        const classified = classifyApiError(error);
        trackEvent("questions_load_failure", {
          scale_code: scaleCode,
          stage: "questions",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          request_id: classified.requestId,
          route: "/tests/[slug]/take",
          locale,
        });
        captureError(error, {
          route: "/tests/[slug]/take",
          slug,
          scaleCode,
          stage: "load_questions",
        });
        setQuestions([]);
      } finally {
        if (active) setQuestionsLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, authBlockError, isIqScale, locale, resolvedFormCode, runWithAuthRetry, scaleCode, setQuestions, slug]);

  useEffect(() => {
    latestAnswersRef.current = answers;
  }, [answers]);

  const startFreshAttempt = useCallback(async (runId?: number): Promise<string | null> => {
    if (authBlockError || staleDraftError) {
      return null;
    }

    if (ensureAttemptPromiseRef.current) {
      return ensureAttemptPromiseRef.current;
    }

    setAttemptError(null);

    const pending = (async () => {
      try {
        const response = isIqScale
          ? await startIqAttempt({
              scale_code: IQ_CANONICAL_SCALE_CODE,
              anon_id: anonId,
              locale,
              source: "take_page",
              meta: {
                ...(entryContext.entrySurface ? { entry_surface: entryContext.entrySurface } : {}),
                ...(entryContext.sourcePageType ? { source_page_type: entryContext.sourcePageType } : {}),
                ...(entryContext.targetAction ? { target_action: entryContext.targetAction } : {}),
                ...(entryContext.testSlug ? { test_slug: entryContext.testSlug } : {}),
                ...(entryContext.landingPath ? { landing_path: entryContext.landingPath } : {}),
              },
              referrer: attribution.referrer,
              share_id: attribution.share_id,
              compare_invite_id: attribution.compare_invite_id,
              invite_unlock_code: attribution.invite_unlock_code,
              share_click_id: attribution.share_click_id,
              entrypoint: attribution.entrypoint,
              landing_path: attribution.landing_path,
              utm: attribution.utm,
            })
          : await runWithAuthRetry("start_attempt", () =>
              startAttempt({
                scaleCode,
                formCode: resolvedFormCode,
                anonId,
                meta: {
                  ...(entryContext.entrySurface ? { entry_surface: entryContext.entrySurface } : {}),
                  ...(entryContext.sourcePageType ? { source_page_type: entryContext.sourcePageType } : {}),
                  ...(entryContext.targetAction ? { target_action: entryContext.targetAction } : {}),
                  ...(entryContext.testSlug ? { test_slug: entryContext.testSlug } : {}),
                  ...(entryContext.landingPath ? { landing_path: entryContext.landingPath } : {}),
                },
                ...attribution,
              })
            );

        if (!isFlowActive(runId)) {
          return null;
        }
        setAttemptMeta(response.attempt_id, scaleCode, resolvedFormCode ?? null);
        setRetryAfterSeconds(null);
        return response.attempt_id;
      } catch (error) {
        if (!isFlowActive(runId)) {
          return null;
        }
        const uiError = toUiError(error, "Failed to start attempt.", locale);
        setAttemptError(uiError.message);
        setRetryAfterSeconds(uiError.retryAfterSeconds);
        const classified = classifyApiError(error);
        trackEvent("submit_failure", {
          scale_code: scaleCode,
          stage: "start_attempt",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          route: "/tests/[slug]/take",
          locale,
        });
        captureError(error, {
          route: "/tests/[slug]/take",
          slug,
          scaleCode,
          stage: "start_attempt",
        });
        return null;
      } finally {
        ensureAttemptPromiseRef.current = null;
      }
    })();

    ensureAttemptPromiseRef.current = pending;
    return pending;
  }, [
    anonId,
    attribution,
    authBlockError,
    entryContext.entrySurface,
    entryContext.landingPath,
    entryContext.sourcePageType,
    entryContext.targetAction,
    entryContext.testSlug,
    isFlowActive,
    isIqScale,
    locale,
    resolvedFormCode,
    runWithAuthRetry,
    scaleCode,
    setAttemptMeta,
    slug,
    staleDraftError,
  ]);

  const ensureAttempt = useCallback(async (runId?: number): Promise<string | null> => {
    if (authBlockError || staleDraftError || recoveringAttemptRef.current) {
      return null;
    }

    if (forceNewAttemptRequested && !forceNewAttemptAppliedRef.current) {
      forceNewAttemptAppliedRef.current = true;
      clearAttemptMeta();
      return startFreshAttempt(runId);
    }

    if (matchesSavedAttempt) {
      return attemptId;
    }

    return startFreshAttempt(runId);
  }, [
    attemptId,
    authBlockError,
    clearAttemptMeta,
    forceNewAttemptRequested,
    matchesSavedAttempt,
    staleDraftError,
    startFreshAttempt,
  ]);

  const total = questions.length;
  const question = questions[currentIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;
  const loadError = authBlockError ?? questionsError;
  const answeredCount = useMemo(
    () => questions.reduce((count, item) => count + (answers[item.id] ? 1 : 0), 0),
    [answers, questions]
  );

  useEffect(() => {
    if (!attemptId || trackedStartRef.current) return;
    trackedStartRef.current = true;

    const eventPayload = {
      ...trackingAttribution,
      slug,
      scaleCode,
      scale_code: normalizedScaleCode,
      test_slug: entryContext.testSlug ?? slug,
      ...(entryContext.entrySurface ? { entry_surface: entryContext.entrySurface } : {}),
      ...(entryContext.sourcePageType ? { source_page_type: entryContext.sourcePageType } : {}),
      ...(entryContext.targetAction ? { target_action: entryContext.targetAction } : {}),
      ...(entryContext.landingPath ? { landing_path: entryContext.landingPath } : {}),
      ...(resolvedFormCode ? { form_code: resolvedFormCode } : {}),
      attempt_id: attemptId,
      attemptIdMasked: `${attemptId.slice(0, 6)}...${attemptId.slice(-4)}`,
      locale,
    };

    if (isMbtiScaleCode(scaleCode)) {
      trackObservableFunnelEvent("start_attempt", eventPayload);
      return;
    }

    trackEvent("start_attempt", eventPayload);
  }, [attemptId, entryContext.entrySurface, entryContext.landingPath, entryContext.sourcePageType, entryContext.targetAction, entryContext.testSlug, locale, normalizedScaleCode, resolvedFormCode, scaleCode, slug, trackingAttribution]);

  useEffect(() => {
    const takeFlow = takeFlowRef.current;
    return () => {
      mountedRef.current = false;
      takeFlow.dispose();
      submitInFlightRef.current = false;
      recoveringAttemptRef.current = false;
    };
  }, []);
  const shouldBlockStaleDraft = shouldBlockInvalidDraftOnTakePage({
    answeredCount,
    totalQuestions: total,
    attemptId,
  });

  const compareRedirectInviteId =
    normalizedScaleCode === "MBTI" && (compareIntent || Boolean(attribution.compare_invite_id))
      ? attribution.compare_invite_id
      : undefined;
  const isLastQuestion = total > 0 && currentIndex === total - 1;
  const iqNeedsSelection = isIqScale && !selectedOptionId;
  const iqCanContinue = isIqScale && Boolean(selectedOptionId) && !submitting && !submitOverlayVisible;
  const iqCanSubmit = isIqScale && isLastQuestion && answeredCount === total && Boolean(selectedOptionId) && !submitting && !submitOverlayVisible;
  const fallbackQuestionCount = typeof questionCount === "number" && questionCount > 0 ? questionCount : total;
  const resolvedEstimatedMinutes = useMemo(() => {
    if (typeof estimatedMinutes === "number" && estimatedMinutes > 0) {
      return Math.round(estimatedMinutes);
    }
    if (fallbackQuestionCount > 0) {
      return Math.max(1, Math.ceil(fallbackQuestionCount / 10));
    }
    return null;
  }, [estimatedMinutes, fallbackQuestionCount]);
  const progressText =
    locale === "zh"
      ? `第 ${currentIndex + 1} 题 / 共 ${Math.max(total, 1)} 题`
      : `Question ${currentIndex + 1} / ${Math.max(total, 1)}`;
  const questionOptions = useMemo(
    () =>
      question
        ? question.options.map((option) => ({
            code: option.id,
            text: option.text,
            svg: option.svg,
          }))
        : [],
    [question]
  );
  const useV2LikertScale =
    !isIqScale &&
    questionOptions.length === 5 &&
    questionOptions.every((option) => option.svg == null);

  useEffect(() => {
    if (questionsLoading) {
      return;
    }

    if (shouldBlockStaleDraft) {
      clearAttemptMeta();
      cancelPendingSubmitSideEffects();
      setSubmitOverlayVisible(false);
      setSubmitOverlayPhase(0);
      setSubmitting(false);
      setSubmitError(null);
      setAttemptError(null);
      setStaleDraftError(resolveStaleDraftResetMessage(locale));
      return;
    }

    setStaleDraftError(null);
  }, [cancelPendingSubmitSideEffects, clearAttemptMeta, locale, questionsLoading, shouldBlockStaleDraft]);

  const buildAnswersSnapshot = useCallback((pendingSelection?: LastSelectionContext) => {
    const snapshot = {
      ...latestAnswersRef.current,
    };

    if (pendingSelection?.questionId && pendingSelection.code) {
      snapshot[pendingSelection.questionId] = pendingSelection.code;
    }

    return snapshot;
  }, []);

  const handleAnswerSelection = useCallback((questionId: string, code: string) => {
    const shouldPrimeAttempt = !attemptId && !matchesSavedAttempt && Object.keys(latestAnswersRef.current).length === 0;
    setAnswer(questionId, code);

    if (shouldPrimeAttempt) {
      void ensureAttempt();
    }
  }, [attemptId, ensureAttempt, matchesSavedAttempt, setAnswer]);

  const submitAttemptWithId = useCallback(async (
    activeAttemptId: string,
    answersSnapshot: Record<string, string>,
    runId?: number,
  ): Promise<string> => {
    const durationMs = Math.max(1000, Date.now() - startedAt);

    const response = isIqScale
      ? await submitIqAttempt({
          attempt_id: activeAttemptId,
          anon_id: anonId,
          answers: buildIqSubmitAnswers({
            questions,
            answersByQuestionId: answersSnapshot,
          }),
          duration_ms: durationMs,
          referrer: attribution.referrer,
          share_id: attribution.share_id,
          compare_invite_id: attribution.compare_invite_id,
          invite_unlock_code: attribution.invite_unlock_code,
          share_click_id: attribution.share_click_id,
          entrypoint: attribution.entrypoint,
          landing_path: attribution.landing_path,
          utm: attribution.utm,
        })
      : await runWithAuthRetry("submit_attempt", () =>
          submitAttempt({
            attemptId: activeAttemptId,
            answers: questions.map((item) => ({
              question_id: item.id,
              code: answersSnapshot[item.id] ?? "",
            })),
            durationMs,
            anonId,
            ...attribution,
          })
        );
    if (!isFlowActive(runId)) {
      return "";
    }

    if (!response.ok) {
      throw new Error("Submit failed. Please try again.");
    }

    const resultAttemptId = resolveResultAttemptId(response, activeAttemptId);
    const eventPayload = {
      ...trackingAttribution,
      slug,
      scaleCode,
      scale_code: normalizedScaleCode,
      test_slug: entryContext.testSlug ?? slug,
      ...(entryContext.entrySurface ? { entry_surface: entryContext.entrySurface } : {}),
      ...(entryContext.sourcePageType ? { source_page_type: entryContext.sourcePageType } : {}),
      ...(entryContext.targetAction ? { target_action: entryContext.targetAction } : {}),
      ...(entryContext.landingPath ? { landing_path: entryContext.landingPath } : {}),
      attempt_id: resultAttemptId,
      attemptIdMasked: `${resultAttemptId.slice(0, 6)}...${resultAttemptId.slice(-4)}`,
      durationMs,
      ...(resolvedFormCode ? { form_code: resolvedFormCode } : {}),
      locale,
    };
    if (isMbtiScaleCode(scaleCode)) {
      trackObservableFunnelEvent("submit_attempt", eventPayload);
    } else {
      trackEvent("submit_attempt", eventPayload);
    }
    return resultAttemptId;
  }, [anonId, attribution, entryContext.entrySurface, entryContext.landingPath, entryContext.sourcePageType, entryContext.targetAction, entryContext.testSlug, isFlowActive, isIqScale, locale, normalizedScaleCode, questions, resolvedFormCode, runWithAuthRetry, scaleCode, slug, startedAt, trackingAttribution]);

  const handleSubmit = async (pendingSelection?: LastSelectionContext, runId?: number): Promise<string | null> => {
    if (submitInFlightRef.current || staleDraftError) {
      return null;
    }

    submitInFlightRef.current = true;
    const activeRunId = typeof runId === "number" ? runId : takeFlowRef.current.beginRun();
    const activeAttemptId = await ensureAttempt(activeRunId);
    if (!isFlowActive(activeRunId)) {
      submitInFlightRef.current = false;
      return null;
    }
    if (!activeAttemptId) {
      submitInFlightRef.current = false;
      return null;
    }

    const answersSnapshot = buildAnswersSnapshot(pendingSelection);
    const payloadAnswers = questions.map((item) => ({
      question_id: item.id,
      code: answersSnapshot[item.id] ?? "",
    }));

    const firstMissingIndex = payloadAnswers.findIndex((item) => !item.code);
    if (firstMissingIndex >= 0) {
      if (isFlowActive(activeRunId)) {
        setSubmitError("Please answer every question before submitting.");
        jump(firstMissingIndex, total);
      }
      return null;
    }

    if (!isFlowActive(activeRunId)) {
      submitInFlightRef.current = false;
      return null;
    }

    setSubmitting(true);
    setSubmitError(null);
    setStaleDraftError(null);

    try {
      const resultAttemptId = await submitAttemptWithId(activeAttemptId, answersSnapshot, activeRunId);
      if (!isFlowActive(activeRunId) || !resultAttemptId) {
        return null;
      }
      setAttemptError(null);
      setRetryAfterSeconds(null);
      return resultAttemptId;
    } catch (error) {
      recoveringAttemptRef.current = true;
      const recovery = await recoverStaleAttemptSubmit({
        error,
        alreadyRecovered: autoRecoveryAttemptedRef.current,
        clearAttemptState: () => {
          clearAttemptMeta();
          setAttemptError(null);
        },
        startFreshAttempt: () => startFreshAttempt(activeRunId),
        submitFreshAttempt: (nextAttemptId) => submitAttemptWithId(nextAttemptId, answersSnapshot, activeRunId),
      });
      if (!isFlowActive(activeRunId)) {
        return null;
      }
      recoveringAttemptRef.current = false;

      if (recovery.kind === "recovered") {
        autoRecoveryAttemptedRef.current = true;
        setSubmitError(null);
        setStaleDraftError(null);
        return recovery.value;
      }

      if (recovery.kind === "failed") {
        autoRecoveryAttemptedRef.current = true;
        const message = resolveStaleDraftResetMessage(locale);
        setStaleDraftError(message);
        setSubmitError(null);
        return null;
      }

      const uiError = toUiError(error, "Submit failed.", locale);
      setSubmitError(uiError.message);
      setRetryAfterSeconds(uiError.retryAfterSeconds);
      const classified = classifyApiError(error);
      trackEvent("submit_failure", {
        scale_code: scaleCode,
        stage: "submit_attempt",
        status_group: classified.statusGroup,
        status_code: classified.statusCode,
        error_code: classified.errorCode,
        route: "/tests/[slug]/take",
        locale,
      });
      captureError(error, {
        route: "/tests/[slug]/take",
        slug,
        scaleCode,
        stage: "submit_attempt",
      });
      return null;
    } finally {
      recoveringAttemptRef.current = false;
      if (isFlowActive(activeRunId)) {
        setSubmitting(false);
      }
      submitInFlightRef.current = false;
    }
  };

  const finalizeSuccessfulSubmit = (resultAttemptId: string) => {
    cancelPendingSubmitSideEffects();
    resetAttempt();
    router.push(
      compareRedirectInviteId
        ? withLocale(`/compare/mbti/${compareRedirectInviteId}`)
        : withLocale(`/result/${resultAttemptId}`)
    );
  };

  const startSubmitOverlayPhases = (runId: number) => {
    setSubmitOverlayPhase(0);

    trackEvent("ui_report_loading_phase", {
      scale_code: scaleCode,
      phase: "saving",
      locked: true,
      variant: "free",
      locale,
    });

    takeFlowRef.current.schedule(() => {
      setSubmitOverlayPhase(1);
      trackEvent("ui_report_loading_phase", {
        scale_code: scaleCode,
        phase: "analyzing",
        locked: true,
        variant: "free",
        locale,
      });
    }, 800, runId);

    takeFlowRef.current.schedule(() => {
      setSubmitOverlayPhase(2);
      trackEvent("ui_report_loading_phase", {
        scale_code: scaleCode,
        phase: "generating",
        locked: true,
        variant: "free",
        locale,
      });
    }, 1500, runId);
  };

  const handleSubmitWithOverlay = async (pendingSelection?: LastSelectionContext) => {
    if (submitOverlayVisible || submitting) return;
    const runId = takeFlowRef.current.beginRun();
    setSubmitOverlayVisible(true);
    startSubmitOverlayPhases(runId);

    const resultAttemptId = await handleSubmit(pendingSelection, runId);
    if (!isFlowActive(runId)) {
      return;
    }

    const delayFinished = await takeFlowRef.current.wait(2200, runId);
    if (!delayFinished || !isFlowActive(runId)) {
      return;
    }

    if (!resultAttemptId) {
      setSubmitOverlayVisible(false);
      setSubmitOverlayPhase(0);
      return;
    }

    finalizeSuccessfulSubmit(resultAttemptId);
  };

  const {
    transitionDirection,
    isTransitioning,
    selectAndAdvance,
    goPrevious,
    goNext,
    cancelPending,
  } = useAutoAdvanceFlow({
    currentIndex,
    total,
    onMove: (index) => jump(index, total),
    onLast: handleSubmitWithOverlay,
    confirmDelayMs: 200,
    enterDurationMs: 280,
  });

  useEffect(() => {
    cancelAutoAdvanceRef.current = cancelPending;
  }, [cancelPending]);

  if (questionsLoading) {
    return (
      <QuizShell>
        <div
          className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-white p-4 shadow-[var(--fm-shadow-sm)] sm:p-6"
          data-testid="iq-take-loading-state"
          role="status"
          aria-live="polite"
        >
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--fm-surface-muted)]" />
            <div className="h-7 w-2/3 animate-pulse rounded-full bg-[var(--fm-surface-muted)]" />
            <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">
              {resolveTakeLoadingCopy(locale, isIqScale)}
            </p>
          </div>
          <div className="aspect-square w-full animate-pulse rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)]" />
          <div className="grid gap-3 min-[390px]:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`iq-loading-option-${idx + 1}`}
                className="min-h-[124px] animate-pulse rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)]"
              />
            ))}
          </div>
        </div>
      </QuizShell>
    );
  }

  if (loadError) {
    return (
      <QuizShell>
        <div
          className="space-y-4 rounded-2xl border border-rose-200 bg-white p-4 shadow-[var(--fm-shadow-sm)] sm:p-6"
          data-testid="iq-take-error-state"
          role="alert"
        >
          <div className="space-y-2">
            <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">
              {resolveStatusTitle(locale, "error")}
            </h2>
            <p className="m-0 text-sm leading-6 text-rose-700">{loadError}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(retryAfterSeconds && retryAfterSeconds > 0)}
              onClick={() => window.location.reload()}
            >
              {resolveRetryButtonLabel(locale, retryAfterSeconds)}
            </Button>
          </div>
        </div>
      </QuizShell>
    );
  }

  if (staleDraftError) {
    return (
      <QuizShell>
        <StaleDraftResetPrompt
          locale={locale}
          message={staleDraftError}
          onReset={() => {
            cancelPendingSubmitSideEffects();
            autoRecoveryAttemptedRef.current = false;
            resetAttempt();
            setStaleDraftError(null);
            setSubmitError(null);
            setAttemptError(null);
          }}
        />
      </QuizShell>
    );
  }

  if (!question) {
    return (
      <QuizShell>
        <div
          className="space-y-2 rounded-2xl border border-dashed border-[var(--fm-border)] bg-white p-4 shadow-[var(--fm-shadow-sm)] sm:p-6"
          data-testid="iq-take-empty-state"
        >
          <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">
            {resolveStatusTitle(locale, "empty")}
          </h2>
          <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">
            {resolveTakeEmptyCopy(locale, isIqScale)}
          </p>
        </div>
      </QuizShell>
    );
  }

  if (immersiveEnabled) {
    return (
      <>
        <ImmersiveTakeLayout
          backHref={withLocale(`/tests/${slug}`)}
          backLabel={dict.quiz.immersive.backToDetails}
          current={currentIndex + 1}
          total={total}
          answered={answeredCount}
          previousLabel={dict.quiz.immersive.previous}
          previousDisabled={currentIndex === 0 || submitting || submitOverlayVisible}
          onPrevious={goPrevious}
          transitionKey={question.id}
          transitionDirection={transitionDirection}
          isTransitioning={isTransitioning}
          headerSlot={
            <QuizTakeHeaderV2
              brand={quizHeaderBrand}
              completedPrefix={dict.header.completedPrefix}
              completedSuffix={dict.header.completedSuffix}
              estimatedTimeLabel={dict.quiz.estimatedTimeLabel}
              minutesUnit={dict.common.minutes_unit}
              estimatedMinutes={resolvedEstimatedMinutes}
              progressText={progressText}
              current={currentIndex + 1}
              total={total}
              answered={answeredCount}
              backHref={withLocale(`/tests/${slug}`)}
              backLabel={dict.quiz.immersive.backToDetails}
            />
          }
          footerSlot={
            isIqScale ? (
              <div className="flex flex-col gap-[var(--fm-gap-sm)] sm:flex-row sm:items-center">
                {submitError ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting || submitOverlayVisible}
                    onClick={() => {
                      void handleSubmitWithOverlay();
                    }}
                  >
                    {dict.quiz.immersive.submitRetry}
                  </Button>
                ) : null}

                {isLastQuestion ? (
                  <Button
                    type="button"
                    onClick={() => {
                      void handleSubmitWithOverlay();
                    }}
                    disabled={!iqCanSubmit}
                  >
                    {resolveSubmitLabel(locale, submitting, dict.quiz.iq.submit)}
                  </Button>
                ) : (
                  <Button type="button" onClick={goNext} disabled={!iqCanContinue}>
                    {dict.quiz.iq.next}
                  </Button>
                )}
              </div>
            ) : submitError ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting || submitOverlayVisible}
                onClick={() => {
                  void handleSubmitWithOverlay();
                }}
              >
                {dict.quiz.immersive.submitRetry}
              </Button>
            ) : (
              <div className="min-h-[44px]" aria-hidden />
            )
          }
        >
          <article className="space-y-[var(--fm-space-4)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-4)] shadow-[var(--fm-shadow-md)] sm:space-y-[var(--fm-space-5)] sm:p-[var(--fm-space-6)]">
            {!showsMbtiQuizChrome ? (
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">{testTitle}</p>
            ) : null}
            <h2 className="m-0 text-xl font-semibold leading-8 text-[var(--fm-text)] sm:text-2xl sm:leading-9">{question.title}</h2>

            {question.stem?.svg ? (
              <IqStemSvg stem={question.stem} className={isIqScale ? "max-h-[460px]" : "max-h-[320px]"} />
            ) : null}

            {isIqScale ? (
              <p className="m-0 text-sm font-medium text-[var(--fm-text-muted)]">{dict.quiz.iq.pickPrompt}</p>
            ) : null}

            {isIqScale ? (
              <IqOptionBoard
                questionId={question.id}
                options={questionOptions}
                value={selectedOptionId}
                locale={locale}
                noOptionsLabel={dict.quiz.immersive.noOptions}
                onChange={(code) => handleAnswerSelection(question.id, code)}
              />
            ) : useV2LikertScale ? (
              <V2LikertScale
                questionId={question.id}
                options={questionOptions.map((option) => ({
                  code: option.code,
                  text: option.text,
                }))}
                value={selectedOptionId}
                onChange={(code) =>
                  selectAndAdvance(() => {
                    handleAnswerSelection(question.id, code);
                  }, {
                    questionId: question.id,
                    code,
                  })
                }
              />
            ) : (
              <AdaptiveOptionGroup
                questionId={question.id}
                options={questionOptions}
                value={selectedOptionId}
                noOptionsLabel={dict.quiz.immersive.noOptions}
                onChange={(code) =>
                  selectAndAdvance(() => {
                    handleAnswerSelection(question.id, code);
                  }, {
                    questionId: question.id,
                    code,
                  })
                }
              />
            )}

            {!isIqScale ? (
              <p className="m-0 text-sm text-[var(--fm-text-muted)]">{dict.quiz.answerTip}</p>
            ) : null}

            {iqNeedsSelection ? (
              <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-700">
                {dict.quiz.iq.selectHint}
              </p>
            ) : null}

            {attemptError ? (
              <p className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700" data-testid="iq-attempt-error">
                {attemptError}
              </p>
            ) : null}
            {submitError ? (
              <p className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700" data-testid="iq-submit-error">
                {submitError}
              </p>
            ) : null}
          </article>
        </ImmersiveTakeLayout>

        <SubmitPhaseOverlay
          visible={submitOverlayVisible}
          phases={dict.quiz.immersive.submitPhases}
          phaseIndex={submitOverlayPhase}
        />
      </>
    );
  }

  return (
    <QuizShell>
      <QuizTakeHeaderV2
        brand={quizHeaderBrand}
        completedPrefix={dict.header.completedPrefix}
        completedSuffix={dict.header.completedSuffix}
        estimatedTimeLabel={dict.quiz.estimatedTimeLabel}
        minutesUnit={dict.common.minutes_unit}
        estimatedMinutes={resolvedEstimatedMinutes}
        progressText={progressText}
        current={currentIndex + 1}
        total={total}
        answered={answeredCount}
        backHref={withLocale(`/tests/${slug}`)}
        backLabel={dict.quiz.immersive.backToDetails}
      />

      <article className="space-y-[var(--fm-space-4)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-4)] shadow-[var(--fm-shadow-md)] sm:space-y-[var(--fm-space-5)] sm:p-[var(--fm-space-6)]">
        {!showsMbtiQuizChrome ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">{testTitle}</p>
        ) : null}
        <h2 className="m-0 text-xl font-semibold leading-8 text-[var(--fm-text)] sm:text-2xl sm:leading-9">{question.title}</h2>

        {question.stem?.svg ? (
          <IqStemSvg stem={question.stem} className={isIqScale ? "max-h-[460px]" : "max-h-[360px]"} />
        ) : null}

        {isIqScale ? (
          <p className="m-0 text-sm font-medium text-[var(--fm-text-muted)]">{dict.quiz.iq.pickPrompt}</p>
        ) : null}

        {isIqScale ? (
          <IqOptionBoard
            questionId={question.id}
            options={questionOptions}
            value={selectedOptionId}
            locale={locale}
            noOptionsLabel={dict.quiz.immersive.noOptions}
            onChange={(code) => handleAnswerSelection(question.id, code)}
          />
        ) : useV2LikertScale ? (
          <V2LikertScale
            questionId={question.id}
            options={questionOptions.map((option) => ({
              code: option.code,
              text: option.text,
            }))}
            value={selectedOptionId}
            onChange={(code) =>
              selectAndAdvance(() => {
                handleAnswerSelection(question.id, code);
              }, {
                questionId: question.id,
                code,
              })
            }
          />
        ) : (
          <AdaptiveOptionGroup
            questionId={question.id}
            options={questionOptions}
            value={selectedOptionId}
            noOptionsLabel={dict.quiz.immersive.noOptions}
            onChange={(code) =>
              selectAndAdvance(() => {
                handleAnswerSelection(question.id, code);
              }, {
                questionId: question.id,
                code,
              })
            }
          />
        )}

        {!isIqScale ? (
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{dict.quiz.answerTip}</p>
        ) : null}

        {iqNeedsSelection ? (
          <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-700">
            {dict.quiz.iq.selectHint}
          </p>
        ) : null}

        {attemptError ? (
          <p className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700" data-testid="iq-attempt-error">
            {attemptError}
          </p>
        ) : null}
        {submitError ? (
          <p className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700" data-testid="iq-submit-error">
            {submitError}
          </p>
        ) : null}
      </article>

      <div className="flex flex-col gap-[var(--fm-gap-sm)] sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={goPrevious}
          disabled={currentIndex === 0 || submitting}
          variant="outline"
        >
          {dict.quiz.immersive.previous}
        </Button>

        {isIqScale ? (
          <>
            {submitError ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting || submitOverlayVisible}
                onClick={() => {
                  void handleSubmitWithOverlay();
                }}
              >
                {dict.quiz.immersive.submitRetry}
              </Button>
            ) : null}
            {isLastQuestion ? (
              <Button
                type="button"
                onClick={() => {
                  void handleSubmitWithOverlay();
                }}
                disabled={!iqCanSubmit}
              >
                {resolveSubmitLabel(locale, submitting, dict.quiz.iq.submit)}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} disabled={!iqCanContinue}>
                {dict.quiz.iq.next}
              </Button>
            )}
          </>
        ) : submitError ? (
          <Button
            type="button"
            variant="outline"
            disabled={submitting || submitOverlayVisible}
            onClick={() => {
              void handleSubmitWithOverlay();
            }}
          >
            {dict.quiz.immersive.submitRetry}
          </Button>
        ) : (
          <div className="min-h-[44px]" aria-hidden />
        )}
      </div>

      <SubmitPhaseOverlay
        visible={submitOverlayVisible}
        phases={dict.quiz.immersive.submitPhases}
        phaseIndex={submitOverlayPhase}
      />
    </QuizShell>
  );
}
