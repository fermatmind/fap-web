import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerIndustryDirectory } from "@/lib/career/adapters/adaptCareerIndustryDirectory";
import { fetchCareerIndustryDirectory } from "@/lib/career/api/fetchCareerIndustryDirectory";
import { PublicReadError } from "@/lib/public-content/readError";

function jsonResponse(payload: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function industryDirectoryPayload(locale: "en" | "zh-CN" = "en") {
  const webLocale = locale === "zh-CN" ? "zh" : "en";

  return {
    authority_version: "career.industry_directory.v1",
    bundle_kind: "career_industry_directory",
    bundle_version: "career.industry_directory.v1",
    locale,
    public_detail_indexable_count: 4,
    industry_count: 2,
    industries: [
      {
        slug: "business-finance",
        title: locale === "zh-CN" ? "商业与金融" : "Business and Finance",
        title_en: "Business and Finance",
        title_zh: "商业与金融",
        count: 3,
        public_detail_count: 3,
        indexable_count: 3,
        canonical_path: `/${webLocale}/career/industries/business-finance`,
        discovery_jobs: [
          {
            slug: "accountants",
            title: locale === "zh-CN" ? "会计师" : "Accountants",
            title_en: "Accountants",
            title_zh: "会计师",
            canonical_path: `/${webLocale}/career/jobs/accountants`,
          },
          {
            slug: "actuaries",
            title: locale === "zh-CN" ? "精算师" : "Actuaries",
            title_en: "Actuaries",
            title_zh: "精算师",
            canonical_path: `/${webLocale}/career/jobs/actuaries`,
          },
        ],
      },
      {
        slug: "arts-media",
        title: locale === "zh-CN" ? "艺术与媒体" : "Arts and Media",
        title_en: "Arts and Media",
        title_zh: "艺术与媒体",
        count: 1,
        public_detail_count: 1,
        indexable_count: 1,
        canonical_path: `/${webLocale}/career/industries/arts-media`,
        discovery_jobs: [],
      },
    ],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career industry directory aggregate contract", () => {
  it("requests one locale-keyed backend aggregate with bounded tagged revalidation", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("/api/v0.5/career/industries?locale=zh-CN");
      expect(init).toEqual(expect.objectContaining({
        next: { revalidate: 300, tags: ["career-industry-directory:zh-CN"] },
      }));

      return jsonResponse(industryDirectoryPayload("zh-CN"));
    });
    vi.stubGlobal("fetch", fetchMock);

    const payload = await fetchCareerIndustryDirectory({ locale: "zh" });

    expect(payload?.bundle_kind).toBe("career_industry_directory");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats authoritative absence as empty authority without using an old fanout", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "NOT_FOUND" }, 404)));

    await expect(fetchCareerIndustryDirectory({ locale: "en" })).resolves.toBeNull();
    expect(adaptCareerIndustryDirectory({ locale: "en", payload: null })).toEqual({
      authorityVersion: null,
      locale: "en",
      publicDetailIndexableCount: 0,
      industryCount: 0,
      industries: [],
    });
  });

  it("preserves retryable backend failures for the shared page retry boundary", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(
        { error_code: "CAREER_INDUSTRY_DIRECTORY_UNAVAILABLE" },
        503,
        { "Retry-After": "60" }
      ))
    );

    await expect(fetchCareerIndustryDirectory({ locale: "en" })).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
      retryable: true,
      status: 503,
      errorCode: "CAREER_INDUSTRY_DIRECTORY_UNAVAILABLE",
      retryAfterSeconds: 60,
    });
  });

  it("adapts only the backend v1 bundle and its canonical paths", () => {
    const adapted = adaptCareerIndustryDirectory({
      locale: "zh",
      payload: industryDirectoryPayload("zh-CN"),
    });

    expect(adapted.authorityVersion).toBe("career.industry_directory.v1");
    expect(adapted.locale).toBe("zh-CN");
    expect(adapted.publicDetailIndexableCount).toBe(4);
    expect(adapted.industryCount).toBe(2);
    expect(adapted.industries[0]).toEqual(expect.objectContaining({
      slug: "business-finance",
      title: "商业与金融",
      canonicalPath: "/zh/career/industries/business-finance",
      count: 3,
      publicDetailCount: 3,
      indexableCount: 3,
    }));
    expect(adapted.industries[0]?.discoveryJobs).toEqual([
      expect.objectContaining({ slug: "accountants", canonicalPath: "/zh/career/jobs/accountants" }),
      expect.objectContaining({ slug: "actuaries", canonicalPath: "/zh/career/jobs/actuaries" }),
    ]);
  });

  it.each([
    ["wrong bundle", { bundle_kind: "career_job_index" }],
    ["wrong locale", { locale: "zh-CN" }],
    ["count mismatch", { industry_count: 3 }],
    ["unsafe canonical path", {
      industries: [
        {
          ...industryDirectoryPayload().industries[0],
          canonical_path: "/en/career/jobs/accountants",
        },
        industryDirectoryPayload().industries[1],
      ],
    }],
    ["oversized discovery payload", {
      industries: [
        {
          ...industryDirectoryPayload().industries[0],
          discovery_jobs: [
            ...industryDirectoryPayload().industries[0].discovery_jobs,
            { slug: "auditors", title: "Auditors", canonical_path: "/en/career/jobs/auditors" },
            { slug: "analysts", title: "Analysts", canonical_path: "/en/career/jobs/analysts" },
          ],
        },
        industryDirectoryPayload().industries[1],
      ],
    }],
  ])("fails closed on %s instead of inventing frontend authority", (_case, overrides) => {
    expect(() => adaptCareerIndustryDirectory({
      locale: "en",
      payload: { ...industryDirectoryPayload(), ...overrides },
    })).toThrowError(PublicReadError);
  });

  it("renders the industries page from one aggregate and contains no legacy fanout imports", async () => {
    const fetchAggregate = vi.fn(async () => industryDirectoryPayload());
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) =>
        createElement("a", { href, ...props }, children),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({ resolveLocale: vi.fn(() => "en") }));
    vi.doMock("@/lib/career/api/fetchCareerIndustryDirectory", () => ({
      fetchCareerIndustryDirectory: fetchAggregate,
    }));

    const { default: CareerIndustriesPage } = await import("@/app/(localized)/[locale]/career/industries/page");
    const page = await CareerIndustriesPage({ params: Promise.resolve({ locale: "en" }) });
    const html = renderToStaticMarkup(page as ReactNode);
    const source = readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/career/industries/page.tsx"),
      "utf8"
    );

    expect(fetchAggregate).toHaveBeenCalledTimes(1);
    expect(fetchAggregate).toHaveBeenCalledWith({ locale: "en" });
    expect(html).toContain('href="/en/career/industries/business-finance"');
    expect(html).toContain('href="/en/career/jobs/accountants"');
    expect(html).toContain('href="/en/career/jobs/actuaries"');
    expect(source).toContain("fetchCareerIndustryDirectory");
    expect(source).not.toContain("fetchCareerDatasetHub");
    expect(source).not.toContain("fetchCareerJobIndex");
    expect(source).not.toContain("listBackendSitemapCareerJobPaths");
    expect(source).not.toContain("Promise.all");
  });

  it("does not swallow retryable aggregate failures in the page", async () => {
    const transient = new PublicReadError({ kind: "transient", status: 503 });
    vi.doMock("@/lib/i18n/getDict", () => ({ resolveLocale: vi.fn(() => "en") }));
    vi.doMock("@/lib/career/api/fetchCareerIndustryDirectory", () => ({
      fetchCareerIndustryDirectory: vi.fn(async () => {
        throw transient;
      }),
    }));

    const { default: CareerIndustriesPage } = await import("@/app/(localized)/[locale]/career/industries/page");

    await expect(CareerIndustriesPage({
      params: Promise.resolve({ locale: "en" }),
    })).rejects.toBe(transient);
  });
});
