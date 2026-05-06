import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type CareerFamilyAuthorityAudit = {
  version: string;
  scope: Record<string, boolean>;
  summary: {
    clusters: number;
    p1Clusters: number;
    hashedFamilySlugClusters: number;
    familyIndustryOverlapClusters: number;
  };
  clusters: Array<{
    key: string;
    issueType: string;
    urls: string[];
    mustNotDoNow: string[];
  }>;
  mergeSafety: {
    blocksCurrentPr: boolean;
    blocksTopicGraphExpansion: boolean;
    blocksCareerPseoExpansion: boolean;
  };
};

function readAudit(): CareerFamilyAuthorityAudit {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, "docs/seo/generated/career-family-authority-audit.v1.json"), "utf8")
  ) as CareerFamilyAuthorityAudit;
}

describe("career family authority audit", () => {
  it("captures current duplicate family authority clusters without authorizing runtime changes", () => {
    const audit = readAudit();
    const businessCluster = audit.clusters.find((cluster) => cluster.key === "career-family:business-and-financial");

    expect(audit.version).toBe("url_truth.career_family_authority_audit.v1");
    expect(audit.summary).toMatchObject({
      clusters: 3,
      p1Clusters: 3,
      hashedFamilySlugClusters: 1,
      familyIndustryOverlapClusters: 3,
    });
    expect(audit.scope).toMatchObject({
      runtimeUrlChanges: false,
      routingChanges: false,
      canonicalChanges: false,
      sitemapChanges: false,
      llmsChanges: false,
      careerPseoExpansion: false,
    });
    expect(businessCluster?.issueType).toBe("hashed_family_slug_duplication_plus_family_industry_overlap");
    expect(businessCluster?.urls).toEqual(
      expect.arrayContaining([
        "https://fermatmind.com/en/career/family/business-and-financial-37ec69bd",
        "https://fermatmind.com/en/career/family/business-and-financial-a0352070",
        "https://fermatmind.com/en/career/industries/business-and-financial",
      ])
    );
    expect(businessCluster?.mustNotDoNow.join(" ")).toContain("Do not add frontend canonical overrides.");
  });

  it("marks expansion as gated while keeping the audit PR mergeable", () => {
    const audit = readAudit();

    expect(audit.mergeSafety).toEqual({
      blocksCurrentPr: false,
      blocksTopicGraphExpansion: true,
      blocksCareerPseoExpansion: true,
      reason: "Career entity ambiguity should be resolved or explicitly governed before expanding graph/link surfaces.",
    });
  });

  it("documents the remediation plan and no-runtime-change boundary", () => {
    const doc = fs.readFileSync(path.join(ROOT, "docs/seo/career-family-authority-audit.md"), "utf8");

    expect(doc).toContain("PR-UG-04 is a read-only audit");
    expect(doc).toContain("No runtime routing changes.");
    expect(doc).toContain("No sitemap or llms exposure changes.");
    expect(doc).toContain("No career pSEO expansion.");
    expect(doc).toContain("business-and-financial-37ec69bd");
    expect(doc).toContain("business-and-financial-a0352070");
  });
});
