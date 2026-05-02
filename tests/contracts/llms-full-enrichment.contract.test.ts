import { afterEach, describe, expect, it, vi } from "vitest";

function buildAnswerSurface({
  summary,
  faq = [],
  nextSteps = [],
}: {
  summary?: string;
  faq?: Array<{ question: string; answer: string }>;
  nextSteps?: Array<{ title: string; href: string | null }>;
}) {
  return {
    summaryBlocks: summary ? [{ key: "summary", title: "", body: summary, href: null, kind: null }] : [],
    faqBlocks: faq.map((item, index) => ({ key: `faq-${index}`, ...item })),
    nextStepBlocks: nextSteps.map((item, index) => ({
      key: `next-${index}`,
      title: item.title,
      body: "",
      href: item.href,
      kind: null,
    })),
  };
}

function buildLandingSurface(summary?: string) {
  return {
    summaryBlocks: summary ? [{ key: "landing-summary", title: "", body: summary, kind: null }] : [],
  };
}

function mockLlmsFullDependencies({ includeSurfaces = true }: { includeSurfaces?: boolean } = {}) {
  const articleAnswerSurface = includeSurfaces
    ? buildAnswerSurface({
        summary: "Article answer summary from the CMS answer surface.",
        faq: [
          { question: "First article question?", answer: "First article answer." },
          { question: "Second article question?", answer: "Second article answer." },
          { question: "Third article question?", answer: "Third article answer." },
        ],
        nextSteps: [
          { title: "Take the MBTI test", href: "/en/tests/mbti-personality-test-16-personality-types" },
          { title: "Read the MBTI topic", href: "/en/topics/mbti" },
          { title: "Open support", href: "/en/support" },
          { title: "Forbidden take flow", href: "/en/tests/mbti-personality-test-16-personality-types/take" },
        ],
      })
    : null;

  vi.doMock("@/lib/site", () => ({
    getSiteUrlOrThrow: vi.fn(() => "https://fermatmind.com"),
  }));
  vi.doMock("@/lib/seo/indexingPolicy", () => ({
    shouldIncludeInSitemap: vi.fn((path: string) =>
      !String(path).includes("/take") &&
      !String(path).includes("/career/jobs") &&
      !String(path).includes("/result/") &&
      !String(path).includes("/orders/") &&
      !String(path).includes("/share/") &&
      !String(path).includes("/api/")
    ),
  }));
  vi.doMock("@/lib/career/datasetDirectory", () => ({
    CAREER_DATASET_FAMILY_SLUGS: [],
  }));
  vi.doMock("@/lib/career/urls", () => ({
    buildCareerFamilyFrontendUrl: vi.fn((locale: string, slug: string) => `/${locale}/career/family/${slug}`),
  }));
  vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
    fetchCareerFamilyHub: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest", () => ({
    fetchCareerFirstWaveDiscoverabilityManifest: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
    fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerFamilyHub", () => ({
    adaptCareerFamilyHub: vi.fn(() => null),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerFirstWaveDiscoverabilityManifest", () => ({
    adaptCareerFirstWaveDiscoverabilityManifest: vi.fn(() => null),
  }));
  vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
    adaptCareerRecommendationIndex: vi.fn(() => []),
  }));
  vi.doMock("@/lib/career/launchPolicy", () => ({
    isCareerFamilyHubDiscoverableByManifest: vi.fn(() => false),
  }));
  vi.doMock("@/lib/cms/articles", () => ({
    listCmsArticlesForLlmsWithLastKnownGood: vi.fn(async ({ locale }: { locale: "en" | "zh" }) => ({
      value:
        locale === "en"
          ? [
              {
                slug: includeSurfaces ? "mbti-basics" : "empty-article",
                locale: "en",
                title: includeSurfaces ? "MBTI Basics" : "Empty article",
                excerpt: includeSurfaces ? "Article list excerpt." : "",
                href: includeSurfaces ? "/en/articles/mbti-basics" : "/en/articles/empty-article",
                isIndexable: true,
                updatedAt: "2026-04-20T00:00:00Z",
              },
            ]
          : [],
    })),
    getCmsArticleWithLastKnownGood: vi.fn(async () => ({
      value: includeSurfaces
        ? {
            slug: "mbti-basics",
            title: "MBTI Basics",
            answerSurface: articleAnswerSurface,
            landingSurface: buildLandingSurface("Article landing summary."),
          }
        : {
            slug: "empty-article",
            title: "Empty article",
            answerSurface: null,
            landingSurface: null,
          },
    })),
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
              updatedAt: "2026-04-21T00:00:00Z",
            },
          ]
        : []
    ),
    getCareerGuideFromCmsBySlug: vi.fn(async () => ({
      answerSurface: includeSurfaces
        ? buildAnswerSurface({ summary: "Career guide answer summary from CMS." })
        : null,
      landingSurface: null,
    })),
  }));
  vi.doMock("@/lib/cms/personality", () => ({
    buildDefaultPublicPersonalitySlug: vi.fn((value: string) => `${String(value).toLowerCase()}-a`),
    listPersonalityProfiles: vi.fn(async (params: { locale: "en" | "zh" }) => ({
      items:
        params.locale === "en"
          ? [{ typeCode: "INFJ", slug: "infj-a", title: "INFJ", isIndexable: true }]
          : [],
    })),
    getPersonalityProjectionDetailBySlugOrType: vi.fn(async () => ({
      answerSurface: includeSurfaces
        ? buildAnswerSurface({ summary: "Personality answer summary from CMS." })
        : null,
      landingSurface: null,
    })),
  }));
  vi.doMock("@/lib/cms/topics", () => ({
    listTopics: vi.fn(async (params: { locale: "en" | "zh" }) => ({
      items: params.locale === "en" ? [{ slug: "mbti", title: "MBTI", isIndexable: true }] : [],
    })),
    getTopicBySlug: vi.fn(async () => ({
      answerSurface: includeSurfaces ? buildAnswerSurface({ summary: "Topic answer summary from CMS." }) : null,
      landingSurface: null,
    })),
  }));
  vi.doMock("@/lib/cms/content-pages", () => ({
    listContentPagesWithLastKnownGood: vi.fn(async (locale: "en" | "zh") => ({
      value:
        locale === "en"
          ? [
              {
                path: "/support",
                title: "Support",
                summary: "Support page summary.",
              },
            ]
          : [],
    })),
  }));
  vi.doMock("@/lib/content", () => ({
    getAllTests: vi.fn(async (locale: "en" | "zh") =>
      locale === "en"
        ? [
            {
              slug: "mbti-personality-test-16-personality-types",
              title: "MBTI Test",
              title_i18n: { en: "MBTI Test" },
              description: "Existing MBTI test summary.",
              scale_code: "MBTI_93",
              highlight_excerpt_i18n: {},
            },
            {
              slug: "clinical-depression-anxiety-assessment-professional-edition",
              title: "Clinical depression-anxiety screening",
              title_i18n: { en: "Clinical depression-anxiety screening" },
              description: "Existing mental-health screening summary.",
              scale_code: "CLINICAL_COMBO_68",
              highlight_excerpt_i18n: {},
            },
          ]
        : []
    ),
    resolveTestTitleByLocale: vi.fn((test: { title: string }) => test.title),
  }));
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("llms-full enrichment contract", () => {
  it("renders bounded summaries, FAQ, next steps, and safety notes from existing surfaces", async () => {
    mockLlmsFullDependencies({ includeSurfaces: true });

    const { GET } = await import("@/app/llms-full.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("## Articles");
    expect(text).toContain("### [en] MBTI Basics | https://fermatmind.com/en/articles/mbti-basics");
    expect(text).toContain("- Summary: Article answer summary from the CMS answer surface.");
    expect(text).toContain("- FAQ:");
    expect(text).toContain("First article question?");
    expect(text).toContain("Second article question?");
    expect(text).not.toContain("Third article question?");
    expect(text).toContain("- Next steps:");
    expect(text).toContain("Take the MBTI test: https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types");
    expect(text).toContain("Read the MBTI topic: https://fermatmind.com/en/topics/mbti");
    expect(text).toContain("Open support: https://fermatmind.com/en/support");
    expect(text).not.toContain("Forbidden take flow");
    expect(text).toContain("Personality answer summary from CMS.");
    expect(text).toContain("Topic answer summary from CMS.");
    expect(text).toContain("Career guides");
    expect(text).not.toContain("https://fermatmind.com/en/career/guides/career-planning");
    expect(text).not.toContain("https://fermatmind.com/en/career/recommendations");
    expect(text).not.toContain("https://fermatmind.com/zh/career/recommendations");
    expect(text).toContain("Existing MBTI test summary.");
    expect(text).not.toContain("Clinical depression-anxiety screening");
    expect(text).not.toContain("clinical-depression-anxiety-assessment-professional-edition");
    expect(text).not.toContain("www.fermatmind.com");
    expect(text).not.toContain("/career/jobs");
    expect(text).not.toContain("/result/");
    expect(text).not.toContain("/orders/");
    expect(text).not.toContain("/share/");
    expect(text).not.toContain("/take");
    expect(text).not.toContain("/api/");
    expect(text).not.toContain("/pay");
    expect(text).not.toContain("/payment");
    expect(text).not.toContain("/history");
  });

  it("does not invent summaries when no source surface or list summary exists", async () => {
    mockLlmsFullDependencies({ includeSurfaces: false });

    const { GET } = await import("@/app/llms-full.txt/route");
    const response = await GET();
    const text = await response.text();
    const start = text.indexOf("### [en] Empty article | https://fermatmind.com/en/articles/empty-article");
    const end = text.indexOf("## Career", start);
    const articleBlock = text.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(articleBlock).toContain("- Type: article");
    expect(articleBlock).not.toContain("- Summary:");
    expect(articleBlock).not.toContain("- FAQ:");
    expect(articleBlock).not.toContain("- Next steps:");
  });
});
