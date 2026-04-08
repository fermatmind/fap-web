import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerRecommendationBundle } from "@/lib/career/adapters/adaptCareerRecommendationBundle";
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

  it("returns null on detail API failure instead of synthesizing recommendation truth", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "upstream failure" }, 500))
    );

    const detail = await fetchCareerRecommendationBundle({ locale: "zh", type: "intj-a" });

    expect(detail).toBeNull();
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
    expect(detail?.seoContract.canonicalPath).toBe("/career/recommendations/mbti/intj-a");
    expect(detail?.provenanceMeta.compileRunId).toBe("run_789");
    expect(detail?.careerDataStatus).toBe("available");
    expect(detail?.renderState.canRenderStrongTruth).toBe(true);
    expect(detail?.renderState.canIndexPage).toBe(true);
    expect(buildCareerRecommendationFrontendUrl("en", "INTJ-A")).toBe("/en/career/recommendations/mbti/intj-a");
  });

  it("career recommendation detail page reads the backend bundle path and blocks CMS fallback authority", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain("fetchCareerRecommendationBundle");
    expect(source).toContain("adaptCareerRecommendationBundle");
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
    expect(source).not.toContain("getMbtiCareerRecommendationByType");
    expect(source).not.toContain("getMbtiRecommendationContent");
    expect(source).not.toContain("AnswerSurfaceSection");
    expect(source).not.toContain("career-recommendations.ts");
  });
});
