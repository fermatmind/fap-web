import { afterEach, describe, expect, it, vi } from "vitest";
import { getCmsArticles, getCmsArticlesWithLastKnownGood } from "@/lib/cms/articles";
import { clearLastKnownGoodForTests, readLastKnownGoodForTests } from "@/lib/cms/last-known-good";

const article = (slug: string, overrides = {}) => ({
  id: 1, org_id: 0, slug, title: slug, locale: "en", status: "published", is_public: true, is_indexable: true,
  published_revision_id: 7, published_at: "2026-03-01T00:00:00Z", ...overrides,
});
const category = { slug: "personality", line_key: "personality-and-self-understanding",
  name: "Self-understanding", description: "CMS category description", article_count: 2 };
const blog = (overrides = {}) => ({ schema_version: 1, configuration_state: "published",
  title: "FermatMind Blog", description: "CMS introduction", categories: [category],
  featured_items: [article("older", { id: 41, published_revision_id: 501 }), article("newer", { id: 42, published_revision_id: 502 })], ...overrides });
const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { "Content-Type": "application/json" },
});

afterEach(() => { vi.unstubAllGlobals(); clearLastKnownGoodForTests(); });

describe("blog public list CMS contract", () => {
  it("keeps latest pagination independent and preserves manual featured order", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL) => Promise<Response>>(async () => response({ items: [article("newer", { id: 42, published_revision_id: 502 })], blog_v1: blog(),
      pagination: { current_page: 2, per_page: 1, total: 2, last_page: 2 } }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getCmsArticles({ locale: "en", categorySlug: "personality", includeBlog: true, page: 2, perPage: 1 });
    expect(result.items.map((item) => item.slug)).toEqual(["newer"]);
    expect(result.blog?.featuredItems.map((item) => item.slug)).toEqual(["older", "newer"]);
    expect(result.blog?.featuredItems.map((item) => [item.id, item.locale, item.publishedRevisionId])).toEqual([[41, "en", 501], [42, "en", 502]]);
    expect(result.blog?.categories[0]).toEqual({ slug: "personality", lineKey: category.line_key,
      name: category.name, description: category.description, articleCount: 2 });
    expect(result.pagination).toEqual({ currentPage: 2, perPage: 1, total: 2, lastPage: 2 });
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("category=personality");
    expect(url).toContain("include_blog=1");
    expect(url).toContain("locale=en");
  });

  it("does not invent configuration for an old backend or translate another locale", async () => {
    const fetchMock = vi.fn(async () => response({ items: [article("chinese", { locale: "zh-CN" })] }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getCmsArticles({ locale: "en", includeBlog: true });
    expect(result.items).toEqual([]);
    expect(result.blog).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("excludes nonpublic, pointerless, wrong-language and future featured rows without latest backfill", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({ items: [article("latest")], blog_v1: blog({ featured_items: [
      article("private", { is_public: false }), article("draft", { status: "draft" }),
      article("pointerless", { published_revision_id: null }), article("wrong-language", { locale: "zh-CN" }),
      article("future", { published_at: "2999-01-01T00:00:00Z" }), article("scheduled", { scheduled_at: "2999-01-01T00:00:00Z" }),
    ] }) })));
    expect((await getCmsArticles({ locale: "en", includeBlog: true })).blog?.featuredItems).toEqual([]);
  });

  it.each([
    ["missing ID", { id: undefined }], ["invalid ID", { id: 0 }], ["string ID", { id: "1" }],
    ["missing org", { org_id: undefined }], ["wrong org", { org_id: 9 }], ["string org", { org_id: "0" }],
    ["missing locale", { locale: undefined }], ["unknown locale", { locale: "fr" }],
    ["missing public flag", { is_public: undefined }], ["string false", { is_public: "false" }],
    ["string true", { is_public: "true" }], ["string revision ID", { published_revision_id: "7" }],
    ["missing indexability", { is_indexable: undefined }], ["string indexability", { is_indexable: "false" }],
  ])("rejects %s in the new featured contract without borrowing latest", async (label, overrides) => {
    vi.stubGlobal("fetch", vi.fn(async () => response({ items: [article("latest")],
      blog_v1: blog({ featured_items: [article("invalid", overrides)] }) })));
    const result = await getCmsArticles({ locale: "en", includeBlog: true });
    expect(result.items.map((item) => item.slug)).toEqual(["latest"]);
    expect(result.blog?.featuredItems, label).toEqual([]);
  });

  it("preserves explicit Chinese identity and a real false indexability flag", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({ items: [], blog_v1: blog({ featured_items: [
      article("chinese", { id: 43, locale: "zh-CN", published_revision_id: 503, is_indexable: false }),
    ] }) })));
    const result = await getCmsArticles({ locale: "zh", includeBlog: true });
    expect(result.blog?.featuredItems.map((item) => [item.id, item.locale, item.publishedRevisionId, item.isIndexable]))
      .toEqual([[43, "zh-CN", 503, false]]);
  });

  it("keeps unavailable, unconfigured, invalid and a qualified empty category list distinct", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ items: [], blog_v1: blog({ configuration_state: "unconfigured", title: "Private title" }) }))
      .mockResolvedValueOnce(response({ items: [], blog_v1: blog({ categories: [{ ...category, article_count: 0 }] }) }))
      .mockResolvedValueOnce(response({ items: [], blog_v1: blog({ categories: [], featured_items: [] }) }))
      .mockResolvedValueOnce(response({ error: { code: "UNAVAILABLE" } }, 503));
    vi.stubGlobal("fetch", fetchMock);
    const unconfigured = await getCmsArticles({ locale: "en", includeBlog: true });
    expect(unconfigured.blog?.configurationState).toBe("unconfigured");
    expect(unconfigured.blog?.title).toBeNull();
    expect((await getCmsArticles({ locale: "en", includeBlog: true })).blog?.configurationState).toBe("invalid");
    expect((await getCmsArticles({ locale: "en", includeBlog: true })).blog?.configurationState).toBe("published");
    await expect(getCmsArticles({ locale: "en", includeBlog: true })).rejects.toThrow();
  });

  it("partitions local last-known-good entries by category and blog opt-in", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      return response({ items: [article(url.searchParams.get("category") ?? "latest")],
        ...(url.searchParams.has("include_blog") ? { blog_v1: blog() } : {}) });
    }));
    const one = await getCmsArticlesWithLastKnownGood({ locale: "en", categorySlug: "personality", includeBlog: true });
    const two = await getCmsArticlesWithLastKnownGood({ locale: "en", categorySlug: "career" });
    expect(one.value.items[0]?.slug).toBe("personality");
    expect(two.value.items[0]?.slug).toBe("career");
    expect(two.value.blog).toBeUndefined();
    expect(readLastKnownGoodForTests('articles:list:en:1:20:blog:["personality",true]')?.value).toEqual(one.value);
    expect(readLastKnownGoodForTests('articles:list:en:1:20:blog:["career",false]')?.value).toEqual(two.value);
  });
});
