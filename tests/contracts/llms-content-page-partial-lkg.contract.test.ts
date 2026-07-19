import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const COLLECTION_KEY = "content-pages:discoverable-detail:en:all";

type ContentPageOverride = {
  isPublic?: boolean;
  isIndexable?: boolean;
};

function contentPageRecord(slug: string, override: ContentPageOverride = {}) {
  const isHelp = slug === "support" || slug.startsWith("help-");
  const isPolicy = ["policies", "privacy", "terms"].includes(slug);

  return {
    slug,
    path: slug.startsWith("help-") ? `/help/${slug.slice(5)}` : `/${slug}`,
    kind: isHelp ? "help" : isPolicy ? "policy" : "company",
    title: `${slug} title`,
    kicker: isHelp ? "Help" : "Company",
    summary: `${slug} summary`,
    template: isHelp ? "help" : isPolicy ? "policy" : "company",
    animation_profile: isPolicy ? "policy" : "editorial",
    locale: "en",
    published_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    effective_at: null,
    source_doc: null,
    is_public: override.isPublic ?? true,
    is_indexable: override.isIndexable ?? true,
    headings: [`${slug} heading`],
    content_md: `## ${slug} heading\n\n${slug} body.`,
    content_html: `<h2>${slug} heading</h2><p>${slug} body.</p>`,
    seo_title: `${slug} seo`,
    meta_description: `${slug} description`,
  };
}

function mockContentPageAuthority() {
  const overrides = new Map<string, ContentPageOverride>();
  const transientSlugs = new Set<string>();
  const get = vi.fn(async (url: string) => {
    const slug = decodeURIComponent(url.match(/\/v0\.5\/content-pages\/([^?]+)/)?.[1] ?? "");
    if (transientSlugs.has(slug)) {
      throw new Error(`transient failure for ${slug}`);
    }

    return { page: contentPageRecord(slug, overrides.get(slug)) };
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

  return { get, overrides, transientSlugs };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("llms content-page partial collection LKG", () => {
  it("keeps the complete collection LKG when one expected key fails transiently", async () => {
    const authority = mockContentPageAuthority();
    const contentPages = await import("@/lib/cms/content-pages");
    const lkg = await import("@/lib/cms/last-known-good");
    lkg.clearLastKnownGoodForTests();

    const seeded = await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");
    expect(seeded.source).toBe("fresh");
    expect(seeded.value).toHaveLength(contentPages.DISCOVERABLE_CONTENT_PAGE_KEYS.length);

    authority.transientSlugs.add("method-boundaries");
    const recovered = await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");

    expect(recovered.source).toBe("last-known-good");
    expect(recovered.value).toEqual(seeded.value);
    expect(lkg.readLastKnownGoodForTests<typeof seeded.value>(COLLECTION_KEY)?.value).toEqual(seeded.value);
  });

  it("fails closed on a transient partial collection when no complete LKG exists", async () => {
    const authority = mockContentPageAuthority();
    authority.transientSlugs.add("science");
    const contentPages = await import("@/lib/cms/content-pages");
    const lkg = await import("@/lib/cms/last-known-good");
    lkg.clearLastKnownGoodForTests();

    await expect(contentPages.listDiscoverableContentPagesWithLastKnownGood("en")).rejects.toThrow(
      "transient failure for science"
    );
    expect(lkg.readLastKnownGoodForTests(COLLECTION_KEY)).toBeNull();
  });

  it("does not resurrect an authoritatively noindex page from LKG during a mixed transient failure", async () => {
    const authority = mockContentPageAuthority();
    const contentPages = await import("@/lib/cms/content-pages");
    const lkg = await import("@/lib/cms/last-known-good");
    lkg.clearLastKnownGoodForTests();

    const seeded = await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");
    expect(seeded.value.map((page) => page.slug)).toContain("brand");

    authority.overrides.set("brand", { isIndexable: false });
    authority.transientSlugs.add("science");
    await expect(contentPages.listDiscoverableContentPagesWithLastKnownGood("en")).rejects.toThrow(
      "transient failure for science"
    );
    expect(lkg.readLastKnownGoodForTests(COLLECTION_KEY)).toBeNull();

    authority.overrides.delete("brand");
    await expect(contentPages.listDiscoverableContentPagesWithLastKnownGood("en")).rejects.toThrow(
      "transient failure for science"
    );
  });

  it("stores a complete authoritative noindex refresh without the revoked page", async () => {
    const authority = mockContentPageAuthority();
    const contentPages = await import("@/lib/cms/content-pages");
    const lkg = await import("@/lib/cms/last-known-good");
    lkg.clearLastKnownGoodForTests();

    await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");
    authority.overrides.set("brand", { isIndexable: false });
    const refreshed = await contentPages.listDiscoverableContentPagesWithLastKnownGood("en");

    expect(refreshed.source).toBe("fresh");
    expect(refreshed.value.map((page) => page.slug)).not.toContain("brand");
    expect(lkg.readLastKnownGoodForTests<typeof refreshed.value>(COLLECTION_KEY)?.value).toEqual(refreshed.value);
  });

  it("gates public llms.txt caching on both locale content-page authority cohorts", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms.txt/route.ts"), "utf8");

    expect(route).toContain("const contentPageAuthorityAvailable =");
    expect(route).toContain(
      "enDiscoverableContentPages.authorityAvailable && zhDiscoverableContentPages.authorityAvailable"
    );
    expect(route).toContain("personalityAuthorityAvailable && contentPageAuthorityAvailable");
    expect(route).toContain('"private, no-store, max-age=0"');
    expect(route).toContain("UNAVAILABLE_CONTENT_PAGE_AUTHORITY");
    expect(route).not.toMatch(/(?:fallbackContentPages|LOCAL_CONTENT_PAGES|localEditorial)/);
  });

  it("returns private no-store when either locale authority is unavailable", async () => {
    let zhAuthorityAvailable = false;
    vi.doMock("@/lib/site", () => ({
      getSiteUrlOrThrow: vi.fn(() => "https://fermatmind.com"),
    }));
    vi.doMock("@/lib/cms/articles", () => ({
      listCmsArticlesForLlmsWithLastKnownGood: vi.fn(async () => ({ value: [] })),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({ items: [] })),
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerRecommendationIndex", () => ({
      adaptCareerRecommendationIndex: vi.fn(() => []),
    }));
    vi.doMock("@/lib/cms/content-pages", () => ({
      listDiscoverableContentPagesWithLastKnownGood: vi.fn(async (locale: "en" | "zh") => {
        if (locale === "zh" && !zhAuthorityAvailable) {
          throw new Error("zh content-page authority unavailable");
        }

        return {
          value: [
            {
              ...contentPageRecord("about"),
              locale,
              isPublic: true,
              isIndexable: true,
              contentMd: "## About",
              contentHtml: "<h2>About</h2>",
            },
          ],
        };
      }),
    }));
    vi.doMock("@/lib/cms/topics", () => ({
      listDiscoverableTopicsWithLastKnownGood: vi.fn(async () => ({ value: { items: [] } })),
    }));
    vi.doMock("@/lib/seo/discoverabilityExposurePolicy", () => ({
      isSharedDiscoverabilityDeniedPath: vi.fn(() => false),
    }));
    vi.doMock("@/lib/seo/indexingPolicy", () => ({
      shouldIncludeInSitemap: vi.fn(() => true),
    }));
    vi.doMock("@/lib/seo/backendSitemapMbtiAuthorityCache", () => ({
      readMbtiAuthorityLastKnownGood: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/seo/backendSitemapSource", () => ({
      listBackendSitemapMbtiPersonalityPaths: vi.fn(async () => ["/zh/personality/intj-a"]),
      listBackendSitemapBigFiveZhPaths: vi.fn(async () => []),
      listBackendSitemapCareerJobPaths: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/seo/backendTestDiscoverabilitySource", () => ({
      listBackendDiscoverabilityTestEntries: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/foundation/dailyGivingSeo", () => ({
      listDailyGivingDiscoverabilityEntries: vi.fn(async () => []),
    }));
    vi.doMock("@/lib/seo/enneagramLlmsSource", () => ({
      listEnneagramLlmsPaths: vi.fn(async () =>
        Array.from({ length: 116 }, (_, index) => `/zh/personality/enneagram/mock-${index}`)
      ),
    }));
    vi.doMock("@/lib/seo/stagingDiscoverability", () => ({
      isConfiguredStagingDiscoverability: vi.fn(() => false),
      createConfiguredStagingLlmsResponse: vi.fn(),
    }));

    const { GET } = await import("@/app/llms.txt/route");
    const unavailableResponse = await GET();
    expect(unavailableResponse.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");

    zhAuthorityAvailable = true;
    const completeResponse = await GET();
    expect(completeResponse.headers.get("Cache-Control")).toBe(
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  });
});
