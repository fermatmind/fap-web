import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const SITE_URL = "https://fermatmind.com";
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

type ParityPolicy = {
  version: string;
  approved_intentional_differences: {
    approved_canonical_urls_only_in_llms: string[];
    approved_canonical_urls_only_in_llms_full: string[];
  };
  route_family_policy: {
    denied_route_families: string[];
  };
};

function readPolicy(): ParityPolicy {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, "tests/contracts/fixtures/url-truth/llms-parity-policy.v1.json"), "utf8")
  ) as ParityPolicy;
}

function normalizeCanonicalUrl(value: string): string {
  const url = new URL(value, SITE_URL);
  url.hash = "";
  url.search = "";
  const normalized = url.toString();
  return normalized.endsWith("/") && url.pathname !== "/" ? normalized.slice(0, -1) : normalized;
}

function isSiteCanonicalUrl(value: string): boolean {
  try {
    return new URL(value).origin === SITE_URL;
  } catch {
    return false;
  }
}

function extractCanonicalUrls(text: string): string[] {
  return [...text.matchAll(/https?:\/\/[^\s<>'"`]+/g)]
    .map((match) => normalizeCanonicalUrl(match[0].replace(/[),.;]+$/, "")))
    .filter(isSiteCanonicalUrl);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function pathForUrl(value: string): string {
  return new URL(value).pathname;
}

function classifyRouteFamily(pathname: string): string {
  if (pathname === "/sitemap.xml") return "sitemap";
  if (pathname === "/" || pathname === "/en" || pathname === "/zh") return "home";
  if (/^\/(?:en|zh)\/(?:personality|topics|support|career)$/i.test(pathname)) return "primary_page";
  if (/^\/(?:en|zh)\/personality\/[^/]+$/i.test(pathname)) return "personality_detail";
  if (/^\/(?:en|zh)\/topics\/[^/]+$/i.test(pathname)) return "topic_detail";
  if (/^\/(?:en|zh)\/tests\/[^/]+$/i.test(pathname)) return "test_detail";
  if (/^\/(?:en|zh)\/articles\/[^/]+$/i.test(pathname)) return "article_detail";
  if (/^\/(?:en|zh)\/career\/guides$/i.test(pathname)) return "career_guides_index";
  if (/^\/(?:en|zh)\/career\/industries\/[^/]+$/i.test(pathname)) return "career_industry";
  if (/^\/(?:en|zh)\/career\/family\/[^/]+$/i.test(pathname)) return "career_family";
  if (/^\/(?:en|zh)\/career$/i.test(pathname)) return "career_index";
  if (/\/take(?:\/|$)/i.test(pathname)) return "take_flow";
  if (/^\/(?:en|zh)?\/?result(?:\/|$)/i.test(pathname)) return "result";
  if (/^\/(?:en|zh)?\/?orders(?:\/|$)/i.test(pathname)) return "order";
  if (/^\/(?:en|zh)?\/?share(?:\/|$)/i.test(pathname)) return "share";
  if (/^\/api(?:\/|$)/i.test(pathname)) return "api";
  if (/^\/(?:pay|payment)(?:\/|$)/i.test(pathname)) return "payment";
  return "unknown";
}

function mockLlmsDependencies() {
  vi.resetModules();

  const pageTwoZhArticle = {
    slug: "big-five-tool-guide",
    locale: "zh",
    title: "大五人格测试是什么？OCEAN 五大特质比 MBTI 更适合回答什么",
    excerpt: "大五人格测试基于 OCEAN 五个连续特质维度。",
    href: "/zh/articles/big-five-tool-guide",
    isIndexable: true,
    llmsEligible: true,
    updatedAt: "2026-06-13T17:55:28Z",
  };
  const articleEnumerationCalls: Array<{ locale: "en" | "zh"; maxPages?: number }> = [];

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/indexingPolicy", () => ({
    shouldIncludeInSitemap: vi.fn((value: string) => {
      const path = String(value);
      return !/\/(?:take|result|orders|share|api|pay|payment|history)(?:\/|$)/i.test(path) &&
        !path.includes("/career/jobs");
    }),
  }));
  vi.doMock("@/lib/career/datasetDirectory", () => ({
    CAREER_DATASET_FAMILY_SLUGS: ["business-and-financial"],
  }));
  vi.doMock("@/lib/career/urls", () => ({
    buildCareerFamilyFrontendUrl: vi.fn((locale: string, slug: string) => `/${locale}/career/family/${slug}`),
  }));
  vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
    fetchCareerFamilyHub: vi.fn(async ({ locale, slug }: { locale: "en" | "zh"; slug: string }) => ({
      family: {
        canonical_slug: slug,
        canonicalSlug: slug,
        title: locale === "zh" ? "商业与金融" : "Business and financial",
        summary: "Career family summary.",
      },
      counts: { visible_children_count: 3, visibleChildrenCount: 3 },
    })),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerFamilyHub", () => ({
    adaptCareerFamilyHub: vi.fn(({ locale, payload }: { locale: "en" | "zh"; payload: unknown }) => {
      if (!payload || typeof payload !== "object") return null;
      return {
        family: {
          canonicalSlug: "business-and-financial",
          title: locale === "zh" ? "商业与金融" : "Business and financial",
          summary: "Career family summary.",
        },
        counts: { visibleChildrenCount: 3 },
      };
    }),
  }));
  vi.doMock("@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest", () => ({
    fetchCareerFirstWaveDiscoverabilityManifest: vi.fn(async () => ({
      routes: [{ routeKind: "career_family_hub", canonicalSlug: "business-and-financial" }],
      discoverableFamilyHubSlugs: ["business-and-financial"],
    })),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerFirstWaveDiscoverabilityManifest", () => ({
    adaptCareerFirstWaveDiscoverabilityManifest: vi.fn(() => ({
      routes: [{ routeKind: "career_family_hub", canonicalSlug: "business-and-financial" }],
      discoverableFamilyHubSlugs: ["business-and-financial"],
    })),
  }));
  vi.doMock("@/lib/career/launchPolicy", () => ({
    isCareerFamilyHubDiscoverableByManifest: vi.fn(() => true),
  }));
  vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
    fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
    adaptCareerRecommendationIndex: vi.fn(() => []),
  }));
  vi.doMock("@/lib/seo/backendSitemapSource", () => ({
    listBackendSitemapMbtiPersonalityPaths: vi.fn(async () => []),
    listBackendSitemapBigFiveZhPaths: vi.fn(async () => []),
    listBackendSitemapCareerJobPaths: vi.fn(async () => ["/en/career/jobs/private-denied-by-policy"]),
  }));
  vi.doMock("@/lib/seo/backendSitemapMbtiAuthorityCache", () => ({
    readMbtiAuthorityLastKnownGood: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/seo/enneagramLlmsSource", () => ({
    listEnneagramLlmsPaths: vi.fn(async () => []),
    listEnneagramLlmsFullEntries: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/foundation/dailyGivingSeo", () => ({
    listDailyGivingDiscoverabilityEntries: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/seo/llmsFullResponseCache", () => ({
    getCachedLlmsFullText: vi.fn(async () => null),
    getOrStartLlmsFullBuild: vi.fn(async (_siteUrl: string, build: (siteUrl: string) => Promise<string | null>) =>
      build(SITE_URL)
    ),
    writeLlmsFullResponseCache: vi.fn(async () => ({ cached: false, cachePath: "" })),
  }));
  vi.doMock("@/lib/cms/articles", () => ({
    listCmsArticlesForLlmsWithLastKnownGood: vi.fn(
      async ({ locale, maxPages }: { locale: "en" | "zh"; maxPages?: number }) => {
        articleEnumerationCalls.push({ locale, maxPages });

        return {
          value:
            locale === "en"
              ? [
                  {
                    slug: "mbti-basics",
                    locale: "en",
                    title: "MBTI Basics",
                    excerpt: "Article summary.",
                    href: "/en/articles/mbti-basics",
                    isIndexable: true,
                    updatedAt: "2026-05-01T00:00:00Z",
                  },
                ]
              : maxPages && maxPages > 1
                ? [pageTwoZhArticle]
                : [],
        };
      }
    ),
    getCmsArticleWithLastKnownGood: vi.fn(async () => ({
      value: {
        slug: "mbti-basics",
        title: "MBTI Basics",
        answerSurface: {
          summaryBlocks: [{ key: "summary", title: "", body: "Article evidence summary.", href: null, kind: null }],
          faqBlocks: [{ key: "faq-1", question: "What is MBTI?", answer: "A personality framework." }],
          nextStepBlocks: [
            {
              key: "next-1",
              title: "Take MBTI",
              body: "",
              href: "/en/tests/mbti-personality-test-16-personality-types",
              kind: null,
            },
            {
              key: "private-take",
              title: "Private take",
              body: "",
              href: "/en/tests/mbti-personality-test-16-personality-types/take",
              kind: null,
            },
          ],
        },
        landingSurface: null,
      },
    })),
    __articleEnumerationCalls: articleEnumerationCalls,
  }));
  vi.doMock("@/lib/cms/career-guides", () => ({
    listCareerGuidesFromCms: vi.fn(async (locale: "en" | "zh") =>
      locale === "en"
        ? [
            {
              slug: "career-planning",
              href: "/en/career/guides/career-planning",
              title: "Career Planning",
              isIndexable: true,
              updatedAt: "2026-05-02T00:00:00Z",
            },
          ]
        : []
    ),
    getCareerGuideFromCmsBySlug: vi.fn(async () => ({ answerSurface: null, landingSurface: null })),
  }));
  vi.doMock("@/lib/cms/content-pages", () => ({
    listDiscoverableContentPagesWithLastKnownGood: vi.fn(async (locale: "en" | "zh") => ({
      value: locale === "en" ? [{ path: "/support", title: "Support", summary: "Support summary.", kind: "help" }] : [],
    })),
    listContentPagesWithLastKnownGood: vi.fn(async (locale: "en" | "zh") => ({
      value: locale === "en" ? [{ path: "/support", title: "Support", summary: "Support summary." }] : [],
    })),
    listApprovedEnglishContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
  }));
  vi.doMock("@/lib/cms/personality", () => ({
    buildDefaultPublicPersonalitySlug: vi.fn((value: string) => `${String(value).toLowerCase()}-a`),
    listPersonalityProfiles: vi.fn(async ({ locale }: { locale: "en" | "zh" }) => ({
      items:
        locale === "en"
          ? [{ typeCode: "INFJ", slug: "infj-a", title: "INFJ", summary: "INFJ summary.", isIndexable: true }]
          : [],
    })),
    listPersonalityComparisons: vi.fn(async (input: { locale: "en" | "zh" } | "en" | "zh") => {
      const normalizedLocale = typeof input === "string" ? input : input.locale;
      return {
        groups: normalizedLocale === "en"
          ? [
              {
                key: "at_comparisons",
                items: [
                  {
                    slug: "infj-a-vs-infj-t",
                    href: "/en/personality/infj-a-vs-infj-t",
                    title: "INFJ-A vs INFJ-T",
                    description: "INFJ comparison.",
                    summary: "INFJ comparison.",
                    isPublic: true,
                    isIndexable: true,
                  },
                  {
                    slug: "intj-vs-intp",
                    href: "/en/personality/intj-vs-intp",
                    title: "INTJ vs INTP",
                    description: "Draft cross-type comparison.",
                    summary: "Draft cross-type comparison.",
                    isPublic: true,
                    isIndexable: false,
                  },
                ],
              },
            ]
          : [],
      };
    }),
    getPersonalityComparisonBySlug: vi.fn(async () => ({ answerSurface: null, landingSurface: null })),
    getPersonalityProjectionDetailBySlugOrType: vi.fn(async () => ({ answerSurface: null, landingSurface: null })),
  }));
  vi.doMock("@/lib/cms/topics", () => ({
    listTopics: vi.fn(async ({ locale }: { locale: "en" | "zh" }) => ({
      items: locale === "en" ? [{ slug: "mbti", title: "MBTI", summary: "MBTI topic.", isIndexable: true }] : [],
    })),
    getTopicBySlug: vi.fn(async () => ({ answerSurface: null, landingSurface: null })),
  }));
  vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
    listBackendDiscoverabilityTestEntries: vi.fn(async () =>
      SIX_ASSESSMENT_TEST_PATHS.map((path) => {
        const [, locale, , slug] = path.split("/");
        return {
          locale,
          slug,
          path,
          title: `${slug} test`,
          description: `${slug} summary.`,
          scaleCode: slug,
          highlightExcerptI18n: {},
          llmsFullEligible: true,
        };
      })
    ),
  }));

  return { articleEnumerationCalls };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("llms parity governance", () => {
  it("keeps llms.txt and llms-full.txt unique canonical URL sets in parity", async () => {
    mockLlmsDependencies();
    const policy = readPolicy();

    const [{ GET: getLlms }, { GET: getLlmsFull }] = await Promise.all([
      import("@/app/llms.txt/route"),
      import("@/app/llms-full.txt/route"),
    ]);
    const [llmsText, llmsFullText] = await Promise.all([
      getLlms().then((response) => response.text()),
      getLlmsFull().then((response) => response.text()),
    ]);

    const llmsUrls = uniqueSorted(extractCanonicalUrls(llmsText));
    const llmsFullUrls = uniqueSorted(extractCanonicalUrls(llmsFullText));
    const approvedOnlyInLlms = new Set(policy.approved_intentional_differences.approved_canonical_urls_only_in_llms);
    const approvedOnlyInLlmsFull = new Set(policy.approved_intentional_differences.approved_canonical_urls_only_in_llms_full);
    const onlyInLlms = llmsUrls.filter((url) => !llmsFullUrls.includes(url) && !approvedOnlyInLlms.has(url));
    const onlyInLlmsFull = llmsFullUrls.filter((url) => !llmsUrls.includes(url) && !approvedOnlyInLlmsFull.has(url));

    expect(policy.version).toBe("url_truth.llms_parity_policy.v1");
    expect(onlyInLlms).toEqual([]);
    expect(onlyInLlmsFull).toEqual([]);
    expect(policy.approved_intentional_differences.approved_canonical_urls_only_in_llms).toEqual(
      expect.arrayContaining([
        "https://fermatmind.com/en/career/tests",
        "https://fermatmind.com/zh/career/tests",
        "https://fermatmind.com/zh/topics/mbti",
      ])
    );
    expect(extractCanonicalUrls(llmsFullText).length).toBeGreaterThan(llmsFullUrls.length);
  });

  it("includes eligible CMS articles beyond the first article list page in both llms surfaces", async () => {
    const { articleEnumerationCalls } = mockLlmsDependencies();

    const [{ GET: getLlms }, { buildLlmsFullText }] = await Promise.all([
      import("@/app/llms.txt/route"),
      import("@/app/llms-full.txt/route"),
    ]);
    const [llmsText, llmsFullText] = await Promise.all([
      getLlms().then((response) => response.text()),
      buildLlmsFullText(SITE_URL),
    ]);

    const zhArticleCalls = articleEnumerationCalls.filter((call) => call.locale === "zh");
    expect(zhArticleCalls.length).toBeGreaterThan(0);
    expect(zhArticleCalls.every((call) => (call.maxPages ?? 0) > 1)).toBe(true);
    expect(llmsText).toContain(`${SITE_URL}/zh/articles/big-five-tool-guide`);
    expect(llmsFullText).toContain(`${SITE_URL}/zh/articles/big-five-tool-guide`);
  });

  it("keeps private and denied route families out of both llms surfaces", async () => {
    mockLlmsDependencies();
    const policy = readPolicy();

    const [{ GET: getLlms }, { GET: getLlmsFull }] = await Promise.all([
      import("@/app/llms.txt/route"),
      import("@/app/llms-full.txt/route"),
    ]);
    const [llmsText, llmsFullText] = await Promise.all([
      getLlms().then((response) => response.text()),
      getLlmsFull().then((response) => response.text()),
    ]);
    const deniedFamilies = new Set(policy.route_family_policy.denied_route_families);

    for (const text of [llmsText, llmsFullText]) {
      const urls = uniqueSorted(extractCanonicalUrls(text));
      const families = urls.map((url) => classifyRouteFamily(pathForUrl(url)));

      expect(families.filter((family) => deniedFamilies.has(family))).toEqual([]);
      expect(text).not.toContain("/take");
      expect(text).not.toContain("/result/");
      expect(text).not.toContain("/orders/");
      expect(text).not.toContain("/share/");
      expect(text).not.toContain("/api/");
      expect(text).not.toContain("/pay");
      expect(text).not.toContain("/payment");
      expect(text).not.toContain("/history");
      expect(text).not.toContain("/career/jobs");
      expect(text).not.toContain("/career/industries");
    }
  });
});
