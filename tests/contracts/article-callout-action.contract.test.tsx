import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveCalloutAction } from "@/components/articles/blocks/ArticleReadingBlocks";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

function renderCallout(body: string, slug = "any-article-slug") {
  const markdown = [":::callout title=\"先看清基线\"", ...body.split("\n"), ":::"].join("\n");
  return renderToStaticMarkup(
    renderSimpleMarkdown(markdown, { locale: "zh", editorial: { locale: "zh", slug, part: "body" } }),
  );
}

describe("article callout action is generic across articles", () => {
  it("renders a site-internal standalone link as the dark callout action", () => {
    const html = renderCallout([
      "先弄清自己的通常表现，再谈岗位匹配。",
      "",
      "[开始 90 题大五人格测试 →](https://fermatmind.com/zh/tests/big-five-personality-test-ocean-model)",
    ].join("\n"));

    expect(html).toContain('class="fm-article-callout-action"');
    expect(html).toContain("/zh/tests/big-five-personality-test-ocean-model");
    expect(html).toContain("开始 90 题大五人格测试 →");
    expect(html).not.toContain("开始 90 题费马职业测试");
  });

  it("keeps the previously hard-coded career-test callout byte-identical in intent", () => {
    const html = renderCallout(
      [
        "先把下一份工作不能妥协的条件列下来。",
        "",
        "[开始 94 题费马职业测试 →](https://fermatmind.com/zh/tests/career-planning-and-work-style-test)",
      ].join("\n"),
      "year-end-bonus-vs-job-hopping",
    );

    expect(html).toContain('class="fm-article-callout-action"');
    expect(html).toContain("开始 94 题费马职业测试 →");
    expect(html).not.toContain("→ →");
  });

  it("accepts a relative internal path as the action target", () => {
    const html = renderCallout([
      "先缩小值得尝试的工作活动。",
      "[开始 60 题霍兰德职业兴趣测试](/zh/tests/holland-career-interest-test-riasec)",
    ].join("\n"));

    expect(html).toContain('class="fm-article-callout-action"');
    expect(html).toContain("/zh/tests/holland-career-interest-test-riasec");
  });

  it("leaves external links as prose instead of promoting them to the action", () => {
    const html = renderCallout([
      "先读原始研究。",
      "[Sackett 2022](https://doi.org/10.1037/apl0000994)",
    ].join("\n"));

    expect(html).not.toContain('class="fm-article-callout-action"');
    expect(html).toContain('href="https://doi.org/10.1037/apl0000994"');
  });

  it("does not promote a link that sits inside a sentence", () => {
    const html = renderCallout("需要先看清基线时，可以读[大五人格说明](/zh/articles/big-five-tool-guide)。");

    expect(html).not.toContain('class="fm-article-callout-action"');
    expect(html).toContain('href="/zh/articles/big-five-tool-guide"');
  });

  it("rejects unsafe schemes when resolving the action line", () => {
    expect(resolveCalloutAction(["[点我](javascript:alert(1))"])).toBeNull();
    expect(resolveCalloutAction(["[写信](mailto:hi@fermatmind.com)"])).toBeNull();
    expect(resolveCalloutAction(["[开始测试](/zh/tests/big-five-personality-test-ocean-model)"])).toEqual(
      { label: "开始测试", href: "/zh/tests/big-five-personality-test-ocean-model", index: 0 },
    );
  });

  it("keeps callouts without a standalone link free of the action container", () => {
    const html = renderCallout("这里只解释判断顺序，不放入口。");

    expect(html).not.toContain('class="fm-article-callout-action"');
    expect(html).toContain("这里只解释判断顺序，不放入口。");
  });
});
