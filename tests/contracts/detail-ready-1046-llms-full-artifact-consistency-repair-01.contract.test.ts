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
const SIX_ASSESSMENT_TEST_PATHS = [
  "/en/tests/mbti-personality-test-16-personality-types",
  "/zh/tests/mbti-personality-test-16-personality-types",
  "/en/tests/big-five-personality-test-ocean-model",
  "/zh/tests/big-five-personality-test-ocean-model",
  "/en/tests/enneagram-personality-test-nine-types",
  "/zh/tests/enneagram-personality-test-nine-types",
  "/en/tests/holland-career-interest-test-riasec",
  "/zh/tests/holland-career-interest-test-riasec",
  "/en/tests/iq-test-intelligence-quotient-assessment",
  "/zh/tests/iq-test-intelligence-quotient-assessment",
  "/en/tests/eq-test-emotional-intelligence-assessment",
  "/zh/tests/eq-test-emotional-intelligence-assessment",
] as const;
const IQ_TEST_PATHS = SIX_ASSESSMENT_TEST_PATHS.filter((path) =>
  path.includes("/iq-test-intelligence-quotient-assessment")
);
const NON_IQ_TEST_PATHS = SIX_ASSESSMENT_TEST_PATHS.filter(
  (path) => !path.includes("/iq-test-intelligence-quotient-assessment")
);

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

type MockArticleEntry = {
  slug: string;
  locale: "en" | "zh";
  title: string;
  excerpt: string;
  href: string;
  isIndexable: boolean;
  llmsEligible?: boolean;
  updatedAt: string;
};

function mockLlmsFullDependencies(
  paths: () => string[],
  articles: { en?: MockArticleEntry[]; zh?: MockArticleEntry[] } = {},
  testPaths: () => readonly string[] = () => SIX_ASSESSMENT_TEST_PATHS
) {
  const listBackendSitemapCareerJobPaths = vi.fn(async () => paths());
  const listCmsArticlesForLlmsWithLastKnownGood = vi.fn(async ({ locale }: { locale: "en" | "zh" }) => ({
    value: locale === "zh" ? articles.zh ?? [] : articles.en ?? [],
  }));

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
    listCmsArticlesForLlmsWithLastKnownGood,
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
    listBackendDiscoverabilityTestEntries: vi.fn(async () =>
      testPaths().map((path) => {
        const [, locale, , slug] = path.split("/");
        return {
          locale,
          slug,
          path,
          title: slug,
          description: `${slug} test detail.`,
          scaleCode: slug,
          highlightExcerptI18n: {},
          llmsFullEligible: true,
        };
      })
    ),
  }));

  return { listBackendSitemapCareerJobPaths, listCmsArticlesForLlmsWithLastKnownGood };
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.FERMATMIND_LLMS_FULL_CACHE_DIR;
  delete process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT;
});

describe("DETAIL_READY_1046_LLMS_FULL_ARTIFACT_CONSISTENCY_REPAIR-01", () => {
  it("does not cache incomplete llms-full artifacts and returns the complete artifact on repeat reads", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-consistency-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    let currentPaths: string[] = [];
    mockLlmsFullDependencies(() => currentPaths);
    const { GET } = await import("@/app/llms-full.txt/route");

    const incompleteResponse = await GET();
    const incompleteText = await incompleteResponse.text();
    expect(incompleteResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("degraded");
    expect(careerUrlCount(incompleteText)).toBe(0);
    for (const testPath of SIX_ASSESSMENT_TEST_PATHS) {
      expect(incompleteText).toContain(`${SITE_URL}${testPath}`);
    }

    currentPaths = fullCohortPaths();
    const generatedResponse = await GET();
    const generatedText = await generatedResponse.text();
    expect(generatedResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(generatedResponse.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("generated");
    expect(careerUrlCount(generatedText)).toBe(1046 * 2);

    currentPaths = [];
    const cachedResponse = await GET();
    const cachedText = await cachedResponse.text();
    expect(cachedResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(cachedResponse.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("cache");
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
    for (const testPath of SIX_ASSESSMENT_TEST_PATHS) {
      expect(cachedText).toContain(`${SITE_URL}${testPath}`);
    }
  });

  it("does not cache otherwise complete artifacts when six assessment test routes are missing", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-missing-tests-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    mockLlmsFullDependencies(() => fullCohortPaths(), {}, () => []);
    const { GET } = await import("@/app/llms-full.txt/route");

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("degraded");
    expect(text).not.toContain(`${SITE_URL}${SIX_ASSESSMENT_TEST_PATHS[0]}`);
  });

  it("requires IQ test URLs once IQ llms-full authority is available", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-iq-required-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT = "true";
    mockLlmsFullDependencies(() => fullCohortPaths(), {}, () => NON_IQ_TEST_PATHS);
    const { GET } = await import("@/app/llms-full.txt/route");

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("degraded");
    for (const testPath of NON_IQ_TEST_PATHS) {
      expect(text).toContain(`${SITE_URL}${testPath}`);
    }
    for (const testPath of IQ_TEST_PATHS) {
      expect(text).not.toContain(`${SITE_URL}${testPath}`);
    }
  });

  it("shares the last-known-good llms-full artifact across module instances", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-shared-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
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

    expect(sharedResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(sharedResponse.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("cache");
    expect(sharedText).toBe(generatedText);
    expect(careerUrlCount(sharedText)).toBe(1046 * 2);
  });

  it("includes eligible published articles and excludes noindex, llms-disabled, and private article hrefs", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-articles-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    mockLlmsFullDependencies(() => fullCohortPaths(), {
      en: [
        {
          slug: "career-interest-test-vs-personality-test",
          locale: "en",
          title: "Career Interest Test vs Personality Test: Which Should You Take First?",
          excerpt: "Compare career interest and personality tests.",
          href: "/en/articles/career-interest-test-vs-personality-test",
          isIndexable: true,
          llmsEligible: true,
          updatedAt: "2026-06-12T14:04:34.000Z",
        },
        {
          slug: "draft-article",
          locale: "en",
          title: "Draft Article",
          excerpt: "Should not appear.",
          href: "/en/articles/draft-article",
          isIndexable: false,
          llmsEligible: true,
          updatedAt: "2026-06-12T14:04:34.000Z",
        },
        {
          slug: "llms-disabled-article",
          locale: "en",
          title: "LLMS Disabled Article",
          excerpt: "Should not appear.",
          href: "/en/articles/llms-disabled-article",
          isIndexable: true,
          llmsEligible: false,
          updatedAt: "2026-06-12T14:04:34.000Z",
        },
        {
          slug: "private-result-href",
          locale: "en",
          title: "Private Result Href",
          excerpt: "Should not appear.",
          href: "/en/result/private-result-href",
          isIndexable: true,
          llmsEligible: true,
          updatedAt: "2026-06-12T14:04:34.000Z",
        },
      ],
      zh: [
        {
          slug: "career-interest-vs-personality-test-differences",
          locale: "zh",
          title: "职业兴趣测试与性格测试的区别：选专业、找工作该先做哪个？",
          excerpt: "比较职业兴趣测试与性格测试。",
          href: "/zh/articles/career-interest-vs-personality-test-differences",
          isIndexable: true,
          llmsEligible: true,
          updatedAt: "2026-06-12T14:04:34.000Z",
        },
      ],
    });
    const { GET } = await import("@/app/llms-full.txt/route");

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(response.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("generated");
    expect(text).toContain(`${SITE_URL}/en/articles/career-interest-test-vs-personality-test`);
    expect(text).toContain(`${SITE_URL}/zh/articles/career-interest-vs-personality-test-differences`);
    expect(text).not.toContain("draft-article");
    expect(text).not.toContain("llms-disabled-article");
    expect(text).not.toContain("private-result-href");
    expect(text).not.toMatch(/\/(?:take|result|share|orders?|pay|payment)(?:\/|$)/i);
    expect(text).not.toContain("hreflang");
    expect(text).not.toContain("application/ld+json");
  });

  it("keeps newly eligible Chinese articles after the English article page fills the base limit", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "llms-full-article-locale-budget-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_CAREER_COHORT = "true";
    const enArticles = Array.from({ length: 40 }, (_, index) => ({
      slug: `english-seo-article-${index + 1}`,
      locale: "en" as const,
      title: `English SEO Article ${index + 1}`,
      excerpt: "English article summary.",
      href: `/en/articles/english-seo-article-${index + 1}`,
      isIndexable: true,
      llmsEligible: true,
      updatedAt: "2026-06-18T06:03:46.000Z",
    }));
    const targetArticle = {
      slug: "college-major-choice-holland-mbti-career-test",
      locale: "zh" as const,
      title: "高考志愿选专业：霍兰德、MBTI和职业兴趣测试怎么用",
      excerpt: "高考志愿填报前，如何用霍兰德职业兴趣测试、MBTI和现实验证辅助选专业？",
      href: "/zh/articles/college-major-choice-holland-mbti-career-test",
      isIndexable: true,
      llmsEligible: true,
      updatedAt: "2026-06-18T06:03:46.000Z",
    };
    mockLlmsFullDependencies(() => fullCohortPaths(), {
      en: enArticles,
      zh: [targetArticle],
    });
    const { GET } = await import("@/app/llms-full.txt/route");

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(text).toContain(`${SITE_URL}/en/articles/english-seo-article-40`);
    expect(text).toContain(`${SITE_URL}/zh/articles/college-major-choice-holland-mbti-career-test`);
  });
});
