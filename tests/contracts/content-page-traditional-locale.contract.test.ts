import { afterEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/api-client", () => ({
  apiClient: { get: (...args: unknown[]) => get(...args) },
  ApiError: class extends Error { status = 404; },
}));

const record = (locale: string) => ({
  slug: "about", locale, title: "關於費馬測試", summary: "了解我們。", content_md: "## 我們\n\n正文。",
  path: "/about", kind: "company", template: "company", status: "published", is_public: true, is_indexable: true,
});

afterEach(async () => {
  get.mockReset();
  (await import("@/lib/cms/last-known-good")).clearLastKnownGoodForTests();
});

describe("CMS Traditional locale reader", () => {
  it("opens published CMS language navigation without advertising a noindex search alternate", async () => {
    const { traditionalPath, traditionalEquivalent, TRADITIONAL_PUBLIC_PATHS } = await import("@/lib/i18n/traditionalRoutes");
    expect(traditionalPath("/zh-TW/about")).toBe("/zh-TW/about");
    expect(traditionalPath("/zh/about")).toBe("/zh-TW/about");
    expect(traditionalPath("/en/about")).toBe("/zh-TW/about");
    expect(traditionalPath("/en/privacy")).toBeNull();
    for (const slug of ["brand", "charter", "careers"]) {
      expect(traditionalPath(`/zh-TW/${slug}`)).toBe(`/zh-TW/${slug}`);
      expect(traditionalPath(`/zh/${slug}`)).toBeNull();
      expect(traditionalEquivalent(`/zh-TW/${slug}`)).toBeNull();
      expect(TRADITIONAL_PUBLIC_PATHS).not.toContain(`/${slug}`);
    }
    expect(traditionalEquivalent("/zh/about")).toBeNull();
    expect(TRADITIONAL_PUBLIC_PATHS).not.toContain("/about");
    expect(traditionalPath("/zh-TW/account")).toBeNull();
  });
  it("requests the genuine variant with matching query and header", async () => {
    get.mockResolvedValue({ ok: true, page: record("zh-TW") });
    const cms = await import("@/lib/cms/content-pages");
    expect((await cms.getContentPage("about", "zh-TW"))?.locale).toBe("zh-TW");
    expect(get.mock.calls[0][0]).toContain("locale=zh-TW");
    expect(get.mock.calls[0][1]).toMatchObject({ skipAuth: true, headers: { "X-FAP-Locale": "zh-TW" } });
    expect(cms.buildContentPagePath("about", "zh-TW")).toBe("/zh-TW/about");
    expect(cms.buildContentPagePath("help-contact", "zh-TW")).toBe("/zh-TW/help/contact");
  });

  it.each([
    { locale: "zh-CN" }, { locale: "en" }, { locale: "zh-tw" }, { slug: "privacy" },
    { status: "draft" }, { is_public: false },
  ])("rejects a mismatched or unpublished projection: %j", async overrides => {
    get.mockResolvedValue({ ok: true, page: { ...record("zh-TW"), ...overrides } });
    const { getContentPage } = await import("@/lib/cms/content-pages");
    expect(await getContentPage("about", "zh-TW")).toBeNull();
  });

  it("isolates LKG per language and clears a withdrawn Traditional variant", async () => {
    const { getContentPageWithLastKnownGood } = await import("@/lib/cms/content-pages");
    get.mockResolvedValue({ ok: true, page: record("zh-CN") });
    await getContentPageWithLastKnownGood("about", "zh");
    get.mockRejectedValue(new Error("network unavailable"));
    await expect(getContentPageWithLastKnownGood("about", "zh-TW")).rejects.toThrow("network unavailable");
    get.mockResolvedValue({ ok: true, page: record("zh-TW") });
    await getContentPageWithLastKnownGood("about", "zh-TW");
    get.mockRejectedValue(new Error("network unavailable"));
    expect((await getContentPageWithLastKnownGood("about", "zh-TW")).source).toBe("last-known-good");
    get.mockResolvedValue({ ok: false, page: null });
    expect((await getContentPageWithLastKnownGood("about", "zh-TW")).value).toBeNull();
    get.mockRejectedValue(new Error("network unavailable"));
    await expect(getContentPageWithLastKnownGood("about", "zh-TW")).rejects.toThrow("network unavailable");
  });

  it("keeps existing simplified and English query identities", async () => {
    const { getContentPage } = await import("@/lib/cms/content-pages");
    for (const [locale, expected] of [["zh", "zh-CN"], ["zh-CN", "zh-CN"], ["en", "en"]]) {
      get.mockResolvedValue({ ok: true, page: record(expected) });
      const page = await getContentPage("about", locale);
      expect(page?.locale).toBe(expected === "zh-CN" ? "zh" : "en");
      expect(get.mock.lastCall?.[0]).toContain(`locale=${expected}`);
    }
  });
});
