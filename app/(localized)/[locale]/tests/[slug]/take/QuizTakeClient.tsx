"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getOrCreateAnonId, readPendingAnonLinkAttempts } from "@/lib/anon";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  isGuestTokenEndpointMissingError,
  isGuestTokenRequestError,
  setFmToken,
} from "@/lib/auth/fmToken";
import {
  fetchScaleQuestions,
  linkAnonAttemptsOnceOnLoginSuccess,
  startAttempt,
  shouldLinkAnonAttemptsOnLoginSuccess,
  submitAttempt,
} from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { captureError } from "@/lib/observability/sentry";
import { normalizeQuizQuestions } from "@/lib/quiz/normalizeQuestions";
import { QuizStoreProvider, useQuizStore } from "@/lib/quiz/store";
import type { QuizQuestion } from "@/lib/quiz/types";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";
import { resolveResultAttemptId } from "@/lib/attempt/resolveResultAttemptId";
import {
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

function toUiMessage(error: unknown, fallback: string, locale: "en" | "zh"): string {
  if (isGuestTokenEndpointMissingError(error)) {
    return resolveNoTokenServiceMessage(locale);
  }
  if (isGuestTokenRequestError(error)) {
    return resolveGuestTokenFailureMessage(locale);
  }
  if (isUnauthorizedError(error)) {
    return resolveAuthErrorMessage(locale);
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function QuizTakeClient({
  slug,
  testTitle,
  scaleCode,
  estimatedMinutes,
  questionCount,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
  estimatedMinutes?: number;
  questionCount?: number;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const anonId = useMemo(() => getOrCreateAnonId(), []);

  return (
    <QuizStoreProvider slug={slug} anonId={anonId || null} initialQuestionIds={questionIds}>
      <QuizTakeInner
        slug={slug}
        testTitle={testTitle}
        scaleCode={scaleCode}
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
  estimatedMinutes,
  questionCount,
  anonId,
  questions,
  setQuestions,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
  estimatedMinutes?: number;
  questionCount?: number;
  anonId: string;
  questions: QuizQuestion[];
  setQuestions: (nextQuestions: QuizQuestion[]) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const withLocale = (path: string) => localizedPath(path, locale);
  const dict = getDictSync(locale);

  const currentIndex = useQuizStore((store) => store.state.currentIndex);
  const answers = useQuizStore((store) => store.state.answers);
  const startedAt = useQuizStore((store) => store.state.startedAt);
  const attemptId = useQuizStore((store) => store.state.attemptId);
  const savedScaleCode = useQuizStore((store) => store.state.scaleCode);

  const setAnswer = useQuizStore((store) => store.setAnswer);
  const jump = useQuizStore((store) => store.jump);
  const setAttemptMeta = useQuizStore((store) => store.setAttemptMeta);
  const clearAttemptMeta = useQuizStore((store) => store.clearAttemptMeta);
  const resetAttempt = useQuizStore((store) => store.resetAttempt);

  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [attemptLoading, setAttemptLoading] = useState(true);
  const [authBootstrapping, setAuthBootstrapping] = useState(true);
  const [authBlockError, setAuthBlockError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [staleDraftError, setStaleDraftError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [milestoneHint, setMilestoneHint] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);
  const [submitOverlayVisible, setSubmitOverlayVisible] = useState(false);
  const [submitOverlayPhase, setSubmitOverlayPhase] = useState(0);
  const submitPhaseTimersRef = useRef<number[]>([]);
  const latestAnswersRef = useRef<Record<string, string>>(answers);
  const ensureAttemptPromiseRef = useRef<Promise<string | null> | null>(null);
  const submitInFlightRef = useRef(false);
  const autoRecoveryAttemptedRef = useRef(false);
  const recoveringAttemptRef = useRef(false);
  const immersiveEnabled = isImmersiveSingleFlowEnabled();
  const trackedStartRef = useRef(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
    if (!tokenFromUrl.startsWith("fm_")) return;

    setFmToken(tokenFromUrl);

    const pendingAttemptIds = readPendingAnonLinkAttempts();
    if (
      pendingAttemptIds.length === 0
      || !shouldLinkAnonAttemptsOnLoginSuccess({
        tokenFromUrl,
        anonId,
        attemptIds: pendingAttemptIds,
      })
    ) {
      return;
    }

    void linkAnonAttemptsOnceOnLoginSuccess({
      tokenFromUrl,
      anonId,
      attemptIds: pendingAttemptIds,
    }).catch(() => {
      // Keep login flow non-blocking.
    });
  }, [anonId, searchParams]);

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
      setAuthBootstrapping(true);
      setAuthBlockError(null);

      try {
        await ensureFmTokenReady({
          anonId,
          locale,
          forceRefresh: true,
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
      } finally {
        if (active) {
          setAuthBootstrapping(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, locale, scaleCode, trackGuestTokenFailure]);

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

  const clearSubmitPhaseTimers = useCallback(() => {
    submitPhaseTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    submitPhaseTimersRef.current = [];
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
        const response = await runWithAuthRetry("questions", () =>
          fetchScaleQuestions({ scaleCode, anonId })
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
      } catch (error) {
        if (!active) return;
        const message = toUiMessage(error, "Failed to load questions.", locale);
        setQuestionsError(message);
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
  }, [anonId, authBlockError, locale, runWithAuthRetry, scaleCode, setQuestions, slug]);

  useEffect(() => {
    latestAnswersRef.current = answers;
  }, [answers]);

  const startFreshAttempt = useCallback(async (): Promise<string | null> => {
    if (authBlockError || staleDraftError) {
      return null;
    }

    if (ensureAttemptPromiseRef.current) {
      return ensureAttemptPromiseRef.current;
    }

    setAttemptLoading(true);
    setAttemptError(null);

    const pending = (async () => {
      try {
        const response = await runWithAuthRetry("start_attempt", () =>
          startAttempt({ scaleCode, anonId })
        );
        setAttemptMeta(response.attempt_id, scaleCode);
        return response.attempt_id;
      } catch (error) {
        const message = toUiMessage(error, "Failed to start attempt.", locale);
        setAttemptError(message);
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
        setAttemptLoading(false);
        ensureAttemptPromiseRef.current = null;
      }
    })();

    ensureAttemptPromiseRef.current = pending;
    return pending;
  }, [anonId, authBlockError, locale, runWithAuthRetry, scaleCode, setAttemptMeta, slug, staleDraftError]);

  const ensureAttempt = useCallback(async (): Promise<string | null> => {
    if (authBlockError || staleDraftError || recoveringAttemptRef.current) {
      return null;
    }

    if (attemptId && savedScaleCode === scaleCode) {
      return attemptId;
    }

    return startFreshAttempt();
  }, [attemptId, authBlockError, savedScaleCode, scaleCode, staleDraftError, startFreshAttempt]);

  const total = questions.length;
  const question = questions[currentIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;
  const loadError = authBlockError ?? questionsError ?? attemptError;
  const answeredCount = useMemo(
    () => questions.reduce((count, item) => count + (answers[item.id] ? 1 : 0), 0),
    [answers, questions]
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (
        questionsLoading ||
        staleDraftError ||
        recoveringAttemptRef.current ||
        shouldBlockInvalidDraftOnTakePage({
          answeredCount,
          totalQuestions: questions.length,
          attemptId,
        })
      ) {
        setAttemptLoading(false);
        return;
      }

      if (attemptId && savedScaleCode === scaleCode) {
        setAttemptLoading(false);
        return;
      }

      await ensureAttempt();
      if (!active) return;
    };

    void run();

    return () => {
      active = false;
    };
  }, [answeredCount, attemptId, ensureAttempt, questions.length, questionsLoading, savedScaleCode, scaleCode, staleDraftError]);

  useEffect(() => {
    if (!attemptId || trackedStartRef.current) return;
    trackedStartRef.current = true;

    trackEvent("start_attempt", {
      slug,
      scaleCode,
      attemptIdMasked: `${attemptId.slice(0, 6)}...${attemptId.slice(-4)}`,
    });
  }, [attemptId, scaleCode, slug]);

  useEffect(() => {
    return () => {
      clearSubmitPhaseTimers();
    };
  }, [clearSubmitPhaseTimers]);
  const shouldBlockStaleDraft = shouldBlockInvalidDraftOnTakePage({
    answeredCount,
    totalQuestions: total,
    attemptId,
  });

  const normalizedScaleCode = scaleCode.trim().toUpperCase();
  const isIqScale = normalizedScaleCode === "IQ_RAVEN" || normalizedScaleCode === "IQ_INTELLIGENCE_QUOTIENT";
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
      setStaleDraftError(resolveStaleDraftResetMessage(locale));
      setAttemptLoading(false);
      return;
    }

    setStaleDraftError(null);
  }, [locale, questionsLoading, shouldBlockStaleDraft]);

  useEffect(() => {
    if (answeredCount === 0) {
      setSeenMilestones([]);
      setMilestoneHint(null);
    }
  }, [answeredCount, total]);

  useEffect(() => {
    if (total <= 0) return;
    const milestones = [20, 40, 60, 80, 100];
    const progressPercent = Math.floor((answeredCount / total) * 100);
    const nextMilestone = milestones.find((milestone) => progressPercent >= milestone && !seenMilestones.includes(milestone));
    if (!nextMilestone) return;

    setSeenMilestones((prev) => [...prev, nextMilestone]);
    const hintIndex = milestones.indexOf(nextMilestone);
    const hint = dict.quiz.milestoneHints[hintIndex] ?? dict.quiz.milestoneHints[dict.quiz.milestoneHints.length - 1] ?? "";
    if (hint) {
      setMilestoneHint(hint);
      window.setTimeout(() => {
        setMilestoneHint((prev) => (prev === hint ? null : prev));
      }, 1500);
    }

    const elapsedMs = Math.max(0, Date.now() - startedAt);
    const durationBucket = elapsedMs < 60000 ? "lt_1m" : elapsedMs < 180000 ? "1_3m" : "gte_3m";
    trackEvent("ui_quiz_milestone", {
      scale_code: scaleCode,
      milestone: nextMilestone,
      duration_bucket: durationBucket,
      locale,
    });
  }, [answeredCount, dict.quiz.milestoneHints, locale, scaleCode, seenMilestones, startedAt, total]);

  const buildAnswersSnapshot = useCallback((pendingSelection?: LastSelectionContext) => {
    const snapshot = {
      ...latestAnswersRef.current,
    };

    if (pendingSelection?.questionId && pendingSelection.code) {
      snapshot[pendingSelection.questionId] = pendingSelection.code;
    }

    return snapshot;
  }, []);

  const submitAttemptWithId = useCallback(async (
    activeAttemptId: string,
    answersSnapshot: Record<string, string>
  ): Promise<string> => {
    const durationMs = Math.max(1000, Date.now() - startedAt);

    const response = await runWithAuthRetry("submit_attempt", () =>
      submitAttempt({
        attemptId: activeAttemptId,
        answers: questions.map((item) => ({
          question_id: item.id,
          code: answersSnapshot[item.id] ?? "",
        })),
        durationMs,
        anonId,
      })
    );

    if (!response.ok) {
      throw new Error("Submit failed. Please try again.");
    }

    const resultAttemptId = resolveResultAttemptId(response, activeAttemptId);
    trackEvent("submit_attempt", {
      slug,
      attemptIdMasked: `${resultAttemptId.slice(0, 6)}...${resultAttemptId.slice(-4)}`,
      durationMs,
    });
    return resultAttemptId;
  }, [anonId, questions, runWithAuthRetry, slug, startedAt]);

  const handleSubmit = async (pendingSelection?: LastSelectionContext): Promise<string | null> => {
    if (submitInFlightRef.current || staleDraftError) {
      return null;
    }

    submitInFlightRef.current = true;
    const activeAttemptId = await ensureAttempt();
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
      setSubmitError("Please answer every question before submitting.");
      jump(firstMissingIndex, total);
      return null;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      return await submitAttemptWithId(activeAttemptId, answersSnapshot);
    } catch (error) {
      recoveringAttemptRef.current = true;
      const recovery = await recoverStaleAttemptSubmit({
        error,
        alreadyRecovered: autoRecoveryAttemptedRef.current,
        clearAttemptState: () => {
          clearAttemptMeta();
          setAttemptError(null);
        },
        startFreshAttempt,
        submitFreshAttempt: (nextAttemptId) => submitAttemptWithId(nextAttemptId, answersSnapshot),
      });
      recoveringAttemptRef.current = false;

      if (recovery.kind === "recovered") {
        autoRecoveryAttemptedRef.current = true;
        return recovery.value;
      }

      if (recovery.kind === "failed") {
        autoRecoveryAttemptedRef.current = true;
        const message = resolveStaleDraftResetMessage(locale);
        setStaleDraftError(message);
        setSubmitError(message);
        return null;
      }

      const message = toUiMessage(error, "Submit failed.", locale);
      setSubmitError(message);
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
      setSubmitting(false);
      submitInFlightRef.current = false;
    }
  };

  const finalizeSuccessfulSubmit = (resultAttemptId: string) => {
    resetAttempt();
    router.push(withLocale(`/result/${resultAttemptId}`));
  };

  const startSubmitOverlayPhases = () => {
    clearSubmitPhaseTimers();
    setSubmitOverlayPhase(0);

    trackEvent("ui_report_loading_phase", {
      scale_code: scaleCode,
      phase: "saving",
      locked: true,
      variant: "free",
      locale,
    });

    const phase1 = window.setTimeout(() => {
      setSubmitOverlayPhase(1);
      trackEvent("ui_report_loading_phase", {
        scale_code: scaleCode,
        phase: "analyzing",
        locked: true,
        variant: "free",
        locale,
      });
    }, 800);

    const phase2 = window.setTimeout(() => {
      setSubmitOverlayPhase(2);
      trackEvent("ui_report_loading_phase", {
        scale_code: scaleCode,
        phase: "generating",
        locked: true,
        variant: "free",
        locale,
      });
    }, 1500);

    submitPhaseTimersRef.current = [phase1, phase2];
  };

  const handleSubmitWithOverlay = async (pendingSelection?: LastSelectionContext) => {
    if (submitOverlayVisible || submitting) return;
    setSubmitOverlayVisible(true);
    startSubmitOverlayPhases();

    const [resultAttemptId] = await Promise.all([
      handleSubmit(pendingSelection),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2200);
      }),
    ]);

    clearSubmitPhaseTimers();

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
  } = useAutoAdvanceFlow({
    currentIndex,
    total,
    onMove: (index) => jump(index, total),
    onLast: handleSubmitWithOverlay,
    confirmDelayMs: 200,
    enterDurationMs: 280,
  });

  if (authBootstrapping || questionsLoading || attemptLoading) {
    return (
      <QuizShell>
        <p className="m-0 text-slate-600">
          {authBootstrapping ? "Preparing secure session..." : "Loading quiz data..."}
        </p>
      </QuizShell>
    );
  }

  if (loadError) {
    return (
      <QuizShell>
        <p className="m-0 text-red-700">{loadError}</p>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
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
        <p className="m-0 text-slate-600">No questions found for this test.</p>
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
              brand={dict.header.brand}
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
              <div className="flex items-center gap-[var(--fm-gap-sm)]">
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
                    {submitting ? "Submitting..." : dict.quiz.iq.submit}
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
          <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">{testTitle}</p>
            <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{question.title}</h2>

            {question.stem?.svg ? (
              <IqStemSvg stem={question.stem} className={isIqScale ? "max-h-[420px]" : "max-h-[320px]"} />
            ) : null}

            {isIqScale ? (
              <p className="m-0 text-sm font-medium text-[var(--fm-text-muted)]">{dict.quiz.iq.pickPrompt}</p>
            ) : null}

            {milestoneHint ? (
              <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-sm font-medium text-[var(--fm-text)]">
                {milestoneHint}
              </div>
            ) : null}

            {isIqScale ? (
              <IqOptionBoard
                questionId={question.id}
                options={questionOptions}
                value={selectedOptionId}
                locale={locale}
                noOptionsLabel={dict.quiz.immersive.noOptions}
                onChange={(code) => setAnswer(question.id, code)}
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
                    setAnswer(question.id, code);
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
                    setAnswer(question.id, code);
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
              <p className="m-0 text-sm font-medium text-amber-700">{dict.quiz.iq.selectHint}</p>
            ) : null}

            {submitError ? <p className="m-0 text-sm text-red-700">{submitError}</p> : null}
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
        brand={dict.header.brand}
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

      <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">{testTitle}</p>
        <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{question.title}</h2>

        {question.stem?.svg ? (
          <IqStemSvg stem={question.stem} className={isIqScale ? "max-h-[420px]" : "max-h-[360px]"} />
        ) : null}

        {isIqScale ? (
          <p className="m-0 text-sm font-medium text-[var(--fm-text-muted)]">{dict.quiz.iq.pickPrompt}</p>
        ) : null}

        {milestoneHint ? (
          <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-sm font-medium text-[var(--fm-text)]">
            {milestoneHint}
          </div>
        ) : null}

        {isIqScale ? (
          <IqOptionBoard
            questionId={question.id}
            options={questionOptions}
            value={selectedOptionId}
            locale={locale}
            noOptionsLabel={dict.quiz.immersive.noOptions}
            onChange={(code) => setAnswer(question.id, code)}
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
                setAnswer(question.id, code);
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
                setAnswer(question.id, code);
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
          <p className="m-0 text-sm font-medium text-amber-700">{dict.quiz.iq.selectHint}</p>
        ) : null}

        {submitError ? <p className="m-0 text-sm text-red-700">{submitError}</p> : null}
      </article>

      <div className="flex items-center gap-[var(--fm-gap-sm)]">
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
                {submitting ? "Submitting..." : dict.quiz.iq.submit}
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
