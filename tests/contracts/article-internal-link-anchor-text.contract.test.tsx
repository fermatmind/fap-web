import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { sanitizeCmsHtml } from "@/lib/cms/sanitizeCmsRichText";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

describe("article internal link anchor text", () => {
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
