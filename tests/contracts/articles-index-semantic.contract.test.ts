import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CmsArticle } from "@/lib/cms/articles";

const articleFixture: CmsArticle = {
  id: 1,
  slug: "mbti-basics",
  locale: "en",
  title: "MBTI basics",
  excerpt: "A visible article excerpt.",
  contentMd: "",
  contentHtml: "",
  authorName: null,
  publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
  readingMinutes: 4,
  coverImageUrl: null,
  coverImageAlt: null,
  coverImageWidth: null,
  coverImageHeight: null,
  coverImageVariants: {
    hero: null,
    card: null,
    thumbnail: null,
    square: null,
    og: null,
    preload: null,
  },
  relatedTestSlug: null,
  voice: "tool",
  voiceOrder: null,
  status: "published",
  isPublic: true,
  isIndexable: true,
  publishedRevisionId: 1,
  publishedAt: "2026-04-01T00:00:00Z",
  scheduledAt: null,
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-02T00:00:00Z",
  category: { id: 1, slug: "personality", name: "Personality" },
  tags: [],
  seoMeta: null,
  landingSurface: null,
  answerSurface: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

function articleFixtures(count: number, locale: "en" | "zh" = "en"): CmsArticle[] {
  return Array.from({ length: count }, (_, index) => ({
    ...articleFixture,
    id: index + 1,
    slug: `article-${index + 1}`,
    locale,
    title: locale === "zh" ? `文章标题 ${index + 1}` : `Article title ${index + 1}`,
  }));
}

async function renderArticlesIndex(
  locale: "en" | "zh",
  items: CmsArticle[] = [articleFixture],
  currentPage = 1,
  withFeatures = false
) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
  vi.doMock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: ReactNode }) =>
      createElement("a", { href, ...props }, children),
  }));
  vi.doMock("@/lib/cms/articles", async () => {
    const actual = await vi.importActual<typeof import("@/lib/cms/articles")>("@/lib/cms/articles");

    return {
      ...actual,
      getCmsArticlesWithLastKnownGood: vi.fn(async () => ({
        value: {
          blog: { configurationState: "published", isIndexable: true,
            title: locale === "zh" ? "费马博客" : "FermatMind Blog", description: "A CMS-owned blog introduction.",
            categories: [], featuredItems: withFeatures ? [items[3], items[1], items[0], items[2]].filter(Boolean) : [] },
          items,
          pagination: {
            currentPage,
            perPage: 20,
            total: items.length,
            lastPage: Math.max(currentPage, 1),
          },
          landingSurface: null,
        },
      })),
    };
  });

  const { default: ArticlesPage } = await import("@/app/(localized)/[locale]/articles/page");
  const page = await ArticlesPage({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve(currentPage > 1 ? { page: String(currentPage) } : {}),
  });

  return renderToStaticMarkup(page as ReactNode);
}

describe("articles index semantic baseline", () => {
  it("renders exactly one visible h1 on populated English and Chinese article indexes", async () => {
    const enHtml = await renderArticlesIndex("en");
    const zhHtml = await renderArticlesIndex("zh", [{ ...articleFixture, locale: "zh", title: "MBTI 基础" }]);

    expect(enHtml.match(/<h1\b/g)).toHaveLength(1);
    expect(zhHtml.match(/<h1\b/g)).toHaveLength(1);
    expect(enHtml).toContain(">FermatMind Blog<");
    expect(zhHtml).toContain(">费马博客<");
  });

  it("emits CollectionPage and BreadcrumbList JSON-LD from the visible index title and subtitle", async () => {
    const html = await renderArticlesIndex("en");

    expect(html).toContain('id="articles-collection-en"');
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"url":"https://fermatmind.com/en/articles"');
    expect(html).toContain('"name":"FermatMind Blog"');
    expect(html).toContain("A CMS-owned blog introduction.");
    expect(html).toContain('id="articles-breadcrumb-en"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("keeps the empty state below the single article-index h1", async () => {
    const html = await renderArticlesIndex("en", []);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(">FermatMind Blog<");
    expect(html).toContain("<h2");
    expect(html).toContain("No published articles yet");
  });

  it("uses four CMS editorial features and keeps all twenty latest articles", async () => {
    const html = await renderArticlesIndex("en", articleFixtures(20), 1, true);

    expect(html).toContain('data-testid="articles-featured-grid"');
    expect(html.match(/data-article-layout="featured"/g)).toHaveLength(4);
    expect(html.match(/data-article-layout="archive"/g)).toHaveLength(20);
    expect(html).toContain('data-layout-mode="first-page"');
  });

  it("renders later pages as a full twenty-card archive without repeating the feature layout", async () => {
    const html = await renderArticlesIndex("en", articleFixtures(20), 2);

    expect(html).not.toContain('data-testid="articles-featured-grid"');
    expect(html.match(/data-article-layout="archive"/g)).toHaveLength(20);
    expect(html).toContain('data-layout-mode="archive-page"');
    expect(html).toContain(">FermatMind Blog · Page 2<");
  });

  it("keeps a single final archive card left-aligned in normal reading order", async () => {
    const html = await renderArticlesIndex("en", articleFixtures(9), 5);

    expect(html).toContain(
      'class="group flex min-h-full flex-col"'
    );
    expect(html).not.toContain("col-start-");
  });

  it.each([1, 2])("hides Chinese CMS badges and uses article titles for Chinese cover alt across page %i cards", async (page) => {
    const items = articleFixtures(6).map((article) => ({
      ...article,
      category: { id: 1, slug: "personality", name: "人格分类" },
      tags: [
        { id: 1, slug: "growth", name: "成长标签" },
        { id: 2, slug: "english", name: "English tag" },
      ],
      coverImageUrl: "https://api.fermatmind.com/media/articles/cover.webp",
      coverImageAlt: "中文封面说明",
    }));
    const original = JSON.stringify(items);
    const html = await renderArticlesIndex("en", items, page);

    expect(html).not.toContain("人格分类");
    expect(html).not.toContain("成长标签");
    expect(html).not.toContain("中文封面说明");
    expect(html).toContain(">English tag<");
    for (const article of items) {
      expect(html).toContain(`alt="${article.title}"`);
      expect(html).toContain(`href="/en/articles/${article.slug}"`);
    }
    expect(JSON.stringify(items)).toBe(original);
  });

  it("preserves English CMS labels and alt text across every card layout", async () => {
    const items = articleFixtures(6).map((article) => ({
      ...article,
      coverImageUrl: "https://api.fermatmind.com/media/articles/cover.webp",
      coverImageAlt: `Cover for ${article.title}`,
      tags: [{ id: 2, slug: "growth", name: "Growth" }],
    }));
    const html = await renderArticlesIndex("en", items);

    expect(html.match(/>Personality</g)).toHaveLength(6);
    expect(html).toContain(">Growth<");
    for (const article of items) expect(html).toContain(`alt="${article.coverImageAlt}"`);
  });

  it("preserves Chinese CMS labels and alt text on Chinese first and later pages", async () => {
    const items = articleFixtures(6, "zh").map((article) => ({
      ...article,
      category: { id: 1, slug: "personality", name: "人格分类" },
      tags: [{ id: 1, slug: "growth", name: "成长标签" }],
      coverImageUrl: "https://api.fermatmind.com/media/articles/cover.webp",
      coverImageAlt: "中文封面说明",
    }));
    for (const page of [1, 2]) {
      const html = await renderArticlesIndex("zh", items, page);
      expect(html.match(/>人格分类</g)).toHaveLength(6);
      expect(html).toContain(">成长标签<");
      expect(html.match(/alt="中文封面说明"/g)).toHaveLength(6);
    }
  });

});
