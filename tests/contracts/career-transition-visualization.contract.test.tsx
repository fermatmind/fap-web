import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CareerTransitionPathPanel } from "@/components/career/transition/CareerTransitionPathPanel";
import type { CareerTransitionPreviewAdapter } from "@/lib/career/adapters/types";

vi.mock("@/components/analytics/TrackedCareerLink", () => ({
  TrackedCareerLink: ({
    href,
    children,
    eventName: _eventName,
    eventPayload: _eventPayload,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    eventName?: string;
    eventPayload?: unknown;
  }) => {
    void _eventName;
    void _eventPayload;

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/components/career/TrustStrip", () => ({
  TrustStrip: ({
    testId,
    publicReview,
    indexState,
    reasonCodes,
  }: {
    testId: string;
    publicReview?: { reviewState: string } | null;
    indexState: string | null;
    reasonCodes: string[];
  }) => (
    <div data-testid={testId}>
      {`${publicReview?.reviewState === "approved" ? "Human review completed" : "review pending"} index_state:${indexState ?? "none"} reason_codes:${reasonCodes.join(",")}`}
    </div>
  ),
}));

function makeTransitionPath(pathType: string): CareerTransitionPreviewAdapter {
  return {
    pathType,
    steps: ["skill_overlap"],
    targetJob: {
      occupationUuid: "occ_1",
      canonicalSlug: "product-manager",
      title: "Product Manager",
      href: "/en/career/jobs/product-manager",
    },
    scoreSummary: {
      mobilityScore: {
        value: 74,
        integrity_state: "full",
        confidence_cap: null,
        critical_missing_fields: [],
        degradation_factor: 1,
        formula_ref: null,
        component_breakdown: {},
        penalties: [],
      },
      confidenceScore: {
        value: 68,
        integrity_state: "full",
        confidence_cap: null,
        critical_missing_fields: [],
        degradation_factor: 1,
        formula_ref: null,
        component_breakdown: {},
        penalties: [],
      },
    },
    trustSummary: {
      allowTransitionRecommendation: true,
      reviewerStatus: "approved",
      publicReview: { reviewState: "approved", lastReviewedAt: null, reviewer: null },
      reasonCodes: ["publish_ready"],
    },
    seoContract: {
      canonicalPath: "/career/jobs/product-manager",
      canonicalTarget: "/career/jobs/product-manager",
      indexState: "index",
      indexEligible: true,
      reasonCodes: ["publish_ready"],
      datasetEligible: null,
      articleEligible: null,
    },
    whyThisPath: "Path selected from: same-family target; publish-ready target.",
    whatIsLost: "Tradeoff emphasis: higher training requirement.",
    bridgeSteps90d: [
      {
        stepKey: "skill_overlap",
        title: "Validate overlapping skills",
        description: "Document source-role strengths that transfer directly to the target role.",
        timeHorizon: "days_0_30",
      },
      {
        stepKey: "task_overlap",
        title: "Translate task overlap",
        description: "Map repeated target-role tasks to proof from recent source-role execution.",
        timeHorizon: "days_31_60",
      },
      {
        stepKey: "tool_overlap",
        title: "Close tooling gap",
        description: "Build explicit exposure to core target-role tools through scoped practice.",
        timeHorizon: "days_61_90",
      },
    ],
    rationaleCodes: ["same_family_target", "publish_ready_target"],
    tradeoffCodes: ["higher_training_required"],
    delta: {
      trainingDelta: {
        sourceValue: "Moderate-term",
        targetValue: "Short-term",
        direction: "lower",
      },
    },
  };
}

describe("career transition visualization contract", () => {
  it("renders full transition path fields on recommendation detail surface", () => {
    const html = renderToStaticMarkup(
      <CareerTransitionPathPanel
        locale="en"
        transitionPath={makeTransitionPath("stable_upside")}
        landingPath="/en/career/recommendations/mbti/intj-a"
      />
    );

    expect(html).toContain("career-transition-path-panel");
    expect(html).toContain("Product Manager");
    expect(html).toContain("Why this path");
    expect(html).toContain("What is lost");
    expect(html).toContain("Path selected from: same-family target; publish-ready target.");
    expect(html).toContain("Tradeoff emphasis: higher training requirement.");
    expect(html).toContain("90-day bridge steps");
    expect(html).toContain("Days 0-30");
    expect(html).toContain("Days 31-60");
    expect(html).toContain("Days 61-90");
    expect(html).toContain("same_family_target");
    expect(html).toContain("higher_training_required");
    expect(html).toContain("Mobility");
    expect(html).toContain("Confidence");
    expect(html).toContain("Human review completed");
    expect(html).not.toContain("reviewer_status");
  });

  it("keeps safe fallback rendering for unsupported path_type and missing optional fields", () => {
    const fallbackPath = {
      ...makeTransitionPath("custom_path"),
      whyThisPath: null,
      whatIsLost: null,
      bridgeSteps90d: [],
      rationaleCodes: [],
      tradeoffCodes: [],
    } satisfies CareerTransitionPreviewAdapter;

    const html = renderToStaticMarkup(
      <CareerTransitionPathPanel
        locale="en"
        transitionPath={fallbackPath}
        landingPath="/en/career/recommendations/mbti/intj-a"
      />
    );

    expect(html).toContain("Custom path · custom_path");
    expect(html).toContain("rendered with conservative fallback semantics");
    expect(html).toContain("No backend why_this_path provided for this path");
    expect(html).toContain("No backend what_is_lost provided for this path");
    expect(html).toContain("No backend bridge_steps_90d provided for this path");
    expect(html).toContain("No rationale codes");
    expect(html).toContain("No tradeoff codes");
  });
});
