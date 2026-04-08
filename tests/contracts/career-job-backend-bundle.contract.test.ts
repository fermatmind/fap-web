import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";

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

describe("career job backend bundle contract", () => {
  it("requests the backend job bundle endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/jobs/software-developer?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          identity: {
            canonical_slug: "software-developer",
          },
        });
      })
    );

    const payload = await fetchCareerJobBundle({ locale: "zh", slug: "software-developer" });

    expect(payload).not.toBeNull();
  });

  it("adapts the backend job bundle into a frontend-safe dto without CMS fallback truth", () => {
    const detail = adaptCareerJobBundle({
      locale: "zh",
      requestedSlug: "software-developer",
      payload: {
        identity: {
          occupation_uuid: "occ_software_developer",
          canonical_slug: "software-developer",
        },
        titles: {
          canonical_en: "Software Developer",
          canonical_zh: "软件开发工程师",
        },
        truth_layer: {
          median_pay_usd_annual: 133080,
          outlook_pct_2024_2034: 16,
          ai_exposure: 6.2,
          source_refs: ["bls:15-1252"],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          content_version: "v1.2",
          data_version: "2026-04",
          logic_version: "logic.v1",
        },
        score_bundle: {
          fit_score: { value: 78, integrity_state: "full", degradation_factor: 1.0 },
          strain_score: { value: 62, integrity_state: "provisional", degradation_factor: 0.92 },
          confidence_score: { value: 81, integrity_state: "full", degradation_factor: 1.0 },
        },
        warnings: {
          amber_flags: ["cross_market_pay_uncertainty"],
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        seo_contract: {
          canonical_path: "/career/jobs/software-developer",
          index_state: "index",
          index_eligible: true,
        },
        provenance_meta: {
          compiler_version: "v2.1",
          compiled_at: "2026-04-08T10:00:00Z",
          trust_manifest_id: "tm_123",
          truth_metric_id: "truth_456",
        },
      },
    });

    expect(detail).not.toBeNull();
    expect(detail?.slug).toBe("software-developer");
    expect(detail?.title).toBe("软件开发工程师");
    expect(detail?.truthLayer.medianPayUsdAnnual).toBe(133080);
    expect(detail?.scoreBundle.fitScore.value).toBe(78);
    expect(detail?.warnings.amberFlags).toContain("cross_market_pay_uncertainty");
    expect(detail?.claimPermissions.allow_salary_comparison).toBe(false);
    expect(detail?.seoContract.canonicalPath).toBe("/career/jobs/software-developer");
    expect(detail?.provenanceMeta.compilerVersion).toBe("v2.1");
    expect(detail?.renderState.careerDataStatus).toBe("available");
    expect(detail?.renderState.canRenderSalarySurface).toBe(false);
    expect(detail?.authoritySource).toBe("career_backend_bundle.v0.5");
  });
});
