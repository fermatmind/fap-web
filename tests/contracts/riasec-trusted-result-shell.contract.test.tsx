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
  });

  it("renders trusted result card and dimension map without frontend interpretation authority", () => {
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
  });
});
