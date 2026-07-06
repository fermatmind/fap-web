import { afterEach, describe, expect, it, vi } from "vitest";

const SITE_URL = "https://fermatmind.com";
const TARGET_SLUGS = ["brand", "charter", "foundation", "careers", "policies"] as const;
const SCIENCE_TARGET_SLUGS = [
  "science",
  "item-design-notes",
  "reliability-validity",
  "data-privacy",
  "common-misconceptions",
] as const;
const DISCOVERABLE_KEYS = [
  "about",
  "brand",
  "charter",
  "foundation",
  "careers",
  "policies",
  "privacy",
  "terms",
  "support",
  "method-boundaries",
  ...SCIENCE_TARGET_SLUGS,
  "help-faq",
  "help-contact",
] as const;
const TARGET_URLS = [...TARGET_SLUGS, ...SCIENCE_TARGET_SLUGS].map((slug) => `${SITE_URL}/en/${slug}`);

type ContentPageFixture = {
  slug: string;
  path: string;
  kind: "company" | "policy" | "help";
  title: string;
  kicker: string;
  summary: string;
  template: string;
  animationProfile: string;
  locale: "en" | "zh";
  publishedAt: string;
  updatedAt: string;
  effectiveAt: string | null;
  sourceDoc: string | null;
  isPublic: boolean;
  isIndexable: boolean;
  headings: string[];
  contentMd: string;
  contentHtml: string;
  seoTitle: string | null;
  metaDescription: string | null;
};

function contentPage(slug: string): ContentPageFixture {
  const isHelp = slug === "support" || slug.startsWith("help-");
  const isPolicy = slug === "policies" || slug === "privacy" || slug === "terms";

  return {
    slug,
    path: slug.startsWith("help-") ? `/help/${slug.slice(5)}` : `/${slug}`,
    kind: isHelp ? "help" : isPolicy ? "policy" : "company",
    title: `${slug} authority title`,
    kicker: isHelp ? "Help" : isPolicy ? "Terms & policies" : "Company",
    summary: `${slug} authority summary from public CMS detail API.`,
    template: isHelp ? "help" : isPolicy ? "policy" : slug,
    animationProfile: isPolicy ? "policy" : "editorial",
    locale: "en",
    publishedAt: "2026-05-28T00:00:00Z",
    updatedAt: "2026-05-28T00:00:00Z",
    effectiveAt: null,
    sourceDoc: null,
    isPublic: true,
    isIndexable: true,
    headings: [`${slug} heading`],
    contentMd: `## ${slug} heading\n\n${slug} body.`,
    contentHtml: `<h2>${slug} heading</h2><p>${slug} body.</p>`,
    seoTitle: `${slug} seo title`,
    metaDescription: `${slug} seo description`,
  };
}

function mockRouteDependencies() {
  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => SITE_URL),
    isConfiguredStagingSiteUrl: vi.fn(() => false),
  }));
  vi.doMock("@/lib/seo/indexingPolicy", () => ({
    shouldIncludeInSitemap: vi.fn((value: string) => {
      const path = String(value);
      return !/\/(?:take|result|orders|order|share|api|pay|payment|history)(?:\/|$)/i.test(path);
    }),
  }));
  vi.doMock("@/lib/cms/content-pages", () => ({
    listContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    listDiscoverableContentPagesWithLastKnownGood: vi.fn(async (locale: "en" | "zh") => ({
      value: [
        {
          path: "/support",
          title: "Support",
          summary: "Support should be included when public and indexable.",
          kind: "help",
          locale,
          isPublic: true,
          isIndexable: true,
        },
        ...(locale === "en" ? [...TARGET_SLUGS, ...SCIENCE_TARGET_SLUGS].map(contentPage) : []),
      ],
    })),
    listApprovedEnglishContentPagesWithLastKnownGood: vi.fn(async () => ({
      value: TARGET_SLUGS.map(contentPage),
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
  vi.doMock("@/lib/cms/personality", () => ({
    buildDefaultPublicPersonalitySlug: vi.fn(() => ""),
    listPersonalityProfiles: vi.fn(async () => ({ items: [] })),
    getPersonalityProjectionDetailBySlugOrType: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/cms/topics", () => ({
    listTopics: vi.fn(async () => ({ items: [] })),
    getTopicBySlug: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/seo/backendSitemapSource", () => ({
      listBackendSitemapBigFiveZhPaths: vi.fn(async () => []),
    listBackendSitemapCareerJobPaths: vi.fn(async () => []),
  }));
  vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
    listBackendDiscoverabilityTestEntries: vi.fn(async () => [
      {
        locale: "en",
        slug: "mbti-personality-test-16-personality-types",
        path: "/en/tests/mbti-personality-test-16-personality-types",
        title: "MBTI Test",
        description: "MBTI summary.",
        scaleCode: "MBTI_93",
        highlightExcerptI18n: {},
      },
      {
        locale: "en",
        slug: "clinical-depression-anxiety-assessment-professional-edition",
        path: "/en/tests/clinical-depression-anxiety-assessment-professional-edition",
        title: "Clinical Depression",
        description: "Must not be exposed.",
        scaleCode: "CLINICAL_DEPRESSION",
        highlightExcerptI18n: {},
      },
      {
        locale: "zh",
        slug: "depression-screening-test-standard-edition",
        path: "/zh/tests/depression-screening-test-standard-edition",
        title: "Depression Screening",
        description: "Must not be exposed.",
        scaleCode: "DEPRESSION_SCREENING",
        highlightExcerptI18n: {},
      },
      {
        locale: "en",
        slug: "private-take",
        path: "/en/tests/mbti-personality-test-16-personality-types/take",
        title: "Private take",
        description: "Must not be exposed.",
        scaleCode: "MBTI_93",
        highlightExcerptI18n: {},
      },
    ]),
  }));
}

async function renderLlmsRoutes(): Promise<{ llmsText: string; llmsFullText: string }> {
  mockRouteDependencies();

  const [{ GET: getLlms }, { GET: getLlmsFull }] = await Promise.all([
    import("@/app/llms.txt/route"),
    import("@/app/llms-full.txt/route"),
  ]);

  const [llmsText, llmsFullText] = await Promise.all([
    getLlms().then((response) => response.text()),
    getLlmsFull().then((response) => response.text()),
  ]);

  return { llmsText, llmsFullText };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("GLOBAL-EN-ZH-CONTENT-PAGES-LLMS-EXPOSURE-REPAIR-01", () => {
  it("loads the approved page set through public content-page detail authority", async () => {
    const get = vi.fn(async (url: string) => {
      expect(url).toContain("/v0.5/content-pages/");
      expect(url).not.toContain("/v0.5/internal/content-pages");

      const slug = decodeURIComponent(url.match(/\/content-pages\/([^?]+)/)?.[1] ?? "");
      expect(DISCOVERABLE_KEYS).toContain(slug as (typeof DISCOVERABLE_KEYS)[number]);

      return {
        page: {
          slug,
          path: slug.startsWith("help-") ? `/help/${slug.slice(5)}` : `/${slug}`,
          kind: slug === "support" || slug.startsWith("help-")
            ? "help"
            : ["policies", "privacy", "terms"].includes(slug)
              ? "policy"
              : "company",
          title: `${slug} authority title`,
          summary: `${slug} authority summary`,
          template: slug === "support" || slug.startsWith("help-")
            ? "help"
            : ["policies", "privacy", "terms"].includes(slug)
              ? "policy"
              : slug,
          animation_profile: ["policies", "privacy", "terms"].includes(slug) ? "policy" : "editorial",
          locale: "en",
          published_at: "2026-05-28T00:00:00Z",
          updated_at: "2026-05-28T00:00:00Z",
          is_public: true,
          is_indexable: true,
          content_md: `## ${slug} heading\n\n${slug} body.`,
          content_html: `<h2>${slug} heading</h2><p>${slug} body.</p>`,
          seo_title: `${slug} seo title`,
          meta_description: `${slug} seo description`,
        },
      };
    });

    vi.doMock("@/lib/api-client", () => ({
      ApiError: class ApiError extends Error {
        status: number;

        constructor(status: number) {
          super(`API ${status}`);
          this.status = status;
        }
      },
      apiClient: { get },
    }));

    const { clearLastKnownGoodForTests } = await import("@/lib/cms/last-known-good");
    clearLastKnownGoodForTests();
    const { listDiscoverableContentPagesWithLastKnownGood } = await import("@/lib/cms/content-pages");

    const result = await listDiscoverableContentPagesWithLastKnownGood("en");

    expect(result.value.map((page) => page.slug).sort()).toEqual([...DISCOVERABLE_KEYS].sort());
    expect(get).toHaveBeenCalledTimes(DISCOVERABLE_KEYS.length);
  });

  it("enumerates approved English content pages and Science pages in both llms surfaces", async () => {
    const { llmsText, llmsFullText } = await renderLlmsRoutes();

    for (const url of TARGET_URLS) {
      expect(llmsText).toContain(url);
      expect(llmsFullText).toContain(url);
    }

    expect(llmsFullText).toContain("brand authority summary from public CMS detail API.");
    expect(llmsFullText).toContain("policies authority summary from public CMS detail API.");
  });

  it("keeps clinical/depression tests and private flows out while preserving public support pages", async () => {
    const { llmsText, llmsFullText } = await renderLlmsRoutes();
    const combined = `${llmsText}\n${llmsFullText}`;

    expect(combined).toContain(`${SITE_URL}/en/support`);
    expect(combined).toContain(`${SITE_URL}/zh/support`);
    expect(combined).not.toContain("clinical-depression-anxiety-assessment-professional-edition");
    expect(combined).not.toContain("depression-screening-test-standard-edition");
    expect(combined).not.toMatch(/\/(?:take|result|orders?|share|api|pay|payment)(?:\/|$)/i);
  });
});
