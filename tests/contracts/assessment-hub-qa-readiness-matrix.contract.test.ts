import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/assessment-hub/assessment-hub-qa-readiness-matrix.v1.json";
const REPORT_PATH = "docs/assessment-hub/assessment-hub-qa-readiness-matrix-2026-06-24.md";
const COMMON_CONTRACT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json";
const METADATA_PACKET_PATH = "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet.v1.json";
const TAKE_FLOW_PACKET_PATH = "docs/assessment-hub/assessment-hub-take-flow-cta-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/assessment-hub/assessment-hub-free-full-report-claim-packet.v1.json";
const SOURCE_PACKET_PATH = "docs/assessment-hub/assessment-hub-source-authority-indexability-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
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

describe("Assessment Hub QA readiness matrix", () => {
  it("consumes all Assessment Hub QA packets and records the final PARTIAL/no-HOLD verdict", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const metadata = readJson(METADATA_PACKET_PATH);
    const takeFlow = readJson(TAKE_FLOW_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const source = readJson(SOURCE_PACKET_PATH);
    const summary = asRecord(matrix.rollup_summary);

    expect(matrix.schema_version).toBe("fermatmind.assessment_hub_qa.readiness_matrix.v1");
    expect(matrix.task_id).toBe("ASSESSMENT-HUB-QA-READINESS-MATRIX-01");
    expect(matrix.consumes_common_contract).toBe(common.task_id);
    expect(matrix.consumes_route_metadata_packet).toBe(metadata.task_id);
    expect(matrix.consumes_take_flow_cta_packet).toBe(takeFlow.task_id);
    expect(matrix.consumes_free_full_report_claim_packet).toBe(claim.task_id);
    expect(matrix.consumes_source_authority_indexability_packet).toBe(source.task_id);
    expect(matrix.verdict).toBe("PARTIAL_READY_WITH_P2_COPY_RISKS_NO_HARD_HOLD");
    expect(summary).toMatchObject({
      route_count: 12,
      scale_count: 6,
      packet_count: 5,
      hard_hold_count: 0,
      pass_route_count: 2,
      partial_route_count: 10,
      p2_paid_unlock_disabled_copy_surfaces: 8,
      p2_full_result_or_full_report_claim_surfaces: 4,
      certificate_or_answer_key_claim_surfaces: 0,
      indexability_pass_count: 12,
      take_flow_actual_cta_get_pass_count: 22,
      sidecar_issue_count: 0,
      overall_status: "PARTIAL_NO_HARD_HOLD",
      merge_allowed_after_checks: true,
    });
  });

  it("rolls up packet readiness and preserves P2 copy risks as PARTIAL", () => {
    const matrix = readJson(MATRIX_PATH);
    const packetRollup = asRecordArray(matrix.packet_rollup);
    const readinessRows = asRecordArray(matrix.readiness_rows);
    const counts = asRecord(matrix.readiness_counts);

    expect(packetRollup.map((packet) => packet.readiness)).toEqual(["PASS", "PASS", "PASS", "PARTIAL", "PASS"]);
    expect(packetRollup.find((packet) => packet.task_id === "ASSESSMENT-HUB-FREE-FULL-REPORT-CLAIM-PACKET-01")).toMatchObject({
      readiness: "PARTIAL",
    });
    expect(readinessRows).toHaveLength(12);
    expect(readinessRows.filter((row) => row.readiness_status === "PASS")).toHaveLength(2);
    expect(readinessRows.filter((row) => row.readiness_status === "PARTIAL_RECORDED_P2_COPY_RISK")).toHaveLength(10);
    expect(readinessRows.every((row) => row.hard_hold === false)).toBe(true);
    expect(counts).toMatchObject({
      PASS: 2,
      PARTIAL_RECORDED_P2_COPY_RISK: 10,
      hard_hold_count: 0,
    });
  });

  it("keeps hard holds closed for mutation surfaces while allowing docs/contracts merge", () => {
    const matrix = readJson(MATRIX_PATH);
    const holdPolicy = asRecord(matrix.hold_policy);
    const negative = asRecord(matrix.negative_guarantees);
    const nextSafeTasks = asRecordArray(matrix.next_safe_tasks);

    expect(holdPolicy).toMatchObject({
      hard_hold_count: 0,
      merge_hold: false,
      runtime_or_cms_mutation_hold: true,
      search_submission_hold: true,
      deployment_hold: true,
      private_data_access_hold: true,
    });
    expect(negative).toMatchObject({
      runtime_code_changed: false,
      frontend_public_copy_changed: false,
      cms_write_performed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      sitemap_or_llms_or_schema_mutated: false,
      private_attempt_or_result_accessed: false,
      post_start_submit_result_called: false,
      fap_api_modified: false,
    });
    expect(nextSafeTasks.map((task) => task.task_id)).toEqual([
      "SIX-HUB-SEO-GEO-PACKAGE-PLANNING-SCAN-01",
      "ASSESSMENT_HUB_P2_COPY_AUTHORITY_FOLLOWUP",
    ]);
    expect(matrix.sidecar_issues).toEqual([]);
  });

  it("keeps markdown, state, and branch scope aligned", () => {
    const report = readText(REPORT_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    const entry = stateEntries.find((item) => item.id === "ASSESSMENT-HUB-QA-READINESS-MATRIX-01");
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(report).toContain("Verdict: `PARTIAL_READY_WITH_P2_COPY_RISKS_NO_HARD_HOLD`");
    expect(report).toContain("Hard holds: `0`");
    expect(report).toContain("After PR6 merge and cleanup, stop the Assessment Hub QA train");
    expect(entry).toBeTruthy();
    expect(scopeHelper).toContain("ASSESSMENT_HUB_QA_READINESS_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-qa-readiness-matrix-01");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-qa-readiness-matrix.contract.test.ts");
  });
});
