import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_ARTICLE_LIST_PAGE,
  MAX_ARTICLE_SLUG_LENGTH,
  getCmsArticle,
  getCmsArticleSeo,
  getCmsArticles,
  getCmsArticlesWithLastKnownGood,
  listCmsArticlesForLlms,
  normalizeArticleListPage,
  normalizeArticleSeoPayload,
  normalizeArticleSlug,
} from "@/lib/cms/articles";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

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
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("articles cleanup contract", () => {
  it("frontend next-sitemap keeps article landing and detail authority available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/v0.5/articles?")) {
          return jsonResponse({
            ok: true,
            items: [
              {
                slug: "mbti-basics",
                locale: url.includes("locale=zh-CN") ? "zh-CN" : "en",
                title: "MBTI Basics",
                is_public: true,
                is_indexable: true,
                status: "published",
                published_revision_id: 1,
              },
            ],
            pagination: {
              current_page: 1,
              per_page: 100,
              total: 1,
              last_page: 1,
            },
          });
        }

        return jsonResponse({
          ok: true,
          items: [],
          pagination: {
            current_page: 1,
            per_page: 100,
            total: 0,
            last_page: 1,
          },
        });
      })
    );

    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(config.generateIndexSitemap).toBe(false);
    expect(locs).toEqual(expect.arrayContaining(["/en/articles", "/zh/articles"]));
    expect(locs).toEqual(expect.arrayContaining(["/en/articles/mbti-basics", "/zh/articles/mbti-basics"]));
  });

  it("article detail page consumes adapter-normalized seo payload without page-level repair helpers", () => {
    const source = read("app/(localized)/[locale]/articles/[slug]/page.tsx");

    expect(source).toContain('from "@/lib/cms/articles"');
    expect(source).toContain("AnswerSurfaceSection");
    expect(source).toContain("article.answerSurface");
    expect(source).toContain('testId="article-detail-answer-surface"');
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain('findLandingCta(article.landingSurface, "back_to_articles")');
    expect(source).not.toContain("normalizeStructuredDataUrls");
    expect(source).toContain("seo?.surface?.canonicalUrl ?? seo?.meta.canonical");
    expect(source).toContain("seoSurface: seo?.surface");
    expect(source).toContain("normalizeArticleJsonLdAuthor(seo?.jsonld) ||");
  });

  it("llms routes use cms article enumeration instead of local blog helpers", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(llms).toContain("listCmsArticlesForLlms");
    expect(llmsFull).toContain("listCmsArticlesForLlms");
    expect(llms).not.toContain("listBlogPosts");
    expect(llmsFull).not.toContain("listBlogPosts");
  });

  it("seo tooling treats the root sitemap as the canonical generated artifact", () => {
    const checkSitemap = read("scripts/seo/check-sitemap-indexability.mjs");
    const pushBaidu = read("scripts/seo/push-baidu.mjs");

    expect(checkSitemap).toContain('"public/sitemap.xml"');
    expect(pushBaidu).toContain('"public/sitemap.xml"');
    expect(checkSitemap).not.toContain('"public/sitemap-0.xml"');
    expect(pushBaidu).not.toContain('"public/sitemap-0.xml"');
  });

  it("articles cms adapter normalizes canonical, alternates, and jsonld urls", () => {
    const normalized = normalizeArticleSeoPayload(
      {
        meta: {
          title: "How to Read MBTI Results",
          description: "A practical guide to reading MBTI results.",
          canonical: "https://staging.fermatmind.com/en/articles/how-to-read-mbti-results",
          alternates: {
            en: "https://staging.fermatmind.com/en/articles/how-to-read-mbti-results",
          },
          og: {
            title: "How to Read MBTI Results",
            description: "A practical guide to reading MBTI results.",
            image: null,
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: "How to Read MBTI Results",
            description: "A practical guide to reading MBTI results.",
            image: null,
          },
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "Article",
          url: "https://staging.fermatmind.com/en/articles/how-to-read-mbti-results",
          mainEntityOfPage: "https://staging.fermatmind.com/en/articles/how-to-read-mbti-results",
        },
      },
      "zh",
      "how-to-read-mbti-results"
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.meta.canonical).toBe("http://localhost:3000/zh/articles/how-to-read-mbti-results");
    expect(normalized?.meta.alternates.en).toBe("http://localhost:3000/en/articles/how-to-read-mbti-results");
    expect(normalized?.meta.alternates["zh-CN"]).toBeNull();
    expect(normalized?.surface).toBeNull();
    expect((normalized?.jsonld as Record<string, unknown>).url).toBe(
      "http://localhost:3000/zh/articles/how-to-read-mbti-results"
    );
    expect((normalized?.jsonld as Record<string, unknown>).mainEntityOfPage).toBe(
      "http://localhost:3000/zh/articles/how-to-read-mbti-results"
    );
  });

  it("articles cms adapter paginates locale-scoped llms enumeration", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const page = new URL(url, "http://localhost:3000").searchParams.get("page");

      expect(url).toContain("/api/v0.5/articles?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("org_id=0");
      expect(url).toContain("per_page=100");

      if (page === "1") {
        return jsonResponse({
          ok: true,
          items: [
            {
              slug: "how-to-read-mbti-results",
              locale: "zh-CN",
              title: "如何解读 MBTI 结果",
              excerpt: "从结果到行动的最小路径。",
              status: "published",
              is_public: true,
              published_revision_id: 11,
              is_indexable: true,
              updated_at: "2026-03-10T00:00:00Z",
            },
          ],
          pagination: {
            current_page: 1,
            per_page: 100,
            total: 2,
            last_page: 2,
          },
        });
      }

      return jsonResponse({
        ok: true,
        items: [
          {
            slug: "mbti-common-mistakes",
            locale: "zh-CN",
            title: "MBTI 常见误区",
            excerpt: "避免把类型结论当作定论。",
            status: "published",
            is_public: true,
            published_revision_id: 12,
            is_indexable: false,
            updated_at: "2026-03-11T00:00:00Z",
          },
        ],
        pagination: {
          current_page: 2,
          per_page: 100,
          total: 2,
          last_page: 2,
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const items = await listCmsArticlesForLlms({ locale: "zh" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(items).toEqual([
      {
        slug: "how-to-read-mbti-results",
        locale: "zh",
        title: "如何解读 MBTI 结果",
        excerpt: "从结果到行动的最小路径。",
        href: "/zh/articles/how-to-read-mbti-results",
        isIndexable: true,
        updatedAt: "2026-03-10T00:00:00Z",
      },
      {
        slug: "mbti-common-mistakes",
        locale: "zh",
        title: "MBTI 常见误区",
        excerpt: "避免把类型结论当作定论。",
        href: "/zh/articles/mbti-common-mistakes",
        isIndexable: false,
        updatedAt: "2026-03-11T00:00:00Z",
      },
    ]);
  });

  it("does not use local blog article content when cms detail returns 404", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        {
          message: "Not found",
        },
        404
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const article = await getCmsArticle("mbti-growth-guide", "zh");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(article).toBeNull();
  });

  it("treats unpublished revision contract responses as unavailable instead of rendering them", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/how-personality-shapes-attitude-toward-ai?")) {
        return jsonResponse({
          ok: true,
          article: {
            id: 24,
            slug: "how-personality-shapes-attitude-toward-ai",
            locale: "en",
            title: "Human review draft must not render",
            excerpt: "Draft only.",
            content_md: "Draft body.",
            status: "draft",
            is_public: false,
            is_indexable: false,
            published_revision_id: null,
          },
        });
      }

      return jsonResponse({ ok: true, items: [] });
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getCmsArticle("how-personality-shapes-attitude-toward-ai", "en")).resolves.toBeNull();
  });

  it("filters current 17 to 29 source and human-review sample slugs out of public article lists", async () => {
    const sampleSlugs = [
      "how-personality-shapes-attitude-toward-ai",
      "which-love-script-fits-you-best",
      "are-infj-men-rare-or-socially-silenced",
      "best-valentines-date-by-personality-and-relationship-science",
      "how-16-personality-types-talk-to-an-ai-coach",
      "childhood-dream-job-still-shapes-career-choice",
    ];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const isZh = url.includes("locale=zh-CN");

      return jsonResponse({
        ok: true,
        items: sampleSlugs.map((slug, index) => ({
          id: isZh ? 17 + index : 24 + index,
          slug,
          locale: isZh ? "zh-CN" : "en",
          title: isZh ? `中文源文 ${index + 1}` : `English human review ${index + 1}`,
          excerpt: "Draft only.",
          content_md: "Draft body.",
          status: "draft",
          is_public: false,
          is_indexable: false,
          published_revision_id: null,
        })),
        pagination: {
          current_page: 1,
          per_page: 20,
          total: sampleSlugs.length,
          last_page: 1,
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getCmsArticles({ locale: "zh" })).resolves.toMatchObject({
      items: [],
      pagination: {
        total: 0,
        lastPage: 1,
      },
    });
    await expect(getCmsArticles({ locale: "en" })).resolves.toMatchObject({
      items: [],
      pagination: {
        total: 0,
        lastPage: 1,
      },
    });
  });

  it("accepts equivalent published revision pointer payload shapes without allowing draft rows", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        ok: true,
        items: [
          {
            slug: "snake-case-pointer",
            locale: "zh-CN",
            title: "Snake case pointer",
            status: "Published",
            is_public: true,
            published_revision_id: "44",
          },
          {
            slug: "camel-case-pointer",
            locale: "zh-CN",
            title: "Camel case pointer",
            status: "published",
            is_public: true,
            publishedRevisionId: 45,
          },
          {
            slug: "nested-pointer",
            locale: "zh-CN",
            title: "Nested pointer",
            status: "published",
            is_public: true,
            published_revision: { id: 46 },
          },
          {
            slug: "draft-with-pointer",
            locale: "zh-CN",
            title: "Draft with pointer",
            status: "draft",
            is_public: true,
            published_revision_id: 47,
          },
        ],
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 4,
          last_page: 1,
        },
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await getCmsArticles({ locale: "zh" });

    expect(result.items.map((article) => [article.slug, article.publishedRevisionId])).toEqual([
      ["snake-case-pointer", 44],
      ["camel-case-pointer", 45],
      ["nested-pointer", 46],
    ]);
    expect(result.items.map((article) => article.slug)).not.toContain("draft-with-pointer");
    expect(result.pagination.total).toBe(3);
  });

  it("does not fabricate unpublished article alternates from slug parity", () => {
    const normalized = normalizeArticleSeoPayload(
      {
        meta: {
          title: "Published zh article",
          description: "Only the zh sibling is published.",
          canonical: "https://www.fermatmind.com/zh/articles/published-zh-only",
          alternates: {
            "zh-CN": "https://www.fermatmind.com/zh/articles/published-zh-only",
          },
        },
        jsonld: null,
      },
      "zh",
      "published-zh-only"
    );

    expect(normalized?.meta.alternates["zh-CN"]).toBe("http://localhost:3000/zh/articles/published-zh-only");
    expect(normalized?.meta.alternates.en).toBeNull();
  });

  it("keeps cms empty article lists empty instead of using local blog content", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        ok: true,
        items: [],
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 0,
          last_page: 1,
        },
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await getCmsArticles({ locale: "zh" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.items).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.lastPage).toBe(1);
  });

  it("keeps attacker-controlled article detail slugs out of shared cache fetches", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: false }, 404));
    vi.stubGlobal("fetch", fetchMock);

    const oversizedSlug = "a".repeat(MAX_ARTICLE_SLUG_LENGTH + 1);
    const invalidSlug = "valid/../other";

    expect(normalizeArticleSlug(oversizedSlug)).toBe("");
    expect(normalizeArticleSlug(invalidSlug)).toBe("");
    await expect(getCmsArticle(oversizedSlug, "en")).resolves.toBeNull();
    await expect(getCmsArticleSeo(invalidSlug, "en")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("bounds article list page values before shared cache fetches", async () => {
    const oversizedPage = MAX_ARTICLE_LIST_PAGE + 1000;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = String(input);
      expect(url).toContain("/api/v0.5/articles?");
      expect(url).toContain(`page=${MAX_ARTICLE_LIST_PAGE}`);

      return jsonResponse({
        ok: true,
        items: [],
        pagination: {
          current_page: MAX_ARTICLE_LIST_PAGE,
          per_page: 20,
          total: 0,
          last_page: MAX_ARTICLE_LIST_PAGE,
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(normalizeArticleListPage("2")).toBe(2);
    expect(normalizeArticleListPage(["3"])).toBe(3);
    expect(normalizeArticleListPage("not-a-page")).toBe(1);
    expect(normalizeArticleListPage(0)).toBe(1);
    expect(normalizeArticleListPage(oversizedPage)).toBe(MAX_ARTICLE_LIST_PAGE);

    const result = await getCmsArticlesWithLastKnownGood({
      locale: "en",
      page: oversizedPage,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.value.pagination.currentPage).toBe(MAX_ARTICLE_LIST_PAGE);
    expect(fetchMock.mock.calls[0]?.[1]).toHaveProperty("next");
  });

  it("uses the article list page normalizer at the route boundary", () => {
    const source = read("app/(localized)/[locale]/articles/page.tsx");

    expect(source).toContain("normalizeArticleListPage");
    expect(source).not.toContain("Number.parseInt(String(raw ?? \"1\"), 10)");
  });

  it("does not put article detail or seo lookups into the shared Data Cache", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/seo?")) {
        return jsonResponse({
          meta: {
            title: "Safe article",
            description: "Safe article description.",
            canonical: "https://www.fermatmind.com/en/articles/safe-article",
          },
        });
      }

      return jsonResponse({
        ok: true,
        article: {
          slug: "safe-article",
          locale: "en",
          title: "Safe article",
          excerpt: "Safe article description.",
          status: "published",
          is_public: true,
          published_revision_id: 12,
          is_indexable: true,
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCmsArticle("safe-article", "en")).resolves.toMatchObject({ slug: "safe-article" });
    await expect(getCmsArticleSeo("safe-article", "en")).resolves.toMatchObject({
      meta: { title: "Safe article" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const call of fetchMock.mock.calls) {
      expect(call[1]).toMatchObject({ cache: "no-store" });
      expect(call[1]).not.toHaveProperty("next");
    }
  });

  it("uses backend article placement fields for test-related article slots", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      expect(url).toContain("/api/v0.5/articles?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("related_test_slug=mbti-personality-test-16-personality-types");

      return jsonResponse({
        ok: true,
        items: [
          {
            slug: "mbti-basics",
            locale: "zh-CN",
            title: "MBTI 入门",
            excerpt: "先理解 MBTI 适合回答什么。",
            related_test_slug: "mbti-personality-test-16-personality-types",
            voice: "tool",
            voice_order: 1,
            status: "published",
            is_public: true,
            published_revision_id: 21,
            is_indexable: true,
          },
        ],
        pagination: {
          current_page: 1,
          per_page: 3,
          total: 1,
          last_page: 1,
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getCmsArticles({
      locale: "zh",
      page: 1,
      perPage: 3,
      relatedTestSlug: "mbti-personality-test-16-personality-types",
      allowLocalFallback: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.items[0]).toMatchObject({
      slug: "mbti-basics",
      relatedTestSlug: "mbti-personality-test-16-personality-types",
      voice: "tool",
      voiceOrder: 1,
    });
  });
});
