import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleLanguageNavigation } from "@/components/articles/ArticleLanguageNavigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import TraditionalArticlePage, { generateMetadata as traditionalArticleMetadata } from "@/app/(traditional)/zh-TW/articles/[slug]/page";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import {
  getCmsArticle,
  getCmsArticleSeo,
  getCmsArticleSeoWithLastKnownGood,
  getCmsArticleWithLastKnownGood,
  getCmsArticlesWithLastKnownGood,
} from "@/lib/cms/articles";

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
  it("reads exact Traditional Chinese detail, SEO, list and featured revisions", async () => {
    const slug = "seven-deadly-sins-and-seven-virtues";
    const path = `/zh-TW/articles/${slug}`;
    const article = {
      id: 1,
      org_id: 0,
      slug,
      locale: "zh-TW",
      title: "七宗罪與七美德",
      content_md: "繁體正文",
      status: "published",
      is_public: true,
      is_indexable: true,
      published_revision_id: 27,
    };
    const wrongLocale = { ...article, locale: "zh-CN" };
    const draft = { ...article, status: "draft", published_revision_id: null };
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.searchParams.get("locale")).toBe("zh-TW");
      expect(new Headers(options?.headers).get("X-FAP-Locale")).toBe("zh-TW");
      expect(options?.cache).toBe("no-store");

      if (url.pathname.endsWith("/seo")) {
        return jsonResponse({ meta: { title: article.title, description: "測試說明", canonical: `https://fermatmind.com${path}` } });
      }
      if (url.pathname.endsWith(`/articles/${slug}`)) return jsonResponse({ article });

      return jsonResponse({
        items: [article, wrongLocale, draft],
        blog_v1: {
          schema_version: 1,
          configuration_state: "published",
          title: "費馬部落格",
          description: "費馬測試文章",
          is_indexable: true,
          categories: [],
          featured_items: [article, wrongLocale, draft],
        },
      });
    });
    vi.stubGlobal("fetch", fetcher);

    const detail = await getCmsArticleWithLastKnownGood(slug, "zh-TW");
    const seo = await getCmsArticleSeoWithLastKnownGood(slug, "zh-TW");
    const list = await getCmsArticlesWithLastKnownGood({ locale: "zh-TW", includeBlog: true });
    expect(detail.value).toMatchObject({ locale: "zh-TW", contentMd: "繁體正文", publishedRevisionId: 27 });
    expect(new URL(seo.value?.meta.canonical ?? "").pathname).toBe(path);
    expect(list.value.items.map((item) => item.locale)).toEqual(["zh-TW"]);
    expect(list.value.blog?.featuredItems.map((item) => item.publishedRevisionId)).toEqual([27]);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("renders a published Traditional article with its CMS body and source link", async () => {
    const slug = "seven-deadly-sins-and-seven-virtues";
    const path = `/zh-TW/articles/${slug}`;
    const params = Promise.resolve({ slug });
    const testPath = "/zh-TW/tests/explore/seven-sins-virtues-test";
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (new URL(String(input)).pathname.endsWith("/seo")) {
        return jsonResponse({ meta: {
          canonical: `https://fermatmind.com${path}`,
          title: "七宗罪與七美德",
          description: "繁體文章說明",
          robots: "noindex,nofollow",
        } });
      }
      return jsonResponse({ article: {
        id: 1,
        org_id: 0,
        slug,
        locale: "zh-TW",
        title: "七宗罪與七美德",
        author_name: "費馬測試編輯部",
        content_md: `## 七宗罪\n\n## 七美德\n\n[開始測試](${testPath})`,
        status: "published",
        is_public: true,
        is_indexable: true,
        published_revision_id: 27,
      } });
    }));

    expect(traditionalPath(path)).toBe(path);
    expect(traditionalPath(`/zh/articles/${slug}`)).toBeNull();
    expect(traditionalPath(`${path}/preview`)).toBeNull();
    const metadata = await traditionalArticleMetadata({ params });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(path);

    const html = renderToStaticMarkup(await TraditionalArticlePage({ params }));
    expect(html).toContain("費馬測試編輯部");
    expect(html).toContain('aria-label="本文目錄"');
    expect(html).toContain(`href="${testPath}"`);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toMatch(/^<main\b.*<h1\b.*<article[^>]*data-testid="article-detail-content".*<\/main>$/s);
  });

  it("renders reviewed assessment links and rejects private or unsupported destinations", async () => {
    const slug = "traditional-assessment-links";
    const canonical = `https://fermatmind.com/zh-TW/articles/${slug}`;
    const publicHref = "/zh/tests/big-five-personality-test-ocean-model";
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (new URL(String(input)).pathname.endsWith("/seo")) {
        return jsonResponse({ meta: { canonical, robots: "noindex,follow" } });
      }
      return jsonResponse({
        article: {
          id: 1, org_id: 0, slug, locale: "zh-TW", title: "繁體文章", content_md: "繁體正文",
          status: "published", is_public: true, is_indexable: false, published_revision_id: 27,
        },
        landing_surface_v1: { cta_bundle: [
          { key: "reviewed", kind: "start_test", href: publicHref, label: "查看大五人格測驗" },
          { key: "result", kind: "start_test", href: publicHref + "/result", label: "私人結果" },
          { key: "query", kind: "start_test", href: publicHref + "?attempt=fixture", label: "私人作答" },
          { key: "unavailable", kind: "start_test", href: "/zh-TW/tests/big-five-personality-test-ocean-model", label: "未開放版本" },
          { key: "external", kind: "start_test", href: "https://outside.example/zh/tests/anything", label: "站外測驗" },
        ] },
      });
    }));

    const html = renderToStaticMarkup(await TraditionalArticlePage({ params: Promise.resolve({ slug }) }));
    expect(html).toContain('aria-label="相關測驗"');
    expect(html).toContain(`href="${publicHref}"`);
    expect(html).toContain("查看大五人格測驗");
    expect(html).not.toMatch(/私人結果|私人作答|未開放版本|站外測驗/);
  });

  it("renders published article language navigation independently of noindex metadata", async () => {
    const slugs = { "zh-CN": "simplified-source", "zh-TW": "traditional-article", en: "english-peer" };
    const slug = slugs["zh-TW"];
    const params = Promise.resolve({ slug });
    const canonical = "https://fermatmind.com/zh-TW/articles/" + slug;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const request = new URL(String(input));
      if (request.pathname.endsWith("/seo")) {
        return jsonResponse({ meta: { canonical, robots: "noindex,follow" } });
      }
      const locale = request.searchParams.get("locale") as keyof typeof slugs;
      return jsonResponse({
        ok: true,
        article: {
          id: 1, org_id: 0, slug: slugs[locale], locale, title: "Article", content_md: "Published body",
          status: "published", is_public: true, is_indexable: false, published_revision_id: 27,
        },
        reader_language_slugs: slugs,
      });
    }));
    const html = renderToStaticMarkup(await TraditionalArticlePage({ params }));
    expect(html).toContain('href="/zh/articles/simplified-source"');
    expect(html).toContain('href="/en/articles/english-peer"');
    const metadata = await traditionalArticleMetadata({ params });
    expect(metadata.robots).toMatchObject({ index: false });
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(new URL(canonical).pathname);
    expect(metadata.alternates?.languages).toBeUndefined();
    const simplified = await getCmsArticle(slugs["zh-CN"], "zh");
    expect(simplified?.readerLanguageSlugs).toEqual(slugs);
    const simplifiedNav = renderToStaticMarkup(createElement(ArticleLanguageNavigation, { article: simplified! }));
    expect(simplifiedNav).toContain('href="/zh-TW/articles/traditional-article"');
    expect(simplifiedNav).toContain('href="/en/articles/english-peer"');
  });

  it("ignores foreign paths and reader relationships that omit the current published slug", async () => {
    const slug = "traditional-article";
    const request = vi.fn(async () => jsonResponse({
      ok: true,
      article: {
        id: 1, org_id: 0, slug, locale: "zh-TW", title: "Article", content_md: "Published body",
        status: "published", is_public: true, is_indexable: false, published_revision_id: 27,
      },
      reader_language_slugs: { "zh-CN": "/account", "zh-TW": slug, en: "//outside.example/en/articles/peer" },
    }));
    vi.stubGlobal("fetch", request);
    expect((await getCmsArticle(slug, "zh-TW"))?.readerLanguageSlugs).toBeUndefined();
    request.mockResolvedValueOnce(jsonResponse({
      ok: true,
      article: {
        id: 1, org_id: 0, slug, locale: "zh-TW", title: "Article", content_md: "Published body",
        status: "published", is_public: true, is_indexable: false, published_revision_id: 27,
      },
      reader_language_slugs: { "zh-CN": "source", "zh-TW": "some-other-article", en: "peer" },
    }));
    expect((await getCmsArticle(slug, "zh-TW"))?.readerLanguageSlugs).toBeUndefined();
    request.mockResolvedValueOnce(jsonResponse({
      ok: true,
      article: {
        id: 1, org_id: 0, slug, locale: "zh-TW", title: "Article", content_md: "Published body",
        status: "published", is_public: true, is_indexable: false, published_revision_id: 27,
      },
      reader_language_slugs: { "zh-CN": "a".repeat(129), "zh-TW": slug, en: "english-peer\n" },
    }));
    expect((await getCmsArticle(slug, "zh-TW"))?.readerLanguageSlugs).toBeUndefined();
  });

  it("renders only the published same-origin Traditional article alternates from CMS", async () => {
    const slug = "traditional-article";
    const params = Promise.resolve({ slug });
    const canonical = "https://fermatmind.com/zh-TW/articles/" + slug;
    const alternates = {
      en: "https://outside.example/en/articles/wrong-origin",
      "zh-CN": "https://fermatmind.com/zh/articles/source-article",
      "zh-TW": canonical,
    };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (new URL(String(input)).pathname.endsWith("/seo")) {
        return jsonResponse({ meta: { canonical, robots: "index,follow", article_authority_v1: {
          contract_version: "article.seo.authority.v1",
          published_revision_backed: true,
          alternate_eligibility: {
            basis: "published_indexable_locale_siblings", current_locale: "zh-TW",
            eligible_locales: Object.keys(alternates), alternates,
          },
        } } });
      }
      return jsonResponse({ article: {
        id: 1, org_id: 0, slug, locale: "zh-TW", title: "繁體文章", content_md: "繁體正文",
        status: "published", is_public: true, is_indexable: true, published_revision_id: 27,
        seo_meta: { hreflang_gate_v1: { enabled: true } },
      } });
    }));
    const metadata = await traditionalArticleMetadata({ params });
    expect(Object.keys(metadata.alternates?.languages ?? {})).toEqual(["zh-TW", "zh-CN"]);
    const html = renderToStaticMarkup(await TraditionalArticlePage({ params }));
    expect(html).toContain('href="/zh/articles/source-article"');
    expect(html).not.toContain("wrong-origin");
  });

  it.each([
    { robots: "index,follow", enabled: true, expected: true },
    { robots: "noindex,follow", enabled: true, expected: false },
    { robots: "index,follow", enabled: false, expected: false },
  ])("renders only eligible Traditional structured data ($robots, approved $enabled)", async ({ robots, enabled, expected }) => {
    const slug = "traditional-structured-data";
    const canonical = `https://fermatmind.com/zh-TW/articles/${slug}`;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (new URL(String(input)).pathname.endsWith("/seo")) {
        return jsonResponse({ meta: { canonical, robots, article_authority_v1: {
          contract_version: "article.seo.authority.v1",
          published_revision_backed: true,
          alternate_eligibility: {
            basis: "published_indexable_locale_siblings", current_locale: "zh-TW",
            eligible_locales: [], alternates: {},
          },
          structured_data_eligibility: {
            basis: "cms_explicit_schema_gates", article: { enabled }, breadcrumb_list: { enabled },
          },
          structured_data_fragments: {
            article: { "@context": "https://schema.org", "@type": "Article", headline: "繁體文章" },
            breadcrumb_list: { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [] },
          },
        } }, jsonld: { "@type": "Article", headline: "Unapproved top-level schema" } });
      }
      return jsonResponse({ article: {
        id: 1, org_id: 0, slug, locale: "zh-TW", title: "繁體文章", content_md: "繁體正文",
        status: "published", is_public: true, is_indexable: true, published_revision_id: 27,
      } });
    }));
    const html = renderToStaticMarkup(await TraditionalArticlePage({ params: Promise.resolve({ slug }) }));
    expect(html.includes(`id="article-jsonld-${slug}"`)).toBe(expected);
    expect(html.includes(`id="article-breadcrumb-${slug}"`)).toBe(expected);
    expect(html).not.toContain("Unapproved top-level schema");
  });

  it("rejects a sibling response, a different slug, or a canonical in another language", async () => {
    const slug = "seven-deadly-sins-and-seven-virtues";
    const article = {
      id: 1,
      org_id: 0,
      slug,
      locale: "zh-CN",
      title: "七宗罪",
      status: "published",
      is_public: true,
      is_indexable: true,
      published_revision_id: 27,
    };
    const fetcher = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ article }))
      .mockResolvedValueOnce(jsonResponse({ article: { ...article, locale: "zh-TW", slug: "wrong-slug" } }))
      .mockResolvedValueOnce(jsonResponse({ meta: { canonical: `https://fermatmind.com/zh/articles/${slug}` } }))
      .mockResolvedValueOnce(jsonResponse({
        meta: { canonical: `https://fermatmind.com/zh-TW/articles/${slug}` },
        seo_surface_v1: { canonical_url: `https://fermatmind.com/en/articles/${slug}` },
      }));
    vi.stubGlobal("fetch", fetcher);

    await expect(getCmsArticle(slug, "zh-TW")).resolves.toBeNull();
    await expect(getCmsArticle(slug, "zh-TW")).resolves.toBeNull();
    await expect(getCmsArticleSeo(slug, "zh-TW")).resolves.toBeNull();
    await expect(getCmsArticleSeo(slug, "zh-TW")).resolves.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("treats an absent English Article projection as authoritative absence without a zh-CN retry", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (!String(input).includes("/v0.5/articles/mbti-basics")) {
        throw new Error(`Unexpected Article request: ${String(input)}`);
      }

      return jsonResponse({
        message: "Article not found.",
        error: {
          code: "ARTICLE_NOT_FOUND",
        },
      }, 404);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCmsArticle("mbti-basics", "en")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("locale=en");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("locale=zh-CN");
  });

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
