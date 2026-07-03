import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { isPrCareerKgAgent03AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const GENERATOR = path.join(ROOT, ".agents/skills/career-content-asset-factory/scripts/generate_career_kg_package.py");
const PACKAGE_VALIDATOR = path.join(ROOT, ".agents/skills/career-content-asset-factory/scripts/validate_career_kg_package.py");
const CLAIM_VALIDATOR = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/scripts/validate_career_kg_claim_boundaries.py"
);
const SOURCE_VALIDATOR = path.join(ROOT, ".agents/skills/career-content-asset-factory/scripts/validate_career_kg_sources.py");

function currentChangedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local branch and CI merge refs expose different diff bases.
    }
  }
  return [...files].sort();
}

function generatePackage(): { packageDir: string; assetPath: string } {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "career-kg-validator-"));
  const batchPath = path.join(tempDir, "confirmed-batch.json");
  const outputRoot = path.join(tempDir, "generated");
  fs.writeFileSync(
    batchPath,
    JSON.stringify(
      {
        schema_version: "fermatmind.career_kg.confirmed_batch.v1",
        batch_id: "career-kg-2026-07-03-validator",
        source: "operator_confirmed",
        cms_write_authorized: false,
        production_import_authorized: false,
        seo_runtime_release_authorized: false,
        items: [
          {
            pr_id: "PR-CAREER-KG-18",
            priority: "P0",
            slug: "graphic-designers",
            locale: "zh-CN",
            focus: ["identity", "faq"],
            gsc_summary: { impressions: 485, clicks: 0, avg_position: 9.3 },
          },
        ],
      },
      null,
      2
    )
  );
  execFileSync("python3", [GENERATOR, "--batch", batchPath, "--output-root", outputRoot], { cwd: ROOT });
  const packageDir = path.join(outputRoot, "career-kg-pr-18-graphic-designers");
  return { packageDir, assetPath: path.join(packageDir, "graphic-designers.zh-CN.asset.json") };
}

describe("career KG package validators", () => {
  it("exposes CLI help for each validator", () => {
    for (const script of [PACKAGE_VALIDATOR, CLAIM_VALIDATOR, SOURCE_VALIDATOR]) {
      const output = execFileSync("python3", [script, "--help"], { cwd: ROOT, encoding: "utf8" });
      expect(output).toContain("--asset");
    }
  });

  it("passes a generated dry-run scaffold package", () => {
    const { packageDir } = generatePackage();
    const output = execFileSync("python3", [PACKAGE_VALIDATOR, "--package-dir", packageDir], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const report = JSON.parse(output);

    expect(report.final_conclusion).toBe("PASS");
    expect(report.finding_count).toBe(0);
  });

  it("rejects forbidden career claims and release flags", () => {
    const { assetPath } = generatePackage();
    const asset = JSON.parse(fs.readFileSync(assetPath, "utf8"));
    asset.production_import_approved = true;
    asset.content_blocks[0].body_zh = "这个职业一定保证就业，AI 必然完全替代。";
    fs.writeFileSync(assetPath, JSON.stringify(asset, null, 2));

    const result = spawnSync("python3", [CLAIM_VALIDATOR, "--asset", assetPath], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("employment_guarantee");
    expect(result.stdout).toContain("absolute_ai_replacement");
    expect(result.stdout).toContain("release_flag_must_be_false");
  });

  it("rejects unresolved source refs and market sources used as fact authority", () => {
    const { assetPath } = generatePackage();
    const asset = JSON.parse(fs.readFileSync(assetPath, "utf8"));
    asset.sources.push({
      key: "baike",
      label: "百度百科",
      authority: "occupation_fact",
      usage: "bad fact source",
    });
    asset.content_blocks[0].source_refs = ["missing-source"];
    fs.writeFileSync(assetPath, JSON.stringify(asset, null, 2));

    const result = spawnSync("python3", [SOURCE_VALIDATOR, "--asset", assetPath], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("market_source_used_as_fact_authority");
    expect(result.stdout).toContain("source_ref_unresolved");
  });

  it("keeps PR-CAREER-KG-AGENT-03 changed files inside the declared scope", () => {
    const outside = currentChangedFiles().filter((file) => !isPrCareerKgAgent03AllowedFile(file));

    expect(outside).toEqual([]);
  });
});
