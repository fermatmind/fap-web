import { buildPageMetadata } from "@/lib/seo/metadata";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import { isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";

import { appendFriendshipSitemapEntries } from "@/lib/friendship/sitemap";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getRootSitemap } from "@/app/sitemap.xml/route";
import { GET as getFamilySitemap } from "@/app/sitemaps/[family]/route";
import {
  appendTraditionalProductSitemapEntries,
  buildCompletePublicSitemapEntries,
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
const CAREER_ROOT_EN_URL = "https://fermatmind.com/en/career";
const CAREER_ROOT_ZH_URL = "https://fermatmind.com/zh/career";
const RESOURCE_EN_URL = "https://fermatmind.com/en/holland-test/pdf-download";
const RESOURCE_ZH_URL = "https://fermatmind.com/zh/holland-test/pdf-download";
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
      { loc: CAREER_ROOT_EN_URL },
      { loc: CAREER_ROOT_ZH_URL },
      { loc: RESOURCE_EN_URL },
      { loc: RESOURCE_ZH_URL },
      { loc: CAREER_ROOT_EN_URL },
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
  it("excludes archived test entries and guides without excluding neighboring tests", async () => {
    const entry = "/tests/explore/time-of-year-context-reflection";
    const guide = `${entry}/results/mood-and-energy-across-the-year-reading`;
    const archived = ["en", "zh", "zh-TW"].flatMap((locale) =>
      [entry, guide].map((path) => `/${locale}${path}`),
    );
    const retained = "/en/tests/explore/gta-6-character-quiz";
    const payload = backendSitemapPayload();
    payload.items.push(...archived.map((path) => ({ loc: `https://fermatmind.com${path}` })));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload))));
    const xml = await (await getRootSitemap()).text();
    expect(xml).not.toContain(entry);
    expect(xml).toContain(retained);
    expect(archived.every(isSharedDiscoverabilityDeniedPath)).toBe(true);
    expect(isSharedDiscoverabilityDeniedPath(retained)).toBe(false);

    for (const pathname of archived) {
      const locale = pathname.startsWith("/en/") ? "en" : "zh";
      const alternates = { canonical: `https://fermatmind.com${pathname}` };
      const metadata = pathname.startsWith("/zh-TW/")
        ? traditionalSearchMetadata(pathname, { alternates, robots: { index: false, follow: true } })
        : buildPageMetadata({
            locale,
            pathname,
            title: "Reflection",
            description: "A public reflection",
            alternatesByLocale: { en: `/en${entry}`, zh: `/zh${entry}` },
          });
      expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(pathname);
      expect(metadata.alternates?.languages).toBeUndefined();
      expect(metadata.robots).toMatchObject({ index: false, follow: true });
    }
  });

  it.each(["root", ...PUBLIC_SITEMAP_FAMILIES])("passes the complete %s sitemap to Next for HTTP compression", async (family) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(backendSitemapPayload()))));
    const read = (encoding: string) => family === "root"
      ? getRootSitemap(new Request("https://fermatmind.com/sitemap.xml", { headers: { "Accept-Encoding": encoding } }))
      : getFamilySitemap(new Request(`https://fermatmind.com/sitemaps/${family}.xml`, { headers: { "Accept-Encoding": encoding } }), {
        params: Promise.resolve({ family: `${family}.xml` }),
      });
    const plain = await read("identity");
    const xml = await plain.text();
    const gzipRequest = await read("gzip");
    expect(gzipRequest.status).toBe(200);
    expect(gzipRequest.headers.get("Content-Encoding")).toBeNull();
    expect(gzipRequest.headers.get("Vary")).toBe("Accept-Encoding");
    expect(gzipRequest.headers.get("Cache-Control")).toBe(plain.headers.get("Cache-Control"));
    expect(gzipRequest.headers.get("CDN-Cache-Control")).toBe(plain.headers.get("CDN-Cache-Control"));
    expect(await gzipRequest.text()).toBe(xml);
    expect(xml).toMatch(/<\/urlset>\s*$/);
    expect(xml).not.toContain("/result/private-attempt");
  });

  it.each([
    ["", 200], ["gzip;q=0", 200], ["br", 200],
    ["gzip;q=0.2, identity;q=0.9", 200], ["gzip;q=0, *;q=1", 200],
    ["GZIP;q=1.000", 200], ["*;q=0.5", 200],
    ["gzip;q=0, identity;q=0", 406], ["*;q=0", 406],
  ])("validates encoding availability for %s", async (encoding, status) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(backendSitemapPayload()))));
    const response = await getRootSitemap(new Request("https://fermatmind.com/sitemap.xml", {
      headers: { "Accept-Encoding": encoding },
    }));
    expect(response.status).toBe(status);
    expect(response.headers.get("Content-Encoding")).toBeNull();
    expect(response.headers.get("Vary")).toBe("Accept-Encoding");
  });

  it("keeps unavailable authority failures uncompressed for gzip clients", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));
    for (const response of [
      await getRootSitemap(new Request("https://fermatmind.com/sitemap.xml", { headers: { "Accept-Encoding": "gzip" } })),
      await getFamilySitemap(new Request("https://fermatmind.com/sitemaps/tests.xml", { headers: { "Accept-Encoding": "gzip" } }), {
        params: Promise.resolve({ family: "tests.xml" }),
      }),
    ]) {
      expect(response.status).toBe(503);
      expect(response.headers.get("Content-Encoding")).toBeNull();
      expect(await response.text()).toContain("Public sitemap source unavailable");
    }
  });

  it("builds sitemap XML from backend authority and excludes private paths", () => {
    const entries = buildPublicSitemapEntries(backendSitemapPayload());
    const xml = buildPublicSitemapXml(entries);

    expect(entries.map((entry) => entry.loc)).toEqual([
      ARTICLE_EN_URL,
      CAREER_ROOT_EN_URL,
      RESOURCE_EN_URL,
      OTHER_URL,
      PERSONALITY_COMPARISON_URL,
      TEST_URL,
      ARTICLE_URL,
      CAREER_ROOT_ZH_URL,
      CAREER_URL,
      RESOURCE_ZH_URL,
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
    expect(xml).toContain(`<loc>${CAREER_ROOT_EN_URL}</loc>`);
    expect(xml).toContain(`<loc>${CAREER_ROOT_ZH_URL}</loc>`);
    expect(xml).not.toContain("example.com");
    expect(xml).not.toContain("utm=1");
  });

  it("keeps all four authority targets unique and omits unknown update times across generations", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    const first = buildPublicSitemapEntries(backendSitemapPayload());
    vi.setSystemTime(new Date("2040-01-01T00:00:00Z"));
    const second = buildPublicSitemapEntries(backendSitemapPayload());
    vi.useRealTimers();
    expect(second).toEqual(first);
    for (const loc of [CAREER_ROOT_EN_URL, CAREER_ROOT_ZH_URL, RESOURCE_EN_URL, RESOURCE_ZH_URL]) {
      expect(second.filter((entry) => entry.loc === loc)).toEqual([{ loc }]);
      expect(buildPublicSitemapXml(second)).toContain(`<loc>${loc}</loc>\n  </url>`);
    }
    expect(buildPublicSitemapXml(second)).toContain("<lastmod>2026-07-01T16:00:00.000Z</lastmod>");
    expect(buildPublicSitemapEntries({ items: [] })).toEqual([]);
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
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0, must-revalidate");
    expect(response.headers.get("CDN-Cache-Control")).toBe("no-store");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(xml).toContain(`<loc>${ARTICLE_URL}</loc>`);
    expect(xml).toContain(`<loc>${ARTICLE_EN_URL}</loc>`);
    expect(xml).toContain(`<loc>${PERSONALITY_COMPARISON_URL}</loc>`);
  });

  it("keeps the eight public friendship identities in both root and tests sitemaps", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(backendSitemapPayload()), {
      status: 200, headers: { "Content-Type": "application/json" },
    })));
    const root = await (await getRootSitemap()).text();
    const family = await (await getFamilySitemap(new Request("https://fermatmind.com/sitemaps/tests.xml"), {
      params: Promise.resolve({ family: "tests.xml" }),
    })).text();
    for (const { loc } of appendFriendshipSitemapEntries([])) {
      const entry = `<loc>${loc}</loc>`;
      expect(root.split(entry)).toHaveLength(2);
      expect(family.split(entry)).toHaveLength(2);
    }
    expect(root).not.toContain("/share/friendship/");
    expect(family).not.toContain("/share/friendship/");
  });

  it("partitions the unchanged root URL union into deterministic disjoint families", () => {
    const rootEntries = buildPublicSitemapEntries(backendSitemapPayload());
    const families = buildPublicSitemapFamilyMap(rootEntries);
    const familyEntries = PUBLIC_SITEMAP_FAMILIES.flatMap((family) => families[family]);

    expect(families.tests.map((entry) => entry.loc)).toEqual([TEST_URL]);
    expect(families.articles.map((entry) => entry.loc)).toEqual([ARTICLE_EN_URL, ARTICLE_URL]);
    expect(families.career.map((entry) => entry.loc)).toEqual([CAREER_ROOT_EN_URL, CAREER_ROOT_ZH_URL, CAREER_URL]);
    expect(families.personality.map((entry) => entry.loc)).toEqual([PERSONALITY_COMPARISON_URL]);
    expect(families.other.map((entry) => entry.loc)).toEqual([RESOURCE_EN_URL, OTHER_URL, RESOURCE_ZH_URL]);
    expect(new Set(familyEntries.map((entry) => entry.loc))).toEqual(
      new Set(rootEntries.map((entry) => entry.loc))
    );
    expect(familyEntries).toHaveLength(rootEntries.length);
  });

  it("classifies Traditional Chinese personality URLs from backend authority", () => {
    const loc = "https://fermatmind.com/zh-TW/personality/intj";
    const baseline = backendSitemapPayload();
    expect(buildPublicSitemapFamilyMap(buildPublicSitemapEntries(baseline)).personality.map((row) => row.loc))
      .not.toContain(loc);
    const entries = buildPublicSitemapEntries({ ...baseline, items: [...baseline.items, { loc }] });
    const families = buildPublicSitemapFamilyMap(entries);
    expect(families.personality.map((row) => row.loc)).toContain(loc);
    expect(families.other.map((row) => row.loc)).not.toContain(loc);
  });

  it("classifies Traditional Chinese article URLs supplied by the backend without generating them locally", () => {
    const loc = "https://fermatmind.com/zh-TW/articles/reviewed-article";
    const baseline = backendSitemapPayload();
    expect(buildPublicSitemapFamilyMap(buildPublicSitemapEntries(baseline)).articles.map((row) => row.loc))
      .not.toContain(loc);
    const entries = buildPublicSitemapEntries({ ...baseline, items: [...baseline.items, { loc }] });
    const families = buildPublicSitemapFamilyMap(entries);
    expect(families.articles.map((row) => row.loc)).toContain(loc);
    expect(families.other.map((row) => row.loc)).not.toContain(loc);
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
    const expectedEntries = buildPublicSitemapFamilyMap(buildCompletePublicSitemapEntries(
      buildPublicSitemapEntries(backendSitemapPayload()),
    ))[family];

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
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0, must-revalidate");
    expect(response.headers.get("CDN-Cache-Control")).toBe("no-store");
    expect(body).toContain("Public sitemap source unavailable");
  });
});


it("projects only published bilingual core assessment paths and opens supported Taiwan assessments", () => {
  const core = "/tests/mbti-personality-test-16-personality-types";
  const take = core + "/take";
  const base = "https://fermatmind.com";
  const entries = [
    { loc: base + "/en" + core },
    { loc: base + "/zh" + core },
    { loc: base + "/en/tests/category/career" },
    { loc: base + "/zh" + take },
  ];
  expect(appendTraditionalProductSitemapEntries(entries).filter(entry => entry.loc.includes("/zh-TW")))
    .toEqual([{ loc: base + "/zh-TW" + core }]);
  for (const locale of ["en", "zh"] as const) {
    const metadata = buildPageMetadata({
      locale,
      pathname: `/${locale}${core}`,
      title: "MBTI",
      description: "Assessment",
      alternatesByLocale: { en: "/en" + core, zh: "/zh" + core },
    });
    expect(new URL(String(metadata.alternates?.languages?.["zh-TW"])).pathname).toBe("/zh-TW" + core);
  }
  const source = { robots: { index: false, follow: true } };
  const path = "/zh-TW/tests/explore/sbti-test/results/self-critic";
  const fun = buildCompletePublicSitemapEntries([]);
  expect(fun.find(entry => entry.loc === base + path)).toBeDefined();
  expect(traditionalSearchMetadata(path, source)).toMatchObject({
    robots: { index: true },
    alternates: { canonical: base + path, languages: {
      en: base + path.replace("/zh-TW", "/en"), "zh-CN": base + path.replace("/zh-TW", "/zh"), "zh-TW": base + path,
    } },
  });
  expect(traditionalSearchMetadata("/zh-TW" + take, source)).toBe(source);
  expect(traditionalSearchMetadata("/zh-TW/tests/explore/sbti-test/results/unknown", source)).toBe(source);
  expect(fun.filter(entry => entry.loc.includes("/zh-TW/tests/")).every(entry => !entry.loc.endsWith("/take"))).toBe(true);
});
