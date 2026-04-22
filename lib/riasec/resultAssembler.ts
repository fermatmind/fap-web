import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";

export type RiasecDimension = {
  code: string;
  label: string;
  score: number;
};

export type RiasecResultViewModel = {
  topCode: string;
  primaryType: string;
  secondaryType: string;
  tertiaryType: string;
  clarityIndex: number;
  breadthIndex: number;
  qualityGrade: string;
  qualityFlags: string[];
  dimensions: RiasecDimension[];
  enhancedBreakdown: {
    activity: Record<string, number>;
    environment: Record<string, number>;
    role: Record<string, number>;
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

type RiasecProjectionContainer = Pick<ReportResponse, "riasec_public_projection_v1"> | Pick<ResultResponse, "riasec_public_projection_v1">;

export function hasRiasecProjection(reportData: RiasecProjectionContainer | null | undefined): boolean {
  return Boolean(asRecord(reportData?.riasec_public_projection_v1));
}

export function assembleRiasecResultViewModel(reportData: RiasecProjectionContainer): RiasecResultViewModel {
  const projection = asRecord(reportData.riasec_public_projection_v1) ?? {};
  const scores = asRecord(projection.scores_0_100) ?? {};
  const labels = asRecord(projection.dimension_labels) ?? {};
  const enhanced = asRecord(projection.enhanced_breakdown) ?? {};

  const dimensions = ["R", "I", "A", "S", "E", "C"].map((code) => ({
    code,
    label: normalizeText(labels[code]) || code,
    score: normalizeNumber(scores[code]),
  }));

  return {
    topCode: normalizeText(projection.top_code),
    primaryType: normalizeText(projection.primary_type),
    secondaryType: normalizeText(projection.secondary_type),
    tertiaryType: normalizeText(projection.tertiary_type),
    clarityIndex: normalizeNumber(projection.clarity_index),
    breadthIndex: normalizeNumber(projection.breadth_index),
    qualityGrade: normalizeText(projection.quality_grade) || "A",
    qualityFlags: Array.isArray(projection.quality_flags)
      ? projection.quality_flags.map((flag) => normalizeText(flag)).filter(Boolean)
      : [],
    dimensions,
    enhancedBreakdown: {
      activity: Object.fromEntries(Object.entries(asRecord(enhanced.activity) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
      environment: Object.fromEntries(Object.entries(asRecord(enhanced.environment) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
      role: Object.fromEntries(Object.entries(asRecord(enhanced.role) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
    },
  };
}
