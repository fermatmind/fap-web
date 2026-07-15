import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json";
const REPORT_PATH = "docs/public-personality/enneagram-public-personality-handoff-common-contract-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const TRAIN_IDS = [
  "ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01",
  "ENNEAGRAM-PUBLIC-PERSONALITY-SOURCE-AUTHORITY-PACKET-01",
  "ENNEAGRAM-PUBLIC-PERSONALITY-CLAIM-SAFETY-PACKET-01",
  "ENNEAGRAM-PUBLIC-PERSONALITY-CANDIDATE-CLUSTER-PACKET-01",
  "ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-MATRIX-01",
];

const EXPECTED_ALLOWED_INPUTS = [
  "public_enneagram_framework_summary",
  "public_type_names_and_labels",
  "public_type_ordering_coarse_safe",
  "public_motivation_pattern_summary",
  "public_center_or_triad_taxonomy_if_authority_supports",
  "public_wing_style_explanatory_taxonomy_if_authority_supports",
  "public_share_summary_safe_text",
  "public_low_quality_state",
  "public_diffuse_state",
  "public_close_call_state",
  "public_method_boundary_copy",
  "public_leans_toward_language",
  "public_closer_to_language",
  "public_may_reflect_language",
  "public_safe_cta_take_test",
  "public_safe_cta_compare_big_five",
  "public_safe_cta_compare_mbti",
  "locale",
  "public_projection_version",
  "public_quality_state",
  "public_safe_source_classification",
];

const EXPECTED_FORBIDDEN_INPUTS = [
  "attempt_id",
  "user_id",
  "raw_score",
  "display_score",
  "score_vector",
  "dominance_gap_abs",
  "dominance_gap_pct",
  "release_hash",
  "registry_hash",
  "content_hash",
  "schema_projection_internal_context",
  "source_refs",
  "qa_traces",
  "editor_notes",
  "private_report_text",
  "full_private_result_payload",
  "private_pdf_payload",
  "private_share_payload",
  "report_token",
  "private_result_url",
  "payment_state",
  "order_state",
  "benefit_state",
  "hidden_repair_drafts",
  "generated_candidate_payload_not_public_safe",
  "frontend_fallback_copy_as_authority",
  "final_type_certainty",
  "most_accurate_type_finality",
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

describe("Enneagram Public Personality handoff common contract", () => {
  it("declares the producing, receiving, gate, and observer agents", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(contract.schema_version).toBe("fermatmind.enneagram_public_personality_handoff_common_contract.v1");
    expect(contract.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01");
    expect(contract.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.producing_agent).toBe("enneagram_result_page");
    expect(contract.receiving_agent).toBe("public_personality_content");
    expect(contract.gate_agent).toBe("claim_privacy_safety_gate");
    expect(asStringArray(contract.observer_agents)).toEqual(["seo_geo_control", "analytics_gsc_opportunity"]);
    expect(contract.scan_verdict).toBe("ENNEAGRAM_AUTHORITY_V2_116_PAGE_GOVERNANCE_ALIGNED");
    expect(contract.public_personality_content_agent_state).toBe("authority_v2_governance_aligned");
  });

  it("allows only public-safe Enneagram handoff input classes", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.allowed_input_classes)).toEqual(EXPECTED_ALLOWED_INPUTS);
  });

  it("blocks private, score, trace, hash, fallback, and finality-producing inputs", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.forbidden_input_classes)).toEqual(EXPECTED_FORBIDDEN_INPUTS);
  });

  it("separates safe planning outputs from forbidden public-profile outputs", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.allowed_output_types)).toEqual(
      expect.arrayContaining([
        "public_type_explainer_candidate",
        "public_motivation_pattern_summary",
        "public_center_or_triads_explainer",
        "public_profile_package_candidate",
        "public_internal_link_candidate",
        "public_article_cluster_candidate",
        "cms_dry_run_candidate",
        "claim_gate_request",
        "private_boundary_report",
        "blocked_public_profile_report",
      ])
    );
    expect(asStringArray(contract.forbidden_output_types)).toEqual(
      expect.arrayContaining([
        "private_result_profile",
        "attempt_based_profile",
        "deterministic_type_assignment",
        "final_type_certainty_claim",
        "clinical_diagnosis",
        "therapy_or_treatment_claim",
        "relationship_guarantee",
        "hiring_or_employment_suitability_claim",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "score_based_personality_ranking",
        "raw_result_based_profile",
        "private_report_text_rewrite",
        "public_page_generated_from_private_result_body",
      ])
    );
  });

  it("requires reflective phrase families and blocks deterministic or diagnostic language", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.allowed_phrase_family)).toEqual([
      "may_reflect",
      "often_described_as",
      "can_be_used_for_reflection",
      "public_summary_only",
      "motivation_pattern",
      "not_fixed_identity",
      "not_diagnostic",
      "not_relationship_verdict",
    ]);
    expect(asStringArray(contract.forbidden_phrase_family)).toEqual(
      expect.arrayContaining([
        "you_are_this_type",
        "definitely_type",
        "final_type",
        "most_accurate_type",
        "clinical_diagnosis",
        "treatment_plan",
        "relationship_match_guarantee",
        "hiring_decision",
        "success_prediction",
        "performance_prediction",
      ])
    );
  });

  it("keeps source classification and claim boundaries explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const claimBoundary = asRecord(contract.claim_boundary);

    expect(asStringArray(contract.source_classification_vocabulary)).toEqual(
      expect.arrayContaining([
        "backend_authority_public_content_asset",
        "backend_authority_public_share_summary",
        "result_page_readiness_handoff",
        "runtime_qa_handoff",
        "analytics_handoff",
        "claim_safety_gate_artifact",
        "authority_v2_source_ledger_pending_pr07",
        "blocked_private_or_unreviewed_source",
        "frontend_consumer_contract_not_authority",
      ])
    );
    expect(asStringArray(claimBoundary.allowed)).toContain("motivation_pattern_reflection");
    expect(asStringArray(claimBoundary.allowed)).toContain("non_diagnostic_note");
    expect(asStringArray(claimBoundary.forbidden)).toContain("final_fixed_type_certainty");
    expect(asStringArray(claimBoundary.forbidden)).toContain("relationship_guarantee");
  });

  it("locks Authority V2 estate, review truth, and working revision isolation", () => {
    const contract = readJson(CONTRACT_PATH);
    const estate = asRecord(contract.authority_v2_estate);
    const workflow = asRecord(contract.authority_v2_workflow_truth);

    expect(estate.identity_count).toBe(58);
    expect(estate.page_count).toBe(116);
    expect(estate.locales).toEqual(["en", "zh-CN"]);
    expect(asStringArray(contract.first_public_personality_scope)).toEqual([
      "hub",
      "center",
      "core_type",
      "wing",
      "instinctual_subtype",
    ]);
    expect(workflow.independent_bilingual_drafting).toBe(true);
    expect(workflow.source_ledger_state).toBe("required_pending_pr07");
    expect(workflow.unreviewed_state).toBe("pending_manual_review");
    expect(workflow.model_review_is_human_review).toBe(false);
    expect(workflow.working_revision_isolated).toBe(true);
    expect(workflow.published_primary_mutation_allowed).toBe(false);
    expect(workflow.public_revision_pointer_mutation_allowed).toBe(false);
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
        "no_public_personality_runtime_mutation",
        "no_generated_pages",
        "no_backend_import",
        "no_candidate_activation",
        "no_opportunity_scoring",
        "no_search_channel_mutation",
        "no_raw_private_data",
        "no_private_result_text",
        "no_final_type_certainty",
        "no_diagnosis_therapy_treatment_hiring_salary_performance_success_relationship_claims",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.public_personality_runtime_mutation).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.raw_private_result_accessed).toBe("none");
    expect(guarantees.private_result_text_reused).toBe("none");
  });

  it("keeps markdown aligned with the machine contract", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_FOR_POLICY_HANDOFF`");
    expect(report).toContain("Producing agent: `enneagram_result_page`");
    expect(report).toContain("Receiving agent: `public_personality_content`");
    expect(report).toContain("Public Personality Content Agent state: `authority_v2_governance_aligned`");
    expect(report).toContain("58 identities across `en` and `zh-CN`");
    expect(report).toContain("Model/agent QA is not human review");
    expect(report).toContain("Negative guarantees");
    expect(report).toContain("raw private result accessed: none");
  });

  it("registers only the authorized five-PR train and the current PR scope helper", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);
    const train = readText(TRAIN_PATH);
    const state = readText(STATE_PATH);

    for (const id of TRAIN_IDS) {
      expect(train).toContain(id);
      expect(state).toContain(id);
    }

    expect(scopeHelper).toContain("codex/enneagram-public-personality-handoff-common-contract-01");
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-handoff-common-contract-2026-06-23.md");
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json");
    expect(scopeHelper).toContain("tests/contracts/enneagram-public-personality-handoff-common-contract.contract.test.ts");
  });
});
