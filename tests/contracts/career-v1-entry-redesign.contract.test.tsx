import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career V1 entry redesign contract", () => {
  it("keeps /career search and recommendation first while moving technical scope language out of the main path", () => {
    const source = read("app/(localized)/[locale]/career/page.tsx");

    expect(source).toContain("找到适合你的职业方向");
    expect(source).toContain("View my career recommendations");
    expect(source).toContain("career-v1-soft-exploration-row");
    expect(source).toContain("ConfidenceBadge");
    expect(source).toContain("DecisionPathCard");
    expect(source).toContain("NextStepRail");
    expect(source).toContain("fetchCareerLaunchGovernanceClosure");
    expect(source).toContain("AnalyticsPageViewTracker");
    expect(source).toContain("JsonLd");
    expect(source).not.toContain("full-342 closure authority");
    expect(source).not.toContain("backend authority");
    expect(source).not.toContain("strong-index");
  });
});
