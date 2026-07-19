import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CareerTransitionPathPanel } from "@/components/career/transition/CareerTransitionPathPanel";

describe("career transition emphasis contract", () => {
  it("renders transition emphasis variant from runtime config without changing path truth fields", () => {
    const html = renderToStaticMarkup(
      (
        <CareerTransitionPathPanel
          locale="en"
          emphasisVariant="risk_first"
          landingPath="/en/career/recommendations/mbti/intj"
          transitionPath={{
            pathType: "bridge",
            targetJob: {
              occupationUuid: "occ_1",
              canonicalSlug: "registered-nurses",
              title: "Registered Nurses",
              href: "/en/career/jobs/registered-nurses",
            },
            scoreSummary: {
              mobilityScore: {
                value: 68,
                integrity_state: "full",
                confidence_cap: null,
                critical_missing_fields: [],
                formula_ref: null,
                component_breakdown: {},
                penalties: [],
                degradation_factor: 1,
              },
              confidenceScore: {
                value: 74,
                integrity_state: "full",
                confidence_cap: null,
                critical_missing_fields: [],
                formula_ref: null,
                component_breakdown: {},
                penalties: [],
                degradation_factor: 1,
              },
            },
            trustSummary: {
              allowTransitionRecommendation: true,
              reviewerStatus: "approved",
              publicReview: { reviewState: "approved", lastReviewedAt: null, reviewer: null },
              reasonCodes: [],
            },
            whyThisPath: "Adjacent skill overlap and market transferability.",
            whatIsLost: "Short-term pay certainty and credential comfort.",
            bridgeSteps90d: [
              {
                stepKey: "portfolio",
                title: "Build portfolio",
                description: "Create role-specific portfolio artifacts.",
                timeHorizon: "days_0_30",
              },
            ],
            rationaleCodes: ["adjacent_skill_overlap"],
            tradeoffCodes: ["pay_uncertainty"],
            seoContract: {
              canonicalPath: null,
              canonicalTarget: null,
              indexState: null,
              indexEligible: null,
              reasonCodes: [],
              datasetEligible: null,
              articleEligible: null,
            },
          }}
        />
      ) as ReactNode
    );

    expect(html).toContain("career-transition-emphasis-variant");
    expect(html).toContain("Display emphasis");
    expect(html).toContain("risk_first");
    expect(html).toContain("Why this path");
    expect(html).toContain("What is lost");
    expect(html).toContain("90-day bridge steps");
  });
});
