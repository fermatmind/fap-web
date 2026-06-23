import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/enneagram-runtime-qa-consumption-packet-2026-06-23.md";
const COMMON_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json";
const READINESS_PATH = "docs/result-page-agents/enneagram-result-page-agent-readiness.proposal.json";
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

describe("Enneagram Runtime QA consumption packet", () => {
  it("declares Enneagram as ready for Runtime QA consumption only", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.enneagram_runtime_qa_consumption_packet.v1");
    expect(packet.task_id).toBe("ENNEAGRAM-RUNTIME-QA-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(packet.receiving_agent).toBe("runtime_qa");
    expect(packet.producing_agent).toBe("enneagram_result_page");
    expect(packet.scale_code).toBe("ENNEAGRAM");
    expect(asRecord(packet.dependency).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-COMMON-CONTRACT-01");
    expect(asRecord(packet.dependency).status).toBe("MERGED");
  });

  it("uses the common assertion vocabulary", () => {
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

  it("consumes the ready-readonly Enneagram readiness proposal", () => {
    const packet = readJson(PACKET_PATH);
    const readiness = readJson(READINESS_PATH);
    const consumed = asRecord(packet.consumed_evidence);

    expect(consumed.readiness_verdict).toBe(readiness.verdict);
    expect(consumed.matrix_readiness).toBe("ready_readonly");
    expect(consumed.public_share_safe).toBe(true);
    expect(consumed.public_personality_boundary_ready).toBe(true);
    expect(consumed.ready_for_runtime).toBe(false);
    expect(consumed.ready_for_production).toBe(false);
    expect(consumed.production_use_allowed).toBe(false);
  });

  it("blocks private share view model and telemetry fields", () => {
    const packet = readJson(PACKET_PATH);
    const share = asRecord(packet.share_view_model_and_telemetry_boundary);

    expect(share.status).toBe("PUBLIC_SUMMARY_ONLY");
    expect(asStringArray(share.blocked_fields)).toEqual(
      expect.arrayContaining([
        "attemptId",
        "score",
        "dominance_gap",
        "release_hash",
        "raw_metadata",
        "internal_metadata",
        "private_result_payload",
        "private_report_text",
        "report_token",
        "user_id",
      ])
    );
  });

  it("keeps private result text out of public personality content", () => {
    const packet = readJson(PACKET_PATH);
    const boundary = asRecord(packet.public_personality_boundary);

    expect(boundary.status).toBe("PASS");
    expect(boundary.private_result_text_becomes_public_profile_content).toBe(false);
    expect(boundary.public_profile_content_mutation).toBe("HOLD");
    expect(asStringArray(boundary.blocked)).toEqual(
      expect.arrayContaining(["private result text publication", "public profile content mutation from private result payload"])
    );
  });

  it("blocks final typing, clinical, and outcome claims", () => {
    const packet = readJson(PACKET_PATH);
    const claim = asRecord(packet.claim_boundary);

    expect(claim.status).toBe("PASS");
    expect(asStringArray(claim.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "final type certainty",
        "fixed type certainty",
        "diagnosis",
        "therapy",
        "treatment",
        "hiring prediction",
        "salary prediction",
        "performance prediction",
        "success prediction",
      ])
    );
  });

  it("keeps analytics public-safe and excludes generated readiness analytics", () => {
    const packet = readJson(PACKET_PATH);
    const analytics = readJson(ANALYTICS_PATH);
    const packetAnalytics = asRecord(packet.analytics_boundary);
    const enneagramAnalytics = asRecordArray(analytics.per_scale_analytics_readiness).find(
      (row) => row.scale_code === "ENNEAGRAM"
    );

    expect(packetAnalytics.status).toBe("PASS");
    expect(packetAnalytics.allowed).toBe("shared public-safe result page event classes only");
    expect(asStringArray(packetAnalytics.blocked)).toEqual(
      expect.arrayContaining(["private payload emission", "generated readiness analytics", "runtime analytics mutation"])
    );
    expect(enneagramAnalytics?.analytics_readiness).toBe("READONLY_HANDOFF");
    expect(String(enneagramAnalytics?.blocked)).toContain("private payload");
  });

  it("preserves all generation, activation, runtime, CMS, search, and private-data holds", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.holds)).toEqual(
      expect.arrayContaining([
        "candidate_generation",
        "import",
        "activation",
        "runtime_switch",
        "public_profile_content_mutation",
        "cms",
        "search",
        "private_result_access",
        "generated_readiness_artifact_write",
        "deploy",
      ])
    );
    expect(guarantees.candidate_payload_generated).toBe("no");
    expect(guarantees.import_performed).toBe("no");
    expect(guarantees.activation_performed).toBe("no");
    expect(guarantees.runtime_switch_performed).toBe("no");
    expect(guarantees.public_profile_content_changed).toBe("no");
    expect(guarantees.raw_private_result_accessed).toBe("none");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_RUNTIME_QA`");
    expect(report).toContain("ready_readonly");
    expect(report).toContain("public-summary scoped");
    expect(report).toContain("dominance gap");
    expect(report).toContain("release hash");
    expect(report).toContain("Final type certainty");
    expect(report).toContain("Private result text must not become public personality content");
    expect(report).toContain("candidate generation");
    expect(report).toContain("runtime switch");
  });

  it("keeps current branch scope limited to the Enneagram packet files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-runtime-qa-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/enneagram-runtime-qa-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/enneagram-runtime-qa-consumption-packet.contract.test.ts");
  });
});
