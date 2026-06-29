import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const SITE_URL = "https://fermatmind.com";
const MBTI_BASE_TYPES = [
  "intj",
  "intp",
  "entj",
  "entp",
  "infj",
  "infp",
  "enfj",
  "enfp",
  "istj",
  "isfj",
  "estj",
  "esfj",
  "istp",
  "isfp",
  "estp",
  "esfp",
] as const;
const PILOT_PATHS = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
] as const;
const FRESH_AGENT_PATHS = [
  "/zh/personality/esfj-a",
  "/zh/personality/intp-a",
  "/zh/personality/istp-a",
] as const;
const REQUIRED_MBTI64_PATHS = [...PILOT_PATHS, ...FRESH_AGENT_PATHS] as const;
const CORE_ASSESSMENT_TEST_PATHS = [
  "/en/tests/mbti-personality-test-16-personality-types",
  "/zh/tests/mbti-personality-test-16-personality-types",
  "/en/tests/big-five-personality-test-ocean-model",
  "/zh/tests/big-five-personality-test-ocean-model",
  "/en/tests/enneagram-personality-test-nine-types",
  "/zh/tests/enneagram-personality-test-nine-types",
  "/en/tests/holland-career-interest-test-riasec",
  "/zh/tests/holland-career-interest-test-riasec",
  "/en/tests/eq-test-emotional-intelligence-assessment",
  "/zh/tests/eq-test-emotional-intelligence-assessment",
] as const;
const IQ_ASSESSMENT_TEST_PATHS = [
  "/en/tests/iq-test-intelligence-quotient-assessment",
  "/zh/tests/iq-test-intelligence-quotient-assessment",
] as const;

type TestLocale = "en" | "zh";

function personalitySummary({
  locale,
  base,
  variant,
}: {
  locale: TestLocale;
  base: string;
  variant?: "a" | "t";
}) {
  const runtimeSlug = variant ? `${base}-${variant}` : base;

  return {
    id: null,
    variantId: variant ? Number(`${MBTI_BASE_TYPES.indexOf(base as (typeof MBTI_BASE_TYPES)[number]) + 1}${variant === "a" ? 1 : 2}`) : null,
    profileId: MBTI_BASE_TYPES.indexOf(base as (typeof MBTI_BASE_TYPES)[number]) + 1,
    orgId: 0,
    scaleCode: "MBTI",
    typeCode: runtimeSlug.toUpperCase(),
    baseTypeCode: base.toUpperCase(),
    runtimeTypeCode: variant ? runtimeSlug.toUpperCase() : null,
    variantCode: variant?.toUpperCase() ?? null,
    displayType: runtimeSlug.toUpperCase(),
    publicRouteSlug: runtimeSlug,
    publicRouteType: variant ? "variant" : "base",
    slug: runtimeSlug,
    baseSlug: base,
    locale,
    title: `${runtimeSlug.toUpperCase()} profile`,
    subtitle: "",
    excerpt: `${runtimeSlug.toUpperCase()} public summary.`,
    heroImageUrl: null,
    status: "published",
    isPublic: true,
    isIndexable: true,
    publishedAt: "2026-06-19T00:00:00Z",
    updatedAt: "2026-06-19T00:00:00Z",
    seoMeta: null,
  };
}

function mockLlmsFullMbti64Dependencies(options: { personalityDelayMs?: number } = {}) {
  vi.resetModules();
  const personalityDelayMs = options.personalityDelayMs ?? 0;

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/indexingPolicy", () => ({
    shouldIncludeInSitemap: vi.fn((path: string) =>
      !/\/(?:take|result|results|orders|share|api|pay|payment|history|private|account)(?:\/|$)/i.test(String(path))
    ),
  }));
  vi.doMock("@/lib/cms/personality", () => ({
    buildDefaultPublicPersonalitySlug: vi.fn((value: string) => `${String(value).toLowerCase()}-a`),
    listPersonalityProfiles: vi.fn(async (params: { locale: TestLocale; includeVariants?: boolean }) => {
      if (personalityDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, personalityDelayMs));
      }

      return {
        items: params.includeVariants
          ? MBTI_BASE_TYPES.flatMap((base) => [
              personalitySummary({ locale: params.locale, base, variant: "a" }),
              personalitySummary({ locale: params.locale, base, variant: "t" }),
            ])
          : MBTI_BASE_TYPES.map((base) => personalitySummary({ locale: params.locale, base })),
        landingSurface: null,
        pagination: {
          currentPage: 1,
          perPage: params.includeVariants ? 32 : 16,
          total: params.includeVariants ? 32 : 16,
          lastPage: 1,
        },
      };
    }),
    getPersonalityComparisonBySlug: vi.fn(async (slug: string) => ({
      title: `${slug.toUpperCase()} comparison`,
      description: `${slug.toUpperCase()} comparison summary.`,
      answerSurface: null,
      landingSurface: null,
    })),
    getPersonalityProjectionDetailBySlugOrType: vi.fn(async (slug: string) => ({
      answerSurface: null,
      landingSurface: null,
      profile: { title: `${slug.toUpperCase()} profile` },
    })),
  }));
  vi.doMock("@/lib/cms/articles", () => ({
    listCmsArticlesForLlmsWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: null })),
  }));
  vi.doMock("@/lib/cms/career-guides", () => ({
    listCareerGuidesFromCms: vi.fn(async () => []),
    getCareerGuideFromCmsBySlug: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
    fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
    adaptCareerRecommendationIndex: vi.fn(() => []),
  }));
  vi.doMock("@/lib/seo/backendSitemapSource", () => ({
    listBackendSitemapCareerJobPaths: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
    listBackendDiscoverabilityTestEntries: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/cms/content-pages", () => ({
    listDiscoverableContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
  }));
  vi.doMock("@/lib/cms/topics", () => ({
    listTopics: vi.fn(async () => ({ items: [] })),
    getTopicBySlug: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/foundation/dailyGivingSeo", () => ({
    listDailyGivingDiscoverabilityEntries: vi.fn(async () => []),
  }));
}

function extractPersonalityUrls(text: string): string[] {
  const personalityUrlPattern = /^https:\/\/fermatmind\.com\/(?:en|zh)\/personality\/[a-z0-9-]+$/;

  return text
    .split(/\s+/)
    .map((token) => token.replace(/^[[(<]+|[)\]>,.;:]+$/g, ""))
    .filter((token) => personalityUrlPattern.test(token));
}

function changedFiles(): string[] {
  const files = new Set<string>();

  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI checkouts expose different diff bases.
    }
  }

  return [...files].sort();
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_PERSONALITY_COHORT;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT;
});

function minimalLlmsFullText(urls: string[]): string {
  return [
    "# FermatMind llms-full.txt",
    "Generated-At: 2026-06-19T00:00:00.000Z",
    `Site: ${SITE_URL}`,
    "",
    ...urls.map((url) => `- URL: ${url}`),
  ].join("\n");
}

function completeMbti64Urls(): string[] {
  return ["en", "zh"].flatMap((locale) => [
    ...MBTI_BASE_TYPES.flatMap((base) => [
      `${SITE_URL}/${locale}/personality/${base}-a`,
      `${SITE_URL}/${locale}/personality/${base}-t`,
    ]),
    ...MBTI_BASE_TYPES.map((base) => `${SITE_URL}/${locale}/personality/${base}-a-vs-${base}-t`),
  ]);
}

describe("MBTI64-LLMS-FULL-PILOT-EXPOSURE-REPAIR-02", () => {
  it("keeps the 8 pilot URLs in the llms-full MBTI64 personality cohort", async () => {
    mockLlmsFullMbti64Dependencies();

    const { buildLlmsFullText } = await import("@/app/llms-full.txt/route");
    const text = await buildLlmsFullText(SITE_URL);
    const personalityUrls = new Set(extractPersonalityUrls(text));

    for (const path of REQUIRED_MBTI64_PATHS) {
      expect(text).toContain(`${SITE_URL}${path}`);
    }

    expect(personalityUrls.size).toBe(96);
    expect([...personalityUrls].filter((url) => /\/personality\/[a-z]{4}-[at]$/.test(url)).length).toBe(64);
    expect([...personalityUrls].filter((url) => /-a-vs-[a-z]{4}-t$/.test(url)).length).toBe(32);
  });

  it("keeps the MBTI64 cohort when personality API latency exceeds the default source budget", async () => {
    mockLlmsFullMbti64Dependencies({ personalityDelayMs: 1_650 });

    const startedAt = Date.now();
    const { buildLlmsFullText } = await import("@/app/llms-full.txt/route");
    const text = await buildLlmsFullText(SITE_URL);
    const personalityUrls = new Set(extractPersonalityUrls(text));

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1_500);
    for (const path of REQUIRED_MBTI64_PATHS) {
      expect(text).toContain(`${SITE_URL}${path}`);
    }
    expect(personalityUrls.size).toBe(96);
  });

  it("keeps fresh query-backed MBTI64 URLs in the degraded llms-full response when the complete artifact is not ready", async () => {
    mockLlmsFullMbti64Dependencies();

    const { buildDegradedLlmsFullText } = await import("@/app/llms-full.txt/route");
    const text = await buildDegradedLlmsFullText(SITE_URL);
    const personalityUrls = new Set(extractPersonalityUrls(text));

    expect(text).toContain("Mode: degraded");
    for (const path of REQUIRED_MBTI64_PATHS) {
      expect(text).toContain(`${SITE_URL}${path}`);
    }
    expect(personalityUrls.size).toBe(96);
  });

  it("does not treat an incomplete MBTI64 personality cohort as a complete llms-full cache artifact", async () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_PERSONALITY_COHORT = "true";
    const { isCompleteLlmsFullText } = await import("@/app/llms-full.txt/route");
    const incomplete = minimalLlmsFullText([
      `${SITE_URL}/en/personality`,
      `${SITE_URL}/zh/personality`,
      `${SITE_URL}/en/career/jobs/accountants-and-auditors`,
      `${SITE_URL}/zh/career/jobs/accountants-and-auditors`,
    ]);

    expect(isCompleteLlmsFullText(incomplete, SITE_URL)).toBe(false);
  });

  it("allows a complete MBTI64 personality cohort to pass llms-full cacheability without the career cohort in tests", async () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_PERSONALITY_COHORT = "true";
    const { isCompleteLlmsFullText } = await import("@/app/llms-full.txt/route");
    const complete = minimalLlmsFullText(completeMbti64Urls());

    expect(isCompleteLlmsFullText(complete, SITE_URL)).toBe(true);
  });

  it("does not let an IQ llms-full hold block complete MBTI64 personality cacheability", async () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_PERSONALITY_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    const { isCompleteLlmsFullText } = await import("@/app/llms-full.txt/route");
    const completeWithoutIq = minimalLlmsFullText([
      ...completeMbti64Urls(),
      ...CORE_ASSESSMENT_TEST_PATHS.map((path) => `${SITE_URL}${path}`),
    ]);

    expect(isCompleteLlmsFullText(completeWithoutIq, SITE_URL)).toBe(true);
  });

  it("can require IQ llms-full membership when that authority gate is explicitly enabled", async () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_PERSONALITY_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT = "true";
    const { isCompleteLlmsFullText } = await import("@/app/llms-full.txt/route");
    const completeWithoutIq = minimalLlmsFullText([
      ...completeMbti64Urls(),
      ...CORE_ASSESSMENT_TEST_PATHS.map((path) => `${SITE_URL}${path}`),
    ]);
    const completeWithIq = minimalLlmsFullText([
      ...completeMbti64Urls(),
      ...CORE_ASSESSMENT_TEST_PATHS.map((path) => `${SITE_URL}${path}`),
      ...IQ_ASSESSMENT_TEST_PATHS.map((path) => `${SITE_URL}${path}`),
    ]);

    expect(isCompleteLlmsFullText(completeWithoutIq, SITE_URL)).toBe(false);
    expect(isCompleteLlmsFullText(completeWithIq, SITE_URL)).toBe(true);
  });

  it("keeps private route families out of the generated llms-full cohort", async () => {
    mockLlmsFullMbti64Dependencies();

    const { buildLlmsFullText } = await import("@/app/llms-full.txt/route");
    const text = await buildLlmsFullText(SITE_URL);

    for (const forbidden of [
      "/result",
      "/results",
      "/orders",
      "/share/",
      "/pay",
      "/payment",
      "/history",
      "/private",
      "/account",
      "token=",
      "session=",
      "result_id=",
      "order_no=",
    ]) {
      expect(text).not.toContain(forbidden);
    }
  });

  it("keeps the current PR scoped to llms-full pilot exposure repair files", () => {
    const outsideScope = changedFiles().filter((file) => !isCurrentRiasecPack12AllowedFile(file));

    expect(outsideScope).toEqual([]);
  });
});
