import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CmsArticle, CmsBlog } from "@/lib/cms/articles";
import { articleCategoryLabel } from "@/lib/content/articleCategoryLabel";

vi.hoisted(() => { process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com"; });
const category = { id: 11, slug: "career-exploration", name: "职业探索" };
const blog = (name: string): CmsBlog => ({ configurationState: "published", isIndexable: false, title: "Blog", description: "Description",
  categories: [{ slug: category.slug, name, lineKey: "career-and-learning", description: "Description", articleCount: 2 }], featuredItems: [] });
const article: CmsArticle = { id: 240, slug: "big-five-vs-riasec-personality-traits-and-career-interests", locale: "en",
  title: "Personality and interests", excerpt: "Summary", contentMd: "Body", contentHtml: "", authorName: null, readingMinutes: null,
  publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
  coverImageUrl: null, coverImageAlt: null, coverImageWidth: null, coverImageHeight: null,
  coverImageVariants: { hero: null, card: null, thumbnail: null, square: null, og: null, preload: null },
  relatedTestSlug: null, voice: null, voiceOrder: null, status: "published", isPublic: true, isIndexable: false,
  publishedRevisionId: 777, publishedAt: "2026-03-12T00:00:00Z", scheduledAt: null, createdAt: null, updatedAt: null,
  category, tags: [], seoMeta: null, landingSurface: null, answerSurface: null };
const data = (name: string) => ({ blog: blog(name), items: [article], landingSurface: null,
  pagination: { currentPage: 1, perPage: 20, total: 1, lastPage: 1 } });

afterEach(() => { vi.doUnmock("@/lib/cms/articles"); vi.resetModules(); });
describe("article badges use published CMS category labels", () => {
  it.each([["en", "Career and learning choices"], ["zh", "职业与学习选择"]] as const)("renders the %s label in detail and archive without altering taxonomy", async (locale, name) => {
    vi.resetModules();
    const getBlog = vi.fn(async () => ({ value: data(name), source: "fresh", stale: false }));
    vi.doMock("@/lib/cms/articles", async (original) => ({ ...await original<typeof import("@/lib/cms/articles")>(),
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: { ...article, locale }, source: "fresh" })),
      getCmsArticleSeoWithLastKnownGood: vi.fn(async () => ({ value: null, source: "fresh" })),
      getCmsArticlesWithLastKnownGood: getBlog,
    }));
    const { default: Page } = await import("@/app/(localized)/[locale]/articles/[slug]/page");
    const { BlogArchiveView } = await import("@/components/articles/BlogArchiveView");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale, slug: article.slug }) }));
    expect(html).toContain(name);
    expect(html).not.toContain("职业探索");
    expect(getBlog).toHaveBeenCalledWith(expect.objectContaining({ locale, includeBlog: true }));
    const archive = renderToStaticMarkup(<BlogArchiveView locale={locale} state={{ data: data(name), stale: false, failed: false }} />);
    expect(archive).toContain(name);
    expect(archive).not.toContain("职业探索");
    expect(archive).toContain(`href="/${locale}/articles/${article.slug}"`);
    expect(category).toEqual({ id: 11, slug: "career-exploration", name: "职业探索" });
    expect(article).toMatchObject({ id: 240, publishedRevisionId: 777, isIndexable: false });
  });
  it("preserves legacy same-language names and never substitutes an unrelated or invalid CMS label", () => {
    const wrong = { ...blog("Unrelated"), categories: [{ ...blog("Unrelated").categories[0], slug: "other" }] };
    for (const config of [undefined, wrong, { ...blog("Unpublished"), configurationState: "invalid" as const }]) {
      expect(articleCategoryLabel(category, config, "en")).toBeNull();
      expect(articleCategoryLabel(category, config, "zh")).toBe("职业探索");
      expect(articleCategoryLabel({ ...category, name: "Legacy category" }, config, "en")).toBe("Legacy category");
    }
    expect(articleCategoryLabel(null, blog("Career"), "en")).toBeNull();
  });
});
