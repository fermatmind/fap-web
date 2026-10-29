import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssessmentReadingPaths } from "@/components/tests/AssessmentReadingPaths";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

describe("Chinese assessment result-reading navigation", () => {
  it("lets a nine-type visitor reach explanations and types without starting an attempt", () => {
    render(<AssessmentReadingPaths slug={SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM} locale="zh" />);
    const section = screen.getByRole("region", { name: "九型人格测试结果怎么看？" });
    const links = within(section).getAllByRole("link");
    expect(links.map(link => link.getAttribute("href"))).toEqual([
      "/zh/articles/enneagram-personality-test-explained", "/zh/personality/enneagram",
    ]);
    expect(section.textContent).toContain("分数接近时保留多个候选");
    expect(links.every(link => !link.getAttribute("href")!.includes("/take"))).toBe(true);
  });

  it("takes an existing Holland result to examples and guidance, without requiring a retest", () => {
    render(<AssessmentReadingPaths slug={SCALE_CANONICAL_SLUG_MAP.RIASEC} locale="zh" />);
    const section = screen.getByRole("region", { name: "霍兰德测试结果与三字代码怎么看？" });
    expect(within(section).getByRole("link", { name: "查看三种合成结果示例与探索工作表" }).getAttribute("href"))
      .toBe("/zh/holland-test/pdf-download#result-examples");
    expect(section.textContent).toContain("兴趣不是能力或职业匹配结论");
    expect(within(section).getAllByRole("link")).toHaveLength(2);
  });

  it.each([
    [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, "en"],
    [SCALE_CANONICAL_SLUG_MAP.RIASEC, "en"],
    [SCALE_CANONICAL_SLUG_MAP.MBTI, "zh"],
    ["unknown", "zh"],
  ] as const)("does not add a Chinese reading surface to %s %s", (slug, locale) => {
    const { container } = render(<AssessmentReadingPaths slug={slug} locale={locale} />);
    expect(container.innerHTML).toBe("");
  });
});
