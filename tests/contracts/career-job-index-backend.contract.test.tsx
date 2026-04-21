import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";

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
});

function mockCareerDatasetHub(members: Array<Record<string, unknown>> = [
  {
    canonical_slug: "data-scientists",
    canonical_title_en: "Data Scientists",
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

describe("career job index backend contract", () => {
  it("requests the backend lightweight job index endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/jobs?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          bundle_kind: "career_job_index",
          items: [],
        });
      })
    );

    const payload = await fetchCareerJobIndex({ locale: "zh" });

    expect(payload).not.toBeNull();
  });

  it("adapts the backend lightweight job index into frontend-safe cards without CMS fallback truth", () => {
    const items = adaptCareerJobIndex({
      locale: "zh",
      payload: {
        bundle_kind: "career_job_index",
        items: [
          {
            identity: {
              occupation_uuid: "occ_backend_architect",
              canonical_slug: "backend-architect",
            },
            titles: {
              canonical_en: "Backend Architect",
              canonical_zh: "后端架构师",
            },
            truth_summary: {
              truth_market: "US",
              median_pay_usd_annual: 182000,
              outlook_pct_2024_2034: 14,
            },
            trust_summary: {
              reviewer_status: "approved",
              allow_salary_comparison: true,
              allow_ai_strategy: true,
              reason_codes: [],
            },
            score_summary: {
              fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            },
            seo_contract: {
              canonical_path: "/career/jobs/backend-architect",
              index_state: "index",
              index_eligible: true,
            },
            provenance_meta: {
              compiler_version: "v2.2",
              compile_run_id: "run_123",
            },
          },
        ],
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.identity.canonicalSlug).toBe("backend-architect");
    expect(items[0]?.titles.title).toBe("后端架构师");
    expect(items[0]?.truthSummary.medianPayUsdAnnual).toBe(182000);
    expect(items[0]?.scoreSummary.fitScore.value).toBe(84);
    expect(items[0]?.trustSummary.reviewerStatus).toBe("approved");
    expect(items[0]?.seoContract.canonicalPath).toBe("/career/jobs/backend-architect");
    expect(items[0]?.href).toBe("/zh/career/jobs/backend-architect");
    expect(items[0]?.dataStatus).toBe("available");
    expect(items[0]?.authoritySource).toBe("career_backend_lightweight_index.v0.5");
  });

  it("renders the jobs page from the backend lightweight path without cms authority fallback", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [
          {
            identity: {
              canonical_slug: "data-scientists",
            },
            titles: {
              canonical_en: "Data Scientists",
            },
            truth_summary: {
              median_pay_usd_annual: 182000,
              outlook_pct_2024_2034: 14,
              outlook_description: "High-trust systems work.",
            },
            trust_summary: {
              reviewer_status: "approved",
            },
            score_summary: {
              fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            },
            seo_contract: {
              canonical_path: "/career/jobs/data-scientists",
              index_state: "indexable",
              index_eligible: true,
            },
            provenance_meta: {
              compiler_version: "v2.2",
            },
          },
        ],
      })),
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
    mockCareerDatasetHub();

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-occupation-directory");
    expect(html).toContain("Data Scientists");
    expect(html).toContain("Detail ready");
    expect(html).not.toContain("CMS did not return any public career jobs");
  });

  it("filters non-stable job cards out of the public jobs index", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [
          {
            identity: {
              canonical_slug: "financial-analysts",
            },
            titles: {
              canonical_en: "Financial Analysts",
            },
            truth_summary: {
              median_pay_usd_annual: 182000,
              outlook_pct_2024_2034: 14,
            },
            trust_summary: {
              reviewer_status: "reviewed",
            },
            score_summary: {
              fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            },
            seo_contract: {
              canonical_path: "/career/jobs/financial-analysts",
              index_state: "indexable",
              index_eligible: true,
            },
          },
        ],
      })),
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
    mockCareerDatasetHub([
      {
        canonical_slug: "financial-analysts",
        canonical_title_en: "Financial Analysts",
        family_slug: "business-and-financial",
        included_in_public_dataset: true,
        public_index_state: "noindex",
      },
    ]);

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-occupation-directory");
    expect(html).toContain("Financial Analysts");
  });

  it("treats whitespace-only q as no query and keeps the default backend job index path", async () => {
    const fetchCareerJobIndexMock = vi.fn(async () => ({
      bundle_kind: "career_job_index",
      items: [
        {
          identity: {
            canonical_slug: "backend-architect",
          },
          titles: {
            canonical_en: "Backend Architect",
          },
          truth_summary: {
            median_pay_usd_annual: 182000,
            outlook_pct_2024_2034: 14,
            outlook_description: "High-trust systems work.",
          },
          trust_summary: {
            reviewer_status: "approved",
          },
          score_summary: {
            fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
            confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
          },
            seo_contract: {
            canonical_path: "/career/jobs/backend-architect",
            index_state: "indexable",
            index_eligible: true,
          },
        },
      ],
    }));

    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: fetchCareerJobIndexMock,
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
        members: [],
        public_statement: { allowed_external_statement: "cohort-qualified only" },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => {
        throw new Error("search fetch should not run for whitespace-only q");
      }),
    }));
    mockCareerDatasetHub([
      {
        canonical_slug: "backend-architect",
        canonical_title_en: "Backend Architect",
        family_slug: "computer-and-information-technology",
        included_in_public_dataset: true,
        public_index_state: "indexable",
      },
    ]);

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "   " }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(fetchCareerJobIndexMock).toHaveBeenCalledTimes(1);
    expect(html).toContain("career-occupation-directory");
    expect(html).not.toContain("career-job-search-card");
  });

  it("renders an explicit conservative empty state for real no-result queries", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [],
      })),
    }));
    mockCareerDatasetHub([
      {
        canonical_slug: "data-scientists",
        canonical_title_en: "Data Scientists",
        family_slug: "computer-and-information-technology",
        included_in_public_dataset: true,
        public_index_state: "indexable",
      },
    ]);

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "zzzz" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("No matching occupations found.");
    expect(html).not.toContain("CMS did not return any public career jobs");
  });

  it("career jobs page renders the same breadcrumb trail used by other public hubs", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/career/jobs/page.tsx"),
      "utf8"
    );

    expect(source).toContain("Breadcrumb");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain("全部职业库");
    expect(source).toContain("All occupations");
  });
});
