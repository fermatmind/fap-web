import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career recommendations entry availability contract", () => {
  it("restores decision-first copy and keeps missing backend types non-interactive", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("从测评结果选择职业方向");
    expect(source).toContain("Choose a career direction from your result");
    expect(source).toContain("推荐页先给方向和取舍，再把候选职业作为下一步。");
    expect(source).toContain("Recommendation pages lead with direction and tradeoffs; candidate roles come after the decision.");
    expect(source).toContain("recommendationItems.length === 0");
    expect(source).toContain("career-recommendations-unavailable");
    expect(source).toContain('aria-disabled="true"');
    expect(source).toContain("career-recommendation-type-unavailable");
    expect(source).not.toContain("/personality/${typeCode.toLowerCase()}-a");
    expect(source).toContain("recommendationItems.length > 0");
    expect(source).toContain("career-recommendations-source-entry");
    expect(source).toContain("career-recommendation-source-mbti");
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
