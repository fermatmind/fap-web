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

  it("renders homepage recommended article covers from the CMS article projection", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).toContain("function ArticleCoverVisual");
    expect(source).toContain("article.coverImageUrl");
    expect(source).toContain("ArticleResponsiveImage");
    expect(source).toContain("src={article.coverImageUrl ?? null}");
    expect(source).toContain("variants={article.coverImageVariants}");
    expect(source).not.toContain("function ArticleVisual");
    expect(source).not.toContain("getArticleVisualTitle");
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
            cover_image_url: "https://api.fermatmind.com/static/articles/covers/cms-selected-article.svg",
            cover_image_alt: "CMS 运营配置文章封面",
            category: { id: 11, slug: "self-knowledge", name: "自我理解" },
            tags: [{ id: 21, slug: "mbti", name: "MBTI" }],
            status: "Published",
            is_public: true,
            published_revision: { id: 61 },
            published_at: "2026-04-21T00:00:00Z",
          },
          {
            slug: "incomplete-article",
            locale: "zh-CN",
            title: "Incomplete article",
            excerpt: "Missing cover and taxonomy",
            status: "published",
            is_public: true,
            published_revision_id: 63,
          },
          {
            slug: "english-article",
            locale: "en",
            title: "English article",
            status: "published",
            is_public: true,
            published_revision_id: 62,
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
      coverImageUrl: "https://api.fermatmind.com/static/articles/covers/cms-selected-article.svg",
      coverImageAlt: "CMS 运营配置文章封面",
      category: { slug: "self-knowledge", name: "自我理解" },
      tags: [{ slug: "mbti", name: "MBTI" }],
    });
  });

  it("keeps the CMS API health guard bilingual and metadata-complete", () => {
    const healthScript = read("scripts/check-cms-api-health.mjs");

    expect(healthScript).toContain("HOMEPAGE_RECOMMENDED_ARTICLE_LOCALES");
    expect(healthScript).toContain('apiLocale: "en"');
    expect(healthScript).toContain('apiLocale: "zh-CN"');
    expect(healthScript).toContain("homepageRecommendedArticleMissingFields");
    expect(healthScript).toContain("cover_image_variants");
    expect(healthScript).toContain("published_revision_id");
    expect(healthScript).toContain("metadata-complete");
  });

  it("loads six complete English homepage recommended articles from CMS authority", async () => {
    landingMock.mockResolvedValueOnce({
      value: {
        surfaceKey: "home",
        locale: "en",
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
            payloadJson: {
              items: Array.from({ length: 6 }, (_, index) => ({
                id: 420 + index,
                slug: index === 0 ? "why-mbti-and-holland-code-results-dont-match" : `english-homepage-article-${index}`,
                title: index === 0 ? "Why MBTI and Holland Code Results Do Not Match" : `English article ${index}`,
                excerpt: "CMS-owned homepage card excerpt.",
                locale: "en",
                status: "published",
                is_public: true,
                published_revision_id: 480 + index,
                cover_image_alt: "Illustration for the homepage article card",
                cover_image_variants: {
                  card: { url: `https://cdn.fermatmind.com/articles/en-${index}.webp`, width: 1200, height: 630 },
                },
                category: { slug: "career", name: "Career" },
                tags: [{ slug: "riasec", name: "RIASEC" }],
              })),
            },
            sortOrder: 10,
            isEnabled: true,
          },
        ],
      },
      source: "fresh",
      stale: false,
      updatedAt: "2026-06-12T00:00:00.000Z",
      error: null,
    });

    const { getHomepageRecommendedArticles } = await import("@/lib/marketing/homepageRecommendedArticles");
    const articles = await getHomepageRecommendedArticles("en");

    expect(landingMock).toHaveBeenCalledWith("home", "en");
    expect(articles).toHaveLength(6);
    expect(articles[0]).toMatchObject({
      slug: "why-mbti-and-holland-code-results-dont-match",
      locale: "en",
    });
  });

});
