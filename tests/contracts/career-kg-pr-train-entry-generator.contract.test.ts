import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { isPrCareerKgAgent05AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const GENERATOR = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/scripts/generate_career_kg_pr_train_entries.py"
);
const YAML_TEMPLATE = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/templates/career_kg_pr_train_entry.yaml"
);
const STATE_TEMPLATE = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/templates/career_kg_pr_train_state_entry.json"
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

function writeBatch(tempDir: string): string {
  const batchPath = path.join(tempDir, "confirmed-batch.json");
  fs.writeFileSync(
    batchPath,
    JSON.stringify(
      {
        schema_version: "fermatmind.career_kg.confirmed_batch.v1",
        batch_id: "career-kg-2026-07-03-train",
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
            focus: ["title_meta_ctr"],
            gsc_summary: { impressions: 485, clicks: 0, avg_position: 9.3 },
          },
        ],
      },
      null,
      2
    )
  );
  return batchPath;
}

describe("career KG PR train entry generator", () => {
  it("exposes CLI help and keeps templates patch-only", () => {
    const output = execFileSync("python3", [GENERATOR, "--help"], { cwd: ROOT, encoding: "utf8" });
    const yamlTemplate = fs.readFileSync(YAML_TEMPLATE, "utf8");
    const stateTemplate = fs.readFileSync(STATE_TEMPLATE, "utf8");

    expect(output).toContain("Generate career KG PR train patch artifacts");
    expect(yamlTemplate).toContain("status: pending");
    expect(yamlTemplate).toContain("production import");
    expect(stateTemplate).toContain('"merged_at": null');
  });

  it("generates patch artifacts without mutating train ledgers", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "career-kg-pr-train-"));
    const batchPath = writeBatch(tempDir);
    const outputDir = path.join(tempDir, "run");
    const beforeManifest = fs.readFileSync(path.join(ROOT, "docs/codex/pr-train.yaml"), "utf8");
    const beforeState = fs.readFileSync(path.join(ROOT, "docs/codex/pr-train-state.json"), "utf8");

    execFileSync("python3", [GENERATOR, "--batch", batchPath, "--output-dir", outputDir], { cwd: ROOT });

    expect(fs.readFileSync(path.join(ROOT, "docs/codex/pr-train.yaml"), "utf8")).toBe(beforeManifest);
    expect(fs.readFileSync(path.join(ROOT, "docs/codex/pr-train-state.json"), "utf8")).toBe(beforeState);
    expect(fs.existsSync(path.join(outputDir, "pr_train_patch.yaml"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "pr_train_state_patch.json"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "execution_prompt.md"))).toBe(true);

    const patch = fs.readFileSync(path.join(outputDir, "pr_train_patch.yaml"), "utf8");
    const statePatch = JSON.parse(fs.readFileSync(path.join(outputDir, "pr_train_state_patch.json"), "utf8"));
    const prompt = fs.readFileSync(path.join(outputDir, "execution_prompt.md"), "utf8");
    expect(patch).toContain("id: PR-CAREER-KG-18");
    expect(patch).toContain("generated/career-kg-pr-18-graphic-designers/README.md");
    expect(statePatch["PR-CAREER-KG-18"].status).toBe("pending");
    expect(prompt).toContain("explicit");
    expect(prompt).toContain("operator authorization");
  });

  it("keeps PR-CAREER-KG-AGENT-05 changed files inside the declared scope", () => {
    const outside = currentChangedFiles().filter((file) => !isPrCareerKgAgent05AllowedFile(file));

    expect(outside).toEqual([]);
  });
});
