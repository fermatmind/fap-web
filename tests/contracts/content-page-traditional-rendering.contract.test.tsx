import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import type { ContentPage } from "@/lib/cms/content-pages";

const page: ContentPage = {
  slug: "about", path: "/zh-TW/about", kind: "company", title: "關於費馬測試", kicker: "公司",
  summary: "興趣不是能力。", template: "company", animationProfile: "none", locale: "zh-TW",
  publishedAt: "2026-11-08", updatedAt: "2026-11-08", effectiveAt: null, sourceDoc: "private-source-do-not-render",
  isPublic: true, isIndexable: false, headings: ["我們是誰", "我們的邊界"],
  contentMd: "## 我們是誰\n\n興趣不是能力。\n\n## 我們的邊界\n\n- 不替代專業判斷。", contentHtml: "",
  seoTitle: "關於費馬測試", metaDescription: "興趣不是能力。", faqItems: [], schemaEnabled: false, supportContact: null,
};

describe("Traditional CMS About complete rendering", () => {
  it("renders CMS text plus all existing team profiles, localized labels and dates", () => {
    const html = renderToStaticMarkup(<ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale="zh-TW" />);
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector("h1")?.textContent).toBe("關於費馬測試");
    expect(document.body.textContent).toContain("興趣不是能力。");
    expect(document.body.textContent).toContain("創始人與博士顧問團隊");
    for (const name of ["劉福威", "賈睿璇", "李琛"]) expect(document.body.textContent).toContain(name);
    expect(document.querySelectorAll('[data-testid="about-team-section"] article')).toHaveLength(3);
    expect(document.querySelector('[data-testid="about-team-section"] img')?.getAttribute("alt")).toBe("劉福威，費馬測試創始人");
    expect(document.body.textContent).toContain("6000");
    expect(document.body.textContent).toContain("最近更新");
    expect(document.body.textContent).toContain("2026年11月8日");
    expect(document.querySelector('a[href="/zh-TW"]')).not.toBeNull();
    expect(document.querySelector('a[href="/zh-TW/charter"]')).toBeNull();
    expect(document.querySelector("main")).toBeNull(); // The Traditional root layout owns the main landmark.
    expect(html).not.toContain("private-source-do-not-render");
  });

  it("keeps unsupported rich formats closed rather than silently misrendering a future page", () => {
    expect(() => renderToStaticMarkup(<ContentPageTemplate page={{ ...page, contentHtml: "<p>正文</p>" }} locale="zh-TW" />)).toThrow("HTML adapter unavailable");
    expect(() => renderToStaticMarkup(<ContentPageTemplate page={{ ...page, contentMd: "[說明](/zh/science)" }} locale="zh-TW" />)).toThrow("inline format unavailable");
  });
});
