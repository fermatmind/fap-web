import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("dataset method page contract", () => {
  it("renders backend dataset method contract with article structured data", () => {
    const source = read("app/(localized)/[locale]/datasets/occupations/method/page.tsx");

    expect(source).toContain("fetchCareerDatasetMethod");
    expect(source).toContain("adaptCareerDatasetMethod");
    expect(source).toContain("DatasetMethodPanel");
    expect(source).toContain("JsonLd");
    expect(source).toContain('id="dataset-method-article-jsonld"');
    expect(source).toContain('id="dataset-method-breadcrumb-jsonld"');
    expect(source).toContain('data-testid="dataset-method-page"');
    expect(source).toContain('data-testid="dataset-hub-entry"');
    expect(source).not.toContain("fetchCareerJobBundle");
    expect(source).not.toContain("fetchCareerRecommendationBundle");
  });
});

