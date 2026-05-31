import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const SITE_URL = "https://fermatmind.com";
const REQUIRED_SLUGS = [
  "accountants-and-auditors",
  "actors",
  "actuaries",
  "aerospace-engineers",
  "agricultural-and-food-scientists",
  "administrative-law-judges-adjudicators-and-hearing-officers",
  "acupuncturists",
  "acute-care-nurses",
];
const EXCLUDED_SLUGS = [
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
];

function careerPathsFor(slugs: string[]): string[] {
  return slugs.flatMap((slug) => [`/en/career/jobs/${slug}`, `/zh/career/jobs/${slug}`]);
}

function fullCohortPaths(): string[] {
  const fillerCount = 1046 - REQUIRED_SLUGS.length;
  const fillerSlugs = Array.from({ length: fillerCount }, (_, index) => `day1-cacheable-career-${index + 1}`);

  return careerPathsFor([...REQUIRED_SLUGS, ...fillerSlugs]);
}

function careerUrlCount(text: string): number {
  return new Set(text.match(/^- URL: https:\/\/fermatmind\.com\/(?:en|zh)\/career\/jobs\/[a-z0-9-]+$/gm) ?? []).size;
}

function mockLlmsFullDependencies(paths: () => string[]) {
  const listBackendSitemapCareerJobPaths = vi.fn(async () => paths());

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/stagingDiscoverability", () => ({
    createConfiguredStagingLlmsResponse: vi.fn(() => new Response("staging", { status: 410 })),
    isConfiguredStagingDiscoverability: vi.fn(() => false),
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
  delete process.env.FERMATMIND_LLMS_FULL_CACHE_DIR;
  delete process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT;
});

describe("DETAIL_READY_1046_LLMS_FULL_ARTIFACT_CONSISTENCY_REPAIR-01", () => {
  it("does not cache incomplete llms-full artifacts and returns the complete artifact on repeat reads", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-consistency-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    let currentPaths: string[] = [];
    mockLlmsFullDependencies(() => currentPaths);
    const { GET } = await import("@/app/llms-full.txt/route");

    const incompleteResponse = await GET();
    const incompleteText = await incompleteResponse.text();
    expect(incompleteResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("degraded");
    expect(careerUrlCount(incompleteText)).toBe(0);

    currentPaths = fullCohortPaths();
    const generatedResponse = await GET();
    const generatedText = await generatedResponse.text();
    expect(generatedResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("generated");
    expect(careerUrlCount(generatedText)).toBe(1046 * 2);

    currentPaths = [];
    const cachedResponse = await GET();
    const cachedText = await cachedResponse.text();
    expect(cachedResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("cache");
    expect(cachedText).toBe(generatedText);
    expect(careerUrlCount(cachedText)).toBe(1046 * 2);

    for (const slug of REQUIRED_SLUGS) {
      expect(cachedText).toContain(`${SITE_URL}/en/career/jobs/${slug}`);
      expect(cachedText).toContain(`${SITE_URL}/zh/career/jobs/${slug}`);
    }
    for (const slug of EXCLUDED_SLUGS) {
      expect(cachedText).not.toContain(`${SITE_URL}/en/career/jobs/${slug}`);
      expect(cachedText).not.toContain(`${SITE_URL}/zh/career/jobs/${slug}`);
    }
  });

  it("shares the last-known-good llms-full artifact across module instances", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-shared-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    let currentPaths = fullCohortPaths();
    mockLlmsFullDependencies(() => currentPaths);
    const firstModule = await import("@/app/llms-full.txt/route");
    const generatedText = await (await firstModule.GET()).text();
    expect(careerUrlCount(generatedText)).toBe(1046 * 2);

    vi.resetModules();
    currentPaths = [];
    mockLlmsFullDependencies(() => currentPaths);
    const secondModule = await import("@/app/llms-full.txt/route");
    const sharedResponse = await secondModule.GET();
    const sharedText = await sharedResponse.text();

    expect(sharedResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("cache");
    expect(sharedText).toBe(generatedText);
    expect(careerUrlCount(sharedText)).toBe(1046 * 2);
  });
});
