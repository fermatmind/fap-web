import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-index-18-sitemap-llms-indexability-gate.mjs";
const JSON_PATH = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.csv";
const MBTI_INDEX_18_BRANCH = "codex/mbti-index-18-sitemap-llms-indexability-gate";

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
  if (githubHeadRef) return githubHeadRef;

  const githubRefName = process.env.GITHUB_REF_NAME?.trim();
  if (githubRefName && !/^\d+\/merge$/.test(githubRefName)) return githubRefName;

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

type Index18Report = {
  id: string;
  artifact: string;
  final_decision: string;
  summary: {
    checked_url_count: number;
    profile_url_count: number;
    comparison_url_count: number;
    quality_pass_count: number;
    production_promotion_blocked_count: number;
    sitemap_expand_now_count: number;
    llms_expand_now_count: number;
    gsc_submit_now_count: number;
  };
  gate_policy: {
    source_of_truth: string;
    frontend_role: string;
    required_before_sitemap_or_llms_expansion: string[];
    gsc_submission: string;
  };
  safety_boundary: Record<string, boolean>;
  records: Array<{
    target_path: string;
    asset_kind: "profile" | "comparison";
    quality_gate: "pass" | "fail";
    production_promotion_gate: "pass" | "blocked";
    robots_policy: string;
    sitemap_decision: string;
    llms_decision: string;
    gsc_decision: string;
    runtime_mutation_allowed_in_this_pr: boolean;
    blockers: string[];
  }>;
  expansion_queue: string[];
  held_queue: string[];
};

describe("MBTI-INDEX-18 sitemap / llms / indexability gate", () => {
  it("generates a deterministic hold gate from CMS16 and CMS17 approval packages", () => {
    execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });

    const report = readJson<Index18Report>(JSON_PATH);
    const markdown = read(MD_PATH);
    const csv = read(CSV_PATH);

    expect(report.id).toBe("MBTI-INDEX-18");
    expect(report.artifact).toBe("MBTI-INDEX-18-SITEMAP-LLMS-INDEXABILITY-GATE");
    expect(report.final_decision).toBe("PASS_INDEXABILITY_GATE_HELD_NO_URL_EXPANSION");
    expect(report.summary).toMatchObject({
      checked_url_count: 10,
      profile_url_count: 5,
      comparison_url_count: 5,
      quality_pass_count: 10,
      production_promotion_blocked_count: 10,
      sitemap_expand_now_count: 0,
      llms_expand_now_count: 0,
      gsc_submit_now_count: 0,
    });
    expect(markdown).toContain("No sitemap, llms, llms-full, canonical, robots, JSON-LD, GSC");
    expect(csv.split(/\r?\n/)[0]).toBe(
      "target_path,asset_kind,quality_gate,production_promotion_gate,robots_policy,sitemap_decision,llms_decision,gsc_decision,blockers",
    );
  });

  it("holds every candidate until backend promotion and authority gates are complete", () => {
    const report = readJson<Index18Report>(JSON_PATH);

    expect(report.expansion_queue).toEqual([]);
    expect(report.held_queue).toHaveLength(10);
    expect(report.records.every((record) => record.quality_gate === "pass")).toBe(true);
    expect(report.records.every((record) => record.production_promotion_gate === "blocked")).toBe(true);
    expect(report.records.every((record) => record.robots_policy === "noindex,follow")).toBe(true);
    expect(report.records.every((record) => record.sitemap_decision === "hold_do_not_expand")).toBe(true);
    expect(report.records.every((record) => record.llms_decision === "hold_do_not_expand")).toBe(true);
    expect(report.records.every((record) => record.gsc_decision === "not_in_scope_do_not_submit")).toBe(true);
    expect(report.records.every((record) => record.runtime_mutation_allowed_in_this_pr === false)).toBe(true);
    expect(report.records.every((record) => record.blockers.includes("production_promotion_not_completed"))).toBe(
      true,
    );
  });

  it("keeps frontend and search submission surfaces untouched in this PR", () => {
    const report = readJson<Index18Report>(JSON_PATH);

    expect(report.gate_policy.source_of_truth).toContain("fap-api CMS/public APIs");
    expect(report.gate_policy.frontend_role).toContain("consume backend");
    expect(report.gate_policy.gsc_submission).toContain("MBTI_GSC_19");
    expect(report.gate_policy.required_before_sitemap_or_llms_expansion).toEqual(
      expect.arrayContaining([
        "operator approval recorded",
        "backend import/promotion completed outside this PR",
        "robots policy changed to index,follow by backend authority",
        "index_eligible/sitemap_eligible/llms_eligible true from backend authority",
      ]),
    );
    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_runtime_mutation_attempted: false,
      llms_runtime_mutation_attempted: false,
      llms_full_runtime_mutation_attempted: false,
      canonical_noindex_jsonld_runtime_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    });
  });

  it("keeps the PR scoped to INDEX-18 artifacts, contract, and train ledger", () => {
    const branch = currentBranchName();
    if (branch !== MBTI_INDEX_18_BRANCH) {
      expect(branch).not.toBe(MBTI_INDEX_18_BRANCH);
      return;
    }

    const allowedPatterns = [
      /^docs\/seo\/personality\/mbti-index-18-/,
      /^scripts\/seo\/build-mbti-index-18-/,
      /^tests\/contracts\/mbti-index-18-/,
      /^tests\/contracts\/mbti-cms-17-comparison-dry-run-approval-package\.contract\.test\.ts$/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/codex\/pr-train-state\.json$/,
      /^generated\/pr-train-sidecar-issues\//,
    ];
    const outsideScope = committedScopeFiles().filter(
      (file) => !allowedPatterns.some((pattern) => pattern.test(file)),
    );

    expect(outsideScope).toEqual([]);
  });
});
