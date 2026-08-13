import { describe, expect, it } from "vitest";
import {
  buildMbtiResultScientificInterpretation,
  describeMbtiAxisClarity,
  resolveMbtiClarityState,
} from "@/lib/mbti/resultScientificInterpretation";

function dimension(axisCode: string, percent: number, dominantLabel = "内倾") {
  return {
    axisCode,
    dominantPct: percent,
    dominantLabel,
  };
}

describe("Chinese MBTI result scientific interpretation contract", () => {
  it.each([
    [50, "tie"],
    [51, "close_call"],
    [55, "close_call"],
    [60, "clear"],
    [75, "very_clear"],
  ] as const)("classifies the exact %i fixture as %s", (percent, state) => {
    expect(resolveMbtiClarityState(percent)).toBe(state);
  });

  it("never describes 50% as a clear or stable preference", () => {
    const axis = describeMbtiAxisClarity({ axisCode: "EI", percent: 50, dominantLabel: "内倾" });

    expect(axis.label).toBe("未形成清晰偏好");
    expect(axis.description).toContain("两侧方向得分相同");
    expect(`${axis.label}${axis.description}`).not.toMatch(/清晰倾向|稳定人格事实/);
  });

  it.each([51, 55])("treats %i%% as a mild, two-sided close call", (percent) => {
    const axis = describeMbtiAxisClarity({ axisCode: "EI", percent, dominantLabel: "内倾" });

    expect(axis.label).toBe("当前轻微偏向内倾");
    expect(axis.description).toContain("两侧方式都可能");
    expect(axis.description).toContain("不应写成稳定人格事实");
  });

  it("downgrades the page from the least-clear official axis and exposes adjacent codes", () => {
    const result = buildMbtiResultScientificInterpretation({
      displayType: "INFJ-A",
      dimensions: [
        dimension("EI", 50),
        dimension("SN", 75, "直觉"),
        dimension("TF", 60, "情感"),
        dimension("JP", 75, "判断"),
        dimension("AT", 55, "果断"),
      ],
    });

    expect(result.overallState).toBe("tie");
    expect(result.overallTitle).toBe("本次结果存在平分轴");
    expect(result.heroSummary).toContain("未形成清晰偏好");
    expect(result.treatNarrativesAsHypotheses).toBe(true);
    expect(result.adjacentTypeCodes).toEqual(["ENFJ-A", "INFJ-T"]);
  });

  it("does not downgrade 60/40 or 75/25 fixtures to close calls", () => {
    const sixty = buildMbtiResultScientificInterpretation({
      displayType: "INFJ-A",
      dimensions: [dimension("EI", 60)],
    });
    const seventyFive = buildMbtiResultScientificInterpretation({
      displayType: "INFJ-A",
      dimensions: [dimension("EI", 75)],
    });

    expect(sixty.overallState).toBe("clear");
    expect(sixty.treatNarrativesAsHypotheses).toBe(false);
    expect(seventyFive.overallState).toBe("very_clear");
    expect(seventyFive.treatNarrativesAsHypotheses).toBe(false);
  });
});
