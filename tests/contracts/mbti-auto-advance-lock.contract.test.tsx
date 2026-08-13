import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoAdvanceFlow } from "@/components/quiz/immersive/useAutoAdvanceFlow";

function MbtiAutoAdvanceHarness({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { selectAndAdvance } = useAutoAdvanceFlow({
    currentIndex,
    total: 2,
    onMove: setCurrentIndex,
    onLast: onComplete,
    confirmDelayMs: 200,
    enterDurationMs: 0,
    lockDuringTransition: true,
  });
  const questionId = `question-${currentIndex + 1}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => selectAndAdvance(
          () => setAnswers((current) => ({ ...current, [questionId]: "A" })),
          { questionId, code: "A" },
        )}
      >
        answer
      </button>
      <output data-testid="current-index">{currentIndex}</output>
      <output data-testid="recorded-count">{Object.keys(answers).length}</output>
    </div>
  );
}

describe("MBTI auto-advance input lock contract", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("records one answer per transition and completes from recorded answers, not click count", async () => {
    const onComplete = vi.fn();
    render(<MbtiAutoAdvanceHarness onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "answer" }));
    fireEvent.click(screen.getByRole("button", { name: "answer" }));

    expect(screen.getByTestId("recorded-count")).toHaveTextContent("1");
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");
    expect(onComplete).not.toHaveBeenCalled();

    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(screen.getByTestId("current-index")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "answer" }));
    fireEvent.click(screen.getByRole("button", { name: "answer" }));
    expect(screen.getByTestId("recorded-count")).toHaveTextContent("2");

    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("keeps the production completion counter bound to the recorded answer map", () => {
    const source = readFileSync(
      "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
      "utf8",
    );

    expect(source).toContain("const answeredCount = useMemo(");
    expect(source).toContain("count + (answers[item.id] ? 1 : 0)");
    expect(source).toContain("payloadAnswers.findIndex((item) => !item.code)");
    expect(source).toContain("lockDuringTransition: isMbtiScaleCode(normalizedScaleCode)");
  });
});
