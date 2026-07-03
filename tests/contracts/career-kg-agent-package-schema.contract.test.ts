import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { isPrCareerKgAgent01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CONFIRMED_BATCH_SCHEMA = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/schemas/career_kg_confirmed_batch.schema.json"
);
const ASSET_PACKAGE_SCHEMA = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/schemas/career_kg_asset_package.schema.json"
);
const CONTRACT_DOC = path.join(
  ROOT,
  ".agents/skills/career-content-asset-factory/references/career_kg_confirmed_batch_contract.md"
);
const RUNBOOK = path.join(ROOT, "docs/career/career-kg-agent-optimization-runbook.md");
const TRAIN_MANIFEST = path.join(ROOT, "docs/codex/pr-train.yaml");
const TRAIN_STATE = path.join(ROOT, "docs/codex/pr-train-state.json");

type JsonSchema = {
  properties?: Record<string, unknown>;
  required?: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

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
      // CI merge refs and local worktrees expose different diff bases.
    }
  }
  return [...files].sort();
}

describe("career KG agent package schema contract", () => {
  it("defines an operator-confirmed batch schema without GSC crawling authority", () => {
    const schema = readJson<JsonSchema>(CONFIRMED_BATCH_SCHEMA);
    const text = fs.readFileSync(CONFIRMED_BATCH_SCHEMA, "utf8");

    expect(schema.required).toEqual(
      expect.arrayContaining([
        "schema_version",
        "batch_id",
        "source",
        "cms_write_authorized",
        "production_import_authorized",
        "seo_runtime_release_authorized",
        "items",
      ])
    );
    expect(text).toContain("fermatmind.career_kg.confirmed_batch.v1");
    expect(text).toContain('"source": {\n      "const": "operator_confirmed"');
    expect(text).toContain('"cms_write_authorized": {\n      "const": false');
    expect(text).toContain('"production_import_authorized": {\n      "const": false');
    expect(text).toContain('"seo_runtime_release_authorized": {\n      "const": false');
    expect(text).toContain('"maxItems": 20');
    expect(text).toContain('"priority":');
    expect(text).toContain('"P0"');
    expect(text).toContain('"P1"');
    expect(text).toContain('"P2"');
    expect(text).toContain('"gsc_summary"');
  });

  it("locks the dry-run package schema and required career KG sections", () => {
    const schemaText = fs.readFileSync(ASSET_PACKAGE_SCHEMA, "utf8");
    const schema = readJson<JsonSchema>(ASSET_PACKAGE_SCHEMA);

    expect(schema.required).toEqual(
      expect.arrayContaining([
        "artifact_type",
        "pr_id",
        "status",
        "identity",
        "seo",
        "content_blocks",
        "sources",
        "market_reference_policy",
        "internal_links",
        "release_boundaries",
      ])
    );
    expect(schemaText).toContain('"career_knowledge_graph_occupation_asset"');
    expect(schemaText).toContain('"dry_run_ready"');
    expect(schemaText).toContain('"canonical_unchanged"');
    expect(schemaText).toContain('"production_import_approved": {\n      "const": false');
    expect(schemaText).toContain('"staging_write_approved": {\n      "const": false');
    for (const blockId of [
      "definition",
      "core_responsibilities",
      "work_scenes",
      "skills_tools",
      "entry_path",
      "riasec_personality_boundary",
      "risk_ai_boundary",
      "adjacent_careers",
      "faq",
    ]) {
      expect(schemaText).toContain(`"${blockId}"`);
    }
  });

  it("documents the operator-selected input boundary and blocked release actions", () => {
    const contract = fs.readFileSync(CONTRACT_DOC, "utf8");
    const runbook = fs.readFileSync(RUNBOOK, "utf8");

    expect(contract).toContain("does not define a crawler, ranker, or");
    expect(contract).toContain("GSC scan and page/query review");
    expect(contract).toContain("CMS save, publish, import");
    expect(contract).toContain("sitemap");
    expect(contract).toContain("JSON-LD");
    expect(contract).toContain("Search provider");
    expect(runbook).toContain("after the operator has already reviewed GSC");
    expect(runbook).toContain("Career content agent");
    expect(runbook).toContain("SEO agent");
    expect(runbook).toContain("PR train agent");
    expect(runbook).toContain("must not become the authority");
  });

  it("registers PR-CAREER-KG-AGENT-01 through PR-CAREER-KG-AGENT-06 in train metadata", () => {
    const manifest = fs.readFileSync(TRAIN_MANIFEST, "utf8");
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE, "utf8")) as { prs?: Array<{ id: string }> };
    const stateIds = new Set((state.prs ?? []).map((pr) => pr.id));

    for (const prId of [
      "PR-CAREER-KG-AGENT-01",
      "PR-CAREER-KG-AGENT-02",
      "PR-CAREER-KG-AGENT-03",
      "PR-CAREER-KG-AGENT-04",
      "PR-CAREER-KG-AGENT-05",
      "PR-CAREER-KG-AGENT-06",
    ]) {
      expect(manifest).toContain(`id: ${prId}`);
      expect(stateIds.has(prId), prId).toBe(true);
    }
  });

  it("keeps PR-CAREER-KG-AGENT-01 changed files inside the declared scope", () => {
    const outside = currentChangedFiles().filter((file) => !isPrCareerKgAgent01AllowedFile(file));

    expect(outside).toEqual([]);
  });
});
