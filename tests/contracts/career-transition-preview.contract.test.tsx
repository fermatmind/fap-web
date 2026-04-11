import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerTransitionPreview } from "@/lib/career/adapters/adaptCareerTransitionPreview";
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
        provenance_meta: {
          compile_run_id: "run_123",
        },
      },
    });

    expect(preview).toEqual({
      pathType: "stable_upside",
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
    expect(html).toContain("Next-step role preview");
    expect(html).toContain("Product Manager");
    expect(html).toContain("/en/career/jobs/product-manager");
    expect(html).toContain("Matched role matrix");
    expect(html).toContain("Data Scientist");
    expect(html).not.toContain("why_this_path");
    expect(html).not.toContain("what_is_lost");
    expect(html).not.toContain("bridge_steps_90d");
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
  });
});
