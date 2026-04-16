import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career V1 job detail redesign contract", () => {
  it("turns job detail into overview, fit, next-step, and folded evidence sections", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("career-job-v1-overview");
    expect(source).toContain("career-job-v1-at-a-glance");
    expect(source).toContain("career-job-v1-fit-and-facts");
    expect(source).toContain("career-job-v1-next-steps");
    expect(source).toContain("career-job-v1-evidence");
    expect(source).toContain("ConfidenceBadge");
    expect(source).toContain("ConfidenceBoundary");
    expect(source).toContain("EvidenceDrawer");
    expect(source).toContain("NextStepRail");
    expect(source).toContain("ClaimGuard");
    expect(source).toContain("TrustStrip");
    expect(source).toContain("WarningBanner");
    expect(source).toContain("JsonLd");
    expect(source).not.toContain("Career bundle");
    expect(source).not.toContain("Backend score dimensions");
    expect(source).not.toContain("Compiler version");
  });
});
