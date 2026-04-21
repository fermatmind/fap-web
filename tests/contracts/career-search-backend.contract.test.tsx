import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerSearch } from "@/lib/career/adapters/adaptCareerSearch";
import { fetchCareerSearch } from "@/lib/career/api/fetchCareerSearch";

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
  vi.unmock("next/navigation");
});

function mockCareerDatasetDirectory(members: Array<Record<string, unknown>> = [
  {
    canonical_slug: "backend-architect",
    canonical_title_en: "Backend Architect",
    family_slug: "computer-and-information-technology",
    included_in_public_dataset: true,
    public_index_state: "indexable",
  },
]) {
  vi.doMock("@/lib/career/api/fetchCareerDatasetHub", () => ({
    fetchCareerDatasetHub: vi.fn(async () => ({
      dataset_key: "career_occupations_public",
      dataset_name: "Career occupations dataset",
      collection_summary: {
        member_count: members.length,
        included_count: members.length,
        public_detail_indexable_count: members.length,
      },
      members,
      structured_data: {
        dataset: { "@type": "Dataset", name: "Career occupations dataset" },
      },
    })),
  }));
}

describe("career search backend contract", () => {
  it("requests the backend conservative search endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/search?");
        expect(url).toContain("q=backend");
        expect(url).toContain("locale=zh-CN");
        expect(url).toContain("limit=6");
        expect(url).toContain("mode=prefix");

        return jsonResponse({
          bundle_kind: "career_search_results",
          items: [],
        });
      })
    );

    const payload = await fetchCareerSearch({
      q: "backend",
      locale: "zh",
      limit: 6,
      mode: "prefix",
    });

    expect(payload).not.toBeNull();
  });

  it("adapts backend search results into compact frontend cards without truth or score dependencies", () => {
    const items = adaptCareerSearch({
      locale: "zh",
      payload: {
        data: [
          {
            match_kind: "alias_exact",
            matched_text: "后端架构师",
            identity: {
              occupation_uuid: "occ_backend_architect",
              canonical_slug: "backend-architect",
            },
            titles: {
              canonical_en: "Backend Architect",
              canonical_zh: "后端架构师",
            },
            seo_contract: {
              canonical_path: "/career/jobs/backend-architect",
              index_state: "indexed",
              index_eligible: true,
              reason_codes: [],
            },
            trust_summary: {
              status: "available",
              reviewer_status: "reviewed",
              cross_market_notice: "truth_market: US; display_market: CN",
            },
            provenance_meta: {
              content_version: "content_v4.2",
              data_version: "data_2026_04",
              logic_version: "score_v1.0",
              compiler_version: "career_search_v1",
              compiled_at: "2026-04-10T12:00:00Z",
            },
          },
        ],
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.identity.canonicalSlug).toBe("backend-architect");
    expect(items[0]?.titles.title).toBe("后端架构师");
    expect(items[0]?.matchKind).toBe("alias_exact");
    expect(items[0]?.matchedText).toBe("后端架构师");
    expect(items[0]?.seoContract.canonicalPath).toBe("/career/jobs/backend-architect");
    expect(items[0]?.href).toBe("/zh/career/jobs/backend-architect");
    expect(items[0]?.dataStatus).toBe("available");
    expect(items[0]?.authoritySource).toBe("career_backend_conservative_search.v0.5");
    expect(items[0]).not.toHaveProperty("truthSummary");
    expect(items[0]).not.toHaveProperty("scoreSummary");
  });

  it("does not mark a search result available when backend seo gates say it is non-indexable", () => {
    const items = adaptCareerSearch({
      locale: "en",
      payload: {
        data: [
          {
            match_kind: "canonical_slug_exact",
            matched_text: "backend-architect",
            identity: {
              occupation_uuid: "occ_backend_architect",
              canonical_slug: "backend-architect",
            },
            titles: {
              canonical_en: "Backend Architect",
            },
            seo_contract: {
              canonical_path: "/career/jobs/backend-architect",
              index_state: "noindex",
              index_eligible: false,
              reason_codes: ["gated"],
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
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.dataStatus).toBe("trust_limited");
  });

  it("renders /career/jobs query mode through the backend-backed occupation directory", async () => {
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
    vi.doMock("@/lib/career/api/fetchCareerLaunchGovernanceClosure", () => ({
      fetchCareerLaunchGovernanceClosure: vi.fn(async () => ({
        governance_kind: "career_launch_governance_closure",
        governance_version: "career.governance.v1",
        scope: "career_all_342",
        counts: {
          tracking_counts: { expected_total_occupations: 342, tracked_total_occupations: 342, tracking_complete: true },
          summary: {},
        },
        members: [
          {
            canonical_slug: "data-scientists",
            release_state: "public_detail_indexable",
            strong_index_state: "strong_index_ready",
            operations_state: "strong_operations_ready",
            governance_state: "mature_public_launch",
            strong_index_ready: true,
            strong_operations_ready: true,
            blocking_reasons: [],
          },
        ],
        public_statement: { allowed_external_statement: "cohort-qualified only" },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [
          {
            identity: { canonical_slug: "backend-architect" },
            titles: { canonical_en: "Backend Architect" },
            seo_contract: {
              canonical_path: "/career/jobs/backend-architect",
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
      searchParams: Promise.resolve({ q: "backend" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-occupation-directory");
    expect(html).not.toContain("career-alias-resolution-candidate-link");
    expect(html).toContain("Backend Architect");
    expect(html).not.toContain("Salary:");
    expect(html).not.toContain("Fit score:");
    expect(html).not.toContain("Confidence score:");
  });

  it("renders the conservative directory empty state when a query has no matches", async () => {
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
    vi.doMock("@/lib/career/api/fetchCareerLaunchGovernanceClosure", () => ({
      fetchCareerLaunchGovernanceClosure: vi.fn(async () => ({
        governance_kind: "career_launch_governance_closure",
        governance_version: "career.governance.v1",
        scope: "career_all_342",
        counts: {
          tracking_counts: { expected_total_occupations: 342, tracked_total_occupations: 342, tracking_complete: true },
          summary: {},
        },
        members: [
          {
            canonical_slug: "financial-analysts",
            release_state: "review_needed",
            strong_index_state: "manual_only",
            operations_state: "not_strong_operations_ready",
            governance_state: "not_yet_mature",
            strong_index_ready: false,
            strong_operations_ready: false,
            blocking_reasons: ["crosswalk_backlog_not_converged"],
          },
        ],
        public_statement: { allowed_external_statement: "cohort-qualified only" },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [],
      })),
    }));
    mockCareerDatasetDirectory();

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "zzzz" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("No matching occupations found.");
    expect(html).not.toContain("career-job-search-card");
    expect(html).not.toContain("Backend Architect");
  });

});
