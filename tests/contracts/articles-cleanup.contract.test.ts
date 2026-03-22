import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCmsArticle, getCmsArticles, listCmsArticlesForLlms, normalizeArticleSeoPayload } from "@/lib/cms/articles";

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
  it("frontend next-sitemap no longer generates article list or detail authority", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs.some((loc: string) => /^\/(en|zh)\/articles(?:\/|$)/.test(loc))).toBe(false);
  });

  it("article detail page consumes adapter-normalized seo payload without page-level repair helpers", () => {
    const source = read("app/(localized)/[locale]/articles/[slug]/page.tsx");

    expect(source).toContain('from "@/lib/cms/articles"');
    expect(source).toContain("article.answerSurface");
    expect(source).toContain('findLandingCta(article.landingSurface, "back_to_articles")');
    expect(source).not.toContain("normalizeStructuredDataUrls");
    expect(source).toContain("seo?.surface?.canonicalUrl ?? seo?.meta.canonical");
    expect(source).toContain("seoSurface: seo?.surface");
    expect(source).toContain("seo?.jsonld ||");
  });

  it("llms routes use cms article enumeration instead of local blog helpers", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(llms).toContain("listCmsArticlesForLlms");
    expect(llmsFull).toContain("listCmsArticlesForLlms");
    expect(llms).not.toContain("listBlogPosts");
    expect(llmsFull).not.toContain("listBlogPosts");
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
            "zh-CN": "https://staging.fermatmind.com/zh/articles/how-to-read-mbti-results",
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
    expect(normalized?.meta.alternates["zh-CN"]).toBe("http://localhost:3000/zh/articles/how-to-read-mbti-results");
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
      const page = new URL(url).searchParams.get("page");

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

  it("falls back to local blog article content when cms detail returns 404", async () => {
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
    expect(article).not.toBeNull();
    expect(article?.slug).toBe("mbti-growth-guide");
    expect(article?.title).toContain("MBTI");
    expect(article?.contentMd).toContain("费马测试");
    expect(article?.status).toBe("published");
    expect(article?.isPublic).toBe(true);
  });

  it("falls back to local blog collection when cms list is empty", async () => {
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
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.map((item) => item.slug)).toContain("mbti-basics");
    expect(result.items.map((item) => item.slug)).toContain("mbti-growth-guide");
    expect(result.pagination.total).toBe(18);
    expect(result.pagination.lastPage).toBe(1);
  });
});
