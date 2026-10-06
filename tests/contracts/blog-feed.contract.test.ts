import { describe, expect, it, vi } from "vitest";
import { normalizeArticleFeed, serializeArticleAtom, getPublicArticleFeed, articleFeedAlternate } from "@/lib/cms/articleFeed";
import { apiClient } from "@/lib/api-client";
import { GET } from "@/app/(localized)/[locale]/articles/feed.xml/route";

vi.mock("@/lib/api-client", () => ({ apiClient: { get: vi.fn() } }));

const item = { id: 40, locale: "en", slug: "original-article", title: 'A < B & "C"', excerpt: "Safe <script> text\u0000",
  published_revision_id: 41, published_at: "2026-01-01T00:00:00Z", material_updated_at: "2026-02-01T00:00:00Z",
  canonical: "https://fermatmind.com/en/articles/original-article" };
const payload = (items: unknown[] = [item], locale = "en") => ({ ok: true, schema_version: "public-article-feed.v1", locale, items });

describe("Blog feed public authority and Atom reader contract", () => {
  it("uses stable article ID, real clocks, canonical URL and valid escaped XML", () => {
    const entries = normalizeArticleFeed(payload(), "en");
    const xml = serializeArticleAtom("en", entries);
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.namespaceURI).toBe("http://www.w3.org/2005/Atom");
    expect(doc.querySelector("entry id")?.textContent).toBe("urn:fermatmind:article:en:40");
    expect(doc.querySelector("entry title")?.textContent).toBe(item.title);
    expect(doc.querySelector("entry summary")?.textContent).toBe("Safe <script> text");
    expect(doc.querySelector("entry published")?.textContent).toBe("2026-01-01T00:00:00.000Z");
    expect(doc.querySelector("entry updated")?.textContent).toBe("2026-02-01T00:00:00.000Z");
    expect(doc.querySelector('entry link[rel="alternate"]')?.getAttribute("href")).toBe(item.canonical);
    expect(doc.querySelector("feed > author > name")?.textContent).toBe("FermatMind");
    const renamed = serializeArticleAtom("en", normalizeArticleFeed(payload([{ ...item, slug: "changed-slug", canonical: "https://fermatmind.com/en/articles/changed-slug" }]), "en"));
    expect(renamed).toContain("urn:fermatmind:article:en:40");
    expect(xml).not.toContain("<script>");
  });

  it("isolates languages and orders material changes deterministically", () => {
    const zh = { ...item, id: 3, locale: "zh-CN", canonical: "https://fermatmind.com/zh/articles/original-article" };
    expect(serializeArticleAtom("zh", normalizeArticleFeed(payload([zh], "zh-CN"), "zh"))).toContain('xml:lang="zh-CN"');
    const newer = { ...item, id: 50, material_updated_at: "2026-03-01T00:00:00Z" };
    expect(normalizeArticleFeed(payload([item, newer]), "en").map((entry) => entry.id)).toEqual([50, 40]);
    expect(articleFeedAlternate("zh")["application/atom+xml"][0].url).toBe("https://fermatmind.com/zh/articles/feed.xml");
  });

  it.each([
    { locale: "zh-CN" }, { published_revision_id: null }, { published_at: null },
    { material_updated_at: "2100-01-01T00:00:00Z" }, { material_updated_at: "2025-01-01T00:00:00Z" },
    { slug: "../private" }, { canonical: "https://evil.example/en/articles/original-article" },
    { canonical: "https://fermatmind.com/en/result/private-attempt" }, { title: "" },
  ])("fails closed on incomplete or unsafe native authority %j", (changes) => {
    expect(() => normalizeArticleFeed(payload([{ ...item, ...changes }]), "en")).toThrow();
  });

  it("rejects duplicate/oversized/wrong-schema responses instead of quietly reporting zero", () => {
    expect(() => normalizeArticleFeed(payload([item, item]), "en")).toThrow();
    expect(() => normalizeArticleFeed(payload(Array(101).fill(item)), "en")).toThrow();
    expect(() => normalizeArticleFeed({ ...payload(), schema_version: "unknown" }, "en")).toThrow();
    expect(() => normalizeArticleFeed({ ok: false }, "en")).toThrow();
    expect(normalizeArticleFeed(payload([]), "en")).toEqual([]);
  });

  it("fetches anonymously without stale cache; unavailable differs from valid empty content", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(payload([]));
    expect(await getPublicArticleFeed("en")).toEqual([]);
    expect(apiClient.get).toHaveBeenCalledWith("/v0.5/articles-feed?locale=en&org_id=0", { locale: "en", skipAuth: true, cache: "no-store" });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("unavailable"));
    const failure = await GET(new Request("https://fermatmind.com/zh/articles/feed.xml"), { params: Promise.resolve({ locale: "zh" }) });
    expect(failure.status).toBe(503);
    expect(failure.headers.get("cache-control")).toBe("no-store");
    expect(await failure.text()).toContain("暂时不可用");
    vi.mocked(apiClient.get).mockResolvedValueOnce(payload([]));
    const empty = await GET(new Request("https://fermatmind.com/en/articles/feed.xml"), { params: Promise.resolve({ locale: "en" }) });
    expect(empty.status).toBe(200);
    expect(empty.headers.get("content-type")).toBe("application/atom+xml; charset=utf-8");
    expect(empty.headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(await empty.text()).not.toContain("<entry>");
  });

  it("does not create arbitrary locale/filter feeds", async () => {
    const filtered = await GET(new Request("https://fermatmind.com/en/articles/feed.xml?category=secret"), { params: Promise.resolve({ locale: "en" }) });
    expect(filtered.status).toBe(400);
    expect((await GET(new Request("https://fermatmind.com/fr/articles/feed.xml"), { params: Promise.resolve({ locale: "fr" }) })).status).toBe(404);
  });
});
