"use client";

import type { ReactNode } from "react";
import { ProgressBar } from "@/components/business/ProgressBar";
import { QUIZ_DEMO_TOTAL_QUESTIONS, useQuizStore } from "@/store/quiz";

export default function QuizLayout({ children }: { children: ReactNode }) {
  const currentStep = useQuizStore((state) => state.currentStep);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: "1px solid #e2e8f0",
          background: "rgba(248, 250, 252, 0.96)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 16px" }}>
          <ProgressBar
            currentStep={currentStep}
            total={QUIZ_DEMO_TOTAL_QUESTIONS}
          />
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 16px 116px" }}>
        {children}
      </div>
    </div>
  );
}

