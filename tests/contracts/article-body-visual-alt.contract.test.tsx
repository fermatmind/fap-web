import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CmsArticle } from "@/lib/cms/articles";

vi.hoisted(() => { process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com"; });

afterEach(() => {
  vi.doUnmock("@/lib/cms/articles");
  vi.resetModules();
});

describe("article body image alternative text", () => {
  it.each(["en", "zh"] as const)("keeps independent body images separate from the cover in %s", async (locale) => {
    const title = locale === "zh" ? "九型职场观察练习" : "Enneagram workplace observation worksheet";
    const coverAlt = locale === "zh" ? "五位同事围坐会议桌" : "Five colleagues at a meeting table";
    const coverUrl = "https://assets.fermatmind.com/articles/cover.jpg";
    const bodyUrl = "https://assets.fermatmind.com/articles/worksheet.jpg";
    const article: CmsArticle = {
      id: 69, slug: "enneagram-workplace-friction-core-motivations", locale,
      title, excerpt: "Summary", contentMd: "Body", contentHtml: "", authorName: null, readingMinutes: null,
      publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
      coverImageUrl: coverUrl, coverImageAlt: coverAlt, coverImageWidth: null, coverImageHeight: null,
      coverImageVariants: { hero: null, card: null, thumbnail: null, square: null, og: null, preload: null },
      bodyVisual: { imageUrl: bodyUrl, fallbackAuthorized: false },
      relatedTestSlug: null, voice: null, voiceOrder: null, status: "published", isPublic: true, isIndexable: false,
      publishedRevisionId: 882, publishedAt: null, scheduledAt: null, createdAt: null, updatedAt: null,
      category: null, tags: [], seoMeta: null, landingSurface: null, answerSurface: null,
    };
    vi.doMock("@/lib/cms/articles", async (original) => ({
      ...await original<typeof import("@/lib/cms/articles")>(),
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: article, source: "fresh" })),
      getCmsArticleSeoWithLastKnownGood: vi.fn(async () => ({ value: null, source: "fresh" })),
      getCmsArticlesWithLastKnownGood: vi.fn(async () => ({ value: { items: [], blog: null }, source: "fresh", stale: false })),
    }));
    const { default: Page } = await import("@/app/(localized)/[locale]/articles/[slug]/page");
    async function images() {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale, slug: article.slug }) }));
      const document = new DOMParser().parseFromString(html, "text/html");
      return {
        cover: document.querySelector("header img"),
        body: document.querySelector("article img"),
      };
    }

    const independent = await images();
    expect(independent.cover?.getAttribute("alt")).toBe(coverAlt);
    expect(independent.body?.getAttribute("src")).toBe(bodyUrl);
    expect(independent.body?.getAttribute("alt")).toBe(title);

    article.bodyVisual = { imageUrl: coverUrl, fallbackAuthorized: false };
    expect((await images()).body?.getAttribute("alt")).toBe(coverAlt);

    article.coverImageAlt = null;
    const fallback = await images();
    expect(fallback.cover?.getAttribute("alt")).toBe(title);
    expect(fallback.body?.getAttribute("alt")).toBe(title);
  });
});
