"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdaptiveOptionGroup } from "@/components/quiz/immersive/AdaptiveOptionGroup";
import { ImmersiveTakeLayout } from "@/components/quiz/immersive/ImmersiveTakeLayout";
import { SubmitPhaseOverlay } from "@/components/quiz/immersive/SubmitPhaseOverlay";
import { useAutoAdvanceFlow } from "@/components/quiz/immersive/useAutoAdvanceFlow";
import { MatrixProgressHeader } from "@/components/quiz/matrix/MatrixProgressHeader";
import { MatrixQuestionTable } from "@/components/quiz/matrix/MatrixQuestionTable";
import { QuizShell } from "@/components/quiz/QuizShell";
import { Button } from "@/components/ui/button";
import { getOrCreateAnonId } from "@/lib/anon";
import {
  fetchScaleQuestions,
  startAttempt,
  submitAttempt,
  type ScaleQuestionItem,
} from "@/lib/api/v0_3";
import { trackEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { captureError } from "@/lib/observability/sentry";
import { QuizStoreProvider, useQuizStore } from "@/lib/quiz/store";
import type { QuizQuestion } from "@/lib/quiz/types";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";

function toQuizQuestion(question: ScaleQuestionItem): QuizQuestion {
  return {
    id: question.question_id,
    title: question.text,
    options: Array.isArray(question.options)
      ? question.options.map((option) => ({ id: option.code, text: option.text }))
      : [],
  };
}

export default function QuizTakeClient({
  slug,
  testTitle,
  scaleCode,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
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
  anonId,
  questions,
  setQuestions,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
  anonId: string;
  questions: QuizQuestion[];
  setQuestions: (nextQuestions: QuizQuestion[]) => void;
}) {
  const router = useRouter();
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
  const next = useQuizStore((store) => store.next);
  const prev = useQuizStore((store) => store.prev);
  const jump = useQuizStore((store) => store.jump);
  const setAttemptMeta = useQuizStore((store) => store.setAttemptMeta);
  const resetAttempt = useQuizStore((store) => store.resetAttempt);

  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [attemptLoading, setAttemptLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [milestoneHint, setMilestoneHint] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);
  const [submitOverlayVisible, setSubmitOverlayVisible] = useState(false);
  const [submitOverlayPhase, setSubmitOverlayPhase] = useState(0);
  const submitPhaseTimersRef = useRef<number[]>([]);
  const immersiveEnabled = isImmersiveSingleFlowEnabled();
  const trackedStartRef = useRef(false);

  const clearSubmitPhaseTimers = useCallback(() => {
    submitPhaseTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    submitPhaseTimersRef.current = [];
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);

      try {
        const response = await fetchScaleQuestions({ scaleCode, anonId });

        if (!active) return;

        const orderedQuestions = [...response.questions.items].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );

        setQuestions(orderedQuestions.map(toQuizQuestion));
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Failed to load questions.";
        setQuestionsError(message);
        const classified = classifyApiError(error);
        trackEvent("questions_load_failure", {
          scale_code: scaleCode,
          stage: "questions",
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
  }, [anonId, locale, scaleCode, setQuestions, slug]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (attemptId && savedScaleCode === scaleCode) {
        setAttemptLoading(false);
        return;
      }

      setAttemptLoading(true);
      setAttemptError(null);

      try {
        const response = await startAttempt({ scaleCode, anonId });
        if (!active) return;

        setAttemptMeta(response.attempt_id, scaleCode);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Failed to start attempt.";
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
      } finally {
        if (active) setAttemptLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, attemptId, locale, savedScaleCode, scaleCode, setAttemptMeta, slug]);

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

  const total = questions.length;
  const question = questions[currentIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;
  const loadError = questionsError ?? attemptError;

  const answeredCount = useMemo(
    () => questions.reduce((count, item) => count + (answers[item.id] ? 1 : 0), 0),
    [answers, questions]
  );

  const isLastQuestion = total > 0 && currentIndex === total - 1;
  const canSubmit = isLastQuestion && answeredCount === total && !submitting;

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

  const handleSubmit = async (): Promise<string | null> => {
    if (!attemptId) return null;

    const payloadAnswers = questions.map((item) => ({
      question_id: item.id,
      code: answers[item.id] ?? "",
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
      const durationMs = Math.max(1000, Date.now() - startedAt);

      const response = await submitAttempt({
        attemptId,
        answers: payloadAnswers,
        durationMs,
        anonId,
      });

      if (!response.ok) {
        throw new Error("Submit failed. Please try again.");
      }

      const resultAttemptId = response.attempt_id ?? attemptId;
      trackEvent("submit_attempt", {
        slug,
        attemptIdMasked: `${resultAttemptId.slice(0, 6)}...${resultAttemptId.slice(-4)}`,
        durationMs,
      });
      return resultAttemptId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submit failed.";
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
      setSubmitting(false);
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

  const handleSubmitWithOverlay = async () => {
    if (submitOverlayVisible || submitting) return;
    setSubmitOverlayVisible(true);
    startSubmitOverlayPhases();

    const [resultAttemptId] = await Promise.all([
      handleSubmit(),
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
  } = useAutoAdvanceFlow({
    currentIndex,
    total,
    onMove: (index) => jump(index, total),
    onLast: handleSubmitWithOverlay,
    confirmDelayMs: 200,
    enterDurationMs: 280,
  });

  if (questionsLoading || attemptLoading) {
    return (
      <QuizShell>
        <p className="m-0 text-slate-600">Loading quiz data...</p>
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
          footerSlot={
            submitError ? (
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
            ) : null
          }
        >
          <article className="space-y-5 rounded-2xl border border-[var(--fm-border-strong)] bg-white p-6 shadow-[var(--fm-shadow-md)]">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
              Question {currentIndex + 1} / {total}
            </p>
            <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{question.title}</h2>

            {milestoneHint ? (
              <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--fm-text)]">
                {milestoneHint}
              </div>
            ) : null}

            <AdaptiveOptionGroup
              questionId={question.id}
              options={question.options.map((option) => ({ code: option.id, text: option.text }))}
              value={selectedOptionId}
              noOptionsLabel={dict.quiz.immersive.noOptions}
              onChange={(code) =>
                selectAndAdvance(() => {
                  setAnswer(question.id, code);
                })
              }
            />

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
      <MatrixProgressHeader
        title={testTitle}
        current={currentIndex + 1}
        total={total}
        answered={answeredCount}
        status={`${answeredCount}/${total} ${locale === "zh" ? "已作答" : "answered"}`}
        stickyTopClassName="top-2"
      />

      {milestoneHint ? (
        <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--fm-text)]">
          {milestoneHint}
        </div>
      ) : null}

      <MatrixQuestionTable
        questionId={question.id}
        questionText={question.title}
        options={question.options.map((option) => ({ code: option.id, text: option.text }))}
        value={selectedOptionId}
        locale={locale}
        mobilePromptStickyTopClassName="top-[4.75rem]"
        mobilePromptMaxHeightVh={45}
        mobileOptionsSafeArea
        onChange={(code) => setAnswer(question.id, code)}
      />

      {submitError ? <p className="m-0 text-sm text-red-700">{submitError}</p> : null}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => prev()}
          disabled={currentIndex === 0 || submitting}
          variant="outline"
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            type="button"
            onClick={() => {
              void handleSubmit().then((resultAttemptId) => {
                if (resultAttemptId) {
                  finalizeSuccessfulSubmit(resultAttemptId);
                }
              });
            }}
            disabled={!canSubmit}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => next(total)}
            disabled={currentIndex >= total - 1 || submitting}
          >
            Next
          </Button>
        )}
      </div>

      <p className="m-0 text-xs text-slate-500">Slug: {slug}</p>
    </QuizShell>
  );
}
