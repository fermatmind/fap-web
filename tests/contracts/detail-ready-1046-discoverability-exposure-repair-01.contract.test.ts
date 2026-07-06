import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LLMS_ROUTE_LIMITS } from "@/lib/seo/llmsRouteBudget";

const ROOT = process.cwd();
const SITE_URL = "https://fermatmind.com";
const VALID_CAREER_JOB_PATHS = [
  "/en/career/jobs/accountants-and-auditors",
  "/zh/career/jobs/accountants-and-auditors",
  "/en/career/jobs/actuaries",
  "/zh/career/jobs/actuaries",
];
const EXCLUDED_CAREER_JOB_PATHS = [
  "/en/career/jobs/software-developers",
  "/zh/career/jobs/software-developers",
  "/en/career/jobs/digital-forensics-analysts",
  "/zh/career/jobs/digital-forensics-analysts",
  "/en/career/jobs/computer-occupations-all-other",
  "/zh/career/jobs/computer-occupations-all-other",
];

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function mockSharedLlmsDependencies() {
  const listBackendSitemapCareerJobPaths = vi.fn(async () => [
    ...VALID_CAREER_JOB_PATHS,
    ...EXCLUDED_CAREER_JOB_PATHS,
  ]);

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/backendSitemapSource", () => ({
      listBackendSitemapBigFiveZhPaths: vi.fn(async () => []),
    listBackendSitemapCareerJobPaths,
  }));
  vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
    fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
    adaptCareerRecommendationIndex: vi.fn(() => []),
  }));
  vi.doMock("@/lib/cms/articles", () => ({
    listCmsArticlesForLlmsWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: null })),
  }));
  vi.doMock("@/lib/cms/career-guides", () => ({
    listCareerGuidesFromCms: vi.fn(async () => []),
    getCareerGuideFromCmsBySlug: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/cms/content-pages", () => ({
    listApprovedEnglishContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    listDiscoverableContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    listContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
  }));
  vi.doMock("@/lib/cms/personality", () => ({
    buildDefaultPublicPersonalitySlug: vi.fn(() => ""),
    getPersonalityProjectionDetailBySlugOrType: vi.fn(async () => null),
    listPersonalityProfiles: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/cms/topics", () => ({
    getTopicBySlug: vi.fn(async () => null),
    listTopics: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
    listBackendDiscoverabilityTestEntries: vi.fn(async () => []),
  }));

  return { listBackendSitemapCareerJobPaths };
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DETAIL_READY_1046_DISCOVERABILITY_EXPOSURE_REPAIR-01", () => {
  it("raises llms Career job budget to cover the 1046 bilingual public detail cohort", () => {
    expect(LLMS_ROUTE_LIMITS.careerJobs).toBeGreaterThanOrEqual(1046 * 2);
    expect(read("app/llms.txt/route.ts")).toContain("LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS");
    expect(read("app/llms-full.txt/route.ts")).toContain("LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS");
  });

  it("keeps sitemap SEO locale parameters while llms career enumeration avoids per-detail SEO fanout", () => {
    const helperSource = read("lib/seo/backendSitemapSource.ts");
    const sitemapSource = read("next-sitemap.config.js");

    expect(helperSource).toContain("buildApiUrl(\"/v0.5/seo/sitemap-source\")");
    expect(helperSource).not.toContain("/v0.5/career-jobs/");
    expect(helperSource).not.toContain('return locale === "zh" ? "zh-CN" : "en";');
    expect(sitemapSource).toContain('return locale === "zh" ? "zh-CN" : "en";');
  });

  it("keeps software, conflict, and already-indexable replacement slugs out of final llms.txt output", async () => {
    const { listBackendSitemapCareerJobPaths } = mockSharedLlmsDependencies();
    const { GET } = await import("@/app/llms.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(listBackendSitemapCareerJobPaths).toHaveBeenCalledWith(
      expect.objectContaining({ limit: LLMS_ROUTE_LIMITS.careerJobs })
    );
    for (const value of VALID_CAREER_JOB_PATHS) {
      expect(text).toContain(`${SITE_URL}${value}`);
    }
    for (const value of EXCLUDED_CAREER_JOB_PATHS) {
      expect(text).not.toContain(`${SITE_URL}${value}`);
    }
    expect(text).not.toMatch(/\/(?:take|result|share|orders|pay|payment)(?:\/|$)/i);
  });

  it("keeps software, conflict, and already-indexable replacement slugs out of final llms-full.txt output", async () => {
    const { listBackendSitemapCareerJobPaths } = mockSharedLlmsDependencies();
    const { GET } = await import("@/app/llms-full.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(listBackendSitemapCareerJobPaths).toHaveBeenCalledWith(
      expect.objectContaining({ limit: LLMS_ROUTE_LIMITS.careerJobs })
    );
    for (const value of VALID_CAREER_JOB_PATHS) {
      expect(text).toContain(`${SITE_URL}${value}`);
    }
    for (const value of EXCLUDED_CAREER_JOB_PATHS) {
      expect(text).not.toContain(`${SITE_URL}${value}`);
    }
    expect(text).not.toMatch(/\/(?:take|result|share|orders|pay|payment)(?:\/|$)/i);
  });
});
