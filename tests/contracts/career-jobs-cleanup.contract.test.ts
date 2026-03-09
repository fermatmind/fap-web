import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career jobs cleanup contract", () => {
  it("frontend sitemap config no longer generates career job urls from local content", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const generatedCareerJobLocs = additionalPaths
      .map((entry: { loc?: string }) => String(entry?.loc ?? ""))
      .filter((loc: string) => loc === "/en/career/jobs" || loc === "/zh/career/jobs" || /\/career\/jobs\/[^/]+$/.test(loc));

    expect(generatedCareerJobLocs).toEqual([]);
  });

  it("career alias route no longer uses local career job slugs for static params", () => {
    const source = read("app/(localized)/[locale]/career/[slug]/page.tsx");

    expect(source).toContain("getCareerJobFromCmsBySlug");
    expect(source).not.toContain("listCareerJobSlugs");
  });

  it("llms routes no longer enumerate local career job detail urls", () => {
    const shortSource = read("app/llms.txt/route.ts");
    const fullSource = read("app/llms-full.txt/route.ts");

    expect(shortSource).not.toContain("listCareerJobSlugs");
    expect(fullSource).not.toContain("listCareerJobSlugs");
    expect(shortSource).toContain('"/en/career/jobs"');
    expect(shortSource).toContain('"/zh/career/jobs"');
    expect(fullSource).toContain('path: "/en/career/jobs"');
    expect(fullSource).toContain('path: "/zh/career/jobs"');
  });
});
