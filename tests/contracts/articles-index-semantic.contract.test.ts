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
  currentPage = 1
) {
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
    expect(enHtml).toContain(">Articles<");
    expect(zhHtml).toContain(">文章<");
  });

  it("emits CollectionPage and BreadcrumbList JSON-LD from the visible index title and subtitle", async () => {
    const html = await renderArticlesIndex("en");

    expect(html).toContain('id="articles-collection-en"');
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"url":"https://fermatmind.com/en/articles"');
    expect(html).toContain('"name":"Articles"');
    expect(html).toContain("Tool explainers, growth guidance, and narrative portraits grouped by assessment.");
    expect(html).toContain('id="articles-breadcrumb-en"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("keeps the empty state below the single article-index h1", async () => {
    const html = await renderArticlesIndex("en", []);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(">Articles<");
    expect(html).toContain("<h2");
    expect(html).toContain("No published articles yet");
  });

  it("uses four editorial features and a complete four-by-four archive grid on the first full page", async () => {
    const html = await renderArticlesIndex("en", articleFixtures(20));

    expect(html).toContain('data-testid="articles-featured-grid"');
    expect(html.match(/data-article-layout="featured-lead"/g)).toHaveLength(1);
    expect(html.match(/data-article-layout="featured-secondary"/g)).toHaveLength(3);
    expect(html.match(/data-article-layout="archive"/g)).toHaveLength(16);
    expect(html).toContain('data-layout-mode="first-page"');
  });

  it("renders later pages as a full twenty-card archive without repeating the feature layout", async () => {
    const html = await renderArticlesIndex("en", articleFixtures(20), 2);

    expect(html).not.toContain('data-testid="articles-featured-grid"');
    expect(html.match(/data-article-layout="archive"/g)).toHaveLength(20);
    expect(html).toContain('data-layout-mode="archive-page"');
    expect(html).toContain(">Articles · Page 2<");
  });

  it("keeps a single final archive card left-aligned in normal reading order", async () => {
    const html = await renderArticlesIndex("en", articleFixtures(9), 5);

    expect(html).toContain(
      'class="group flex min-h-full flex-col sm:col-span-2 lg:col-span-2"'
    );
    expect(html).not.toContain("col-start-");
  });
});
