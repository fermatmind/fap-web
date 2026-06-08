import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type InventoryRow = {
  url: string;
  path: string;
  routeFamily: string;
  inSitemap: boolean;
  expectedLlmsState: string;
  exposureClassification: string;
  canonicalState: string;
  robotsIndexState: string;
  hreflangState: string;
  jsonLdFamily: string[];
  evidenceContainerReadiness: string;
};

type Inventory = {
  version: string;
  mode: string;
  summary: {
    totalUrls: number;
    routeFamilyCounts: Record<string, number>;
    expectedLlmsStateCounts: Record<string, number>;
  };
  rows: InventoryRow[];
};

function runInventory(...args: string[]): Inventory {
  const output = execFileSync("node", ["scripts/seo/generate-url-inventory.mjs", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(output) as Inventory;
}

describe("URL inventory generator", () => {
  it("builds a reproducible offline inventory from the checked-in sitemap", () => {
    const inventory = runInventory();

    expect(inventory.version).toBe("url_truth.inventory.v1");
    expect(inventory.mode).toBe("offline");
    expect(inventory.summary.totalUrls).toBeGreaterThan(200);
    expect(inventory.summary.routeFamilyCounts).toMatchObject({
      test_detail: expect.any(Number),
      topic_detail: expect.any(Number),
      personality_detail: expect.any(Number),
      career_job_detail: expect.any(Number),
      article_detail: expect.any(Number),
    });
    expect(inventory.rows.every((row) => row.inSitemap)).toBe(true);
  });

  it("classifies key URL families with discoverability governance fields", () => {
    const inventory = runInventory();
    const byPath = new Map(inventory.rows.map((row) => [row.path, row]));

    expect(byPath.get("/en/tests/mbti-personality-test-16-personality-types")).toMatchObject({
      routeFamily: "test_detail",
      expectedLlmsState: "allow",
      evidenceContainerReadiness: "partial",
    });
    expect(byPath.get("/en/personality/intj-a")).toMatchObject({
      routeFamily: "personality_detail",
      exposureClassification: "public_indexable",
      jsonLdFamily: expect.arrayContaining(["AboutPage", "DefinedTerm"]),
    });
    expect(byPath.get("/zh/career/jobs/actuaries")).toMatchObject({
      routeFamily: "career_job_detail",
      expectedLlmsState: "conditional",
      evidenceContainerReadiness: "not_ready",
    });
  });

  it("can write JSON and CSV inventory artifacts without requiring network access", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "url-inventory-"));
    const jsonPath = path.join(dir, "inventory.json");
    const csvPath = path.join(dir, "inventory.csv");

    runInventory("--output", jsonPath, "--csv", csvPath);

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Inventory;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("url_truth.inventory.v1");
    expect(csv.split("\n")[0]).toContain("routeFamily");
    expect(csv).toContain("career_job_detail");
  });
});
