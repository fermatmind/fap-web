import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/riasec-analytics-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/riasec-analytics-consumption-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_EVENTS = [
  "riasec_result_view",
  "riasec_full_report_view",
  "riasec_report_module_view",
  "riasec_career_exploration_click",
  "riasec_share_summary_view",
  "riasec_second_test_click",
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

describe("RIASEC analytics consumption packet", () => {
  it("defines the RIASEC analytics consumption boundary", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.riasec_analytics_consumption_packet.v1");
    expect(packet.task_id).toBe("RIASEC-ANALYTICS-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_ANALYTICS");
    expect(packet.receiving_agent).toBe("analytics_gsc_opportunity");
    expect(packet.producing_agent).toBe("riasec_result_page");
    expect(packet.scale_code).toBe("RIASEC");
    expect(asRecord(packet.dependency).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-COMMON-CONTRACT-01");
    expect(asRecord(packet.dependency).status).toBe("MERGED");
  });

  it("uses only event families declared by the common analytics contract", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const commonFamilies = new Set(asStringArray(common.event_family_vocabulary));
    const events = asRecordArray(packet.analytics_events);

    expect(events.map((event) => event.event_name)).toEqual(EXPECTED_EVENTS);
    for (const event of events) {
      expect(commonFamilies.has(String(event.event_family))).toBe(true);
    }
  });

  it("consumes Runtime QA and fap-api handoff references without promoting runtime use", () => {
    const packet = readJson(PACKET_PATH);
    const evidence = asRecord(packet.consumed_evidence);
    const sourceRefs = asRecord(packet.source_refs);

    expect(evidence.runtime_qa_packet_verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(evidence.readiness_verdict).toBe("RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(evidence.analytics_readiness).toBe("PRIORITY_READONLY_HANDOFF");
    expect(sourceRefs.fap_api_runtime_career_analytics_handoff).toBe(
      "fap-api:backend/docs/riasec/riasec-result-page-agent-runtime-career-analytics-handoff-2026-06-23.md"
    );
    expect(evidence.ready_for_analytics_quality_report).toBe(true);
    expect(evidence.ready_for_event_emission).toBe(false);
    expect(evidence.ready_for_opportunity_scoring).toBe(false);
    expect(evidence.ready_for_production_metric_backfill).toBe(false);
    expect(evidence.ready_for_runtime_mutation).toBe(false);
    expect(evidence.ready_for_career_graph_runtime_mutation).toBe(false);
  });

  it("preserves the one-flagship two-form RIASEC boundary", () => {
    const packet = readJson(PACKET_PATH);
    const boundary = asRecord(packet.one_flagship_two_forms);

    expect(boundary.status).toBe("PASS");
    expect(boundary.canonical_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(boundary.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
    expect(boundary.parallel_stack_introduced).toBe(false);
    expect(boundary.legacy_36q_surface_allowed).toBe(false);
  });

  it("keeps career graph bridge analytics examples-only and public safe", () => {
    const packet = readJson(PACKET_PATH);
    const boundary = asRecord(packet.career_graph_bridge_boundary);

    expect(boundary.status).toBe("PASS");
    expect(boundary.policy).toBe("examples_only_not_recommendations");
    expect(boundary.analytics_allowed).toBe("public-safe exploration intent only");
    expect(asStringArray(boundary.public_safe_dimensions)).toEqual(["public_dimension_code", "example_kind"]);
    expect(asStringArray(boundary.allowed_language)).toEqual(
      expect.arrayContaining(["examples to explore", "use this as a starting point, not a decision"])
    );
    expect(asStringArray(boundary.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "deterministic career recommendation",
        "best career for you",
        "you will succeed",
        "hiring screen",
        "admissions decision",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "ability measurement",
      ])
    );
  });

  it("blocks private identifiers, score vectors, selector traces, and report payload fields", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_payload_fields)).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
        "raw_score",
        "raw_scores",
        "score_vector",
        "dimension_vector",
        "percentile",
        "selector_trace",
        "source_refs",
        "qa_trace",
        "editor_notes",
        "private_url",
        "report_token",
        "private_result_payload",
        "full_report_body_text",
        "payment_id",
        "order_id",
      ])
    );
  });

  it("blocks deterministic career and outcome claims", () => {
    const packet = readJson(PACKET_PATH);
    const claim = asRecord(packet.claim_boundary);

    expect(claim.status).toBe("PASS");
    expect(asStringArray(claim.forbidden_claims)).toEqual(
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
      ])
    );
  });

  it("preserves production import, runtime, CMS, search, provider, and opportunity-scoring holds", () => {
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
      ])
    );
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.runtime_wrapper_enabled).toBe("no");
    expect(guarantees.career_graph_runtime_mutation).toBe("none");
    expect(guarantees.deterministic_career_recommendation_added).toBe("no");
    expect(guarantees.raw_private_result_accessed).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.search_channel_mutation).toBe("none");
    expect(guarantees.fap_api_mutation).toBe("none");
  });

  it("keeps markdown aligned with the JSON packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_ANALYTICS`");
    expect(report).toContain("`holland-career-interest-test-riasec`");
    expect(report).toContain("`riasec_60`, `riasec_140`");
    for (const event of EXPECTED_EVENTS) {
      expect(report).toContain(`\`${event}\``);
    }
    expect(report).toContain("examples-only");
    expect(report).toContain("deterministic career recommendation");
    expect(report).toContain("event emission");
    expect(report).toContain("opportunity scoring");
    expect(report).toContain("does not implement analytics runtime code");
  });

  it("keeps current branch scope registered for the RIASEC analytics PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-analytics-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-analytics-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-analytics-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-analytics-consumption-packet.contract.test.ts");
  });
});
