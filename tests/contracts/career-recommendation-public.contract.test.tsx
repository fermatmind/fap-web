import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerFirstWaveRecommendationCompanionLinks } from "@/lib/career/adapters/adaptCareerFirstWaveRecommendationCompanionLinks";
import { adaptCareerRecommendationExplainability } from "@/lib/career/adapters/adaptCareerExplainability";
import { adaptCareerRecommendationBundle } from "@/lib/career/adapters/adaptCareerRecommendationBundle";
import { fetchCareerFirstWaveRecommendationCompanionLinks } from "@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks";
import { fetchCareerRecommendationExplainability } from "@/lib/career/api/fetchCareerRecommendationExplainability";
import { fetchCareerRecommendationBundle } from "@/lib/career/api/fetchCareerRecommendationBundle";
import { buildCareerRecommendationFrontendUrl } from "@/lib/career/urls";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career recommendation public contract", () => {
  it("requests the backend recommendation explainability endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/recommendations/mbti/intj-a/explainability?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_explainability",
          summary_version: "career.explainability.v1",
          subject_kind: "recommendation",
        });
      })
    );

    const payload = await fetchCareerRecommendationExplainability({ locale: "zh", type: "intj-a" });

    expect(payload).not.toBeNull();
  });

  it("requests the backend recommendation bundle endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/recommendations/mbti/intj-a?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          identity: {
            mbti_type: "INTJ-A",
          },
        });
      })
    );

    const payload = await fetchCareerRecommendationBundle({ locale: "zh", type: "intj-a" });

    expect(payload).not.toBeNull();
  });

  it("requests the backend recommendation companion-links endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/recommendations/mbti/intj-a/companion-links?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_first_wave_recommendation_companion_links",
          summary_version: "career.companion.recommendation.first_wave.v1",
          scope: "career_first_wave_10",
          subject_kind: "recommendation_subject",
          companion_links: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveRecommendationCompanionLinks({ locale: "zh", type: "intj-a" });

    expect(payload).not.toBeNull();
  });

  it("preserves transient detail API failure instead of synthesizing recommendation truth", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "upstream failure" }, 500))
    );

    await expect(
      fetchCareerRecommendationBundle({ locale: "zh", type: "intj-a" })
    ).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
      retryable: true,
      authoritativeAbsence: false,
    });
  });

  it("adapts backend recommendation bundle and keeps explicit claim, trust, warning, and provenance sections", () => {
    const detail = adaptCareerRecommendationBundle({
      locale: "zh",
      requestedType: "intj-a",
      payload: {
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        score_bundle: {
          fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
          ai_survival_score: { value: 74, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 77, integrity_state: "full", degradation_factor: 1.0 },
        },
        warnings: {
          red_flags: [],
          amber_flags: ["ai_role_shift_risk"],
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
          public_review: {
            review_state: "approved",
            last_reviewed_at: "2026-07-18T12:00:00.000000Z",
            reviewer: null,
          },
          logic_version: "v1.2",
          content_version: "content.v1",
          data_version: "data.v1",
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          index_state: "index",
          index_eligible: true,
        },
        provenance_meta: {
          compiler_version: "v2.1",
          compiled_at: "2026-04-08T10:05:00Z",
          compile_run_id: "run_789",
        },
        matched_jobs: [
          {
            occupation_uuid: "occ_123",
            canonical_slug: "data-scientist",
            title: "Data Scientist",
            summary: "Analyze data and models.",
            seo_contract: {
              canonical_path: "/career/jobs/data-scientist",
              canonical_target: "/career/jobs/data-scientist",
              index_state: "indexable",
              index_eligible: true,
              reason_codes: ["stable_publish_ready"],
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
      },
    });

    expect(detail).not.toBeNull();
    expect(detail?.displayType).toBe("INTJ-A");
    expect(detail?.canonicalTypeCode).toBe("INTJ");
    expect(detail?.publicRouteSlug).toBe("intj-a");
    expect(detail?.scoreBundle.fitScore.value).toBe(82);
    expect(detail?.warnings.amberFlags).toContain("ai_role_shift_risk");
    expect(detail?.claimPermissions.allow_transition_recommendation).toBe(true);
    expect(detail?.trustManifest?.logic_version).toBe("v1.2");
    expect(detail?.trustManifest?.publicReview).toEqual({
      reviewState: "approved",
      lastReviewedAt: "2026-07-18T12:00:00.000Z",
      reviewer: null,
    });
    expect(detail?.seoContract.canonicalPath).toBe("/career/recommendations/mbti/intj-a");
    expect(detail?.provenanceMeta.compileRunId).toBe("run_789");
    expect(detail?.careerDataStatus).toBe("available");
    expect(detail?.renderState.canRenderStrongTruth).toBe(true);
    expect(detail?.renderState.canIndexPage).toBe(true);
    expect(detail?.matchedJobs).toHaveLength(1);
    expect(detail?.matchedJobs[0]?.occupationUuid).toBe("occ_123");
    expect(detail?.matchedJobs[0]?.canonicalSlug).toBe("data-scientist");
    expect(detail?.matchedJobs[0]?.seoContract.indexEligible).toBe(true);
    expect(detail?.matchedJobs[0]?.seoContract.indexState).toBe("indexable");
    expect(detail?.matchedJobs[0]?.seoContract.reasonCodes).toEqual(["stable_publish_ready"]);
    expect(detail?.matchedJobs[0]?.trustSummary.reviewerStatus).toBe("approved");
    expect(buildCareerRecommendationFrontendUrl("en", "INTJ-A")).toBe("/en/career/recommendations/mbti/intj-a");
  });

  it("blocks recommendation render gates when trust quality is partial, stale, or blocked", () => {
    const basePayload = {
      identity: {
        mbti_type: "INTJ-A",
      },
      recommendation_subject_meta: {
        canonical_type: "INTJ",
      },
      score_bundle: {
        fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
        confidence_score: { value: 77, integrity_state: "full", degradation_factor: 1.0 },
      },
      supporting_truth_summary: {
        summary: "Approved strong recommendation summary",
      },
      claim_permissions: {
        allow_strong_claim: true,
        allow_salary_comparison: false,
        allow_ai_strategy: true,
        allow_transition_recommendation: true,
        allow_cross_market_pay_copy: false,
        reason_codes: [],
      },
      seo_contract: {
        canonical_path: "/career/recommendations/mbti/intj-a",
        index_state: "index",
        index_eligible: true,
      },
      matched_jobs: [
        {
          canonical_slug: "data-scientist",
          title: "Data Scientist",
        },
      ],
    };
    const adaptWithQuality = (quality: Record<string, unknown>) =>
      adaptCareerRecommendationBundle({
        locale: "en",
        requestedType: "intj-a",
        payload: {
          ...basePayload,
          trust_manifest: {
            reviewer_status: "reviewed",
            reviewed: true,
            quality,
          },
        },
      });

    for (const quality of [
      { reviewed: true, stale: false, blocked_reasons: [] },
      { complete: true, reviewed: true, stale: true, blocked_reasons: [] },
      { complete: true, reviewed: true, stale: false, blocked_reasons: ["quality_hold"] },
    ]) {
      const detail = adaptWithQuality(quality);

      expect(detail?.renderState.canRenderStrongTruth).toBe(false);
      expect(detail?.renderState.canRenderSummarySurface).toBe(false);
      expect(detail?.renderState.canRenderMatchedJobs).toBe(false);
      expect(detail?.renderState.canIndexPage).toBe(false);
    }

    const trustedDetail = adaptWithQuality({ complete: true, reviewed: true, stale: false, blocked_reasons: [] });

    expect(trustedDetail?.renderState.canRenderStrongTruth).toBe(true);
    expect(trustedDetail?.renderState.canRenderSummarySurface).toBe(true);
    expect(trustedDetail?.renderState.canRenderMatchedJobs).toBe(true);
    expect(trustedDetail?.renderState.canIndexPage).toBe(true);
  });

  it("adapts backend recommendation explainability into a machine-safe dto with allowlisted strain radar only", () => {
    const explainability = adaptCareerRecommendationExplainability({
      summary_kind: "career_explainability",
      summary_version: "career.explainability.v1",
      subject_kind: "recommendation",
      subject_identity: {
        public_route_slug: "intj-a",
        type: "INTJ-A",
        canonical_type_code: "INTJ",
        display_title: "INTJ-A Architect",
        occupation_uuid: "occ_123",
        canonical_slug: "data-scientist",
        canonical_title_en: "Data Scientist",
      },
      score_bundle: {
        strain_score: {
          value: 41,
          integrity_state: "provisional",
          critical_missing_fields: ["team_shape"],
          confidence_cap: 0.81,
          formula_version: "strain.v1",
          components: { ambiguity: 0.21, interruption: 0.2 },
          penalties: [{ code: "partial_data", value: -0.1, reason: "team_shape" }],
          degradation_factor: 0.84,
        },
      },
      strain_radar: {
        integrity_state: "provisional",
        confidence_cap: 0.81,
        degradation_factor: 0.84,
        formula_version: "career.strain_v1.2",
        axes: {
          people_friction: { value: 0.44 },
          context_switch_load: { value: 0.38 },
          political_load: { value: 0.29 },
          uncertainty_load: { value: 0.41 },
          low_autonomy_trap: { value: 0.27 },
          repetition_mismatch: { value: 0.19 },
          environment_mismatch: { value: 0.73 },
        },
      },
      warnings: {
        amber_flags: ["ai_role_shift_risk"],
      },
      claim_permissions: {
        allow_strong_claim: true,
        allow_salary_comparison: false,
        allow_ai_strategy: true,
        allow_transition_recommendation: true,
        allow_cross_market_pay_copy: false,
        reason_codes: ["candidate_only"],
      },
      integrity_summary: {
        integrity_state: "provisional",
        critical_missing_fields: ["team_shape"],
        confidence_cap: 0.81,
        degradation_factor: 0.84,
      },
    });

    expect(explainability).not.toBeNull();
    expect(explainability?.subjectKind).toBe("recommendation");
    expect(explainability?.subjectIdentity.publicRouteSlug).toBe("intj-a");
    expect(explainability?.scoreBundle.strainScore.components).toEqual({
      ambiguity: 0.21,
      interruption: 0.2,
    });
    expect(explainability?.strainRadar).toEqual({
      integrityState: "provisional",
      confidenceCap: 0.81,
      degradationFactor: 0.84,
      formulaVersion: "career.strain_v1.2",
      axes: {
        peopleFriction: { value: 0.44 },
        contextSwitchLoad: { value: 0.38 },
        politicalLoad: { value: 0.29 },
        uncertaintyLoad: { value: 0.41 },
        lowAutonomyTrap: { value: 0.27 },
        repetitionMismatch: { value: 0.19 },
      },
    });
    expect(explainability?.strainRadar?.axes).not.toHaveProperty("environmentMismatch");
  });

  it("adapts backend recommendation companion links into a narrow authority-backed inventory", () => {
    const summary = adaptCareerFirstWaveRecommendationCompanionLinks({
      payload: {
        summary_kind: "career_first_wave_recommendation_companion_links",
        summary_version: "career.companion.recommendation.first_wave.v1",
        scope: "career_first_wave_10",
        subject_kind: "recommendation_subject",
        subject_identity: {
          type_code: "INTJ-A",
          canonical_type_code: "INTJ",
          public_route_slug: "intj-a",
          display_title: "INTJ-A Architect",
        },
        counts: {
          total: 5,
          job_detail: 2,
          family_hub: 1,
          test_landing: 1,
          topic_detail: 1,
        },
        companion_links: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/data-scientist",
            canonical_slug: "data-scientist",
            link_reason_code: "target_job_detail_companion",
            occupation_uuid: "occ_123",
            canonical_title_en: "Data Scientist",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-and-research",
            canonical_slug: "data-and-research",
            link_reason_code: "target_family_hub_companion",
            family_uuid: "fam_123",
            title_en: "Data and Research",
          },
          {
            route_kind: "test_landing",
            canonical_path: "/tests/mbti-personality-test-16-personality-types",
            canonical_slug: "mbti-personality-test-16-personality-types",
            link_reason_code: "recommendation_test_support",
            scale_code: "MBTI",
          },
          {
            route_kind: "topic_detail",
            canonical_path: "/topics/mbti",
            canonical_slug: "mbti",
            link_reason_code: "recommendation_topic_support",
            topic_code: "mbti",
          },
        ],
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.subjectKind).toBe("recommendation_subject");
    expect(summary?.subjectIdentity.publicRouteSlug).toBe("intj-a");
    expect(summary?.jobDetailLinks).toHaveLength(1);
    expect(summary?.familyHubLinks).toHaveLength(1);
    expect(summary?.testLandingLinks).toHaveLength(1);
    expect(summary?.topicDetailLinks).toHaveLength(1);
    expect(summary?.testLandingLinks[0]?.canonicalSlug).toBe("mbti-personality-test-16-personality-types");
    expect(summary?.topicDetailLinks[0]?.canonicalSlug).toBe("mbti");
    expect(summary?.counts.testLanding).toBe(1);
    expect(summary?.counts.topicDetail).toBe(1);
  });

  it("career recommendation detail page reads the backend bundle path and blocks CMS fallback authority", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain("fetchCareerRecommendationBundle");
    expect(source).toContain("fetchCareerRecommendationExplainability");
    expect(source).toContain("fetchCareerFirstWaveRecommendationCompanionLinks");
    expect(source).toContain("fetchCareerTransitionPreview");
    expect(source).toContain("adaptCareerRecommendationBundle");
    expect(source).toContain("adaptCareerRecommendationExplainability");
    expect(source).toContain("adaptCareerFirstWaveRecommendationCompanionLinks");
    expect(source).toContain("adaptCareerTransitionPreview");
    expect(source).toContain("CareerExplainabilityPanel");
    expect(source).toContain("CareerRecommendationCompanionLinks");
    expect(source).toContain("CareerTransitionPreviewCard");
    expect(source).toContain("filterStableRecommendationMatchedJobs");
    expect(source).toContain("parseMbtiContinuityQuery");
    expect(source).toContain("mbti-career-continuity-entry");
    expect(source).toContain("const canonicalPath =");
    expect(source).toContain("permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug))");
    expect(source).toContain("normalizeCareerBundleCanonicalPath");
    expect(source).toContain("detail.seoContract.indexEligible");
    expect(source).toContain("renderCareerDataStatus(detail, locale)");
    expect(source).toContain("career-recommendation-matched-jobs-status");
    expect(source).toContain('testId="career-recommendation-scene-entry"');
    expect(source).toContain('data-testid="career-recommendation-type-interpretation"');
    expect(source).toContain('testId="career-recommendation-explainability-panel"');
    expect(source).toContain('testId="career-recommendation-companion-links"');
    expect(source).not.toContain("getMbtiCareerRecommendationByType");
    expect(source).not.toContain("getMbtiRecommendationContent");
    expect(source).not.toContain("strainRadar");
    expect(source).not.toContain("people_friction");
    expect(source).not.toContain("why_this_path");
    expect(source).not.toContain("what_is_lost");
    expect(source).not.toContain("bridge_steps_90d");
    expect(source).not.toContain("AnswerSurfaceSection");
    expect(source).not.toContain("career-recommendations.ts");
    expect(source).not.toContain("recommended next step");
    expect(source).not.toContain("best next move");
  });
});
