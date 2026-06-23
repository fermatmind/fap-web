import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/career-graph/riasec-career-graph-bridge-matrix.v1.json";
const REPORT_PATH = "docs/career-graph/riasec-career-graph-bridge-matrix-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json";
const SOURCE_PACKET_PATH = "docs/career-graph/riasec-career-graph-source-authority-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/career-graph/riasec-career-graph-claim-safety-packet.v1.json";
const CANDIDATE_PACKET_PATH = "docs/career-graph/riasec-career-graph-candidate-cluster-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

describe("RIASEC Career Graph bridge readiness matrix", () => {
  it("declares aggregate planning readiness while preserving runtime holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const summary = asRecord(matrix.readiness_summary);

    expect(matrix.schema_version).toBe("fermatmind.riasec_career_graph_bridge_matrix.v1");
    expect(matrix.task_id).toBe("RIASEC-CAREER-GRAPH-BRIDGE-MATRIX-01");
    expect(matrix.verdict).toBe("READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS");
    expect(matrix.run_mode).toBe("docs_contracts_only");
    expect(summary.aggregate_bridge).toBe("READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS");
    expect(summary.runtime_recommendation).toBe("BLOCKED");
    expect(summary.cms_publish_search).toBe("HOLD");
    expect(summary.private_or_raw_result_data).toBe("BLOCKED");
    expect(summary.career_graph_runtime_mutation).toBe("HOLD");
  });

  it("consumes all four upstream bridge packets", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const source = readJson(SOURCE_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const candidate = readJson(CANDIDATE_PACKET_PATH);
    const dependencies = asRecordArray(matrix.dependencies);

    expect(common.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(source.verdict).toBe("MAPPED_PARTIAL");
    expect(claim.verdict).toBe("READY_TO_BLOCK_UNSAFE_OUTPUTS");
    expect(candidate.verdict).toBe("PLANNING_ONLY");
    expect(dependencies.map((dependency) => dependency.task_id)).toEqual([
      "RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01",
      "RIASEC-CAREER-GRAPH-SOURCE-AUTHORITY-PACKET-01",
      "RIASEC-CAREER-GRAPH-CLAIM-SAFETY-PACKET-01",
      "RIASEC-CAREER-GRAPH-CANDIDATE-CLUSTER-PACKET-01",
    ]);
    expect(dependencies.map((dependency) => dependency.status)).toEqual(["MERGED", "MERGED", "MERGED", "MERGED"]);
  });

  it("separates planning-ready lanes from hold and blocked lanes", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.bridge_matrix);
    const statusByLane = new Map(rows.map((row) => [String(row.lane), String(row.status)]));

    expect(rows.length).toBe(7);
    expect(statusByLane.get("public_riasec_projection_to_exploration_language")).toBe("READY_FOR_PLANNING_HANDOFF");
    expect(statusByLane.get("candidate_cluster_planning")).toBe("READY_FOR_PLANNING_HANDOFF");
    expect(statusByLane.get("backend_reviewed_career_or_major_examples")).toBe(
      "HOLD_PENDING_BACKEND_AUTHORITY_AND_REVIEW_LEDGER"
    );
    expect(statusByLane.get("cms_dry_run_package")).toBe("HOLD_PENDING_SEPARATE_AUTHORIZATION");
    expect(statusByLane.get("runtime_recommendation_or_career_graph_mutation")).toBe("BLOCKED");
    expect(statusByLane.get("search_sitemap_llms_or_provider_mutation")).toBe("BLOCKED");
    expect(statusByLane.get("private_or_raw_result_data")).toBe("BLOCKED");
  });

  it("keeps every lane explicit about gates and hard holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.bridge_matrix);

    for (const row of rows) {
      expect(row).toHaveProperty("lane");
      expect(row).toHaveProperty("status");
      expect(row).toHaveProperty("allowed_inputs");
      expect(row).toHaveProperty("allowed_outputs");
      expect(row).toHaveProperty("required_gates");
      expect(row).toHaveProperty("hard_holds");
      expect(asStringArray(row.required_gates).length).toBeGreaterThan(0);
      expect(asStringArray(row.hard_holds).length).toBeGreaterThan(0);
    }
  });

  it("blocks runtime recommendation, graph mutation, search mutation, provider calls, deploy, and private inputs", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.bridge_matrix);
    const runtime = rows.find((row) => row.lane === "runtime_recommendation_or_career_graph_mutation");
    const search = rows.find((row) => row.lane === "search_sitemap_llms_or_provider_mutation");
    const privateData = rows.find((row) => row.lane === "private_or_raw_result_data");

    expect(runtime?.status).toBe("BLOCKED");
    expect(asStringArray(runtime?.hard_holds)).toEqual(
      expect.arrayContaining(["no_deterministic_career_recommendation", "no_job_fit_score", "no_career_graph_runtime_mutation"])
    );
    expect(search?.status).toBe("BLOCKED");
    expect(asStringArray(search?.hard_holds)).toEqual(
      expect.arrayContaining(["no_sitemap_mutation", "no_llms_mutation", "no_search_submission", "no_provider_calls", "no_deploy"])
    );
    expect(privateData?.status).toBe("BLOCKED");
    expect(asStringArray(privateData?.hard_holds)).toEqual(
      expect.arrayContaining(["no_raw_item_answers", "no_raw_scores", "no_score_vectors", "no_private_attempt_id"])
    );
  });

  it("defines the next planning handoff without authorizing execution mutations", () => {
    const matrix = readJson(MATRIX_PATH);
    const handoff = asRecord(matrix.next_handoff);

    expect(handoff.recommended_next_task).toBe("RIASEC-GAOKAO-MAJOR-CLUSTER-PLAN-01");
    expect(handoff.handoff_status).toBe("planning_only_allowed");
    expect(handoff.must_remain_read_only_until_authorized).toBe(true);
    expect(asStringArray(handoff.required_inputs_before_execution)).toEqual(
      expect.arrayContaining([
        "backend_major_cluster_authority",
        "backend_authority_review_ledger",
        "claim_privacy_safety_gate_review",
        "explicit_manifest_state_authorization_if_promoted_to_PR_train",
      ])
    );
    expect(asStringArray(handoff.blocked_until_separate_approval)).toEqual(
      expect.arrayContaining(["cms_write", "publish", "generated_pages", "runtime_recommendation", "search_submission", "deploy"])
    );
  });

  it("preserves forbidden claims and negative guarantees", () => {
    const matrix = readJson(MATRIX_PATH);
    const guarantees = asRecord(matrix.negative_guarantees);

    expect(asStringArray(matrix.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "deterministic_career_recommendation",
        "best_career_for_you",
        "best_major_for_you",
        "admissions_prediction",
        "hiring_prediction",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "ability_measurement",
        "job_fit_score",
        "occupation_ranking_as_objective_truth",
        "raw_score_to_career_recommendation",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.deterministic_recommendation_included).toBe(false);
    expect(guarantees.career_graph_runtime_mutation).toBe("none");
  });

  it("keeps markdown aligned with the matrix verdict and holds", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS`");
    expect(report).toContain("Candidate cluster planning: `READY_FOR_PLANNING_HANDOFF`");
    expect(report).toContain("Runtime recommendation or Career Graph mutation: `BLOCKED`");
    expect(report).toContain("Recommended next planning task: `RIASEC-GAOKAO-MAJOR-CLUSTER-PLAN-01`");
    expect(report).toContain("deterministic recommendation included: false");
  });

  it("keeps current branch scope limited to PR5 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_CAREER_GRAPH_BRIDGE_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-career-graph-bridge-matrix-01");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-bridge-matrix-2026-06-23.md");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-bridge-matrix.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-career-graph-bridge-matrix.contract.test.ts");
  });
});
