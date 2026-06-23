import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-matrix.v1.json";
const REPORT_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-matrix-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract.v1.json";
const RUNTIME_QA_MATRIX_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-matrix.v1.json";
const ANALYTICS_MATRIX_PATH = "docs/result-page-agents/active-result-page-agents-analytics-matrix.v1.json";
const BIG5_PACKET_PATH = "docs/result-page-agents/big5-safety-gate-consumption-packet.v1.json";
const ENNEAGRAM_PACKET_PATH = "docs/result-page-agents/enneagram-safety-gate-consumption-packet.v1.json";
const RIASEC_PACKET_PATH = "docs/result-page-agents/riasec-safety-gate-consumption-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_ACTIVE_SCALES = ["BIG5_OCEAN", "ENNEAGRAM", "RIASEC"];
const EXPECTED_PARKED_SCALES = ["MBTI", "IQ_RAVEN", "EQ_60"];

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

describe("Active Safety Gate matrix", () => {
  it("declares the aggregate Safety Gate matrix for the three active result-page agents", () => {
    const matrix = readJson(MATRIX_PATH);

    expect(matrix.schema_version).toBe("fermatmind.active_result_page_agents_safety_gate_matrix.v1");
    expect(matrix.task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-MATRIX-01");
    expect(matrix.verdict).toBe("ACTIVE_SAFETY_GATE_MATRIX_READY");
    expect(matrix.receiving_agent).toBe("claim_privacy_safety_gate");
    expect(asRecord(matrix.common_contract).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-COMMON-CONTRACT-01");
    expect(asRecord(matrix.common_contract).status).toBe("MERGED");
  });

  it("maps the merged packet dependencies and active packet verdicts", () => {
    const matrix = readJson(MATRIX_PATH);
    const dependencies = asRecordArray(matrix.dependency_merges);
    const activeAgents = asRecordArray(matrix.active_agents);
    const packets = [readJson(BIG5_PACKET_PATH), readJson(ENNEAGRAM_PACKET_PATH), readJson(RIASEC_PACKET_PATH)];

    expect(dependencies.map((dependency) => dependency.cleanup_status)).toEqual([
      "merged_cleanup_complete",
      "merged_cleanup_complete",
      "merged_cleanup_complete",
    ]);
    expect(dependencies.map((dependency) => dependency.task_id)).toEqual([
      "BIG5-SAFETY-GATE-CONSUMPTION-PACKET-01",
      "ENNEAGRAM-SAFETY-GATE-CONSUMPTION-PACKET-01",
      "RIASEC-SAFETY-GATE-CONSUMPTION-PACKET-01",
    ]);
    expect(activeAgents.map((agent) => agent.scale_code)).toEqual(EXPECTED_ACTIVE_SCALES);
    expect(activeAgents.map((agent) => agent.safety_gate_status)).toEqual([
      "READY_TO_CONSUME_BY_SAFETY_GATE",
      "READY_TO_CONSUME_BY_SAFETY_GATE",
      "READY_TO_CONSUME_BY_SAFETY_GATE",
    ]);
    expect(packets.map((packet) => packet.verdict)).toEqual([
      "READY_TO_CONSUME_BY_SAFETY_GATE",
      "READY_TO_CONSUME_BY_SAFETY_GATE",
      "READY_TO_CONSUME_BY_SAFETY_GATE",
    ]);
  });

  it("keeps Runtime QA and Analytics matrices as read-only supporting evidence", () => {
    const matrix = readJson(MATRIX_PATH);
    const runtimeQaMatrix = readJson(RUNTIME_QA_MATRIX_PATH);
    const analyticsMatrix = readJson(ANALYTICS_MATRIX_PATH);
    const sourceRefs = asRecord(matrix.source_refs);

    expect(runtimeQaMatrix.verdict).toBe("ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_MATRIX_READY");
    expect(analyticsMatrix.verdict).toBe("ACTIVE_ANALYTICS_MATRIX_READY");
    expect(sourceRefs.runtime_qa_matrix).toBe(RUNTIME_QA_MATRIX_PATH);
    expect(sourceRefs.analytics_matrix).toBe(ANALYTICS_MATRIX_PATH);
  });

  it("keeps parked placeholders outside this active Safety Gate train", () => {
    const matrix = readJson(MATRIX_PATH);
    const parked = asRecordArray(matrix.parked_placeholder_scales);

    expect(parked.map((entry) => entry.scale_code)).toEqual(EXPECTED_PARKED_SCALES);
    expect(parked.map((entry) => entry.status)).toEqual([
      "PARKED_PLACEHOLDER",
      "PARKED_PLACEHOLDER",
      "PARKED_PLACEHOLDER",
    ]);
  });

  it("uses only common Safety Gate assertion families", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const commonAssertions = new Set(asStringArray(common.assertion_families));

    for (const assertion of asStringArray(matrix.common_assertion_families)) {
      expect(commonAssertions.has(assertion)).toBe(true);
    }
  });

  it("preserves scale-specific holds including public profile, Career Graph, and deterministic recommendation blocks", () => {
    const matrix = readJson(MATRIX_PATH);
    const agents = asRecordArray(matrix.active_agents);
    const big5 = asRecord(agents.find((agent) => agent.scale_code === "BIG5_OCEAN"));
    const enneagram = asRecord(agents.find((agent) => agent.scale_code === "ENNEAGRAM"));
    const riasec = asRecord(agents.find((agent) => agent.scale_code === "RIASEC"));

    expect(asStringArray(big5.holds)).toEqual(expect.arrayContaining(["event_emission", "opportunity_scoring", "fap_api_mutation"]));
    expect(asStringArray(enneagram.holds)).toEqual(
      expect.arrayContaining(["candidate_generation", "activation", "public_profile_content_mutation", "fap_api_mutation"])
    );
    expect(asStringArray(riasec.holds)).toEqual(
      expect.arrayContaining([
        "production_import",
        "runtime_wrapper_enablement",
        "career_graph_runtime_mutation",
        "deterministic_career_recommendation",
        "fap_api_mutation",
      ])
    );
    expect(riasec.one_flagship_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(riasec.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
    expect(riasec.career_bridge_policy).toBe("examples_only_not_recommendations");
  });

  it("keeps global hard holds and negative guarantees", () => {
    const matrix = readJson(MATRIX_PATH);
    const guarantees = asRecord(matrix.negative_guarantees);

    expect(asStringArray(matrix.hard_holds)).toEqual(
      expect.arrayContaining([
        "safety_runtime_implementation",
        "analytics_runtime_implementation",
        "event_emission",
        "production_metric_backfill",
        "opportunity_scoring",
        "search_channel_queue_mutation",
        "provider_call",
        "deploy_or_revalidation",
        "private_result_access",
        "generated_readiness_artifact_write",
        "fap_api_mutation",
        "career_graph_runtime_mutation",
        "public_personality_content_mutation",
        "deterministic_career_recommendation",
      ])
    );
    expect(guarantees.safety_runtime_code_changed).toBe("no");
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.search_channel_mutation).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.career_graph_runtime_mutation).toBe("none");
  });

  it("keeps markdown aligned with the matrix", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `ACTIVE_SAFETY_GATE_MATRIX_READY`");
    expect(report).toContain("`BIG5_OCEAN`");
    expect(report).toContain("`ENNEAGRAM`");
    expect(report).toContain("`RIASEC`");
    expect(report).toContain("`PARKED_PLACEHOLDER`");
    expect(report).toContain("`holland-career-interest-test-riasec`");
    expect(report).toContain("deterministic career recommendation");
    expect(report).toContain("Career Graph runtime mutation");
    expect(report).toContain("does not implement safety runtime code");
  });

  it("keeps current branch scope registered for the Safety Gate matrix PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ACTIVE_RESULT_PAGE_AGENTS_SAFETY_GATE_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/active-result-page-agents-safety-gate-matrix-01");
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-safety-gate-matrix-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-safety-gate-matrix.v1.json");
    expect(scopeHelper).toContain("tests/contracts/active-result-page-agents-safety-gate-matrix.contract.test.ts");
  });
});
