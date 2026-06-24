import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json";
const REPORT_PATH = "docs/public-personality/enneagram-public-personality-claim-safety-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json";
const SOURCE_PACKET_PATH = "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json";
const SAFETY_PACKET_PATH = "docs/result-page-agents/enneagram-safety-gate-consumption-packet.v1.json";
const RUNTIME_QA_PACKET_PATH = "docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json";
const ANALYTICS_PACKET_PATH = "docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json";
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

describe("Enneagram Public Personality claim safety packet", () => {
  it("declares claim safety readiness and merged dependencies", () => {
    const packet = readJson(PACKET_PATH);
    const dependency = asRecord(packet.dependency);
    const sourceDependency = asRecord(packet.source_authority_dependency);

    expect(packet.schema_version).toBe("fermatmind.enneagram_public_personality_claim_safety_packet.v1");
    expect(packet.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-CLAIM-SAFETY-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_BLOCK_UNSAFE_PUBLIC_PERSONALITY_OUTPUTS");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(dependency.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01");
    expect(dependency.status).toBe("MERGED");
    expect(sourceDependency.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-SOURCE-AUTHORITY-PACKET-01");
    expect(sourceDependency.status).toBe("MERGED");
    expect(sourceDependency.merge_commit).toBe("2436073c201f0ba79ae7f4c80c57a708e12dc0c7");
  });

  it("consumes Enneagram Safety Gate, Runtime QA, Analytics, common, and source authority artifacts", () => {
    const packet = readJson(PACKET_PATH);
    const safety = readJson(SAFETY_PACKET_PATH);
    const runtimeQa = readJson(RUNTIME_QA_PACKET_PATH);
    const analytics = readJson(ANALYTICS_PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const sourceAuthority = readJson(SOURCE_PACKET_PATH);
    const sources = asRecordArray(packet.consumed_sources);
    const ids = sources.map((source) => source.id);

    expect(safety.verdict).toBe("READY_TO_CONSUME_BY_SAFETY_GATE");
    expect(runtimeQa.verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(analytics.verdict).toBe("READY_TO_CONSUME_BY_ANALYTICS");
    expect(common.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(sourceAuthority.verdict).toBe("MAPPED_PARTIAL");
    expect(ids).toEqual(
      expect.arrayContaining([
        "enneagram_safety_gate_consumption_packet",
        "enneagram_runtime_qa_consumption_packet",
        "enneagram_analytics_consumption_packet",
        "enneagram_public_personality_common_contract",
        "enneagram_public_personality_source_authority_packet",
      ])
    );
  });

  it("keeps first public personality scope bounded by source and claim review", () => {
    const packet = readJson(PACKET_PATH);
    const scope = asRecord(packet.public_personality_scope_assertions);

    expect(scope.hub).toBe("allowed_to_plan_after_source_and_claim_review");
    expect(scope.nine_core_types).toBe("allowed_to_plan_after_source_and_claim_review");
    expect(scope.centers_or_triads).toBe("conditional_on_backend_source_authority");
    expect(scope.wings_instincts_subtypes).toBe("blocked_from_first_scope");
    expect(scope.private_result_profile_rewrites).toBe("blocked");
    expect(scope.attempt_based_profiles).toBe("blocked");
  });

  it("allows only reflective public-safe claim classes", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.allowed_claim_classes)).toEqual([
      "self_understanding",
      "personality_reflection",
      "motivation_pattern_reflection",
      "communication_reflection",
      "method_boundary",
      "non_diagnostic_note",
      "public_summary",
      "public_projection",
    ]);
  });

  it("blocks finality, diagnosis, outcome, ranking, and private report rewrite claims", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "final_fixed_type_certainty",
        "official_fixed_enneagram_type_claim",
        "unsupported_psychometric_superiority",
        "diagnosis",
        "treatment",
        "therapy",
        "hiring_suitability",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "relationship_guarantee",
        "life_outcome_guarantee",
        "most_accurate_type_finality",
        "score_based_personality_ranking",
        "private_report_text_rewrite",
      ])
    );
  });

  it("blocks private result, raw score, trace, source ref, order, payment, and hidden repair inputs", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_inputs)).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
        "raw_score",
        "display_score",
        "score_vector",
        "dominance_gap_abs",
        "dominance_gap_pct",
        "source_refs",
        "qa_traces",
        "editor_notes",
        "private_report_text",
        "full_private_result_payload",
        "private_result_url",
        "payment_state",
        "order_state",
        "hidden_repair_drafts",
      ])
    );
  });

  it("limits Safety Gate authority to blocking unsafe public personality outputs", () => {
    const packet = readJson(PACKET_PATH);
    const authority = asRecord(packet.safety_gate_authority);

    expect(authority.can_block_unsafe_public_personality_outputs).toBe(true);
    expect(authority.can_report_blocked_actions).toBe(true);
    expect(authority.can_approve_cms).toBe(false);
    expect(authority.can_approve_publish).toBe(false);
    expect(authority.can_approve_search).toBe(false);
    expect(authority.can_approve_deploy).toBe(false);
    expect(authority.can_approve_runtime_mutation).toBe(false);
    expect(authority.can_approve_private_data_access).toBe(false);
    expect(authority.can_approve_generated_pages).toBe(false);
    expect(authority.can_approve_backend_import).toBe(false);
    expect(authority.can_approve_candidate_activation).toBe(false);
  });

  it("defines the blocked public personality report schema", () => {
    const packet = readJson(PACKET_PATH);
    const example = asRecord(packet.blocked_public_personality_report_example);

    expect(asStringArray(packet.blocked_public_personality_report_schema)).toEqual([
      "blocked_output_type",
      "violated_claim_boundary",
      "evidence_ref",
      "source_classification",
      "replacement_safe_language",
      "required_follow_up",
      "approval_state",
    ]);
    expect(example.blocked_output_type).toBe("final_fixed_type_certainty_claim");
    expect(example.replacement_safe_language).toBe("may_reflect_public_summary");
    expect(example.approval_state).toBe("blocked");
  });

  it("preserves hard holds and negative guarantees", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.hold_actions)).toEqual(
      expect.arrayContaining([
        "cms",
        "publish",
        "search_submission",
        "provider_calls",
        "deploy",
        "runtime_instrumentation",
        "public_personality_runtime_mutation",
        "generated_pages",
        "backend_import",
        "candidate_activation",
        "candidate_payload_generation",
        "private_data",
        "source_ledger_write",
        "fap_api_mutation",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.generated_pages).toBe("none");
    expect(guarantees.source_ledger_write).toBe("none");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.raw_private_result_accessed).toBe("none");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_BLOCK_UNSAFE_PUBLIC_PERSONALITY_OUTPUTS`");
    expect(report).toContain("Source authority dependency");
    expect(report).toContain("Wings, instincts, subtypes, and 54 wing x instinct pages: blocked");
    expect(report).toContain("Safety Gate can block unsafe public personality outputs");
    expect(report).toContain("`blocked_output_type`");
    expect(report).toContain("fap-api mutation: none");
  });

  it("keeps current branch scope limited to PR3 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_PUBLIC_PERSONALITY_CLAIM_SAFETY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-public-personality-claim-safety-packet-01");
    expect(scopeHelper).toContain(
      "docs/public-personality/enneagram-public-personality-claim-safety-packet-2026-06-23.md"
    );
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json");
    expect(scopeHelper).toContain(
      "tests/contracts/enneagram-public-personality-claim-safety-packet.contract.test.ts"
    );
  });
});
