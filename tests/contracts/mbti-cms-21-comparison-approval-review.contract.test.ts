import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-21-comparison-approval-review.mjs";
const JSON_PATH = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.csv";

type Review = {
  target_path: string;
  code: string;
  comparison_kind: "at_comparison" | "hot_cross_type_comparison";
  priority_rank: number | null;
  decision: "approved_for_final_dry_run" | "needs_revision";
  reasons: string[];
  checks: Array<{ key: string; status: "pass" | "fail" }>;
};

type Report = {
  id: string;
  final_decision: string;
  summary: {
    reviewed_comparison_count: number;
    approved_count: number;
    needs_revision_count: number;
    at_comparison_count: number;
    hot_cross_type_count: number;
  };
  cms_entry_standard: {
    required_field_mapping_keys: string[];
    required_section_keys: string[];
    required_faq_topics: string[];
  };
  approval_lists: {
    approved_for_final_dry_run: string[];
    needs_revision: Array<{ target_path: string; reasons: string[] }>;
  };
  hot_comparison_priority: Array<{
    rank: number;
    target_path: string;
    comparison_kind: string;
    comparison_pair: string[];
  }>;
  safety_boundary: Record<string, boolean>;
  reviews: Review[];
  blockers: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function changedScopeFiles(): string[] {
  const files = [
    ...execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
    ...execFileSync("git", ["diff", "--cached", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
    ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
  ];
  const ignoredRunnerDrift = [
    "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
    "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md",
  ];

  return [...new Set(files.map((line) => line.trim()).filter(Boolean))]
    .filter((file) => !ignoredRunnerDrift.includes(file))
    .sort();
}

describe("MBTI-CMS-21 comparison approval review", () => {
  it("regenerates the comparison approval review artifact", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-21-COMPARISON-APPROVAL-REVIEW",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      reviewed_comparison_count: 5,
      approved_count: 5,
      needs_revision_count: 0,
      final_decision: "PASS_COMPARISON_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN",
    });
  });

  it("approves the A/T and hot cross-type comparison records for final dry-run", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.id).toBe("MBTI-CMS-21");
    expect(report.final_decision).toBe("PASS_COMPARISON_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN");
    expect(report.summary).toEqual({
      reviewed_comparison_count: 5,
      approved_count: 5,
      needs_revision_count: 0,
      at_comparison_count: 1,
      hot_cross_type_count: 4,
    });
    expect(report.approval_lists.approved_for_final_dry_run).toEqual([
      "/zh/personality/intp-a-vs-intp-t",
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    expect(report.approval_lists.needs_revision).toEqual([]);
    expect(report.blockers).toEqual([]);
  });

  it("requires maximum difference, quick judgment table, confusion risk, scenario differences, do-not-misjudge, FAQ, and internal links", () => {
    const report = readJson<Report>(JSON_PATH);
    const requiredCheckKeys = [
      "field_mapping_complete",
      "comparison_pair_complete",
      "max_difference_present",
      "quick_judgment_table_present",
      "easy_misread_present",
      "real_scenario_differences_present",
      "do_not_misjudge_present",
      "comparison_section_set_complete",
      "faq_complete",
      "internal_link_loop_complete",
      "seo_fields_present",
      "method_boundary_clean",
      "indexability_still_held",
      "production_write_blocked",
    ];

    expect(report.cms_entry_standard.required_section_keys).toEqual([
      "direct_answer",
      "quick_judgment_table",
      "easy_misread",
      "real_scenario_differences",
      "do_not_misjudge",
      "next_reading",
    ]);
    expect(report.cms_entry_standard.required_faq_topics).toContain("non-diagnostic/non-decision boundary");

    for (const review of report.reviews) {
      expect(review.decision).toBe("approved_for_final_dry_run");
      expect(review.reasons).toEqual([]);
      expect(review.checks.map((check) => check.key)).toEqual(requiredCheckKeys);
      expect(review.checks.every((check) => check.status === "pass")).toBe(true);
    }
  });

  it("emits the hot comparison priority in the expected order", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.hot_comparison_priority.map((item) => item.target_path)).toEqual([
      "/zh/personality/intp-a-vs-intp-t",
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    expect(report.hot_comparison_priority.map((item) => item.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps CMS writes, frontend fallback, indexability, GSC, and deploy out of scope", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      comparison_review_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    });
  });

  it("emits readable markdown and CSV outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, MD_PATH), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

    expect(md).toContain("# MBTI-CMS-21 Comparison Approval Review");
    expect(md).toContain("## Approved For Final Dry-Run");
    expect(md).toContain("- /zh/personality/intp-a-vs-intp-t");
    expect(md).toContain("## Hot Comparison Priority");
    expect(md).toContain("## Needs Revision\n\n- None.");
    expect(csv.split("\n")[0]).toBe(
      ["target_path", "code", "comparison_kind", "priority_rank", "decision", "failed_checks", "required_next_action"].join(","),
    );
  });

  it("supports temporary output paths for local dry-run validation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-cms-21-"));
    const outputJson = path.join(tempDir, "cms-21.json");
    const outputMd = path.join(tempDir, "cms-21.md");
    const outputCsv = path.join(tempDir, "cms-21.csv");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`, `--output-csv=${outputCsv}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as Report;

    expect(result.ok).toBe(true);
    expect(report.summary.needs_revision_count).toBe(0);
    expect(fs.existsSync(outputMd)).toBe(true);
    expect(fs.existsSync(outputCsv)).toBe(true);
  });

  it("keeps the current worktree scoped to CMS-21 artifacts, script, test, and train ledger", () => {
    const changed = changedScopeFiles();
    const allowed = [
      /^docs\/codex\/pr-train-state\.json$/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/seo\/personality\/mbti-cms-21-/,
      /^scripts\/seo\/build-mbti-cms-21-/,
      /^tests\/contracts\/mbti-cms-21-/,
      /^generated\/pr-train-sidecar-issues\//,
    ];

    expect(changed.every((file) => allowed.some((pattern) => pattern.test(file)))).toBe(true);
  });
});
