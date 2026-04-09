import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveCompletedCounter } from "@/components/marketing/LiveCompletedCounter";
import { LIVE_COMPLETED_COUNT, LIVE_COMPLETED_COUNT_TICK_MS } from "@/lib/marketing/completionStats";

type AnimatedCounterProps = {
  value: number;
  className?: string;
};

vi.mock("@/components/design/AnimatedCounter", () => ({
  AnimatedCounter: ({ value, className }: AnimatedCounterProps) => (
    <span data-testid="animated-counter" className={className}>
      {value}
    </span>
  ),
}));

describe("LiveCompletedCounter contract", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("increments the shared completed count once per second using a random step", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.6);

    render(<LiveCompletedCounter />);

    expect(screen.getByTestId("animated-counter")).toHaveTextContent(String(LIVE_COMPLETED_COUNT));

    act(() => {
      vi.advanceTimersByTime(LIVE_COMPLETED_COUNT_TICK_MS);
    });

    expect(screen.getByTestId("animated-counter")).toHaveTextContent(String(LIVE_COMPLETED_COUNT + 3));
  });
});
