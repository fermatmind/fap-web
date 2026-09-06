import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssessmentLandingIntro } from "@/components/tests/AssessmentLandingIntro";
import { trackEvent } from "@/lib/analytics";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const choices = [
  { key: "short", label: "90Q", href: "/zh/tests/big-five-personality-test-ocean-model/take?form=big5_90", testId: "short", eventProperties: { form_code: "big5_90" } },
  { key: "full", label: "120Q", href: "/zh/tests/big-five-personality-test-ocean-model/take?form=big5_120", testId: "full", eventProperties: { form_code: "big5_120" } },
];
describe("illustrated assessment landing entry", () => {
  it("keeps each form destination and click attribution", () => {
    render(<AssessmentLandingIntro locale="zh" title="大五人格" choices={choices} disabled={false} />);
    for (const choice of choices) {
      const link = screen.getByTestId(choice.testId);
      expect(link).toHaveAttribute("href", choice.href);
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link);
      expect(trackEvent).toHaveBeenLastCalledWith("start_click", choice.eventProperties);
    }
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("大五人格");
    expect(screen.getByRole("link", { name: "90 题" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("keeps unavailable forms out of the links", () => {
    render(<AssessmentLandingIntro locale="en" title="Test" choices={[{ ...choices[0], href: null }]} disabled={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("temporarily unavailable");
  });
  it("blocks all entries while the assessment is disabled", () => {
    render(<AssessmentLandingIntro locale="zh" title="测试" choices={choices} disabled />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("测试暂不可用");
  });
});
