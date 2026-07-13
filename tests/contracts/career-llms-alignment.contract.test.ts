import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractBackendSitemapCareerJobPaths,
  extractBackendSitemapMbtiPersonalityPaths,
  listBackendSitemapCareerJobPaths,
  listBackendSitemapMbtiPersonalityPaths,
} from "@/lib/seo/backendSitemapSource";
import { LLMS_ROUTE_LIMITS } from "@/lib/seo/llmsRouteBudget";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function mockLlmsRouteSupportingReads() {
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
      build("https://fermatmind.com")
    ),
    writeLlmsFullResponseCache: vi.fn(async () => ({ cached: false, cachePath: "" })),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career llms alignment contract", () => {
  it("extracts only backend-authorized MBTI profile and comparison paths", () => {
    expect(extractBackendSitemapMbtiPersonalityPaths({
      items: [
        { loc: "https://fermatmind.com/zh/personality/intp-a" },
        { loc: "https://fermatmind.com/zh/personality/intp-a-vs-intp-t" },
        { loc: "https://fermatmind.com/zh/personality/entj-vs-intj" },
        { loc: "https://fermatmind.com/zh/personality/intp-a-vs-intj-t" },
        { loc: "https://fermatmind.com/zh/personality/xxxx-a" },
        { loc: "https://fermatmind.com/zh/personality/intj-vs-intj" },
        { loc: "https://staging.fermatmind.com/zh/personality/intj-a" },
        { loc: "http://fermatmind.com/zh/personality/intj-a" },
      ],
    })).toEqual([
      "/zh/personality/entj-vs-intj",
      "/zh/personality/intp-a",
      "/zh/personality/intp-a-vs-intp-t",
    ]);
  });

  it("re-reads MBTI sitemap authority so a later noindex hold fails closed", async () => {
    const responses = [
      [{ loc: "https://fermatmind.com/zh/personality/intp-a" }],
      [],
    ];
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ items: responses.shift() ?? [] })));

    await expect(listBackendSitemapMbtiPersonalityPaths()).resolves.toEqual([
      "/zh/personality/intp-a",
    ]);
    await expect(listBackendSitemapMbtiPersonalityPaths()).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("extracts only safe canonical backend sitemap-source Career job detail candidates", () => {
    expect(
      extractBackendSitemapCareerJobPaths({
        items: [
          { loc: "https://fermatmind.com/en/career/jobs/backend-architect" },
          { loc: "https://fermatmind.com/zh/career/jobs/backend-architect" },
          { loc: "https://fermatmind.com/en/career/jobs/digital-forensics-analysts" },
          { loc: "https://fermatmind.com/zh/career/jobs/computer-occupations-all-other" },
          { loc: "https://attacker.example/en/career/jobs/poisoned" },
          { loc: "javascript:/en/career/jobs/poisoned" },
          { loc: "http://fermatmind.com/en/career/jobs/insecure" },
          { loc: "https://fermatmind.com/en/career/jobs/..%2F..%2Fapi%2Fv0.5%2Fpoisoned" },
          { loc: "https://fermatmind.com/en/career/jobs/backend-engineer" },
          { loc: "https://fermatmind.com/en/career/jobs/software-developers" },
          { loc: "https://fermatmind.com/zh/career/jobs/software-developers" },
        ],
      })
    ).toEqual([
      "/en/career/jobs/backend-architect",
      "/en/career/jobs/backend-engineer",
      "/zh/career/jobs/backend-architect",
    ]);
  });

  it("uses backend sitemap authority directly for Career job llms coverage without full-index or per-detail fanout", async () => {
    const fetches: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        fetches.push(url);

        if (url.includes("/api/v0.5/seo/sitemap-source")) {
          return jsonResponse({
            items: [
              { loc: "https://fermatmind.com/en/career/jobs/actors" },
              { loc: "https://fermatmind.com/zh/career/jobs/actors" },
              { loc: "https://fermatmind.com/zh/career/jobs/software-developers" },
              { loc: "https://fermatmind.com/en/career/jobs/digital-forensics-analysts" },
              { loc: "https://fermatmind.com/zh/career/jobs/computer-occupations-all-other" },
              { loc: "https://staging.fermatmind.com/en/career/jobs/staging-role" },
              { loc: "https://fermatmind.com/en/career/jobs/actors?preview=1" },
            ],
          });
        }

        return jsonResponse({ message: "not found" }, 404);
      })
    );

    await expect(listBackendSitemapCareerJobPaths()).resolves.toEqual([
      "/en/career/jobs/actors",
      "/zh/career/jobs/actors",
    ]);
    expect(fetches).toHaveLength(1);
    expect(fetches[0]).toContain("/api/v0.5/seo/sitemap-source");
    expect(fetches.join("\n")).not.toContain("/api/v0.5/career/jobs");
    expect(fetches.join("\n")).not.toContain("/api/v0.5/career-jobs/");
  });

  it("applies the llms career job limit to backend sitemap authority paths without per-path SEO fetches", async () => {
    const limit = 3;
    const fetches: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        fetches.push(url);

        if (url.includes("/api/v0.5/seo/sitemap-source")) {
          return jsonResponse({
            items: Array.from({ length: LLMS_ROUTE_LIMITS.careerJobs + 5 }, (_, index) => ({
              loc: `https://fermatmind.com/en/career/jobs/role-${String(index).padStart(2, "0")}`,
            })),
          });
        }

        return jsonResponse({ message: "not found" }, 404);
      })
    );

    const paths = await listBackendSitemapCareerJobPaths({ limit });

    expect(paths).toEqual([
      "/en/career/jobs/role-00",
      "/en/career/jobs/role-01",
      "/en/career/jobs/role-02",
    ]);
    expect(fetches).toHaveLength(1);
    expect(fetches[0]).toContain("/api/v0.5/seo/sitemap-source");
    expect(fetches.join("\n")).not.toContain("/api/v0.5/career/jobs");
    expect(fetches.join("\n")).not.toContain("/api/v0.5/career-jobs/");
    expect(paths.join("\n")).not.toContain("role-03");
  });

  it("llms.txt reflects current live Career authority routes and excludes query search urls", async () => {
    mockLlmsRouteSupportingReads();
    vi.doMock("@/lib/seo/backendSitemapSource", () => ({
      listBackendSitemapMbtiPersonalityPaths: vi.fn(async () => []),
      listBackendSitemapBigFiveZhPaths: vi.fn(async () => [
        "/zh/personality/big-five/openness",
        "/zh/personality/big-five/openness-high",
      ]),
      listBackendSitemapCareerJobPaths: vi.fn(async () => [
        "/en/career/jobs/backend-architect",
        "/zh/career/jobs/backend-architect",
      ]),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest", () => ({
      fetchCareerFirstWaveDiscoverabilityManifest: vi.fn(async () => ({
        manifest_kind: "career_first_wave_discoverability_manifest",
        manifest_version: "career.discoverability.first_wave.v1",
        scope: "career_first_wave_10",
        routes: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            discoverability_state: "discoverable",
            canonical_slug: "backend-architect",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/data-engineer",
            discoverability_state: "excluded",
            canonical_slug: "data-engineer",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-science",
            discoverability_state: "discoverable",
            canonical_slug: "data-science",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/compliance",
            discoverability_state: "excluded",
            canonical_slug: "compliance",
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
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
      listCmsArticlesForLlmsWithLastKnownGood: vi.fn(async () => ({ value: [] })),
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: null })),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
      getCareerGuideFromCmsBySlug: vi.fn(async () => null),
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
    vi.doMock("@/lib/cms/content-pages", () => ({
      listContentPages: vi.fn(async () => []),
      listDiscoverableContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
      listContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
      listApprovedEnglishContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    }));
    vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
      listBackendDiscoverabilityTestEntries: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/site", () => ({
      getSiteUrlOrThrow: vi.fn(() => "https://fermatmind.com"),
      isConfiguredStagingSiteUrl: vi.fn(() => false),
    }));

    const { GET } = await import("@/app/llms.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("https://fermatmind.com/en/career");
    expect(text).not.toMatch(/^- https:\/\/fermatmind\.com\/en\/career\/jobs$/m);
    expect(text).not.toContain("https://fermatmind.com/en/career/recommendations");
    expect(text).toContain("https://fermatmind.com/en/career/jobs/backend-architect");
    expect(text).toContain("https://fermatmind.com/zh/career/jobs/backend-architect");
    expect(text).toContain("https://fermatmind.com/zh/personality/big-five/openness");
    expect(text).toContain("https://fermatmind.com/zh/personality/big-five/openness-high");
    expect(text).not.toContain("https://fermatmind.com/en/personality/big-five/openness");
    expect(text).not.toContain("https://fermatmind.com/zh/big-five/openness");
    expect(text).not.toContain("https://fermatmind.com/en/career/jobs/data-engineer");
    expect(text).not.toContain("https://fermatmind.com/en/career/family/data-science");
    expect(text).not.toContain("https://fermatmind.com/en/career/recommendations/mbti/intj-a");
    expect(text).not.toContain("https://fermatmind.com/en/career/family/compliance");
    expect(text).not.toContain("?q=");
    expect(text).not.toContain("/career/recommendations/big5/");
  });

  it("llms-full.txt reflects backend-owned Career detail routes and excludes query search urls", async () => {
    mockLlmsRouteSupportingReads();
    vi.doMock("@/lib/seo/backendSitemapSource", () => ({
      listBackendSitemapMbtiPersonalityPaths: vi.fn(async () => []),
      listBackendSitemapBigFiveZhPaths: vi.fn(async () => [
        "/zh/personality/big-five/openness",
        "/zh/personality/big-five/openness-high",
      ]),
      listBackendSitemapCareerJobPaths: vi.fn(async () => [
        "/en/career/jobs/backend-architect",
        "/zh/career/jobs/backend-architect",
      ]),
    }));
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
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest", () => ({
      fetchCareerFirstWaveDiscoverabilityManifest: vi.fn(async () => ({
        manifest_kind: "career_first_wave_discoverability_manifest",
        manifest_version: "career.discoverability.first_wave.v1",
        scope: "career_first_wave_10",
        routes: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            discoverability_state: "discoverable",
            canonical_slug: "backend-architect",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/data-engineer",
            discoverability_state: "excluded",
            canonical_slug: "data-engineer",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-science",
            discoverability_state: "discoverable",
            canonical_slug: "data-science",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/compliance",
            discoverability_state: "excluded",
            canonical_slug: "compliance",
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
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
      listCmsArticlesForLlmsWithLastKnownGood: vi.fn(async () => ({ value: [] })),
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: null })),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
      getCareerGuideFromCmsBySlug: vi.fn(async () => null),
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
    vi.doMock("@/lib/cms/content-pages", () => ({
      listContentPages: vi.fn(async () => []),
      listDiscoverableContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
      listContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
      listApprovedEnglishContentPagesWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    }));
    vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
      listBackendDiscoverabilityTestEntries: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/site", () => ({
      getSiteUrlOrThrow: vi.fn(() => "https://fermatmind.com"),
      isConfiguredStagingSiteUrl: vi.fn(() => false),
    }));

    const { GET } = await import("@/app/llms-full.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("[en] Career center | https://fermatmind.com/en/career");
    expect(text).not.toContain("[en] Career jobs | https://fermatmind.com/en/career/jobs");
    expect(text).not.toContain("[en] Career recommendations | https://fermatmind.com/en/career/recommendations");
    expect(text).toContain("[en] Backend Architect | https://fermatmind.com/en/career/jobs/backend-architect");
    expect(text).toContain("[zh] Backend Architect | https://fermatmind.com/zh/career/jobs/backend-architect");
    expect(text).toContain("[zh] Openness | https://fermatmind.com/zh/personality/big-five/openness");
    expect(text).toContain("[zh] Openness High | https://fermatmind.com/zh/personality/big-five/openness-high");
    expect(text).not.toContain("https://fermatmind.com/en/personality/big-five/openness");
    expect(text).not.toContain("https://fermatmind.com/zh/big-five/openness");
    expect(text).not.toContain("[en] Data Engineer | https://fermatmind.com/en/career/jobs/data-engineer");
    expect(text).not.toContain("[en] Data Science | https://fermatmind.com/en/career/family/data-science");
    expect(text).not.toContain("[en] INTJ Career Match | https://fermatmind.com/en/career/recommendations/mbti/intj-a");
    expect(text).not.toContain("[en] Compliance | https://fermatmind.com/en/career/family/compliance");
    expect(text).not.toContain("?q=");
    expect(text).not.toContain("/career/recommendations/big5/");
  });
});
