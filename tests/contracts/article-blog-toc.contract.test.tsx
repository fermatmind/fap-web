import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getSimpleMarkdownHeadings, renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

describe("Article TOC uses the same safe markdown tokenizer as the body", () => {
  it("anchors repeated and Chinese headings uniquely and omits fenced code headings", () => {
    const markdown = "# 引言\n\n## **同名**\n\n```md\n## hidden\n```\n\n## 同名\n\n### [下一步](/zh/topics)";
    const options = { minimumHeadingLevel: 2 as const, headingIdPrefix: "article-body" };
    const headings = getSimpleMarkdownHeadings(markdown, options);
    expect(headings.map((item) => item.text)).toEqual(["引言", "同名", "同名", "下一步"]);
    expect(new Set(headings.map((item) => item.id)).size).toBe(4);
    const html = renderToStaticMarkup(<>{renderSimpleMarkdown(markdown, options)}</>);
    for (const heading of headings) expect(html).toContain(`id="${heading.id}"`);
    expect(html).not.toContain("<h1");
    expect(headings[3].level).toBe(3);
  });

  it("does not add anchors to other CMS consumers unless explicitly requested", () => {
    expect(renderToStaticMarkup(<>{renderSimpleMarkdown("## Existing heading")}</>)).not.toContain('id="');
    expect(getSimpleMarkdownHeadings("## Existing heading")).toEqual([]);
  });

  it("preserves sanitized next-step links and horizontal table rendering", () => {
    const html = renderToStaticMarkup(<>{renderSimpleMarkdown("## Methods\n\n| A | B |\n| --- | --- |\n| one | two |\n\n[Next](/en/topics) [unsafe](javascript:alert(1))", { headingIdPrefix: "article-body", minimumHeadingLevel: 2 })}</>);
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain('href="/en/topics"');
    expect(html).not.toContain('href="javascript:');
  });
});
