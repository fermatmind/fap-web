import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-full-qa-36-semantic-release-gate.mjs";
const OUTPUT = "docs/seo/personality/mbti-full-qa-36-semantic-release-gate-2026-07-13.json";

type Gate = { status: "pass" | "fail"; evidence: string; failures: string[] };
type Row = { path: string; kind: "profile" | "at_comparison" | "hot_comparison"; change_mode: "repair" | "verify_only"; qa_decision: string; failed_gates: string[]; gates: Record<string, Gate> };
type Report = { id: string; final_decision: string; summary: { target_count: number; profile_count: number; at_comparison_count: number; hot_cross_type_count: number; repair_count: number; verify_only_count: number; schema_pass_count: number; private_boundary_pass_count: number; duplicate_blocker_count: number; unsupported_or_deterministic_blocker_count: number; approved_for_cms_dry_run_count: number; verify_only_pass_count: number }; page_results: Row[]; safety_boundary: Record<string, boolean>; cross_type_repair_required: unknown[] };

function report(): Report {
  return JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8")) as Report;
}

describe("MBTI-FULL-QA-36 semantic release gate", () => {
  it("builds a fixed 52 URL Chinese MBTI cohort with the authorized repair split", () => {
    const output = JSON.parse(execFileSync("node", [SCRIPT], { cwd: ROOT, encoding: "utf8" }));
    expect(output).toMatchObject({ ok: true, artifact: "MBTI-FULL-QA-36-SEMANTIC-RELEASE-GATE", final_decision: "PASS_MBTI_FULL_QA_36_CMS_DRY_RUN_READY", target_count: 52, profile_count: 32, at_comparison_count: 16, hot_cross_type_count: 4, repair_count: 43, verify_only_count: 9 });
  });

  it("passes every schema, private-boundary, duplicate, claim, and CMS dry-run preflight gate", () => {
    const value = report();
    expect(value.id).toBe("MBTI-FULL-QA-36");
    expect(value.final_decision).toBe("PASS_MBTI_FULL_QA_36_CMS_DRY_RUN_READY");
    expect(value.page_results).toHaveLength(52);
    expect(new Set(value.page_results.map((row) => row.path)).size).toBe(52);
    expect(value.summary).toMatchObject({ schema_pass_count: 52, private_boundary_pass_count: 52, duplicate_blocker_count: 0, unsupported_or_deterministic_blocker_count: 0, approved_for_cms_dry_run_count: 43, verify_only_pass_count: 9 });
    expect(value.page_results.every((row) => row.failed_gates.length === 0)).toBe(true);
    expect(value.page_results.filter((row) => row.change_mode === "repair").every((row) => row.qa_decision === "APPROVED_FOR_CMS_DRY_RUN")).toBe(true);
  });

  it("keeps the four cross-type pages verify-only and reports a separate repair requirement if their contract fails", () => {
    const cross = report().page_results.filter((row) => row.kind === "hot_comparison");
    expect(cross).toHaveLength(4);
    expect(cross.every((row) => row.change_mode === "verify_only" && row.gates.cross_type_differentiation_gate.status === "pass")).toBe(true);
    expect(report().cross_type_repair_required).toEqual([]);
  });

  it("is artifact-only and does not write CMS, change runtime authority, mutate feeds, submit GSC, or deploy", () => {
    expect(report().safety_boundary).toMatchObject({ artifact_only: true, cms_write_attempted: false, production_import_attempted: false, db_migration_attempted: false, frontend_runtime_change_attempted: false, frontend_local_editorial_fallback_added: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false });
  });
});
