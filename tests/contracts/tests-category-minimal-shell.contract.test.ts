import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("tests category minimal shell contract", () => {
  it("keeps category pages on minimal shell fallback instead of local editorial copy", () => {
    const source = read("app/(localized)/[locale]/tests/category/[slug]/page.tsx");

    expect(source).toContain("TestsHubMinimalShell");
    expect(source).toContain("getTestsCategoryContent");
    expect(source).toContain(".catch(() => null)");
    expect(source).toContain("noindex: true");
    expect(source).toContain("return <TestsHubMinimalShell locale={locale} />");
    expect(source).toContain("<TestCategoryExperience locale={locale} content={content} />");
  });
});
