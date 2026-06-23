import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/big5-runtime-qa-consumption-packet-2026-06-23.md";
const COMMON_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json";
const HANDOFF_PATH = "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json";
const ANALYTICS_PATH = "docs/result-page-agents/result-page-agent-analytics-handoff.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_ASSERTIONS = [
  "route_contract",
  "report_api_contract",
  "report_access_api_contract",
  "renderer_dispatch",
  "pdf_private_print_boundary",
  "share_public_private_boundary",
  "private_result_noindex_boundary",
  "leak_boundary",
  "claim_privacy_safety_gate",
  "analytics_smoke_exclusion_gate",
];

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

describe("Big Five Runtime QA consumption packet", () => {
  it("declares Big Five as ready for Runtime QA consumption only", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.big5_runtime_qa_consumption_packet.v1");
    expect(packet.task_id).toBe("BIG5-RUNTIME-QA-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(packet.receiving_agent).toBe("runtime_qa");
    expect(packet.producing_agent).toBe("big_five_result_page");
    expect(packet.scale_code).toBe("BIG5_OCEAN");
    expect(asRecord(packet.dependency).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-COMMON-CONTRACT-01");
    expect(asRecord(packet.dependency).status).toBe("MERGED");
  });

  it("uses the common assertion vocabulary without adding runtime authority", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_PATH);
    const packetAssertions = asRecordArray(packet.assertions).map((assertion) => assertion.id);
    const commonAssertions = asRecordArray(common.assertion_vocabulary).map((assertion) => assertion.id);

    expect(packetAssertions).toEqual(EXPECTED_ASSERTIONS);
    expect(packetAssertions).toEqual(commonAssertions);
    for (const assertion of asRecordArray(packet.assertions)) {
      expect(assertion.status, String(assertion.id)).toBe("PASS");
    }
  });

  it("consumes the readonly-cleared handoff and preserves the share-safety clearance", () => {
    const packet = readJson(PACKET_PATH);
    const handoff = readJson(HANDOFF_PATH);
    const consumed = asRecord(packet.consumed_evidence);
    const packetEvidence = asRecordArray(consumed.sanitized_fap_api_evidence);
    const handoffEvidence = asRecordArray(handoff.source_evidence);

    expect(consumed.readiness_verdict).toBe(handoff.verdict);
    expect(consumed.historical_share_safety_blocker).toBe("CLEARED_READONLY_ONLY");
    expect(consumed.ready_for_runtime).toBe(false);
    expect(consumed.ready_for_production).toBe(false);
    expect(consumed.production_use_allowed).toBe(false);
    expect(packetEvidence.map((row) => row.share_safety_missing_count)).toEqual([0, 0]);
    expect(packetEvidence.map((row) => row.validation_error_count)).toEqual([0, 0]);
    expect(packetEvidence.map((row) => row.leak_hit_count)).toEqual([0, 0]);
    expect(handoffEvidence.map((row) => row.share_safety_missing_count)).toEqual([0, 0]);
  });

  it("keeps share and leak boundaries public-summary only", () => {
    const packet = readJson(PACKET_PATH);
    const share = asRecord(packet.share_surface_boundary);

    expect(share.status).toBe("PUBLIC_SUMMARY_ONLY");
    expect(asStringArray(share.forbidden_public_fields)).toEqual(
      expect.arrayContaining([
        "raw_ocean_scores",
        "score_vector",
        "private_result_payload",
        "attempt_id",
        "user_id",
        "report_token",
        "report_url",
        "selector_trace",
        "source_refs",
      ])
    );
    expect(JSON.stringify(packet)).not.toContain("ready_for_production\":true");
  });

  it("blocks unsupported psychometric and outcome claims", () => {
    const packet = readJson(PACKET_PATH);
    const claim = asRecord(packet.claim_boundary);

    expect(claim.status).toBe("PASS");
    expect(asStringArray(claim.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "unsupported fixed type",
        "official 32-type claim",
        "diagnosis",
        "hiring prediction",
        "salary prediction",
        "success prediction",
        "admission prediction",
        "ability guarantee",
      ])
    );
  });

  it("imports analytics smoke exclusions from the analytics handoff boundary", () => {
    const packet = readJson(PACKET_PATH);
    const analytics = readJson(ANALYTICS_PATH);
    const big5Plan = asRecord(analytics.big_five_analytics_handoff_plan);

    expect(asStringArray(packet.analytics_smoke_exclusions)).toEqual(
      expect.arrayContaining([
        "exclude smoke/test/QA/synthetic artifacts",
        "exclude fixture-marked runs",
        "exclude events with attempt id, user id, raw score, score vector, percentile, selector trace, private URL, report token, or raw payload",
        "exclude provider/search/deploy events",
      ])
    );
    expect(asStringArray(big5Plan.smoke_exclusion_policy)).toEqual(
      expect.arrayContaining(["exclude provider/search/deploy events"])
    );
  });

  it("preserves all required holds and negative guarantees", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.holds)).toEqual(
      expect.arrayContaining([
        "pilot",
        "runtime_enablement",
        "production_rollout",
        "cms",
        "search",
        "private_result_data",
        "generated_readiness_artifact_write",
        "renderer_change",
        "runtime_instrumentation_change",
        "big_five_content_change",
        "fap_api_mutation",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.renderer_changed).toBe("no");
    expect(guarantees.runtime_instrumentation_changed).toBe("no");
    expect(guarantees.big_five_content_changed).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_RUNTIME_QA`");
    expect(report).toContain("`share_safety_missing_count=0`");
    expect(report).toContain("`validation_error_count=0`");
    expect(report).toContain("`leak_hit_count=0`");
    expect(report).toContain("| `share_public_private_boundary` | `PASS` |");
    expect(report).toContain("raw OCEAN scores");
    expect(report).toContain("official 32-type");
    expect(report).toContain("runtime instrumentation changes");
    expect(report).toContain("fap-api mutation");
  });

  it("keeps current branch scope limited to the Big Five packet files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("BIG5_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/big5-runtime-qa-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/big5-runtime-qa-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/big5-runtime-qa-consumption-packet.contract.test.ts");
  });
});
