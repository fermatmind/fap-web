import { afterEach, describe, expect, it, vi } from "vitest";
import { LLMS_ROUTE_LIMITS } from "@/lib/seo/llmsRouteBudget";

const SITE_URL = "https://fermatmind.com";
const VALID_CAREER_JOB_PATHS = [
  "/en/career/jobs/accountants-and-auditors",
  "/zh/career/jobs/accountants-and-auditors",
  "/en/career/jobs/actors",
  "/zh/career/jobs/actors",
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

function mockLlmsDependencies() {
  const listBackendSitemapCareerJobPaths = vi.fn(async () => [
    ...VALID_CAREER_JOB_PATHS,
    ...EXCLUDED_CAREER_JOB_PATHS,
    "/en/career/jobs",
    "/zh/career/jobs",
    "/en/career/jobs/accountants-and-auditors?utm_source=test",
    "/en/result/private-attempt",
  ]);

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/backendSitemapSource", () => ({
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
  }));
  vi.doMock("@/lib/cms/career-guides", () => ({
    listCareerGuidesFromCms: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/cms/content-pages", () => ({
    listDiscoverableContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
  }));
  vi.doMock("@/lib/cms/personality", () => ({
    buildDefaultPublicPersonalitySlug: vi.fn(() => ""),
    listPersonalityProfiles: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/cms/topics", () => ({
    listTopics: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
    listBackendDiscoverabilityTestEntries: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/foundation/dailyGivingSeo", () => ({
    listDailyGivingDiscoverabilityEntries: vi.fn(async () => []),
  }));

  return { listBackendSitemapCareerJobPaths };
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CAREER-LLMS-TXT-DIRECTORY-URL-EXPOSURE-REPAIR-01", () => {
  it("keeps llms.txt career detail URLs on backend sitemap authority without exposing held or private paths", async () => {
    const { listBackendSitemapCareerJobPaths } = mockLlmsDependencies();
    const { GET } = await import("@/app/llms.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(listBackendSitemapCareerJobPaths).toHaveBeenCalledWith(
      expect.objectContaining({ limit: LLMS_ROUTE_LIMITS.careerJobs })
    );
    for (const path of VALID_CAREER_JOB_PATHS) {
      expect(text).toContain(`${SITE_URL}${path}`);
    }
    for (const path of EXCLUDED_CAREER_JOB_PATHS) {
      expect(text).not.toContain(`${SITE_URL}${path}`);
    }
    expect(text).not.toContain(`${SITE_URL}/en/career/jobs/accountants-and-auditors?utm_source=test`);
    expect(text).not.toContain(`${SITE_URL}/en/result/private-attempt`);
  });
});
