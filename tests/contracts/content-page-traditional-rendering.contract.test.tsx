import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import type { ContentPage } from "@/lib/cms/content-pages";
import { buildWebPageJsonLd } from "@/lib/seo/generateSchema";

const page: ContentPage = {
  slug: "about", path: "/zh-TW/about", kind: "company", title: "關於費馬測試", kicker: "公司",
  summary: "興趣不是能力。", template: "company", animationProfile: "none", locale: "zh-TW",
  publishedAt: "2026-11-08", updatedAt: "2026-11-08", effectiveAt: null, sourceDoc: "private-source-do-not-render",
  isPublic: true, isIndexable: false, headings: ["我們是誰", "我們的邊界"],
  contentMd: "## 我們是誰\n\n興趣不是能力。\n\n## 我們的邊界\n\n- 不替代專業判斷。", contentHtml: "",
  seoTitle: "關於費馬測試", metaDescription: "興趣不是能力。", faqItems: [], schemaEnabled: false, supportContact: null,
};

describe("Traditional CMS About complete rendering", () => {
  it.each([["zh-TW", "zh-TW"], ["zh", "zh-CN"], ["en", "en"]] as const)("preserves WebPage language identity for %s", (locale, expected) => {
    expect(buildWebPageJsonLd({ path: "/zh-TW/about", title: page.title, description: page.summary, locale }).inLanguage).toBe(expected);
  });
  it("renders CMS text plus all existing team profiles, localized labels and dates", () => {
    const html = renderToStaticMarkup(<ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale="zh-TW" />);
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector("h1")?.textContent).toBe("關於費馬測試");
    expect(document.querySelector('nav[aria-label="導覽路徑"]')).not.toBeNull();
    expect(document.body.textContent).toContain("興趣不是能力。");
    expect(document.body.textContent).toContain("創始人與博士顧問團隊");
    for (const name of ["劉福威", "賈睿璇", "李琛"]) expect(document.body.textContent).toContain(name);
    expect(document.querySelectorAll('[data-testid="about-team-section"] article')).toHaveLength(3);
    expect(document.querySelector('[data-testid="about-team-section"] img')?.getAttribute("alt")).toBe("劉福威，費馬測試創始人");
    expect(document.body.textContent).toContain("6000");
    expect(document.body.textContent).toContain("最近更新");
    expect(document.body.textContent).toContain("2026年11月8日");
    expect(document.querySelector('a[href="/zh-TW"]')).not.toBeNull();
    for (const slug of ["brand", "charter", "careers"]) {
      expect(document.querySelector(`a[href="/zh-TW/${slug}"]`)).not.toBeNull();
    }
    expect(document.querySelector('a[href="/zh-TW/foundation"]')).not.toBeNull();
    expect(document.querySelector('a[href="/zh-TW/privacy"]')).toBeNull();
    expect(document.querySelector("main")).toBeNull(); // The Traditional root layout owns the main landmark.
    expect(html).not.toContain("private-source-do-not-render");
  });

  it("renders science links with Traditional labels while unshipped targets keep their source-language routes", () => {
    const html = renderToStaticMarkup(<ContentPageTemplate page={{ ...stripContentPageReaderMetadata(page), slug: "science",
      contentMd: "# content_md\n\n## 說明\n\n相關頁面 /science、/method-boundaries、/item-design-notes、/reliability-validity。測評 /tests/mbti-personality-test-16-personality-types、/tests/big-five-personality-test、/tests/holland-career-interest-test-riasec。\n\nvisible_faq_items:\n\n明確英文入口 /en/tests/iq-test-intelligence-quotient-assessment、/en/tests/explore/chiikawa。",
    }} locale="zh-TW" />);
    const document = new DOMParser().parseFromString(html, "text/html");
    for (const [href, text] of [
      ["/zh-TW/science", "測評科學"], ["/zh-TW/method-boundaries", "方法邊界"], ["/zh-TW/item-design-notes", "題目設計說明"], ["/zh-TW/reliability-validity", "信度與效度"],
      ["/zh/tests/mbti-personality-test-16-personality-types", "MBTI免費測試"],
      ["/zh/tests/big-five-personality-test-ocean-model", "大五人格免費測試"], ["/zh/tests/holland-career-interest-test-riasec", "霍蘭德職業興趣免費測試"],
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)?.textContent).toBe(href.startsWith("/zh-TW/") ? text : `${text}（簡體中文）`);
      expect(document.querySelector(`a[href="${href}"]`)?.getAttribute("hreflang")).toBe(href.startsWith("/zh-TW/") ? null : "zh-CN");
    }
    expect(document.querySelector('a[href="/tests/big-five-personality-test"]')).toBeNull();
    expect(document.querySelector('a[href="/en/tests/iq-test-intelligence-quotient-assessment"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/tests/explore/chiikawa"]')).not.toBeNull();
    expect(document.querySelector('a[href="/zh-TW/tests/explore/chiikawa"]')).toBeNull();
    expect(document.querySelector('a[href="/zh-TW/method-boundaries"]')).not.toBeNull();
    expect(document.body.textContent).not.toContain("content_md");
    expect(document.body.textContent).not.toContain("visible_faq_items");
  });

  it("renders reviewed Terms links as actual anchors without changing explicit language, query or mail targets", () => {
    const html = renderToStaticMarkup(<ContentPageTemplate page={{ ...page, slug: "terms", contentMd: "[價格與報告內容](/zh/pricing)、[支援中心](/zh/support)、[support@fermatmind.com](mailto:support@fermatmind.com)、[軟體說明](/关于?地区=中国#说明)。" }} locale="zh-TW" />);
    const document = new DOMParser().parseFromString(html, "text/html");
    for (const [href, text] of [["/zh/pricing", "價格與報告內容"], ["/zh/support", "支援中心"], ["mailto:support@fermatmind.com", "support@fermatmind.com"], ["/关于?地区=中国#说明", "軟體說明"]]) {
      expect(document.querySelector(`a[href="${href}"]`)?.textContent).toBe(text);
    }
    expect(document.body.textContent).not.toContain("](");
  });

  it.each(["![圖片](/image.png)", "[說明](/broken", "[說明](//example.com)", "[說明](data:text/plain,hello)"])("rejects unsupported inline formats: %s", contentMd => {
    expect(() => renderToStaticMarkup(<ContentPageTemplate page={{ ...page, contentMd }} locale="zh-TW" />)).toThrow("inline format unavailable");
  });

  it("keeps unsupported rich formats closed rather than silently misrendering a future page", () => {
    expect(() => renderToStaticMarkup(<ContentPageTemplate page={{ ...page, contentHtml: "<p>正文</p>" }} locale="zh-TW" />)).toThrow("HTML adapter unavailable");
    expect(() => renderToStaticMarkup(<ContentPageTemplate page={{ ...page, contentMd: "[說明](javascript:alert)" }} locale="zh-TW" />)).toThrow("inline format unavailable");
  });
});
