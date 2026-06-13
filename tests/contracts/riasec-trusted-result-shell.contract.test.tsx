import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function buildRiasecReport(): ReportResponse {
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "RIA",
    riasec_form_v1: {
      form_code: "riasec_60",
      label: "RIASEC 60Q",
      question_count: 60,
      estimated_minutes: 8,
    },
    riasec_public_projection_v1: {
      top_code: "RIA",
      primary_type: "R",
      secondary_type: "I",
      tertiary_type: "A",
      scores_0_100: { R: 86, I: 73, A: 64, S: 41, E: 38, C: 52 },
      clarity_index: 0.22,
      breadth_index: 0.61,
      quality_grade: "A",
      quality_flags: [],
      dimension_labels: {
        R: "现实型",
        I: "研究型",
        A: "艺术型",
        S: "社会型",
        E: "企业型",
        C: "常规型",
      },
    },
    riasec_public_projection_v2: {
      schema_version: "riasec.public_projection.v2",
      holland_code: {
        code: "RIA",
        primary_type: "R",
        secondary_type: "I",
        tertiary_type: "A",
      },
      scores: {
        score_kind: "dimension_scores_0_100",
        dimensions: [
          { code: "R", label: "现实型", score: 86 },
          { code: "I", label: "研究型", score: 73 },
          { code: "A", label: "艺术型", score: 64 },
          { code: "S", label: "社会型", score: 41 },
          { code: "E", label: "企业型", score: 38 },
          { code: "C", label: "常规型", score: 52 },
        ],
      },
      form: {
        form_code: "riasec_60",
        question_count: 60,
        form_kind: "standard",
        score_space_version: "riasec_60_likert5_activity_sum_space.v1",
        compare_compatibility_group: "RIASEC:riasec_60:riasec_60_likert5_activity_sum_space.v1",
        cross_form_comparable: false,
        raw_score_delta_allowed: false,
      },
      measurement_evidence: {
        quality_rule_status: "minimal_answer_completion_only",
        snapshot_bound: true,
        validation_status: "runtime_contract_defined_validation_pending",
      },
      quality: {
        grade: "A",
        flags: [],
        quality_state: "normal",
        low_quality_strength: "not_available_for_strong_low_quality",
      },
      content_boundary: {
        occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      },
      interpretation_state: {
        interpretation_rule_version: "riasec_interpretation_rule_spec_v2",
        profile_shape: "clear_code",
        profile_shape_version: "riasec_profile_shape_v2_0",
        clarity_label: "high",
        near_tie_state: {
          state: "none",
          dimensions: [],
        },
        alternate_code: {
          show: false,
          codes: [],
          display_boundary: "",
        },
        alternate_code_reason: null,
        top_code_confidence: {
          level: "high",
          meaning: "readability strength, not probability",
        },
        reading_strength: "normal_reading",
        result_page_strategy: {
          primary_reading_mode: "single_chain",
        },
        module_visibility_policy_id: "riasec_module_visibility_policy_v1",
        validation_status: "rule_contract_defined_validation_pending",
        field_authority: {
          profile_shape: "backend_owned",
          near_tie_state: "backend_owned",
          alternate_code: "backend_owned",
          top_code_confidence: "backend_owned",
          reading_strength: "backend_owned",
        },
      },
      module_visibility_policy: {
        schema_version: "riasec.module_visibility_policy.v1",
        policy_id: "riasec_module_visibility_policy_v1",
        quality_state: "normal",
        profile_shape: "clear_code",
        form_code: "riasec_60",
        modules: [
          { key: "hero_activity_chain", visibility: "visible", reason: "standard_reading_available" },
          { key: "six_dimension_map", visibility: "visible", reason: "dimension_overview_available" },
          { key: "activity_explorer", visibility: "visible", reason: "examples_only_activity_explorer_available" },
          { key: "occupation_examples", visibility: "collapsed", reason: "examples_only_not_registry_match" },
          { key: "140q_context_cards", visibility: "hidden", reason: "requires_riasec_140_contextual_form" },
          { key: "share_card", visibility: "visible", reason: "safe_share_available" },
          { key: "history", visibility: "visible", reason: "snapshot_bound_history_available" },
          { key: "unexpected_future_module", visibility: "visible", reason: "must_fail_closed" },
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
            dimension: "R",
            label: "实作型",
            core_drive: "把事情做出来、调好、修好、落地。",
            activity_families: ["physical_implementation", "tools_and_equipment"],
            source_status: "content_example_not_registry_match",
          },
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
                  source_status: "content_example_not_registry_match",
                  display_label: "内容示例，非职业数据库匹配",
                  common_tasks: ["拆解用户反馈", "整理需求假设"],
                  skills_to_check: ["访谈", "提问"],
                  education_boundary: "可能需要相关课程、训练、项目经验或领域知识。",
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
    },
  };
}

function cloneReport(report: ReportResponse): ReportResponse {
  return JSON.parse(JSON.stringify(report)) as ReportResponse;
}

describe("RIASEC trusted result shell", () => {
  it("assembles the 3-minute card and six-dimension map from backend projection v2", () => {
    const viewModel = assembleRiasecResultViewModel(buildRiasecReport());

    expect(viewModel.topCode).toBe("RIA");
    expect(viewModel.formCode).toBe("riasec_60");
    expect(viewModel.formKind).toBe("standard");
    expect(viewModel.dimensions.map((dimension) => dimension.code)).toEqual(["R", "I", "A", "S", "E", "C"]);
    expect(viewModel.trustedResultCard).toMatchObject({
      projectionVersion: "riasec.public_projection.v2",
      scoreSpaceVersion: "riasec_60_likert5_activity_sum_space.v1",
      qualityRuleStatus: "minimal_answer_completion_only",
      qualityState: "normal",
      snapshotBound: true,
      crossFormComparable: false,
      rawScoreDeltaAllowed: false,
      occupationExamplesPolicy: "content_example_not_registry_match_without_reviewed_registry_source",
    });
    expect(viewModel.interpretationState).toMatchObject({
      interpretationRuleVersion: "riasec_interpretation_rule_spec_v2",
      profileShape: "clear_code",
      profileShapeVersion: "riasec_profile_shape_v2_0",
      clarityLabel: "high",
      readingStrength: "normal_reading",
      moduleVisibilityPolicyId: "riasec_module_visibility_policy_v1",
      fieldAuthority: {
        profile_shape: "backend_owned",
        near_tie_state: "backend_owned",
        alternate_code: "backend_owned",
        top_code_confidence: "backend_owned",
        reading_strength: "backend_owned",
      },
    });
    expect(viewModel.interpretationState?.nearTieState).toEqual({ state: "none", dimensions: [] });
    expect(viewModel.interpretationState?.alternateCode).toMatchObject({
      show: false,
      codes: [],
    });
    expect(viewModel.interpretationState?.topCodeConfidence).toMatchObject({
      level: "high",
      meaning: "readability strength, not probability",
    });
    expect(viewModel.moduleVisibilityPolicy).toMatchObject({
      schemaVersion: "riasec.module_visibility_policy.v1",
      policyId: "riasec_module_visibility_policy_v1",
      qualityState: "normal",
      profileShape: "clear_code",
      fallbackPolicy: {
        unknownModule: "hidden",
        missingBackendState: "hidden",
        frontendInferenceAllowed: false,
      },
    });
    expect(viewModel.moduleVisibilityPolicy?.modules.map((moduleState) => moduleState.key)).not.toContain("unexpected_future_module");
    expect(viewModel.activityExplorer).toMatchObject({
      schemaVersion: "riasec.activity_explorer.v0.1",
      status: "content_examples_only",
      sourceStatus: "content_example_not_registry_match",
      registrySourceConnected: false,
      fitScoreAllowed: false,
      successPredictionAllowed: false,
    });
    expect(viewModel.activityExplorer?.dimensionActivityFamilies.map((family) => family.dimension)).toEqual(["R", "I"]);
    expect(viewModel.activityExplorer?.codeActivityPack.activities[0]?.occupationExamples[0]).toMatchObject({
      occupationExample: "用户研究助理",
      sourceStatus: "content_example_not_registry_match",
      displayLabel: "内容示例，非职业数据库匹配",
      notARecommendation: true,
    });
  });

  it("renders trusted result card, dimension map, and governed activity copy from backend projection", () => {
    render(
      <RiasecResultShell
        locale="zh"
        attemptId="attempt-riasec"
        viewModel={assembleRiasecResultViewModel(buildRiasecReport())}
      />
    );

    expect(screen.getByTestId("riasec-trusted-result-card")).toHaveTextContent("3 分钟结果卡");
    expect(screen.getByTestId("riasec-trusted-result-card")).toHaveTextContent("RIA");
    expect(screen.getByTestId("riasec-measurement-boundary")).toHaveTextContent("按本次题型独立解读");
    expect(screen.getByTestId("riasec-measurement-boundary")).toHaveTextContent("已完成基础作答完整性校验");
    expect(screen.getByTestId("riasec-measurement-boundary")).not.toHaveTextContent("riasec_60_likert5_activity_sum_space.v1");
    expect(screen.getByTestId("riasec-measurement-boundary")).not.toHaveTextContent("minimal_answer_completion_only");
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();

    for (const code of ["R", "I", "A", "S", "E", "C"]) {
      expect(screen.getByTestId(`riasec-dimension-${code}`)).toBeInTheDocument();
    }

    expect(within(screen.getByTestId("riasec-six-dimension-map")).queryByText(/岗位匹配度|职业成功预测|更准确/)).not.toBeInTheDocument();
    expect(screen.getByTestId("riasec-governed-copy-surface")).toHaveTextContent("内容示例，非职业数据库匹配");
    expect(screen.getByTestId("riasec-governed-copy-surface")).not.toHaveTextContent("content_example_not_registry_match");
    expect(screen.getByTestId("riasec-activity-families")).toHaveTextContent("实物操作");
    expect(screen.getByTestId("riasec-activity-families")).toHaveTextContent("工具与设备");
    expect(screen.getByTestId("riasec-activity-families")).not.toHaveTextContent("physical_implementation");
    expect(screen.getByTestId("riasec-activity-families")).not.toHaveTextContent("tools_and_equipment");
    expect(screen.getByTestId("riasec-activity-pack")).toHaveTextContent("访谈或观察真实用户");
    expect(screen.getByTestId("riasec-occupation-examples")).toHaveTextContent("用户研究助理");
    expect(screen.getByTestId("riasec-occupation-examples")).toHaveTextContent("内容示例，非职业数据库匹配");
    expect(screen.getByTestId("riasec-governed-copy-surface")).not.toHaveTextContent("Matches");
    expect(screen.getByTestId("riasec-governed-copy-surface")).not.toHaveTextContent("岗位匹配度");
  });

  it("suppresses RIASEC debug labels and raw keys from visible result output", () => {
    const report = cloneReport(buildRiasecReport());
    const projection = report.riasec_public_projection_v2 as Record<string, unknown>;
    const explorer = projection.activity_explorer_v0_1 as Record<string, unknown>;
    const families = explorer.dimension_activity_families as Array<Record<string, unknown>>;
    families[0].activity_families = [
      "physical_implementation",
      "tools_and_equipment",
      "field_troubleshooting",
      "prototypes_and_tangible_outputs",
      "hands_on_systems",
    ];
    families[1].activity_families = [
      "analyze_complex_problems",
      "organize_evidence_materials",
      "model_systems",
      "test_hypotheses",
      "research_and_explain",
    ];
    const pack = explorer.code_activity_pack as Record<string, unknown>;
    const activities = pack.activities as Array<Record<string, unknown>>;
    activities[0].activity_key = "analyze_complex_problems";
    activities[0].activity_label = "BUTTON LABEL";
    activities[0].activity_user_copy = "Interest signal, not ability. raw score riasec_60_likert5_activity_sum_space.v1";
    activities[0].task_examples = ["整理真实任务证据", "score space", "minimal_answer_completion_only"];
    const occupationExamples = activities[0].occupation_examples as Array<Record<string, unknown>>;
    occupationExamples[0].display_label = "content_example_not_registry_match";
    occupationExamples[0].common_tasks = ["整理访谈证据", "raw score", "content_example_not_registry_match_without_reviewed_registry_source"];
    projection.deep_content_slots_v1 = {
      schema_version: "riasec.deep_content_slots.v1",
      scale_code: "RIASEC",
      locale: "zh",
      content_authority: "backend_cms_projection",
      snapshot_bound: true,
      source_policy: {
        frontend_fallback_allowed: false,
        missing_content_behavior: "omit_slot",
        pending_content_behavior: "omit_slot",
        unknown_slot_behavior: "omit_slot",
        formal_report_generation: "paused",
      },
      slot_visibility_policy: {
        module_visibility_policy_id: "riasec_module_visibility_policy_v1",
        hidden_slots_omitted: true,
        pending_or_unavailable_slots_omitted: true,
        frontend_inference_allowed: false,
      },
      slots: [
        {
          slot_key: "140q_cta_copy",
          slot_group: "140q_layer_copy",
          slot_id: "riasec-debug-label-suppression-contract",
          module_key: "140q_cta",
          slot_visibility: "visible",
          status: "authored",
          content_status: "authored",
          content_version: "v1",
          review_status: "reviewed",
          source_status: "cms",
          evidence_level: "boundary_copy",
          locale: "zh",
          frontend_fallback_allowed: false,
          fallback_behavior: "omit_slot",
          applicability: {
            form_codes: ["riasec_60"],
            profile_shapes: ["clear_code"],
            quality_states: ["normal"],
            codes: ["RIA"],
            dimensions: ["R", "I"],
          },
          state: {},
          content: {
            title: "兴趣信号边界 BUTTON LABEL",
            summary: "兴趣信号，不等于能力；不是职业推荐，也不是职业保证。",
            body: "不代表职业数据库匹配，除非后端权威数据明确确认。 raw score",
            button_label: "BUTTON LABEL",
            activities_to_validate: ["保留可阅读活动", "score space", "riasec_60_likert5_activity_sum_space.v1"],
          },
          boundaries: {
            user_visible_boundary: "兴趣信号，不等于能力；不是职业推荐，也不是职业保证。",
            required_boundaries: [],
            forbidden_claims: [],
          },
        },
      ],
    };

    render(
      <RiasecResultShell
        locale="zh"
        attemptId="attempt-riasec"
        viewModel={assembleRiasecResultViewModel(report)}
      />
    );

    const text = document.body.textContent ?? "";
    const forbiddenTokens = [
      "BUTTON LABEL",
      "BUT TON LABEL",
      "visible",
      "collapsed",
      "score space",
      "raw score",
      "riasec_60_likert5_activity_sum_space",
      "minimal_answer_completion_only",
      "content_example_not_registry_match",
      "content_example_not_registry_match_without_reviewed_registry_source",
      "physical_implementation",
      "tools_and_equipment",
      "field_troubleshooting",
      "prototypes_and_tangible_outputs",
      "hands_on_systems",
      "analyze_complex_problems",
      "organize_evidence_materials",
      "model_systems",
      "test_hypotheses",
      "research_and_explain",
    ];

    for (const token of forbiddenTokens) {
      expect(text).not.toContain(token);
    }
    expect(text).toContain("兴趣信号，不等于能力");
    expect(text).toContain("不是职业推荐");
    expect(text).toContain("不是职业保证");
    expect(text).toContain("不代表职业数据库匹配");
    expect(text).toContain("复杂问题分析");
    expect(text).toContain("证据材料整理");
    expect(text).toContain("保留可阅读活动");
  });

  it("fails closed when backend module visibility hides strong RIASEC modules", () => {
    const report = cloneReport(buildRiasecReport());
    const projection = report.riasec_public_projection_v2 as Record<string, unknown>;
    projection.quality = {
      grade: "C",
      flags: ["attention_flag"],
      quality_state: "low_quality",
      low_quality_strength: "low_quality_boundary_triggered",
    };
    projection.interpretation_state = {
      ...(projection.interpretation_state as Record<string, unknown>),
      profile_shape: "low_quality",
      clarity_label: "not_readable",
      reading_strength: "retake_recommended",
    };
    projection.module_visibility_policy = {
      schema_version: "riasec.module_visibility_policy.v1",
      policy_id: "riasec_module_visibility_policy_v1",
      quality_state: "low_quality",
      profile_shape: "low_quality",
      form_code: "riasec_60",
      modules: [
        { key: "hero_activity_chain", visibility: "hidden", reason: "low_quality_hides_strong_modules" },
        { key: "six_dimension_map", visibility: "visible", reason: "low_quality_overview_only" },
        { key: "activity_explorer", visibility: "hidden", reason: "low_quality_hides_strong_modules" },
        { key: "occupation_examples", visibility: "hidden", reason: "low_quality_hides_strong_modules" },
        { key: "140q_context_cards", visibility: "hidden", reason: "low_quality_hides_strong_modules" },
        { key: "share_card", visibility: "hidden", reason: "low_quality_no_strong_public_share" },
        { key: "history", visibility: "visible", reason: "snapshot_bound_history_available" },
      ],
      fallback_policy: {
        unknown_module: "hidden",
        missing_backend_state: "hidden",
        frontend_inference_allowed: false,
      },
    };

    render(
      <RiasecResultShell
        locale="zh"
        attemptId="attempt-riasec"
        viewModel={assembleRiasecResultViewModel(report)}
      />
    );

    expect(screen.getByTestId("riasec-trusted-result-card")).toHaveTextContent("RIA");
    expect(screen.getByTestId("riasec-trusted-result-card")).not.toHaveTextContent("你的前三个兴趣维度依次是");
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();
    expect(screen.queryByTestId("riasec-governed-copy-surface")).not.toBeInTheDocument();
    expect(screen.queryByTestId("riasec-activity-pack")).not.toBeInTheDocument();
    expect(screen.queryByTestId("riasec-occupation-examples")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "分享结果" })).not.toBeInTheDocument();
  });

  it("renders a minimal empty state when backend governed activity content is absent", () => {
    const report = buildRiasecReport();
    delete (report.riasec_public_projection_v2 as Record<string, unknown>).activity_explorer_v0_1;

    render(
      <RiasecResultShell
        locale="zh"
        attemptId="attempt-riasec"
        viewModel={assembleRiasecResultViewModel(report)}
      />
    );

    expect(screen.getByTestId("riasec-governed-copy-empty")).toHaveTextContent("当前结果没有可渲染的后端活动内容");
    expect(screen.queryByText("用户研究助理")).not.toBeInTheDocument();
    expect(screen.queryByText("行业研究助理")).not.toBeInTheDocument();
  });

  it("preserves Trusted Result v1.5 shell compatibility when personalization policy is absent", () => {
    const report = cloneReport(buildRiasecReport());
    delete (report.riasec_public_projection_v2 as Record<string, unknown>).interpretation_state;
    delete (report.riasec_public_projection_v2 as Record<string, unknown>).module_visibility_policy;

    render(
      <RiasecResultShell
        locale="zh"
        attemptId="attempt-riasec"
        viewModel={assembleRiasecResultViewModel(report)}
      />
    );

    expect(screen.getByTestId("riasec-trusted-result-card")).toHaveTextContent("你的前三个兴趣维度依次是");
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-governed-copy-surface")).toHaveTextContent("内容示例，非职业数据库匹配");
    expect(screen.getByTestId("riasec-governed-copy-surface")).not.toHaveTextContent("content_example_not_registry_match");
    expect(screen.getByTestId("riasec-occupation-examples")).toHaveTextContent("内容示例，非职业数据库匹配");
  });

  it("keeps RIASEC shell free of local dimension interpretation copy and forbidden claim wording", () => {
    const source = read("components/result/riasec/RiasecResultShell.tsx");

    expect(source).not.toContain("DIMENSION_COPY");
    expect(source).not.toContain("Hands-on work");
    expect(source).not.toContain("职业推荐");
    expect(source).not.toContain("岗位匹配度");
    expect(source).not.toContain("职业成功预测");
    expect(source).not.toContain("更准确");
    expect(source).not.toContain("raw delta");
    expect(source).not.toContain("raw score delta=");
    expect(source).not.toContain("Matches");
    expect(source).not.toContain("用户研究助理");
    expect(source).not.toContain("行业研究助理");
    expect(source).not.toContain("O*NET");
    expect(source).not.toContain("SOC");
    expect(source).not.toContain("source_url");
  });
});
