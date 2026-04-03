import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("tests hub and category contract", () => {
  it("keeps the tests hub question-led and Big5 form-aware", () => {
    const source = read("lib/marketing/testsHubContent.ts");

    expect(source).toContain('href: localizedPath("/tests/category/career", locale)');
    expect(source).toContain('href: localizedPath("/tests/category/personality", locale)');
    expect(source).toContain("buildBig5TakeHref");
    expect(source).toContain("primaryActions: big5Actions");
  });

  it("keeps category routes restricted to the supported slugs", () => {
    const source = read("app/(localized)/[locale]/tests/category/[slug]/page.tsx");

    expect(source).toContain('value === "personality" || value === "career"');
    expect(source).toContain("listTestsCategorySlugs()");
    expect(source).toContain('idSuffix: "featured-itemlist"');
    expect(source).toContain('idSuffix: "all-tests-itemlist"');
  });

  it("renders the tests hub with collection and item-list schema", () => {
    const source = read("app/(localized)/[locale]/tests/page.tsx");

    expect(source).toContain("buildCollectionPageJsonLd");
    expect(source).toContain('idSuffix: "quickstart-itemlist"');
    expect(source).toContain('idSuffix: "family-itemlist"');
  });
});
