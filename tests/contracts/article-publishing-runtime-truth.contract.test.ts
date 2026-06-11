import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCmsArticle, getCmsArticleSeo } from "@/lib/cms/articles";
import { getHomepageRecommendedArticles } from "@/lib/marketing/homepageRecommendedArticles";
import { resolveArticleJsonLdAuthority } from "@/lib/seo/articlePersonalityAuthority";
import { isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

const landingMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/cms/landing-surfaces", () => ({
  getCmsLandingSurfaceWithLastKnownGood: landingMock,
}));

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/seo-foundation/article-publishing-runtime-truth.v1.json"
);

type RuntimeTruthArticle = {
  title: string;
  slug: string;
  seo_title: string;
  meta_description: string;
  excerpt: string;
  content_md: string;
  cover_image: string;
  cover_image_alt: string;
  category: { slug: string; name: string };
  tags: string[];
  author: string;
  status: "published";
  locale: "zh-CN";
  is_indexable: boolean;
  canonical: string;
};

type RuntimeTruthFixture = {
  version: string;
  scope: string;
  runtime_behavior: string;
  authority: string;
  articles: RuntimeTruthArticle[];
};

function readFixture(): RuntimeTruthFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as RuntimeTruthFixture;
}

function readSource(relPath: string): string {
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

function articleApiPayload(article: RuntimeTruthArticle) {
  return {
    id: 101,
    slug: article.slug,
    locale: article.locale,
    title: article.title,
    excerpt: article.excerpt,
    content_md: article.content_md,
    content_html: "",
    author_name: article.author,
    reading_minutes: 4,
    cover_image_url: article.cover_image,
    cover_image_alt: article.cover_image_alt,
    status: article.status,
    is_public: true,
    is_indexable: article.is_indexable,
    published_revision_id: 701,
    published_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-02T00:00:00Z",
    category: article.category,
    tags: article.tags.map((tag, index) => ({
      id: index + 1,
      slug: tag.toLowerCase().replace(/\s+/g, "-"),
      name: tag,
    })),
  };
}

function seoPayload(article: RuntimeTruthArticle) {
  return {
    meta: {
      title: article.seo_title,
      description: article.meta_description,
      canonical: article.canonical,
      alternates: {
        "zh-CN": article.canonical,
      },
      og: {
        title: article.seo_title,
        description: article.meta_description,
        image: article.cover_image,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: article.seo_title,
        description: article.meta_description,
        image: article.cover_image,
      },
      robots: article.is_indexable ? "index,follow" : "noindex,nofollow",
    },
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${article.canonical}#article`,
      url: article.canonical,
      mainEntityOfPage: article.canonical,
      headline: article.title,
      description: article.meta_description,
      image: article.cover_image,
      author: {
        "@type": "Organization",
        name: article.author,
      },
      datePublished: "2026-05-01T00:00:00Z",
      dateModified: "2026-05-02T00:00:00Z",
    },
    seo_surface_v1: {
      version: "seo.surface.v1",
      metadata_contract_version: "seo.surface.v1",
      metadata_fingerprint: `article:${article.slug}`,
      metadata_scope: "article_detail",
      surface_type: "article",
      canonical_url: article.canonical,
      robots_policy: article.is_indexable ? "index,follow" : "noindex,nofollow",
      title: article.seo_title,
      description: article.meta_description,
      og_payload: {
        title: article.seo_title,
        description: article.meta_description,
        image: article.cover_image,
        type: "article",
        url: article.canonical,
      },
      twitter_payload: {
        card: "summary_large_image",
        title: article.seo_title,
        description: article.meta_description,
        image: article.cover_image,
      },
      alternates: {
        "zh-CN": article.canonical,
      },
      structured_data_keys: ["Article"],
      indexability_state: article.is_indexable ? "index" : "noindex",
      index_eligible: article.is_indexable,
      sitemap_state: article.is_indexable ? "included" : "excluded",
      article_eligible: true,
      llms_exposure_state: article.is_indexable ? "include" : "withhold",
    },
  };
}

function surfaceWithRecommendedArticles(items: unknown[]) {
  return {
    value: {
      surfaceKey: "home",
      locale: "zh",
      title: null,
      description: null,
      schemaVersion: "v1",
      payloadJson: {},
      status: "published",
      isPublic: true,
      isIndexable: true,
      publishedAt: null,
      scheduledAt: null,
      pageBlocks: [
        {
          blockKey: "recommended_articles",
          blockType: "articles",
          title: "Recommended",
          payloadJson: { items },
          sortOrder: 10,
          isEnabled: true,
        },
      ],
    },
    source: "fresh",
    stale: false,
    updatedAt: "2026-05-01T00:00:00.000Z",
    error: null,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  landingMock.mockReset();
});

describe("Article Publishing Runtime Truth acceptance gate", () => {
  it("keeps the six-article dry-run fixture complete without creating production content authority", () => {
    const fixture = readFixture();

    expect(fixture.version).toBe("article_publishing_runtime_truth.v1");
    expect(fixture.scope).toBe("PR-RT-01");
    expect(fixture.runtime_behavior).toBe("dry_run_fixture_only");
    expect(fixture.authority).toBe("backend_cms_article_published_revision");
    expect(fixture.articles).toHaveLength(6);

    const slugs = new Set<string>();
    for (const article of fixture.articles) {
      expect(article.slug).toMatch(/^[a-z0-9][a-z0-9-]+$/);
      expect(slugs.has(article.slug)).toBe(false);
      slugs.add(article.slug);
      expect(article.seo_title).toContain("FermatMind");
      expect(article.meta_description.length).toBeGreaterThan(20);
      expect(article.excerpt.length).toBeGreaterThan(20);
      expect(article.content_md).toContain("## References");
      expect(article.cover_image).toMatch(/^https:\/\/api\.fermatmind\.com\/static\/articles\/covers\/.+\.svg$/);
      expect(article.cover_image_alt.length).toBeGreaterThan(10);
      expect(article.category.slug).toBeTruthy();
      expect(article.tags.length).toBeGreaterThan(0);
      expect(article.status).toBe("published");
      expect(article.locale).toBe("zh-CN");
      expect(article.is_indexable).toBe(true);
      expect(article.canonical).toBe(`https://fermatmind.com/zh/articles/${article.slug}`);
    }
  });

  it("converges article detail API, metadata SEO payload, and Article JSON-LD authority", async () => {
    const article = readFixture().articles[0];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes(`/api/v0.5/articles/${article.slug}/seo?`)) {
        return jsonResponse(seoPayload(article));
      }

      if (url.includes(`/api/v0.5/articles/${article.slug}?`)) {
        return jsonResponse({
          ok: true,
          article: articleApiPayload(article),
          landing_surface_v1: null,
          answer_surface_v1: null,
        });
      }

      return jsonResponse({ message: "not found" }, 404);
    });

    vi.stubGlobal("fetch", fetchMock);

    const [cmsArticle, cmsSeo] = await Promise.all([
      getCmsArticle(article.slug, "zh"),
      getCmsArticleSeo(article.slug, "zh"),
    ]);

    expect(cmsArticle).toMatchObject({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      contentMd: article.content_md,
      coverImageUrl: article.cover_image,
      coverImageAlt: article.cover_image_alt,
      authorName: article.author,
      status: "published",
      isPublic: true,
      isIndexable: true,
      category: article.category,
    });
    expect(cmsArticle?.tags.map((tag) => tag.name)).toEqual(article.tags);

    expect(cmsSeo?.surface?.title).toBe(article.seo_title);
    expect(cmsSeo?.surface?.description).toBe(article.meta_description);
    expect(cmsSeo?.surface?.canonicalUrl).toBe(article.canonical);
    expect(cmsSeo?.surface?.structuredDataKeys).toEqual(["Article"]);
    expect(cmsSeo?.meta.robots).toBe("index,follow");

    const jsonLd = cmsSeo?.jsonld as Record<string, unknown>;
    expect(jsonLd["@type"]).toBe("Article");
    expect(jsonLd.url).toMatch(`/zh/articles/${article.slug}`);
    expect(jsonLd.mainEntityOfPage).toMatch(`/zh/articles/${article.slug}`);
    expect(jsonLd.headline).toBe(article.title);
    expect(jsonLd.description).toBe(article.meta_description);
    expect(jsonLd.image).toBe(article.cover_image);

    const gate = resolveArticleJsonLdAuthority({
      cmsArticleSeoJsonLd: cmsSeo?.jsonld ?? null,
      article: cmsArticle!,
    });

    expect(gate).toMatchObject({
      source: "cms_article_seo_jsonld",
      classification: "backend_cms_complete",
      canRenderJsonLd: true,
      blocksExpansion: false,
    });
  });

  it("keeps Article JSON-LD fallback tracked as migration_required instead of final authority", () => {
    const article = readFixture().articles[0];
    const gate = resolveArticleJsonLdAuthority({
      cmsArticleSeoJsonLd: null,
      article: {
        title: article.title,
        excerpt: article.excerpt,
        contentHtml: "",
        contentMd: article.content_md,
      },
    });

    expect(gate).toMatchObject({
      source: "visible_content_compatibility_fallback",
      classification: "compatibility_wrapper",
      canRenderJsonLd: true,
      blocksExpansion: true,
    });
  });

  it("requires homepage recommended articles to reference complete CMS article authority", async () => {
    const article = readFixture().articles[0];
    landingMock.mockResolvedValueOnce(
      surfaceWithRecommendedArticles([
        articleApiPayload(article),
        {
          ...articleApiPayload(readFixture().articles[1]),
          cover_image_url: null,
        },
      ])
    );

    const articles = await getHomepageRecommendedArticles("zh");

    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      coverImageUrl: article.cover_image,
      coverImageAlt: article.cover_image_alt,
      category: article.category,
    });
    expect(articles[0]?.tags.map((tag) => tag.name)).toEqual(article.tags);
  });

  it("anchors article discoverability to published indexable backend authority", () => {
    const article = readFixture().articles[0];
    const articlePath = `/zh/articles/${article.slug}`;

    expect(shouldIncludeInSitemap(articlePath, {
      indexEligible: true,
      indexState: "index",
    })).toBe(true);
    expect(shouldIncludeInSitemap(articlePath, {
      indexEligible: false,
      indexState: "noindex",
    })).toBe(false);
    expect(isSharedDiscoverabilityDeniedPath("/result/abc")).toBe(true);
    expect(isSharedDiscoverabilityDeniedPath("/orders/123")).toBe(true);

    const sitemap = readSource("next-sitemap.config.js");
    const llms = readSource("app/llms.txt/route.ts");
    const llmsFull = readSource("app/llms-full.txt/route.ts");

    expect(sitemap).toContain('buildValidatedCmsPaths("/v0.5/articles", buildArticlePaths)');
    expect(sitemap).toContain("isPublicIndexable");
    expect(llms).toContain("listCmsArticlesForLlmsWithLastKnownGood");
    expect(llms).toContain("article.isIndexable");
    expect(llmsFull).toContain("listCmsArticlesForLlmsWithLastKnownGood");
    expect(llmsFull).toContain("article.isIndexable");
  });

  it("keeps article metadata source priority on backend SEO surface before compatibility fallback", () => {
    const source = readSource("app/(localized)/[locale]/articles/[slug]/page.tsx");

    expect(source).toContain("getCmsArticleSeoWithLastKnownGood");
    expect(source).toContain("seo?.surface?.title || seo?.meta.title || article.title");
    expect(source).toContain("seo?.surface?.description || seo?.meta.description || article.excerpt");
    expect(source).toContain("seo?.surface?.canonicalUrl ?? seo?.meta.canonical");
    expect(source).toContain("const noindex = !article.isIndexable || shouldNoindex(seo?.meta.robots);");
    expect(source).toContain("const allowSearchStructuredData = !noindex;");
    expect(source).toContain("const cmsArticleSeoJsonLd = allowSearchStructuredData ? normalizeArticleJsonLdAuthor(seo?.jsonld) : null;");
    expect(source).toContain("resolveArticleJsonLdAuthority({");
    expect(source).toContain("articleJsonLdAuthority?.canRenderJsonLd");
    expect(source).toContain("const breadcrumbJsonLd = allowSearchStructuredData");
    expect(source).toContain("{allowSearchStructuredData && faqItems.length > 0 ? <JsonLd id={`article-faq-${slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}");
  });
});
