import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CmsArticle, GetCmsArticlesResult } from "@/lib/cms/articles";
import { BlogArchive } from "@/components/articles/BlogArchive";
import { blogArchiveMetadata, blogArchiveQuery } from "@/lib/content/blogArchive";

const { get } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
  return { get: vi.fn() };
});
vi.mock("@/lib/cms/articles", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/cms/articles")>(), getCmsArticlesWithLastKnownGood: get }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not-found"); } }));

const article = (slug: string): CmsArticle => ({ id: 1, slug, locale: "en", title: slug, excerpt: "CMS summary", contentMd: "", contentHtml: "", authorName: null,
  publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null }, readingMinutes: null,
  coverImageUrl: null, coverImageAlt: null, coverImageWidth: null, coverImageHeight: null,
  coverImageVariants: { hero: null, card: null, thumbnail: null, square: null, og: null, preload: null },
  relatedTestSlug: null, voice: null, voiceOrder: null, status: "published", isPublic: true, isIndexable: true,
  publishedRevisionId: 1, publishedAt: null, scheduledAt: null, createdAt: null, updatedAt: "2026-10-05T00:00:00Z", category: null, tags: [], seoMeta: null, landingSurface: null, answerSurface: null });
const data = (): GetCmsArticlesResult => ({ items: [article("newest")], pagination: { currentPage: 1, perPage: 20, total: 1, lastPage: 1 }, landingSurface: null,
  blog: { configurationState: "published", isIndexable: true, title: "FermatMind Blog", description: "CMS-owned introduction", featuredItems: [article("editor-third"), article("editor-first")],
    categories: [{ slug: "personality", lineKey: "personality-and-self-understanding", name: "Self-understanding", description: "CMS-owned archive description", articleCount: 1 }] } });

beforeEach(() => { process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com"; get.mockReset(); get.mockResolvedValue({ value: data(), source: "fresh", stale: false }); });

describe("Blog CMS archive and SEO boundaries", () => {
  it.each(["en", "zh"] as const)("renders canonical-bound collection and breadcrumb JSON-LD through the public %s archive", async locale => {
    const html = renderToStaticMarkup(await BlogArchive({ locale, query: {} }));
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    const canonical = `https://fermatmind.com/${locale}/articles`;
    expect(schemas).toHaveLength(2);
    expect(schemas.find((schema) => schema["@type"] === "CollectionPage")).toMatchObject({
      "@id": `${canonical}#collectionpage`, url: canonical, name: "FermatMind Blog",
      description: "CMS-owned introduction", inLanguage: locale === "zh" ? "zh-CN" : "en",
    });
    expect(schemas.find((schema) => schema["@type"] === "BreadcrumbList")?.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: locale === "zh" ? "https://fermatmind.com/" : "https://fermatmind.com/en" }),
      expect.objectContaining({ position: 2, item: canonical }),
    ]);
  });

  it("keeps editorial order separate from latest and does not invent authors or publication dates", async () => {
    const html = renderToStaticMarkup(await BlogArchive({ locale: "en", query: {} }));
    expect(html.indexOf("editor-third")).toBeLessThan(html.indexOf("editor-first"));
    expect(html).toContain('href="/en/articles/category/personality"');
    expect(html.match(/data-article-layout="featured"/g)).toHaveLength(2);
    expect(html.match(/data-article-layout="archive"/g)).toHaveLength(1);
    expect(html).toContain("CMS-owned introduction");
    expect(html).not.toContain("Fermat Institute");
    expect(html).not.toContain("Oct 5, 2026");
    expect(get).toHaveBeenCalledWith(expect.objectContaining({ locale: "en", page: 1, includeBlog: true }));
  });

  it("keeps a fresh empty response distinct from a failed request", async () => {
    get.mockResolvedValueOnce({ value: { ...data(), items: [], blog: { ...data().blog!, featuredItems: [] } }, stale: false });
    expect(renderToStaticMarkup(await BlogArchive({ locale: "en", query: {} }))).toContain('data-testid="blog-empty"');
    get.mockRejectedValueOnce(new Error("unavailable"));
    const html = renderToStaticMarkup(await BlogArchive({ locale: "en", query: {} }));
    expect(html).toContain('data-testid="blog-error"');
    expect(html).not.toContain("No published articles yet");
  });

  it("shows stale data honestly, and never fills missing CMS picks from latest", async () => {
    get.mockResolvedValueOnce({ value: { ...data(), blog: undefined }, stale: true });
    const html = renderToStaticMarkup(await BlogArchive({ locale: "en", query: {} }));
    expect(html).toContain('data-testid="blog-stale"');
    expect(html).toContain("newest");
    expect(html).not.toContain('data-article-layout="featured"');
    expect(html).toContain("not configured yet");
  });

  it("uses a configured category description and a filter-bound canonical, with no premature discoverability release", async () => {
    const html = renderToStaticMarkup(await BlogArchive({ locale: "en", query: {}, category: "personality" }));
    expect(html).toContain("CMS-owned archive description");
    expect(html).not.toContain('data-article-layout="featured"');
    expect(get).toHaveBeenCalledWith(expect.objectContaining({ categorySlug: "personality", includeBlog: true }));
    const meta = await blogArchiveMetadata("en", {}, "personality");
    expect(meta.alternates?.canonical).toBe("https://fermatmind.com/en/articles/category/personality");
    expect(meta.robots).toMatchObject({ index: false, follow: true });
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it("returns 404 for a known absent category, while an unknown state remains a visible error", async () => {
    await expect(BlogArchive({ locale: "en", query: {}, category: "unknown" })).rejects.toThrow("not-found");
    get.mockRejectedValueOnce(new Error("down"));
    expect(renderToStaticMarkup(await BlogArchive({ locale: "en", query: {}, category: "unknown" }))).toContain('data-testid="blog-error"');
    get.mockResolvedValueOnce({ value: data(), stale: true });
    expect(renderToStaticMarkup(await BlogArchive({ locale: "en", query: {}, category: "unknown" }))).toContain('data-testid="blog-error"');
  });

  it.each(["en", "zh"] as const)("preserves invalid and missing CMS authority as visible %s errors", async locale => {
    for (const blog of [undefined, { ...data().blog!, configurationState: "invalid" as const }]) {
      get.mockResolvedValueOnce({ value: { ...data(), blog }, stale: false });
      const html = renderToStaticMarkup(await BlogArchive({ locale, query: {}, category: "unknown" }));
      expect(html).toContain('data-testid="blog-error"');
      expect(html).not.toContain('data-testid="blog-empty"');
    }
    get.mockResolvedValueOnce({ value: { ...data(), blog: { ...data().blog!,
      configurationState: "unconfigured", categories: [] } }, stale: false });
    await expect(BlogArchive({ locale, query: {}, category: "unknown" })).rejects.toThrow("not-found");
  });

  it("does not pair an English page with a nonexistent Chinese page", async () => {
    get.mockImplementation(async ({ locale }) => ({ value: { ...data(), pagination: { currentPage: 4, perPage: 20, total: 80, lastPage: locale === "en" ? 4 : 2 } }, stale: false }));
    const meta = await blogArchiveMetadata("en", { page: "4" });
    expect(meta.alternates?.canonical).toBe("https://fermatmind.com/en/articles?page=4");
    expect(meta.alternates?.languages).toBeUndefined();
    get.mockResolvedValue({ value: { ...data(), pagination: { currentPage: 2, perPage: 20, total: 40, lastPage: 2 } }, stale: false });
    expect((await blogArchiveMetadata("en", { page: "2" })).alternates?.languages).toEqual({ en: "https://fermatmind.com/en/articles?page=2", "zh-CN": "https://fermatmind.com/zh/articles?page=2" });
    get.mockImplementation(async ({ locale }) => ({ value: { ...data(), blog: { ...data().blog!, isIndexable: locale === "en" } }, stale: false }));
    expect((await blogArchiveMetadata("en", {})).alternates?.languages).toBeUndefined();
  });

  it("honors the CMS hold rather than the generated landing indexability or unchecked query", async () => {
    get.mockResolvedValue({ value: { ...data(), blog: { ...data().blog!, isIndexable: false }, landingSurface: { indexabilityState: "indexable" } }, stale: false });
    expect((await blogArchiveMetadata("en", {})).robots).toMatchObject({ index: false });
    for (const query of [{ category: "arbitrary" }, { page: "2x" }, { page: ["2", "3"] }, { page: "101" }, { page: "1" }]) {
      expect(blogArchiveQuery(query).canonicalQuery).toBe(false);
    }
  });
});
