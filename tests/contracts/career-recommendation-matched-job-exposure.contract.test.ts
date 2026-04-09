import { describe, expect, it } from "vitest";
import { adaptCareerRecommendationBundle } from "@/lib/career/adapters/adaptCareerRecommendationBundle";
import {
  filterStableRecommendationMatchedJobs,
  getRecommendationMatchedJobExposureState,
} from "@/lib/career/recommendationMatchedJobExposurePolicy";

describe("career recommendation matched-job exposure contract", () => {
  it("classifies authority matched jobs using backend readiness signals only", () => {
    const detail = adaptCareerRecommendationBundle({
      locale: "en",
      requestedType: "intj-a",
      payload: {
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          content_version: "content.v1",
          data_version: "data.v1",
          logic_version: "logic.v1",
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          index_state: "index",
          index_eligible: true,
        },
        matched_jobs: [
          {
            occupation_uuid: "occ_stable",
            canonical_slug: "data-scientist",
            title: "Data Scientist",
            seo_contract: {
              canonical_path: "/career/jobs/data-scientist",
              index_state: "indexable",
              index_eligible: true,
              reason_codes: ["stable_publish_ready"],
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
          {
            occupation_uuid: "occ_trust_limited",
            canonical_slug: "marketing-manager",
            title: "Marketing Manager",
            seo_contract: {
              canonical_path: "/career/jobs/marketing-manager",
              index_state: "trust_limited",
              index_eligible: false,
              reason_codes: ["trust_limited"],
            },
            trust_summary: {
              reviewer_status: "pending",
            },
          },
          {
            occupation_uuid: "occ_blocked",
            canonical_slug: "financial-analyst",
            title: "Financial Analyst",
            seo_contract: {
              canonical_path: "/career/jobs/financial-analyst",
              index_state: "blocked",
              index_eligible: false,
              reason_codes: ["missing_crosswalk_source_code"],
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
      },
    });

    expect(detail).not.toBeNull();
    const jobs = detail?.matchedJobs ?? [];

    expect(getRecommendationMatchedJobExposureState(jobs[0]!)).toBe("stable");
    expect(getRecommendationMatchedJobExposureState(jobs[1]!)).toBe("hidden");
    expect(getRecommendationMatchedJobExposureState(jobs[2]!)).toBe("hidden");
    expect(filterStableRecommendationMatchedJobs(jobs).map((job) => job.canonicalSlug)).toEqual(["data-scientist"]);
  });
});
