import { renderToStaticMarkup } from "react-dom/server";
import TraditionalMethodology, { generateMetadata as traditionalMethodologyMetadata } from "@/app/(traditional)/zh-TW/personality/big-five/methodology/page";
import TraditionalSources, { generateMetadata as traditionalSourcesMetadata } from "@/app/(traditional)/zh-TW/personality/big-five/source-review-policy/page";
import { traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { SITE_URL } from "@/lib/site";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { DISCOVERABLE_CONTENT_PAGE_KEYS, buildContentPagePath, getContentPageWithLastKnownGood, normalizeBigFivePolicyContentPage } from "@/lib/cms/content-pages";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";
import { generateBigFivePolicyMetadata, renderBigFivePolicyPage } from "@/app/(localized)/[locale]/bigFivePolicyContentPageRoute";
import { resolveBigFivePublicRouteEntry } from "@/lib/personality/bigFivePublicRoutes";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

vi.mock("@/lib/api-client", async (original) => ({
  ...await original<typeof import("@/lib/api-client")>(), apiClient: { get: vi.fn() },
}));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));

type RecordInput = Parameters<typeof normalizeBigFivePolicyContentPage>[0];
function record(overrides: Partial<RecordInput> = {}): RecordInput {
  return {
    slug: "methodology", path: "/zh/personality/big-five/methodology",
    canonical_path: "/zh/personality/big-five/methodology", locale: "zh-CN",
    page_type: "methodology", kind: "policy", template: "company", animation_profile: "none",
    status: "published", review_state: "approved", is_public: true, is_indexable: true,
    publish_allowed: true, schema_enabled: false, operator_approval_required: false,
    title: "Methodology", summary: "Measurement boundaries", content_md: "## Scope\n\nPublic self-reflection content.",
    seo_title: "Big Five Methodology", seo_description: "Measurement boundaries and public evidence.",
    ...overrides,
  };
}
function english(overrides: Partial<RecordInput> = {}): RecordInput {
  return record({ locale: "en", path: "/en/personality/big-five/methodology",
    canonical_path: "/en/personality/big-five/methodology", operator_approval_required: true,
    operator_approved_at: "2026-09-29T00:00:00Z", ...overrides });
}

function taiwanPolicy(slug: "methodology" | "source-review-policy" = "methodology", overrides: Partial<RecordInput> = {}): RecordInput {
  const path = `/zh-TW/personality/big-five/${slug}`;
  return record({
    slug, path, canonical_path: path, locale: "zh-TW", is_indexable: false,
    page_type: slug === "methodology" ? "methodology" : "trust",
    title: "大五人格方法說明", content_md: "## 適用範圍\n\n供自我探索使用。",
    headings: [{ key: "scope", title: "適用範圍" }],
    ...overrides,
  });
}

beforeEach(() => {
  clearLastKnownGoodForTests(); vi.mocked(apiClient.get).mockReset();
  vi.unstubAllGlobals();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
});

describe("Big Five ContentPage policy routes", () => {
  it("keeps both identities separate from the personality asset catalog", () => {
    expect(buildContentPagePath("methodology", "zh")).toBe("/zh/personality/big-five/methodology");
    expect(buildContentPagePath("source-review-policy", "en")).toBe("/en/personality/big-five/source-review-policy");
    expect(resolveBigFivePublicRouteEntry(["methodology"])).toBeNull();
    expect(resolveBigFivePublicRouteEntry(["source-review-policy"])).toBeNull();
    // The deployed LLMS contract accepts exactly the existing 104 asset URLs.
    expect(DISCOVERABLE_CONTENT_PAGE_KEYS).not.toContain("methodology");
    expect(DISCOVERABLE_CONTENT_PAGE_KEYS).not.toContain("source-review-policy");
    expect(buildContentPagePath("privacy", "zh")).toBe("/zh/privacy");
  });

  it("uses the exact published API identity and SEO description", () => {
    const page = normalizeBigFivePolicyContentPage(record(), "methodology", "zh");
    expect(page?.locale).toBe("zh");
    expect(page?.metaDescription).toBe("Measurement boundaries and public evidence.");
    expect(normalizeBigFivePolicyContentPage(record({ slug: "source-review-policy", path: "/zh/personality/big-five/source-review-policy", canonical_path: "/zh/personality/big-five/source-review-policy", page_type: "trust" }), "source-review-policy", "zh")).not.toBeNull();
  });

  it.each([
    { canonical_path: "/en/personality/big-five/methodology" }, { path: "/methodology" },
    { locale: "en" }, { status: "draft" }, { review_state: "draft" },
    { is_public: false }, { publish_allowed: false }, { is_indexable: undefined },
    { schema_enabled: undefined }, { operator_approval_required: undefined },
    { page_type: "trust" }, { kind: "unknown" }, { template: "unknown" },
    { seo_title: null }, { seo_description: null, meta_description: null },
  ] as Partial<RecordInput>[])("rejects missing or inconsistent authority %#", (change) => {
    expect(normalizeBigFivePolicyContentPage(record(change), "methodology", "zh")).toBeNull();
  });

  it("rejects the actual legacy English placeholder contract", () => {
    expect(normalizeBigFivePolicyContentPage(english({ path: "/methodology", operator_approved_at: null, seo_description: null, meta_description: null, content_md: "# Methodology\n\nDraft candidate" }), "methodology", "en")).toBeNull();
    expect(normalizeBigFivePolicyContentPage(english({ operator_approved_at: null }), "methodology", "en")).toBeNull();
    expect(normalizeBigFivePolicyContentPage(english({ operator_approved_at: "invalid" }), "methodology", "en")).toBeNull();
    expect(normalizeBigFivePolicyContentPage(english(), "methodology", "en")).not.toBeNull();
  });

  it("clears stale content when the CMS withdraws the page", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ ok: true, page: record() })
      .mockResolvedValueOnce({ ok: true, page: record({ status: "draft" }) })
      .mockRejectedValueOnce(new Error("API unavailable"));
    expect((await getContentPageWithLastKnownGood("methodology", "zh")).value).not.toBeNull();
    expect((await getContentPageWithLastKnownGood("methodology", "zh")).value).toBeNull();
    await expect(getContentPageWithLastKnownGood("methodology", "zh")).rejects.toThrow("API unavailable");
  });

  it("uses a previously validated LKG on an API outage", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ ok: true, page: record() }).mockRejectedValueOnce(new Error("API unavailable"));
    await getContentPageWithLastKnownGood("methodology", "zh");
    expect((await getContentPageWithLastKnownGood("methodology", "zh")).source).toBe("last-known-good");
  });

  it("omits language alternates when English is not publishable", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => ({ ok: true, page: String(url).includes("locale=en") ? english({ operator_approved_at: null }) : record() }));
    const metadata = await generateBigFivePolicyMetadata({ params: Promise.resolve({ locale: "zh" }), slug: "methodology" });
    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/zh/personality/big-five/methodology");
    expect(metadata.alternates?.languages).toBeUndefined();
    await expect(renderBigFivePolicyPage({ params: Promise.resolve({ locale: "en" }), slug: "methodology" })).rejects.toThrow("NOT_FOUND");
  });

  it("emits reciprocal alternates only for two indexable accepted pages", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => ({ ok: true, page: String(url).includes("locale=en") ? english() : record() }));
    const metadata = await generateBigFivePolicyMetadata({ params: Promise.resolve({ locale: "zh" }), slug: "methodology" });
    expect(metadata.alternates?.languages).toMatchObject({ en: "https://fermatmind.com/en/personality/big-five/methodology", "zh-CN": "https://fermatmind.com/zh/personality/big-five/methodology" });
  });

  it("keeps a valid locale available when only the alternate API is unavailable", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (String(url).includes("locale=en")) throw new Error("Alternate unavailable");
      return { ok: true, page: record() };
    });
    const metadata = await generateBigFivePolicyMetadata({ params: Promise.resolve({ locale: "zh" }), slug: "methodology" });
    expect(metadata.alternates?.languages).toBeUndefined();
    await expect(generateBigFivePolicyMetadata({ params: Promise.resolve({ locale: "en" }), slug: "methodology" })).rejects.toThrow("Alternate unavailable");
  });

  it("renders CMS body and respects the disabled schema flag", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ ok: true, page: record() });
    const html = renderToStaticMarkup(await renderBigFivePolicyPage({ params: Promise.resolve({ locale: "zh" }), slug: "methodology" }));
    expect(html).toContain("Public self-reflection content.");
    expect(html).not.toContain("application/ld+json");
    expect(html).not.toContain('href="/zh-TW/personality/big-five/methodology"');
  });

  it("links to the Taiwan policy from its original page after publication", async () => {
    vi.mocked(apiClient.get).mockImplementation(async url => ({
      ok: true, page: String(url).includes("locale=zh-TW") ? taiwanPolicy() : record(),
    }));
    const html = renderToStaticMarkup(await renderBigFivePolicyPage({ params: Promise.resolve({ locale: "zh" }), slug: "methodology" }));
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector('a[lang="zh-TW"]')?.getAttribute("href")).toBe("/zh-TW/personality/big-five/methodology");
    expect(html).toContain("Public self-reflection content.");
  });

  it("allows a valid ContentPage through the prestream proxy probe", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("/api/v0.5/content-pages/methodology?locale=zh-CN&org_id=0");
      return Response.json({ ok: true, page: record() });
    });
    vi.stubGlobal("fetch", fetchMock);
    const response = await proxy(new NextRequest("https://fermatmind.com/zh/personality/big-five/methodology"));
    expect(response.status).toBe(200);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/v0.5/content-pages/methodology?locale=zh-CN&org_id=0");
  });

  it("rejects legacy English before streaming and keeps unknown asset routes absent", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true, page: english({ operator_approved_at: null }) })));
    const response = await proxy(new NextRequest("https://fermatmind.com/en/personality/big-five/methodology"));
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const unknown = await proxy(new NextRequest("https://fermatmind.com/zh/personality/big-five/unknown"));
    expect(unknown.status).toBe(404);
  });

  it("preserves a backend gone response and lets transient failures reach the route error boundary", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 410 })));
    expect((await proxy(new NextRequest("https://fermatmind.com/zh/personality/big-five/methodology"))).status).toBe(410);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("API unavailable"); }));
    expect((await proxy(new NextRequest("https://fermatmind.com/zh/personality/big-five/methodology"))).status).toBe(200);
  });
});

describe("Traditional Big Five policy readers", () => {
  it.each([
    ["methodology", TraditionalMethodology, traditionalMethodologyMetadata],
    ["source-review-policy", TraditionalSources, traditionalSourcesMetadata],
  ] as const)("renders the exact approved %s CMS body at its nested canonical", async (slug, Page, metadataForPage) => {
    vi.mocked(apiClient.get).mockImplementation(async url => {
      const locale = String(url).includes("locale=zh-TW") ? "zh-TW" : String(url).includes("locale=en") ? "en" : "zh";
      const path = buildContentPagePath(slug, locale);
      return { ok: true, page: taiwanPolicy(slug, { path, canonical_path: path, locale: locale === "zh" ? "zh-CN" : locale }) };
    });
    const path = `/zh-TW/personality/big-five/${slug}`;
    const metadata = await metadataForPage();
    expect(metadata.alternates).toEqual({ canonical: SITE_URL + path });
    expect(metadata.robots).toMatchObject({ index: false });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain("供自我探索使用。");
    expect(html).not.toContain("application/ld+json");
    expect(html).toContain(`href="/zh/personality/big-five/${slug}"`);
    expect(html).toContain(`href="/en/personality/big-five/${slug}"`);
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining(`/content-pages/${slug}?locale=zh-TW`),
      expect.objectContaining({ headers: { "X-FAP-Locale": "zh-TW" } }));
    expect(traditionalPath(path)).toBe(path);
    expect(traditionalPath(path.replace("/zh-TW/", "/zh/"))).toBeNull();
    expect(traditionalEquivalent(path)).toBeNull();
  });

  it("links only available source-language versions", async () => {
    vi.mocked(apiClient.get).mockImplementation(async url => {
      if (String(url).includes("locale=en")) throw new Error("Alternate unavailable");
      return { ok: true, page: String(url).includes("locale=zh-TW") ? taiwanPolicy() : record() };
    });
    const html = renderToStaticMarkup(await TraditionalMethodology());
    expect(html).toContain('href="/zh/personality/big-five/methodology"');
    expect(html).not.toContain('href="/en/personality/big-five/methodology"');
  });

  it("accepts structured heading titles and rejects wrong path, locale, indexability and heading identity", () => {
    expect(normalizeBigFivePolicyContentPage(taiwanPolicy(), "methodology", "zh-TW")?.headings).toEqual(["適用範圍"]);
    for (const overrides of [
      { canonical_path: "/zh-TW/methodology" }, { locale: "zh-CN" }, { is_indexable: true },
      { headings: [] }, { headings: ["適用範圍"] },
      { headings: [{ key: "scope", title: "一" }, { key: "scope", title: "二" }] },
    ]) {
      expect(normalizeBigFivePolicyContentPage(taiwanPolicy("methodology", overrides), "methodology", "zh-TW")).toBeNull();
    }
  });

  it("rejects a missing or wrong-locale variant before streaming", async () => {
    const url = "https://fermatmind.com/zh-TW/personality/big-five/methodology";
    const mock = vi.fn(async () => new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", mock);
    expect((await proxy(new NextRequest(url))).status).toBe(404);
    expect(mock).toHaveBeenCalledWith(expect.stringContaining("locale=zh-TW"), expect.objectContaining({
      headers: { Accept: "application/json", "X-FAP-Locale": "zh-TW" },
    }));
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true, page: record() })));
    expect((await proxy(new NextRequest(url))).status).toBe(404);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true, page: taiwanPolicy() })));
    expect((await proxy(new NextRequest(url))).status).toBe(200);
  });
});
