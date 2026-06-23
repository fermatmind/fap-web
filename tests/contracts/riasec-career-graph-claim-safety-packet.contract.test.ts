import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/career-graph/riasec-career-graph-claim-safety-packet.v1.json";
const REPORT_PATH = "docs/career-graph/riasec-career-graph-claim-safety-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json";
const SAFETY_PACKET_PATH = "docs/result-page-agents/riasec-safety-gate-consumption-packet.v1.json";
const RUNTIME_QA_PACKET_PATH = "docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json";
const ANALYTICS_PACKET_PATH = "docs/result-page-agents/riasec-analytics-consumption-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

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

describe("RIASEC Career Graph claim safety packet", () => {
  it("declares claim safety readiness and merged common-contract dependency", () => {
    const packet = readJson(PACKET_PATH);
    const dependency = asRecord(packet.dependency);

    expect(packet.schema_version).toBe("fermatmind.riasec_career_graph_claim_safety_packet.v1");
    expect(packet.task_id).toBe("RIASEC-CAREER-GRAPH-CLAIM-SAFETY-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_BLOCK_UNSAFE_OUTPUTS");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(dependency.task_id).toBe("RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01");
    expect(dependency.status).toBe("MERGED");
  });

  it("consumes RIASEC Safety Gate, Runtime QA, Analytics, common, and source authority artifacts", () => {
    const packet = readJson(PACKET_PATH);
    const safety = readJson(SAFETY_PACKET_PATH);
    const runtimeQa = readJson(RUNTIME_QA_PACKET_PATH);
    const analytics = readJson(ANALYTICS_PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const sources = asRecordArray(packet.consumed_sources);
    const ids = sources.map((source) => source.id);

    expect(safety.verdict).toBe("READY_TO_CONSUME_BY_SAFETY_GATE");
    expect(runtimeQa.verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(analytics.verdict).toBe("READY_TO_CONSUME_BY_ANALYTICS");
    expect(common.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(ids).toEqual(
      expect.arrayContaining([
        "riasec_safety_gate_consumption_packet",
        "riasec_runtime_qa_consumption_packet",
        "riasec_analytics_consumption_packet",
        "riasec_career_graph_common_contract",
        "riasec_career_graph_source_authority_packet",
        "fap_api_riasec_runtime_career_analytics_handoff",
      ])
    );
  });

  it("keeps occupation, major, and work activity examples examples-only", () => {
    const packet = readJson(PACKET_PATH);
    const examples = asRecord(packet.examples_only_assertions);

    expect(examples.occupation_examples).toBe("examples_only");
    expect(examples.major_examples).toBe("examples_only");
    expect(examples.work_activity_examples).toBe("exploration_prompts");
    expect(examples.career_bridge).toBe("starting_point_not_decision");
  });

  it("blocks deterministic career, admissions, hiring, salary, performance, success, ability, ranking, and raw-score claims", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "deterministic_career_recommendation",
        "best_career_for_you",
        "guaranteed_fit",
        "you_should_choose",
        "you_will_succeed",
        "admissions_prediction",
        "hiring_suitability",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "ability_measurement",
        "job_fit_score",
        "user_ranking",
        "occupation_ranking_as_objective_truth",
        "raw_score_to_career_recommendation",
      ])
    );
  });

  it("blocks raw score, vector, percentile, selector, trace, private, payment, order, and access-state inputs", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_bridge_or_analytics_inputs)).toEqual(
      expect.arrayContaining([
        "raw_scores",
        "score_vectors",
        "percentiles",
        "selector_traces",
        "source_refs",
        "qa_traces",
        "editor_notes",
        "private_attempt_id",
        "user_id",
        "private_result_payload",
        "full_private_result_payload",
        "payment_state",
        "order_state",
        "report_access_state",
      ])
    );
  });

  it("limits Safety Gate authority to blocking unsafe bridge outputs", () => {
    const packet = readJson(PACKET_PATH);
    const authority = asRecord(packet.safety_gate_authority);

    expect(authority.can_block_unsafe_bridge_outputs).toBe(true);
    expect(authority.can_approve_production).toBe(false);
    expect(authority.can_approve_cms).toBe(false);
    expect(authority.can_approve_search).toBe(false);
    expect(authority.can_approve_private_data_access).toBe(false);
    expect(authority.can_approve_runtime_recommendations).toBe(false);
  });

  it("defines the blocked recommendation report schema", () => {
    const packet = readJson(PACKET_PATH);
    const example = asRecord(packet.blocked_recommendation_report_example);

    expect(asStringArray(packet.blocked_recommendation_report_schema)).toEqual([
      "blocked_output_type",
      "violated_claim_boundary",
      "evidence_ref",
      "source_classification",
      "replacement_safe_language",
      "required_follow_up",
      "approval_state",
    ]);
    expect(example.blocked_output_type).toBe("deterministic_career_recommendation");
    expect(example.replacement_safe_language).toBe("examples_to_explore");
    expect(example.approval_state).toBe("blocked");
  });

  it("preserves hard holds and negative guarantees", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.hold_actions)).toEqual(
      expect.arrayContaining([
        "recommendation_logic",
        "runtime_code",
        "cms",
        "generated_pages",
        "career_graph_runtime_mutation",
        "private_result_data",
        "production_import",
        "deploy",
        "search_submission",
        "provider_calls",
        "opportunity_scoring",
        "search_channel_mutation",
      ])
    );
    expect(guarantees.recommendation_logic_added).toBe("no");
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.private_result_data_accessed).toBe("none");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_BLOCK_UNSAFE_OUTPUTS`");
    expect(report).toContain("Occupation examples remain examples-only");
    expect(report).toContain("deterministic career recommendation");
    expect(report).toContain("Safety Gate can block unsafe bridge outputs");
    expect(report).toContain("`blocked_output_type`");
    expect(report).toContain("Career Graph runtime mutation: none");
  });

  it("keeps current branch scope limited to PR3 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_CAREER_GRAPH_CLAIM_SAFETY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-career-graph-claim-safety-packet-01");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-claim-safety-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-claim-safety-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-career-graph-claim-safety-packet.contract.test.ts");
  });
});
