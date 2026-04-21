import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career V1 entry redesign contract", () => {
  it("keeps /career focused on three user-facing doors and quiet support links", () => {
    const source = read("app/(localized)/[locale]/career/page.tsx");

    expect(source).toContain("getCareerCenterContent");
    expect(source).toContain("career-pathway-jobs");
    expect(source).toContain("career-pathway-recommendation");
    expect(source).toContain("career-pathway-tests");
    expect(source).toContain("career-quiet-library");
    expect(source).toContain("mt-auto space-y-3 pt-9");
    expect(source).toContain("AnalyticsPageViewTracker");
    expect(source).toContain("JsonLd");
    expect(source).not.toContain("先选一条最适合你当前状态的路径");
    expect(source).not.toContain("Choose the path that best fits where you are now");
    expect(source).not.toContain("不确定叫法？试试别名解析");
    expect(source).not.toContain("Not sure what it is called? Try alias resolve");
    expect(source).toContain("content.support.links.map");
    expect(source).not.toContain(">Career</p>");
    expect(source).not.toContain("career-landing-jobs-preview");
    expect(source).not.toContain("career-family-exploration");
    expect(source).not.toContain("career-landing-trust-boundary");
    expect(source).not.toContain("fetchCareerLaunchGovernanceClosure");
    expect(source).not.toContain("full-342 closure authority");
    expect(source).not.toContain("backend authority");
    expect(source).not.toContain("strong-index");
  });
});
