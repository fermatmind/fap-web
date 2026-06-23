import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/riasec-runtime-qa-consumption-packet-2026-06-23.md";
const COMMON_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json";
const READINESS_PATH = "docs/result-page-agents/riasec-result-page-agent-readiness.proposal.json";
const REVIEW_PATH = "docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review.v1.json";
const RUNTIME_QA_HANDOFF_PATH = "docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json";
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

describe("RIASEC Runtime QA consumption packet", () => {
  it("declares RIASEC as ready for Runtime QA consumption only", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.riasec_runtime_qa_consumption_packet.v1");
    expect(packet.task_id).toBe("RIASEC-RUNTIME-QA-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(packet.receiving_agent).toBe("runtime_qa");
    expect(packet.producing_agent).toBe("riasec_result_page");
    expect(packet.scale_code).toBe("RIASEC");
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

  it("consumes RIASEC standard alignment, readonly review, runtime QA, and analytics handoff evidence", () => {
    const packet = readJson(PACKET_PATH);
    const readiness = readJson(READINESS_PATH);
    const review = readJson(REVIEW_PATH);
    const runtime = readJson(RUNTIME_QA_HANDOFF_PATH);
    const analytics = readJson(ANALYTICS_PATH);
    const consumed = asRecord(packet.consumed_evidence);
    const riasecRuntime = asRecordArray(runtime.per_scale_handoff).find((row) => row.scale_code === "RIASEC");
    const riasecAnalytics = asRecordArray(analytics.per_scale_analytics_readiness).find((row) => row.scale_code === "RIASEC");

    expect(consumed.readiness_verdict).toBe(readiness.verdict);
    expect(consumed.readonly_review_verdict).toBe(review.verdict);
    expect(consumed.runtime_qa_handoff_status).toBe(riasecRuntime?.handoff_status);
    expect(consumed.analytics_readiness).toBe(riasecAnalytics?.analytics_readiness);
    expect(consumed.ready_for_runtime).toBe(false);
    expect(consumed.ready_for_production).toBe(false);
    expect(consumed.production_use_allowed).toBe(false);
  });

  it("preserves one flagship with only riasec_60 and riasec_140", () => {
    const packet = readJson(PACKET_PATH);
    const boundary = asRecord(packet.one_flagship_two_forms);

    expect(boundary.status).toBe("PASS");
    expect(boundary.canonical_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(boundary.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
    expect(boundary.parallel_stack_introduced).toBe(false);
    expect(boundary.legacy_36q_surface_allowed).toBe(false);
  });

  it("blocks private projection, raw score, vector, trace, token, and payment leaks", () => {
    const packet = readJson(PACKET_PATH);
    const leak = asRecord(packet.public_projection_and_leak_boundary);

    expect(leak.status).toBe("PASS");
    expect(asStringArray(leak.allowed_projection_versions)).toEqual(["riasec_public_projection_v2", "riasec_public_projection_v1"]);
    expect(asStringArray(leak.forbidden_public_fields)).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
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
        "payment_id",
        "order_id",
      ])
    );
  });

  it("keeps the career graph bridge examples-only and non-deterministic", () => {
    const packet = readJson(PACKET_PATH);
    const bridge = asRecord(packet.career_graph_bridge_boundary);

    expect(bridge.status).toBe("PASS");
    expect(asStringArray(bridge.allowed_language)).toEqual(
      expect.arrayContaining(["examples to explore", "use this as a starting point, not a decision"])
    );
    expect(asStringArray(bridge.forbidden_inputs)).toEqual(
      expect.arrayContaining(["raw item answers", "raw scores", "score vectors", "frontend fallback copy"])
    );
    expect(asStringArray(bridge.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "deterministic career recommendation",
        "best career for you",
        "guaranteed fit",
        "hiring screen",
        "admissions decision",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "ability measurement",
      ])
    );
  });

  it("keeps RIASEC analytics public-safe and blocks runtime/private emissions", () => {
    const packet = readJson(PACKET_PATH);
    const analytics = asRecord(packet.analytics_boundary);

    expect(analytics.status).toBe("PASS");
    expect(analytics.allowed).toContain("public-safe coarse interest labels");
    expect(asStringArray(analytics.blocked)).toEqual(
      expect.arrayContaining([
        "raw scores",
        "score vectors",
        "percentiles",
        "attempt id",
        "user id",
        "private report payload",
        "selector trace",
        "deterministic career recommendation",
        "runtime analytics mutation",
      ])
    );
  });

  it("preserves production import, runtime, CMS, search, career graph, fap-api, deploy, and private-data holds", () => {
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
        "generated_readiness_artifact_write",
        "fap_api_mutation",
        "provider_call",
        "deploy",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.riasec_import_command_run).toBe("no");
    expect(guarantees.runtime_wrapper_enabled).toBe("no");
    expect(guarantees.career_graph_runtime_mutation).toBe("none");
    expect(guarantees.raw_private_result_accessed).toBe("none");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_RUNTIME_QA`");
    expect(report).toContain("`PRIORITY_HANDOFF_READY_READONLY`");
    expect(report).toContain("supported forms: `riasec_60`, `riasec_140`");
    expect(report).toContain("Career Graph Bridge Boundary");
    expect(report).toContain("use this as a starting point, not a decision");
    expect(report).toContain("deterministic career recommendation");
    expect(report).toContain("runtime wrapper enabled: no");
    expect(report).toContain("fap-api mutation: none");
  });

  it("keeps current branch scope limited to the RIASEC packet files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-runtime-qa-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-runtime-qa-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-runtime-qa-consumption-packet.contract.test.ts");
  });
});
