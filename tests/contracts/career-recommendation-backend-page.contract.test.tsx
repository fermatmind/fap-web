import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career recommendation backend page contract", () => {
  it("renders from the backend adapter path while preserving continuity and entry CTA wiring", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/recommendations/mbti/intj-a"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        score_bundle: {
          fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 75, integrity_state: "full", degradation_factor: 1.0 },
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
        provenance_meta: {
          compiler_version: "v2.1",
          compiled_at: "2026-04-08T10:05:00Z",
          compile_run_id: "run_789",
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => ({
        summary_kind: "career_explainability",
        summary_version: "career.explainability.v1",
        subject_kind: "recommendation",
        subject_identity: {
          public_route_slug: "intj-a",
          type: "INTJ-A",
          canonical_type_code: "INTJ",
          display_title: "INTJ-A Architect",
          canonical_slug: "data-scientist",
          canonical_title_en: "Data Scientist",
        },
        score_bundle: {
          fit_score: {
            value: 82,
            integrity_state: "full",
            critical_missing_fields: [],
            confidence_cap: 0.95,
            formula_version: "fit.v1",
            components: { demand: 0.4 },
            penalties: [],
            degradation_factor: 1,
          },
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        warnings: {
          amber_flags: ["ai_role_shift_risk"],
        },
        integrity_summary: {
          integrity_state: "full",
          critical_missing_fields: [],
          confidence_cap: 0.95,
          degradation_factor: 1,
        },
        strain_radar: {
          integrity_state: "full",
          confidence_cap: 0.91,
          degradation_factor: 0.84,
          formula_version: "career.strain_v1.2",
          axes: {
            people_friction: { value: 0.64 },
            context_switch_load: { value: 0.59 },
            political_load: { value: 0.41 },
            uncertainty_load: { value: 0.72 },
            low_autonomy_trap: { value: 0.53 },
            repetition_mismatch: { value: 0.37 },
          },
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => ({
        path_type: "stable_upside",
        steps: ["skill_overlap", "task_overlap"],
        delta: {
          entry_education_delta: {
            source_value: "Bachelor's degree",
            target_value: "Bachelor's degree",
            direction: "same",
          },
          training_delta: {
            source_value: "Moderate-term",
            target_value: "Short-term",
            direction: "lower",
          },
        },
        target_job: {
          occupation_uuid: "occ_transition",
          canonical_slug: "product-manager",
          title: "Product Manager",
        },
        score_summary: {
          mobility_score: { value: 74, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 68, integrity_state: "full", degradation_factor: 1.0 },
        },
        trust_summary: {
          allow_transition_recommendation: true,
          reviewer_status: "approved",
          reason_codes: ["publish_ready"],
        },
        seo_contract: {
          canonical_path: "/career/jobs/product-manager",
          canonical_target: "/career/jobs/product-manager",
          index_state: "index",
          index_eligible: true,
        },
        rationale_codes: ["same_family_target"],
        tradeoff_codes: ["higher_training_required"],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks", () => ({
      fetchCareerFirstWaveRecommendationCompanionLinks: vi.fn(async () => ({
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
          total: 4,
          job_detail: 1,
          family_hub: 1,
          test_landing: 1,
          topic_detail: 1,
        },
        companion_links: [
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-and-research",
            canonical_slug: "data-and-research",
            link_reason_code: "target_family_hub_companion",
            family_uuid: "fam_123",
            title_en: "Data and Research",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/data-scientist",
            canonical_slug: "data-scientist",
            link_reason_code: "target_job_detail_companion",
            occupation_uuid: "occ_123",
            canonical_title_en: "Data Scientist",
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
      })),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({
        carryover_focus_key: "career.next_step",
        carryover_reason: "from_result",
      }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("mbti-career-continuity-entry");
    expect(html).toContain("mbti-career-primary-cta");
    expect(html).toContain("career-recommendation-trust-strip");
    expect(html).toContain("career-recommendation-type-interpretation");
    expect(html).toContain("career-recommendation-explainability-panel");
    expect(html).toContain("career-explainability-strain-radar");
    expect(html).toContain("career-transition-preview");
    expect(html).toContain("career-transition-preview-header");
    expect(html).toContain("career-transition-preview-score-band");
    expect(html).toContain("career-transition-preview-ingredients");
    expect(html).toContain("career-transition-preview-comparison");
    expect(html).toContain("career-transition-preview-footer");
    expect(html).toContain("career-transition-preview-delta");
    expect(html).toContain("career-recommendation-renderer-status");
    expect(html).toContain("data-renderer-state=\"restricted\"");
    expect(html).toContain("Product Manager");
    expect(html).toContain("Bachelor&#x27;s degree");
    expect(html).toContain("Moderate-term");
    expect(html).toContain("Short-term");
    expect(html).toContain("same");
    expect(html).toContain("lower");
    expect(html).toContain("career-recommendation-warning-banner");
    expect(html).toContain("career-recommendation-matched-jobs-status");
    expect(html).toContain("career-recommendation-companion-links");
    expect(html).toContain("Companion links");
    expect(html).toContain("Data and Research");
    expect(html).toContain("Data Scientist");
    expect(html).toContain("Related test");
    expect(html).toContain("Related topic");
    expect(html).toContain("MBTI personality test");
    expect(html).toContain("MBTI topic");
    expect(html).toContain("INTJ-A");
    expect(html).toContain("People friction");
    expect(html).not.toContain("Matched role matrix");
    expect(html).not.toContain("environment_fit");
    expect(html).not.toContain("rationale_codes");
    expect(html).not.toContain("tradeoff_codes");
    expect(html).not.toContain("why this path");
    expect(html).not.toContain("what_is_lost");
    expect(html).not.toContain("bridge_steps_90d");
    expect(html).not.toContain("target_family_hub_companion");
    expect(html).not.toContain("target_job_detail_companion");
    expect(html).not.toContain("recommendation_test_support");
    expect(html).not.toContain("recommendation_topic_support");
    expect(html).not.toContain("take this test now");
    expect(html).not.toContain("continue reading");
    expect(html).not.toContain("/articles/");
    expect(html).not.toContain("/guides/");
    expect(html).not.toContain("/topics/mbti/take");
    expect(html).not.toContain("/tests-index");
    expect(html).not.toContain("strongest");

    const explainabilityIndex = html.indexOf("career-recommendation-explainability-panel");
    const transitionPreviewIndex = html.indexOf("career-transition-preview");
    const matchedJobsIndex = html.indexOf("career-recommendation-matched-jobs-status");
    const companionLinksIndex = html.indexOf("career-recommendation-companion-links");
    const rendererStatusIndex = html.indexOf("career-recommendation-renderer-status");
    const warningIndex = html.indexOf("career-recommendation-warning-banner");
    const trustIndex = html.indexOf("career-recommendation-trust-strip");
    const sceneEntryIndex = html.indexOf("career-recommendation-scene-entry");

    expect(explainabilityIndex).toBeGreaterThan(-1);
    expect(transitionPreviewIndex).toBeGreaterThan(explainabilityIndex);
    expect(rendererStatusIndex).toBeGreaterThan(transitionPreviewIndex);
    expect(warningIndex).toBeGreaterThan(rendererStatusIndex);
    expect(trustIndex).toBeGreaterThan(warningIndex);
    expect(sceneEntryIndex).toBeGreaterThan(trustIndex);
    expect(matchedJobsIndex).toBeGreaterThan(sceneEntryIndex);
    expect(companionLinksIndex).toBeGreaterThan(matchedJobsIndex);
  });

  it("redirects to the canonical public route when backend bundle slug differs from the request", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/recommendations/mbti/intj"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
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
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => null),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );

    await expect(
      CareerRecommendationPage({
        params: Promise.resolve({ locale: "en", type: "intj" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("redirect:/en/career/recommendations/mbti/intj-a");
  });

  it("suppresses recommendation summary surfaces when strong claims are not explicitly allowed", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/recommendations/mbti/intj-a"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        score_bundle: {
          fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 75, integrity_state: "full", degradation_factor: 1.0 },
        },
        supporting_truth_summary: {
          summary: "Strong-fit summary copy",
          median_pay_usd_annual: 155000,
          outlook_pct_2024_2034: 11,
          ai_exposure: 6.8,
        },
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: ["trust_limited"],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: {
            complete: true,
            reviewed: true,
            stale: false,
            blocked_reasons: [],
          },
          content_version: "content.v1",
          data_version: "data.v1",
          logic_version: "logic.v1",
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          index_state: "blocked",
          index_eligible: false,
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks", () => ({
      fetchCareerFirstWaveRecommendationCompanionLinks: vi.fn(async () => null),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-recommendation-trust-strip");
    expect(html).toContain("career-recommendation-protocol-status");
    expect(html).not.toContain("career-recommendation-hero-summary");
    expect(html).not.toContain("career-recommendation-supporting-truth-summary");
    expect(html).not.toContain("career-recommendation-type-interpretation");
  });

  it("renders only stable matched jobs from authority readiness signals", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/recommendations/mbti/intj-a"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        score_bundle: {
          fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 75, integrity_state: "full", degradation_factor: 1.0 },
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
              canonical_target: "/career/jobs/data-scientist",
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
              canonical_target: "/career/jobs/marketing-manager",
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
              canonical_target: "/career/jobs/financial-analyst",
              index_state: "blocked",
              index_eligible: false,
              reason_codes: ["missing_crosswalk_source_code"],
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => null),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("Matched role matrix");
    expect(html).toContain("Data Scientist");
    expect(html).not.toContain("Marketing Manager");
    expect(html).not.toContain("Financial Analyst");
    expect(html).toContain("/en/career/jobs/data-scientist");
    expect(html).not.toContain("/en/career/jobs/marketing-manager");
    expect(html).not.toContain("/en/career/jobs/financial-analyst");
  });
});
