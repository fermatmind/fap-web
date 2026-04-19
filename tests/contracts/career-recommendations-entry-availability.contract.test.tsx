import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career recommendations entry availability contract", () => {
  it("renders only available recommendation sources without auxiliary intro copy", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("从测评结果选择职业方向");
    expect(source).not.toContain("先从当前可用的推荐入口进入");
    expect(source).not.toContain("Start from the recommendation source currently available to you.");
    expect(source).not.toContain("选择你已经拥有的测评结果，先看方向判断和取舍");
    expect(source).not.toContain("Choose the result you already have, then review direction and tradeoffs first.");
    expect(source).toContain("recommendationItems.length > 0");
    expect(source).toContain("big5Traits.length > 0");
    expect(source).toContain("career-recommendations-source-entry");
    expect(source).toContain("career-recommendation-source-big5");
    expect(source).not.toContain("页面不会退化成岗位列表");
  });

  it("renders the visible career breadcrumb trail on the recommendations index", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("Breadcrumb");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain("职业推荐");
    expect(source).toContain("Recommendations");
  });
});
