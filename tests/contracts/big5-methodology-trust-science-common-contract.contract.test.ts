import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const JSON_PATH = "docs/methodology-trust-science/big5-methodology-trust-science-common-contract.v1.json";
const DOC_PATH = "docs/methodology-trust-science/big5-methodology-trust-science-common-contract-2026-06-23.md";
const MANIFEST_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

describe("Big Five methodology/trust/science common contract", () => {
  it("declares the producing, receiving, gate, and observer agents", () => {
    const contract = readJson(JSON_PATH);
    const scope = asRecord(contract.scope);

    expect(contract.schema_version).toBe("fermatmind.big5_methodology_trust_science.common_contract.v1");
    expect(contract.task_id).toBe("BIG5-METHODOLOGY-TRUST-SCIENCE-COMMON-CONTRACT-01");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.verdict).toBe("READY_FOR_POLICY_HANDOFF");

    expect(scope.producer_agent).toBe("big_five_result_page");
    expect(asStringArray(scope.receiving_agents)).toEqual(
      expect.arrayContaining(["methodology_trust_science_support", "seo_geo_control", "cms_draft_package"])
    );
    expect(scope.gate_agent).toBe("claim_privacy_safety_gate");
    expect(scope.optional_observer).toBe("analytics_gsc_opportunity");
  });

  it("keeps allowed and forbidden input/output taxonomies explicit", () => {
    const contract = readJson(JSON_PATH);

    expect(asStringArray(contract.allowed_input_classes)).toEqual(
      expect.arrayContaining([
        "public_big_five_ocean_trait_labels",
        "public_five_factor_model_summary",
        "backend_owned_sanitized_big5_v2_evidence",
        "sanitized_share_safety_evidence",
        "public_safe_source_classification",
        "public_method_trust_page_candidates",
      ])
    );
    expect(asStringArray(contract.forbidden_input_classes)).toEqual(
      expect.arrayContaining([
        "raw_scores",
        "raw_score_vectors",
        "percentiles",
        "selector_traces",
        "private_attempt_id",
        "private_result_payload",
        "private_report_body_text",
        "frontend_fallback_copy_as_authority",
        "generated_artifact_without_source_classification",
        "official_32_type_claim",
        "fixed_type_mapping",
      ])
    );
    expect(asStringArray(contract.allowed_output_types)).toEqual(
      expect.arrayContaining([
        "methodology_boundary_candidate",
        "reliability_validity_explainer_candidate",
        "assessment_science_explainer_candidate",
        "big_five_vs_mbti_method_comparison_candidate",
        "big_five_vs_riasec_work_style_candidate",
        "claim_gate_request",
        "blocked_science_claim_report",
      ])
    );
    expect(asStringArray(contract.forbidden_output_types)).toEqual(
      expect.arrayContaining([
        "clinical_diagnosis",
        "therapy_or_treatment_claim",
        "hiring_or_employment_suitability_claim",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "fixed_type_assignment",
        "official_32_type_claim",
        "publishable_article_body",
        "cms_payload",
      ])
    );
  });

  it("preserves source classification and hard HOLD boundaries", () => {
    const contract = readJson(JSON_PATH);
    const negativeGuarantees = asRecord(contract.negative_guarantees);

    expect(asStringArray(contract.source_classification)).toEqual(
      expect.arrayContaining([
        "backend_authority",
        "cms_public_api_authority",
        "fap_web_consumer_contract",
        "result_page_agent_evidence",
        "runtime_qa_artifact",
        "analytics_handoff_artifact",
        "safety_gate_artifact",
        "generated_artifact",
        "fixture",
        "mock",
        "unknown",
        "access_required",
      ])
    );
    expect(asStringArray(contract.hard_hold_actions)).toEqual(
      expect.arrayContaining([
        "no_CMS",
        "no_publish",
        "no_search_submission",
        "no_provider_calls",
        "no_deploy",
        "no_runtime_instrumentation",
        "no_methodology_trust_science_runtime_mutation",
        "no_generated_pages",
        "no_raw_private_data",
        "no_private_result_text",
        "no_fixed_type_claim",
        "no_official_32_type_claim",
        "no_diagnosis_therapy_treatment_hiring_salary_performance_success_relationship_life_outcome_claims",
      ])
    );
    expect(negativeGuarantees).toMatchObject({
      methodology_pages_generated: false,
      publishable_article_body_generated: false,
      cms_package_generated: false,
      cms_write_performed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      runtime_changed: false,
      analytics_instrumentation_added: false,
      private_result_data_accessed: false,
      fap_api_modified: false,
    });
  });

  it("documents the non-generation and non-runtime boundary in the markdown handoff", () => {
    const doc = readText(DOC_PATH);

    expect(doc).toContain("Verdict: `READY_FOR_POLICY_HANDOFF`");
    expect(doc).toContain("does not generate public methodology pages");
    expect(doc).toContain("does not generate public methodology pages, trust pages, science articles, CMS packages");
    expect(doc).toContain("The next safe PRs are:");
    expect(doc).toContain("BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01");
    expect(doc).toContain("BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01");
  });

  it("registers only the authorized Big Five methodology/trust/science train entries", () => {
    const manifest = readText(MANIFEST_PATH);
    const state = readJson(STATE_PATH);
    const prs = Array.isArray(state.prs) ? state.prs.map(asRecord) : [];
    const ids = [
      "BIG5-METHODOLOGY-TRUST-SCIENCE-COMMON-CONTRACT-01",
      "BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01",
      "BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01",
      "BIG5-METHODOLOGY-CANDIDATE-CLUSTER-MATRIX-01",
      "BIG5-METHODOLOGY-TRUST-SCIENCE-READINESS-MATRIX-01",
    ];

    for (const id of ids) {
      expect(manifest).toContain(`id: ${id}`);
      expect(prs.some((pr) => pr.id === id)).toBe(true);
    }
  });
});
