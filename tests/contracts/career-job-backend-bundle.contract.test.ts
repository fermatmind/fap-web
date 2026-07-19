import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerFirstWaveNextStepLinks } from "@/lib/career/adapters/adaptCareerFirstWaveNextStepLinks";
import { adaptCareerJobExplainability } from "@/lib/career/adapters/adaptCareerExplainability";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { fetchCareerFirstWaveNextStepLinks } from "@/lib/career/api/fetchCareerFirstWaveNextStepLinks";
import { fetchCareerJobExplainability } from "@/lib/career/api/fetchCareerJobExplainability";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { readFileSync } from "node:fs";
import path from "node:path";

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
  it("requests the backend explainability endpoint for job detail only", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/jobs/software-developer/explainability?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_explainability",
          summary_version: "career.explainability.v1",
          subject_kind: "job",
        });
      })
    );

    const payload = await fetchCareerJobExplainability({ locale: "zh", slug: "software-developer" });

    expect(payload).not.toBeNull();
  });

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

  it("requests the backend next-step links endpoint for job detail only", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/jobs/software-developer/next-step-links?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_first_wave_next_step_links",
          summary_version: "career.next_step.first_wave.v1",
          scope: "career_first_wave_10",
          subject_kind: "occupation",
          next_step_links: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveNextStepLinks({ locale: "zh", slug: "software-developer" });

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
          public_review: {
            review_state: "approved",
            last_reviewed_at: "2026-07-18T12:00:00.000000Z",
            reviewer: null,
          },
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
        structured_data: {
          occupation: {
            "@context": "https://schema.org",
            "@type": "Occupation",
            name: "Software Developer",
            url: "https://backend.example.test/career/jobs/software-developer",
            mainEntityOfPage: "https://backend.example.test/career/jobs/software-developer",
            educationRequirements: "Bachelor's degree",
            experienceRequirements: "1 year",
            description: "should_not_leak",
          },
          breadcrumb_list: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Career",
                item: "https://backend.example.test/career",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Software Developer",
                item: "https://backend.example.test/career/jobs/software-developer",
              },
            ],
          },
          dataset: {
            "@type": "Dataset",
          },
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
    expect(detail?.trustManifest?.publicReview).toEqual({
      reviewState: "approved",
      lastReviewedAt: "2026-07-18T12:00:00.000Z",
      reviewer: null,
    });
    expect(detail?.structuredData.occupation).toEqual({
      "@context": "https://schema.org",
      "@type": "Occupation",
      name: "Software Developer",
      url: "http://localhost:3000/zh/career/jobs/software-developer",
      mainEntityOfPage: "http://localhost:3000/zh/career/jobs/software-developer",
      educationRequirements: "Bachelor's degree",
      experienceRequirements: "1 year",
    });
    expect(detail?.structuredData.breadcrumbList).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Career",
          item: "http://localhost:3000/zh/career",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Software Developer",
          item: "http://localhost:3000/zh/career/jobs/software-developer",
        },
      ],
    });
    expect((detail?.structuredData as Record<string, unknown> | undefined)?.dataset).toBeUndefined();
    expect((detail?.structuredData as Record<string, unknown> | undefined)?.article).toBeUndefined();
    expect(detail?.renderState.careerDataStatus).toBe("available");
    expect(detail?.renderState.canRenderSalarySurface).toBe(false);
    expect(detail?.authoritySource).toBe("career_backend_bundle.v0.5");
  });

  it("blocks job render gates when trust quality is partial, stale, or blocked", () => {
    const basePayload = {
      identity: {
        occupation_uuid: "occ_software_developer",
        canonical_slug: "software-developer",
      },
      titles: {
        canonical_en: "Software Developer",
      },
      truth_layer: {
        median_pay_usd_annual: 133080,
        outlook_pct_2024_2034: 16,
      },
      score_bundle: {
        fit_score: { value: 78, integrity_state: "full", degradation_factor: 1.0 },
      },
      claim_permissions: {
        allow_strong_claim: true,
        allow_salary_comparison: true,
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
    };
    const adaptWithQuality = (quality: Record<string, unknown>) =>
      adaptCareerJobBundle({
        locale: "en",
        requestedSlug: "software-developer",
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

      expect(detail?.renderState.canRenderSalarySurface).toBe(false);
      expect(detail?.renderState.canRenderOutlookSurface).toBe(false);
      expect(detail?.renderState.canRenderFitSurface).toBe(false);
      expect(detail?.renderState.canRenderStructuredData).toBe(false);
      expect(detail?.renderState.canIndexPage).toBe(false);
    }

    const trustedDetail = adaptWithQuality({ complete: true, reviewed: true, stale: false, blocked_reasons: [] });

    expect(trustedDetail?.renderState.canRenderSalarySurface).toBe(true);
    expect(trustedDetail?.renderState.canRenderOutlookSurface).toBe(true);
    expect(trustedDetail?.renderState.canRenderFitSurface).toBe(true);
    expect(trustedDetail?.renderState.canRenderStructuredData).toBe(true);
    expect(trustedDetail?.renderState.canIndexPage).toBe(true);
  });

  it("adapts backend explainability into a machine-safe frontend dto with allowlisted strain radar only", () => {
    const explainability = adaptCareerJobExplainability({
      summary_kind: "career_explainability",
      summary_version: "career.explainability.v1",
      subject_kind: "job",
      subject_identity: {
        occupation_uuid: "occ_software_developer",
        canonical_slug: "software-developer",
        canonical_title_en: "Software Developer",
      },
      score_bundle: {
        fit_score: {
          value: 78,
          integrity_state: "full",
          critical_missing_fields: ["onet_context"],
          confidence_cap: 0.92,
          formula_version: "fit.v1",
          components: { demand: 0.4, capability: 0.38 },
          penalties: [{ code: "trust_limited", value: -0.08, reason: "partial_data" }],
          degradation_factor: 0.9,
        },
      },
      strain_radar: {
        integrity_state: "restricted",
        confidence_cap: 0.72,
        degradation_factor: 0.84,
        formula_version: "career.strain_v1.2",
        axes: {
          people_friction: { value: 0.61 },
          context_switch_load: { value: 0.52 },
          political_load: { value: 0.47 },
          uncertainty_load: { value: 0.58 },
          low_autonomy_trap: { value: 0.41 },
          repetition_mismatch: { value: 0.33 },
          environment_fit: { value: 0.11 },
        },
      },
      warnings: {
        amber_flags: ["ai_role_shift_risk"],
      },
      claim_permissions: {
        allow_strong_claim: true,
        allow_salary_comparison: false,
        allow_ai_strategy: true,
        allow_transition_recommendation: false,
        allow_cross_market_pay_copy: false,
        reason_codes: ["trust_limited"],
      },
      integrity_summary: {
        integrity_state: "provisional",
        critical_missing_fields: ["onet_context"],
        confidence_cap: 0.92,
        degradation_factor: 0.9,
      },
    });

    expect(explainability).not.toBeNull();
    expect(explainability?.subjectKind).toBe("job");
    expect(explainability?.scoreBundle.fitScore.formulaVersion).toBe("fit.v1");
    expect(explainability?.scoreBundle.fitScore.components).toEqual({
      demand: 0.4,
      capability: 0.38,
    });
    expect(explainability?.scoreBundle.fitScore.penalties[0]).toEqual({
      code: "trust_limited",
      value: -0.08,
      reason: "partial_data",
    });
    expect(explainability?.strainRadar).toEqual({
      integrityState: "restricted",
      confidenceCap: 0.72,
      degradationFactor: 0.84,
      formulaVersion: "career.strain_v1.2",
      axes: {
        peopleFriction: { value: 0.61 },
        contextSwitchLoad: { value: 0.52 },
        politicalLoad: { value: 0.47 },
        uncertaintyLoad: { value: 0.58 },
        lowAutonomyTrap: { value: 0.41 },
        repetitionMismatch: { value: 0.33 },
      },
    });
    expect(explainability?.strainRadar?.axes).not.toHaveProperty("environmentFit");
  });

  it("adapts backend next-step links into a narrow frontend dto without synthesizing unsupported routes", () => {
    const nextStepLinks = adaptCareerFirstWaveNextStepLinks({
      payload: {
        summary_kind: "career_first_wave_next_step_links",
        summary_version: "career.next_step.first_wave.v1",
        scope: "career_first_wave_10",
        subject_kind: "occupation",
        subject_identity: {
          occupation_uuid: "occ_software_developer",
          canonical_slug: "software-developer",
          canonical_title_en: "Software Developer",
        },
        counts: {
          total: 2,
          job_detail: 1,
          family_hub: 1,
        },
        next_step_links: [
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/software-engineering",
            canonical_slug: "software-engineering",
            link_reason_code: "family_hub_discoverable",
            family_uuid: "fam_software_engineering",
            title_en: "Software Engineering",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            canonical_slug: "backend-architect",
            link_reason_code: "same_family_sibling_discoverable",
            occupation_uuid: "occ_backend_architect",
            canonical_title_en: "Backend Architect",
          },
          {
            route_kind: "career_recommendation_detail",
            canonical_path: "/career/recommendations/mbti/intj",
            canonical_slug: "intj",
            link_reason_code: "unsupported",
          },
        ],
      },
    });

    expect(nextStepLinks).not.toBeNull();
    expect(nextStepLinks?.nextStepLinks).toHaveLength(2);
    expect(nextStepLinks?.familyHubLinks[0]).toEqual({
      routeKind: "career_family_hub",
      canonicalPath: "/career/family/software-engineering",
      canonicalSlug: "software-engineering",
      linkReasonCode: "family_hub_discoverable",
      familyUuid: "fam_software_engineering",
      titleEn: "Software Engineering",
    });
    expect(nextStepLinks?.jobDetailLinks[0]).toEqual({
      routeKind: "career_job_detail",
      canonicalPath: "/career/jobs/backend-architect",
      canonicalSlug: "backend-architect",
      linkReasonCode: "same_family_sibling_discoverable",
      occupationUuid: "occ_backend_architect",
      canonicalTitleEn: "Backend Architect",
    });
  });

  it("career job detail page wires explainability through the dedicated fetch and panel only", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/career/jobs/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).toContain("fetchCareerJobExplainability");
    expect(source).toContain("adaptCareerJobExplainability");
    expect(source).toContain("fetchCareerFirstWaveNextStepLinks");
    expect(source).toContain("adaptCareerFirstWaveNextStepLinks");
    expect(source).toContain("CareerExplainabilityPanel");
    expect(source).toContain("CareerNextStepLinks");
    expect(source).toContain('testId="career-job-explainability-panel"');
    expect(source).toContain('testId="career-job-next-step-links"');
    expect(source).not.toContain("strainRadar");
    expect(source).not.toContain("people_friction");
    expect(source).not.toContain("why_this_path");
    expect(source).not.toContain("bridge_steps_90d");
    expect(source).not.toContain("CareerTransitionPreviewCard");
  });

  it("career job detail redirects english requests when only zh-CN DOCX fallback content is available", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/career/jobs/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).toContain("function shouldRedirectEnglishJobDetailToChinese");
    expect(source).toContain('locale !== "en"');
    expect(source).toContain('trustLocale === "zh-CN"');
    expect(source).toContain('displayMarket === "zh-CN"');
    expect(source).toContain('crosswalkMode === "docx_baseline"');
    expect(source).toContain("containsCjkText(job.contentBodyMd)");
    expect(source).toContain('permanentRedirect(buildCareerJobFrontendUrl("zh", job.slug))');
  });

  it("career job detail breadcrumb stays above both DOCX and protocol renderer branches", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/career/jobs/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).toContain("<Breadcrumb");
    expect(source).toContain('localizedPath("/career/jobs", locale)');
    expect(source.indexOf("<Breadcrumb")).toBeLessThan(source.indexOf("{visibleContentBodyMd ?"));
  });

  it("keeps DOCX job detail header and fallback cells user-facing", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/career/jobs/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).not.toContain("职业详情页正式文案版");
    expect(source).not.toContain("/career/jobs/{job.slug}");
    expect(source).toContain("formatCareerJobDocumentText");
    expect(source).toContain("formatCareerJobDocumentCell");
    expect(source).toContain('return "暂无"');
    expect(source).toContain("暂无额外工作经验要求");
    expect(source).toContain("参考美国标准");
  });
});
