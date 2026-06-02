export const IQ_CANONICAL_SCALE_CODE = "IQ_INTELLIGENCE_QUOTIENT" as const;
export const IQ_LEGACY_SCALE_CODE = "IQ_RAVEN" as const;
export const IQ_PUBLIC_SLUG = "iq-test-intelligence-quotient-assessment" as const;
export const IQ_CANONICAL_PUBLIC_PATH = "/tests/iq-test-intelligence-quotient-assessment" as const;
export const IQ_ZH_TAKE_PATH = "/zh/tests/iq-test-intelligence-quotient-assessment/take" as const;
export const IQ_BETA_30_BANK_ID = "IQ_BETA_30_ORIGINAL" as const;
export const IQ_BETA_50_BANK_ID = "IQ_BETA_50_ORIGINAL" as const;

export const IQ_SCALE_CODES = [IQ_CANONICAL_SCALE_CODE, IQ_LEGACY_SCALE_CODE] as const;

export type IqScaleCode = (typeof IQ_SCALE_CODES)[number];
export type IqDimensionCode = "VSPR" | "VSI" | "NPR";
export type IqReportDimensionField =
  | "visual_spatial_insight"
  | "visual_spatial_pattern_reasoning"
  | "numerical_pattern_reasoning";

export const IQ_DIMENSION_NAME_MAP: Record<IqDimensionCode, string> = {
  VSPR: "视觉空间模式推理",
  VSI: "视觉空间洞察",
  NPR: "数字规律推理",
};

export const IQ_REPORT_DIMENSION_FIELD_MAP: Record<IqDimensionCode, IqReportDimensionField> = {
  VSPR: "visual_spatial_pattern_reasoning",
  VSI: "visual_spatial_insight",
  NPR: "numerical_pattern_reasoning",
};

export function isIqScaleCode(value: string | null | undefined): value is IqScaleCode {
  const normalized = String(value ?? "").trim().toUpperCase();
  return IQ_SCALE_CODES.includes(normalized as IqScaleCode);
}

export function normalizeIqScaleCode(value: string | null | undefined): IqScaleCode | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  return isIqScaleCode(normalized) ? normalized : null;
}
