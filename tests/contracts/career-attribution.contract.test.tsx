import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const CONSENT_KEY = "fm_consent_v1";

afterEach(() => {
  window.localStorage.clear();
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

function mockCareerCenterContent() {
  vi.doMock("@/lib/marketing/careerCenterContent", () => ({
    getCareerCenterContent: vi.fn(async () => ({
      seo: {
        title: "Career Explorer",
        description: "Explore career paths.",
      },
      hero: {
        title: "Career Explorer",
      },
      pathways: [
        {
          eyebrow: "Jobs",
          title: "Job library",
          description: "Search backend-owned jobs.",
          href: "/career/jobs",
          searchPlaceholder: "Search jobs",
          ctaLabel: "Search jobs",
        },
        {
          eyebrow: "Recommendations",
          title: "Recommendations",
          description: "Explore recommendation surfaces.",
          href: "/career/recommendations",
          ctaLabel: "View recommendations",
        },
        {
          eyebrow: "Tests",
          title: "Tests",
          description: "Start from assessment context.",
          href: "/career/tests",
          ctaLabel: "View tests",
        },
      ],
      support: {
        title: "Explore more",
        links: [{ href: "/career/resolve", label: "Resolve" }],
      },
    })),
  }));
}

function mockCareerDatasetDirectory() {
  vi.doMock("@/lib/career/api/fetchCareerDatasetHub", () => ({
    fetchCareerDatasetHub: vi.fn(async () => ({
      dataset_key: "career_occupations_public",
      dataset_name: "Career occupations dataset",
      collection_summary: { member_count: 1, included_count: 1, public_detail_indexable_count: 1 },
      members: [
        {
          canonical_slug: "data-scientists",
          canonical_title_en: "Data Scientists",
          family_slug: "computer-and-information-technology",
          included_in_public_dataset: true,
          public_index_state: "indexable",
        },
      ],
      structured_data: { dataset: { "@type": "Dataset", name: "Career occupations dataset" } },
    })),
  }));
}

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career attribution payload builder contract", () => {
  it("exports family-hub events through the shared career tracking registry", async () => {
    const { CAREER_TRACKING_EVENTS } = await import("@/lib/career/attribution");

    expect(CAREER_TRACKING_EVENTS.familyHubView).toBe("career_family_hub_view");
    expect(CAREER_TRACKING_EVENTS.familyHubChildClick).toBe("career_family_hub_child_click");
    expect(CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed).toBe("career_claim_blocked_surface_exposed");
  });

  it("re-emits search-mode page views when the tracking key changes on the same pathname", async () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ analytics: "granted", updatedAt: "2026-05-27T00:00:00.000Z" })
    );

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

    expect(
      buildCareerAttributionPayload({
        locale: "en",
        entrySurface: "career_family_hub",
        sourcePageType: "career_family_hub",
        targetAction: "view_family_hub",
        landingPath: "/en/career/family/data-and-ai",
        routeFamily: "family_hub",
        subjectKind: "family_slug",
        subjectKey: "data-and-ai",
        queryMode: "non_query",
      })
    ).toEqual({
      locale: "en",
      entry_surface: "career_family_hub",
      source_page_type: "career_family_hub",
      target_action: "view_family_hub",
      landing_path: "/en/career/family/data-and-ai",
      route_family: "family_hub",
      subject_kind: "family_slug",
      subject_key: "data-and-ai",
      query_mode: "non_query",
    });

    expect(
      buildCareerAttributionPayload({
        locale: "en",
        entrySurface: "career_alias_disambiguation",
        sourcePageType: "career_alias_disambiguation",
        targetAction: "open_alias_resolution_target",
        landingPath: "/en/career/resolve",
        routeFamily: "alias_resolution",
        subjectKind: "family_slug",
        subjectKey: "computer-and-information-technology",
        queryMode: "query",
      })
    ).toEqual({
      locale: "en",
      entry_surface: "career_alias_disambiguation",
      source_page_type: "career_alias_disambiguation",
      target_action: "open_alias_resolution_target",
      landing_path: "/en/career/resolve",
      route_family: "alias_resolution",
      subject_kind: "family_slug",
      subject_key: "computer-and-information-technology",
      query_mode: "query",
    });

    expect(
      buildCareerAttributionPayload({
        locale: "en",
        entrySurface: "career_job_detail",
        sourcePageType: "career_job_detail",
        targetAction: "expose_claim_blocked_surface",
        landingPath: "/en/career/jobs/data-scientists",
        routeFamily: "job_detail",
        subjectKind: "job_slug",
        subjectKey: "data-scientists",
        blockedClaimKind: "salary",
      })
    ).toEqual({
      locale: "en",
      entry_surface: "career_job_detail",
      source_page_type: "career_job_detail",
      target_action: "expose_claim_blocked_surface",
      landing_path: "/en/career/jobs/data-scientists",
      route_family: "job_detail",
      subject_kind: "job_slug",
      subject_key: "data-scientists",
      query_mode: "non_query",
      blocked_claim_kind: "salary",
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
  it("keeps deferred career events out of the current frontend wiring path", () => {
    const trackedSources = [
      "app/(localized)/[locale]/career/page.tsx",
      "app/(localized)/[locale]/career/jobs/page.tsx",
      "app/(localized)/[locale]/career/resolve/page.tsx",
      "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
      "app/(localized)/[locale]/career/family/[slug]/page.tsx",
      "components/career/CareerFamilyHubPage.tsx",
      "app/(localized)/[locale]/career/recommendations/page.tsx",
      "app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx",
      "components/analytics/TrackedCareerLink.tsx",
      "lib/career/attribution.ts",
    ].map(read).join("\n");

    expect(trackedSources).not.toContain("career_alias_search");
    expect(trackedSources).not.toContain("career_alias_disambiguation_view");
    expect(trackedSources).not.toContain("career_view");
    expect(trackedSources).not.toContain("career_blocked_surface_exposed");
    expect(trackedSources).not.toContain("career_family_hub_ready_surface_exposed");
    expect(trackedSources).not.toContain("career_family_hub_blocked_surface_exposed");
  });

  it("wires landing view, ready exposure, and landing preview clicks through the shared career event set", async () => {
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
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
    }));
    mockCareerCenterContent();

    const { default: CareerCenterPage } = await import("@/app/(localized)/[locale]/career/page");
    const page = await CareerCenterPage({
      params: Promise.resolve({ locale: "en" }),
    });

    renderToStaticMarkup(page as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventName: "career_landing_view" }),
      ])
    );
    expect(trackedLinks).toEqual([]);
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
        items: [
          {
            identity: { canonical_slug: "data-scientists" },
            titles: { canonical_en: "Data Scientists" },
            seo_contract: {
              canonical_path: "/career/jobs/data-scientists",
              index_state: "indexable",
              index_eligible: true,
            },
          },
        ],
      })),
    }));
    mockCareerDatasetDirectory();

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "backend architect" }),
    });

    renderToStaticMarkup(page as ReactNode);

    expect(pageViewEvents).toEqual([]);
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_job_index_view" })])
    );
    expect(trackedLinks).toEqual([]);
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_alias_resolution_submit" })])
    );
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_alias_resolution_no_result" })])
    );
    expect(trackedLinks).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_alias_resolution_target_click" })])
    );
    expect(JSON.stringify(pageViewEvents)).not.toContain("backend architect");
    expect(JSON.stringify(trackedLinks)).not.toContain("backend architect");
  });

  it("wires alias-resolution submit/target-click/no-result only from resolve truth branches", async () => {
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
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async () => ({
        bundle_kind: "career_alias_resolution",
        resolution: {
          resolved_kind: "ambiguous",
          candidates: [
            {
              candidate_kind: "occupation",
              canonical_slug: "data-scientists",
              canonical_title_en: "Data Scientists",
              seo_contract: {
                index_state: "indexable",
                index_eligible: true,
              },
              trust_summary: {
                reviewer_status: "approved",
              },
            },
            {
              candidate_kind: "family",
              canonical_slug: "computer-and-information-technology",
              title_en: "Computer and Information Technology",
            },
          ],
        },
      })),
    }));
    const { default: CareerResolvePage } = await import("@/app/(localized)/[locale]/career/resolve/page");
    const ambiguousPage = await CareerResolvePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "analytics" }),
    });

    renderToStaticMarkup(ambiguousPage as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_alias_resolution_submit",
          properties: expect.objectContaining({
            entry_surface: "career_alias_disambiguation",
            source_page_type: "career_alias_disambiguation",
            landing_path: "/en/career/resolve",
            route_family: "alias_resolution",
            subject_kind: "none",
            query_mode: "query",
          }),
        }),
      ])
    );
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_alias_resolution_no_result" })])
    );
    expect(pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_job_search_submit" })])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_alias_resolution_target_click",
          eventPayload: expect.objectContaining({
            subjectKind: "job_slug",
            subjectKey: "data-scientists",
            entrySurface: "career_alias_disambiguation",
            routeFamily: "alias_resolution",
          }),
        }),
        expect.objectContaining({
          eventName: "career_alias_resolution_target_click",
          eventPayload: expect.objectContaining({
            subjectKind: "family_slug",
            subjectKey: "computer-and-information-technology",
            entrySurface: "career_alias_disambiguation",
            routeFamily: "alias_resolution",
          }),
        }),
      ])
    );
    expect(trackedLinks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventName: "career_job_search_result_click" }),
      ])
    );

    vi.resetModules();
    const noResultCapture = installCareerTrackingMocks();
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
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async () => ({
        bundle_kind: "career_alias_resolution",
        resolution: {
          resolved_kind: "none",
        },
      })),
    }));
    const { default: CareerResolvePageNoResult } = await import("@/app/(localized)/[locale]/career/resolve/page");
    const noResultPage = await CareerResolvePageNoResult({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "unknown-role" }),
    });
    renderToStaticMarkup(noResultPage as ReactNode);

    expect(noResultCapture.pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventName: "career_alias_resolution_submit" }),
        expect.objectContaining({
          eventName: "career_alias_resolution_no_result",
          properties: expect.objectContaining({
            entry_surface: "career_alias_disambiguation",
            source_page_type: "career_alias_disambiguation",
            landing_path: "/en/career/resolve",
            route_family: "alias_resolution",
            subject_kind: "none",
            query_mode: "query",
          }),
        }),
      ])
    );
    expect(noResultCapture.pageViewEvents).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ eventName: "career_job_search_submit" })])
    );
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

    const { default: CareerRecommendationDetailPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const detailPage = await CareerRecommendationDetailPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    renderToStaticMarkup(detailPage as ReactNode);

    expect(pageViewEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventName: "career_recommendation_detail_view" }),
        expect.objectContaining({
          eventName: "career_transition_preview_view",
          properties: expect.objectContaining({
            entry_surface: "career_recommendation_detail_transition_preview",
            route_family: "recommendation_detail",
            subject_kind: "job_slug",
            subject_key: "product-manager",
          }),
        }),
      ])
    );
    expect(trackedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: "career_transition_preview_target_click",
          eventPayload: expect.objectContaining({
            entrySurface: "career_recommendation_detail_transition_preview",
            routeFamily: "recommendation_detail",
            subjectKind: "job_slug",
            subjectKey: "product-manager",
          }),
        }),
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
      expect.arrayContaining([
        expect.objectContaining({ eventName: "career_job_index_result_click" }),
        expect.objectContaining({ eventName: "career_recommendation_result_click" }),
      ])
    );
  });
});
