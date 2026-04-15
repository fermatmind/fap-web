import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StrainRadar } from "@/components/career/StrainRadar";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { adaptCareerRecommendationBundle } from "@/lib/career/adapters/adaptCareerRecommendationBundle";
import { readFileSync } from "node:fs";
import path from "node:path";

const AXIS_KEYS = [
  "people_friction",
  "context_switch_load",
  "political_load",
  "uncertainty_load",
  "low_autonomy_trap",
  "repetition_mismatch",
] as const;

describe("career strain radar contract", () => {
  it("keeps fixed six-axis mapping from backend white-box strain payload on job detail and recommendation detail", () => {
    const jobBundle = adaptCareerJobBundle({
      locale: "en",
      requestedSlug: "software-developer",
      payload: {
        identity: { canonical_slug: "software-developer" },
        titles: { canonical_en: "Software Developer" },
        seo_contract: { canonical_path: "/career/jobs/software-developer", index_state: "index", index_eligible: true },
        score_bundle: {
          fit_score: { value: 78 },
          strain_score: { value: 44 },
          ai_survival_score: { value: 67 },
          mobility_score: { value: 71 },
          confidence_score: { value: 83 },
        },
        white_box_scores: {
          strain_score: {
            score: 44,
            integrity_state: "provisional",
            degradation_factor: 0.88,
            formula_breakdown: [{ code: "baseline", value: 0.44, weight: 1 }],
            component_weights: { risk: 0.4, demand: 0.6 },
            penalties: [{ code: "partial_data", value: -0.04, reason: "missing_source" }],
            warnings: ["trust_limited"],
            radar_dimensions: {
              people_friction: 0.61,
              context_switch_load: 0.52,
              political_load: 0.47,
              uncertainty_load: 0.58,
              low_autonomy_trap: 0.41,
              repetition_mismatch: 0.33,
              extra_axis: 0.99,
            },
          },
        },
      },
    });
    const recommendationBundle = adaptCareerRecommendationBundle({
      locale: "en",
      requestedType: "intj-a",
      payload: {
        identity: { mbti_type: "INTJ-A" },
        recommendation_subject_meta: { canonical_type: "INTJ" },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          canonical_target: "/career/jobs/software-developer",
          index_state: "index",
          index_eligible: true,
        },
        score_bundle: {
          fit_score: { value: 76 },
          strain_score: { value: 41 },
          ai_survival_score: { value: 63 },
          mobility_score: { value: 68 },
          confidence_score: { value: 80 },
        },
        white_box_scores: {
          strain_score: {
            radar_dimensions: {
              people_friction: 0.59,
              context_switch_load: 0.51,
              political_load: 0.43,
              uncertainty_load: 0.63,
              low_autonomy_trap: 0.48,
              repetition_mismatch: 0.36,
            },
          },
        },
      },
    });

    expect(jobBundle?.whiteBoxScores.strainScore?.radarDimensions).toEqual({
      people_friction: 0.61,
      context_switch_load: 0.52,
      political_load: 0.47,
      uncertainty_load: 0.58,
      low_autonomy_trap: 0.41,
      repetition_mismatch: 0.33,
    });
    expect(recommendationBundle?.whiteBoxScores.strainScore?.radarDimensions).toEqual({
      people_friction: 0.59,
      context_switch_load: 0.51,
      political_load: 0.43,
      uncertainty_load: 0.63,
      low_autonomy_trap: 0.48,
      repetition_mismatch: 0.36,
    });
  });

  it("renders SSR-safe six-axis radar with legend and no dynamic extra axis", () => {
    const dimensions = {
      people_friction: 0.61,
      context_switch_load: 0.52,
      political_load: 0.47,
      uncertainty_load: 0.58,
      low_autonomy_trap: 0.41,
      repetition_mismatch: 0.33,
    } as const;

    const html = renderToStaticMarkup(
      <StrainRadar locale="en" dimensions={dimensions} testId="career-strain-radar" />
    );
    expect(html).toContain("career-strain-radar");
    expect(html).toContain("Strain six-axis radar");
    expect(html).toContain("People friction");
    expect(html).toContain("Repetition mismatch");
    expect(html).not.toContain("extra_axis");

    render(<StrainRadar locale="en" dimensions={dimensions} testId="career-strain-radar-client" />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);
    for (const axisKey of AXIS_KEYS) {
      expect(document.querySelector(`[data-axis-key="${axisKey}"]`)).not.toBeNull();
    }
  });

  it("keeps family hub surface out of strain radar wiring", () => {
    const familyPageSource = readFileSync(
      path.resolve(process.cwd(), "app/(localized)/[locale]/career/family/[slug]/page.tsx"),
      "utf8"
    );

    expect(familyPageSource).not.toContain("StrainRadar");
    expect(familyPageSource).not.toContain("career-family-strain-radar");
  });
});
