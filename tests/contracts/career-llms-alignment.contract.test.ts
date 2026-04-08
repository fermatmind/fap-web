import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career llms alignment contract", () => {
  it("llms.txt reflects current live Career authority routes and excludes query search urls", async () => {
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerJobIndex", () => ({
      adaptCareerJobIndex: vi.fn(() => [
        {
          href: "/en/career/jobs/backend-architect",
          seoContract: { indexEligible: true, indexState: "indexed" },
        },
      ]),
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
      adaptCareerRecommendationIndex: vi.fn(() => [
        {
          href: "/en/career/recommendations/mbti/intj-a",
          seoContract: { indexEligible: true, indexState: "indexed" },
        },
      ]),
    }));
    vi.doMock("@/lib/cms/articles", () => ({
      listCmsArticlesForLlms: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/cms/personality", () => ({
      buildDefaultPublicPersonalitySlug: vi.fn(() => ""),
      listPersonalityProfiles: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/cms/topics", () => ({
      listTopics: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/content", () => ({
      getAllTests: vi.fn(() => []),
      listCareerIndustrySlugs: vi.fn(() => []),
    }));
    vi.doMock("@/lib/help/helpCenterContent", () => ({
      HELP_CENTER_SLUGS: [],
    }));
    vi.doMock("@/lib/site", () => ({
      getSiteUrlOrThrow: vi.fn(() => "https://fermatmind.com"),
    }));

    const { GET } = await import("@/app/llms.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("https://fermatmind.com/en/career");
    expect(text).toContain("https://fermatmind.com/en/career/jobs");
    expect(text).toContain("https://fermatmind.com/en/career/recommendations");
    expect(text).toContain("https://fermatmind.com/en/career/jobs/backend-architect");
    expect(text).toContain("https://fermatmind.com/en/career/recommendations/mbti/intj-a");
    expect(text).not.toContain("?q=");
    expect(text).not.toContain("/career/recommendations/big5/");
  });

  it("llms-full.txt reflects backend-owned Career detail routes and excludes query search urls", async () => {
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerJobIndex", () => ({
      adaptCareerJobIndex: vi.fn(() => [
        {
          href: "/en/career/jobs/backend-architect",
          titles: { title: "Backend Architect" },
          provenanceMeta: { compiledAt: "2026-04-10T12:00:00Z" },
          seoContract: { indexEligible: true, indexState: "indexed" },
        },
      ]),
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
      adaptCareerRecommendationIndex: vi.fn(() => [
        {
          href: "/en/career/recommendations/mbti/intj-a",
          recommendationSubjectMeta: { displayTitle: "INTJ Career Match" },
          provenanceMeta: { compiledAt: "2026-04-10T12:00:00Z" },
          seoContract: { indexEligible: true, indexState: "indexed" },
        },
      ]),
    }));
    vi.doMock("@/lib/cms/articles", () => ({
      listCmsArticlesForLlms: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/cms/personality", () => ({
      buildDefaultPublicPersonalitySlug: vi.fn(() => ""),
      listPersonalityProfiles: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/cms/topics", () => ({
      listTopics: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/content", () => ({
      getAllTests: vi.fn(() => []),
      listCareerIndustrySlugs: vi.fn(() => []),
    }));
    vi.doMock("@/lib/help/helpCenterContent", () => ({
      listHelpCenterPages: vi.fn(() => []),
    }));
    vi.doMock("@/lib/site", () => ({
      getSiteUrlOrThrow: vi.fn(() => "https://fermatmind.com"),
    }));

    const { GET } = await import("@/app/llms-full.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("[en] Career center | https://fermatmind.com/en/career");
    expect(text).toContain("[en] Career jobs | https://fermatmind.com/en/career/jobs");
    expect(text).toContain("[en] Career recommendations | https://fermatmind.com/en/career/recommendations");
    expect(text).toContain("[en] Backend Architect | https://fermatmind.com/en/career/jobs/backend-architect");
    expect(text).toContain("[en] INTJ Career Match | https://fermatmind.com/en/career/recommendations/mbti/intj-a");
    expect(text).not.toContain("?q=");
    expect(text).not.toContain("/career/recommendations/big5/");
  });
});
