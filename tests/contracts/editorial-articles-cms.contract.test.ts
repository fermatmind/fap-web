import { afterEach, describe, expect, it, vi } from "vitest";
import { getCmsArticle, getCmsArticleSeo } from "@/lib/cms/articles";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("editorial article CMS contract", () => {
  it("maps backend editorial image metadata and variants into the frontend article shape", async () => {
    const coverUrl = "https://api.fermatmind.com/static/articles/covers/how-personality-shapes-attitude-toward-ai.svg";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/seo?")) {
        return jsonResponse({
          meta: {
            title: "你的性格如何塑造你对人工智能的态度｜FermatMind",
            description: "人格倾向会影响 AI 信任、控制感和风险解释方式。",
            canonical: "https://www.fermatmind.com/zh/articles/how-personality-shapes-attitude-toward-ai",
            og: {
              title: "AI 态度与人格",
              description: "人格倾向会影响 AI 信任。",
              image: coverUrl,
              type: "article",
            },
            twitter: {
              card: "summary_large_image",
              title: "AI 态度与人格",
              description: "人格倾向会影响 AI 信任。",
              image: coverUrl,
            },
            robots: "index,follow",
          },
          jsonld: null,
        });
      }

      return jsonResponse({
        ok: true,
        article: {
          slug: "how-personality-shapes-attitude-toward-ai",
          locale: "zh-CN",
          title: "你的性格如何塑造你对人工智能的态度",
          excerpt: "人格倾向会影响 AI 信任、控制感和风险解释方式。",
          content_md: "## 执行摘要\n人格与 AI 信任存在稳定关系。",
          author_name: "Fermat Institute",
          reviewer_name: "FermatMind Research",
          review_state: "approved",
          last_reviewed_at: "2026-07-18T12:00:00.000000Z",
          reviewer: null,
          reading_minutes: 6,
          cover_image_url: coverUrl,
          cover_image_alt: "抽象的人格画像、算法节点与控制边界构成的冷静编辑部封面",
          cover_image_width: 1200,
          cover_image_height: 675,
          cover_image_variants: {
            hero: coverUrl,
            card: coverUrl,
            thumbnail: coverUrl,
            og: coverUrl,
            preload: coverUrl,
          },
          status: "published",
          is_public: true,
          is_indexable: true,
          sitemap_eligible: false,
          llms_eligible: false,
          published_revision_id: 17,
          published_at: "2026-04-18T00:00:00Z",
          category: {
            id: 1,
            slug: "personality-and-ai",
            name: "人工智能与人格",
          },
          tags: [
            { id: 1, slug: "ai", name: "AI" },
            { id: 2, slug: "algorithm-trust", name: "算法信任" },
          ],
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const article = await getCmsArticle("how-personality-shapes-attitude-toward-ai", "zh");
    expect(article).not.toBeNull();
    expect(article?.coverImageUrl).toBe(coverUrl);
    expect(article?.coverImageAlt).toContain("算法节点");
    expect(article?.coverImageWidth).toBe(1200);
    expect(article?.coverImageHeight).toBe(675);
    expect(article?.coverImageVariants.hero?.url).toBe(coverUrl);
    expect(article?.authorName).toBe("Fermat Institute");
    expect(article?.publicReview).toEqual({
      reviewState: "approved",
      lastReviewedAt: "2026-07-18T12:00:00.000Z",
      reviewer: null,
    });
    expect(article).not.toHaveProperty("reviewerName");
    expect(article?.readingMinutes).toBe(6);
    expect(article?.isIndexable).toBe(true);
    expect(article?.sitemapEligible).toBe(false);
    expect(article?.llmsEligible).toBe(false);
    expect(article?.category?.name).toBe("人工智能与人格");
    expect(article?.tags.map((tag) => tag.name)).toEqual(expect.arrayContaining(["AI", "算法信任"]));

    const seo = await getCmsArticleSeo("how-personality-shapes-attitude-toward-ai", "zh");
    expect(seo?.meta.og.image).toBe(coverUrl);
    expect(seo?.meta.twitter.image).toBe(coverUrl);
  });
});
