import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";

describe("career shared renderer primitives", () => {
  it("ClaimGuard renders children only when the backend-owned allow state is true", () => {
    const { rerender } = render(
      <ClaimGuard allowed>
        <div>allowed-surface</div>
      </ClaimGuard>
    );

    expect(screen.getByText("allowed-surface")).toBeTruthy();

    rerender(
      <ClaimGuard allowed={false} fallback={<div>fallback-surface</div>}>
        <div>allowed-surface</div>
      </ClaimGuard>
    );

    expect(screen.queryByText("allowed-surface")).toBeNull();
    expect(screen.getByText("fallback-surface")).toBeTruthy();
  });

  it("TrustStrip renders compact trust posture from provided props only", () => {
    render(
      <TrustStrip
        locale="en"
        publicReview={{ reviewState: "approved", lastReviewedAt: null, reviewer: null }}
        indexState="indexable"
        reasonCodes={["publish_ready"]}
        compact
        testId="trust-strip"
      />
    );

    expect(screen.getByTestId("trust-strip")).toHaveTextContent("Human review completed");
    expect(screen.getByTestId("trust-strip")).toHaveTextContent("index_state: indexable");
    expect(screen.getByTestId("trust-strip")).toHaveTextContent("reason_codes: publish_ready");
  });

  it("WarningBanner stays hidden when the backend provides no warnings and renders explicit arrays otherwise", () => {
    const { rerender } = render(
      <WarningBanner
        locale="en"
        warnings={{ redFlags: [], amberFlags: [], blockedClaims: [] }}
        testId="warning-banner"
      />
    );

    expect(screen.queryByTestId("warning-banner")).toBeNull();

    rerender(
      <WarningBanner
        locale="en"
        warnings={{
          redFlags: ["trust_regression"],
          amberFlags: ["ai_role_shift_risk"],
          blockedClaims: ["salary_comparison"],
        }}
        testId="warning-banner"
      />
    );

    expect(screen.getByTestId("warning-banner")).toHaveTextContent("trust_regression");
    expect(screen.getByTestId("warning-banner")).toHaveTextContent("ai_role_shift_risk");
    expect(screen.getByTestId("warning-banner")).toHaveTextContent("salary_comparison");
  });
});
