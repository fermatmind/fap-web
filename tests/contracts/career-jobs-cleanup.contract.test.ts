import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career routing cleanup contract", () => {
  it("frontend sitemap config includes mbti recommendation routes and excludes stale private result paths", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs).toEqual(
      expect.arrayContaining([
        "/en/career/recommendations/mbti/INTJ",
        "/zh/career/recommendations/mbti/INTJ",
      ])
    );
    expect(locs).not.toEqual(
      expect.arrayContaining([
        "/en/career/tests/riasec/result",
        "/zh/career/tests/riasec/result",
      ])
    );
  });

  it("career recommendation detail page exposes answer-first, item list, faq schema, and public backlinks", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain("buildItemListJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("buildAnswerFirst");
    expect(source).toContain('id="recommended-roles"');
    expect(source).toContain('id="faq"');
    expect(source).toContain('withLocale("/topics/mbti")');
    expect(source).toContain('withLocale("/help/faq")');
  });

  it("machine-readable routes keep public career recommendations and skip private flows", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(llms).toContain("/career/recommendations/mbti/");
    expect(llmsFull).toContain("/career/recommendations/mbti/");
    expect(llms).not.toContain("/career/tests/riasec/result");
    expect(llmsFull).not.toContain("/career/tests/riasec/result");
    expect(llms).not.toContain("/compare/");
    expect(llmsFull).not.toContain("/share/");
  });
});
