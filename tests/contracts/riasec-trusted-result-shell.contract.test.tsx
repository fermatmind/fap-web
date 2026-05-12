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
        low_quality_strength: "not_available_for_strong_low_quality",
      },
      content_boundary: {
        occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
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
      snapshotBound: true,
      crossFormComparable: false,
      rawScoreDeltaAllowed: false,
      occupationExamplesPolicy: "content_example_not_registry_match_without_reviewed_registry_source",
    });
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
    expect(screen.getByTestId("riasec-measurement-boundary")).toHaveTextContent("riasec_60_likert5_activity_sum_space.v1");
    expect(screen.getByTestId("riasec-measurement-boundary")).toHaveTextContent("minimal_answer_completion_only");
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();

    for (const code of ["R", "I", "A", "S", "E", "C"]) {
      expect(screen.getByTestId(`riasec-dimension-${code}`)).toBeInTheDocument();
    }

    expect(within(screen.getByTestId("riasec-six-dimension-map")).queryByText(/岗位匹配度|职业成功预测|更准确/)).not.toBeInTheDocument();
    expect(screen.getByTestId("riasec-governed-copy-surface")).toHaveTextContent("content_example_not_registry_match");
    expect(screen.getByTestId("riasec-activity-families")).toHaveTextContent("physical_implementation");
    expect(screen.getByTestId("riasec-activity-pack")).toHaveTextContent("访谈或观察真实用户");
    expect(screen.getByTestId("riasec-occupation-examples")).toHaveTextContent("用户研究助理");
    expect(screen.getByTestId("riasec-occupation-examples")).toHaveTextContent("内容示例，非职业数据库匹配");
    expect(screen.getByTestId("riasec-governed-copy-surface")).not.toHaveTextContent("Matches");
    expect(screen.getByTestId("riasec-governed-copy-surface")).not.toHaveTextContent("岗位匹配度");
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
