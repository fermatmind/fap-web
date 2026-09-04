import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career recommendations entry availability contract", () => {
  it("separates career discovery paths from the recommendation list", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("找到适合你的职业方向");
    expect(source).toContain("Find a career direction that fits you");
    expect(source).toContain("已有测评结果");
    expect(source).toContain("还没有明确方向");
    expect(source).toContain("已有目标职业");
    expect(source).toContain("按测评结果查看职业建议");
    expect(source).toContain("recommendationItems.length === 0");
    expect(source).toContain("career-recommendations-unavailable");
    expect(source).not.toContain("/personality/${typeCode.toLowerCase()}-a");
    expect(source).toContain("career-recommendations-source-entry");
    expect(source).toContain("career-recommendation-source-mbti");
    expect(source).not.toContain("MBTI_TYPE_GROUPS");
    expect(source).not.toContain("已开放推荐");
    expect(source).not.toContain("适合已经拿到对应人格结果");
    expect(source).not.toContain("选择你的 MBTI 类型");
    expect(source).not.toContain("推荐页先给方向和取舍");
    expect(source).not.toContain("职业推荐用于缩小方向");
    expect(source).not.toContain("选择 MBTI 类型");
    expect(source).not.toContain("先做大五人格");
    expect(source).not.toContain("选择测评");
  });

  it("renders the visible career breadcrumb trail on the recommendations index", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("Breadcrumb");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain("职业推荐");
    expect(source).toContain("Recommendations");
  });

  it("returns job detail navigation to the career center", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("回到职业中心");
    expect(source).toContain("Back to career center");
    expect(source).not.toContain("回到职业库");
    expect(source).not.toContain("Back to job library");
  });
});
