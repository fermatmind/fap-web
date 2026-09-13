import type { ReportResponse } from "@/lib/api/v0_3";

export const SOURCE_HASH = "a".repeat(64);
export const COMPILED_HASH = "b".repeat(64);

export function authority(
  sourceHash = SOURCE_HASH,
  compiledHash = COMPILED_HASH,
) {
  return {
    schema_version: "fap.riasec.private_result_authority.v1",
    authority_id: "FERMATMIND_RIASEC_PRIVATE_RESULT_ZH_CN_CANONICAL",
    mode: "canonical",
    locale: "zh-CN",
    source_hash: sourceHash,
    compiled_hash: compiledHash,
    compiled_schema: "fap.riasec.private_result.compiled.v1",
    compiler_schema: "fap.riasec.private_result.compiler.v1",
    compiler_version: "1.0.0",
    runtime_contract: "riasec.report.v1",
  };
}

export function canonicalReport(): ReportResponse {
  const privateAuthority = authority();
  return {
    ok: true,
    scale_code: "RIASEC",
    report: {
      scale_code: "RIASEC",
      _meta: { riasec_private_result_authority: privateAuthority },
    },
    riasec_private_result_authority: privateAuthority,
    riasec_public_projection_v2: {
      schema_version: "riasec.public_projection.v2",
      scale_code: "RIASEC",
      locale: "zh-CN",
      private_result_authority: privateAuthority,
      holland_code: {
        code: "RIA",
        primary_type: "实作型",
        secondary_type: "研究型",
        tertiary_type: "艺术型",
      },
      scores: {
        dimensions: ["R", "I", "A", "S", "E", "C"].map((code, index) => ({
          code,
          label: code,
          score: 90 - index * 10,
        })),
      },
      form: {
        form_code: "riasec_60",
        question_count: 60,
        raw_score_delta_allowed: false,
      },
      measurement_evidence: { snapshot_bound: true },
      quality: { quality_state: "normal", grade: "A", flags: [] },
      interpretation_state: {},
      module_visibility_policy: {
        schema_version: "riasec.module_visibility_policy.v1",
        modules: [],
        fallback_policy: { frontend_inference_allowed: false },
      },
      deep_content_slots_v1: {
        schema_version: "riasec.deep_content_slots.v1",
        scale_code: "RIASEC",
        locale: "zh-CN",
        slots: [],
        source_policy: { frontend_fallback_allowed: false },
        slot_visibility_policy: { frontend_inference_allowed: false },
      },
      lifecycle_copy_v1: {
        schema_version: "riasec.lifecycle_copy.v1",
        frontend_fallback_allowed: false,
        measured_payload_mutation_allowed: false,
        report_snapshot_mutation_allowed: false,
        raw_feedback_public_exposure_allowed: false,
        internal_snapshot_id_public_exposure_allowed: false,
        life_stage_public_exposure_allowed: false,
        organization_context_public_exposure_allowed: false,
        surfaces: [],
        faq_items: [],
      },
      activity_explorer_v0_1: {
        schema_version: "riasec.activity_explorer.v0.1",
        dimension_activity_families: [],
        code_activity_pack: { activities: [] },
      },
    },
  };
}
