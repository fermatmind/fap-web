import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("dataset hub page contract", () => {
  it("renders backend dataset hub contract with dedicated structured data surface", () => {
    const source = read("app/(localized)/[locale]/datasets/occupations/page.tsx");

    expect(source).toContain("fetchCareerDatasetHub");
    expect(source).toContain("adaptCareerDatasetHub");
    expect(source).toContain("DatasetHubShell");
    expect(source).toContain("DatasetFilterHub");
    expect(source).toContain("DatasetDownloadInfo");
    expect(source).toContain("Included / Excluded");
    expect(source).toContain("publicDetailIndexableCount");
    expect(source).toContain("publicDetailConservativeCount");
    expect(source).toContain("dataset.facetDistributions");
    expect(source).toContain("JsonLd");
    expect(source).toContain('id="dataset-hub-jsonld"');
    expect(source).toContain('id="dataset-hub-breadcrumb-jsonld"');
    expect(source).toContain('data-testid="dataset-hub-page"');
    expect(source).toContain('data-testid="dataset-method-entry"');
    expect(source).not.toContain("fetchCareerJobBundle");
    expect(source).not.toContain("fetchCareerFamilyHub");
    expect(source).not.toContain("fetchCareerRecommendationBundle");
  });
});
