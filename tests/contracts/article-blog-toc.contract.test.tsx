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

  it("matches body text for literal HTML, entities, inline code, and safe or rejected links", () => {
    const markdown = '## <script>alert(1)</script> &lt;b&gt; `a_b` **bold** [label](/en/topics) [bad](javascript:evil)';
    const options = { headingIdPrefix: "article-body", minimumHeadingLevel: 2 as const };
    const [heading] = getSimpleMarkdownHeadings(markdown, options);
    const body = new DOMParser().parseFromString(renderToStaticMarkup(<>{renderSimpleMarkdown(markdown, options)}</>), "text/html");
    expect(heading.text).toBe(body.querySelector("h2")?.textContent);
    expect(heading.text).toBe('<script>alert(1)</script> &lt;b&gt; a_b bold label bad');
    const toc = new DOMParser().parseFromString(renderToStaticMarkup(<a href={`#${heading.id}`}>{heading.text}</a>), "text/html");
    expect(toc.querySelector("script")).toBeNull();
    expect(toc.querySelector("a")?.textContent).toBe(heading.text);
    expect(body.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it("uses the body locale and label map for internal-link heading text", () => {
    const markdown = '## [/topics](/topics) and /help';
    const options = { locale: "en" as const, headingIdPrefix: "article-body", internalLinkLabels: { "/help": "Support" } };
    const [heading] = getSimpleMarkdownHeadings(markdown, options);
    const body = new DOMParser().parseFromString(renderToStaticMarkup(<>{renderSimpleMarkdown(markdown, options)}</>), "text/html");
    expect(heading.text).toBe("Topics and Support");
    expect(heading.text).toBe(body.querySelector("h2")?.textContent);
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
