import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function sliceBetween(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return source.slice(startIndex, endIndex);
}

describe("career guides cleanup contract", () => {
  it("frontend next-sitemap keeps guide landing and detail authority available", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));
    const source = read("next-sitemap.config.js");

    expect(locs).toEqual(expect.arrayContaining(["/en/career/guides", "/zh/career/guides"]));
    expect(locs.some((loc: string) => /^\/(en|zh)\/career\/guides\/[^/]+$/.test(loc))).toBe(true);
    expect(source).toContain('.velite/careerGuides.json');
    expect(source).toContain("for (const item of careerGuidesContent)");
    expect(source).toContain("buildCareerGuideDetailPaths");
  });

  it("llms.txt guide coverage is cms-driven and no longer uses local guide helpers", () => {
    const source = read("app/llms.txt/route.ts");
    const guideBlock = sliceBetween(source, 'const guideEntries = dedupePaths([', "const careerEntries = dedupePaths([");

    expect(source).toContain("listCareerGuidesFromCms");
    expect(source).not.toContain("listCareerGuideSlugs");
    expect(source).not.toContain("listCareerGuides(");
    expect(guideBlock).toContain(".filter((item) => item.isIndexable)");
    expect(guideBlock).toContain("/en/career/guides");
    expect(guideBlock).toContain("/zh/career/guides");
  });

  it("llms-full.txt guide coverage is cms-driven and no longer uses local guide helpers", () => {
    const source = read("app/llms-full.txt/route.ts");
    const guideBlock = sliceBetween(source, "const guideEntries = [", "const careers = [");

    expect(source).toContain("listCareerGuidesFromCms");
    expect(source).not.toContain("listCareerGuideSlugs");
    expect(source).not.toContain("listCareerGuides(");
    expect(guideBlock).toContain(".filter((item) => item.isIndexable)");
    expect(guideBlock).toContain("/en/career/guides");
    expect(guideBlock).toContain("/zh/career/guides");
  });
});
