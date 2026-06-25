import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/assessment-hub/assessment-hub-take-flow-cta-packet.v1.json";
const REPORT_PATH = "docs/assessment-hub/assessment-hub-take-flow-cta-packet-2026-06-24.md";
const COMMON_CONTRACT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json";
const METADATA_PACKET_PATH = "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet.v1.json";
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

describe("Assessment Hub take-flow CTA packet", () => {
  it("consumes the prior packets and records a PASS for actual landing CTA targets", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const metadataPacket = readJson(METADATA_PACKET_PATH);
    const summary = asRecord(packet.scope_summary);

    expect(packet.schema_version).toBe("fermatmind.assessment_hub_qa.take_flow_cta_packet.v1");
    expect(packet.task_id).toBe("ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01");
    expect(packet.consumes_common_contract).toBe(common.task_id);
    expect(packet.consumes_route_metadata_packet).toBe(metadataPacket.task_id);
    expect(packet.verdict).toBe("PASS_ACTUAL_CTA_TARGETS_AND_TAKE_GET_ALIGNMENT");
    expect(summary).toMatchObject({
      landing_route_count: 12,
      actual_landing_cta_href_count: 22,
      actual_landing_cta_get_pass_count: 22,
      actual_landing_cta_redirect_count: 0,
      status: "PASS",
    });
  });

  it("covers all six scales with the expected form codes and locales", () => {
    const packet = readJson(PACKET_PATH);
    const matrix = asRecordArray(packet.form_matrix);
    const byScale = new Map(matrix.map((row) => [row.scale_code, row]));

    expect(new Set(matrix.map((row) => row.scale_code))).toEqual(
      new Set(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "RIASEC", "IQ_RAVEN", "EQ_60"])
    );
    expect(asRecordArray(byScale.get("MBTI")?.forms).map((form) => form.form_code)).toEqual(["mbti_144", "mbti_93"]);
    expect(asRecordArray(byScale.get("BIG5_OCEAN")?.forms).map((form) => form.form_code)).toEqual(["big5_120", "big5_90"]);
    expect(asRecordArray(byScale.get("ENNEAGRAM")?.forms).map((form) => form.form_code)).toEqual([
      "enneagram_likert_105",
      "enneagram_forced_choice_144",
    ]);
    expect(asRecordArray(byScale.get("RIASEC")?.forms).map((form) => form.form_code)).toEqual(["riasec_60", "riasec_140"]);
    expect(asRecordArray(byScale.get("IQ_RAVEN")?.forms).map((form) => form.form_code)).toEqual([
      "IQ_OWNER_ORIGINAL_30",
      null,
    ]);
    expect(asRecordArray(byScale.get("EQ_60")?.forms).map((form) => form.form_code)).toEqual([null]);

    for (const row of matrix) {
      for (const form of asRecordArray(row.forms)) {
        expect(asStringArray(form.locales)).toEqual(["en", "zh"]);
      }
    }
  });

  it("records actual CTA target GET evidence without redirects or private flows", () => {
    const packet = readJson(PACKET_PATH);
    const targets = asRecordArray(packet.actual_cta_targets);
    const rechecks = asRecordArray(packet.live_rechecks);
    const negative = asRecord(packet.negative_guarantees);

    expect(targets).toHaveLength(22);
    expect(targets.every((target) => target.get_status === 200)).toBe(true);
    expect(targets.every((target) => target.redirected === false)).toBe(true);
    expect(targets.every((target) => String(target.href ?? "").startsWith(`/${target.locale}/tests/`))).toBe(true);
    expect(targets.every((target) => String(target.href ?? "").includes("/take"))).toBe(true);
    expect(targets.filter((target) => target.scale_code === "MBTI").map((target) => target.target_action).sort()).toEqual([
      "start_mbti_test_primary",
      "start_mbti_test_primary",
      "start_mbti_test_secondary",
      "start_mbti_test_secondary",
    ]);
    expect(asRecord(rechecks[0])).toMatchObject({
      landing_pages_checked: 12,
      actual_cta_hrefs_extracted: 22,
      take_get_status_200: 22,
      redirects_observed: 0,
      private_data_accessed: false,
      post_requests_sent: false,
      result: "PASS",
    });
    expect(asRecord(rechecks[1])).toMatchObject({
      final_recheck_status_200: 6,
      result: "PASS_AS_TRANSIENT_NOT_REPRODUCED",
    });
    expect(negative).toMatchObject({
      runtime_code_changed: false,
      frontend_public_copy_changed: false,
      cms_write_performed: false,
      search_submission_performed: false,
      private_attempt_or_result_accessed: false,
      post_start_submit_result_called: false,
      answers_submitted: false,
      payment_order_or_entitlement_changed: false,
      fap_api_modified: false,
    });
  });

  it("keeps markdown, state, and branch scope aligned", () => {
    const report = readText(REPORT_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    const entry = stateEntries.find((item) => item.id === "ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01");
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(report).toContain("Verdict: `PASS_ACTUAL_CTA_TARGETS_AND_TAKE_GET_ALIGNMENT`");
    expect(report).toContain("Actual landing CTA hrefs extracted: `22`");
    expect(report).toContain("Next safe action: merge PR3");
    expect(entry).toBeTruthy();
    expect(scopeHelper).toContain("ASSESSMENT_HUB_TAKE_FLOW_CTA_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-take-flow-cta-packet-01");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-take-flow-cta-packet.contract.test.ts");
  });
});
