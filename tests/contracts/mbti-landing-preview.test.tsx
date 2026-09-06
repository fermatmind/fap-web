import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";
import { MbtiLandingIntro } from "@/components/tests/MbtiLandingIntro";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const choices = [
  { key: "mbti_144", label: "144Q", summary: "15 minutes", href: "/zh/tests/mbti/take?form=mbti_144&source_page_type=test_landing", ctaLabel: "Start full", testId: "mbti-landing-primary-cta", eventProperties: { form_code: "mbti_144" } },
  { key: "mbti_93", label: "93Q", summary: "10 minutes", href: "/zh/tests/mbti/take?form=mbti_93&source_page_type=test_landing", ctaLabel: "Start short", testId: "mbti-landing-secondary-cta", eventProperties: { form_code: "mbti_93" } },
];
const props = { locale: "en" as const, title: "MBTI", description: "Description", disclaimer: "Not a diagnosis", questions: "93 / 144", duration: "10 / 15", choices, disabled: false };

describe("MBTI preview version selection", () => {
  it("exposes both direct entries with their supplied forms and attribution", () => {
    render(<MbtiLandingIntro {...props} />);
    for (const choice of choices) {
      const link = screen.getByRole("link", { name: choice.label });
      expect(link).toHaveAttribute("href", choice.href);
      expect(link).not.toHaveAttribute("aria-describedby");
      expect(screen.queryByText(choice.summary)).not.toBeInTheDocument();
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link);
      expect(trackEvent).toHaveBeenLastCalledWith("start_click", choice.eventProperties);
    }
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
  it("keeps the supplied title and makes the Chinese question counts readable", () => {
    render(<MbtiLandingIntro {...props} locale="zh" choices={choices.map((choice) => ({ ...choice, label: `MBTI ${choice.label}` }))} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("MBTI");
    expect(screen.getByRole("link", { name: "144 题" })).toHaveAttribute("href", choices[0].href);
    expect(screen.getByRole("link", { name: "93 题" })).toHaveAttribute("href", choices[1].href);
  });
  it("does not expose a start link when the test is unavailable", () => {
    render(<MbtiLandingIntro {...props} disabled />);
    expect(screen.getByRole("status")).toHaveTextContent("temporarily unavailable");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it("shows an unavailable state rather than inventing a version when no choices exist", () => {
    render(<MbtiLandingIntro {...props} choices={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("temporarily unavailable");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
