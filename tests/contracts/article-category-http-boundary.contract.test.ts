import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const category = { slug: "personality", line_key: "personality-and-self-understanding",
  name: "Synthetic category", description: "Synthetic public description", article_count: 1 };
const published = { schema_version: 1, configuration_state: "published", title: "Synthetic Blog",
  description: "Synthetic Blog description", categories: [category], featured_items: [] };

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Blog category prestream HTTP authority", () => {
  it.each(["en", "zh"] as const)("uses fresh public %s authority for GET and HEAD, independent of page filters", async locale => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/api/v0.5/articles");
      expect(Object.fromEntries(url.searchParams)).toEqual({ locale: locale === "zh" ? "zh-CN" : "en",
        org_id: "0", include_blog: "1", page: "1", per_page: "1" });
      expect(init?.method).toBe("GET");
      expect(init?.cache).toBe("no-store");
      expect(init?.redirect).toBe("manual");
      expect(init?.headers).toEqual({ Accept: "application/json", "X-FAP-Locale": locale === "zh" ? "zh-CN" : "en" });
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      return Response.json({ ok: true, blog_v1: published });
    });
    vi.stubGlobal("fetch", fetchMock);
    for (const method of ["GET", "HEAD"]) {
      const response = await proxy(new NextRequest(`https://example.com/${locale}/articles/category/unknown?page=99&category=personality`, { method }));
      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
      expect(response.headers.get("set-cookie")).toBeNull();
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("allows newly published categories without a build or stale proxy cache", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ ok: true, blog_v1: published }))
      .mockResolvedValueOnce(Response.json({ ok: true, blog_v1: { ...published, categories: [{ ...category, slug: "new-category" }] } }));
    vi.stubGlobal("fetch", fetchMock);
    const request = () => new NextRequest("https://example.com/en/articles/category/new-category?page=2");
    expect((await proxy(request())).status).toBe(404);
    expect((await proxy(request())).headers.get("x-middleware-next")).toBe("1");
  });

  it("returns 404 when CMS explicitly has no configured category routes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true,
      blog_v1: { schema_version: 1, configuration_state: "unconfigured" } })));
    expect((await proxy(new NextRequest("https://example.com/zh/articles/category/personality"))).status).toBe(404);
  });

  it.each([undefined, { ...published, schema_version: 2 }, { ...published, configuration_state: "invalid" },
    { ...published, categories: [{ ...category, article_count: 0 }] },
    { ...published, categories: [{ ...category, name: "" }] }])("preserves the page error state for invalid authority %j", async blog => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true, blog_v1: blog })));
    expect((await proxy(new NextRequest("https://example.com/en/articles/category/unknown"))).headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["server-error", "redirect", "timeout", "invalid-json", "false-envelope"])("does not infer absence from %s", async failure => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      if (failure === "timeout") throw new Error("Synthetic timeout");
      if (failure === "invalid-json") return new Response("invalid");
      if (failure === "false-envelope") return Response.json({ ok: false, blog_v1: published });
      return new Response(null, { status: failure === "redirect" ? 302 : 503 });
    }));
    expect((await proxy(new NextRequest("https://example.com/en/articles/category/unknown"))).headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["Bad_slug", "unknown.json", "unknown.png", "bad%2Fslug", "bad%ZZslug"])("rejects malformed category slug %s without probing CMS", async slug => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    expect((await proxy(new NextRequest(`https://example.com/en/articles/category/${slug}`))).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not add category probes to other routes or write methods", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    for (const [pathname, method] of [["/en/articles", "GET"], ["/zh/topics", "GET"],
      ["/en/articles/category/personality", "POST"], ["/en/articles/category/personality", "OPTIONS"]]) {
      expect((await proxy(new NextRequest(`https://example.com${pathname}`, { method }))).status).toBe(200);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
