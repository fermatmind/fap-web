import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerTransitionPreview } from "@/lib/career/adapters/adaptCareerTransitionPreview";
import type { CareerTransitionPreviewResponseRaw } from "@/lib/career/api/types";
import { fetchCareerTransitionPreview } from "@/lib/career/api/fetchCareerTransitionPreview";

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
  vi.resetModules();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career transition preview fetch and adapter contract", () => {
  it("requests the backend transition preview endpoint with the recommendation type", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/transition-preview?");
        expect(url).toContain("type=intj-a");

        return jsonResponse({
          path_type: "stable_upside",
          target_job: {
            canonical_slug: "data-scientist",
            title: "Data Scientist",
          },
          score_summary: {
            mobility_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            confidence_score: { value: 73, integrity_state: "full", degradation_factor: 1.0 },
          },
          trust_summary: {
            allow_transition_recommendation: true,
            reviewer_status: "approved",
            review_state: "approved",
            last_reviewed_at: null,
            reviewer: null,
            reason_codes: ["publish_ready"],
          },
          seo_contract: {
            canonical_path: "/career/jobs/data-scientist",
            index_state: "index",
            index_eligible: true,
          },
        });
      })
    );

    const payload = await fetchCareerTransitionPreview({ locale: "en", type: "intj-a" });

    expect(payload).not.toBeNull();
  });

  it("adapts a minimal preview and keeps the model compact", () => {
    const preview = adaptCareerTransitionPreview({
      locale: "en",
      payload: {
        path_type: "stable_upside",
        steps: ["skill_overlap", "task_overlap", "tool_overlap"],
        delta: {
          entry_education_delta: {
            source_value: "Bachelor's degree",
            target_value: "Bachelor's degree",
            direction: "same",
          },
          work_experience_delta: {
            source_value: "None",
            target_value: "Less than 5 years",
            direction: "higher",
          },
          training_delta: {
            source_value: "Moderate-term",
            target_value: "Short-term",
            direction: "lower",
          },
          unsupported_delta: {
            source_value: "ignored",
            target_value: "ignored",
            direction: "higher",
          },
        },
        target_job: {
          occupation_uuid: "occ_123",
          canonical_slug: "data-scientist",
          title: "Data Scientist",
        },
        score_summary: {
          mobility_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 73, integrity_state: "full", degradation_factor: 1.0 },
        },
        trust_summary: {
          allow_transition_recommendation: true,
          reviewer_status: "approved",
          review_state: "approved",
          last_reviewed_at: null,
          reviewer: null,
          reason_codes: ["publish_ready"],
        },
        seo_contract: {
          canonical_path: "/career/jobs/data-scientist",
          canonical_target: "/career/jobs/data-scientist",
          index_state: "index",
          index_eligible: true,
        },
        provenance_meta: {
          compile_run_id: "run_123",
        },
      },
    });

    expect(preview).toEqual({
      pathType: "stable_upside",
      steps: ["skill_overlap", "task_overlap", "tool_overlap"],
      delta: {
        entryEducationDelta: {
          sourceValue: "Bachelor's degree",
          targetValue: "Bachelor's degree",
          direction: "same",
        },
        workExperienceDelta: {
          sourceValue: "None",
          targetValue: "Less than 5 years",
          direction: "higher",
        },
        trainingDelta: {
          sourceValue: "Moderate-term",
          targetValue: "Short-term",
          direction: "lower",
        },
      },
      targetJob: {
        occupationUuid: "occ_123",
        canonicalSlug: "data-scientist",
        title: "Data Scientist",
        href: "/en/career/jobs/data-scientist",
      },
      scoreSummary: {
        mobilityScore: expect.objectContaining({ value: 79, integrity_state: "full" }),
        confidenceScore: expect.objectContaining({ value: 73, integrity_state: "full" }),
      },
      trustSummary: {
        allowTransitionRecommendation: true,
        reviewerStatus: "approved",
        publicReview: { reviewState: "approved", lastReviewedAt: null, reviewer: null },
        reasonCodes: ["publish_ready"],
      },
      seoContract: expect.objectContaining({
        canonicalPath: "/career/jobs/data-scientist",
        indexState: "index",
        indexEligible: true,
      }),
    });
    expect(preview).not.toHaveProperty("why_this_path");
    expect(preview).not.toHaveProperty("what_is_lost");
    expect(preview).not.toHaveProperty("bridge_steps_90d");
    expect(preview).not.toHaveProperty("provenanceMeta");
    expect(preview).not.toHaveProperty("rationaleCodes");
    expect(preview).not.toHaveProperty("tradeoffCodes");
  });

  it("omits raw steps when the payload includes non-allowlisted values", () => {
    const preview = adaptCareerTransitionPreview({
      locale: "en",
      payload: {
        path_type: "stable_upside",
        steps: ["skill_overlap", "friendly_step_label"],
        target_job: {
          occupation_uuid: "occ_123",
          canonical_slug: "data-scientist",
          title: "Data Scientist",
        },
        score_summary: {
          mobility_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 73, integrity_state: "full", degradation_factor: 1.0 },
        },
        trust_summary: {
          allow_transition_recommendation: true,
          reviewer_status: "approved",
          reason_codes: ["publish_ready"],
        },
        seo_contract: {
          canonical_path: "/career/jobs/data-scientist",
          canonical_target: "/career/jobs/data-scientist",
          index_state: "index",
          index_eligible: true,
        },
      },
    });

    expect(preview).toEqual(
      expect.objectContaining({
        pathType: "stable_upside",
      })
    );
    expect(preview).not.toHaveProperty("steps");
  });

  it("omits delta entries that are missing, unrankable, or not allowlisted", () => {
    const preview = adaptCareerTransitionPreview({
      locale: "en",
      payload: {
        path_type: "stable_upside",
        delta: {
          entry_education_delta: {
            source_value: "Bachelor's degree",
            target_value: "Master's degree",
            direction: "higher",
          },
          work_experience_delta: {
            source_value: "None",
            target_value: "3 years",
            direction: "upward",
          },
          training_delta: {
            source_value: null,
            target_value: "Short-term",
            direction: "lower",
          },
          extra_delta: {
            source_value: "ignored",
            target_value: "ignored",
            direction: "same",
          },
        },
        target_job: {
          occupation_uuid: "occ_123",
          canonical_slug: "data-scientist",
          title: "Data Scientist",
        },
        score_summary: {
          mobility_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 73, integrity_state: "full", degradation_factor: 1.0 },
        },
        trust_summary: {
          allow_transition_recommendation: true,
          reviewer_status: "approved",
          reason_codes: ["publish_ready"],
        },
        seo_contract: {
          canonical_path: "/career/jobs/data-scientist",
          canonical_target: "/career/jobs/data-scientist",
          index_state: "index",
          index_eligible: true,
        },
        rationale_codes: ["same_family_target"],
        tradeoff_codes: ["higher_training_required"],
      } as unknown as CareerTransitionPreviewResponseRaw,
    });

    expect(preview).toEqual(
      expect.objectContaining({
        delta: {
          entryEducationDelta: {
            sourceValue: "Bachelor's degree",
            targetValue: "Master's degree",
            direction: "higher",
          },
        },
      })
    );
    expect(preview?.delta).not.toHaveProperty("workExperienceDelta");
    expect(preview?.delta).not.toHaveProperty("trainingDelta");
  });

  it("omits the whole delta block when no valid delta entries remain", () => {
    const preview = adaptCareerTransitionPreview({
      locale: "en",
      payload: {
        path_type: "stable_upside",
        delta: {
          entry_education_delta: {
            source_value: "Bachelor's degree",
            target_value: "Master's degree",
            direction: "upward",
          },
        },
        target_job: {
          occupation_uuid: "occ_123",
          canonical_slug: "data-scientist",
          title: "Data Scientist",
        },
        score_summary: {
          mobility_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 73, integrity_state: "full", degradation_factor: 1.0 },
        },
        trust_summary: {
          allow_transition_recommendation: true,
          reviewer_status: "approved",
          reason_codes: ["publish_ready"],
        },
        seo_contract: {
          canonical_path: "/career/jobs/data-scientist",
          canonical_target: "/career/jobs/data-scientist",
          index_state: "index",
          index_eligible: true,
        },
      },
    });

    expect(preview).toEqual(
      expect.objectContaining({
        pathType: "stable_upside",
      })
    );
    expect(preview).not.toHaveProperty("delta");
  });

  it("returns null for absent or non-renderable previews", () => {
    expect(
      adaptCareerTransitionPreview({
        locale: "en",
        payload: null,
      })
    ).toBeNull();

    expect(
      adaptCareerTransitionPreview({
        locale: "en",
        payload: {
          path_type: "stable_upside",
          target_job: {
            canonical_slug: "marketing-manager",
            title: "Marketing Manager",
          },
          score_summary: {},
          trust_summary: {
            allow_transition_recommendation: false,
            reviewer_status: "pending",
            reason_codes: ["trust_limited"],
          },
          seo_contract: {
            canonical_path: "/career/jobs/marketing-manager",
            index_state: "noindex",
            index_eligible: false,
          },
        },
      })
    ).toBeNull();
  });
});

describe("career transition preview recommendation detail wiring", () => {
  it("renders a compact preview on recommendation detail without replacing matched jobs", async () => {
    const pageViewEvents: Array<{ eventName: string; properties?: Record<string, unknown> }> = [];
    const trackedLinks: Array<{ eventName: string; eventPayload: Record<string, unknown>; href: string }> = [];

    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: ({
        eventName,
        properties,
      }: {
        eventName: string;
        properties?: Record<string, unknown>;
      }) => {
        pageViewEvents.push({ eventName, properties });
        return null;
      },
    }));
    vi.doMock("@/components/analytics/TrackedCareerLink", () => ({
      TrackedCareerLink: ({
        eventName,
        eventPayload,
        href,
        children,
        ...props
      }: {
        eventName: string;
        eventPayload: Record<string, unknown>;
        href: string;
        children: ReactNode;
      }) => {
        trackedLinks.push({ eventName, eventPayload, href });
        return (
          <a href={href} data-event-name={eventName} {...props}>
            {children}
          </a>
        );
      },
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
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => ({
        path_type: "stable_upside",
        steps: ["skill_overlap", "task_overlap", "tool_overlap"],
        delta: {
          entry_education_delta: {
            source_value: "Bachelor's degree",
            target_value: "Bachelor's degree",
            direction: "same",
          },
          work_experience_delta: {
            source_value: "None",
            target_value: "Less than 5 years",
            direction: "higher",
          },
          training_delta: {
            source_value: "Moderate-term",
            target_value: "Short-term",
            direction: "lower",
          },
          unsupported_delta: {
            source_value: "ignored",
            target_value: "ignored",
            direction: "higher",
          },
        },
        target_job: {
          occupation_uuid: "occ_next",
          canonical_slug: "product-manager",
          title: "Product Manager",
        },
        score_summary: {
          mobility_score: { value: 78, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 71, integrity_state: "full", degradation_factor: 1.0 },
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
      })),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-transition-preview");
    expect(html).toContain("career-transition-preview-header");
    expect(html).toContain("career-transition-preview-path-type");
    expect(html).toContain("Stable upside");
    expect(html).toContain("career-transition-preview-target");
    expect(html).toContain("Target role");
    expect(html).toContain("career-transition-preview-score-band");
    expect(html).toContain("career-transition-preview-score-mobility");
    expect(html).toContain("career-transition-preview-score-confidence");
    expect(html).toContain("Next-step role preview");
    expect(html).toContain("Product Manager");
    expect(html).toContain("/en/career/jobs/product-manager");
    expect(html).toContain("career-transition-preview-comparison");
    expect(html).toContain("Comparison snapshot");
    expect(html).toContain("career-transition-preview-ingredients");
    expect(html).toContain("Transition ingredients");
    expect(html).toContain("career-transition-preview-footer");
    expect(html).toContain("career-transition-preview-trust-strip");
    expect(html).toContain("reason_codes: publish_ready");
    expect(html).toContain("career-transition-preview-steps");
    expect(html).toContain("career-transition-preview-delta");
    expect(html).toContain("skill_overlap");
    expect(html).toContain("task_overlap");
    expect(html).toContain("tool_overlap");
    expect(html).toContain("Entry education");
    expect(html).toContain("Work experience");
    expect(html).toContain("Training");
    expect(html).toContain("Bachelor&#x27;s degree");
    expect(html).toContain("Less than 5 years");
    expect(html).toContain("Moderate-term");
    expect(html).toContain("Short-term");
    expect(html).toContain("same");
    expect(html).toContain("higher");
    expect(html).toContain("lower");
    expect(html).toContain("Matched role matrix");
    expect(html).toContain("Data Scientist");
    expect(html).not.toContain("why_this_path");
    expect(html).not.toContain("what_is_lost");
    expect(html).not.toContain("bridge_steps_90d");
    expect(html).not.toContain("rationale_codes");
    expect(html).not.toContain("tradeoff_codes");
    expect(html).not.toContain("suggested action");
    expect(html).not.toContain("90-day");
    expect(pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_transition_preview_view",
          properties: expect.objectContaining({
            entry_surface: "career_recommendation_detail_transition_preview",
            target_action: "view_transition_preview",
            subject_key: "product-manager",
          }),
        }),
      ])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_transition_preview_target_click",
          href: "/en/career/jobs/product-manager",
          eventPayload: expect.objectContaining({
            entrySurface: "career_recommendation_detail_transition_preview",
            targetAction: "open_transition_target_job",
            subjectKey: "product-manager",
          }),
        }),
      ])
    );
  });

  it("renders nothing when the backend preview is absent", async () => {
    const pageViewEvents: Array<{ eventName: string; properties?: Record<string, unknown> }> = [];
    const trackedLinks: Array<{ eventName: string; eventPayload: Record<string, unknown>; href: string }> = [];

    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: ({
        eventName,
        properties,
      }: {
        eventName: string;
        properties?: Record<string, unknown>;
      }) => {
        pageViewEvents.push({ eventName, properties });
        return null;
      },
    }));
    vi.doMock("@/components/analytics/TrackedCareerLink", () => ({
      TrackedCareerLink: ({
        eventName,
        eventPayload,
        href,
        children,
        ...props
      }: {
        eventName: string;
        eventPayload: Record<string, unknown>;
        href: string;
        children: ReactNode;
      }) => {
        trackedLinks.push({ eventName, eventPayload, href });
        return (
          <a href={href} data-event-name={eventName} {...props}>
            {children}
          </a>
        );
      },
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

    expect(html).not.toContain("career-transition-preview");
    expect(html).not.toContain("Next-step role preview");
    expect(html).not.toContain("career-transition-preview-steps");
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_transition_preview_view" })])
    );
    expect(trackedLinks).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_transition_preview_target_click" })])
    );
  });

  it("keeps transition preview renderable even when strong-claim surfaces stay gated", async () => {
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
          allow_strong_claim: false,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
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
        supporting_truth_summary: {
          summary: "Hidden summary copy",
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => ({
        path_type: "stable_upside",
        target_job: {
          occupation_uuid: "occ_next",
          canonical_slug: "product-manager",
          title: "Product Manager",
        },
        score_summary: {
          mobility_score: { value: 78, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 71, integrity_state: "full", degradation_factor: 1.0 },
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
      })),
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

    expect(html).toContain("career-transition-preview");
    expect(html).toContain("Product Manager");
    expect(html).not.toContain("career-recommendation-hero-summary");
    expect(html).not.toContain("career-recommendation-supporting-truth-summary");
    expect(html).not.toContain("career-recommendation-type-interpretation");
  });
});
