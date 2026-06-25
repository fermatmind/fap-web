import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/assessment-hub/assessment-hub-free-full-report-claim-packet.v1.json";
const REPORT_PATH = "docs/assessment-hub/assessment-hub-free-full-report-claim-packet-2026-06-24.md";
const COMMON_CONTRACT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json";
const TAKE_FLOW_PACKET_PATH = "docs/assessment-hub/assessment-hub-take-flow-cta-packet.v1.json";
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

describe("Assessment Hub free/full report claim packet", () => {
  it("consumes the common and take-flow packets and records the P2-risk PASS verdict", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const takeFlow = readJson(TAKE_FLOW_PACKET_PATH);
    const summary = asRecord(packet.scope_summary);

    expect(packet.schema_version).toBe("fermatmind.assessment_hub_qa.free_full_report_claim_packet.v1");
    expect(packet.task_id).toBe("ASSESSMENT-HUB-FREE-FULL-REPORT-CLAIM-PACKET-01");
    expect(packet.consumes_common_contract).toBe(common.task_id);
    expect(packet.consumes_take_flow_cta_packet).toBe(takeFlow.task_id);
    expect(packet.verdict).toBe("PASS_WITH_P2_COPY_RISKS_RECORDED");
    expect(summary).toMatchObject({
      landing_pages_checked: 12,
      public_get_status_200: 12,
      free_or_free_test_claim_surfaces: 12,
      full_result_or_full_report_claim_surfaces: 4,
      paid_unlock_disabled_copy_surfaces: 8,
      diagnosis_or_outcome_disclaimer_surfaces: 12,
      certificate_or_answer_key_claim_surfaces: 0,
      status: "PASS_WITH_P2_COPY_RISKS_RECORDED",
    });
  });

  it("classifies all 12 surfaces and records P2 risks without changing runtime copy", () => {
    const packet = readJson(PACKET_PATH);
    const surfaces = asRecordArray(packet.surface_classifications);
    const risks = asRecordArray(packet.risk_taxonomy);
    const negative = asRecord(packet.negative_guarantees);

    expect(surfaces).toHaveLength(12);
    expect(new Set(surfaces.map((surface) => surface.scale_code))).toEqual(
      new Set(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "RIASEC", "IQ_RAVEN", "EQ_60"])
    );
    expect(surfaces.filter((surface) => Boolean(surface.full_result_claim))).toHaveLength(4);
    expect(surfaces.filter((surface) => surface.paid_unlock_disabled_copy === true)).toHaveLength(8);
    expect(surfaces.filter((surface) => String(surface.risk_level).includes("P2"))).toHaveLength(10);
    expect(risks.map((risk) => risk.id)).toEqual([
      "P2_PAID_UNLOCK_DISABLED_COPY_RISK",
      "P2_FULL_RESULT_CLAIM_AUTHORITY_REVIEW",
      "P2_MANUAL_REVIEW_REQUIRED_FOR_CERTIFICATE_OR_ANSWER_KEY_CLAIMS",
    ]);
    expect(negative).toMatchObject({
      runtime_code_changed: false,
      frontend_public_copy_changed: false,
      cms_write_performed: false,
      search_submission_performed: false,
      private_attempt_or_result_accessed: false,
      post_start_submit_result_called: false,
      payment_order_or_entitlement_changed: false,
      fap_api_modified: false,
    });
  });

  it("blocks forbidden claim classes and defers authority decisions", () => {
    const packet = readJson(PACKET_PATH);
    const forbidden = asRecord(packet.forbidden_claim_scan);
    const serialized = JSON.stringify(packet);

    expect(forbidden).toMatchObject({
      official_certificate_claim_observed: false,
      answer_key_claim_observed: false,
      diagnostic_or_clinical_claim_observed: false,
      hiring_admission_salary_or_life_outcome_guarantee_claim_observed: false,
      private_or_paid_result_payload_accessed: false,
    });
    expect(serialized).toContain("RECORDED_FOR_SOURCE_AUTHORITY_PACKET");
    expect(serialized).toContain("RECORDED_NOT_FIXED_IN_PR4");
  });

  it("keeps markdown, state, and branch scope aligned", () => {
    const report = readText(REPORT_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    const entry = stateEntries.find((item) => item.id === "ASSESSMENT-HUB-FREE-FULL-REPORT-CLAIM-PACKET-01");
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(report).toContain("Verdict: `PASS_WITH_P2_COPY_RISKS_RECORDED`");
    expect(report).toContain("Paid unlock disabled copy surfaces: `8`");
    expect(report).toContain("Next safe action: merge PR4");
    expect(entry).toBeTruthy();
    expect(scopeHelper).toContain("ASSESSMENT_HUB_FREE_FULL_REPORT_CLAIM_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-free-full-report-claim-packet-01");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-free-full-report-claim-packet.contract.test.ts");
  });
});
