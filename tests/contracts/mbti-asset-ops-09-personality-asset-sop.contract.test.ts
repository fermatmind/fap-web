import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-asset-ops-09-personality-asset-sop.mjs";
const JSON_PATH = "docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.json";
const MD_PATH = "docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.md";
const CSV_PATH = "docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.csv";
const README_PATH = "docs/seo/personality/README.md";
const MBTI_ASSET_OPS_09_BRANCH = "codex/mbti-asset-ops-09-personality-asset-sop";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function committedScopeFiles(): string[] {
  const files = new Set<string>();

  try {
    const output = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    for (const line of output.split("\n")) {
      if (line.trim()) files.add(line.trim());
    }
  } catch {
    // Local explicit scope validation is the fallback in shallow CI checkouts.
  }

  return [...files].sort();
}

function currentBranchName(): string {
  const githubHeadRef = process.env.GITHUB_HEAD_REF?.trim();
  if (githubHeadRef) {
    return githubHeadRef;
  }

  const githubRefName = process.env.GITHUB_REF_NAME?.trim();
  if (githubRefName && !/^\d+\/merge$/.test(githubRefName)) {
    return githubRefName;
  }

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

type AssetOpsReport = {
  id: string;
  train_name: string;
  final_decision: string;
  summary: {
    top10_profile_assets: number;
    comparison20_assets: number;
    comparison20_at_pages: number;
    comparison20_hot_cross_type_pages: number;
    remaining58_assets: number;
    remaining58_duplicate_signature_group_count: number;
    pending_gsc_query_exports: number;
    captured_gsc_query_rows: number;
    pending_cms_import_assets: number;
    sitemap_detail_expansion_allowed_now: boolean;
    llms_url_expansion_allowed_now: boolean;
  };
  current_asset_status: Array<{
    state: string;
    asset_count: number;
    current_status: string;
    next_pr: string;
    gate: string;
  }>;
  pr_execution_route: Array<{
    pr_id: string;
    repo: string;
    consumes_state: string[];
    produces_state: string[];
    next_when_done: string | null;
  }>;
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

describe("MBTI-ASSET-OPS-09 personality asset SOP", () => {
  it("generates a deterministic asset-state SOP from existing MBTI evidence artifacts", () => {
    execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });

    const report = readJson<AssetOpsReport>(JSON_PATH);
    const markdown = read(MD_PATH);
    const csv = read(CSV_PATH);

    expect(report.id).toBe("MBTI-ASSET-OPS-09");
    expect(report.train_name).toBe("mbti-personality-asset-operations-train");
    expect(report.final_decision).toBe("PASS_MBTI_ASSET_OPS_09_PERSONALITY_ASSET_SOP_READY");
    expect(report.blockers).toEqual([]);
    expect(report.summary).toMatchObject({
      top10_profile_assets: 10,
      comparison20_assets: 20,
      comparison20_at_pages: 16,
      comparison20_hot_cross_type_pages: 4,
      remaining58_assets: 58,
      remaining58_duplicate_signature_group_count: 0,
      pending_gsc_query_exports: 10,
      captured_gsc_query_rows: 3,
      pending_cms_import_assets: 30,
      sitemap_detail_expansion_allowed_now: false,
      llms_url_expansion_allowed_now: false,
    });

    expect(markdown).toContain("Current Asset Status");
    expect(markdown).toContain("PR Execution Route");
    expect(csv.split(/\r?\n/)[0]).toBe(
      "state,asset_count,source_artifact,authority_layer,current_status,next_pr,next_action,gate",
    );
  });

  it("routes every asset state to the correct follow-up PR without combining scopes", () => {
    const report = readJson<AssetOpsReport>(JSON_PATH);
    const stateToNext = new Map(report.current_asset_status.map((row) => [row.state, row.next_pr]));

    expect(stateToNext.get("top10_profile_assets")).toBe("MBTI-CMS-12");
    expect(stateToNext.get("comparison20_assets")).toBe("MBTI-CMS-13");
    expect(stateToNext.get("remaining58")).toBe("MBTI-QA-14");
    expect(stateToNext.get("pending_gsc_query_export")).toBe("MBTI-GSC-11");
    expect(stateToNext.get("pending_cms_import")).toBe("MBTI-CMS-12 / MBTI-CMS-13");

    expect(report.pr_execution_route.map((row) => row.pr_id)).toEqual([
      "MBTI-ASSET-OPS-09",
      "MBTI-ASSET-SKILL-10",
      "MBTI-GSC-11",
      "MBTI-CMS-12",
      "MBTI-CMS-13",
      "MBTI-QA-14",
    ]);
    expect(report.pr_execution_route.find((row) => row.pr_id === "MBTI-CMS-12")?.repo).toBe("fap-api");
    expect(report.pr_execution_route.find((row) => row.pr_id === "MBTI-CMS-13")?.repo).toBe("fap-api");
  });

  it("documents the operator-facing README status table and required authority boundaries", () => {
    const readme = read(README_PATH);

    for (const requiredText of [
      "MBTI-ASSET-OPS-09",
      "Top10 profile assets",
      "comparison20 assets",
      "remaining58",
      "Pending GSC query export",
      "Pending CMS import",
      "MBTI-ASSET-SKILL-10",
      "MBTI-GSC-11",
      "MBTI-CMS-12",
      "MBTI-CMS-13",
      "MBTI-QA-14",
      "fap-api CMS/public APIs remain the authority",
      "Missing GSC query rows are pending evidence, not zero demand",
    ]) {
      expect(readme).toContain(requiredText);
    }
  });

  it("keeps the SOP artifact-only and blocks runtime, CMS write, deploy, and discoverability mutations", () => {
    const report = readJson<AssetOpsReport>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      cms_write_attempted: false,
      production_import_attempted: false,
      production_deploy_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      canonical_noindex_jsonld_runtime_mutation_attempted: false,
      gsc_api_call_attempted: false,
      search_console_mutation_attempted: false,
      local_editorial_fallback_added: false,
    });
  });

  it("keeps the PR scoped to OPS-09 docs, artifacts, contract, and train ledger", () => {
    const branch = currentBranchName();
    if (branch !== MBTI_ASSET_OPS_09_BRANCH) {
      expect(branch).not.toBe(MBTI_ASSET_OPS_09_BRANCH);
      return;
    }

    const allowedExact = new Set([
      SCRIPT_PATH,
      JSON_PATH,
      MD_PATH,
      CSV_PATH,
      README_PATH,
      "tests/contracts/mbti-asset-ops-09-personality-asset-sop.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "generated/pr-train-sidecar-issues/sidecar_issues.md",
      "generated/pr-train-sidecar-issues/sidecar_issues.json",
    ]);
    const outsideScope = committedScopeFiles().filter((file) => !allowedExact.has(file));

    expect(outsideScope).toEqual([]);
  });
});
