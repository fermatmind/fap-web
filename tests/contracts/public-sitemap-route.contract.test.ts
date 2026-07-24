import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getRootSitemap } from "@/app/sitemap.xml/route";
import { GET as getFamilySitemap } from "@/app/sitemaps/[family]/route";
import {
  buildPublicSitemapEntries,
  buildPublicSitemapFamilyMap,
  buildPublicSitemapXml,
  PUBLIC_SITEMAP_FAMILIES,
} from "@/lib/seo/publicSitemap";

const ARTICLE_URL = "https://fermatmind.com/zh/articles/major-career-mismatch-job-search-skills-plan";
const ARTICLE_EN_URL = "https://fermatmind.com/en/articles/major-career-mismatch-job-search-skills-plan";
const PERSONALITY_COMPARISON_URL = "https://fermatmind.com/en/personality/intj-a-vs-intj-t";
const TEST_URL = "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types";
const CAREER_URL = "https://fermatmind.com/zh/career/jobs/software-developers";
const OTHER_URL = "https://fermatmind.com/en/method-boundaries";

function backendSitemapPayload() {
  return {
    ok: true,
    items: [
      { loc: ARTICLE_URL, lastmod: "2026-07-02T00:00:00+08:00" },
      { loc: ARTICLE_EN_URL, lastmod: "2026-07-02" },
      { loc: PERSONALITY_COMPARISON_URL, lastmod: "2026-07-02T01:00:00Z" },
      { loc: TEST_URL, lastmod: "2026-07-03" },
      { loc: CAREER_URL, lastmod: "2026-07-04" },
      { loc: OTHER_URL, lastmod: "2026-07-05" },
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

    expect(entries.map((entry) => entry.loc)).toEqual([
      ARTICLE_EN_URL,
      OTHER_URL,
      PERSONALITY_COMPARISON_URL,
      TEST_URL,
      ARTICLE_URL,
      CAREER_URL,
    ]);
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

    const response = await getRootSitemap();
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");
    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(xml).toContain(`<loc>${ARTICLE_URL}</loc>`);
    expect(xml).toContain(`<loc>${ARTICLE_EN_URL}</loc>`);
    expect(xml).toContain(`<loc>${PERSONALITY_COMPARISON_URL}</loc>`);
  });

  it("partitions the unchanged root URL union into deterministic disjoint families", () => {
    const rootEntries = buildPublicSitemapEntries(backendSitemapPayload());
    const families = buildPublicSitemapFamilyMap(rootEntries);
    const familyEntries = PUBLIC_SITEMAP_FAMILIES.flatMap((family) => families[family]);

    expect(families.tests.map((entry) => entry.loc)).toEqual([TEST_URL]);
    expect(families.articles.map((entry) => entry.loc)).toEqual([ARTICLE_EN_URL, ARTICLE_URL]);
    expect(families.career.map((entry) => entry.loc)).toEqual([CAREER_URL]);
    expect(families.personality.map((entry) => entry.loc)).toEqual([PERSONALITY_COMPARISON_URL]);
    expect(families.other.map((entry) => entry.loc)).toEqual([OTHER_URL]);
    expect(new Set(familyEntries.map((entry) => entry.loc))).toEqual(
      new Set(rootEntries.map((entry) => entry.loc))
    );
    expect(familyEntries).toHaveLength(rootEntries.length);
  });

  it.each(PUBLIC_SITEMAP_FAMILIES)("serves the %s child sitemap from the same backend payload", async (family) => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(backendSitemapPayload()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await getFamilySitemap(new Request(`https://fermatmind.com/sitemaps/${family}.xml`), {
      params: Promise.resolve({ family: `${family}.xml` }),
    });
    const xml = await response.text();
    const expectedEntries = buildPublicSitemapFamilyMap(buildPublicSitemapEntries(backendSitemapPayload()))[family];

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(xml).toBe(buildPublicSitemapXml(expectedEntries));
  });

  it("rejects unknown family routes before fetching backend authority", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await getFamilySitemap(new Request("https://fermatmind.com/sitemaps/private.xml"), {
      params: Promise.resolve({ family: "private.xml" }),
    });

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when backend sitemap authority is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: false }), { status: 503 }))
    );

    const response = await getRootSitemap();
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toContain("max-age=60");
    expect(body).toContain("Public sitemap source unavailable");
  });
});
