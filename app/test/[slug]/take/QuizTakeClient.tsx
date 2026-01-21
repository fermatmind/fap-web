"use client";

import { useEffect, useMemo, useRef } from "react";
import { QuizShell } from "@/components/quiz/QuizShell";
import { Stepper } from "@/components/quiz/Stepper";
import { QuestionRenderer } from "@/components/quiz/QuestionRenderer";
import type { QuizQuestion } from "@/lib/quiz/mock";
import { QuizStoreProvider, useQuizStore } from "@/lib/quiz/store";

export default function QuizTakeClient({
  slug,
  questions
}: {
  slug: string;
  questions: QuizQuestion[];
}) {
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);

  return (
    <QuizStoreProvider slug={slug} initialQuestionIds={questionIds}>
      <QuizTakeInner slug={slug} questions={questions} />
    </QuizStoreProvider>
  );
}

function QuizTakeInner({
  slug,
  questions
}: {
  slug: string;
  questions: QuizQuestion[];
}) {
  const total = questions.length;
  const currentIndex = useQuizStore((store) => store.state.currentIndex);
  const answers = useQuizStore((store) => store.state.answers);
  const drafts = useQuizStore((store) => store.state.drafts);
  const startedAt = useQuizStore((store) => store.state.startedAt);
  const setAnswer = useQuizStore((store) => store.setAnswer);
  const setDraft = useQuizStore((store) => store.setDraft);
  const next = useQuizStore((store) => store.next);
  const prev = useQuizStore((store) => store.prev);

  const question = questions[currentIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;
  const draft = question ? drafts[question.id] ?? "" : "";

  const latestRef = useRef({ slug, currentIndex, startedAt });

  useEffect(() => {
    latestRef.current = { slug, currentIndex, startedAt };
  }, [slug, currentIndex, startedAt]);

  useEffect(() => {
    const logDropoff = (source: string) => {
      const latest = latestRef.current;
      const spentMs = Math.max(0, Date.now() - latest.startedAt);
      // eslint-disable-next-line no-console
      console.log("[quiz dropoff]", {
        source,
        slug: latest.slug,
        currentIndex: latest.currentIndex,
        spent_ms: spentMs
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logDropoff("visibilitychange");
      }
    };

    const handleBeforeUnload = () => {
      logDropoff("beforeunload");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (!question) {
    return (
      <QuizShell>
        <p>No questions found for this test.</p>
      </QuizShell>
    );
  }

  return (
    <QuizShell>
      <Stepper currentIndex={currentIndex} total={total} />

      <QuestionRenderer
        question={question}
        selectedOptionId={selectedOptionId}
        onSelect={setAnswer}
      />

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="quiz-draft" style={{ fontWeight: 600 }}>
          Notes (draft)
        </label>
        <textarea
          id="quiz-draft"
          value={draft}
          onChange={(event) => setDraft(question.id, event.target.value)}
          placeholder="Optional notes for this question"
          rows={3}
          style={{
            resize: "vertical",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #d0d0d0"
          }}
        />
      </section>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => prev()}
          disabled={currentIndex === 0}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: currentIndex === 0 ? "#f2f2f2" : "#fff",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer"
          }}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => next(total)}
          disabled={currentIndex >= total - 1}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: currentIndex >= total - 1 ? "#f2f2f2" : "#111",
            color: currentIndex >= total - 1 ? "#666" : "#fff",
            cursor: currentIndex >= total - 1 ? "not-allowed" : "pointer"
          }}
        >
          Next
        </button>
      </div>
    </QuizShell>
  );
}
