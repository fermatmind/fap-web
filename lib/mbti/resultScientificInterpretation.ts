export type MbtiClarityState = "tie" | "close_call" | "slight" | "clear" | "very_clear";

export type MbtiScientificAxisInterpretation = {
  axisCode: string;
  percent: number;
  dominantLabel: string;
  state: MbtiClarityState;
  label: string;
  description: string;
};

export type MbtiResultScientificInterpretation = {
  overallState: MbtiClarityState;
  overallTitle: string;
  heroSummary: string;
  closeCallAxes: MbtiScientificAxisInterpretation[];
  adjacentTypeCodes: string[];
  treatNarrativesAsHypotheses: boolean;
};

const OFFICIAL_AXIS_POSITIONS = {
  EI: 0,
  SN: 1,
  TF: 2,
  JP: 3,
} as const;

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }

  return "";
}

function normalizeAxisCode(dimension: Record<string, unknown>): string {
  const raw = normalizeText(
    dimension.axisCode,
    dimension.axis_code,
    dimension.code,
    dimension.id,
  ).toUpperCase();
  const letters = raw.replace(/[^A-Z]/g, "");

  if (letters === "IE") return "EI";
  if (letters === "NS") return "SN";
  if (letters === "FT") return "TF";
  if (letters === "PJ") return "JP";
  if (letters === "TA") return "AT";

  return letters;
}

function normalizePercent(dimension: Record<string, unknown>): number | null {
  const value = Number(
    dimension.dominantPct
      ?? dimension.dominant_pct
      ?? dimension.percent
      ?? dimension.pct,
  );

  if (!Number.isFinite(value)) return null;

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveMbtiClarityState(percent: number): MbtiClarityState {
  if (percent === 50) return "tie";
  if (percent <= 55) return "close_call";
  if (percent <= 59) return "slight";
  if (percent <= 74) return "clear";
  return "very_clear";
}

export function describeMbtiAxisClarity({
  axisCode,
  percent,
  dominantLabel,
}: {
  axisCode: string;
  percent: number;
  dominantLabel?: string;
}): MbtiScientificAxisInterpretation {
  const state = resolveMbtiClarityState(percent);
  const direction = dominantLabel?.trim();

  if (state === "tie") {
    return {
      axisCode,
      percent,
      dominantLabel: direction ?? "",
      state,
      label: "未形成清晰偏好",
      description: "两侧方向得分相同；结果代码使用了预设归类规则，不能据此认定稳定偏好。",
    };
  }

  if (state === "close_call") {
    return {
      axisCode,
      percent,
      dominantLabel: direction ?? "",
      state,
      label: direction ? `当前轻微偏向${direction}` : "当前仅有轻微偏向",
      description: "两侧方式都可能在不同情境中被使用；当前差异较小，不应写成稳定人格事实。",
    };
  }

  if (state === "slight") {
    return {
      axisCode,
      percent,
      dominantLabel: direction ?? "",
      state,
      label: direction ? `当前略偏向${direction}` : "当前偏向仍较弱",
      description: "本次回答呈现一定方向，但仍需结合具体情境和重复测量验证。",
    };
  }

  return {
    axisCode,
    percent,
    dominantLabel: direction ?? "",
    state,
    label: direction ? `当前偏向${direction}` : "当前偏好较清晰",
    description: "该比例描述本次回答的方向得分，不代表能力、可靠性或固定不变的人格强度。",
  };
}

function flipTypeLetter(typeCode: string, position: number): string {
  const letters = typeCode.split("");
  const pairs = ["EI", "SN", "TF", "JP"];
  const pair = pairs[position] ?? "";
  const current = letters[position] ?? "";
  const replacement = pair.split("").find((letter) => letter !== current);
  if (!replacement) return typeCode;
  letters[position] = replacement;
  return letters.join("");
}

export function buildMbtiResultScientificInterpretation({
  displayType,
  dimensions,
}: {
  displayType: string;
  dimensions: Array<Record<string, unknown>>;
}): MbtiResultScientificInterpretation {
  const analyzed = dimensions
    .map((dimension) => {
      const axisCode = normalizeAxisCode(dimension);
      const percent = normalizePercent(dimension);
      if (!axisCode || percent === null) return null;

      return describeMbtiAxisClarity({
        axisCode,
        percent,
        dominantLabel: normalizeText(
          dimension.dominantLabel,
          dimension.dominant_label,
          dimension.sideLabel,
          dimension.side_label,
        ),
      });
    })
    .filter((axis): axis is MbtiScientificAxisInterpretation => axis !== null);
  const officialAxes = analyzed.filter(
    (axis) => axis.axisCode in OFFICIAL_AXIS_POSITIONS,
  );
  const leastClearAxis = [...officialAxes].sort((a, b) => a.percent - b.percent)[0];
  const overallState = leastClearAxis?.state ?? "slight";
  const closeCallAxes = analyzed.filter((axis) => axis.percent <= 55);
  const baseType = displayType.trim().toUpperCase().match(/^[EI][SN][TF][JP]/)?.[0] ?? "";
  const variant = displayType.trim().toUpperCase().match(/-([AT])$/)?.[1] ?? "";
  const adjacentTypeCodes = closeCallAxes
    .map((axis) => {
      if (axis.axisCode === "AT" && baseType && variant) {
        return `${baseType}-${variant === "A" ? "T" : "A"}`;
      }

      const position = OFFICIAL_AXIS_POSITIONS[
        axis.axisCode as keyof typeof OFFICIAL_AXIS_POSITIONS
      ];
      if (position === undefined || !baseType) return "";
      const adjacentBaseType = flipTypeLetter(baseType, position);
      return variant ? `${adjacentBaseType}-${variant}` : adjacentBaseType;
    })
    .filter(Boolean)
    .filter((typeCode, index, all) => all.indexOf(typeCode) === index);

  if (officialAxes.length === 0) {
    return {
      overallState,
      overallTitle: "本次结果需结合具体情境理解",
      heroSummary: "结果比例用于描述本次回答方向，不代表能力或固定人格强度。",
      closeCallAxes,
      adjacentTypeCodes,
      treatNarrativesAsHypotheses: false,
    };
  }

  if (overallState === "tie") {
    return {
      overallState,
      overallTitle: "本次结果存在平分轴",
      heroSummary: "四字母类型仍按预设规则生成，但至少一个核心轴未形成清晰偏好。请同时参考相邻类型，并把职业、成长和关系内容当作待验证假设。",
      closeCallAxes,
      adjacentTypeCodes,
      treatNarrativesAsHypotheses: true,
    };
  }

  if (overallState === "close_call") {
    return {
      overallState,
      overallTitle: "本次类型仅呈轻微偏向",
      heroSummary: "至少一个核心轴只有 51%–55% 的轻微方向差异，两侧方式都可能出现。类型代码便于阅读，不代表稳定不变的人格事实。",
      closeCallAxes,
      adjacentTypeCodes,
      treatNarrativesAsHypotheses: true,
    };
  }

  if (overallState === "slight") {
    return {
      overallState,
      overallTitle: "当前偏好组合仍需结合情境验证",
      heroSummary: "本次回答呈现一定方向，但最低核心轴仍较接近中点。后续内容适合作为自我观察线索，不应直接推断能力或职业结果。",
      closeCallAxes,
      adjacentTypeCodes,
      treatNarrativesAsHypotheses: true,
    };
  }

  return {
    overallState,
    overallTitle: overallState === "very_clear" ? "本次偏好组合较清晰" : "本次偏好组合相对清晰",
    heroSummary: "这些比例描述本次 93Q 回答在各方向上的得分，不是能力、信度或固定人格强度；具体表现仍会随情境变化。",
    closeCallAxes,
    adjacentTypeCodes,
    treatNarrativesAsHypotheses: false,
  };
}
