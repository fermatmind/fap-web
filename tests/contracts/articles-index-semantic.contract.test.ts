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

async function renderArticlesIndex(locale: "en" | "zh", items: CmsArticle[] = [articleFixture]) {
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
            currentPage: 1,
            perPage: 20,
            total: items.length,
            lastPage: 1,
          },
          landingSurface: null,
        },
      })),
    };
  });

  const { default: ArticlesPage } = await import("@/app/(localized)/[locale]/articles/page");
  const page = await ArticlesPage({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve({}),
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
});
