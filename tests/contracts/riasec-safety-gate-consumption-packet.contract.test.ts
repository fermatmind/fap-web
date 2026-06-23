import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/riasec-safety-gate-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/riasec-safety-gate-consumption-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract.v1.json";
const RUNTIME_QA_PACKET_PATH = "docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json";
const ANALYTICS_PACKET_PATH = "docs/result-page-agents/riasec-analytics-consumption-packet.v1.json";
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
  "opportunity_scoring_hold_gate",
  "search_provider_hold_gate",
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

describe("RIASEC Safety Gate consumption packet", () => {
  it("declares RIASEC as ready for Safety Gate consumption only", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.riasec_safety_gate_consumption_packet.v1");
    expect(packet.task_id).toBe("RIASEC-SAFETY-GATE-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_SAFETY_GATE");
    expect(packet.receiving_agent).toBe("claim_privacy_safety_gate");
    expect(packet.producing_agent).toBe("riasec_result_page");
    expect(packet.scale_code).toBe("RIASEC");
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

  it("preserves one flagship, two forms, examples-only career bridge, and hard holds", () => {
    const packet = readJson(PACKET_PATH);
    const evidence = asRecord(packet.consumed_evidence);
    const oneFlagship = asRecord(packet.one_flagship_two_forms);

    expect(evidence.readiness_verdict).toBe("RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(evidence.readonly_review_verdict).toBe("RIASEC_READONLY_ROUTE_API_PDF_SHARE_REVIEW_READY_WITH_RUNTIME_PRODUCTION_HOLDS");
    expect(evidence.fap_api_handoff_scope).toBe("planning_and_handoff_packet_only");
    expect(evidence.career_bridge_policy).toBe("examples_only_not_recommendations");
    expect(evidence.ready_for_safety_report).toBe(true);
    expect(evidence.ready_for_runtime).toBe(false);
    expect(evidence.ready_for_production).toBe(false);
    expect(evidence.ready_for_career_graph_runtime_mutation).toBe(false);
    expect(evidence.ready_for_production_import).toBe(false);
    expect(oneFlagship.canonical_landing).toBe("holland-career-interest-test-riasec");
    expect(oneFlagship.parallel_stack_introduced).toBe(false);
    expect(oneFlagship.legacy_36q_surface_allowed).toBe(false);
    expect(asStringArray(oneFlagship.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
  });

  it("blocks RIASEC private payload, score, selector, token, and trace fields", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_private_fields)).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
        "account_id",
        "raw_score",
        "raw_scores",
        "score_vector",
        "dimension_vector",
        "percentile",
        "selector_trace",
        "share_block",
        "source_refs",
        "qa_trace",
        "editor_notes",
        "private_url",
        "report_token",
        "token",
        "secret",
        "private_result_payload",
        "full_report_body_text",
        "payment_id",
        "order_id",
        "access_token",
        "cookie",
        "session_id",
      ])
    );
  });

  it("blocks deterministic career, admissions, hiring, salary, performance, success, ability, and official-type claims", () => {
    const packet = readJson(PACKET_PATH);
    const bridge = asRecord(packet.career_graph_bridge_boundary);

    expect(asStringArray(packet.allowed_claim_classes)).toEqual(
      expect.arrayContaining([
        "self_understanding",
        "career_interest_exploration",
        "method_boundary",
        "non_diagnostic_note",
        "examples_only",
        "public_summary",
        "public_projection",
      ])
    );
    expect(asStringArray(packet.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "deterministic career recommendation",
        "best career for you",
        "guaranteed fit",
        "you should choose",
        "you will succeed",
        "hiring prediction",
        "admissions decision",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "ability measurement",
        "life-outcome guarantee",
        "official Holland type determines your career",
        "low score means cannot do this",
      ])
    );
    expect(bridge.policy).toBe("examples_only_not_recommendations");
    expect(asStringArray(bridge.forbidden_claims)).toContain("deterministic career recommendation");
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

  it("preserves all RIASEC hard holds and negative guarantees", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.holds)).toEqual(
      expect.arrayContaining([
        "production_import",
        "runtime_wrapper_enablement",
        "runtime_enablement",
        "cms",
        "search",
        "career_graph_runtime_mutation",
        "deterministic_career_recommendation",
        "private_result_access",
        "event_emission",
        "production_metric_backfill",
        "opportunity_scoring",
        "provider_calls",
        "search_channel_mutation",
        "generated_readiness_artifact_write",
        "fap_api_mutation",
        "deploy",
        "rollout",
        "default_denied_action_approval",
      ])
    );
    expect(guarantees.safety_runtime_code_changed).toBe("no");
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.riasec_import_command_run).toBe("no");
    expect(guarantees.runtime_wrapper_enabled).toBe("no");
    expect(guarantees.career_graph_runtime_mutation).toBe("none");
    expect(guarantees.deterministic_career_recommendation_added).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_SAFETY_GATE`");
    expect(report).toContain("`holland-career-interest-test-riasec`");
    expect(report).toContain("`riasec_60`");
    expect(report).toContain("`riasec_140`");
    expect(report).toContain("`examples_only_not_recommendations`");
    expect(report).toContain("raw RIASEC scores");
    expect(report).toContain("Career Graph runtime mutation");
    expect(report).toContain("opportunity scoring");
    expect(report).toContain("does not implement safety runtime code");
  });

  it("keeps current branch scope registered for the RIASEC Safety Gate PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-safety-gate-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-safety-gate-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-safety-gate-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-safety-gate-consumption-packet.contract.test.ts");
  });
});
