import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

describe("article decision notes in Markdown blockquotes", () => {
  it.each([
    ["zh", ["这个岗位吸引我的活动：", "我已经确认的条件与限制：", "关键证据或未知：", "下一步决定："]],
    ["en", ["Attractive activity:", "Necessary condition:", "Decisive evidence or unknown:", "Next decision:"]],
  ] as const)("preserves all four emphasized %s field labels and fill-in blanks", (locale, labels) => {
    const markdown = labels.map((label) => `> **${label}** ____. Keep this evidence.`).join("\n");
    const { container } = render(<div>{renderSimpleMarkdown(markdown, { locale })}</div>);
    const quote = container.querySelector("blockquote");
    expect(quote).not.toBeNull();
    expect(Array.from(quote!.querySelectorAll("strong"), (node) => node.textContent)).toEqual(labels);
    expect(quote!.querySelectorAll("p")).toHaveLength(4);
    expect(quote!.textContent).not.toContain("**");
    expect(quote!.textContent?.match(/____/g)).toHaveLength(4);
  });

  it("keeps semicolons and bullet characters inside a quoted sentence", () => {
    const sentence = "**Check the arrangement:** keep A; consider B；retain C • and D.";
    const { container } = render(<div>{renderSimpleMarkdown(`> ${sentence}`)}</div>);
    const quote = container.querySelector("blockquote")!;
    expect(quote.querySelectorAll("p")).toHaveLength(1);
    expect(quote.textContent).toBe("Check the arrangement: keep A; consider B；retain C • and D.");
    expect(quote.querySelector("strong")).toHaveTextContent("Check the arrangement:");
  });
});
