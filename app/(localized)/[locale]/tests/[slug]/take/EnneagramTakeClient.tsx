"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuizTakeHeaderV2 } from "@/components/quiz/QuizTakeHeaderV2";
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
import { ensureFmTokenReady } from "@/lib/auth/authRetry";
import { isGuestTokenEndpointMissingError } from "@/lib/auth/fmToken";
import { trackEvent } from "@/lib/analytics";
import {
  buildEnneagramSubmitAnswers,
  fetchEnneagramQuestions,
  isEnneagramForcedChoiceForm,
  startEnneagramAttempt,
  submitEnneagramAttempt,
} from "@/lib/enneagram/api";
import {
  ENNEAGRAM_SCALE_CODE,
  normalizeEnneagramFormCode,
  resolveEnneagramFormMeta,
} from "@/lib/enneagram/forms";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { resolveResultAttemptId } from "@/lib/attempt/resolveResultAttemptId";
import {
  createTakeFlowController,
  resolveStaleDraftResetMessage,
  shouldBlockInvalidDraftOnTakePage,
} from "@/lib/attempt/staleAttempt";
import { QuizStoreProvider, useQuizStore } from "@/lib/quiz/store";
import { useConstrainQuizUrlTokens } from "@/lib/quiz/urlTokenGuard";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";
import { cn } from "@/lib/utils";

type EnneagramOption = {
  code: string;
  text: string;
};

type EnneagramQuestion = {
  question_id: string;
  text: string;
  options: EnneagramOption[];
  scoringMode: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveLocalizedText(node: Record<string, unknown>, locale: "en" | "zh"): string {
  const localized = locale === "zh"
    ? normalizeText(node.text_zh) || normalizeText(node.text) || normalizeText(node.text_en)
    : normalizeText(node.text_en) || normalizeText(node.text) || normalizeText(node.text_zh);
  return localized;
}

function normalizeEnneagramQuestions(
  items: Array<Record<string, unknown>>,
  locale: "en" | "zh"
): EnneagramQuestion[] {
  return items.map((item, index) => {
    const questionId = normalizeText(item.question_id);
    const options = Array.isArray(item.options)
      ? item.options
          .map((rawOption) => {
            if (!rawOption || typeof rawOption !== "object" || Array.isArray(rawOption)) return null;
            const option = rawOption as Record<string, unknown>;
            const code = normalizeText(option.code);
            if (!code) return null;
            return {
              code,
              text: resolveLocalizedText(option, locale) || code,
            };
          })
          .filter((option): option is EnneagramOption => option !== null)
      : [];

    return {
      question_id: questionId || String(index + 1),
      text: resolveLocalizedText(item, locale) || (locale === "zh" ? `第 ${index + 1} 题` : `Question ${index + 1}`),
      options,
      scoringMode: normalizeText(item.scoring_mode),
    };
  });
}

function ForcedChoicePairGroup({
  questionId,
  options,
  value,
  onChange,
}: {
  questionId: string;
  options: EnneagramOption[];
  value?: string;
  onChange: (code: string) => void;
}) {
  const normalized = options.slice(0, 2);

  const moveByArrow = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    event.preventDefault();
    const nextIndex = index === 0 ? 1 : 0;
    const next = normalized[nextIndex];
    if (next) onChange(next.code);
  };

  return (
    <div
      className="grid gap-[var(--fm-gap-sm)] md:grid-cols-2"
      role="radiogroup"
      aria-label={`enneagram-forced-choice-${questionId}`}
      data-testid="enneagram-forced-choice-pair"
    >
      {normalized.map((option, index) => {
        const selected = value === option.code;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.text}
            onClick={() => onChange(option.code)}
            onKeyDown={(event) => moveByArrow(index, event)}
            className={cn(
              "flex min-h-[116px] w-full flex-col justify-between rounded-xl border px-[var(--fm-pad-card-x)] py-[var(--fm-pad-card-y)] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
              selected
                ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white shadow-[var(--fm-shadow-md)]"
                : "border-[var(--fm-border-strong)] bg-white text-[var(--fm-text)] hover:border-[var(--fm-trust-blue)]"
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">
              {option.code}
            </span>
            <span className="text-base font-semibold leading-7">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function EnneagramTakeClient({
  slug,
  formCode,
  estimatedMinutes,
}: {
  slug: string;
  formCode?: string;
  estimatedMinutes?: number;
}) {
  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const searchParams = useSearchParams();
  const resolvedFormCode = useMemo(
    () => normalizeEnneagramFormCode(formCode ?? searchParams.get("form") ?? searchParams.get("form_code")),
    [formCode, searchParams]
  );

  const [questions, setQuestions] = useState<EnneagramQuestion[]>([]);
  const questionIds = useMemo(() => questions.map((question) => question.question_id), [questions]);

  return (
    <QuizStoreProvider
      slug={slug}
      anonId={anonId || null}
      formCode={resolvedFormCode}
      initialQuestionIds={questionIds}
    >
      <EnneagramTakeInner
        slug={slug}
        formCode={resolvedFormCode}
        estimatedMinutes={estimatedMinutes}
        anonId={anonId}
        questions={questions}
        setQuestions={setQuestions}
      />
    </QuizStoreProvider>
  );
}

function EnneagramTakeInner({
  slug,
  formCode,
  estimatedMinutes,
  anonId,
  questions,
  setQuestions,
}: {
  slug: string;
  formCode: string;
  estimatedMinutes?: number;
  anonId: string;
  questions: EnneagramQuestion[];
  setQuestions: (questions: EnneagramQuestion[]) => void;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  useConstrainQuizUrlTokens({ pathname, router, searchParams });
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const resolvedFormCode = normalizeEnneagramFormCode(formCode);
  const formMeta = resolveEnneagramFormMeta(resolvedFormCode);
  const forcedChoice = isEnneagramForcedChoiceForm(resolvedFormCode);
  const effectiveEstimatedMinutes = estimatedMinutes ?? formMeta.estimatedMinutes;
  const immersiveEnabled = isImmersiveSingleFlowEnabled();

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

  const [authBlockError, setAuthBlockError] = useState<string | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [staleDraftError, setStaleDraftError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitOverlayVisible, setSubmitOverlayVisible] = useState(false);
  const [submitOverlayPhase, setSubmitOverlayPhase] = useState(0);
  const mountedRef = useRef(true);
  const takeFlowRef = useRef(createTakeFlowController());
  const latestAnswersRef = useRef<Record<string, string>>(answers);
  const ensureAttemptPromiseRef = useRef<Promise<string | null> | null>(null);
  const submitInFlightRef = useRef(false);
  const forceNewAttemptAppliedRef = useRef(false);
  const cancelAutoAdvanceRef = useRef<() => void>(() => {});

  const total = questions.length;
  const question = questions[currentIndex];
  const questionIds = useMemo(() => questions.map((item) => item.question_id), [questions]);
  const selectedOptionId = question ? answers[question.question_id] : undefined;
  const answeredCount = useMemo(
    () => questions.reduce((count, item) => count + (answers[item.question_id] ? 1 : 0), 0),
    [answers, questions]
  );
  const matchesSavedAttempt =
    Boolean(attemptId) && savedScaleCode === ENNEAGRAM_SCALE_CODE && savedFormCode === resolvedFormCode;
  const forceNewAttemptRequested = searchParams.get("force_new_attempt") === "1";
  const loadError = authBlockError ?? questionsError;
  const progressText = locale === "zh"
    ? `第 ${currentIndex + 1} 题 / 共 ${Math.max(total, 1)} 题`
    : `Question ${currentIndex + 1} / ${Math.max(total, 1)}`;
  const shouldBlockStaleDraft = shouldBlockInvalidDraftOnTakePage({
    answeredCount,
    totalQuestions: total,
    attemptId,
  });

  const isFlowActive = useCallback((runId?: number) => (
    mountedRef.current && takeFlowRef.current.isActive(runId)
  ), []);

  const cancelPendingSubmitSideEffects = useCallback(() => {
    takeFlowRef.current.cancelCurrentRun();
    cancelAutoAdvanceRef.current();
    submitInFlightRef.current = false;
  }, []);

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
        if (isGuestTokenEndpointMissingError(error)) {
          setAuthBlockError(
            locale === "zh"
              ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
              : "Submission is temporarily unavailable because authentication service is not configured."
          );
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, locale]);

  useEffect(() => {
    const takeFlow = takeFlowRef.current;
    return () => {
      mountedRef.current = false;
      takeFlow.dispose();
      submitInFlightRef.current = false;
    };
  }, []);

  useEffect(() => {
    latestAnswersRef.current = answers;
  }, [answers]);

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
        const response = await fetchEnneagramQuestions({
          locale: toApiLocale(locale),
          anonId: anonId || undefined,
          formCode: resolvedFormCode,
        });
        if (!active) return;

        const ordered = [...response.questions.items]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => item as Record<string, unknown>);
        setQuestions(normalizeEnneagramQuestions(ordered, locale));
      } catch (error) {
        if (!active) return;
        setQuestions([]);
        setQuestionsError(
          error instanceof Error && error.message
            ? error.message
            : locale === "zh"
              ? "题目加载失败，请稍后重试。"
              : "Failed to load questions. Please retry later."
        );
        const classified = classifyApiError(error);
        trackEvent("questions_load_failure", {
          scale_code: ENNEAGRAM_SCALE_CODE,
          form_code: resolvedFormCode,
          stage: "questions",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          route: "/tests/[slug]/take",
          locale,
        });
      } finally {
        if (active) setQuestionsLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, authBlockError, locale, resolvedFormCode, setQuestions]);

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
        const response = await startEnneagramAttempt({
          anonId: anonId || undefined,
          locale: toApiLocale(locale),
          region: "GLOBAL",
          formCode: resolvedFormCode,
          meta: {
            slug,
            form_code: resolvedFormCode,
            question_mode: formMeta.questionMode,
          },
          clientVersion: "fe-enneagram-1",
        });
        if (!isFlowActive(runId)) {
          return null;
        }
        setAttemptMeta(response.attempt_id, ENNEAGRAM_SCALE_CODE, resolvedFormCode);
        trackEvent("start_attempt", {
          slug,
          test_slug: slug,
          scale_code: ENNEAGRAM_SCALE_CODE,
          form_code: resolvedFormCode,
          attempt_id: response.attempt_id,
          locale,
        });
        return response.attempt_id;
      } catch (error) {
        if (!isFlowActive(runId)) {
          return null;
        }
        setAttemptError(
          error instanceof Error && error.message
            ? error.message
            : locale === "zh"
              ? "启动测试失败，请稍后重试。"
              : "Failed to start attempt. Please retry later."
        );
        const classified = classifyApiError(error);
        trackEvent("submit_failure", {
          scale_code: ENNEAGRAM_SCALE_CODE,
          form_code: resolvedFormCode,
          stage: "start_attempt",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          route: "/tests/[slug]/take",
          locale,
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
    authBlockError,
    formMeta.questionMode,
    isFlowActive,
    locale,
    resolvedFormCode,
    setAttemptMeta,
    slug,
    staleDraftError,
  ]);

  const ensureAttempt = useCallback(async (runId?: number): Promise<string | null> => {
    if (forceNewAttemptRequested && !forceNewAttemptAppliedRef.current) {
      forceNewAttemptAppliedRef.current = true;
      clearAttemptMeta();
      return startFreshAttempt(runId);
    }
    if (matchesSavedAttempt) {
      return attemptId;
    }
    return startFreshAttempt(runId);
  }, [attemptId, clearAttemptMeta, forceNewAttemptRequested, matchesSavedAttempt, startFreshAttempt]);

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
    runId?: number
  ): Promise<string> => {
    const durationMs = Math.max(1000, Date.now() - startedAt);
    const response = await submitEnneagramAttempt({
      attemptId: activeAttemptId,
      anonId: anonId || undefined,
      answers: buildEnneagramSubmitAnswers({
        questionIds,
        answers: answersSnapshot,
      }),
      durationMs,
    });
    if (!isFlowActive(runId)) {
      return "";
    }
    if (!response.ok) {
      throw new Error("Submit failed.");
    }
    trackEvent("submit_attempt", {
      slug,
      test_slug: slug,
      scale_code: ENNEAGRAM_SCALE_CODE,
      form_code: resolvedFormCode,
      attempt_id: activeAttemptId,
      answered_count: questionIds.length,
      durationMs,
      locale,
    });
    return resolveResultAttemptId(response, activeAttemptId);
  }, [anonId, isFlowActive, locale, questionIds, resolvedFormCode, slug, startedAt]);

  const handleSubmit = useCallback(async (pendingSelection?: LastSelectionContext, runId?: number): Promise<string | null> => {
    if (submitInFlightRef.current || staleDraftError) {
      return null;
    }

    submitInFlightRef.current = true;
    const activeRunId = typeof runId === "number" ? runId : takeFlowRef.current.beginRun();
    const activeAttemptId = await ensureAttempt(activeRunId);
    if (!isFlowActive(activeRunId) || !activeAttemptId) {
      submitInFlightRef.current = false;
      return null;
    }

    const answersSnapshot = buildAnswersSnapshot(pendingSelection);
    const firstMissingIndex = questions.findIndex((item) => !answersSnapshot[item.question_id]);
    if (firstMissingIndex >= 0) {
      if (isFlowActive(activeRunId)) {
        setSubmitError(locale === "zh" ? "请先完成所有题目再提交。" : "Please answer every question before submitting.");
        jump(firstMissingIndex, total);
      }
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
      return resultAttemptId;
    } catch (error) {
      if (!isFlowActive(activeRunId)) {
        return null;
      }
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : locale === "zh"
            ? "提交失败，请稍后重试。"
            : "Submit failed. Please retry later."
      );
      const classified = classifyApiError(error);
      trackEvent("submit_failure", {
        scale_code: ENNEAGRAM_SCALE_CODE,
        form_code: resolvedFormCode,
        stage: "submit_attempt",
        status_group: classified.statusGroup,
        status_code: classified.statusCode,
        error_code: classified.errorCode,
        route: "/tests/[slug]/take",
        locale,
      });
      return null;
    } finally {
      if (isFlowActive(activeRunId)) {
        setSubmitting(false);
      }
      submitInFlightRef.current = false;
    }
  }, [
    buildAnswersSnapshot,
    ensureAttempt,
    isFlowActive,
    jump,
    locale,
    questions,
    resolvedFormCode,
    staleDraftError,
    submitAttemptWithId,
    total,
  ]);

  const finalizeSuccessfulSubmit = useCallback((resultAttemptId: string) => {
    cancelPendingSubmitSideEffects();
    resetAttempt();
    router.push(withLocale(`/result/${resultAttemptId}`));
  }, [cancelPendingSubmitSideEffects, resetAttempt, router, withLocale]);

  const startSubmitOverlayPhases = useCallback((runId: number) => {
    setSubmitOverlayPhase(0);
    takeFlowRef.current.schedule(() => setSubmitOverlayPhase(1), 700, runId);
    takeFlowRef.current.schedule(() => setSubmitOverlayPhase(2), 1400, runId);
  }, []);

  const handleSubmitWithOverlay = useCallback(async (pendingSelection?: LastSelectionContext): Promise<void> => {
    if (submitOverlayVisible || submitting) return;
    const runId = takeFlowRef.current.beginRun();
    setSubmitOverlayVisible(true);
    startSubmitOverlayPhases(runId);

    const resultAttemptId = await handleSubmit(pendingSelection, runId);
    if (!isFlowActive(runId)) {
      return;
    }

    const delayFinished = await takeFlowRef.current.wait(1800, runId);
    if (!delayFinished || !isFlowActive(runId)) {
      return;
    }

    if (!resultAttemptId) {
      setSubmitOverlayVisible(false);
      setSubmitOverlayPhase(0);
      return;
    }

    finalizeSuccessfulSubmit(resultAttemptId);
  }, [
    finalizeSuccessfulSubmit,
    handleSubmit,
    isFlowActive,
    startSubmitOverlayPhases,
    submitOverlayVisible,
    submitting,
  ]);

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
        <p className="m-0 text-slate-600">
          {locale === "zh" ? "正在加载九型人格题目..." : "Loading Enneagram questions..."}
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
            cancelPendingSubmitSideEffects();
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
        <p className="m-0 text-slate-600">
          {locale === "zh" ? "未找到可答题目。" : "No questions found for this form."}
        </p>
      </QuizShell>
    );
  }

  const questionOptions = question.options.map((option) => ({
    code: option.code,
    text: option.text,
  }));
  const isLastQuestion = total > 0 && currentIndex === total - 1;
  const canContinue = Boolean(selectedOptionId) && !submitting && !submitOverlayVisible;
  const canSubmit = isLastQuestion && answeredCount === total && Boolean(selectedOptionId) && !submitting && !submitOverlayVisible;
  const shouldRenderQuestionTitle = !forcedChoice && question.text.trim().length > 0;

  const optionNode = forcedChoice ? (
    <ForcedChoicePairGroup
      questionId={question.question_id}
      options={questionOptions}
      value={selectedOptionId}
      onChange={(code) =>
        selectAndAdvance(() => {
          handleAnswerSelection(question.question_id, code);
        }, {
          questionId: question.question_id,
          code,
        })
      }
    />
  ) : (
    <div data-testid="enneagram-likert-options">
      <V2LikertScale
        questionId={question.question_id}
        options={questionOptions}
        value={selectedOptionId}
        onChange={(code) =>
          selectAndAdvance(() => {
            handleAnswerSelection(question.question_id, code);
          }, {
            questionId: question.question_id,
            code,
          })
        }
      />
      {questionOptions.length !== 5 ? (
        <AdaptiveOptionGroup
          questionId={question.question_id}
          options={questionOptions}
          value={selectedOptionId}
          noOptionsLabel={dict.quiz.immersive.noOptions}
          onChange={(code) =>
            selectAndAdvance(() => {
              handleAnswerSelection(question.question_id, code);
            }, {
              questionId: question.question_id,
              code,
            })
          }
        />
      ) : null}
    </div>
  );

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
          transitionKey={question.question_id}
          transitionDirection={transitionDirection}
          isTransitioning={isTransitioning}
          headerSlot={
            <QuizTakeHeaderV2
              brand={locale === "zh" ? "九型人格测试" : "Enneagram Test"}
              completedPrefix={dict.header.completedPrefix}
              completedSuffix={dict.header.completedSuffix}
              estimatedTimeLabel={dict.quiz.estimatedTimeLabel}
              minutesUnit={dict.common.minutes_unit}
              estimatedMinutes={effectiveEstimatedMinutes}
              progressText={progressText}
              current={currentIndex + 1}
              total={total}
              answered={answeredCount}
              showCompletedCount={false}
              backHref={withLocale(`/tests/${slug}`)}
              backLabel={dict.quiz.immersive.backToDetails}
            />
          }
          footerSlot={
            forcedChoice ? (
              <div className="flex items-center gap-[var(--fm-gap-sm)]">
                {isLastQuestion ? (
                  <Button type="button" onClick={() => void handleSubmitWithOverlay()} disabled={!canSubmit}>
                    {submitting ? "Submitting..." : locale === "zh" ? "提交" : "Submit"}
                  </Button>
                ) : (
                  <Button type="button" onClick={goNext} disabled={!canContinue}>
                    {locale === "zh" ? "下一题" : "Next"}
                  </Button>
                )}
              </div>
            ) : submitError ? (
              <Button type="button" variant="outline" disabled={submitting} onClick={() => void handleSubmitWithOverlay()}>
                {dict.quiz.immersive.submitRetry}
              </Button>
            ) : (
              <div className="min-h-[44px]" aria-hidden />
            )
          }
        >
          <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
            {shouldRenderQuestionTitle ? (
              <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{question.text}</h2>
            ) : null}
            {optionNode}
            {attemptError ? <p className="m-0 text-sm text-red-700">{attemptError}</p> : null}
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
        brand={locale === "zh" ? "九型人格测试" : "Enneagram Test"}
        completedPrefix={dict.header.completedPrefix}
        completedSuffix={dict.header.completedSuffix}
        estimatedTimeLabel={dict.quiz.estimatedTimeLabel}
        minutesUnit={dict.common.minutes_unit}
        estimatedMinutes={effectiveEstimatedMinutes}
        progressText={progressText}
        current={currentIndex + 1}
        total={total}
        answered={answeredCount}
        showCompletedCount={false}
        backHref={withLocale(`/tests/${slug}`)}
        backLabel={dict.quiz.immersive.backToDetails}
      />

      <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
        {shouldRenderQuestionTitle ? (
          <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{question.text}</h2>
        ) : null}
        {optionNode}
        {attemptError ? <p className="m-0 text-sm text-red-700">{attemptError}</p> : null}
        {submitError ? <p className="m-0 text-sm text-red-700">{submitError}</p> : null}
      </article>

      <div className="flex items-center gap-[var(--fm-gap-sm)]">
        <Button type="button" onClick={goPrevious} disabled={currentIndex === 0 || submitting} variant="outline">
          {dict.quiz.immersive.previous}
        </Button>
        {forcedChoice ? (
          isLastQuestion ? (
            <Button type="button" onClick={() => void handleSubmitWithOverlay()} disabled={!canSubmit}>
              {submitting ? "Submitting..." : locale === "zh" ? "提交" : "Submit"}
            </Button>
          ) : (
            <Button type="button" onClick={goNext} disabled={!canContinue}>
              {locale === "zh" ? "下一题" : "Next"}
            </Button>
          )
        ) : submitError ? (
          <Button type="button" variant="outline" disabled={submitting} onClick={() => void handleSubmitWithOverlay()}>
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
