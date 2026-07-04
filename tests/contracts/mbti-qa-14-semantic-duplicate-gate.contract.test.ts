import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-qa-14-semantic-duplicate-gate.mjs";
const JSON_PATH = "docs/seo/personality/mbti-qa-14-semantic-duplicate-gate-2026-07-04.json";
const MD_PATH = "docs/seo/personality/mbti-qa-14-semantic-duplicate-gate-2026-07-04.md";

type GateResult = {
  status: "pass" | "fail";
  evidence: string;
  failures: string[];
};

type PageResult = {
  source_batch: "remaining58" | "comparison20";
  path: string;
  page_type: string;
  module_count: number;
  faq_count: number;
  internal_link_count: number;
  gates: Record<string, GateResult>;
  qa_decision: string;
  blocked_reason: null | unknown[];
};

type QaReport = {
  id: string;
  artifact: string;
  final_decision: string;
  summary: {
    target_count: number;
    pass_count: number;
    blocked_count: number;
    remaining58_count: number;
    comparison20_count: number;
    remaining58_pass_count: number;
    comparison20_pass_count: number;
    remaining58_blocked_count: number;
    comparison20_blocked_count: number;
    remaining58_min_faq_count: number;
    comparison20_min_faq_count: number;
  };
  gate_totals: Record<string, { passed: number; failed: number }>;
  page_results: PageResult[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function committedScopeFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI refs can differ from local refs; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("MBTI-QA-14 semantic quality and duplicate risk gate", () => {
  it("regenerates the artifact-only QA report for remaining58 and comparison20", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: false,
      artifact: "MBTI-QA-14-SEMANTIC-DUPLICATE-GATE",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      target_count: 78,
      remaining58_count: 58,
      comparison20_count: 20,
      final_decision: "BLOCKED_MBTI_QA_14_CONTENT_REVIEW_REQUIRED",
    });
  });

  it("reports current semantic/template blockers instead of silently passing thin assets", () => {
    const report = readJson<QaReport>(JSON_PATH);
    const expectedGates = [
      "structure_gate",
      "answer_surface_gate",
      "scenario_specificity_gate",
      "faq_gate",
      "template_marker_gate",
      "private_route_gate",
      "exact_duplicate_gate",
      "quick_judgment_gate",
    ];

    expect(report.id).toBe("MBTI-QA-14");
    expect(report.final_decision).toBe("BLOCKED_MBTI_QA_14_CONTENT_REVIEW_REQUIRED");
    expect(report.blockers).toHaveLength(53);
    expect(report.summary).toMatchObject({
      target_count: 78,
      pass_count: 25,
      blocked_count: 53,
      remaining58_count: 58,
      comparison20_count: 20,
      remaining58_pass_count: 25,
      comparison20_pass_count: 0,
      remaining58_blocked_count: 33,
      comparison20_blocked_count: 20,
      remaining58_min_faq_count: 9,
      comparison20_min_faq_count: 5,
    });

    expect(Object.keys(report.gate_totals)).toEqual(expectedGates);
    expect(report.gate_totals.structure_gate).toEqual({ passed: 78, failed: 0 });
    expect(report.gate_totals.private_route_gate).toEqual({ passed: 78, failed: 0 });
    expect(report.gate_totals.exact_duplicate_gate).toEqual({ passed: 78, failed: 0 });
    expect(report.gate_totals.quick_judgment_gate).toEqual({ passed: 20, failed: 0 });
    expect(report.gate_totals.answer_surface_gate.failed).toBe(29);
    expect(report.gate_totals.scenario_specificity_gate.failed).toBe(49);
    expect(report.gate_totals.faq_gate.failed).toBe(49);
    expect(report.gate_totals.template_marker_gate.failed).toBe(33);

    expect(report.page_results.some((row) => row.qa_decision === "PASS_SEMANTIC_DUPLICATE_GATE")).toBe(true);
    expect(report.page_results.some((row) => row.qa_decision === "BLOCKED_NEEDS_CONTENT_REVIEW")).toBe(true);
    expect(report.page_results.every((row) => row.gates.private_route_gate.status === "pass")).toBe(true);
    expect(report.page_results.every((row) => row.gates.exact_duplicate_gate.status === "pass")).toBe(true);
  });

  it("keeps remaining58 and comparison20 structurally distinct", () => {
    const report = readJson<QaReport>(JSON_PATH);
    const remainingRows = report.page_results.filter((row) => row.source_batch === "remaining58");
    const comparisonRows = report.page_results.filter((row) => row.source_batch === "comparison20");

    expect(remainingRows).toHaveLength(58);
    expect(comparisonRows).toHaveLength(20);
    expect(remainingRows.every((row) => row.page_type === "variant")).toBe(true);
    expect(comparisonRows.some((row) => row.page_type === "at_comparison")).toBe(true);
    expect(comparisonRows.some((row) => row.page_type === "hot_comparison")).toBe(true);
    expect(remainingRows.every((row) => row.module_count === 8)).toBe(true);
    expect(comparisonRows.every((row) => row.module_count === 6)).toBe(true);
  });

  it("stays artifact-only and avoids CMS, runtime, sitemap, llms, and deploy mutation", () => {
    const report = readJson<QaReport>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    });
  });

  it("supports temporary output paths for local dry-runs", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-qa-14-"));
    const outputJson = path.join(tempDir, "qa.json");
    const outputMd = path.join(tempDir, "qa.md");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as QaReport;

    expect(result.ok).toBe(false);
    expect(report.summary.target_count).toBe(78);
    expect(report.blockers).toHaveLength(53);
    expect(fs.existsSync(outputMd)).toBe(true);
  });

  it("keeps the PR scoped to QA-14 artifacts, contract, and train ledger", () => {
    const allowedExact = new Set([
      SCRIPT_PATH,
      JSON_PATH,
      MD_PATH,
      "tests/contracts/mbti-qa-14-semantic-duplicate-gate.contract.test.ts",
      "docs/codex/pr-train-state.json",
      "generated/pr-train-sidecar-issues/sidecar_issues.md",
      "generated/pr-train-sidecar-issues/sidecar_issues.json",
    ]);
    const changedFiles = committedScopeFiles();
    const touchesScope = changedFiles.some((file) => file.includes("mbti-qa-14-semantic-duplicate-gate"));

    if (!touchesScope) {
      expect(changedFiles.filter((file) => file.includes("mbti-qa-14-semantic-duplicate-gate"))).toEqual([]);
      return;
    }

    expect(changedFiles.filter((file) => !allowedExact.has(file))).toEqual([]);
  });
});
