import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MbtiResultScientificContext } from "@/components/result/mbti/clone/MbtiResultScientificContext";
import type { ReportResponse } from "@/lib/api/v0_3";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { buildMbtiResultScientificInterpretation } from "@/lib/mbti/resultScientificInterpretation";

function createReport(): ReportResponse {
  return {
    mbti_public_projection_v1: {
      canonical_type_code: "INFJ",
      display_type: "INFJ-A",
      variant_code: "A",
      profile: { type_name: "提倡者" },
      dimensions: [
        {
          axis_code: "EI",
          dominant_pct: 50,
          dominant_label: "内倾",
        },
      ],
      scientific_context: {
        metric_definition: "百分比是 93Q 轴题目的加权方向得分，不是回答一致性、测量信度、能力水平或人群百分位。",
        close_call_rule: "50% 表示两侧计分相同，51%–55% 只表示当前轻微偏向。",
        type_code_rule: "平分时沿用预先配置的归类规则，并展示相邻类型。",
        at_dimension: {
          label: "压力与反馈风格（FermatMind 扩展）",
          status: "A/T 不是官方 MBTI 的第五个偏好轴。",
          theoretical_source: "A/T 是一般人格特质与压力/反馈反应的产品化扩展。",
          calculation: "A/T 由相关题目的回答按权重归一化计算。",
          scope: "只用于自我观察，不用于诊断或能力判断。",
        },
        use_limits: [
          "本结果不用于临床或心理诊断。",
          "本结果不应作为招聘、淘汰或岗位胜任力的单一依据。",
          "职业内容不构成能力或职业结果保证。",
        ],
      },
    },
  } as ReportResponse;
}

describe("Chinese MBTI scientific context render contract", () => {
  it("renders the authority definition, A/T boundary, adjacent type and use limits once", () => {
    const viewModel = buildMbtiResultProjectionViewModel(createReport());
    const interpretation = buildMbtiResultScientificInterpretation({
      displayType: viewModel.displayType,
      dimensions: viewModel.dimensions,
    });

    render(
      <MbtiResultScientificContext
        locale="zh"
        context={viewModel.scientificContext}
        interpretation={interpretation}
      />,
    );

    const context = screen.getByTestId("mbti-scientific-context");
    expect(context).toHaveTextContent("不是回答一致性、测量信度、能力水平或人群百分位");
    expect(context).toHaveTextContent("未形成清晰偏好");
    expect(within(screen.getByTestId("mbti-adjacent-types")).getByText("ENFJ-A")).toBeInTheDocument();
    expect(context).toHaveTextContent("A/T 不是官方 MBTI 的第五个偏好轴");
    expect(context).toHaveTextContent("产品化扩展");
    expect(context).toHaveTextContent("按权重归一化计算");
    expect(context).toHaveTextContent("不用于临床或心理诊断");
    expect(context).toHaveTextContent("不应作为招聘");
    expect(context).toHaveTextContent("不构成能力或职业结果保证");
    expect(screen.getAllByText("科学边界与结果读法")).toHaveLength(1);
  });
});
