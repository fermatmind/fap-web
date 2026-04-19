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

    expect(source).toContain("全部职业库");
    expect(source).toContain("行业入口");
    expect(source).toContain("基于测评");
    expect(source).toContain("career-pathway-jobs");
    expect(source).toContain("career-pathway-recommendation");
    expect(source).toContain("career-pathway-tests");
    expect(source).toContain("career-quiet-library");
    expect(source).toContain("/career/jobs");
    expect(source).toContain("/career/industries");
    expect(source).not.toContain("career-landing-jobs-preview");
    expect(source).not.toContain("career-landing-recommendation-preview");
  });

  it("renders a breadcrumb trail on the career industries entry page", () => {
    const source = read("app/(localized)/[locale]/career/industries/page.tsx");

    expect(source).toContain("Breadcrumb");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain("行业入口");
    expect(source).toContain("Industries");
  });
});
