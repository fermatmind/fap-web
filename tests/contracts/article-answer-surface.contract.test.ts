import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { CmsArticle } from "@/lib/cms/articles";

const answerSurfaceFixture: AnswerSurfaceViewModel = {
  version: "answer.surface.v1",
  answerContractVersion: "answer.surface.v1",
  answerFingerprint: "article-answer-surface-fixture",
  answerScope: "public_indexable_detail",
  surfaceType: "article_public_detail",
  summaryBlocks: [
    {
      key: "quick_answer",
      title: "When should I use this guide?",
      body: "Use it when you want a fast interpretation before reading the full article.",
      href: null,
      kind: "quick_answer",
    },
  ],
  faqBlocks: [
    {
      key: "faq_use",
      question: "When should I use the article FAQ?",
      answer: "Use it when you need the shortest answer before the full guide.",
    },
  ],
  compareBlocks: [],
  sceneSummaryBlocks: [],
  nextStepBlocks: [
    {
      key: "next_read",
      title: "Read the full article",
      body: "Continue with the full explanation and examples.",
      href: "/en/articles/answer-surface-article",
      kind: "article",
    },
  ],
  answerBundle: [],
  evidenceRefs: ["article:answer-surface-article"],
  publicSafetyState: null,
  indexabilityState: "indexable",
  attributionScope: "article_detail",
  seoSurfaceRef: null,
  landingSurfaceRef: null,
  publicSurfaceRef: null,
  primaryContentRef: "article:answer-surface-article",
  relatedSurfaceKeys: [],
  runtimeArtifactRef: null,
};

function makeArticle(answerSurface: AnswerSurfaceViewModel | null = answerSurfaceFixture): CmsArticle {
  return {
    id: 12,
    slug: "answer-surface-article",
    locale: "en",
    title: "Answer Surface Article",
    excerpt: "A visible article excerpt.",
    contentMd: "## Full guide\n\nThis is the full article body.",
    contentHtml: "",
    authorName: null,
    reviewerName: null,
    readingMinutes: 5,
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
    createdAt: "2026-03-31T00:00:00Z",
    updatedAt: "2026-04-02T00:00:00Z",
    category: { id: 1, slug: "guides", name: "Guides" },
    tags: [],
    seoMeta: null,
    landingSurface: null,
    answerSurface,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

async function renderArticleDetail(article: CmsArticle) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
  vi.doMock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: ReactNode }) =>
      createElement("a", { href, ...props }, children),
  }));
  vi.doMock("@/lib/cms/articles", async () => {
    const actual = await vi.importActual<typeof import("@/lib/cms/articles")>("@/lib/cms/articles");

    return {
      ...actual,
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: article })),
      getCmsArticleSeoWithLastKnownGood: vi.fn(async () => ({ value: null })),
    };
  });

  const { default: ArticleDetailPage } = await import("@/app/(localized)/[locale]/articles/[slug]/page");
  const page = await ArticleDetailPage({
    params: Promise.resolve({ locale: "en", slug: article.slug }),
  });

  return renderToStaticMarkup(page as ReactNode);
}

describe("article answer surface rendering", () => {
  it("renders existing answer_surface_v1 blocks visibly on article detail", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).toContain('data-testid="article-detail-answer-surface"');
    expect(html).toContain("Quick answers");
    expect(html).toContain("When should I use this guide?");
    expect(html).toContain("Use it when you want a fast interpretation before reading the full article.");
    expect(html).toContain("FAQ");
    expect(html).toContain("When should I use the article FAQ?");
    expect(html).toContain("Use it when you need the shortest answer before the full guide.");
    expect(html).toContain("Next steps");
    expect(html).toContain("Read the full article");
  });

  it("emits FAQPage JSON-LD only from the visibly rendered answer surface FAQ", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).toContain('id="article-faq-answer-surface-article"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"When should I use the article FAQ?"');
    expect(html).toContain('"text":"Use it when you need the shortest answer before the full guide."');
    expect(html).toContain("When should I use the article FAQ?");
    expect(html).toContain("Use it when you need the shortest answer before the full guide.");
  });

  it("preserves Article and Breadcrumb JSON-LD on article detail", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).toContain('id="article-jsonld-answer-surface-article"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('id="article-breadcrumb-answer-surface-article"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("does not emit FAQPage JSON-LD when no visible answer-surface FAQ exists", async () => {
    const article = makeArticle({
      ...answerSurfaceFixture,
      faqBlocks: [],
    });
    const html = await renderArticleDetail(article);

    expect(html).toContain('data-testid="article-detail-answer-surface"');
    expect(html).not.toContain('"@type":"FAQPage"');
    expect(html).not.toContain('id="article-faq-answer-surface-article"');
  });

  it("does not render an answer-surface section when article answer_surface_v1 is absent", async () => {
    const html = await renderArticleDetail(makeArticle(null));

    expect(html).not.toContain('data-testid="article-detail-answer-surface"');
    expect(html).not.toContain('"@type":"FAQPage"');
  });
});
