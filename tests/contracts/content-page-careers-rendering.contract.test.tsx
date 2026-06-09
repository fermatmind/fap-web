import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import type { ContentPage } from "@/lib/cms/content-pages";

function makeCareersPage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    slug: "careers",
    path: "/careers",
    kind: "company",
    title: "工作机会",
    kicker: "Company",
    summary: "Join FermatMind.",
    template: "careers",
    animationProfile: "none",
    locale: "zh",
    publishedAt: "2026-06-09",
    updatedAt: "2026-06-09",
    effectiveAt: null,
    sourceDoc: "CMS",
    isPublic: true,
    isIndexable: true,
    headings: [],
    contentMd: [
      "## 当前开放方向",
      "### 1. 心理学数据工程师",
      "**英文名称**：Psychometrics Data Engineer **薪资范围**：15K-25K RMB / 月",
      "**必须发表过相关领域 Paper；可核验的正式研究成果可以作为补充材料。",
      "### 2. 产品与品牌设计师",
      "**英文名称**：Product and Brand Designer",
      "### 3. 全栈产品工程师",
      "**英文名称**：Full-stack Product Engineer",
    ].join("\n\n"),
    contentHtml: "",
    seoTitle: null,
    metaDescription: null,
    faqItems: [],
    schemaEnabled: false,
    supportContact: null,
    ...overrides,
  };
}

function makeFoundationPage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    slug: "foundation",
    path: "/foundation",
    kind: "company",
    title: "公共利益",
    kicker: "Company",
    summary: "Public benefit.",
    template: "foundation",
    animationProfile: "none",
    locale: "zh",
    publishedAt: "2026-06-09",
    updatedAt: "2026-06-09",
    effectiveAt: null,
    sourceDoc: "CMS",
    isPublic: true,
    isIndexable: true,
    headings: [],
    contentMd: [
      "## 相关链接",
      "- [费马测试宪章](/zh/charter)",
      "- [品牌](/zh/brand)",
      "- [测评方法与使用边界](/zh/method-boundaries)",
      "- [United Nations Foundation 网站](https://unfoundation.org/)",
      "- [United Nations Foundation 捐赠页面](https://x.com/FermatMind/status/2064356137080889431)",
    ].join("\n"),
    contentHtml: "",
    seoTitle: null,
    metaDescription: null,
    faqItems: [],
    schemaEnabled: false,
    supportContact: null,
    ...overrides,
  };
}

describe("Careers content page rendering", () => {
  it("uses CMS job headings as the related links on Careers pages", () => {
    const html = renderToStaticMarkup(
      <ContentPageTemplate page={stripContentPageReaderMetadata(makeCareersPage())} locale="zh" />
    );

    expect(html).toContain("相关页面");
    expect(html).toContain('href="#1-心理学数据工程师-2"');
    expect(html).toContain('href="#2-产品与品牌设计师-3"');
    expect(html).toContain('href="#3-全栈产品工程师-4"');
    expect(html).toContain(">心理学数据工程师</a>");
    expect(html).toContain(">产品与品牌设计师</a>");
    expect(html).toContain(">全栈产品工程师</a>");
    expect(html).not.toContain(">关于我们</a>");
    expect(html).not.toContain(">我们的宪章</a>");
    expect(html).not.toContain(">基金会</a>");
    expect(html).not.toContain(">品牌</a>");
  });

  it("removes visible markdown emphasis markers while preserving the CMS text", () => {
    const html = renderToStaticMarkup(
      <ContentPageTemplate page={stripContentPageReaderMetadata(makeCareersPage())} locale="zh" />
    );

    expect(html).toContain("英文名称：Psychometrics Data Engineer 薪资范围：15K-25K RMB / 月");
    expect(html).toContain("必须发表过相关领域 Paper；可核验的正式研究成果可以作为补充材料。");
    expect(html).not.toContain("**英文名称**");
    expect(html).not.toContain("**薪资范围**");
    expect(html).not.toContain("**必须发表");
    expect(html).not.toContain("**");
  });

  it("renders CMS markdown links as internal and external anchors", () => {
    const html = renderToStaticMarkup(
      <ContentPageTemplate page={stripContentPageReaderMetadata(makeFoundationPage())} locale="zh" />
    );

    expect(html).toContain('href="/zh/charter"');
    expect(html).toContain(">费马测试宪章</a>");
    expect(html).toContain('href="/zh/brand"');
    expect(html).toContain('href="/zh/method-boundaries"');
    expect(html).toContain('href="https://unfoundation.org/"');
    expect(html).toContain('href="https://x.com/FermatMind/status/2064356137080889431"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("[费马测试宪章](/zh/charter)");
    expect(html).not.toContain("[United Nations Foundation 网站](https://unfoundation.org/)");
  });
});
