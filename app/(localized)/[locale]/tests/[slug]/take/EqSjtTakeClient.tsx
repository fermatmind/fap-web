"use client";

import QuizTakeClient from "./QuizTakeClient";

export default function EqSjtTakeClient({
  slug,
  testTitle,
  estimatedMinutes,
  questionCount,
}: {
  slug: string;
  testTitle: string;
  estimatedMinutes?: number;
  questionCount?: number;
}) {
  return (
    <QuizTakeClient
      slug={slug}
      testTitle={testTitle}
      scaleCode="EQ_SJT_16"
      estimatedMinutes={estimatedMinutes ?? 6}
      questionCount={questionCount ?? 16}
    />
  );
}
