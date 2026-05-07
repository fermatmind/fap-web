import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GENERATED_REPORT_PATH = path.join(ROOT, "docs/seo/generated/duplicate-title-governance.v1.json");

type DuplicateTitleGovernanceReport = {
  version: string;
  source: {
    duplicateEntityReportVersion: string;
    totalUrls: number;
  };
  summary: {
    totalClusters: number;
    duplicateTitleClusters: number;
    duplicateDescriptionClusters: number;
    duplicateCanonicalClusters: number;
    highRiskClusters: number;
    byClassification: Record<string, number>;
  };
  highRiskClusters: Array<{
    type: string;
    classification: string;
    key: string;
    routeFamilies: string[];
    urls: string[];
  }>;
  clusters: Array<{
    type: string;
    classification: string;
    key: string;
    routeFamilies: string[];
    urls: string[];
  }>;
};

function runGenerator(...args: string[]): DuplicateTitleGovernanceReport {
  const output = execFileSync("node", ["scripts/seo/generate-duplicate-title-governance-report.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return JSON.parse(output) as DuplicateTitleGovernanceReport;
}

describe("duplicate title governance report", () => {
  it("generates a reproducible governance report from the duplicate entity detector output", () => {
    const report = runGenerator("--output", "", "--csv", "");

    expect(report.version).toBe("seo_foundation.duplicate_title_governance.v1");
    expect(report.source.duplicateEntityReportVersion).toBe("url_truth.duplicate_entity_report.v1");
    expect(report.source.totalUrls).toBeGreaterThan(250);
    expect(report.summary.totalClusters).toBe(report.clusters.length);
    expect(report.summary.duplicateTitleClusters).toBeGreaterThan(0);
    expect(report.summary.byClassification).toEqual(
      expect.objectContaining({
        watchlist: expect.any(Number),
        CMS_remediation_required: expect.any(Number),
        semantic_entity_risk: expect.any(Number),
      })
    );
  });

  it("classifies known career family duplicate-risk clusters without changing titles", () => {
    const report = JSON.parse(fs.readFileSync(GENERATED_REPORT_PATH, "utf8")) as DuplicateTitleGovernanceReport;
    const careerFamilyRisk = report.highRiskClusters.find(
      (cluster) => cluster.type === "career_family_variant" && cluster.key === "career-family:business-and-financial"
    );
    const titleRisk = report.clusters.find(
      (cluster) => cluster.type === "duplicate_title" && cluster.key === "computer-and-information-technology"
    );

    expect(careerFamilyRisk).toMatchObject({
      classification: "semantic_entity_risk",
      routeFamilies: ["career_family", "career_industry_detail"],
    });
    expect(careerFamilyRisk?.urls.length).toBeGreaterThanOrEqual(4);
    expect(titleRisk).toMatchObject({
      classification: "CMS_remediation_required",
    });
  });

  it("can write JSON and CSV governance artifacts", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "duplicate-title-governance-"));
    const jsonPath = path.join(dir, "report.json");
    const csvPath = path.join(dir, "report.csv");

    runGenerator("--output", jsonPath, "--csv", csvPath, "--pretty");

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as DuplicateTitleGovernanceReport;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("seo_foundation.duplicate_title_governance.v1");
    expect(csv.split("\n")[0]).toContain("classification");
    expect(csv).toContain("CMS_remediation_required");
    expect(csv).toContain("semantic_entity_risk");
  });
});
