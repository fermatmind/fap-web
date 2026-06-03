import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DETECTOR_MAX_BUFFER = 64 * 1024 * 1024;

type DuplicateReport = {
  version: string;
  summary: {
    totalUrls: number;
    duplicateTitleClusters: number;
    duplicateDescriptionClusters: number;
    duplicateCanonicalClusters: number;
    duplicateSemanticEntityClusters: number;
    careerFamilyVariantClusters: number;
  };
  titleClusters: Array<{ key: string; urls: string[] }>;
  descriptionClusters: Array<{ key: string; urls: string[] }>;
  canonicalClusters: Array<{ key: string; urls: string[] }>;
  semanticEntityClusters: Array<{ key: string; urls: string[] }>;
  careerFamilyVariantClusters: Array<{ key: string; urls: string[] }>;
};

function runDetector(...args: string[]): DuplicateReport {
  const output = execFileSync("node", ["scripts/seo/detect-duplicate-seo-entities.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: DETECTOR_MAX_BUFFER,
  });
  return JSON.parse(output) as DuplicateReport;
}

function writeInventory(rows: Array<Record<string, unknown>>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "duplicate-seo-entities-"));
  const inventoryPath = path.join(dir, "inventory.json");
  fs.writeFileSync(
    inventoryPath,
    `${JSON.stringify(
      {
        version: "test.inventory.v1",
        mode: "test",
        rows,
      },
      null,
      2
    )}\n`
  );
  return inventoryPath;
}

describe("duplicate SEO entity detector", () => {
  it("generates a reproducible duplicate entity report from the URL inventory", () => {
    const report = runDetector();

    expect(report.version).toBe("url_truth.duplicate_entity_report.v1");
    expect(report.summary.totalUrls).toBeGreaterThan(250);
    expect(report.summary.duplicateSemanticEntityClusters).toBeGreaterThan(0);
    expect(report.semanticEntityClusters.some((cluster) => cluster.key === "career-job:accountants-and-auditors")).toBe(true);
  });

  it("detects duplicate title, description, and canonical clusters when metadata samples are present", () => {
    const inventoryPath = writeInventory([
      {
        url: "https://fermatmind.com/en/topics/mbti",
        path: "/en/topics/mbti",
        locale: "en",
        routeFamily: "topic_detail",
        title: "MBTI Guide",
        description: "Shared MBTI description",
        canonicalUrl: "https://fermatmind.com/en/topics/mbti",
      },
      {
        url: "https://fermatmind.com/en/articles/mbti-guide",
        path: "/en/articles/mbti-guide",
        locale: "en",
        routeFamily: "article_detail",
        title: "MBTI Guide",
        description: "Shared MBTI description",
        canonicalUrl: "https://fermatmind.com/en/topics/mbti",
      },
      {
        url: "https://fermatmind.com/en/career/family/business-and-financial-1234abcd",
        path: "/en/career/family/business-and-financial-1234abcd",
        locale: "en",
        routeFamily: "career_family",
      },
      {
        url: "https://fermatmind.com/en/career/industries/business-and-financial",
        path: "/en/career/industries/business-and-financial",
        locale: "en",
        routeFamily: "career_industry_detail",
      },
    ]);

    const report = runDetector("--inventory", inventoryPath);

    expect(report.summary.duplicateTitleClusters).toBe(1);
    expect(report.summary.duplicateDescriptionClusters).toBe(1);
    expect(report.summary.duplicateCanonicalClusters).toBe(1);
    expect(report.titleClusters[0]?.urls).toHaveLength(2);
    expect(report.descriptionClusters[0]?.urls).toHaveLength(2);
    expect(report.canonicalClusters[0]?.urls).toHaveLength(2);
    expect(report.careerFamilyVariantClusters.some((cluster) => cluster.key === "career-family:business-and-financial")).toBe(true);
  });

  it("can write JSON and CSV reports without modifying runtime SEO behavior", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "duplicate-seo-report-"));
    const jsonPath = path.join(dir, "report.json");
    const csvPath = path.join(dir, "report.csv");

    runDetector("--output", jsonPath, "--csv", csvPath, "--pretty");

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as DuplicateReport;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("url_truth.duplicate_entity_report.v1");
    expect(csv.split("\n")[0]).toContain("type");
    expect(csv).toContain("duplicate_semantic_entity");
  });
});
