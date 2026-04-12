import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerFirstWaveLaunchTierSummary } from "@/lib/career/adapters/adaptCareerFirstWaveLaunchTierSummary";
import { fetchCareerFirstWaveLaunchTierSummary } from "@/lib/career/api/fetchCareerFirstWaveLaunchTierSummary";
import {
  getCareerOccupationLaunchTier,
  isCareerJobDetailStableByLaunchTier,
  isCareerLaunchTierAuthorityRouteKey,
} from "@/lib/career/launchPolicy";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career first-wave launch-tier contract", () => {
  it("requests the backend B34 launch-tier summary endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/launch-tier?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_first_wave_launch_tier",
          summary_version: "career.launch_tier.first_wave.v1",
          scope: "career_first_wave_10",
          counts: { total: 10, stable: 6, candidate: 2, hold: 2 },
          occupations: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveLaunchTierSummary({ locale: "zh" });

    expect(payload).not.toBeNull();
  });

  it("adapts backend launch-tier rows into slug-keyed governance truth without inventing local tiers", () => {
    const summary = adaptCareerFirstWaveLaunchTierSummary({
      payload: {
        summary_kind: "career_first_wave_launch_tier",
        summary_version: "career.launch_tier.first_wave.v1",
        scope: "career_first_wave_10",
        counts: {
          total: 3,
          stable: 1,
          candidate: 1,
          hold: 1,
        },
        occupations: [
          {
            occupation_uuid: "occ_stable",
            canonical_slug: "backend-architect",
            canonical_title_en: "Backend Architect",
            launch_tier: "stable",
            readiness_status: "publish_ready",
            lifecycle_state: "indexed",
            public_index_state: "indexable",
            index_eligible: true,
            reviewer_status: "approved",
            crosswalk_mode: "exact",
            allow_strong_claim: true,
            confidence_score: 82,
            blocked_governance_status: null,
            reason_codes: ["stable_launch_ready"],
          },
          {
            occupation_uuid: "occ_candidate",
            canonical_slug: "data-engineer",
            canonical_title_en: "Data Engineer",
            launch_tier: "candidate",
            readiness_status: "partial",
            lifecycle_state: "indexed",
            public_index_state: "indexable",
            index_eligible: true,
            reviewer_status: "approved",
            crosswalk_mode: "direct_match",
            allow_strong_claim: true,
            confidence_score: 69,
            blocked_governance_status: null,
            reason_codes: ["candidate_review_required"],
          },
          {
            occupation_uuid: "occ_hold",
            canonical_slug: "software-developers",
            canonical_title_en: "Software Developers",
            launch_tier: "hold",
            readiness_status: "blocked",
            lifecycle_state: "noindex",
            public_index_state: "blocked",
            index_eligible: false,
            reviewer_status: "changes_required",
            crosswalk_mode: "unmapped",
            allow_strong_claim: false,
            confidence_score: 42,
            blocked_governance_status: "blocked_override_eligible",
            reason_codes: ["hold_blocked_governance"],
          },
          {
            canonical_slug: "unknown-role",
            launch_tier: "launch_now",
          },
        ],
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.counts.stable).toBe(1);
    expect(summary?.launchTierBySlug["backend-architect"]).toBe("stable");
    expect(summary?.launchTierBySlug["data-engineer"]).toBe("candidate");
    expect(summary?.launchTierBySlug["software-developers"]).toBe("hold");
    expect(summary?.launchTierBySlug["unknown-role"]).toBeUndefined();
  });

  it("limits launch-tier authority consumption to occupation-backed job detail governance", () => {
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

    expect(isCareerLaunchTierAuthorityRouteKey("career_job_detail")).toBe(true);
    expect(isCareerLaunchTierAuthorityRouteKey("career_family_hub_detail")).toBe(false);
    expect(isCareerLaunchTierAuthorityRouteKey("career_mbti_recommendation_detail")).toBe(false);

    expect(getCareerOccupationLaunchTier(summary, "backend-architect")).toBe("stable");
    expect(getCareerOccupationLaunchTier(summary, "data-engineer")).toBe("candidate");
    expect(getCareerOccupationLaunchTier(summary, "unknown")).toBeNull();

    expect(isCareerJobDetailStableByLaunchTier(summary, "backend-architect")).toBe(true);
    expect(isCareerJobDetailStableByLaunchTier(summary, "data-engineer")).toBe(false);
  });
});
