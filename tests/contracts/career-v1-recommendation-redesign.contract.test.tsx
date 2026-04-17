import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career V1 recommendation redesign contract", () => {
  it("keeps recommendation detail decision-first and prevents matched jobs from becoming the page body", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain("career-recommendation-v1-decision-summary");
    expect(source).toContain("career-recommendation-v1-top-path");
    expect(source).toContain("career-recommendation-v1-decision-cards");
    expect(source).toContain("career-recommendation-v1-transition-map");
    expect(source).toContain("displayedMatchedJobs = matchedJobs.slice(0, 5)");
    expect(source).toContain("Candidate roles under this path");
    expect(source).toContain("CareerShortlistAction");
    expect(source).toContain("CareerFeedbackPanel");
    expect(source).toContain("CareerTransitionPathPanel");
    expect(source).toContain("CareerRecommendationCompanionLinks");
    expect(source).toContain("EvidenceDrawer");
    expect(source).toContain("ClaimGuard");
    expect(source).toContain("TrustStrip");
    expect(source).toContain("WarningBanner");
    expect(source).toContain("JsonLd");
    expect(source).not.toContain("Matched role matrix");
    expect(source).not.toContain("Authority route");
    expect(source).not.toContain("Graph key");
  });
});
