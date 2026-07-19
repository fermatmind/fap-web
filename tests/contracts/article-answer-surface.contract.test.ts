import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { resolveArticleRuntimeContract, type CmsArticle } from "@/lib/cms/articles";
import type { LandingSurfaceViewModel } from "@/lib/landing/landingSurface";

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

const landingSurfaceFixture: LandingSurfaceViewModel = {
  version: "landing.surface.v1",
  landingContractVersion: "landing.surface.v1",
  landingFingerprint: "article-landing-surface-fixture",
  landingScope: "public_indexable_detail",
  entrySurface: "article_detail",
  entryType: "editorial_article",
  summaryBlocks: [],
  discoverabilityItems: [],
  discoverabilityKeys: ["article_index", "topic_hub"],
  continueReadingKeys: ["article_index"],
  startTestTarget: "/en/tests/mbti-personality-test-16-personality-types",
  resultResumeTarget: null,
  contentContinueTarget: "/en/articles",
  ctaBundle: [
    {
      key: "back_to_articles",
      label: "Back to articles",
      href: "/en/articles",
      kind: "content_continue",
    },
    {
      key: "topic_hub",
      label: "Browse topic hubs",
      href: "/en/topics",
      kind: "discover",
    },
    {
      key: "start_test",
      label: "Take the test",
      href: "/en/tests/mbti-personality-test-16-personality-types",
      kind: "start_test",
    },
  ],
  indexabilityState: "indexable",
  attributionScope: "public_article_detail",
  seoSurfaceRef: null,
  publicSurfaceRef: null,
  surfaceFamily: "article",
  primaryContentRef: "answer-surface-article",
  relatedSurfaceKeys: ["topic_hub", "tests_index"],
  shareSafetyState: null,
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
  publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
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

async function renderArticleDetail(article: CmsArticle, seo: unknown = null) {
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
      getCmsArticleSeoWithLastKnownGood: vi.fn(async () => ({ value: seo })),
    };
  });

  const { default: ArticleDetailPage } = await import("@/app/(localized)/[locale]/articles/[slug]/page");
  const page = await ArticleDetailPage({
    params: Promise.resolve({ locale: "en", slug: article.slug }),
  });

  return renderToStaticMarkup(page as ReactNode);
}

describe("article answer surface rendering", () => {
  it("classifies article runtime completeness from backend/CMS surfaces only", () => {
    const article = {
      ...makeArticle(),
      relatedTestSlug: "mbti-personality-test-16-personality-types",
      landingSurface: landingSurfaceFixture,
    };
    const contract = resolveArticleRuntimeContract(article);
    const byKey = new Map(contract.features.map((feature) => [feature.key, feature]));

    expect(contract).toMatchObject({
      version: "article.runtime.v1",
      pageFamily: "article_detail",
    });
    expect(byKey.get("visible_faq")).toMatchObject({
      state: "backend_cms_provided",
      visible: true,
      frontendFallbackPolicy: "forbidden_frontend_fallback",
      source: "answer_surface_v1.faq_blocks",
    });
    expect(byKey.get("visible_cta")).toMatchObject({
      state: "backend_cms_provided",
      visible: true,
      source: "landing_surface_v1.cta_bundle|answer_surface_v1.next_step_blocks",
    });
    expect(byKey.get("related_test")).toMatchObject({
      state: "backend_cms_provided",
      visible: true,
    });
    expect(byKey.get("related_topic")).toMatchObject({
      state: "backend_cms_provided",
      visible: true,
    });
    expect(byKey.get("evidence_citation")).toMatchObject({
      state: "backend_cms_provided",
      visible: true,
      source: "answer_surface_v1.evidence_refs",
    });
    expect(byKey.get("related_articles")).toMatchObject({
      state: "missing_deferred",
      visible: false,
      frontendFallbackPolicy: "forbidden_frontend_fallback",
    });
    expect(byKey.get("report_preview")).toMatchObject({
      state: "missing_deferred",
      visible: false,
      frontendFallbackPolicy: "forbidden_frontend_fallback",
    });
    expect(byKey.get("claim_boundary_metadata")).toMatchObject({
      state: "missing_deferred",
      visible: false,
      frontendFallbackPolicy: "forbidden_frontend_fallback",
    });
  });

  it("keeps absent article runtime features deferred instead of granting frontend fallback authority", () => {
    const contract = resolveArticleRuntimeContract(makeArticle(null));

    expect(contract.features).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "visible_faq",
          state: "missing_deferred",
          frontendFallbackPolicy: "forbidden_frontend_fallback",
        }),
        expect.objectContaining({
          key: "visible_cta",
          state: "missing_deferred",
          frontendFallbackPolicy: "forbidden_frontend_fallback",
        }),
        expect.objectContaining({
          key: "related_articles",
          state: "missing_deferred",
          frontendFallbackPolicy: "forbidden_frontend_fallback",
        }),
      ])
    );
  });

  it("renders article answer_surface_v1 FAQ and CTA blocks while hiding duplicate summary blocks on article detail", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).toContain('data-testid="article-detail-answer-surface"');
    expect(html).not.toContain("Quick answers");
    expect(html).not.toContain("When should I use this guide?");
    expect(html).not.toContain("Use it when you want a fast interpretation before reading the full article.");
    expect(html).toContain("FAQ");
    expect(html).toContain("When should I use the article FAQ?");
    expect(html).toContain("Use it when you need the shortest answer before the full guide.");
    expect(html).toContain("Read the full article");
    expect(html).not.toContain("Quick summary");
    expect(html).not.toContain("Next steps");
  });

  it("holds FAQPage JSON-LD by default even when the answer surface FAQ is visible", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).not.toContain('id="article-faq-answer-surface-article"');
    expect(html).not.toContain('"@type":"FAQPage"');
    expect(html).toContain("When should I use the article FAQ?");
    expect(html).toContain("Use it when you need the shortest answer before the full guide.");
  });

  it("holds Article and Breadcrumb JSON-LD by default for indexable article detail", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).not.toContain('id="article-jsonld-answer-surface-article"');
    expect(html).not.toContain('"@type":"Article"');
    expect(html).not.toContain('id="article-breadcrumb-answer-surface-article"');
    expect(html).not.toContain('"@type":"BreadcrumbList"');
  });

  it("does not emit article JSON-LD for noindex article detail", async () => {
    const html = await renderArticleDetail({
      ...makeArticle(),
      isIndexable: false,
    });

    expect(html).not.toContain('id="article-jsonld-answer-surface-article"');
    expect(html).not.toContain('id="article-breadcrumb-answer-surface-article"');
    expect(html).not.toContain('id="article-faq-answer-surface-article"');
    expect(html).not.toContain('"@type":"Article"');
    expect(html).not.toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('"@type":"FAQPage"');
  });

  it("emits Article, Breadcrumb, and FAQPage JSON-LD only when an explicit article schema gate allows it", async () => {
    const article = {
      ...makeArticle(),
      seoMeta: {
        schema_json: {
          article_schema_gate_v1: {
            enabled: true,
          },
          breadcrumb_schema_gate_v1: {
            enabled: true,
          },
          faq_schema_gate_v1: {
            enabled: true,
          },
        },
      },
    };
    const html = await renderArticleDetail(article);

    expect(html).toContain('id="article-jsonld-answer-surface-article"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('id="article-breadcrumb-answer-surface-article"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('id="article-faq-answer-surface-article"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"When should I use the article FAQ?"');
    expect(html).toContain('"text":"Use it when you need the shortest answer before the full guide."');
  });

  it("does not duplicate standalone FAQPage JSON-LD when CMS Article JSON-LD already contains FAQPage", async () => {
    const article = {
      ...makeArticle(),
      slug: "what-is-riasec-holland-code-career-interest-test",
    };
    const seo = {
      meta: {
        title: "What Is RIASEC?",
        description: "A CMS-backed article.",
        canonical: "https://fermatmind.com/en/articles/what-is-riasec-holland-code-career-interest-test",
        robots: "index, follow",
        alternates: {},
        og: {},
        twitter: {},
      },
      surface: null,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": "https://fermatmind.com/en/articles/what-is-riasec-holland-code-career-interest-test#article",
        headline: "What Is RIASEC?",
        hasPart: [
          {
            "@type": "FAQPage",
            "@id": "https://fermatmind.com/en/articles/what-is-riasec-holland-code-career-interest-test#faq",
            mainEntity: [
              {
                "@type": "Question",
                name: "When should I use the article FAQ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Use it when you need the shortest answer before the full guide.",
                },
              },
            ],
          },
        ],
      },
    };
    const html = await renderArticleDetail(article, seo);

    expect(html).toContain('id="article-jsonld-what-is-riasec-holland-code-career-interest-test"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@id":"https://fermatmind.com/en/articles/what-is-riasec-holland-code-career-interest-test#faq"');
    expect(html).not.toContain('id="article-faq-what-is-riasec-holland-code-career-interest-test"');
    expect(html.match(/"@type":"FAQPage"/g)).toHaveLength(1);
    expect(html).toContain("When should I use the article FAQ?");
  });

  it("emits Article and Breadcrumb JSON-LD without FAQPage when granular gates hold FAQ schema", async () => {
    const article = {
      ...makeArticle(),
      slug: "choose-career-using-personality-tests",
      seoMeta: {
        schema_json: {
          article_schema_gate_v1: {
            enabled: true,
          },
          breadcrumb_schema_gate_v1: {
            enabled: true,
          },
          faq_schema_gate_v1: {
            enabled: false,
          },
        },
      },
    };
    const html = await renderArticleDetail(article);

    expect(html).toContain('id="article-jsonld-choose-career-using-personality-tests"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('id="article-breadcrumb-choose-career-using-personality-tests"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('id="article-faq-choose-career-using-personality-tests"');
    expect(html).not.toContain('"@type":"FAQPage"');
  });

  it("lets projected granular gates override a legacy schema hold without exposing the control flag", async () => {
    const article = {
      ...makeArticle(),
      slug: "major-category-program-tracking-riasec-choice-checklist",
      seoMeta: {
        schema_json: { enabled: false },
        schema_gates_v1: {
          article_schema_gate_v1: { enabled: true },
          breadcrumb_schema_gate_v1: { enabled: true },
          faq_schema_gate_v1: { enabled: false },
        },
      },
    };
    const seo = {
      meta: {
        title: "Program Tracking Checklist",
        description: "Compare tracks with courses, criteria, and RIASEC.",
        canonical: "https://fermatmind.com/en/articles/major-category-program-tracking-riasec-choice-checklist",
        robots: "index,follow",
        alternates: {},
        og: {},
        twitter: {},
      },
      surface: null,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Program Tracking Checklist",
        enabled: false,
      },
    };

    const html = await renderArticleDetail(article, seo);

    expect(html).toContain('id="article-jsonld-major-category-program-tracking-riasec-choice-checklist"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('id="article-breadcrumb-major-category-program-tracking-riasec-choice-checklist"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('id="article-faq-major-category-program-tracking-riasec-choice-checklist"');
    expect(html).not.toContain('"@type":"FAQPage"');
    expect(html).not.toContain('"enabled":false');
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

  it("does not fabricate sidebar CTAs when article landing_surface_v1 is absent", async () => {
    const html = await renderArticleDetail(makeArticle());

    expect(html).toContain('data-article-runtime-contract="article.runtime.v1"');
    expect(html).not.toContain("Keep exploring");
    expect(html).not.toContain("Back to articles");
    expect(html).not.toContain("Take the test");
    expect(html).not.toContain("article_detail_seo_cta");
  });
});
