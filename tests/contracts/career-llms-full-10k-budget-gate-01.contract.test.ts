import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LLMS_ROUTE_LIMITS } from "@/lib/seo/llmsRouteBudget";

const SITE_URL = "https://fermatmind.com";
const EXCLUDED_SLUGS = [
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function careerPathsFor(slugs: string[]): string[] {
  return slugs.flatMap((slug) => [`/en/career/jobs/${slug}`, `/zh/career/jobs/${slug}`]);
}

function syntheticTenKCareerPaths(): string[] {
  const slugs = Array.from({ length: 10_000 }, (_, index) => `ten-k-budget-career-${String(index + 1).padStart(5, "0")}`);

  return careerPathsFor(slugs);
}

function careerUrlCount(text: string): number {
  return new Set(text.match(/^- URL: https:\/\/fermatmind\.com\/(?:en|zh)\/career\/jobs\/[a-z0-9-]+$/gm) ?? []).size;
}

function mockLlmsFullDependencies(paths: () => string[]) {
  const listBackendSitemapCareerJobPaths = vi.fn(async (options?: { limit?: number }) => {
    const limit = typeof options?.limit === "number" ? options.limit : paths().length;

    return paths().slice(0, limit);
  });

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/stagingDiscoverability", () => ({
    createConfiguredStagingLlmsResponse: vi.fn(() => new Response("staging", { status: 410 })),
    isConfiguredStagingDiscoverability: vi.fn(() => false),
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
  vi.doMock("@/lib/foundation/dailyGivingSeo", () => ({
    listDailyGivingDiscoverabilityEntries: vi.fn(async () => []),
  }));

  return { listBackendSitemapCareerJobPaths };
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete process.env.FERMATMIND_LLMS_FULL_CACHE_DIR;
  delete process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT;
});

describe("CAREER-LLMS-FULL-10K-BUDGET-GATE-01", () => {
  it("keeps llms-full artifact generation bounded for a synthetic 10k career URL authority set", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-10k-budget-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "false";

    const syntheticPaths = syntheticTenKCareerPaths();
    const { listBackendSitemapCareerJobPaths } = mockLlmsFullDependencies(() => syntheticPaths);
    const { GET } = await import("@/app/llms-full.txt/route");

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(response.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("generated");
    expect(listBackendSitemapCareerJobPaths).toHaveBeenCalledTimes(1);
    expect(listBackendSitemapCareerJobPaths.mock.calls[0]?.[0]).toMatchObject({
      limit: LLMS_ROUTE_LIMITS.careerJobs,
    });
    expect(LLMS_ROUTE_LIMITS.careerJobs).toBeLessThan(20_000);
    expect(careerUrlCount(text)).toBe(LLMS_ROUTE_LIMITS.careerJobs);
    expect(careerUrlCount(text)).toBeLessThan(syntheticPaths.length);
    expect(text).toContain(`${SITE_URL}/sitemap.xml`);
    for (const slug of EXCLUDED_SLUGS) {
      expect(text).not.toContain(`${SITE_URL}/en/career/jobs/${slug}`);
      expect(text).not.toContain(`${SITE_URL}/zh/career/jobs/${slug}`);
    }
  });

  it("returns a degraded 200 response instead of timing out when no complete artifact is available", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-10k-degraded-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";

    mockLlmsFullDependencies(() => []);
    const { GET } = await import("@/app/llms-full.txt/route");

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("degraded");
    expect(text).toContain("Mode: degraded");
    expect(careerUrlCount(text)).toBe(0);
  });

  it("keeps llms-full source free of full jobs index and per-detail SEO fanout", () => {
    const route = read("app/llms-full.txt/route.ts");
    const sitemapSource = read("lib/seo/backendSitemapSource.ts");

    expect(route).toContain("getCachedLlmsFullText");
    expect(route).toContain("getOrStartLlmsFullBuild");
    expect(route).toContain("buildDegradedLlmsFullText");
    expect(route).toContain("listBackendSitemapCareerJobPaths({ limit: LLMS_ROUTE_LIMITS.careerJobs, signal })");
    expect(route).not.toContain("fetchCareerJobIndex");
    expect(route).not.toContain("fetchCareerJobSeoAuthority");
    expect(sitemapSource).not.toContain("/v0.5/career/jobs?");
    expect(sitemapSource).not.toContain("/v0.5/career-jobs/");
  });
});
