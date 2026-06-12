import { afterEach, describe, expect, it, vi } from "vitest";

const SITE_URL = "https://fermatmind.com";
const TARGET_SLUGS = [
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

function mockCareerJobBundle({
  slug,
  reasonCodes,
}: {
  slug: string;
  reasonCodes: string[];
}) {
  vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
    fetchCareerJobBundle: vi.fn(async () => ({
      identity: {
        canonical_slug: slug,
      },
      titles: {
        canonical_en: slug
          .split("-")
          .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
          .join(" "),
      },
      claim_permissions: {
        allow_strong_claim: false,
        allow_salary_comparison: false,
        allow_ai_strategy: false,
        allow_transition_recommendation: false,
        allow_cross_market_pay_copy: false,
        reason_codes: ["runtime_shell_claim_boundary"],
      },
      seo_contract: {
        canonical_path: `/career/jobs/${slug}`,
        index_state: "indexable",
        index_eligible: true,
        robots_policy: "index,follow",
        reason_codes: reasonCodes,
      },
      render_state: {
        career_data_status: "trust_limited",
        can_index_page: false,
        can_render_answer_surface: false,
        can_render_outlook_surface: false,
        can_render_fit_surface: false,
        can_render_salary_surface: false,
        can_render_structured_data: false,
      },
    })),
  }));
}

function mockLlmsFullDependencies() {
  const fillerSlugs = Array.from(
    { length: 1046 - TARGET_SLUGS.length },
    (_, index) => `metadata-stability-career-${index + 1}`
  );
  const validPaths = [...TARGET_SLUGS, ...fillerSlugs].flatMap((slug) => [
    `/en/career/jobs/${slug}`,
    `/zh/career/jobs/${slug}`,
  ]);
  const excludedPaths = EXCLUDED_SLUGS.flatMap((slug) => [
    `/en/career/jobs/${slug}`,
    `/zh/career/jobs/${slug}`,
  ]);
  const listBackendSitemapCareerJobPaths = vi.fn(async () => [...validPaths, ...excludedPaths]);

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

  return { listBackendSitemapCareerJobPaths, validPaths, excludedPaths };
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DETAIL_READY_1046_CAREER_DETAIL_METADATA_AND_LLMS_FULL_STABILITY_REPAIR-01", () => {
  it("treats backend runtime publish and release gate authority as sufficient for career detail robots metadata", async () => {
    mockCareerJobBundle({
      slug: "aerospace-engineers",
      reasonCodes: ["runtime_publish_projection", "release_gate_pass", "runtime_published_navigation_shell"],
    });

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "aerospace-engineers" }),
    });

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("keeps candidate-only career details noindexed when runtime publication authority is absent", async () => {
    mockCareerJobBundle({
      slug: "candidate-only-role",
      reasonCodes: ["release_gate_pass"],
    });

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "candidate-only-role" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("serves llms-full from generated cache on repeat reads while preserving approved career URLs and excluded slug safety", async () => {
    const { listBackendSitemapCareerJobPaths, validPaths, excludedPaths } = mockLlmsFullDependencies();
    const { GET } = await import("@/app/llms-full.txt/route");

    const firstResponse = await GET();
    const firstText = await firstResponse.text();
    const secondResponse = await GET();
    const secondText = await secondResponse.text();

    expect(firstResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(firstResponse.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("generated");
    expect(secondResponse.headers.get("X-FermatMind-LLMS-Full-Mode")).toBe("complete");
    expect(secondResponse.headers.get("X-FermatMind-LLMS-Full-Source")).toBe("cache");
    expect(listBackendSitemapCareerJobPaths).toHaveBeenCalledTimes(1);
    expect(secondText).toBe(firstText);

    for (const value of validPaths) {
      expect(firstText).toContain(`${SITE_URL}${value}`);
    }
    for (const value of excludedPaths) {
      expect(firstText).not.toContain(`${SITE_URL}${value}`);
    }
    expect(firstText).not.toMatch(/\/(?:take|result|share|orders|pay|payment)(?:\/|$)/i);
    expect(firstText).not.toContain("staging.fermatmind.com");
  });
});
