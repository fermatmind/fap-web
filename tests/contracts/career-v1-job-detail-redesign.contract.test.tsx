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

  it("renders career job ordered markdown as dot bullets instead of numbered subheads", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("stripOrderedListMarker");
    expect(source).toContain("sectionNumerals");
    expect(source).toContain("return `${sectionNumerals[sectionHeading[1]]}、${sectionHeading[2]}`;");
    expect(source).toContain("<ul key={index} className=\"m-0 list-disc space-y-3 pl-6\">");
    expect(source).not.toContain("list-decimal space-y-2");
    expect(source).not.toContain("{itemIndex + 1}、");
    expect(source).not.toContain("aria-hidden=\"true\"");
  });

  it("keeps published job detail next-step CTA attribution in live HTML", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("const nextSteps = buildNextStepRailItems(");
    expect(source).toContain("displayCtaLandingPath,");
    expect(source).toContain("displayCtaAttributionParams,");
    expect(source).toContain("publishedIndexAuthority");
    expect(source).toContain("{publishedIndexAuthority ? (");
    expect(source).not.toContain('{locale === "zh" && job.seoContract.indexEligible === true ? (');
  });
});
