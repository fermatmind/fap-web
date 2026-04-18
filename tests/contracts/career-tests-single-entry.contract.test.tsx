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
    expect(source).toContain("适合还没有明确方向，想先得到一个起点的人");
    expect(source).toContain("career-tests-single-entry");
    expect(source).toContain("/career/tests/riasec");
    expect(source).not.toContain("/career/tests/riasec/result");
  });
});
