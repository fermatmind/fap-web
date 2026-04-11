import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

function installCareerTrackingMocks() {
  const pageViewEvents: Array<{ eventName: string; properties: Record<string, unknown> | undefined }> = [];
  const trackedLinks: Array<{
    eventName: string;
    eventPayload: Record<string, unknown>;
    href: string;
    testId?: string;
  }> = [];

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
      "data-testid"?: string;
    }) => {
      trackedLinks.push({
        eventName,
        eventPayload,
        href,
        testId: props["data-testid"],
      });

      return (
        <a href={href} data-event-name={eventName} {...props}>
          {children}
        </a>
      );
    },
  }));

  return { pageViewEvents, trackedLinks };
}

describe("career attribution payload builder contract", () => {
  it("re-emits search-mode page views when the tracking key changes on the same pathname", async () => {
    vi.doMock("next/navigation", () => ({
      usePathname: vi.fn(() => "/en/career/jobs"),
    }));

    const trackEvent = vi.fn();
    vi.doMock("@/lib/analytics", () => ({
      trackEvent,
    }));

    const { AnalyticsPageViewTracker } = await import("@/hooks/useAnalytics");
    const { rerender } = render(
      <AnalyticsPageViewTracker
        eventName="career_job_search_submit"
        trackingKey="query:backend"
        properties={{ query_mode: "query" }}
      />
    );

    expect(trackEvent).toHaveBeenCalledTimes(1);

    rerender(
      <AnalyticsPageViewTracker
        eventName="career_job_search_submit"
        trackingKey="query:data"
        properties={{ query_mode: "query" }}
      />
    );

    expect(trackEvent).toHaveBeenCalledTimes(2);
  });

  it("builds safe normalized payloads without raw query text", async () => {
    const { buildCareerAttributionPayload } = await import("@/lib/career/attribution");

    expect(
      buildCareerAttributionPayload({
        locale: "en",
        entrySurface: "career_job_search_results",
        sourcePageType: "career_job_search",
        targetAction: "open_job_detail",
        landingPath: "/en/career/jobs",
        routeFamily: "jobs_search",
        subjectKind: "job_slug",
        subjectKey: "data-scientists",
        queryMode: "query",
      })
    ).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "data-scientists",
      query_mode: "query",
    });
  });

  it("tracks career click events through the shared transport helper", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        onClick,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        onClick?: React.MouseEventHandler<HTMLAnchorElement>;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} onClick={onClick} {...props}>
            {children}
          </a>
        );
      },
    }));

    const trackEvent = vi.fn();
    vi.doMock("@/lib/analytics", () => ({
      trackEvent,
    }));

    const { TrackedCareerLink } = await import("@/components/analytics/TrackedCareerLink");

    render(
      <TrackedCareerLink
        href="/en/career/jobs/data-scientists"
        eventName="career_job_search_result_click"
        onClick={(event) => {
          event.preventDefault();
        }}
        eventPayload={{
          locale: "en",
          entrySurface: "career_job_search_results",
          sourcePageType: "career_job_search",
          targetAction: "open_job_detail",
          landingPath: "/en/career/jobs",
          routeFamily: "jobs_search",
          subjectKind: "job_slug",
          subjectKey: "data-scientists",
          queryMode: "query",
        }}
      >
        Open
      </TrackedCareerLink>
    );

    fireEvent.click(screen.getByText("Open"));

    expect(trackEvent).toHaveBeenCalledWith("career_job_search_result_click", {
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "data-scientists",
      query_mode: "query",
    });
  });
});

describe("career attribution page wiring contract", () => {
  it("wires landing view, ready exposure, and landing job clicks without touching recommendation preview semantics", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }));

    const { pageViewEvents, trackedLinks } = installCareerTrackingMocks();

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
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [
          {
            identity: { canonical_slug: "data-scientists" },
            titles: { canonical_en: "Data Scientists" },
            truth_summary: {
              outlook_description: "High-trust systems work.",
              median_pay_usd_annual: 182000,
              outlook_pct_2024_2034: 14,
            },
            trust_summary: { reviewer_status: "approved" },
            score_summary: {
              fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            },
            seo_contract: {
              canonical_path: "/career/jobs/data-scientists",
              index_state: "index",
              index_eligible: true,
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveReadinessSummary", () => ({
      fetchCareerFirstWaveReadinessSummary: vi.fn(async () => ({
        summary_kind: "career_first_wave_readiness",
        summary_version: "career.release.first_wave_readiness.v1",
        wave_name: "career_first_wave_10",
        counts: {
          total: 10,
          publish_ready: 6,
          blocked_override_eligible: 2,
          blocked_not_safely_remediable: 2,
          blocked_total: 4,
          partial_raw: 0,
        },
        occupations: [
          {
            canonical_slug: "data-scientists",
            status: "publish_ready",
            reason_codes: ["publish_ready"],
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({
        bundle_kind: "career_recommendation_index",
        items: [],
      })),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
    }));

    const { default: CareerCenterPage } = await import("@/app/(localized)/[locale]/career/page");
    const page = await CareerCenterPage({
      params: Promise.resolve({ locale: "en" }),
    });

    renderToStaticMarkup(page as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventName: "career_landing_view" }),
        expect.objectContaining({
          eventName: "career_ready_surface_exposed",
          properties: expect.objectContaining({
            subject_key: "data-scientists",
            route_family: "landing",
          }),
        }),
      ])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_job_index_result_click",
          eventPayload: expect.objectContaining({
            subjectKey: "data-scientists",
            routeFamily: "landing",
          }),
        }),
      ])
    );
  });

  it("keeps jobs index and search wiring distinct without sending raw query text", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }));

    const { pageViewEvents, trackedLinks } = installCareerTrackingMocks();

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
    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => ({
        bundle_kind: "career_search_results",
        data: [
          {
            match_kind: "canonical_title_prefix",
            matched_text: "Backend Architect",
            identity: {
              occupation_uuid: "occ_data_scientists",
              canonical_slug: "data-scientists",
            },
            titles: {
              canonical_en: "Data Scientists",
            },
            seo_contract: {
              canonical_path: "/career/jobs/data-scientists",
              index_state: "indexed",
              index_eligible: true,
            },
            trust_summary: {
              status: "available",
              reviewer_status: "reviewed",
            },
            provenance_meta: {
              compiler_version: "career_search_v1",
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveReadinessSummary", () => ({
      fetchCareerFirstWaveReadinessSummary: vi.fn(async () => ({
        summary_kind: "career_first_wave_readiness",
        summary_version: "career.release.first_wave_readiness.v1",
        wave_name: "career_first_wave_10",
        counts: {
          total: 10,
          publish_ready: 6,
          blocked_override_eligible: 2,
          blocked_not_safely_remediable: 2,
          blocked_total: 4,
          partial_raw: 0,
        },
        occupations: [
          {
            canonical_slug: "data-scientists",
            status: "publish_ready",
            reason_codes: ["publish_ready"],
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [],
      })),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "backend architect" }),
    });

    renderToStaticMarkup(page as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_job_search_submit",
          properties: expect.objectContaining({
            route_family: "jobs_search",
            query_mode: "query",
          }),
        }),
        expect.objectContaining({
          eventName: "career_ready_surface_exposed",
          properties: expect.objectContaining({
            subject_key: "data-scientists",
            query_mode: "query",
          }),
        }),
      ])
    );
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_job_index_view" })])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_job_search_result_click",
          eventPayload: expect.objectContaining({
            subjectKey: "data-scientists",
            queryMode: "query",
          }),
        }),
      ])
    );
    expect(JSON.stringify(pageViewEvents)).not.toContain("backend architect");
    expect(JSON.stringify(trackedLinks)).not.toContain("backend architect");
  });

  it("wires recommendation index and matched-job clicks without flattening them into job clicks", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }));

    const { pageViewEvents, trackedLinks } = installCareerTrackingMocks();

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
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({
        bundle_kind: "career_recommendation_index",
        items: [
          {
            recommendation_subject_meta: {
              canonical_type_code: "INTJ",
              display_title: "INTJ Career Match",
              public_route_slug: "intj",
            },
            score_summary: {
              fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 76, integrity_state: "full", degradation_factor: 1.0 },
            },
            trust_summary: { reviewer_status: "reviewed" },
            seo_contract: {
              canonical_path: "/career/recommendations/mbti/intj",
              index_state: "index",
              index_eligible: true,
            },
          },
        ],
      })),
    }));

    const { default: CareerRecommendationsPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/page"
    );
    const page = await CareerRecommendationsPage({
      params: Promise.resolve({ locale: "en" }),
    });
    renderToStaticMarkup(page as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_recommendation_index_view" })])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_recommendation_result_click",
          eventPayload: expect.objectContaining({
            subjectKind: "recommendation_type",
            subjectKey: "intj",
          }),
        }),
      ])
    );

    pageViewEvents.length = 0;
    trackedLinks.length = 0;

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
        provenance_meta: {
          compiler_version: "v2.1",
          compiled_at: "2026-04-08T10:05:00Z",
          compile_run_id: "run_789",
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
        ],
      })),
    }));

    const { default: CareerRecommendationDetailPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const detailPage = await CareerRecommendationDetailPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    renderToStaticMarkup(detailPage as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_recommendation_detail_view" })])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_recommendation_matched_job_click",
          eventPayload: expect.objectContaining({
            subjectKind: "job_slug",
            subjectKey: "data-scientist",
            routeFamily: "recommendation_detail",
          }),
        }),
      ])
    );
    expect(trackedLinks).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_job_index_result_click" })])
    );
  });
});
