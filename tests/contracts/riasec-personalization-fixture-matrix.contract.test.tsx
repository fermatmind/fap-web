import fs from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { buildRiasecTrustedResultTrackingPayload } from "@/lib/riasec/tracking";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const MATRIX_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/personalization-fixture-matrix.v2.json");

type Visibility = "visible" | "collapsed" | "hidden";

type MatrixCase = {
  id: string;
  form_code: "riasec_60" | "riasec_140";
  profile_shape: string;
  quality_state: string;
  reading_strength: string;
  near_tie_state: string;
  alternate_code_show: boolean;
  alternate_codes?: string[];
  structural_difference_state?: string;
  pending_runtime_assertions?: string[];
  occupation_source_status?: string;
  module_visibility: Record<string, Visibility>;
};

type FixtureMatrix = {
  schema_version: string;
  runtime_boundary: {
    frontend_interpretation_inference_allowed: boolean;
    career_examples_policy: string;
    feedback_mutates_measured_result: boolean;
    formal_report_ai_generation_allowed: boolean;
  };
  allowed_profile_shapes: string[];
  allowed_quality_states: string[];
  allowed_reading_strengths: string[];
  forbidden_claim_fragments: string[];
  cases: MatrixCase[];
};

function readMatrix(): FixtureMatrix {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8")) as FixtureMatrix;
}

function caseById(id: string): MatrixCase {
  const match = readMatrix().cases.find((fixtureCase) => fixtureCase.id === id);
  if (!match) {
    throw new Error(`missing fixture case: ${id}`);
  }

  return match;
}

function buildReport(fixtureCase: MatrixCase): ReportResponse {
  const is140 = fixtureCase.form_code === "riasec_140";
  const scoreSpaceVersion = is140
    ? "riasec_140_likert5_contextual_sum_space.v1"
    : "riasec_60_likert5_activity_sum_space.v1";
  const alternateCodes = fixtureCase.alternate_codes ?? [];
  const occupationSourceStatus = fixtureCase.occupation_source_status ?? "content_example_not_registry_match";

  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: {
      form_code: fixtureCase.form_code,
      label: is140 ? "RIASEC 140Q" : "RIASEC 60Q",
      question_count: is140 ? 140 : 60,
      estimated_minutes: is140 ? 18 : 8,
    },
    riasec_public_projection_v1: {
      top_code: "IAS",
      primary_type: "I",
      secondary_type: "A",
      tertiary_type: "S",
      clarity_index: 0.62,
      breadth_index: 0.38,
      quality_grade: fixtureCase.quality_state === "low_quality" ? "C" : "A",
      quality_flags: fixtureCase.quality_state === "normal" ? [] : ["contract_fixture_flag"],
      scores_0_100: { R: 42, I: 82, A: 66, S: 58, E: 28, C: 44 },
      dimension_labels: {
        R: "现实型",
        I: "研究型",
        A: "艺术型",
        S: "社会型",
        E: "企业型",
        C: "常规型",
      },
      enhanced_breakdown: is140
        ? {
            activity: { I: 82, A: 66, S: 58 },
            environment: { I: 76, A: 70, S: 61 },
            role: { I: 79, A: 72, S: 64 },
          }
        : {},
    },
    riasec_public_projection_v2: {
      schema_version: "riasec.public_projection.v2",
      holland_code: {
        code: "IAS",
        primary_type: "I",
        secondary_type: "A",
        tertiary_type: "S",
      },
      scores: {
        score_kind: "dimension_scores_0_100",
        dimensions: [
          { code: "R", label: "现实型", score: 42 },
          { code: "I", label: "研究型", score: 82 },
          { code: "A", label: "艺术型", score: 66 },
          { code: "S", label: "社会型", score: 58 },
          { code: "E", label: "企业型", score: 28 },
          { code: "C", label: "常规型", score: 44 },
        ],
      },
      form: {
        form_code: fixtureCase.form_code,
        question_count: is140 ? 140 : 60,
        form_kind: is140 ? "contextual" : "standard",
        score_space_version: scoreSpaceVersion,
        compare_compatibility_group: `RIASEC:${fixtureCase.form_code}:${scoreSpaceVersion}`,
        cross_form_comparable: false,
        raw_score_delta_allowed: false,
      },
      measurement_evidence: {
        measurement_contract_version: "riasec.measurement_contract.v1",
        scoring_spec_version: is140 ? "riasec_contextual_140_v1" : "riasec_standard_60_v1",
        form_version: is140 ? "v1-contextual-140" : "v1-standard-60",
        score_space_version: scoreSpaceVersion,
        quality_rule_version: "riasec_quality_rule_spec_v2",
        interpretation_rule_version: "riasec_interpretation_rule_spec_v2",
        quality_rule_status: is140 ? "contextual_quality_flags_supported" : "minimal_answer_completion_only",
        validation_status: "runtime_contract_defined_validation_pending",
        snapshot_bound: true,
      },
      quality: {
        grade: fixtureCase.quality_state === "low_quality" ? "C" : "A",
        flags: fixtureCase.quality_state === "normal" ? [] : ["contract_fixture_flag"],
        quality_state: fixtureCase.quality_state,
        low_quality_strength:
          fixtureCase.quality_state === "low_quality"
            ? "low_quality_boundary_triggered"
            : "not_available_for_strong_low_quality",
      },
      content_boundary: {
        occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      },
      interpretation_state: {
        interpretation_rule_version: "riasec_interpretation_rule_spec_v2",
        profile_shape: fixtureCase.profile_shape,
        profile_shape_version: "riasec_profile_shape_v2_0",
        clarity_label: fixtureCase.profile_shape === "low_quality" ? "not_readable" : "medium_high",
        near_tie_state: {
          state: fixtureCase.near_tie_state,
          dimensions: fixtureCase.near_tie_state === "none" ? [] : ["I", "A"],
        },
        alternate_code: {
          show: fixtureCase.alternate_code_show,
          codes: alternateCodes,
          display_boundary: fixtureCase.alternate_code_show
            ? "reading aid only, not a second measured result"
            : "",
        },
        alternate_code_reason: fixtureCase.alternate_code_show ? "near_tie_reading_aid" : null,
        top_code_confidence: {
          level: fixtureCase.quality_state === "low_quality" ? "not_available" : "medium",
          meaning: "readability strength, not probability",
        },
        reading_strength: fixtureCase.reading_strength,
        result_page_strategy: {
          primary_reading_mode: fixtureCase.profile_shape === "broad_profile" ? "activity_filter_first" : "single_chain",
        },
        module_visibility_policy_id: "riasec_module_visibility_policy_v1",
        validation_status: "rule_contract_defined_validation_pending",
        field_authority: {
          profile_shape: "backend_owned",
          near_tie_state: "backend_owned",
          alternate_code: "backend_owned",
          top_code_confidence: "backend_owned",
          reading_strength: "backend_owned",
          quality_state: "backend_owned",
        },
      },
      module_visibility_policy: {
        schema_version: "riasec.module_visibility_policy.v1",
        policy_id: "riasec_module_visibility_policy_v1",
        quality_state: fixtureCase.quality_state,
        profile_shape: fixtureCase.profile_shape,
        form_code: fixtureCase.form_code,
        modules: [
          ...Object.entries(fixtureCase.module_visibility).map(([key, visibility]) => ({
            key,
            visibility,
            reason: `${fixtureCase.id}_${key}`,
          })),
          { key: "unknown_future_module", visibility: "visible", reason: "must_fail_closed" },
        ],
        fallback_policy: {
          unknown_module: "hidden",
          missing_backend_state: "hidden",
          frontend_inference_allowed: false,
        },
      },
      activity_explorer_v0_1: {
        schema_version: "riasec.activity_explorer.v0.1",
        content_version: "career_activity_registry_v0.1",
        status: "content_examples_only",
        source_status: "content_example_not_registry_match",
        source_name: "FermatTest Career Activity Registry v0.1",
        boundary: {
          occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
          registry_source_connected: false,
          fit_score_allowed: false,
          success_prediction_allowed: false,
        },
        dimension_activity_families: [
          {
            dimension: "I",
            label: "研究型",
            core_drive: "把问题看清楚，找出原因、证据和结构。",
            activity_families: ["analyze_complex_problems", "organize_evidence_materials"],
            source_status: "content_example_not_registry_match",
          },
        ],
        code_activity_pack: {
          status: "available",
          activities: [
            {
              activity_key: "understand_real_needs",
              activity_label: "理解真实人的需求",
              activity_user_copy: "你不只想研究抽象问题，也想知道真实的人为什么卡住。",
              riasec_dimensions: ["S", "I"],
              source_status: "content_example_not_registry_match",
              task_examples: ["访谈或观察真实用户。", "拆解评论、反馈或投诉。"],
              occupation_examples: [
                {
                  occupation_example: "用户研究助理",
                  source_status: occupationSourceStatus,
                  display_label: "内容示例，非职业数据库匹配",
                  common_tasks: ["拆解用户反馈", "整理需求假设"],
                  skills_to_check: ["访谈", "提问"],
                  education_boundary: "兴趣不等于学历或资格判断。",
                  skill_boundary: "兴趣不等于能力，需要通过学习、作品、练习或真实项目验证相关技能。",
                  qualification_boundary: "涉及专业资质、执业资格或监管领域时，必须遵守资格、证书、教育背景和当地法规。",
                  localization_note: "职业名称、教育路径和资格要求会因国家、地区、行业和组织不同而变化。",
                  not_a_recommendation: true,
                },
              ],
            },
          ],
        },
      },
      exploration_feedback_overlay_v0_1: {
        schema_version: "riasec.exploration_feedback_overlay.v0.1",
        status: "overlay_contract_only",
        feedback_stream_status: "not_connected_v0_1",
        snapshot_bound: true,
        snapshot_identity: {
          snapshot_required: true,
          snapshot_bound: true,
          identity_scope: "projection_snapshot",
          form_code: fixtureCase.form_code,
          score_space_version: scoreSpaceVersion,
          measured_holland_code: "IAS",
        },
        measured_result_guard: {
          scores_mutation_allowed: false,
          holland_code_mutation_allowed: false,
          report_snapshot_mutation_allowed: false,
          measurement_evidence_mutation_allowed: false,
        },
        surface_policy: {
          public_projection_allowed: true,
          share_pdf_exposure_allowed: false,
          raw_feedback_public_exposure_allowed: false,
          formal_report_mutation_allowed: false,
        },
        read_model: {
          has_feedback: false,
          feedback_count: 0,
          latest_feedback_at: null,
          summary_status: "not_available_without_feedback_stream",
          raw_feedback_included: false,
        },
        claim_boundary: {
          feedback_is_measurement: false,
          feedback_changes_scores: false,
          feedback_changes_measured_holland_code: false,
          feedback_is_career_match: false,
          feedback_is_success_prediction: false,
        },
      },
    },
  } as ReportResponse;
}

function renderedTextFor(fixtureCase: MatrixCase): string {
  cleanup();
  const viewModel = assembleRiasecResultViewModel(buildReport(fixtureCase));
  const { container } = render(
    <RiasecResultShell locale="zh" attemptId="attempt-riasec" viewModel={viewModel} />
  );

  return container.textContent ?? "";
}

describe("RIASEC personalization fixture matrix v2", () => {
  it("covers the required personalization states and marks unsupported runtime assertions explicitly", () => {
    const matrix = readMatrix();
    const caseIds = matrix.cases.map((fixtureCase) => fixtureCase.id);

    expect(matrix.schema_version).toBe("riasec.personalization_fixture_matrix.v2");
    expect(matrix.runtime_boundary).toMatchObject({
      frontend_interpretation_inference_allowed: false,
      career_examples_policy: "content_example_not_registry_match",
      feedback_mutates_measured_result: false,
      formal_report_ai_generation_allowed: false,
    });
    expect(caseIds).toEqual([
      "clear_code_normal_60q",
      "blended_code_normal_60q",
      "near_tie_top1_top2_60q",
      "near_tie_top2_top3_60q",
      "broad_profile_60q",
      "low_clarity_60q",
      "low_quality_60q_minimal_boundary",
      "low_quality_60q_incomplete",
      "low_quality_140q_attention_flag",
      "140q_layer_agreement",
      "140q_layer_tension",
      "cross_form_same_structure",
      "cross_form_different_structure",
      "missing_content_fail_closed",
      "occupation_examples_missing_source_status",
      "occupation_examples_content_example_only",
      "feedback_saved_activity",
      "feedback_disagrees_with_result",
      "share_public_safe_normal",
      "pdf_low_quality_cautious_copy",
    ]);
    expect(caseById("occupation_examples_missing_source_status").pending_runtime_assertions).toContain(
      "hide_occupation_examples_when_source_status_missing"
    );
    expect(caseById("feedback_saved_activity").pending_runtime_assertions).toContain("feedback_read_model_saved_activity");
    expect(caseById("feedback_disagrees_with_result").pending_runtime_assertions).toContain(
      "feedback_read_model_disagree_path"
    );
  });

  it("keeps every fixture backend-owned and inside the approved interpretation enums", () => {
    const matrix = readMatrix();

    for (const fixtureCase of matrix.cases) {
      expect(matrix.allowed_profile_shapes).toContain(fixtureCase.profile_shape);
      expect(matrix.allowed_quality_states).toContain(fixtureCase.quality_state);
      expect(matrix.allowed_reading_strengths).toContain(fixtureCase.reading_strength);

      const viewModel = assembleRiasecResultViewModel(buildReport(fixtureCase));
      expect(viewModel.interpretationState).toMatchObject({
        interpretationRuleVersion: "riasec_interpretation_rule_spec_v2",
        profileShape: fixtureCase.profile_shape,
        readingStrength: fixtureCase.reading_strength,
        moduleVisibilityPolicyId: "riasec_module_visibility_policy_v1",
      });
      expect(viewModel.interpretationState?.fieldAuthority).toMatchObject({
        profile_shape: "backend_owned",
        near_tie_state: "backend_owned",
        alternate_code: "backend_owned",
        top_code_confidence: "backend_owned",
        reading_strength: "backend_owned",
      });
      expect(viewModel.moduleVisibilityPolicy?.fallbackPolicy).toMatchObject({
        unknownModule: "hidden",
        missingBackendState: "hidden",
        frontendInferenceAllowed: false,
      });
      expect(viewModel.moduleVisibilityPolicy?.modules.map((moduleState) => moduleState.key)).not.toContain(
        "unknown_future_module"
      );
    }
  });

  it("renders visible modules and fails closed for hidden strong modules", () => {
    const clearText = renderedTextFor(caseById("clear_code_normal_60q"));
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-governed-copy-surface")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-occupation-examples")).toHaveTextContent("内容示例，非职业数据库匹配");
    expect(clearText).toContain("你的前三个兴趣维度依次是");

    const broadText = renderedTextFor(caseById("broad_profile_60q"));
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-governed-copy-surface")).toBeInTheDocument();
    expect(screen.queryByTestId("riasec-occupation-examples")).not.toBeInTheDocument();
    expect(broadText).not.toContain("你的前三个兴趣维度依次是");

    const lowQualityText = renderedTextFor(caseById("low_quality_140q_attention_flag"));
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();
    expect(screen.queryByTestId("riasec-governed-copy-surface")).not.toBeInTheDocument();
    expect(screen.queryByTestId("riasec-activity-pack")).not.toBeInTheDocument();
    expect(screen.queryByTestId("riasec-occupation-examples")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "分享结果" })).toBeInTheDocument();
    expect(lowQualityText).not.toContain("理解真实人的需求");
  });

  it("keeps 140Q context and cross-form fixtures bounded as contextual evidence only", () => {
    for (const fixtureId of [
      "140q_layer_agreement",
      "140q_layer_tension",
      "cross_form_same_structure",
      "cross_form_different_structure",
    ]) {
      const fixtureCase = caseById(fixtureId);
      const viewModel = assembleRiasecResultViewModel(buildReport(fixtureCase));

      expect(viewModel.formCode).toBe("riasec_140");
      expect(viewModel.trustedResultCard?.rawScoreDeltaAllowed).toBe(false);
      expect(viewModel.moduleVisibilityPolicy?.modules.find((moduleState) => moduleState.key === "140q_context_cards")).toMatchObject({
        visibility: "visible",
      });
      expect(renderedTextFor(fixtureCase)).toContain("增强版分层结果");
    }
  });

  it("keeps share/PDF/history and feedback payloads public-safe", () => {
    const viewModel = assembleRiasecResultViewModel(buildReport(caseById("share_public_safe_normal")));
    const payload = buildRiasecTrustedResultTrackingPayload(viewModel, "zh");

    expect(payload).toMatchObject({
      scale_code: "RIASEC",
      form_code: "riasec_60",
      snapshot_bound: true,
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
    });
    expect(payload).not.toHaveProperty("raw_scores");
    expect(payload).not.toHaveProperty("raw_feedback");
    expect(payload).not.toHaveProperty("feedback_text");
    expect(viewModel.feedbackOverlay?.measuredResultGuard).toMatchObject({
      scoresMutationAllowed: false,
      hollandCodeMutationAllowed: false,
      reportSnapshotMutationAllowed: false,
      measurementEvidenceMutationAllowed: false,
    });
    expect(viewModel.feedbackOverlay?.surfacePolicy).toMatchObject({
      sharePdfExposureAllowed: false,
      rawFeedbackPublicExposureAllowed: false,
      formalReportMutationAllowed: false,
    });
  });

  it("blocks forbidden claims in matrix-authored cases and rendered output", () => {
    const matrix = readMatrix();

    for (const fixtureCase of matrix.cases) {
      const serializedCase = JSON.stringify(fixtureCase);
      const rendered = renderedTextFor(fixtureCase);

      for (const forbidden of matrix.forbidden_claim_fragments) {
        expect(serializedCase).not.toContain(forbidden);
        expect(rendered).not.toContain(forbidden);
      }
    }
  });
});
