import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/sitemap.xml/route";
import { buildPublicSitemapEntries, buildPublicSitemapXml } from "@/lib/seo/publicSitemap";

const ARTICLE_URL = "https://fermatmind.com/zh/articles/major-career-mismatch-job-search-skills-plan";
const ARTICLE_EN_URL = "https://fermatmind.com/en/articles/major-career-mismatch-job-search-skills-plan";
const PERSONALITY_COMPARISON_URL = "https://fermatmind.com/en/personality/intj-a-vs-intj-t";

function backendSitemapPayload() {
  return {
    ok: true,
    items: [
      { loc: ARTICLE_URL, lastmod: "2026-07-02T00:00:00+08:00" },
      { loc: ARTICLE_EN_URL, lastmod: "2026-07-02" },
      { loc: PERSONALITY_COMPARISON_URL, lastmod: "2026-07-02T01:00:00Z" },
      { loc: "https://www.fermatmind.com/zh/articles/major-career-mismatch-job-search-skills-plan" },
      { loc: "https://fermatmind.com/zh/result/private-attempt" },
      { loc: "https://fermatmind.com/en/orders/order-123" },
      { loc: "https://fermatmind.com/zh/payment/stripe/success" },
      { loc: "https://fermatmind.com/en/share/share-123" },
      { loc: "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types/take" },
      { loc: "https://example.com/zh/articles/not-owned" },
      { loc: "http://fermatmind.com/zh/articles/not-https" },
      { loc: "https://fermatmind.com/zh/articles/with-query?utm=1" },
    ],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public sitemap route", () => {
  it("builds sitemap XML from backend authority and excludes private paths", () => {
    const entries = buildPublicSitemapEntries(backendSitemapPayload());
    const xml = buildPublicSitemapXml(entries);

    expect(entries.map((entry) => entry.loc)).toEqual([ARTICLE_EN_URL, PERSONALITY_COMPARISON_URL, ARTICLE_URL]);
    expect(xml).toContain(`<loc>${ARTICLE_URL}</loc>`);
    expect(xml).toContain(`<loc>${ARTICLE_EN_URL}</loc>`);
    expect(xml).toContain(`<loc>${PERSONALITY_COMPARISON_URL}</loc>`);
    expect(xml).toContain("<lastmod>2026-07-01T16:00:00.000Z</lastmod>");
    expect(xml).not.toContain("/result/");
    expect(xml).not.toContain("/orders/");
    expect(xml).not.toContain("/payment/");
    expect(xml).not.toContain("/share/");
    expect(xml).not.toContain("/take");
    expect(xml).not.toContain("example.com");
    expect(xml).not.toContain("utm=1");
  });

  it("serves /sitemap.xml from backend sitemap-source at runtime", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("/api/v0.5/seo/sitemap-source");

      return new Response(JSON.stringify(backendSitemapPayload()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");
    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(xml).toContain(`<loc>${ARTICLE_URL}</loc>`);
    expect(xml).toContain(`<loc>${ARTICLE_EN_URL}</loc>`);
    expect(xml).toContain(`<loc>${PERSONALITY_COMPARISON_URL}</loc>`);
  });

  it("fails closed when backend sitemap authority is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: false }), { status: 503 }))
    );

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toContain("max-age=60");
    expect(body).toContain("Public sitemap source unavailable");
  });
});
