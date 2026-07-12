import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerDirectory } from "@/lib/career/adapters/adaptCareerDirectory";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { fetchCareerDirectory } from "@/lib/career/api/fetchCareerDirectory";
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

function careerDirectoryPayload(items: Array<Record<string, unknown>>, overrides: Record<string, unknown> = {}) {
  return {
    authority_version: "career.directory_authority.v1",
    bundle_kind: "career_directory",
    public_truth: {
      public_detail_indexable_count: 1046,
      directory_member_count: 1046,
      future_scale_ready: true,
      excluded_slugs: ["software-developers", "digital-forensics-analysts", "computer-occupations-all-other"],
    },
    pagination: {
      page: 1,
      per_page: 50,
      total: items.length,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false,
    },
    filters: {
      locale: "en",
      family: null,
      q: null,
    },
    facets: {
      families: [
        {
          slug: "computer-and-information-technology",
          title_en: "Computer and information technology",
          title_zh: "计算机与信息技术",
          count: items.length,
        },
      ],
    },
    items,
    ...overrides,
  };
}

describe("career job index backend contract", () => {
  it("proxies the production same-origin career directory endpoint", () => {
    const configSource = readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");

    expect(configSource).toContain('"/api/v0.5/career/directory"');
    expect(configSource.indexOf('"/api/v0.5/career/directory"')).toBeLessThan(
      configSource.indexOf('"/api/v0.5/career/jobs"')
    );
  });

  it("requests the backend paginated career directory endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/directory?");
        expect(url).toContain("locale=zh-CN");
        expect(url).toContain("page=2");
        expect(url).toContain("per_page=50");
        expect(url).toContain("family=healthcare");
        expect(url).toContain("q=nurse");

        return jsonResponse(careerDirectoryPayload([]));
      })
    );

    const payload = await fetchCareerDirectory({ locale: "zh", page: 2, perPage: 50, family: "healthcare", query: "nurse" });

    expect(payload.state).toBe("empty");
    expect(payload.payload).not.toBeNull();
  });

  it("uses tagged revalidation only for the unfiltered first directory page", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return jsonResponse(careerDirectoryPayload([]));
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchCareerDirectory({ locale: "en" });
    await fetchCareerDirectory({ locale: "en", family: "healthcare" });

    expect(fetchMock.mock.calls[0]?.[1]).toEqual(expect.objectContaining({
      next: { revalidate: 300, tags: ["career-directory:en"] },
    }));
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(expect.objectContaining({ cache: "no-store" }));
  });

  it.each([408, 429, 500, 502, 503, 504])("treats backend status %s as unavailable instead of an empty directory", async (status) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: `HTTP_${status}` }, status)));

    const result = await fetchCareerDirectory({ locale: "zh" });

    expect(result.state).toBe("unavailable");
    expect(result.payload).toBeNull();
    expect(result.error).toEqual(expect.objectContaining({ status, endpoint: expect.stringContaining("/v0.5/career/directory"), durationMs: expect.any(Number) }));
  });

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

  it("adapts the backend directory into frontend-safe paginated members without CMS fallback truth", () => {
    const directory = adaptCareerDirectory({
      locale: "en",
      payload: careerDirectoryPayload([
        {
          slug: "data-scientists",
          title_en: "Data Scientists",
          title_zh: "数据科学家",
          title: "Data Scientists",
          family: {
            slug: "computer-and-information-technology",
            title_en: "Computer and information technology",
            title_zh: "计算机与信息技术",
          },
          canonical_path: "/en/career/jobs/data-scientists",
          indexability_state: "indexable",
          robots_policy: "index,follow",
          indexable: true,
          detail_ready: true,
        },
      ]),
    });

    expect(directory.authorityVersion).toBe("career.directory_authority.v1");
    expect(directory.publicTruth.publicDetailIndexableCount).toBe(1046);
    expect(directory.members).toHaveLength(1);
    expect(directory.members[0]?.canonicalSlug).toBe("data-scientists");
    expect(directory.members[0]?.canonicalTitleEn).toBe("Data Scientists");
    expect(directory.members[0]?.publicIndexState).toBe("indexable");
    expect(directory.members[0]?.includedInPublicDataset).toBe(true);
  });

  it("uses existing Chinese occupation and family labels when the directory API only returns English labels", () => {
    const directory = adaptCareerDirectory({
      locale: "zh",
      payload: careerDirectoryPayload(
        [
          {
            slug: "accountants-and-auditors",
            title_en: "Accountants and auditors",
            family: {
              slug: "business-and-financial",
              title_en: "Business and financial",
            },
            indexable: true,
            detail_ready: true,
          },
        ],
        {
          facets: {
            families: [
              {
                slug: "business-and-financial",
                title_en: "Business and financial",
                count: 1,
              },
              {
                slug: "finance",
                title_en: "Finance",
                count: 2,
              },
            ],
          },
        }
      ),
    });

    expect(directory.members[0]?.canonicalTitleZh).toBe("会计师和审计师");
    expect(directory.members[0]?.canonicalTitleEn).toBe("Accountants and auditors");
    expect(directory.facets.families[0]?.title).toBe("商业与金融");
    expect(directory.facets.families[0]?.count).toBe(3);
    expect(directory.facets.families.filter((family) => family.slug === "business-and-financial")).toHaveLength(1);
  });

  it("renders the jobs page from the backend paginated directory without cms authority fallback", async () => {
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
    vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
      fetchCareerDirectory: vi.fn(async () =>
        careerDirectoryPayload([
          {
            slug: "data-scientists",
            title_en: "Data Scientists",
            title_zh: "数据科学家",
            title: "Data Scientists",
            family: {
              slug: "computer-and-information-technology",
              title_en: "Computer and information technology",
              title_zh: "计算机与信息技术",
            },
            canonical_path: "/en/career/jobs/data-scientists",
            indexability_state: "indexable",
            robots_policy: "index,follow",
            indexable: true,
            detail_ready: true,
          },
        ])
      ),
    }));

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

  it("renders only the current paginated directory page returned by backend authority", async () => {
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
    vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
      fetchCareerDirectory: vi.fn(async () =>
        careerDirectoryPayload(
          [
            {
              slug: "financial-analysts",
              title_en: "Financial Analysts",
              title: "Financial Analysts",
              family: {
                slug: "business-and-financial",
                title_en: "Business and financial",
              },
              indexable: true,
              detail_ready: true,
            },
          ],
          {
            pagination: {
              page: 2,
              per_page: 50,
              total: 1046,
              total_pages: 21,
              has_next_page: true,
              has_previous_page: true,
            },
          }
        )
      ),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ page: "2" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-occupation-directory");
    expect(html).toContain("Financial Analysts");
    expect(html).toContain("Page 2 of 21");
  });

  it("treats whitespace-only q as no query and keeps the default backend directory path", async () => {
    const fetchCareerDirectoryMock = vi.fn(async () =>
      careerDirectoryPayload([
        {
          slug: "backend-architect",
          title_en: "Backend Architect",
          title: "Backend Architect",
          family: {
            slug: "computer-and-information-technology",
            title_en: "Computer and information technology",
          },
          indexable: true,
          detail_ready: true,
        },
      ])
    );
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
    vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
      fetchCareerDirectory: fetchCareerDirectoryMock,
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

    expect(fetchCareerDirectoryMock).toHaveBeenCalledTimes(1);
    expect(fetchCareerDirectoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        perPage: 50,
        query: null,
      })
    );
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
    vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
      fetchCareerDirectory: vi.fn(async () =>
        careerDirectoryPayload([], {
          pagination: {
            page: 1,
            per_page: 50,
            total: 0,
            total_pages: 0,
            has_next_page: false,
            has_previous_page: false,
          },
        })
      ),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "zzzz" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("No matching occupations found.");
    expect(html).not.toContain("CMS did not return any public career jobs");
  });

  it("renders unavailable with retry and never shows zero summary metrics on an unfiltered failure", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a>,
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({ resolveLocale: vi.fn(() => "zh") }));
    vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
      fetchCareerDirectory: vi.fn(async () => ({
        state: "unavailable",
        payload: null,
        error: { endpoint: "/v0.5/career/directory", status: 504, errorCode: "HTTP_504", requestId: "req-safe", durationMs: 15000 },
      })),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({ params: Promise.resolve({ locale: "zh" }), searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-directory-unavailable");
    expect(html).toContain("职业库暂时无法加载");
    expect(html).toContain("重试");
    expect(html).not.toContain("career-library-summary");
    expect(html).not.toContain("全部职业</div><div>0");
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
