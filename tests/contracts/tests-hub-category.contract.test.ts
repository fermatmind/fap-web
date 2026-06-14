import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("tests hub and category contract", () => {
  it("keeps the tests hub question-led and Big5 form-aware", () => {
    const source = read("lib/marketing/testsHubContent.ts");

    expect(source).toContain("getCmsLandingSurfaceWithLastKnownGood");
    expect(source).toContain("filterVisiblePublicTestEntries");
    expect(source).toContain('return ["personality", "career"];');
    expect(source).not.toContain("buildBig5TakeHref");
  });

  it("keeps category routes restricted to the supported slugs", () => {
    const source = read("app/(localized)/[locale]/tests/category/[slug]/page.tsx");

    expect(source).toContain('value === "personality" || value === "career"');
    expect(source).toContain("listTestsCategorySlugs()");
    expect(source).toContain('idSuffix: "featured-itemlist"');
    expect(source).toContain('idSuffix: "all-tests-itemlist"');
  });

  it("renders category and card CTAs with free-test search intent without taking CMS body authority", () => {
    const categoryExperience = read("components/marketing/tests/TestCategoryExperience.tsx");
    const sharedCards = read("components/marketing/tests/TestsShared.tsx");
    const hubExperience = read("components/marketing/tests/TestsHubExperience.tsx");
    const contentAdapter = read("lib/marketing/testsHubContent.ts");

    expect(categoryExperience).toContain("免费人格测试");
    expect(categoryExperience).toContain("免费职业测试");
    expect(sharedCards).toContain("getFreeTestPrimaryLabel(item, locale)");
    expect(hubExperience).toContain('locale === "zh" ? "免费测试"');
    expect(contentAdapter).toContain("开始 MBTI 免费测试");
    expect(contentAdapter).toContain('return "大五人格"');
    expect(contentAdapter).toContain('return "霍兰德职业兴趣"');
    expect(contentAdapter).toContain("`开始${name}免费测试`");
    expect(contentAdapter).not.toContain("clinical-depression-anxiety-assessment-professional-edition");
  });

  it("renders the tests hub with collection and item-list schema", () => {
    const source = read("app/(localized)/[locale]/tests/page.tsx");

    expect(source).toContain("buildCollectionPageJsonLd");
    expect(source).toContain('idSuffix: "quickstart-itemlist"');
    expect(source).toContain('idSuffix: "family-itemlist"');
  });
});
