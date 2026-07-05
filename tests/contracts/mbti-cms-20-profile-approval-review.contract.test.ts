import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-20-profile-approval-review.mjs";
const JSON_PATH = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.csv";

type Review = {
  target_path: string;
  code: string;
  import_candidate: boolean;
  decision: "approved_for_final_dry_run" | "approved_verify_only" | "needs_revision";
  reasons: string[];
  checks: Array<{ key: string; status: "pass" | "fail" }>;
};

type Report = {
  id: string;
  final_decision: string;
  summary: {
    reviewed_profile_count: number;
    approved_count: number;
    approved_import_candidate_count: number;
    verify_only_approved_count: number;
    needs_revision_count: number;
  };
  cms_entry_standard: {
    required_field_mapping_keys: string[];
    required_section_keys: string[];
    required_faq_topics: string[];
  };
  approval_lists: {
    approved_for_final_dry_run: string[];
    approved_verify_only: string[];
    needs_revision: Array<{ target_path: string; reasons: string[] }>;
  };
  safety_boundary: Record<string, boolean>;
  reviews: Review[];
  blockers: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function committedScopeFiles(): string[] {
  try {
    return execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .sort();
  } catch {
    return [];
  }
}

describe("MBTI-CMS-20 profile approval review", () => {
  it("regenerates the profile approval review artifact", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-20-PROFILE-APPROVAL-REVIEW",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      reviewed_profile_count: 5,
      approved_import_candidate_count: 4,
      verify_only_approved_count: 1,
      needs_revision_count: 0,
      final_decision: "PASS_PROFILE_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN",
    });
  });

  it("approves only profile import candidates that satisfy CMS entry standards", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.id).toBe("MBTI-CMS-20");
    expect(report.final_decision).toBe("PASS_PROFILE_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN");
    expect(report.summary).toEqual({
      reviewed_profile_count: 5,
      approved_count: 5,
      approved_import_candidate_count: 4,
      verify_only_approved_count: 1,
      needs_revision_count: 0,
    });
    expect(report.approval_lists.approved_for_final_dry_run).toEqual([
      "/zh/personality/istj-a",
      "/zh/personality/istp-a",
      "/zh/personality/isfp-a",
      "/zh/personality/esfj-a",
    ]);
    expect(report.approval_lists.approved_verify_only).toEqual(["/zh/personality/intp-a"]);
    expect(report.approval_lists.needs_revision).toEqual([]);
    expect(report.blockers).toEqual([]);
  });

  it("checks answer blocks, A/T differences, scenarios, FAQ, field mapping, and internal links", () => {
    const report = readJson<Report>(JSON_PATH);
    const importReviews = report.reviews.filter((review) => review.import_candidate);
    const requiredCheckKeys = [
      "field_mapping_complete",
      "direct_answer_present",
      "profile_section_set_complete",
      "fit_and_misfit_present",
      "common_misunderstanding_present",
      "at_difference_table_present",
      "career_relationship_pressure_present",
      "faq_complete",
      "internal_link_loop_complete",
      "seo_fields_present",
      "method_boundary_clean",
      "indexability_still_held",
      "production_write_blocked",
    ];

    expect(report.cms_entry_standard.required_section_keys).toEqual([
      "direct_answer",
      "who_it_fits",
      "who_it_does_not_fit",
      "common_misunderstanding",
      "at_difference",
      "career_scenario",
      "relationship_scenario",
      "stress_scenario",
    ]);
    expect(report.cms_entry_standard.required_faq_topics).toContain("non-diagnostic/non-hiring boundary");

    for (const review of importReviews) {
      expect(review.decision).toBe("approved_for_final_dry_run");
      expect(review.reasons).toEqual([]);
      expect(review.checks.map((check) => check.key)).toEqual(requiredCheckKeys);
      expect(review.checks.every((check) => check.status === "pass")).toBe(true);
    }
  });

  it("keeps INTP-A as verify-only rather than body import", () => {
    const report = readJson<Report>(JSON_PATH);
    const intpA = report.reviews.find((review) => review.target_path === "/zh/personality/intp-a");

    expect(intpA).toMatchObject({
      target_path: "/zh/personality/intp-a",
      import_candidate: false,
      decision: "approved_verify_only",
      reasons: [],
    });
    expect(intpA?.checks.map((check) => check.key)).toEqual([
      "verify_only_boundary",
      "verify_only_internal_links",
      "production_write_blocked",
    ]);
  });

  it("keeps CMS writes, frontend fallback, indexability, GSC, and deploy out of scope", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      profile_review_only: true,
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

  it("emits readable markdown and CSV approval outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, MD_PATH), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

    expect(md).toContain("# MBTI-CMS-20 Profile Approval Review");
    expect(md).toContain("## Approved For Final Dry-Run");
    expect(md).toContain("- /zh/personality/istj-a");
    expect(md).toContain("## Needs Revision\n\n- None.");
    expect(csv.split("\n")[0]).toBe(
      ["target_path", "code", "decision", "import_candidate", "failed_checks", "required_next_action"].join(","),
    );
  });

  it("supports temporary output paths for local dry-run validation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-cms-20-"));
    const outputJson = path.join(tempDir, "cms-20.json");
    const outputMd = path.join(tempDir, "cms-20.md");
    const outputCsv = path.join(tempDir, "cms-20.csv");
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

  it("keeps the PR scoped to CMS-20 artifacts, test, script, and train ledger", () => {
    const state = readJson<{ current_pr?: string }>("docs/codex/pr-train-state.json");

    if (state.current_pr !== "MBTI-CMS-20") {
      expect(state.current_pr).toBeTruthy();
      return;
    }

    const changed = committedScopeFiles();
    const allowed = [
      /^docs\/codex\/pr-train-state\.json$/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/seo\/personality\/mbti-cms-20-/,
      /^scripts\/seo\/build-mbti-cms-20-/,
      /^tests\/contracts\/mbti-cms-20-/,
      /^generated\/pr-train-sidecar-issues\//,
    ];

    expect(changed.every((file) => allowed.some((pattern) => pattern.test(file)))).toBe(true);
  });
});
