import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career resolve helper demotion contract", () => {
  it("presents resolve as an alias helper rather than a primary career entry", () => {
    const source = read("app/(localized)/[locale]/career/resolve/page.tsx");

    expect(source).toContain("辅助工具");
    expect(source).toContain("确认职业叫法");
    expect(source).toContain("已经知道岗位名时，请直接去职业库搜索");
    expect(source).toContain("Back to the main path");
    expect(source).toContain("noindex: true");
    expect(source).not.toContain("Career Resolve");
  });
});
