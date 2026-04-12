import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career llms alignment contract", () => {
  it("llms.txt reflects current live Career authority routes and excludes query search urls", async () => {
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async ({ slug }: { slug: string }) => {
        if (slug === "data-science") {
          return {
            bundle_kind: "career_family_hub",
            bundle_version: "career.protocol.family_hub.v1",
            family: {
              family_uuid: "fam_123",
              canonical_slug: "data-science",
              title_en: "Data Science",
              title_zh: "数据科学",
            },
            visible_children: [
              {
                occupation_uuid: "occ_123",
                canonical_slug: "data-scientist",
                canonical_title_en: "Data Scientist",
                canonical_title_zh: "数据科学家",
              },
            ],
            counts: {
              visible_children_count: 1,
              publish_ready_count: 1,
              blocked_override_eligible_count: 0,
              blocked_not_safely_remediable_count: 0,
              blocked_total: 0,
            },
          };
        }

        return {
          bundle_kind: "career_family_hub",
          bundle_version: "career.protocol.family_hub.v1",
          family: {
            family_uuid: "fam_124",
            canonical_slug: "compliance",
            title_en: "Compliance",
            title_zh: "合规",
          },
          visible_children: [],
          counts: {
            visible_children_count: 0,
            publish_ready_count: 0,
            blocked_override_eligible_count: 0,
            blocked_not_safely_remediable_count: 0,
            blocked_total: 0,
          },
        };
      }),
    }));
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
    expect(text).toContain("https://fermatmind.com/en/career/family/data-science");
    expect(text).toContain("https://fermatmind.com/en/career/recommendations/mbti/intj-a");
    expect(text).not.toContain("https://fermatmind.com/en/career/family/compliance");
    expect(text).not.toContain("?q=");
    expect(text).not.toContain("/career/recommendations/big5/");
  });

  it("llms-full.txt reflects backend-owned Career detail routes and excludes query search urls", async () => {
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async ({ slug }: { slug: string }) => {
        if (slug === "data-science") {
          return {
            bundle_kind: "career_family_hub",
            bundle_version: "career.protocol.family_hub.v1",
            family: {
              family_uuid: "fam_123",
              canonical_slug: "data-science",
              title_en: "Data Science",
              title_zh: "数据科学",
            },
            visible_children: [
              {
                occupation_uuid: "occ_123",
                canonical_slug: "data-scientist",
                canonical_title_en: "Data Scientist",
                canonical_title_zh: "数据科学家",
              },
            ],
            counts: {
              visible_children_count: 1,
              publish_ready_count: 1,
              blocked_override_eligible_count: 0,
              blocked_not_safely_remediable_count: 0,
              blocked_total: 0,
            },
          };
        }

        return {
          bundle_kind: "career_family_hub",
          bundle_version: "career.protocol.family_hub.v1",
          family: {
            family_uuid: "fam_124",
            canonical_slug: "compliance",
            title_en: "Compliance",
            title_zh: "合规",
          },
          visible_children: [],
          counts: {
            visible_children_count: 0,
            publish_ready_count: 0,
            blocked_override_eligible_count: 0,
            blocked_not_safely_remediable_count: 0,
            blocked_total: 0,
          },
        };
      }),
    }));
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
    expect(text).toContain("[en] Data Science | https://fermatmind.com/en/career/family/data-science");
    expect(text).toContain("[en] INTJ Career Match | https://fermatmind.com/en/career/recommendations/mbti/intj-a");
    expect(text).not.toContain("[en] Compliance | https://fermatmind.com/en/career/family/compliance");
    expect(text).not.toContain("?q=");
    expect(text).not.toContain("/career/recommendations/big5/");
  });
});
