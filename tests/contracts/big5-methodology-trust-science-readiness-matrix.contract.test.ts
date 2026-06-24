import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/methodology-trust-science/big5-methodology-trust-science-readiness-matrix.v1.json";
const REPORT_PATH = "docs/methodology-trust-science/big5-methodology-trust-science-readiness-matrix-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/methodology-trust-science/big5-methodology-trust-science-common-contract.v1.json";
const SOURCE_PACKET_PATH = "docs/methodology-trust-science/big5-methodology-source-authority-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/methodology-trust-science/big5-methodology-claim-privacy-safety-packet.v1.json";
const CANDIDATE_MATRIX_PATH = "docs/methodology-trust-science/big5-methodology-candidate-cluster-matrix.v1.json";
const STATE_PATH = "docs/codex/pr-train-state.json";

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

describe("Big Five methodology/trust/science readiness matrix", () => {
  it("declares aggregate planning readiness while preserving runtime holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const summary = asRecord(matrix.readiness_summary);

    expect(matrix.schema_version).toBe("fermatmind.big5_methodology_trust_science.readiness_matrix.v1");
    expect(matrix.task_id).toBe("BIG5-METHODOLOGY-TRUST-SCIENCE-READINESS-MATRIX-01");
    expect(matrix.verdict).toBe("READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS");
    expect(matrix.run_mode).toBe("docs_contracts_only");
    expect(summary.aggregate_handoff).toBe("READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS");
    expect(summary.cms_dry_run).toBe("HOLD_PENDING_SEPARATE_AUTHORIZATION");
    expect(summary.generated_pages).toBe("BLOCKED");
    expect(summary.runtime_mutation).toBe("BLOCKED");
    expect(summary.analytics_instrumentation).toBe("BLOCKED");
    expect(summary.private_or_raw_result_data).toBe("BLOCKED");
    expect(summary.fap_api_mutation).toBe("BLOCKED");
  });

  it("consumes all upstream Big Five methodology packets", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const source = readJson(SOURCE_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const candidate = readJson(CANDIDATE_MATRIX_PATH);
    const dependencies = asRecordArray(matrix.dependencies);

    expect(common.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(source.verdict).toBe("SOURCE_AUTHORITY_MAPPED_FOR_PLANNING_ONLY");
    expect(claim.verdict).toBe("SAFETY_PACKET_READY_FOR_PLANNING_ONLY");
    expect(candidate.verdict).toBe("PLANNING_ONLY");
    expect(dependencies.map((dependency) => dependency.task_id)).toEqual([
      "BIG5-METHODOLOGY-TRUST-SCIENCE-COMMON-CONTRACT-01",
      "BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01",
      "BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01",
      "BIG5-METHODOLOGY-CANDIDATE-CLUSTER-MATRIX-01",
    ]);
    expect(dependencies.map((dependency) => dependency.status)).toEqual(["MERGED", "MERGED", "MERGED", "MERGED"]);
  });

  it("separates planning-ready, hold, and blocked lanes", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.readiness_matrix);
    const statusByLane = new Map(rows.map((row) => [String(row.lane), String(row.status)]));

    expect(rows.length).toBe(8);
    expect(statusByLane.get("methodology_trust_science_planning_handoff")).toBe("READY_FOR_NEXT_PLANNING_HANDOFF");
    expect(statusByLane.get("public_contentpage_source_ledger")).toBe("HOLD_PENDING_PUBLIC_METHODOLOGY_SOURCE_LEDGER");
    expect(statusByLane.get("claim_privacy_safety_gate")).toBe("READY_TO_BLOCK_UNSAFE_OUTPUTS");
    expect(statusByLane.get("candidate_cluster_planning")).toBe("READY_FOR_PLANNING_HANDOFF");
    expect(statusByLane.get("cms_dry_run_publish_and_search")).toBe("HOLD_PENDING_SEPARATE_AUTHORIZATION");
    expect(statusByLane.get("runtime_deploy_provider_and_analytics_mutation")).toBe("BLOCKED");
    expect(statusByLane.get("private_or_raw_result_data")).toBe("BLOCKED");
    expect(statusByLane.get("next_planning_handoff")).toBe("READY_FOR_READ_ONLY_SCAN");
  });

  it("keeps every lane explicit about gates and hard holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.readiness_matrix);

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

  it("blocks CMS/search/runtime/analytics/provider/deploy/backend and private inputs", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.readiness_matrix);
    const cms = rows.find((row) => row.lane === "cms_dry_run_publish_and_search");
    const runtime = rows.find((row) => row.lane === "runtime_deploy_provider_and_analytics_mutation");
    const privateData = rows.find((row) => row.lane === "private_or_raw_result_data");

    expect(cms?.status).toBe("HOLD_PENDING_SEPARATE_AUTHORIZATION");
    expect(asStringArray(cms?.hard_holds)).toEqual(
      expect.arrayContaining(["no_cms_write", "no_publish", "no_sitemap_mutation", "no_llms_mutation", "no_search_submission"])
    );
    expect(runtime?.status).toBe("BLOCKED");
    expect(asStringArray(runtime?.hard_holds)).toEqual(
      expect.arrayContaining(["no_runtime_code_change", "no_provider_calls", "no_deploy", "no_analytics_instrumentation", "no_fap_api_mutation"])
    );
    expect(privateData?.status).toBe("BLOCKED");
    expect(asStringArray(privateData?.hard_holds)).toEqual(
      expect.arrayContaining(["no_attempt_id", "no_user_id", "no_raw_ocean_scores", "no_score_vectors", "no_private_report_text"])
    );
  });

  it("defines the next handoff as read-only source ledger readiness planning", () => {
    const matrix = readJson(MATRIX_PATH);
    const handoff = asRecord(matrix.next_handoff);

    expect(handoff.recommended_next_task).toBe("BIG5-METHODOLOGY-SOURCE-LEDGER-READINESS-SCAN-01");
    expect(handoff.handoff_status).toBe("read_only_scan_allowed");
    expect(handoff.must_remain_read_only_until_authorized).toBe(true);
    expect(asStringArray(handoff.required_inputs_before_execution)).toEqual(
      expect.arrayContaining([
        "public_methodology_source_ledger_plan",
        "cms_backend_content_page_authority_review",
        "claim_privacy_safety_gate_review",
        "explicit_manifest_state_authorization_if_promoted_to_PR_train",
      ])
    );
    expect(asStringArray(handoff.blocked_until_separate_approval)).toEqual(
      expect.arrayContaining(["cms_write", "publish", "generated_pages", "runtime_mutation", "analytics_instrumentation", "search_submission", "deploy"])
    );
  });

  it("preserves forbidden claims and negative guarantees", () => {
    const matrix = readJson(MATRIX_PATH);
    const guarantees = asRecord(matrix.negative_guarantees);

    expect(asStringArray(matrix.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "raw_ocean_score_claim",
        "percentile_guarantee",
        "official_32_type_claim",
        "fixed_type_claim",
        "unsupported_psychometric_superiority_claim",
        "diagnosis",
        "therapy",
        "hiring_prediction",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "private_report_text_rewrite",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.analytics_instrumentation).toBe("none");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.backend_asset_agent_command).toBe("none");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.deterministic_trait_assignment_included).toBe(false);
    expect(guarantees.schema_or_indexability_changed).toBe(false);
  });

  it("keeps markdown aligned with the matrix verdict and holds", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS`");
    expect(report).toContain("Methodology/trust/science planning handoff: `READY_FOR_NEXT_PLANNING_HANDOFF`");
    expect(report).toContain("Runtime, deploy, provider, analytics, and fap-api mutation: `BLOCKED`");
    expect(report).toContain("Recommended next planning task: `BIG5-METHODOLOGY-SOURCE-LEDGER-READINESS-SCAN-01`");
    expect(report).toContain("deterministic trait assignment included: false");
  });

  it("registers PR5 state as an in-flight docs/contracts-only PR", () => {
    const state = readJson(STATE_PATH);
    const prs = Array.isArray(state.prs) ? state.prs.map(asRecord) : [];
    const pr5 = prs.find((pr) => pr.id === "BIG5-METHODOLOGY-TRUST-SCIENCE-READINESS-MATRIX-01");

    expect([
      "implementation_in_progress",
      "local_checks_passed_ready_for_pr",
      "pr_open_checks_pending",
      "ready_to_merge",
    ]).toContain(pr5?.status);
    expect(pr5?.pr_url === null || String(pr5?.pr_url).startsWith("https://github.com/fermatmind/fap-web/pull/")).toBe(
      true
    );
    expect(pr5).toMatchObject({
      merged_at: null,
      remote_branch_deleted: false,
      local_cleanup_executed: false,
    });
  });
});
