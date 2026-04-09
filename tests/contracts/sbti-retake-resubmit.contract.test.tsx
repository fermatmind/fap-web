/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SbtiResultClient } from "@/components/sbti/SbtiResultClient";
import { SbtiTestClient } from "@/components/sbti/SbtiTestClient";
import { formatSbtiRarityPercent, SBTI_RESULT_PROFILES } from "@/lib/sbti/results";
import { SBTI_QUESTIONS } from "@/lib/sbti/questions";
import { resolveSbtiPrimaryType, scoreSbtiAnswers } from "@/lib/sbti/scoring";
import { readSbtiState, writeSbtiState, type SbtiStoredState } from "@/lib/sbti/storage";

const hoisted = vi.hoisted(() => ({
  push: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: hoisted.push,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    priority,
    unoptimized,
    alt = "",
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    unoptimized?: boolean;
    src?: string | { src: string };
  }) => {
    void priority;
    void unoptimized;
    return <img alt={alt} src={typeof src === "string" ? src : src?.src} {...props} />;
  },
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function buildCompletedState(overrides?: Partial<SbtiStoredState>): SbtiStoredState {
  const answers = Object.fromEntries(SBTI_QUESTIONS.map((question) => [question.id, question.options[0]?.id ?? "A"]));
  const scores = scoreSbtiAnswers(SBTI_QUESTIONS, answers);
  const resolved = resolveSbtiPrimaryType(scores, SBTI_RESULT_PROFILES);

  return {
    version: 1,
    locale: "zh",
    updatedAt: "2026-04-09T00:00:00.000Z",
    answers,
    completedResult: {
      version: 1,
      updatedAt: "2026-04-09T00:00:00.000Z",
      locale: "zh",
      answers,
      scores,
      primaryTypeCode: resolved.primary.code,
      matchPercent: resolved.matchPercent,
      similarity: resolved.similarity,
    },
    submissionCount: 1,
    ...overrides,
  };
}

describe("SBTI retake and resubmit contract", () => {
  beforeEach(() => {
    hoisted.push.mockReset();
    hoisted.trackEvent.mockReset();
    window.localStorage.clear();
  });

  it("returns to the test with prior answers preserved for resubmission", () => {
    const state = buildCompletedState();
    writeSbtiState(state);

    render(<SbtiResultClient locale="zh" />);

    fireEvent.click(screen.getByRole("button", { name: "返回题目重新提交" }));

    expect(readSbtiState()).toMatchObject({
      answers: state.answers,
      completedResult: null,
      submissionCount: 1,
    });
    expect(hoisted.push).toHaveBeenCalledWith("/zh/fun/sbti");
  });

  it("shows a resubmit call-to-action when prior answers were loaded", () => {
    const state = buildCompletedState({ completedResult: null });
    writeSbtiState(state);

    render(<SbtiTestClient locale="zh" />);

    expect(screen.getByText("已载入你上次提交时的答案。你可以直接重新提交，或改几题后再重新提交结果。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新提交结果" })).toBeInTheDocument();
  });

  it("renders rarity instead of launch status on the result summary card", () => {
    const state = buildCompletedState();
    writeSbtiState(state);

    render(<SbtiResultClient locale="zh" />);

    expect(screen.getByText("稀有度")).toBeInTheDocument();
    expect(screen.getByText(formatSbtiRarityPercent(state.completedResult!.primaryTypeCode))).toBeInTheDocument();
    expect(screen.queryByText("结果状态")).not.toBeInTheDocument();
  });
});
