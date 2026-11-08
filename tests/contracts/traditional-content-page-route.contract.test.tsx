import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentPage } from "@/lib/cms/content-pages";
import { SITE_URL } from "@/lib/site";
import TraditionalLayout from "@/app/(traditional)/zh-TW/layout";

const read = vi.hoisted(() => vi.fn());
vi.mock("@/lib/cms/content-pages", async () => ({
  ...await vi.importActual("@/lib/cms/content-pages"),
  getContentPageWithLastKnownGood: read,
}));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
import { generateTraditionalContentPageMetadata, renderTraditionalContentPage } from "@/lib/cms/traditional-content-page-route";

function page(slug: string): ContentPage {
  return {
    slug, path: `/zh-TW/${slug}`, kind: "company", title: `繁體${slug}`, kicker: "公司",
    summary: "完整來源摘要。", template: "company", animationProfile: "none", locale: "zh-TW",
    publishedAt: "2026-11-08", updatedAt: "2026-11-08", effectiveAt: null, sourceDoc: "PRIVATE_SOURCE",
    isPublic: true, isIndexable: false, headings: ["工作原則"],
    contentMd: "## 工作原則\n\n**薪資範圍**：15K-25K RMB / 月。\n\n- 不替代專業判斷。", contentHtml: "",
    seoTitle: `繁體${slug}`, metaDescription: "完整來源摘要。", faqItems: [], schemaEnabled: false, supportContact: null,
  };
}

beforeEach(() => read.mockReset());
describe("shared Traditional CMS page route", () => {
  it.each(["about", "brand", "charter", "careers", "privacy", "terms", "method-boundaries", "science"])("renders the exact %s variant, metadata, language targets and schema", async slug => {
    read.mockResolvedValue({ value: page(slug) });
    const metadata = await generateTraditionalContentPageMetadata(slug);
    expect(metadata.alternates).toEqual({ canonical: `${SITE_URL}/zh-TW/${slug}` });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    const html = renderToStaticMarkup(await renderTraditionalContentPage(slug));
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector("h1")?.textContent).toBe(`繁體${slug}`);
    expect(document.querySelector('a[lang="en"]')?.getAttribute("href")).toBe(`/en/${slug}`);
    expect(document.querySelector('a[lang="zh-CN"]')?.getAttribute("href")).toBe(`/zh/${slug}`);
    expect(document.body.textContent).toContain("薪資範圍");
    expect(document.body.textContent).not.toContain("**");
    expect(document.body.textContent).toContain("15K-25K RMB / 月。");
    expect(html).not.toContain("PRIVATE_SOURCE");
    expect(document.querySelectorAll("main")).toHaveLength(0);
    const schema = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!));
    expect(schema.find(node => node["@type"] === "WebPage")).toMatchObject({ inLanguage: "zh-TW", url: `${SITE_URL}/zh-TW/${slug}` });
    expect(read).toHaveBeenCalledWith(slug, "zh-TW");
  });
  it.each([["foundation", "foundation"], ["policies", "policies"], ["help-faq", "help/faq"], ["help-about", "help/about"], ["help-team", "help/team"], ["help-used-and-mentioned", "help/used-and-mentioned"], ["help-for-business-and-research", "help/for-business-and-research"]])("renders the complete %s reader at its native path, and fails closed when missing", async (slug, path) => {
    read.mockResolvedValue({ value: { ...page(slug), path: `/zh-TW/${path}`, kind: slug.startsWith("help-") ? "help" : "company" } });
    const metadata = await generateTraditionalContentPageMetadata(slug);
    expect(metadata.alternates).toEqual({ canonical: `${SITE_URL}/zh-TW/${path}` });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    const document = new DOMParser().parseFromString(renderToStaticMarkup(await renderTraditionalContentPage(slug)), "text/html");
    expect(document.querySelector("h1")?.textContent).toBe(`繁體${slug}`);
    expect(document.body.textContent).toContain("15K-25K RMB / 月。");
    expect(document.querySelector('a[lang="en"]')?.getAttribute("href")).toBe(`/en/${path}`);
    expect(document.querySelector('a[lang="zh-CN"]')?.getAttribute("href")).toBe(`/zh/${path}`);
    expect(read).toHaveBeenCalledWith(slug, "zh-TW");
    read.mockResolvedValue({ value: null });
    await expect(renderTraditionalContentPage(slug)).rejects.toThrow("NOT_FOUND");
    await expect(generateTraditionalContentPageMetadata(slug)).rejects.toThrow("NOT_FOUND");
  });
  it("renders the native contact, nested canonical and available recovery controls", async () => {
    const contact = { ...page("help-contact"), path: "/zh-TW/help/contact", kind: "help", template: "help", supportContact: "support@example.invalid" };
    read.mockResolvedValue({ value: contact });
    const metadata = await generateTraditionalContentPageMetadata("help-contact");
    expect(metadata.alternates).toEqual({ canonical: `${SITE_URL}/zh-TW/help/contact` });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    const html = renderToStaticMarkup(await renderTraditionalContentPage("help-contact"));
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector('[data-testid="help-support-contact"] a')?.getAttribute("href")).toBe("mailto:support@example.invalid");
    for (const href of ["/zh-TW/email/preferences", "/zh-TW/email/unsubscribe", "/zh/orders/lookup", "/en/help/contact", "/zh/help/contact"]) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
    expect(document.querySelector('a[href="/zh/orders/lookup"]')?.textContent).toContain("簡體中文");
    for (const href of ["/zh-TW/orders/lookup", "/zh-TW/help/faq", "/zh-TW/support"]) {
      expect(document.querySelector(`a[href="${href}"]`)).toBeNull();
    }
    expect(read).toHaveBeenCalledWith("help-contact", "zh-TW");
  });
  it("exposes all nine published CMS pages in the actual Traditional footer", () => {
    const html = renderToStaticMarkup(<TraditionalLayout><p>內容</p></TraditionalLayout>);
    const document = new DOMParser().parseFromString(html, "text/html");
    for (const slug of ["about", "brand", "charter", "careers", "privacy", "terms", "method-boundaries", "science"]) {
      expect(document.querySelector(`footer nav[aria-label="費馬資訊"] a[href="/zh-TW/${slug}"]`)).not.toBeNull();
    }
    expect(document.querySelector('footer nav[aria-label="費馬資訊"] a[href="/zh-TW/help/contact"]')?.textContent).toBe("聯絡支援");
    expect(document.querySelectorAll('footer nav[aria-label="費馬資訊"] a')).toHaveLength(9);
    for (const slug of ["foundation", "support", "pricing", "policies"]) {
      expect(document.querySelector(`a[href="/zh-TW/${slug}"]`)).toBeNull();
    }
    expect(document.querySelectorAll("main")).toHaveLength(1);
    expect(document.documentElement.lang).toBe("zh-TW");
  });
  it.each([null, { ...page("brand"), locale: "zh-CN" }, page("charter")])("rejects missing or wrong identity without rendering a fallback", async value => {
    read.mockResolvedValue({ value });
    await expect(renderTraditionalContentPage("brand")).rejects.toThrow("NOT_FOUND");
    await expect(generateTraditionalContentPageMetadata("brand")).rejects.toThrow("NOT_FOUND");
  });
  it("preserves upstream unavailability as an error", async () => {
    read.mockRejectedValue(new Error("CMS_UNAVAILABLE"));
    await expect(renderTraditionalContentPage("brand")).rejects.toThrow("CMS_UNAVAILABLE");
  });
});
