"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  QuestionRenderer,
  type QuizQuestion,
} from "@/components/business/QuestionRenderer";
import { useAnalyticsPageView } from "@/hooks/useAnalytics";
import { trackEvent } from "@/lib/analytics";
import { getTestBySlug } from "@/lib/content";
import { useQuizStore } from "@/store/quiz";

const DEMO_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    title: "In social situations, you usually...",
    options: [
      { id: "a", text: "Start conversations quickly." },
      { id: "b", text: "Wait until the mood feels right." },
      { id: "c", text: "Stay with familiar people." },
      { id: "d", text: "Observe before joining." },
    ],
  },
  {
    id: "q2",
    title: "When making a difficult decision, you lean on...",
    options: [
      { id: "a", text: "Logic and measurable facts." },
      { id: "b", text: "Values and people impact." },
      { id: "c", text: "Past experiences first." },
      { id: "d", text: "What feels most natural now." },
    ],
  },
  {
    id: "q3",
    title: "Your daily planning style is closest to...",
    options: [
      { id: "a", text: "Detailed checklist with time blocks." },
      { id: "b", text: "A light plan with room to adapt." },
      { id: "c", text: "Only plan major tasks." },
      { id: "d", text: "Decide as the day unfolds." },
    ],
  },
  {
    id: "q4",
    title: "In a team conflict, you tend to...",
    options: [
      { id: "a", text: "Clarify facts and resolve directly." },
      { id: "b", text: "Protect relationship harmony first." },
      { id: "c", text: "Step back and evaluate quietly." },
      { id: "d", text: "Ask for group consensus." },
    ],
  },
  {
    id: "q5",
    title: "After a busy week, the best recharge is...",
    options: [
      { id: "a", text: "Meeting close friends." },
      { id: "b", text: "Quiet solo time at home." },
      { id: "c", text: "A mix of social and solo plans." },
      { id: "d", text: "Trying a new experience." },
    ],
  },
];

export default function QuizPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  useAnalyticsPageView("start_test", { slug }, Boolean(slug));

  const test = useMemo(() => (slug ? getTestBySlug(slug) : null), [slug]);

  const answers = useQuizStore((state) => state.answers);
  const currentStep = useQuizStore((state) => state.currentStep);
  const isFinished = useQuizStore((state) => state.isFinished);

  const startTest = useQuizStore((state) => state.startTest);
  const setAnswer = useQuizStore((state) => state.setAnswer);
  const nextStep = useQuizStore((state) => state.nextStep);
  const prevStep = useQuizStore((state) => state.prevStep);
  const reset = useQuizStore((state) => state.reset);

  const autoNextTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    startTest(slug);
  }, [slug, startTest]);

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current !== null) {
        window.clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  const total = DEMO_QUESTIONS.length;
  const safeStep = Math.min(Math.max(currentStep, 0), total - 1);
  const question = DEMO_QUESTIONS[safeStep];
  const selectedOptionId = question ? answers[question.id] : undefined;

  if (!slug || !test) {
    return (
      <section
        style={{
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>Test not found</h1>
        <p style={{ margin: "10px 0 0", color: "#64748b" }}>
          The requested quiz slug does not exist in content.
        </p>
      </section>
    );
  }

  if (isFinished) {
    return (
      <section
        style={{
          borderRadius: 16,
          border: "1px solid #dbeafe",
          background: "#ffffff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ margin: 0, color: "#475569", letterSpacing: "0.06em" }}>
          Quiz Completed
        </p>
        <h1 style={{ margin: 0, fontSize: 24 }}>{test.title}</h1>
        <p style={{ margin: 0, color: "#334155" }}>
          You answered {Object.keys(answers).length}/{total} demo questions.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            width: "fit-content",
            border: "1px solid #0f172a",
            background: "#0f172a",
            color: "#ffffff",
            borderRadius: 10,
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          Retake
        </button>
      </section>
    );
  }

  if (!question) {
    return (
      <section
        style={{
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>{test.title}</h1>
        <p style={{ margin: "10px 0 0", color: "#64748b" }}>
          No demo questions are available.
        </p>
      </section>
    );
  }

  const handleSelect = (qId: string, oId: string) => {
    setAnswer(qId, oId);
    trackEvent("complete_question", {
      slug,
      questionId: qId,
      optionId: oId,
      step: safeStep + 1,
      total,
    });

    if (autoNextTimerRef.current !== null) {
      window.clearTimeout(autoNextTimerRef.current);
    }

    autoNextTimerRef.current = window.setTimeout(() => {
      nextStep();
      autoNextTimerRef.current = null;
    }, 150);
  };

  return (
    <>
      <section
        style={{
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {test.slug}
          </p>
          <h1 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>{test.title}</h1>
        </div>

        <QuestionRenderer
          question={question}
          selectedOptionId={selectedOptionId}
          onSelect={handleSelect}
        />
      </section>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          borderTop: "1px solid #e2e8f0",
          background: "rgba(255, 255, 255, 0.98)",
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
          backdropFilter: "blur(4px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: currentStep === 0 ? "#f8fafc" : "#ffffff",
              color: currentStep === 0 ? "#94a3b8" : "#0f172a",
              padding: "12px 14px",
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={nextStep}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "1px solid #0f172a",
              background: "#0f172a",
              color: "#ffffff",
              padding: "12px 14px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
