import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json";
const REPORT_PATH = "docs/career-graph/riasec-career-graph-bridge-common-contract-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const TRAIN_IDS = [
  "RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01",
  "RIASEC-CAREER-GRAPH-SOURCE-AUTHORITY-PACKET-01",
  "RIASEC-CAREER-GRAPH-CLAIM-SAFETY-PACKET-01",
  "RIASEC-CAREER-GRAPH-CANDIDATE-CLUSTER-PACKET-01",
  "RIASEC-CAREER-GRAPH-BRIDGE-MATRIX-01",
];

const EXPECTED_ALLOWED_INPUTS = [
  "public_riasec_dimension_labels_and_order",
  "public_top_code_profile_shape_summary",
  "public_confidence_state",
  "public_caution_state",
  "public_low_quality_state",
  "public_method_boundary_copy",
  "reviewed_backend_owned_occupation_examples",
  "reviewed_backend_owned_activity_examples",
  "locale",
  "form_code_limited_to_riasec_60_or_riasec_140",
  "public_projection_version",
  "public_quality_state",
];

const EXPECTED_FORBIDDEN_INPUTS = [
  "raw_item_answers",
  "raw_scores",
  "score_vectors",
  "percentiles",
  "selector_traces",
  "source_refs",
  "qa_traces",
  "editor_notes",
  "private_attempt_id",
  "user_id",
  "payment_state",
  "order_state",
  "report_access_state",
  "unreviewed_cms_text",
  "frontend_fallback_copy",
  "private_report_text",
  "full_private_result_payload",
  "hidden_repair_drafts",
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

describe("RIASEC Career Graph bridge common contract", () => {
  it("declares the producing, receiving, gate, and observer agents", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(contract.schema_version).toBe("fermatmind.riasec_career_graph_bridge_common_contract.v1");
    expect(contract.task_id).toBe("RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01");
    expect(contract.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.producing_agent).toBe("riasec_result_page");
    expect(contract.receiving_agent).toBe("career_content_graph");
    expect(contract.gate_agent).toBe("claim_privacy_safety_gate");
    expect(contract.observer_agent).toBe("analytics_gsc_opportunity");
    expect(contract.canonical_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(contract.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
  });

  it("allows only public-safe reviewed bridge input classes", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.allowed_input_classes)).toEqual(EXPECTED_ALLOWED_INPUTS);
  });

  it("blocks raw, private, trace, fallback, and unreviewed input classes", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.forbidden_input_classes)).toEqual(EXPECTED_FORBIDDEN_INPUTS);
  });

  it("separates safe planning outputs from forbidden recommendation outputs", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.allowed_output_types)).toEqual(
      expect.arrayContaining([
        "career_exploration_prompt",
        "major_exploration_prompt",
        "activity_pattern_prompt",
        "work_environment_prompt",
        "internal_link_candidate",
        "content_cluster_candidate",
        "cms_dry_run_candidate",
        "claim_gate_request",
        "blocked_recommendation_report",
      ])
    );
    expect(asStringArray(contract.forbidden_output_types)).toEqual(
      expect.arrayContaining([
        "deterministic_career_recommendation",
        "admissions_prediction",
        "hiring_prediction",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "ability_ranking",
        "job_fit_score",
        "user_ranking",
        "occupation_ranking_as_objective_truth",
        "private_result_based_recommendation",
        "raw_score_based_match_reason",
      ])
    );
  });

  it("requires examples-only phrase families and blocks deterministic claim language", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.required_bridge_phrase_family)).toEqual([
      "examples_to_explore",
      "work_activities_to_compare",
      "career_areas_to_learn_about",
      "majors_or_roles_with_similar_activity_patterns",
      "starting_point_not_decision",
    ]);
    expect(asStringArray(contract.forbidden_bridge_phrase_family)).toEqual(
      expect.arrayContaining([
        "best_career_for_you",
        "guaranteed_fit",
        "you_should_choose",
        "you_will_succeed",
        "hire_or_do_not_hire",
        "admissions_decision",
        "salary_prediction",
        "performance_prediction",
        "ability_measurement",
        "official_holland_type_determines_your_career",
        "low_score_means_cannot_do_this",
      ])
    );
  });

  it("keeps source classification and claim boundaries explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const claimBoundary = asRecord(contract.claim_boundary);

    expect(asStringArray(contract.source_classification_vocabulary)).toEqual(
      expect.arrayContaining([
        "backend_authority_public_projection",
        "backend_reviewed_example",
        "fap_web_consumer_contract",
        "runtime_qa_handoff",
        "analytics_handoff",
        "claim_safety_gate_artifact",
        "missing_review_ledger",
        "blocked_private_or_unreviewed_source",
      ])
    );
    expect(asStringArray(claimBoundary.allowed)).toContain("examples_only");
    expect(asStringArray(claimBoundary.forbidden)).toContain("deterministic_career_recommendation");
    expect(asStringArray(claimBoundary.forbidden)).toContain("raw_score_based_match_reason");
  });

  it("preserves hard HOLD actions and negative guarantees", () => {
    const contract = readJson(CONTRACT_PATH);
    const guarantees = asRecord(contract.negative_guarantees);

    expect(asStringArray(contract.hard_hold_action_assertions)).toEqual(
      expect.arrayContaining([
        "no_cms",
        "no_publish",
        "no_search_submission",
        "no_provider_calls",
        "no_deploy",
        "no_runtime_instrumentation",
        "no_career_graph_runtime_mutation",
        "no_generated_pages",
        "no_production_import",
        "no_opportunity_scoring",
        "no_search_channel_mutation",
        "no_raw_private_data",
        "no_deterministic_career_recommendation",
        "no_admissions_hiring_salary_performance_success_ability_claims",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.career_graph_runtime_mutation).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.raw_private_result_accessed).toBe("none");
  });

  it("keeps markdown aligned with the machine contract", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_FOR_POLICY_HANDOFF`");
    expect(report).toContain("Producing agent: `riasec_result_page`");
    expect(report).toContain("Receiving agent: `career_content_graph`");
    expect(report).toContain("supported forms: `riasec_60`, `riasec_140`");
    expect(report).toContain("`raw_scores`");
    expect(report).toContain("`deterministic_career_recommendation`");
    expect(report).toContain("`starting_point_not_decision`");
    expect(report).toContain("`no_career_graph_runtime_mutation`");
  });

  it("registers only the authorized RIASEC Career Graph bridge PR train ids", () => {
    const train = readText(TRAIN_PATH);
    const state = readJson(STATE_PATH);
    const stateIds = asRecordArray(state.prs).map((entry) => entry.id);

    for (const id of TRAIN_IDS) {
      expect(train).toContain(`id: ${id}`);
      expect(stateIds).toContain(id);
    }
    expect(train).not.toContain("id: RIASEC-GAOKAO-MAJOR-CLUSTER-PLAN-01");
    expect(train).not.toContain("id: RIASEC-CAREER-GRAPH-CMS-DRY-RUN-READINESS-SCAN-01");
  });

  it("keeps current branch scope limited to PR1 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_CAREER_GRAPH_BRIDGE_COMMON_CONTRACT_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-career-graph-bridge-common-contract-01");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-bridge-common-contract-2026-06-23.md");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-career-graph-bridge-common-contract.contract.test.ts");
  });
});
