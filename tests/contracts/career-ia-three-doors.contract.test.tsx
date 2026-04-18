import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career IA three doors contract", () => {
  it("keeps /career to three primary doors before quiet support links", () => {
    const source = read("app/(localized)/[locale]/career/page.tsx");

    expect(source).toContain("我知道职业名");
    expect(source).toContain("我已经测过性格了");
    expect(source).toContain("我还不知道方向");
    expect(source).toContain("career-pathway-jobs");
    expect(source).toContain("career-pathway-recommendation");
    expect(source).toContain("career-pathway-tests");
    expect(source).toContain("career-quiet-library");
    expect(source).not.toContain("career-pathway-family");
    expect(source).not.toContain("career-landing-jobs-preview");
    expect(source).not.toContain("career-landing-recommendation-preview");
  });
});
