import { describe, expect, it } from "vitest";
import { adaptCareerRuntimeConfig } from "@/lib/career/adapters/adaptCareerRuntimeConfig";

describe("career runtime-config contract", () => {
  it("normalizes backend threshold/experiment authority payload", () => {
    const adapted = adaptCareerRuntimeConfig({
      authority_kind: "career_threshold_experiment_authority",
      authority_version: "career.threshold_experiment.v1",
      snapshot_key: "career_default_v1",
      thresholds: {
        confidence: {
          publish_min: 60,
          promotion_candidate_min: 70,
          stable_min: 75,
        },
        warnings: {
          low_confidence_threshold: 72,
          high_strain_threshold: 70,
          ai_risk_threshold: 65,
        },
        promotion: {
          next_step_links_min: 2,
          strong_claim_required: true,
        },
      },
      experiments: {
        career_warning_copy_v1: {
          enabled: true,
          variant: "strict",
        },
        career_explorer_primary_path_v1: {
          enabled: true,
          variant: "guided_discovery",
        },
        career_transition_emphasis_v1: {
          enabled: true,
          variant: "risk_first",
        },
      },
    });

    expect(adapted.thresholds.confidence.publishMin).toBe(60);
    expect(adapted.thresholds.warnings.lowConfidenceThreshold).toBe(72);
    expect(adapted.thresholds.promotion.strongClaimRequired).toBe(true);
    expect(adapted.experiments.warningCopy.variant).toBe("strict");
    expect(adapted.experiments.explorerPrimaryPath.variant).toBe("guided_discovery");
    expect(adapted.experiments.transitionEmphasis.variant).toBe("risk_first");
  });
});

