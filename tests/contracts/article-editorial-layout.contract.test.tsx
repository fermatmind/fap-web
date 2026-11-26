import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArticleEditorialLayout } from "@/components/articles/ArticleEditorialLayout";
import { editorialDeck, editorialReadingMinutes, editorialRelated, editorialScope } from "@/lib/content/articleEditorial";
import { prepareArticleHtml } from "@/lib/cms/sanitizeCmsRichText";
import type { CmsArticle } from "@/lib/cms/articles";

describe("shared article editorial layout", () => {
  it("counts visible Han characters and English words at different rates", () => {
    expect(editorialReadingMinutes("字".repeat(450) + " English", "zh")).toBe(1);
    expect(editorialReadingMinutes("字".repeat(451), "zh-TW")).toBe(2);
    expect(editorialReadingMinutes("Word ".repeat(219) + "[one](https://site.tld/index)", "en")).toBe(1);
    expect(editorialReadingMinutes("Word ".repeat(221), "en")).toBe(2);
    expect(editorialReadingMinutes("", "en")).toBe(1);
  });

  it("uses the first deck sentence and only exposes explicit scope", () => {
    expect(editorialDeck("First question? Further details.", "en")).toBe("First question?");
    expect(editorialScope("导语。\n\n以下适用中国大陆劳动和税务规则。")).toBe("中国大陆劳动和税务规则");
    expect(editorialScope("Scope: mainland China’s labor and tax rules. Figures are in RMB.")).toBe("mainland China’s labor and tax rules");
    expect(editorialScope("Preliminary introduction to taxes in China.")).toBeUndefined();
  });

  it("adds stable legacy HTML anchors without changing existing fragments", () => {
    const html = '<h2 id="article-html-section-1">Existing &amp; visible</h2><h2>Next <strong>topic</strong></h2><script><h2>Bad</h2></script>';
    const result = prepareArticleHtml(html, "en");
    expect(result.headings.map(({ id, text }) => [id, text])).toEqual([
      ["article-html-section-1", "Existing & visible"], ["article-html-section-2", "Next topic"],
    ]);
    expect(result.html).toContain('<h2 id="article-html-section-2">Next <strong>topic</strong></h2>');
    expect(result.html).not.toContain("<script>");
  });

  const fixture: CmsArticle = {
    id: 1, slug: "current", locale: "zh-TW", title: "標題", excerpt: "", contentMd: "短篇文章",
    contentHtml: "", tags: [], category: { id: 1, slug: "careers", name: "職涯" }, publishedRevisionId: 6,
    isPublic: true, status: "published", isIndexable: true, authorName: null,
    publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null }, readingMinutes: null,
    coverImageUrl: null, coverImageAlt: null, coverImageWidth: null, coverImageHeight: null,
    coverImageVariants: { hero: null, card: null, thumbnail: null, square: null, og: null, preload: null },
    relatedTestSlug: null, voice: null, voiceOrder: null, publishedAt: null, scheduledAt: null,
    createdAt: null, updatedAt: null, seoMeta: null, landingSurface: null, answerSurface: null,
  };
  it("omits a vacant TOC, missing cover and implicit jurisdiction on short posts", () => {
    const html = renderToStaticMarkup(
      <ArticleEditorialLayout locale="zh-TW" article={fixture} headings={[]} sourceChecked={false}
        editorial={false} schema={null} navigation={null}>短篇文章</ArticleEditorialLayout>,
    );
    expect(html).toContain("/zh-TW/tests");
    expect(html).toContain("短篇文章");
    expect(html).not.toMatch(/article-toc|fm-article-hero|<dt>適用|fm-article-related/);
  });
  it("allows at most two unique and publicly published peers in the active locale and category", () => {
    const items = [
      fixture, { ...fixture, slug: "draft", status: "draft" }, { ...fixture, slug: "hidden", isPublic: false },
      { ...fixture, slug: "other-locale", locale: "en" },
      { ...fixture, slug: "other-category", category: { ...fixture.category!, slug: "other" } },
      { ...fixture, slug: "next", scheduledAt: "2028-01-01" },
      { ...fixture, slug: "first" }, { ...fixture, slug: "first" }, { ...fixture, slug: "second" }, { ...fixture, slug: "third" },
    ];
    expect(editorialRelated(fixture, items, "zh-TW", Date.parse("2026-11-26")).map(({ slug }) => slug)).toEqual(["first", "second"]);
  });
});
