import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf8");
}

describe("career content contract", () => {
  it("keeps career content assets out of frontend content collections", () => {
    const contentSource = read("lib/content.ts");

    expect(existsSync(resolve(ROOT, "content/career"))).toBe(false);
    expect(existsSync(resolve(ROOT, "velite.config.ts"))).toBe(false);
    expect(contentSource).not.toContain("careerJobs");
    expect(contentSource).not.toContain("careerGuides");
    expect(contentSource).not.toContain("careerIndustries");
    expect(contentSource).not.toContain("careerRecommendationProfiles");
  });

  it("keeps recommendation sections off local career helpers", () => {
    const recommendationsSource = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(recommendationsSource).not.toContain("listBig5RecommendationTraits");
    expect(recommendationsSource).not.toContain("/career/recommendations/big5/");
  });
});
