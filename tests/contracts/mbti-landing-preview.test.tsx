import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MbtiLandingIntro } from "@/components/tests/MbtiLandingIntro";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const choices = [
  { key: "mbti_144", label: "144Q", summary: "15 minutes", href: "/zh/tests/mbti/take?form=mbti_144&source_page_type=test_landing", ctaLabel: "Start full", testId: "mbti-landing-primary-cta", eventProperties: { form_code: "mbti_144" } },
  { key: "mbti_93", label: "93Q", summary: "10 minutes", href: "/zh/tests/mbti/take?form=mbti_93&source_page_type=test_landing", ctaLabel: "Start short", testId: "mbti-landing-secondary-cta", eventProperties: { form_code: "mbti_93" } },
];
const props = { locale: "en" as const, title: "MBTI", description: "Description", disclaimer: "Not a diagnosis", questions: "93 / 144", duration: "10 / 15", choices, disabled: false };

describe("MBTI preview version selection", () => {
  it("switches the single start entry while retaining the supplied form and attribution", () => {
    render(<MbtiLandingIntro {...props} />);
    expect(screen.getByRole("link", { name: "Start full" })).toHaveAttribute("href", choices[0].href);
    fireEvent.click(screen.getByRole("radio", { name: "93Q 10 minutes" }));
    expect(screen.getByRole("link", { name: "Start short" })).toHaveAttribute("href", choices[1].href);
    expect(screen.queryByRole("link", { name: "Start full" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "93Q 10 minutes" })).toBeChecked();
  });
  it("does not expose a start link when the test is unavailable", () => {
    render(<MbtiLandingIntro {...props} disabled />);
    expect(screen.getByRole("status")).toHaveTextContent("temporarily unavailable");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Start/ })).not.toBeInTheDocument();
  });
  it("shows an unavailable state rather than inventing a version when no choices exist", () => {
    render(<MbtiLandingIntro {...props} choices={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("temporarily unavailable");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
