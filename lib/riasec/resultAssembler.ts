import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";

export type RiasecDimension = {
  code: string;
  label: string;
  score: number;
};

export type RiasecTrustedResultCard = {
  schemaVersion: string;
  projectionVersion: string;
  scoreSpaceVersion: string;
  qualityRuleStatus: string;
  lowQualityStrength: string;
  snapshotBound: boolean;
  crossFormComparable: boolean;
  rawScoreDeltaAllowed: boolean;
  occupationExamplesPolicy: string;
  validationStatus: string;
};

export type RiasecResultViewModel = {
  topCode: string;
  formCode: string | null;
  formKind: string | null;
  formLabel: string | null;
  questionCount: number | null;
  estimatedMinutes: number | null;
  primaryType: string;
  secondaryType: string;
  tertiaryType: string;
  clarityIndex: number;
  breadthIndex: number;
  qualityGrade: string;
  qualityFlags: string[];
  dimensions: RiasecDimension[];
  trustedResultCard: RiasecTrustedResultCard | null;
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

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

type RiasecProjectionContainer =
  | Pick<ReportResponse, "riasec_public_projection_v1" | "riasec_public_projection_v2">
  | Pick<ResultResponse, "riasec_public_projection_v1" | "riasec_public_projection_v2">;

export function hasRiasecProjection(reportData: RiasecProjectionContainer | null | undefined): boolean {
  return Boolean(asRecord(reportData?.riasec_public_projection_v2) ?? asRecord(reportData?.riasec_public_projection_v1));
}

export function assembleRiasecResultViewModel(reportData: RiasecProjectionContainer): RiasecResultViewModel {
  const projectionV2 = asRecord(reportData.riasec_public_projection_v2);
  const projection = asRecord(reportData.riasec_public_projection_v1) ?? {};
  const form = asRecord((reportData as { riasec_form_v1?: unknown }).riasec_form_v1);
  const scores = asRecord(projection.scores_0_100) ?? {};
  const labels = asRecord(projection.dimension_labels) ?? {};
  const enhanced = asRecord(projection.enhanced_breakdown) ?? {};
  const v2HollandCode = asRecord(projectionV2?.holland_code);
  const v2Form = asRecord(projectionV2?.form);
  const v2MeasurementEvidence = asRecord(projectionV2?.measurement_evidence);
  const v2Quality = asRecord(projectionV2?.quality);
  const v2ContentBoundary = asRecord(projectionV2?.content_boundary);
  const v2Scores = asRecord(projectionV2?.scores);
  const v2Dimensions = Array.isArray(v2Scores?.dimensions) ? v2Scores.dimensions : [];
  const dimensions = v2Dimensions.length > 0
    ? v2Dimensions.map((rawDimension) => {
        const dimension = asRecord(rawDimension) ?? {};
        const code = normalizeText(dimension.code);

        return {
          code,
          label: normalizeText(dimension.label) || code,
          score: normalizeNumber(dimension.score),
        };
      }).filter((dimension) => dimension.code)
    : ["R", "I", "A", "S", "E", "C"].map((code) => ({
        code,
        label: normalizeText(labels[code]) || code,
        score: normalizeNumber(scores[code]),
      }));
  const formCode = normalizeText(v2Form?.form_code) || normalizeText(form?.form_code) || null;
  const topCode = normalizeText(v2HollandCode?.code) || normalizeText(projection.top_code);
  const qualityFlags = Array.isArray(v2Quality?.flags)
    ? v2Quality.flags.map((flag) => normalizeText(flag)).filter(Boolean)
    : Array.isArray(projection.quality_flags)
      ? projection.quality_flags.map((flag) => normalizeText(flag)).filter(Boolean)
      : [];

  return {
    topCode,
    formCode,
    formKind: normalizeText(v2Form?.form_kind) || null,
    formLabel: normalizeText(form?.label) || normalizeText(form?.short_label) || null,
    questionCount: Number.isFinite(Number(v2Form?.question_count))
      ? Number(v2Form?.question_count)
      : Number.isFinite(Number(form?.question_count))
        ? Number(form?.question_count)
        : null,
    estimatedMinutes: Number.isFinite(Number(form?.estimated_minutes)) ? Number(form?.estimated_minutes) : null,
    primaryType: normalizeText(v2HollandCode?.primary_type) || normalizeText(projection.primary_type),
    secondaryType: normalizeText(v2HollandCode?.secondary_type) || normalizeText(projection.secondary_type),
    tertiaryType: normalizeText(v2HollandCode?.tertiary_type) || normalizeText(projection.tertiary_type),
    clarityIndex: normalizeNumber(projection.clarity_index),
    breadthIndex: normalizeNumber(projection.breadth_index),
    qualityGrade: normalizeText(v2Quality?.grade) || normalizeText(projection.quality_grade) || "A",
    qualityFlags,
    dimensions,
    trustedResultCard: projectionV2
      ? {
          schemaVersion: "riasec.trusted_result_card.v1",
          projectionVersion: normalizeText(projectionV2.schema_version),
          scoreSpaceVersion: normalizeText(v2Form?.score_space_version),
          qualityRuleStatus: normalizeText(v2MeasurementEvidence?.quality_rule_status),
          lowQualityStrength: normalizeText(v2Quality?.low_quality_strength),
          snapshotBound: normalizeBoolean(v2MeasurementEvidence?.snapshot_bound),
          crossFormComparable: normalizeBoolean(v2Form?.cross_form_comparable),
          rawScoreDeltaAllowed: normalizeBoolean(v2Form?.raw_score_delta_allowed),
          occupationExamplesPolicy: normalizeText(v2ContentBoundary?.occupation_examples_policy),
          validationStatus: normalizeText(v2MeasurementEvidence?.validation_status),
        }
      : null,
    enhancedBreakdown: {
      activity: Object.fromEntries(Object.entries(asRecord(enhanced.activity) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
      environment: Object.fromEntries(Object.entries(asRecord(enhanced.environment) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
      role: Object.fromEntries(Object.entries(asRecord(enhanced.role) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
    },
  };
}
