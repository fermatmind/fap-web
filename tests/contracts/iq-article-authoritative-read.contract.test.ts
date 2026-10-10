import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCmsArticle, getCmsArticleSeo, getCmsArticleWithLastKnownGood, getCmsArticleSeoWithLastKnownGood } from "@/lib/cms/articles";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";

const slugs = ["iq-test-score-and-limits-explained", "iq-test-tool-guide", "iq-test-narrative-portrait", "iq-test-growth-guide", "what-is-iq-and-how-it-is-measured", "eq-test-tool-guide", "emotional-intelligence-models-and-measures", "eq60-score-and-results-guide", "emotional-awareness-regulation-and-relationship-practice"];
const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
const article = (slug: string, locale: string, revision = 1) => ({ ok: true, article: { id: 1, org_id: 0, slug, locale, title: "Current reasoning guide", excerpt: "Current limits", content_md: `Current body ${revision}`, status: "published", is_public: true, is_indexable: false, published_revision_id: revision } });
const seo = (slug: string) => ({ meta: { title: "Current reasoning guide", description: "Current limits", canonical: `https://fermatmind.com/en/articles/${slug}`, robots: "noindex,follow" } });
beforeEach(() => { clearLastKnownGoodForTests(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); clearLastKnownGoodForTests(); });

describe("IQ/EQ article authoritative reads", () => {
  it.each(slugs.flatMap(slug => ["en", "zh-CN"].map(locale => [slug, locale])))("reads detail and SEO without worker data cache for %s %s", async (slug, locale) => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => { void options; return String(input).includes("/seo?") ? response(seo(slug)) : response(article(slug, locale)); });
    vi.stubGlobal("fetch", fetcher);
    expect((await getCmsArticle(slug, locale))?.slug).toBe(slug);
    expect((await getCmsArticleSeo(slug, locale))?.meta.title).toBe("Current reasoning guide");
    expect(fetcher).toHaveBeenCalledTimes(2);
    for (const [, options] of fetcher.mock.calls as unknown as [unknown, RequestInit & { next?: unknown }][]) {
      expect(options.cache).toBe("no-store");
      expect(options.next).toBeUndefined();
    }
  });
  it("preserves the existing cache policy for unrelated articles", async () => {
    const slug = "unrelated-article";
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => { void options; return String(input).includes("/seo?") ? response(seo(slug)) : response(article(slug, "en")); });
    vi.stubGlobal("fetch", fetcher);
    await getCmsArticle(slug, "en"); await getCmsArticleSeo(slug, "en");
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ next: { revalidate: 300, tags: ["article-detail:en:unrelated-article"] } });
    expect(fetcher.mock.calls[1]?.[1]).toMatchObject({ next: { revalidate: 300, tags: ["article-seo:en:unrelated-article"] } });
  });
  it("publication and withdrawal replace current reads without falling back to a previous body", async () => {
    const slug = slugs[0]; let revision = 1; let status = 200;
    vi.stubGlobal("fetch", vi.fn(async () => response(status === 200 ? article(slug, "en", revision) : { error: "not found" }, status)));
    expect((await getCmsArticleWithLastKnownGood(slug, "en")).value?.publishedRevisionId).toBe(1);
    revision = 2;
    expect((await getCmsArticleWithLastKnownGood(slug, "en")).value?.publishedRevisionId).toBe(2);
    status = 404;
    expect(await getCmsArticleWithLastKnownGood(slug, "en")).toMatchObject({ value: null, source: "fresh", stale: false });
    status = 500;
    await expect(getCmsArticleWithLastKnownGood(slug, "en")).rejects.toThrow();
  });
  it("a late old response cannot become the next authoritative body", async () => {
    const slug = slugs[0];
    let finishOld!: (value: Response) => void;
    const old = new Promise<Response>(resolve => { finishOld = resolve; });
    const fetcher = vi.fn<(...args: [RequestInfo | URL, RequestInit?]) => Promise<Response>>()
      .mockImplementationOnce(() => old)
      .mockImplementation(async () => response(article(slug, "en", 2)));
    vi.stubGlobal("fetch", fetcher);
    const pending = getCmsArticleWithLastKnownGood(slug, "en");
    expect((await getCmsArticleWithLastKnownGood(slug, "en")).value?.publishedRevisionId).toBe(2);
    finishOld(response(article(slug, "en", 1)));
    expect((await pending).value?.publishedRevisionId).toBe(1);
    expect((await getCmsArticleWithLastKnownGood(slug, "en")).value?.publishedRevisionId).toBe(2);
    for (const [, options] of fetcher.mock.calls) expect(options?.cache).toBe("no-store");
  });
  it("SEO withdrawal and transport failure never return prior metadata", async () => {
    const slug = slugs[0]; let status = 200;
    vi.stubGlobal("fetch", vi.fn(async () => response(status === 200 ? seo(slug) : { error: "unavailable" }, status)));
    expect((await getCmsArticleSeoWithLastKnownGood(slug, "en")).value?.meta.title).toBe("Current reasoning guide");
    status = 404;
    expect(await getCmsArticleSeoWithLastKnownGood(slug, "en")).toMatchObject({ value: null, source: "fresh", stale: false });
    status = 500;
    await expect(getCmsArticleSeoWithLastKnownGood(slug, "en")).rejects.toThrow();
  });
});
