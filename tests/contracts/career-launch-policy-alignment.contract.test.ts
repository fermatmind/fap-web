import { describe, expect, it } from "vitest";
import {
  CAREER_LAUNCH_SMOKE_MATRIX,
  CAREER_LAUNCH_TIER_AUTHORITY_ROUTE_KEYS,
  getCareerOccupationLaunchTier,
  getCareerLaunchManifestRouteKeys,
  getCareerLaunchRouteKey,
  getCareerLaunchState,
  isCareerJobDetailStableByLaunchTier,
} from "@/lib/career/launchPolicy";
import { adaptCareerFirstWaveLaunchTierSummary } from "@/lib/career/adapters/adaptCareerFirstWaveLaunchTierSummary";

describe("career launch policy alignment contract", () => {
  it("classifies current career routes deterministically", () => {
    expect(getCareerLaunchState("/en/career")).toBe("stable");
    expect(getCareerLaunchState("/zh/career/jobs")).toBe("stable");
    expect(getCareerLaunchState("/en/career/jobs/backend-architect")).toBe("stable");
    expect(getCareerLaunchState("/en/career/recommendations")).toBe("stable");
    expect(getCareerLaunchState("/en/career/recommendations/mbti/intj-a")).toBe("stable");
    expect(getCareerLaunchState("/en/career/guides")).toBe("candidate");
    expect(getCareerLaunchState("/en/career/industries/data")).toBe("candidate");
    expect(getCareerLaunchState("/en/career/tests/riasec")).toBe("candidate");
    expect(getCareerLaunchState("/en/career/recommendations/big5/openness")).toBe("hold");
    expect(getCareerLaunchState("/en/career/backend-architect")).toBe("hold");
    expect(getCareerLaunchState("/en/career/jobs?q=backend")).toBe("noindex");
    expect(getCareerLaunchState("/en/career/tests/riasec/result")).toBe("noindex");
    expect(getCareerLaunchState("/en/career/jobs?q=   ")).toBe("stable");
  });

  it("keeps the smoke matrix and manifest route keys aligned", () => {
    const manifestKeys = getCareerLaunchManifestRouteKeys().sort();
    const smokeKeys = CAREER_LAUNCH_SMOKE_MATRIX.route_classes.map((entry) => entry.key).sort();

    expect(smokeKeys).toEqual(manifestKeys);
  });

  it("maps representative current routes to the expected route classes", () => {
    expect(getCareerLaunchRouteKey("/en/career")).toBe("career_landing");
    expect(getCareerLaunchRouteKey("/en/career/jobs")).toBe("career_jobs_index");
    expect(getCareerLaunchRouteKey("/en/career/jobs?q=backend")).toBe("career_jobs_query");
    expect(getCareerLaunchRouteKey("/en/career/jobs/backend-architect")).toBe("career_job_detail");
    expect(getCareerLaunchRouteKey("/en/career/recommendations/mbti/intj-a")).toBe(
      "career_mbti_recommendation_detail"
    );
    expect(getCareerLaunchRouteKey("/en/career/recommendations/big5/openness")).toBe(
      "career_big5_recommendation_detail"
    );
    expect(getCareerLaunchRouteKey("/en/career/tests/riasec/result")).toBe("career_riasec_result");
    expect(getCareerLaunchRouteKey("/en/career/random-legacy-slug")).toBe("career_legacy_slug_bridge");
  });

  it("keeps backend launch-tier alignment separate from static route-class launch states", () => {
    const summary = adaptCareerFirstWaveLaunchTierSummary({
      payload: {
        summary_kind: "career_first_wave_launch_tier",
        summary_version: "career.launch_tier.first_wave.v1",
        scope: "career_first_wave_10",
        counts: {
          total: 2,
          stable: 1,
          candidate: 1,
          hold: 0,
        },
        occupations: [
          {
            canonical_slug: "backend-architect",
            launch_tier: "stable",
          },
          {
            canonical_slug: "data-engineer",
            launch_tier: "candidate",
          },
        ],
      },
    });

    expect(CAREER_LAUNCH_TIER_AUTHORITY_ROUTE_KEYS).toEqual(["career_job_detail"]);
    expect(getCareerLaunchState("/en/career/jobs/backend-architect")).toBe("stable");
    expect(getCareerOccupationLaunchTier(summary, "backend-architect")).toBe("stable");
    expect(getCareerOccupationLaunchTier(summary, "data-engineer")).toBe("candidate");
    expect(isCareerJobDetailStableByLaunchTier(summary, "backend-architect")).toBe(true);
    expect(isCareerJobDetailStableByLaunchTier(summary, "data-engineer")).toBe(false);
  });
});
