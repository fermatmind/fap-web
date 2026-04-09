import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SbtiTestClient } from "@/components/sbti/SbtiTestClient";

const hoisted = vi.hoisted(() => ({
  push: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: hoisted.push,
  }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("SbtiTestClient auto-advance contract", () => {
  beforeEach(() => {
    hoisted.push.mockReset();
    hoisted.trackEvent.mockReset();
    window.localStorage.clear();
  });

  it("scrolls to the next question after selecting an answer", () => {
    const scrollTargets: Element[] = [];

    Object.defineProperty(window, "requestAnimationFrame", {
      writable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    });

    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: function scrollIntoView() {
        scrollTargets.push(this);
      },
    });

    render(<SbtiTestClient locale="zh" />);

    const firstQuestion = screen.getByTestId("sbti-question-1");
    const nextQuestion = screen.getByTestId("sbti-question-2");
    const firstQuestionOption = within(firstQuestion).getByRole("radio", { name: /A\. 不认同/i });

    fireEvent.click(firstQuestionOption);

    expect(scrollTargets[0]).toBe(nextQuestion);
  });
});
