import type { ReportResponse } from "@/lib/api/v0_3";

export const EQ_CONTRACT_RELEASE_ID = "11111111-1111-4111-8111-111111111111";
export const EQ_CONTRACT_SOURCE_HASH = "a".repeat(64);
export const EQ_CONTRACT_COMPILED_HASH = "b".repeat(64);
export const EQ_CONTRACT_PAYLOAD_HASH = "c".repeat(64);

export type EqContractScenario = "standard" | "low_confidence";

export type EqRendererContractFixture = {
  case_id: string;
  locale: "zh-CN" | "en";
  report_access: { payload: Record<string, unknown> };
  report: Record<string, unknown>;
};

function marker(locale: "zh-CN" | "en", field: string): string {
  return `BACKEND_COPY[${locale}:${field}]`;
}

function copyFields(locale: "zh-CN" | "en", prefix: string, fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, marker(locale, `${prefix}.${field}`)]));
}

export function buildEqRendererContractFixture(
  locale: "zh-CN" | "en" = "en",
  scenario: EqContractScenario = "standard"
): EqRendererContractFixture {
  const lowConfidence = scenario === "low_confidence";
  const formulationId = lowConfidence ? "low_confidence_result" : "contract_standard";
  const routeId = lowConfidence ? "route.eq.low_confidence_result.contract" : "route.eq.contract_standard.primary";
  const actionId = lowConfidence ? "retest_reflection" : "contract_action";
  const dimensionCodes = ["SA", "ER", "EM", "RM"];
  const selectedAssetIds = {
    core_formulation_id: formulationId,
    mechanism_ids: lowConfidence ? [] : ["contract_mechanism"],
    scene_ids: lowConfidence ? [] : ["contract_scene"],
    scene_variant_ids: lowConfidence ? [] : ["contract_scene"],
    career_environment_ids: lowConfidence ? [] : ["contract_career"],
    action_prescription_id: actionId,
  };
  const signalSignature = {
    schema: "eq60.signal_signature.v1",
    route_id: routeId,
    formulation_id: formulationId,
    route_priority: 1,
    route_claim_risk: lowConfidence ? "high" : "medium",
    quality_level: lowConfidence ? "low" : "high",
    confidence_label: lowConfidence ? "low confidence" : "high confidence",
    dimension_states: Object.fromEntries(dimensionCodes.map((code) => [code, "contract_band"])),
    strongest_dimension: lowConfidence ? "" : "SA",
    development_lever: lowConfidence ? "" : "RM",
    match_pattern: lowConfidence ? "quality_low_overrides_dimension_pattern" : "contract_pattern",
  };

  const report: Record<string, unknown> = {
    schema_version: "eq_60.report.v2",
    scale_code: "EQ_60",
    eq_report_mode: "self_report",
    measurement_type: "self_report_trait_mixed_ei",
    variant: "full",
    locale,
    access: { all_results_free: true, locked: false, blur: false, paywall: false },
    quality: {
      level: lowConfidence ? "low" : "high",
      confidence_label: lowConfidence ? "low confidence" : "high confidence",
      flags: lowConfidence ? ["SPEEDING"] : [],
      explanation_asset_id: `quality.${scenario}`,
    },
    scores: {
      global: { code: "GLOBAL", standard_score: 50, percentile: 50, label: marker(locale, "score.global.label") },
      dimensions: Object.fromEntries(dimensionCodes.map((code, index) => [code, {
        code,
        standard_score: 50 + index,
        percentile: 50 + index,
        band: "contract_band",
        display_band: "contract_band",
        label: marker(locale, `score.${code}.label`),
      }])),
    },
    dimension_summary: dimensionCodes.map((code, index) => ({
      code,
      standard_score: 50 + index,
      percentile: 50 + index,
      band: "contract_band",
      display_band: "contract_band",
      label: marker(locale, `score.${code}.label`),
    })),
    interpretation: {
      route_id: routeId,
      signal_signature: signalSignature,
      core_formulation_id: formulationId,
      strongest_dimension: lowConfidence ? "" : "SA",
      development_lever: lowConfidence ? "" : "RM",
      dimension_ranking: {
        strongest: { status: lowConfidence ? "suppressed" : "unique", codes: lowConfidence ? [] : ["SA"] },
        development: { status: lowConfidence ? "suppressed" : "unique", codes: lowConfidence ? [] : ["RM"] },
      },
      primary_mechanism_ids: selectedAssetIds.mechanism_ids,
      primary_scene_ids: selectedAssetIds.scene_ids,
      career_environment_ids: selectedAssetIds.career_environment_ids,
      action_prescription_id: actionId,
      selected_asset_ids: selectedAssetIds,
    },
    asset_refs: {
      personalization_route_id: routeId,
      signal_signature: signalSignature,
      selected_asset_ids: selectedAssetIds,
    },
    assets: {
      result_snapshot: {
        id: `snapshot.${scenario}`,
        ...copyFields(locale, "snapshot", ["headline", "core_judgment", "evidence_point", "top_strength", "likely_cost", "minimal_action", "share_safe_sentence", "continue_path", "do_not_overread"]),
        three_sentence_summary: [marker(locale, "snapshot.summary")],
      },
      personalization_route: {
        id: routeId,
        signal_signature: signalSignature,
        selected_asset_ids: selectedAssetIds,
        ...copyFields(locale, "route", ["route_headline", "why_this_feels_specific", "evidence_snapshot_label", "next_best_action", "save_reason", "why_this_route_exists", "do_not_overread"]),
        claim_risk: lowConfidence ? "high" : "medium",
      },
      quality: { explanation_asset_id: `quality.${scenario}`, confidence_label: lowConfidence ? "low confidence" : "high confidence" },
      quality_confidence: {
        id: `quality.${scenario}`,
        ...copyFields(locale, "quality", ["label", "body", "user_guidance", "retest_note", "why_this_level", "how_to_read", "do_not_overread"]),
      },
      scientific_contract: copyFields(locale, "science", ["test_definition", "self_report_statement", "non_clinical_statement", "non_hiring_statement", "non_ability_statement", "norm_status_statement", "quality_rules_statement", "version_statement"]),
      score_system: {
        global_index: copyFields(locale, "score.global", ["label", "meaning"]),
        dimensions: Object.fromEntries(dimensionCodes.map((code) => [code, {
          label: marker(locale, `score.${code}.label`),
          definition: marker(locale, `score.${code}.definition`),
          band_explanations: { contract_band: marker(locale, `score.${code}.band`) },
        }])),
      },
      core_formulation: {
        id: formulationId,
        ...copyFields(locale, "formulation", ["title", "one_liner", "core_claim", "primary_strength", "likely_cost", "development_lever", "do_not_overread"]),
        evidence_basis: [marker(locale, "formulation.evidence_basis")],
      },
      mechanisms: lowConfidence ? [] : [{ id: "contract_mechanism", ...copyFields(locale, "mechanism", ["title", "why_it_matters", "what_it_feels_like", "strength", "cost", "development_lever", "micro_action"]) }],
      reality_scenes: lowConfidence ? [] : [{ id: "contract_scene", ...copyFields(locale, "scene", ["title", "typical_response", "strength", "cost", "better_move", "micro_script", "why_this_matters", "reflection_prompt", "tiny_experiment", "do_not_overread"]), evidence_signals: [marker(locale, "scene.evidence_signal")] }],
      career_environment: lowConfidence ? [] : [{ id: "contract_career", level: "medium", ...copyFields(locale, "career", ["label", "meaning", "fit_signal", "strain_signal", "what_to_verify", "interview_question", "team_risk", "safe_experiment", "recovery_condition"]), role_observation_checklist: [marker(locale, "career.checklist")] }],
      action_prescription: {
        id: actionId,
        ...copyFields(locale, "action", ["title", "why_this_matters", "do_today", "script", "watch_out", "common_failure", "repair_move"]),
        seven_day_plan: [marker(locale, "action.plan")],
      },
      commercial_conversion_actions: lowConfidence ? [] : [{ id: "eq.conversion.agent_entry", ...copyFields(locale, "agent_entry", ["title", "body", "cta_label", "do_not_overread"]) }],
      result_page_depth_modules: lowConfidence ? [] : [{ id: "contract_depth", placement: "evidence snapshot", ...copyFields(locale, "depth", ["title", "body"]), bullets: [marker(locale, "depth.bullet")], claim_risk: "low" }],
      psychometric_evidence_status: [{ id: "contract_evidence", status: "preliminary", ...copyFields(locale, "evidence", ["label", "user_facing_status_label", "summary", "user_meaning", "what_this_means_for_user", "validation_step", "next_validation_step", "do_not_overread"]) }],
      cross_assessment_context: lowConfidence ? [] : [{ id: "contract_cross", ...copyFields(locale, "cross", ["title", "summary", "how_to_use", "claim_boundary"]) }],
      agent_dialogue_playbooks: [],
      backend_integration_contract: [],
      sjt_bridge: { id: "eq.sjt_bridge.planned", available: false, status: "planned" },
    },
    next_module: { available: false, module_code: "EQ_SJT_16", status: "planned", cta_asset_id: "eq.sjt_bridge.planned" },
    methodology: { norm_status: "provisional", scoring_version: "contract_scoring_v1", report_version: "contract_report_v1", content_version: "EQ_60/v1" },
    _meta: {
      eq60_private_result_authority: {
        schema_version: "fap.eq60.private_result_authority.v1",
        authority_id: "FERMATMIND_EQ_60_BILINGUAL_CANONICAL",
        mode: "canonical_active_release",
        release_id: EQ_CONTRACT_RELEASE_ID,
        pack_id: "EQ_60",
        pack_version: "v1",
        locale,
        locales: ["zh-CN", "en"],
        source_hash: EQ_CONTRACT_SOURCE_HASH,
        compiled_hash: EQ_CONTRACT_COMPILED_HASH,
      },
      snapshot_binding_v1: {
        schema_version: "fap.eq60.snapshot_binding.v1",
        canonical_authority_identity: "FERMATMIND_EQ_60_BILINGUAL_CANONICAL",
        canonical_release_id: EQ_CONTRACT_RELEASE_ID,
        canonical_source_hash: EQ_CONTRACT_SOURCE_HASH,
        canonical_compiled_hash: EQ_CONTRACT_COMPILED_HASH,
        canonical_payload_sha256: EQ_CONTRACT_PAYLOAD_HASH,
        locale,
        pack_version: "v1",
      },
    },
  };

  return {
    case_id: `EQ60_RENDERER_CONTRACT_${scenario.toUpperCase()}_${locale}`,
    locale,
    report_access: { payload: { locked: false, variant: "full", access_level: "full", offers: [] } },
    report,
  };
}

export function eqReportResponseFromContractFixture(fixture: EqRendererContractFixture): ReportResponse {
  return {
    ok: true,
    locked: false,
    variant: "full",
    access_level: "full",
    offers: [],
    modules_allowed: [],
    modules_preview: [],
    scale_code: "EQ_60",
    report: structuredClone(fixture.report) as ReportResponse["report"],
  };
}
