import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/navigation");
});

function installJobsSearchSurfaceMocks() {
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

  vi.doMock("next/navigation", () => ({
    usePathname: vi.fn(() => "/en/career/jobs"),
    redirect: vi.fn((destination: string) => {
      throw new Error(`unexpected-redirect:${destination}`);
    }),
  }));

  vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
    fetchCareerAliasResolution: vi.fn(async () => {
      throw new Error("alias resolution fetch should not run on jobs search surface");
    }),
  }));

  vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
    fetchCareerJobIndex: vi.fn(async () => {
      throw new Error("job index fetch should not run in search mode");
    }),
  }));
}

function installFirstWaveSummaryMock() {
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
}

describe("career jobs search UX contract", () => {
  it("shows direct results and keeps family fallback as a secondary path", async () => {
    installJobsSearchSurfaceMocks();
    installFirstWaveSummaryMock();

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

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "backend" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-search-results");
    expect(html).toContain("career-job-search-card");
    expect(html).toContain("career-job-search-state-results-with-family-fallback");
    expect(html).toContain("career-job-search-family-fallback");
    expect(html).toContain("career-job-search-family-fallback-card");
    expect(html).toContain("career-job-search-resolve-handoff-assist");
    expect(html).toContain("Open family hub");
    expect(html).not.toContain("career-alias-resolution-candidate-link");
  });

  it("renders a family-fallback-only state when direct jobs are missing but family direction exists", async () => {
    installJobsSearchSurfaceMocks();
    installFirstWaveSummaryMock();

    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => ({
        bundle_kind: "career_search_results",
        data: [],
      })),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "governance analyst" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-search-state-family-fallback-only");
    expect(html).toContain("career-job-search-empty-state");
    expect(html).toContain("career-job-search-family-fallback");
    expect(html).toContain("career-job-search-no-result-actions");
    expect(html).toContain("career-job-search-resolve-handoff-assist");
  });

  it("renders a pure search no-result state when no jobs and no family fallback are available", async () => {
    installJobsSearchSurfaceMocks();
    installFirstWaveSummaryMock();

    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => ({
        bundle_kind: "career_search_results",
        data: [],
      })),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "zzzz unresolved keyword" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-search-state-no-result");
    expect(html).toContain("career-job-search-empty-state");
    expect(html).toContain("career-job-search-no-result-actions");
    expect(html).toContain("career-job-search-resolve-handoff-assist");
    expect(html).not.toContain("career-job-search-family-fallback");
  });

  it("does not trigger family fallback from short token substring collisions", async () => {
    installJobsSearchSurfaceMocks();
    installFirstWaveSummaryMock();

    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => ({
        bundle_kind: "career_search_results",
        data: [],
      })),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "paid internship" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-search-state-no-result");
    expect(html).not.toContain("career-job-search-family-fallback");
  });
});
