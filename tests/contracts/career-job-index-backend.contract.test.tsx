import type { ReactNode } from "react";
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
              index_state: "index",
              index_eligible: true,
            },
            provenance_meta: {
              compiler_version: "v2.2",
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

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-index-card");
    expect(html).toContain("Data Scientists");
    expect(html).toContain("View details");
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
            canonical_slug: "financial-analysts",
            status: "blocked_override_eligible",
            reason_codes: ["missing_crosswalk_source_code"],
          },
        ],
      })),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-index-status");
    expect(html).toContain("No public job index items are currently available");
    expect(html).not.toContain("Financial Analysts");
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
            index_state: "index",
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
        occupations: [],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => {
        throw new Error("search fetch should not run for whitespace-only q");
      }),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "   " }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(fetchCareerJobIndexMock).toHaveBeenCalledTimes(1);
    expect(html).toContain("career-job-index-card");
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
    vi.doMock("@/lib/career/api/fetchCareerSearch", () => ({
      fetchCareerSearch: vi.fn(async () => ({
        bundle_kind: "career_search_results",
        data: [],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => {
        throw new Error("job index fetch should not run when a real search query exists");
      }),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "zzzz" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-search-empty-state");
    expect(html).toContain("No public matching jobs were found");
    expect(html).not.toContain("CMS did not return any public career jobs");
  });
});
