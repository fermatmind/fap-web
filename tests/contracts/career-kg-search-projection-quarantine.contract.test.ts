import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { isPrCareerKgAgent04AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const VALIDATOR = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/scripts/validate_search_projection_quarantine.py"
);
const CANDIDATE_SCHEMA = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/schemas/career_kg_search_projection_candidate.schema.json"
);
const CANDIDATE_TEMPLATE = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/templates/career_kg_search_projection_candidate.json"
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

function writeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "career-kg-search-"));
  const assetPath = path.join(dir, "reader.asset.json");
  const candidatePath = path.join(dir, "search_projection.candidate.json");
  fs.writeFileSync(
    assetPath,
    JSON.stringify(
      {
        artifact_type: "career_knowledge_graph_occupation_asset",
        release_boundaries: {
          canonical_change_authorized: false,
          noindex_change_authorized: false,
          sitemap_change_authorized: false,
          llms_change_authorized: false,
          json_ld_release_authorized: false,
          search_provider_submission_authorized: false,
        },
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    candidatePath,
    JSON.stringify(
      {
        artifact_type: "career_kg_search_projection_candidate",
        artifact_version: "kg.search_projection.v1",
        status: "candidate_only",
        pr_id: "PR-CAREER-KG-18",
        slug: "graphic-designers",
        locale: "zh-CN",
        production_import_approved: false,
        staging_write_approved: false,
        seo_runtime_release_approved: false,
        cms_write_approved: false,
        title_meta_candidates: [],
        faq_candidates: [],
        internal_link_candidates: [],
        release_boundaries: {
          canonical_change_authorized: false,
          noindex_change_authorized: false,
          sitemap_change_authorized: false,
          llms_change_authorized: false,
          json_ld_release_authorized: false,
          search_provider_submission_authorized: false,
        },
      },
      null,
      2
    )
  );
  return { assetPath, candidatePath };
}

describe("career KG search projection quarantine", () => {
  it("defines a candidate-only schema and template", () => {
    const schema = fs.readFileSync(CANDIDATE_SCHEMA, "utf8");
    const template = fs.readFileSync(CANDIDATE_TEMPLATE, "utf8");

    expect(schema).toContain("career_kg_search_projection_candidate");
    expect(schema).toContain('"candidate_only"');
    expect(schema).toContain('"seo_runtime_release_approved"');
    expect(template).toContain('"candidate_only"');
    expect(template).toContain('"seo_runtime_release_approved": false');
    expect(template).toContain('"json_ld_release_authorized": false');
  });

  it("passes when reader asset and search projection candidate stay separated", () => {
    const { assetPath, candidatePath } = writeFixture();
    const output = execFileSync("python3", [VALIDATOR, "--asset", assetPath, "--search-projection", candidatePath], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const report = JSON.parse(output);

    expect(report.final_conclusion).toBe("PASS");
    expect(report.search_projection_file_exists).toBe(true);
  });

  it("rejects candidate projection fields inside reader assets", () => {
    const { assetPath } = writeFixture();
    const asset = JSON.parse(fs.readFileSync(assetPath, "utf8"));
    asset.search_projection = { title: "bad" };
    fs.writeFileSync(assetPath, JSON.stringify(asset, null, 2));

    const result = spawnSync("python3", [VALIDATOR, "--asset", assetPath], { cwd: ROOT, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("search_projection");
  });

  it("rejects candidate files that approve SEO runtime release", () => {
    const { assetPath, candidatePath } = writeFixture();
    const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
    candidate.seo_runtime_release_approved = true;
    fs.writeFileSync(candidatePath, JSON.stringify(candidate, null, 2));

    const result = spawnSync("python3", [VALIDATOR, "--asset", assetPath, "--candidate", candidatePath], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("seo_runtime_release_approved");
  });

  it("keeps PR-CAREER-KG-AGENT-04 changed files inside the declared scope", () => {
    const outside = currentChangedFiles().filter((file) => !isPrCareerKgAgent04AllowedFile(file));

    expect(outside).toEqual([]);
  });
});
