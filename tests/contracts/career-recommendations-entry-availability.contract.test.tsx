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

    expect(source).toContain("找到更适合你的职业");
    expect(source).toContain("Find careers that fit you better");
    expect(source).toContain("建立你的职业画像");
    expect(source).toContain("从真实结果继续");
    expect(source).toContain("职业兴趣");
    expect(source).toContain("人格倾向");
    expect(source).toContain("现实条件");
    expect(source).toContain("可解释，而不是黑盒");
    expect(source).toContain("已有结果？查看类型建议");
    expect(source).toContain("career-recommendations-hero");
    expect(source).toContain("featuredRecommendations.length > 0");
    expect(source).toContain("recommendationItems.length > 0");
    expect(source).toContain("career-recommendations-unavailable");
    expect(source).not.toContain("/personality/${typeCode.toLowerCase()}-a");
    expect(source).not.toContain("MBTI_TYPE_GROUPS");
    expect(source).not.toContain("已开放推荐");
    expect(source).not.toContain("适合已经拿到对应人格结果");
    expect(source).not.toContain("选择你的 MBTI 类型");
    expect(source).not.toContain("推荐页先给方向和取舍");
    expect(source).not.toContain("职业推荐用于缩小方向");
    expect(source).not.toContain("选择 MBTI 类型");
    expect(source).not.toContain("先做大五人格");
    expect(source).not.toContain("选择测评");
    expect(source).not.toContain("热点职业");
  });

  it("renders the visible career breadcrumb trail on the recommendations index", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("Breadcrumb");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain("职业匹配");
    expect(source).toContain("Career fit");
  });

  it("returns job detail navigation to the career center", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("回到职业中心");
    expect(source).toContain("Back to career center");
    expect(source).not.toContain("回到职业库");
    expect(source).not.toContain("Back to job library");
  });
});
