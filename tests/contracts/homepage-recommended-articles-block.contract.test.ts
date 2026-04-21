import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const landingMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/cms/landing-surfaces", () => ({
  getCmsLandingSurfaceWithLastKnownGood: landingMock,
}));

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function surfaceWithBlock(payloadJson: unknown) {
  return {
    value: {
      surfaceKey: "home",
      locale: "zh",
      title: null,
      description: null,
      schemaVersion: "v1",
      payloadJson: {},
      status: "published",
      isPublic: true,
      isIndexable: true,
      publishedAt: null,
      scheduledAt: null,
      pageBlocks: [
        {
          blockKey: "recommended_articles",
          blockType: "articles",
          title: "Recommended",
          payloadJson,
          sortOrder: 10,
          isEnabled: true,
        },
      ],
    },
    source: "fresh",
    stale: false,
    updatedAt: "2026-04-21T00:00:00.000Z",
    error: null,
  };
}

describe("homepage recommended articles page block contract", () => {
  it("keeps homepage routes off latest article enumeration", () => {
    expect(read("app/(root)/page.tsx")).not.toContain("getCmsArticles");
    expect(read("app/(localized)/[locale]/page.tsx")).not.toContain("getCmsArticles");
    expect(read("app/(root)/page.tsx")).toContain("getHomepageRecommendedArticles");
    expect(read("app/(localized)/[locale]/page.tsx")).toContain("getHomepageRecommendedArticles");
  });

  it("loads recommended articles from the home landing surface page block", async () => {
    landingMock.mockResolvedValueOnce(
      surfaceWithBlock({
        items: [
          {
            slug: "cms-selected-article",
            locale: "zh-CN",
            title: "CMS 运营配置文章",
            excerpt: "来自 landing surface page block",
            status: "published",
            is_public: true,
            published_at: "2026-04-21T00:00:00Z",
          },
          {
            slug: "english-article",
            locale: "en",
            title: "English article",
            status: "published",
            is_public: true,
          },
          {
            slug: "draft-article",
            locale: "zh-CN",
            title: "Draft article",
            status: "draft",
            is_public: true,
          },
        ],
      })
    );

    const { getHomepageRecommendedArticles } = await import("@/lib/marketing/homepageRecommendedArticles");
    const articles = await getHomepageRecommendedArticles("zh");

    expect(landingMock).toHaveBeenCalledWith("home", "zh");
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      slug: "cms-selected-article",
      title: "CMS 运营配置文章",
      locale: "zh-CN",
    });
  });
});
