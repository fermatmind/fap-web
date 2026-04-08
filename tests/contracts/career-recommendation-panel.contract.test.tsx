import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CareerRecommendationPanel } from "@/components/career/CareerRecommendationPanel";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("career recommendation panel contract", () => {
  it("renders a trust-limited status instead of local scoring or explanation authority", () => {
    const { container } = render(<CareerRecommendationPanel locale="en" />);

    const status = screen.getByTestId("career-personalized-status");

    expect(status).toHaveAttribute("data-career-data-status", "trust_limited");
    expect(status.textContent).toContain("protocol-ready consumer");
    expect(status.textContent).toContain("no local scoring, explanation, or risk output");
    expect(container.textContent).not.toContain("Interest:");
    expect(container.textContent).not.toContain("MBTI:");
    expect(container.textContent).not.toContain("Risk:");
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "career_recommendation_view",
      expect.objectContaining({
        locale: "en",
        career_data_status: "trust_limited",
      })
    );
  });
});
