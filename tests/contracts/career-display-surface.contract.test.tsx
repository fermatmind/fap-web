import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildActorsDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

describe("career display surface contract", () => {
  it("adapts and renders the valid Actors display surface", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    expect(surface?.subject.canonicalSlug).toBe("actors");
    expect(surface?.locale).toBe("en");
    expect(surface?.componentOrder).toContain("market_signal_card");
    expect(surface?.faqItems).toHaveLength(2);

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("Actors");
    expect(screen.getByTestId("fermat-decision-card")).toHaveTextContent("Fermat Quick Fit");
    expect(screen.getByTestId("career-snapshot-primary")).toHaveTextContent("Career Snapshot: U.S. Reference");
    expect(screen.getByTestId("career-snapshot-secondary")).toHaveTextContent("Mainland China Reference");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("How to Decide Whether Acting Fits You");
    expect(screen.getByTestId("riasec-fit-block")).toHaveTextContent("RIASEC Fit");
    expect(screen.getByTestId("personality-fit-block")).toHaveTextContent("Personality Fit");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("What Do Actors Do?");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("Core Responsibilities");
    expect(screen.getByTestId("work-context-block")).toHaveTextContent("Where Do Actors Work?");
    expect(screen.getByTestId("comparison-block")).toHaveTextContent("Actors Compared With Adjacent Roles");
    expect(screen.getByTestId("ai-impact-block")).toHaveTextContent("Will AI Replace Actors?");
    expect(screen.getByTestId("career-risks-block")).toHaveTextContent("What Are the Biggest Risks of Acting?");
    expect(screen.getByTestId("contract-risks-block")).toHaveTextContent("Contract and Project Risks");
    expect(screen.getByTestId("next-steps-block")).toHaveTextContent("What Should You Prepare Next?");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("FAQ");
    expect(screen.getByTestId("source-list")).toHaveTextContent("Sources");
    expect(screen.getByTestId("boundary-notice")).toHaveTextContent("Boundary notice");
    expect(screen.getByTestId("career-display-cta")).toHaveTextContent("Next step");
  });

  it("returns null for non-Actors subjects", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.subject.canonical_slug = "data-scientists";

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("returns null for non-ready display status", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.status = "draft";

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("strips forbidden governance fields recursively", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");
    const serialized = JSON.stringify(surface);

    expect(serialized).not.toContain("release_gate");
    expect(serialized).not.toContain("qa_risk");
    expect(serialized).not.toContain("admin_review_state");
    expect(serialized).not.toContain("tracking_json");
    expect(serialized).not.toContain("raw_ai_exposure_score");
  });

  it("rejects unknown component_order ids", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.component_order = [...fixture.component_order, "unknown_component"];

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("renders market signal captured, expiry, and sample-only boundaries", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("Captured at");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("2026-05-02");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("Expires at");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("2026-08-02");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("Example only, not market-wide statistics");
  });

  it("normalizes English and Chinese locales", () => {
    expect(adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en")?.locale).toBe("en");
    expect(adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "zh-CN")?.locale).toBe("zh");
    expect(adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "zh")?.subject.path).toBe("/zh/career/jobs/actors");
  });

  it("does not render a non-Actors fixture", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.subject.canonical_slug = "writers";
    const surface = adaptCareerDisplaySurface(fixture, "en");
    const { container } = render(<CareerDisplaySurface surface={surface} />);

    expect(surface).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });
});
