import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career tests single entry contract", () => {
  it("keeps /career/tests focused on the stable RIASEC path", () => {
    const source = read("app/(localized)/[locale]/career/tests/page.tsx");

    expect(source).toContain("先做职业兴趣测试");
    expect(source).not.toContain("适合还没有明确方向，想先得到一个起点的人");
    expect(source).not.toContain("For people who do not have a clear direction yet");
    expect(source).toContain("career-tests-single-entry");
    expect(source).toContain("/tests/holland-career-interest-test-riasec");
    expect(source).not.toContain("Career interest test</p>");
    expect(source).not.toContain("CAREER INTEREST TEST");
    expect(source).not.toContain("当前稳定入口");
    expect(source).not.toContain("Current stable entry");
    expect(source).not.toContain("/career/tests/riasec/result");
  });

  it("keeps the visible breadcrumb trail on the career tests index", () => {
    const source = read("app/(localized)/[locale]/career/tests/page.tsx");

    expect(source).toContain("Breadcrumb");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain("职业测试");
    expect(source).toContain("Career tests");
  });

  it("removes the topics index entry from the article header menu", () => {
    const source = read("lib/navigation/headerDropdownMenus.ts");

    expect(source).not.toContain('{ href: "/topics", label: "主题聚合" }');
    expect(source).not.toContain('{ href: "/topics", label: "Topic clusters" }');
  });
});
