"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionRenderer } from "@/components/quiz/QuestionRenderer";
import { QuizShell } from "@/components/quiz/QuizShell";
import { Stepper } from "@/components/quiz/Stepper";
import { Button } from "@/components/ui/button";
import {
  fetchScaleQuestions,
  startAttempt,
  submitAttempt,
  type ScaleQuestionItem,
} from "@/lib/api/v0_3";
import { getAnonymousId } from "@/lib/analytics";
import { QuizStoreProvider, useQuizStore } from "@/lib/quiz/store";
import type { QuizQuestion } from "@/lib/quiz/types";

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

  return (
    <QuizStoreProvider slug={slug} initialQuestionIds={questionIds}>
      <QuizTakeInner
        slug={slug}
        testTitle={testTitle}
        scaleCode={scaleCode}
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
  questions,
  setQuestions,
}: {
  slug: string;
  testTitle: string;
  scaleCode: string;
  questions: QuizQuestion[];
  setQuestions: (nextQuestions: QuizQuestion[]) => void;
}) {
  const router = useRouter();

  const currentIndex = useQuizStore((store) => store.state.currentIndex);
  const answers = useQuizStore((store) => store.state.answers);
  const startedAt = useQuizStore((store) => store.state.startedAt);
  const attemptId = useQuizStore((store) => store.state.attemptId);
  const savedScaleCode = useQuizStore((store) => store.state.scaleCode);

  const setAnswer = useQuizStore((store) => store.setAnswer);
  const next = useQuizStore((store) => store.next);
  const prev = useQuizStore((store) => store.prev);
  const setAttemptMeta = useQuizStore((store) => store.setAttemptMeta);
  const markSubmitted = useQuizStore((store) => store.markSubmitted);

  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [attemptLoading, setAttemptLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);

      try {
        const anonId = getAnonymousId();
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
        setQuestions([]);
      } finally {
        if (active) setQuestionsLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [scaleCode, setQuestions]);

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
        const anonId = getAnonymousId();
        const response = await startAttempt({ scaleCode, anonId });
        if (!active) return;

        setAttemptMeta(response.attempt_id, scaleCode);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Failed to start attempt.";
        setAttemptError(message);
      } finally {
        if (active) setAttemptLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [attemptId, savedScaleCode, scaleCode, setAttemptMeta]);

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

  const handleSubmit = async () => {
    if (!attemptId || !canSubmit) return;

    const payloadAnswers = questions.map((item) => ({
      question_id: item.id,
      option_code: answers[item.id] ?? "",
    }));

    if (payloadAnswers.some((item) => !item.option_code)) {
      setSubmitError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const anonId = getAnonymousId();
      const durationMs = Math.max(1000, Date.now() - startedAt);

      await submitAttempt({
        attemptId,
        anonId,
        answers: payloadAnswers,
        durationMs,
      });

      markSubmitted();
      router.push(`/result/${attemptId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submit failed.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <QuizShell>
      <div className="flex items-center justify-between gap-4">
        <p className="m-0 text-sm font-semibold text-slate-700">{testTitle}</p>
        <p className="m-0 text-xs font-medium uppercase tracking-wide text-slate-500">
          {answeredCount}/{total} answered
        </p>
      </div>

      <Stepper currentIndex={currentIndex} total={total} />

      <QuestionRenderer question={question} selectedOptionId={selectedOptionId} onSelect={setAnswer} />

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
            onClick={handleSubmit}
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
