import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ArticleByline } from "@/components/articles/ArticleByline";
import { articleByline } from "@/lib/content/articleByline";
import { buildArticleJsonLd } from "@/lib/seo/generateSchema";
import { normalizeArticleJsonLdAuthorityPayload } from "@/lib/seo/articleJsonLdAuthority";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getDictSync } from "@/lib/i18n/getDict";
import type { CmsArticle } from "@/lib/cms/articles";

vi.hoisted(() => { process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com"; });

describe("operator-selected blog brand and navigation", () => {
  it("uses localized brand links without turning the brand into a person or claiming human review", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
    for (const locale of ["en", "zh"] as const) {
      const byline = articleByline("Fermat Institute", locale);
      const html = renderToStaticMarkup(<ArticleByline authorName="Fermat Institute" locale={locale} />);
      expect(html).toContain(`href="/${locale}/brand"`);
      expect(html).toContain(byline.name);
      const schema = buildArticleJsonLd({ path: `/${locale}/articles/old-slug`, title: "Article", description: "Description", locale,
        authorName: byline.name, datePublished: "2026-03-12", dateModified: "2026-04-01" });
      expect(schema.author).toEqual({ "@type": "Organization", name: byline.name, url: `https://fermatmind.com/${locale}/brand` });
      expect(schema.datePublished).toBe("2026-03-12");
      expect(html).not.toContain("review");
      expect(getDictSync(locale).header.articles).toBe(locale === "en" ? "Blog" : "博客");
      const footer = renderToStaticMarkup(<SiteFooter locale={locale} />);
      expect(footer).toContain(locale === "en" ? "Career Guides" : "职业指南");
      expect(footer).toContain(`href="/${locale}/articles"`);
    }
  });
  it("preserves an explicit CMS name and rejects stale Institute schema instead of fabricating an authority fragment", () => {
    expect(articleByline("Existing author", "en")).toEqual({ name: "Existing author", href: null, brand: false });
    expect(normalizeArticleJsonLdAuthorityPayload({ "@type": "Article", author: { "@type": "Person", name: "Fermat Institute" } })).toBeNull();
    expect(normalizeArticleJsonLdAuthorityPayload({ "@type": "Article", author: { "@type": "Organization", name: "FermatMind" } })).not.toBeNull();
  });

  it("does not replace a rejected backend author with a frontend schema while the projection contract is present", async () => {
    const article: CmsArticle = { id: 10, slug: "existing-slug", locale: "en", title: "Existing article", excerpt: "Existing summary",
      contentMd: "Existing body", contentHtml: "", authorName: "Fermat Institute", readingMinutes: null,
      publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
      coverImageUrl: null, coverImageAlt: null, coverImageWidth: null, coverImageHeight: null,
      coverImageVariants: { hero: null, card: null, thumbnail: null, square: null, og: null, preload: null },
      relatedTestSlug: null, voice: null, voiceOrder: null, status: "published", isPublic: true, isIndexable: true,
      publishedRevisionId: 651, publishedAt: "2026-03-12T00:00:00Z", scheduledAt: null, createdAt: null, updatedAt: null,
      category: null, tags: [], seoMeta: null, landingSurface: null, answerSurface: null };
    const stale = { "@type": "Article", author: { "@type": "Person", name: "Fermat Institute" } };
    vi.resetModules();
    vi.doMock("@/lib/cms/articles", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/cms/articles")>(),
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: article, source: "fresh" })),
      getCmsArticleSeoWithLastKnownGood: vi.fn(async () => ({ value: { meta: { robots: "index,follow" }, jsonld: stale,
        authority: { contractVersion: "article.seo.authority.v1", structuredDataEligibility: { article: true, breadcrumbList: false },
          structuredDataFragments: { article: stale, breadcrumbList: null } } }, source: "fresh" })),
    }));
    try {
      const { default: ArticleDetailPage } = await import("@/app/(localized)/[locale]/articles/[slug]/page");
      const html = renderToStaticMarkup(await ArticleDetailPage({ params: Promise.resolve({ locale: "en", slug: article.slug }) }));
      expect(html).toContain('href="/en/brand"');
      expect(html).not.toContain('"@type":"Article"');
      expect(html).not.toContain("Fermat Institute");
      expect(html).not.toContain("Reviewed by");
    } finally { vi.doUnmock("@/lib/cms/articles"); vi.resetModules(); }
  });
});
