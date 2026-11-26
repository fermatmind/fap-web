// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArticleAcademicFooter } from "@/components/articles/ArticleAcademicFooter";
import { getArticleEditorialFeatures, getSimpleMarkdownHeadings, renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const en = { locale: "en", editorial: { locale: "en", slug: "example" } } as const;
const block = (name: string, source: string) => `:::${name}\n${source}\n:::`;
const body = [
  block('takeaways title="Summary"', "- **What matters** [read](/en/tests)"),
  block("timeline", "tag: May title: First phase body: **Apply** then [continue](/en/tests)"),
  block("verdict-grid", "tone: yellow title: Conditional body: When the date is clear"),
  block('script-compare title="A conversation"', "bad_label: Avoid\nbad: Soon\ngood_label: Suggest\ngood: **How about June?**"),
  block("checklist", "- Check the **contract**\n- Confirm terms"),
  block("callout", "[Start here](/en/tests)"),
  block("references", "- [Primary source](https://example.com/source)\n- [Unsafe destination](javascript:alert%281%29)"),
  block("methodology", "- A worked example"),
].join("\n\n");

describe("article editorial blocks", () => {
  afterEach(() => vi.restoreAllMocks());

  it("retains every section in SSR and preserves existing inline URL safety", () => {
    expect(getArticleEditorialFeatures(body)).toEqual({ enabled: true, sources: true });
    const html = renderToStaticMarkup(renderSimpleMarkdown(body, en));
    for (const name of ["takeaways", "timeline", "verdict-grid", "script-compare", "checklist", "callout", "references", "methodology"]) {
      expect(html).toContain(`data-article-block="${name}"`);
    }
    const dom = new DOMParser().parseFromString(html, "text/html");
    expect(Array.from(dom.querySelectorAll("strong")).some((node) => node.textContent === "Apply")).toBe(true);
    expect(html).toContain('href="/en/tests"');
    expect(html).toContain('href="https://example.com/source" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain("A worked example");
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain(":::");

    const readerBody = renderToStaticMarkup(renderSimpleMarkdown(body, { ...en, editorial: { ...en.editorial, part: "body" } }));
    const sources = renderToStaticMarkup(renderSimpleMarkdown(body, { ...en, editorial: { ...en.editorial, part: "academic" } }));
    expect(readerBody).not.toContain("Primary source");
    expect(sources).toContain("Primary source");
    expect(sources).not.toContain("First phase");
  });

  it("falls back without losing text and keeps fenced code literal", () => {
    const malformed = ":::verdict-grid\ntone: unknown title: Retain me body: Test\n:::\n\n:::takeaways\nUnclosed text";
    expect(getArticleEditorialFeatures(malformed).enabled).toBe(false);
    const html = renderToStaticMarkup(renderSimpleMarkdown(malformed, en));
    expect(html).toContain("Retain me");
    expect(html).toContain("Unclosed text");
    const code = "```text\n:::callout\nExample\n:::\n```";
    expect(getArticleEditorialFeatures(code).enabled).toBe(false);
    expect(renderToStaticMarkup(renderSimpleMarkdown(code, en))).toContain(":::callout");
  });

  it("highlights only adjacent single-strong H2 conclusions with 35–80 visible characters", () => {
    for (const [size, highlighted] of [[34, false], [35, true], [80, true], [81, false]] as const) {
      const md = `## Section\n\n**${"文".repeat(size)}**`;
      expect(renderToStaticMarkup(renderSimpleMarkdown(md, en)).includes("fm-h2-takeaway")).toBe(highlighted);
    }
    const md = `### Section\n\n**${"文".repeat(45)}**`;
    expect(renderToStaticMarkup(renderSimpleMarkdown(md, en))).not.toContain("fm-h2-takeaway");
  });

  it("does not change heading anchors between the outline and split article body", () => {
    const md = `## First\n\n${body}\n\n## Final`;
    const options = { ...en, headingIdPrefix: "article-body" };
    const html = renderToStaticMarkup(renderSimpleMarkdown(md, { ...options, editorial: { ...en.editorial, part: "body" } }));
    for (const { id } of getSimpleMarkdownHeadings(md, options)) expect(html).toContain(`id="${id}"`);
  });

  it("copies a rendered script and a blank plaintext checklist even after checking items", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", Object.create(navigator, { clipboard: { value: { writeText } } }));
    try {
      const ui = render(<>{renderSimpleMarkdown(body, en)}</>);
      fireEvent.click(screen.getByRole("button", { name: "Copy script" }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith("How about June?"));
      expect(await screen.findByText("Copied")).toBeTruthy();
      fireEvent.click(screen.getByRole("checkbox", { name: "Check the contract" }));
      expect(screen.getByText("1 of 2 complete")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Copy plain-text checklist" }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith("- [ ] Check the contract\n- [ ] Confirm terms"));
      ui.unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("includes both citation formats in SSR and allows switching the copied format", async () => {
    const props = { title: "Example", authorName: "FermatMind Editorial", publishedAt: "2026-11-25", canonicalUrl: "https://fermatmind.com/en/example", slug: "example" };
    const labels = { en: "Cite this article", zh: "引用本文", "zh-TW": "引用本文" } as const;
    for (const locale of ["en", "zh", "zh-TW"] as const) {
      const html = renderToStaticMarkup(<ArticleAcademicFooter {...props} locale={locale} />);
      expect(html).toContain(labels[locale]);
      expect(html).toContain("[EB/OL]");
      expect(html).toContain("(2026)");
    }
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", Object.create(navigator, { clipboard: { value: { writeText } } }));
    try {
      const ui = render(<ArticleAcademicFooter {...props} locale="en" />);
      fireEvent.click(screen.getByRole("button", { name: "Copy citation" }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith("FermatMind Editorial. (2026). Example. FermatMind. https://fermatmind.com/en/example"));
      fireEvent.click(screen.getByRole("radio", { name: "GB/T 7714-2015" }));
      fireEvent.click(screen.getByRole("button", { name: "Copy citation" }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith("FermatMind Editorial. Example[EB/OL]. (2026-11-25). https://fermatmind.com/en/example."));
      ui.unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
