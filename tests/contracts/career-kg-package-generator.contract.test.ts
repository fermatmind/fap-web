import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { isPrCareerKgAgent02AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const GENERATOR = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/scripts/generate_career_kg_package.py"
);
const ASSET_TEMPLATE = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/templates/career_kg_asset_package_template.json"
);
const README_TEMPLATE = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/templates/career_kg_readme_template.md"
);

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

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "career-kg-generator-"));
}

describe("career KG package generator", () => {
  it("exposes a CLI help contract", () => {
    const output = execFileSync("python3", [GENERATOR, "--help"], { cwd: ROOT, encoding: "utf8" });

    expect(output).toContain("Generate dry-run career KG package scaffolds");
    expect(output).toContain("--batch");
    expect(output).toContain("--output-root");
    expect(output).toContain("--dry-run");
  });

  it("keeps templates dry-run-only and free of runtime release permission", () => {
    const assetTemplate = fs.readFileSync(ASSET_TEMPLATE, "utf8");
    const readmeTemplate = fs.readFileSync(README_TEMPLATE, "utf8");

    expect(assetTemplate).toContain('"production_import_approved": false');
    expect(assetTemplate).toContain('"staging_write_approved": false');
    expect(assetTemplate).toContain('"cms_write_performed": false');
    expect(assetTemplate).toContain('"seo_runtime_release_performed": false');
    expect(assetTemplate).toContain('"real_occupation_content_generated"');
    expect(readmeTemplate).toContain("dry-run scaffold only");
    expect(readmeTemplate).toContain("not an occupational fact");
  });

  it("generates the fixed package directory shape from a confirmed batch fixture", () => {
    const tempDir = makeTempDir();
    const batchPath = path.join(tempDir, "confirmed-batch.json");
    const outputRoot = path.join(tempDir, "generated");
    fs.writeFileSync(
      batchPath,
      JSON.stringify(
        {
          schema_version: "fermatmind.career_kg.confirmed_batch.v1",
          batch_id: "career-kg-2026-07-03-test",
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
              focus: ["title_meta_ctr", "faq", "adjacent_careers"],
              gsc_summary: {
                impressions: 485,
                clicks: 0,
                avg_position: 9.3,
              },
            },
          ],
        },
        null,
        2
      )
    );

    const output = execFileSync("python3", [GENERATOR, "--batch", batchPath, "--output-root", outputRoot], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("career-kg-pr-18-graphic-designers");

    const packageDir = path.join(outputRoot, "career-kg-pr-18-graphic-designers");
    const expectedFiles = [
      "README.md",
      "graphic-designers.zh-CN.asset.json",
      "qa_report.json",
      "dry_run_importer_report.json",
      "staging_preview_smoke.json",
      "fap_web_render_smoke.json",
      "sha256_manifest.json",
    ];
    for (const file of expectedFiles) {
      expect(fs.existsSync(path.join(packageDir, file)), file).toBe(true);
    }

    const asset = JSON.parse(fs.readFileSync(path.join(packageDir, "graphic-designers.zh-CN.asset.json"), "utf8"));
    expect(asset.pr_id).toBe("PR-CAREER-KG-18");
    expect(asset.slug).toBe("graphic-designers");
    expect(asset.production_import_approved).toBe(false);
    expect(asset.staging_write_approved).toBe(false);
    expect(asset.cms_write_performed).toBe(false);
    expect(asset.seo_runtime_release_performed).toBe(false);
    expect(asset.generator.real_occupation_content_generated).toBe(false);
    expect(asset.confirmed_batch_ref.gsc_summary_usage).toBe("opportunity_signal_only_not_occupation_fact");

    const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "sha256_manifest.json"), "utf8"));
    expect(manifest.dry_run_only).toBe(true);
    expect(Object.keys(manifest.files).sort()).toEqual(
      expectedFiles.filter((file) => file !== "sha256_manifest.json").sort()
    );
  });

  it("keeps PR-CAREER-KG-AGENT-02 changed files inside the declared scope", () => {
    const outside = currentChangedFiles().filter((file) => !isPrCareerKgAgent02AllowedFile(file));

    expect(outside).toEqual([]);
  });
});
