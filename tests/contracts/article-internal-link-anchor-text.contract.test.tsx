import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { sanitizeCmsHtml } from "@/lib/cms/sanitizeCmsRichText";
import { extractInternalPaths, splitInternalLinkText } from "@/lib/content/internalLinkText";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

describe("article internal link anchor text", () => {
  it("does not hydrate article labels through per-link detail requests", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/articles/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).not.toContain("buildArticleInternalLinkLabels");
    expect(source).not.toContain("slice(0, 24)");
    expect(source).not.toContain("extractInternalPaths");
    expect(source.match(/getCmsArticleWithLastKnownGood\(/g)).toHaveLength(2);
  });

  it("renders bare Markdown internal paths as descriptive links", () => {
    const html = renderToStaticMarkup(
      <>
        {renderSimpleMarkdown(
          [
            "## Related reading",
            "",
            "- /zh/articles/career-interest-vs-personality-test-differences",
            "- [/zh/articles/mbti-basics](/zh/articles/mbti-basics)",
            "- /zh/tests/mbti-personality-test-16-personality-types",
            "- /zh/tests/big-five-personality-test-ocean-model",
            "- /tests/holland-career-interest-test-riasec",
            "- /zh/tests/iq-test-intelligence-quotient-assessment",
            "- /zh/tests/eq-test-emotional-intelligence-assessment",
            "- /zh/method-boundaries",
            "",
            "如果你想把阅读转成一次结构化自我观察，可以进入 /zh/tests/enneagram-personality-test-nine-types。也可以阅读 /zh/reliability-validity。",
          ].join("\n"),
          {
            internalLinkLabels: {
              "/zh/articles/career-interest-vs-personality-test-differences": "职业兴趣测试和性格测试有什么区别？",
              "/zh/articles/mbti-basics": "MBTI 性格测试是什么？16 型人格能告诉你什么，不能告诉你什么",
            },
            locale: "zh",
            minimumHeadingLevel: 2,
          }
        )}
      </>
    );

    expect(html).toContain('<a href="/zh/articles/career-interest-vs-personality-test-differences"');
    expect(html).toContain("职业兴趣测试和性格测试有什么区别");
    expect(html).toContain("fm-cjk-punctuation");
    expect(html).toContain('<a href="/zh/articles/mbti-basics"');
    expect(html).toContain("MBTI 性格测试是什么");
    expect(html).toContain('<a href="/zh/tests/mbti-personality-test-16-personality-types"');
    expect(html).toContain("MBTI免费测试");
    expect(html).toContain('<a href="/zh/tests/big-five-personality-test-ocean-model"');
    expect(html).toContain("大五人格免费测试");
    expect(html).toContain('<a href="/tests/holland-career-interest-test-riasec"');
    expect(html).toContain("霍兰德职业兴趣免费测试");
    expect(html).toContain('<a href="/zh/tests/iq-test-intelligence-quotient-assessment"');
    expect(html).toContain("智商免费测试");
    expect(html).toContain('<a href="/zh/tests/eq-test-emotional-intelligence-assessment"');
    expect(html).toContain("情商免费测试");
    expect(html).toContain('<a href="/zh/method-boundaries"');
    expect(html).toContain("方法边界");
    expect(html).toContain('<a href="/zh/tests/enneagram-personality-test-nine-types"');
    expect(html).toContain("九型人格免费测试");
    expect(html).toContain('<a href="/zh/reliability-validity"');
    expect(html).toContain("信度与效度");
    expect(html).not.toContain(">/zh/articles/career-interest-vs-personality-test-differences<");
    expect(html).not.toContain(">/zh/tests/mbti-personality-test-16-personality-types<");
    expect(html).not.toContain(">/zh/method-boundaries<");
  });

  it("preserves external URL paths and slash-separated prose as text", () => {
    const text = "https://www.themyersbriggs.com/en-us/support/mbti-facts Finance/business //example.com/support/help https://pmc.ncbi.nlm.nih.gov/articles/PMC10844202/ 10.1126/science.1234567";
    expect(extractInternalPaths(text)).toEqual([]);
    expect(splitInternalLinkText(text, {}, "en")).toEqual([{ type: "text", text }]);
    const html = renderToStaticMarkup(<>{renderSimpleMarkdown(text, { locale: "en" })}</>);
    expect(html).not.toContain("<a ");
    const reader = document.createElement("div");
    reader.innerHTML = html;
    expect(reader.textContent).toBe(text);
    expect(html).toContain("Finance/business");
    expect(sanitizeCmsHtml(`<p>${text}</p>`, { locale: "en" })).not.toContain("<a ");
  });

  it("still links standalone root paths after punctuation and preserves explicit external links", () => {
    expect(extractInternalPaths("阅读：/zh/articles/mbti-basics； (/en/tests/holland-career-interest-test-riasec)"))
      .toEqual(["/zh/articles/mbti-basics", "/en/tests/holland-career-interest-test-riasec"]);
    const html = renderToStaticMarkup(<>{renderSimpleMarkdown(
      "[MBTI facts](https://www.themyersbriggs.com/en-us/support/mbti-facts)", { locale: "en" }
    )}</>);
    expect(html).toContain('<a href="https://www.themyersbriggs.com/en-us/support/mbti-facts"');
    expect(html).not.toContain('<a href="/support/mbti-facts"');
  });

  it("preserves citations beside bilingual paths and attributed test links", () => {
    const target = "/en/tests/holland-career-interest-test-riasec?content_id=199&entrypoint=seo_cta";
    const text = [
      "Finance/business https://doi.org/10.1177/1745691616635612",
      "阅读：/zh/articles/mbti-basics。",
      "Read /en/articles/iq-test-growth-guide.",
      `[Holland test](${target})`,
      "[Research](https://pubmed.ncbi.nlm.nih.gov/33332604/)",
    ].join("\n\n");
    const html = renderToStaticMarkup(<>{renderSimpleMarkdown(text, { locale: "en" })}</>);
    const reader = document.createElement("div");
    reader.innerHTML = html;
    const anchors = Array.from(reader.querySelectorAll("a"));

    expect(anchors.map((anchor) => anchor.getAttribute("href"))).toEqual([
      "/zh/articles/mbti-basics",
      "/en/articles/iq-test-growth-guide",
      target,
      "https://pubmed.ncbi.nlm.nih.gov/33332604/",
    ]);
    expect(reader.textContent).toContain("Finance/business https://doi.org/10.1177/1745691616635612");
    expect(reader.querySelector("a a")).toBeNull();
  });

  it("renders bare CMS HTML internal paths as descriptive links without nesting existing anchors", () => {
    const html = sanitizeCmsHtml(
      [
        "<p>如果你想把阅读转成一次结构化自我观察，可以进入 /zh/tests/enneagram-personality-test-nine-types。</p>",
        '<p><a href="/zh/articles/mbti-basics">/zh/articles/mbti-basics</a></p>',
      ].join(""),
      {
        internalLinkLabels: {
          "/zh/articles/mbti-basics": "MBTI 入门指南",
        },
        locale: "zh",
      }
    );

    expect(html).toContain('<a href="/zh/tests/enneagram-personality-test-nine-types">九型人格免费测试</a>');
    expect(html).toContain('<a href="/zh/articles/mbti-basics">MBTI 入门指南</a>');
    expect(html).not.toContain("<a href=\"/zh/articles/mbti-basics\"><a");
  });
});
