import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/enneagram-safety-gate-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/enneagram-safety-gate-consumption-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract.v1.json";
const RUNTIME_QA_PACKET_PATH = "docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json";
const ANALYTICS_PACKET_PATH = "docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_ASSERTIONS = [
  "unsupported_claim_gate",
  "private_result_boundary_gate",
  "analytics_payload_privacy_gate",
  "share_public_summary_gate",
  "pdf_private_print_gate",
  "public_private_content_separation_gate",
  "source_classification_gate",
  "hard_hold_action_gate",
  "smoke_exclusion_gate",
  "runtime_qa_to_analytics_safety_gate",
  "production_mutation_hold_gate",
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

describe("Enneagram Safety Gate consumption packet", () => {
  it("declares Enneagram as ready for Safety Gate consumption only", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.enneagram_safety_gate_consumption_packet.v1");
    expect(packet.task_id).toBe("ENNEAGRAM-SAFETY-GATE-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_SAFETY_GATE");
    expect(packet.receiving_agent).toBe("claim_privacy_safety_gate");
    expect(packet.producing_agent).toBe("enneagram_result_page");
    expect(packet.scale_code).toBe("ENNEAGRAM");
    expect(asRecord(packet.dependency).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-COMMON-CONTRACT-01");
    expect(asRecord(packet.dependency).status).toBe("MERGED");
  });

  it("uses Safety Gate common assertion families and existing Runtime QA plus Analytics packets", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const runtimeQa = readJson(RUNTIME_QA_PACKET_PATH);
    const analytics = readJson(ANALYTICS_PACKET_PATH);
    const commonAssertions = new Set(asStringArray(common.assertion_families));
    const packetAssertions = asRecordArray(packet.safety_assertions).map((assertion) => String(assertion.id));

    expect(packetAssertions).toEqual(EXPECTED_ASSERTIONS);
    for (const assertion of packetAssertions) {
      expect(commonAssertions.has(assertion)).toBe(true);
    }
    expect(runtimeQa.verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(analytics.verdict).toBe("READY_TO_CONSUME_BY_ANALYTICS");
  });

  it("carries public share and public personality boundary evidence without promoting mutation authority", () => {
    const packet = readJson(PACKET_PATH);
    const runtimeQa = readJson(RUNTIME_QA_PACKET_PATH);
    const analytics = readJson(ANALYTICS_PACKET_PATH);
    const evidence = asRecord(packet.consumed_evidence);

    expect(evidence.readiness_verdict).toBe("ENNEAGRAM_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(evidence.matrix_readiness).toBe("ready_readonly");
    expect(evidence.runtime_qa_packet_verdict).toBe(runtimeQa.verdict);
    expect(evidence.analytics_packet_verdict).toBe(analytics.verdict);
    expect(evidence.public_share_safe).toBe(true);
    expect(evidence.public_personality_boundary_ready).toBe(true);
    expect(evidence.ready_for_safety_report).toBe(true);
    expect(evidence.ready_for_candidate_generation).toBe(false);
    expect(evidence.ready_for_import).toBe(false);
    expect(evidence.ready_for_activation).toBe(false);
    expect(evidence.ready_for_runtime).toBe(false);
    expect(evidence.ready_for_production).toBe(false);
    expect(evidence.ready_for_cms).toBe(false);
    expect(evidence.ready_for_search).toBe(false);
    expect(evidence.ready_for_event_emission).toBe(false);
    expect(evidence.ready_for_opportunity_scoring).toBe(false);
    expect(evidence.ready_for_public_profile_mutation).toBe(false);
  });

  it("blocks Enneagram private payload, identifier, metadata, token, and trace fields", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_private_fields)).toEqual(
      expect.arrayContaining([
        "attemptId",
        "attempt_id",
        "score",
        "raw_score",
        "raw_scores",
        "score_vector",
        "dominance_gap",
        "release_hash",
        "raw_metadata",
        "internal_metadata",
        "private_result_payload",
        "private_report_text",
        "full_report_body_text",
        "report_token",
        "private_url",
        "report_url",
        "private_report_url",
        "account_id",
        "user_id",
        "payment_id",
        "order_id",
        "selector_trace",
        "source_refs",
        "qa_trace",
        "access_token",
        "cookie",
        "session_id",
      ])
    );
  });

  it("blocks fixed-type certainty, unsupported, diagnostic, hiring, and outcome claims", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.allowed_claim_classes)).toEqual(
      expect.arrayContaining([
        "self_understanding",
        "personality_reflection",
        "motivation_pattern_reflection",
        "communication_reflection",
        "method_boundary",
        "non_diagnostic_note",
        "public_summary",
        "public_projection",
      ])
    );
    expect(asStringArray(packet.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "final type certainty",
        "fixed type certainty",
        "official fixed Enneagram type claim",
        "unsupported psychometric superiority claim",
        "diagnosis",
        "treatment",
        "therapy",
        "hiring prediction",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "admission prediction",
        "ability guarantee",
        "life-outcome guarantee",
      ])
    );
  });

  it("keeps smoke, QA, synthetic, fixture, generated, provider, and private URL observations excluded", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.smoke_qa_synthetic_exclusions)).toEqual(
      expect.arrayContaining([
        "production_activation_smoke_attempts",
        "codex_probe_anon_prefix",
        "codex_probe_session_prefix",
        "codex_probe_request_prefix",
        "qa_synthetic_attempts",
        "fixtures",
        "generated_readiness_artifacts",
        "staging_only_artifacts",
        "internal_preview_artifacts",
        "crawler_search_provider_behavior",
        "private_result_report_urls",
      ])
    );
  });

  it("preserves all Enneagram hard holds and negative guarantees", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.holds)).toEqual(
      expect.arrayContaining([
        "candidate_generation",
        "import",
        "activation",
        "runtime_switch",
        "public_profile_content_mutation",
        "pilot",
        "runtime_enablement",
        "production_rollout",
        "cms",
        "search",
        "private_result_access",
        "event_emission",
        "production_metric_backfill",
        "opportunity_scoring",
        "provider_calls",
        "search_channel_mutation",
        "generated_readiness_artifact_write",
        "deploy",
        "production_import",
        "rollout",
        "fap_api_mutation",
        "default_denied_action_approval",
      ])
    );
    expect(guarantees.safety_runtime_code_changed).toBe("no");
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.candidate_payload_generated).toBe("no");
    expect(guarantees.import_performed).toBe("no");
    expect(guarantees.activation_performed).toBe("no");
    expect(guarantees.runtime_switch_performed).toBe("no");
    expect(guarantees.public_profile_content_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_SAFETY_GATE`");
    expect(report).toContain("`public_share_safe=true`");
    expect(report).toContain("`public_personality_boundary_ready=true`");
    expect(report).toContain("`official fixed Enneagram type claim`");
    expect(report).toContain("raw Enneagram scores");
    expect(report).toContain("public profile content mutation");
    expect(report).toContain("event emission");
    expect(report).toContain("opportunity scoring");
    expect(report).toContain("does not implement safety runtime code");
  });

  it("keeps current branch scope registered for the Enneagram Safety Gate PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-safety-gate-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/enneagram-safety-gate-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/enneagram-safety-gate-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/enneagram-safety-gate-consumption-packet.contract.test.ts");
  });
});
