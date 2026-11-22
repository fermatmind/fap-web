import type { ReportResponse } from "@/lib/api/v0_3";

// Fixed, synthetic report examples. Never used as a fallback for a real attempt.
export function buildIqResultExample(requested: string | undefined): ReportResponse {
  const raw = requested === "zero" ? 0 : requested === "low" ? 1 : requested === "high" ? 20 : 7;
  const score = raw === 0 ? 73 : raw <= 5 ? 85 + (raw - 1) * 3.75 : raw <= 20 ? 100 + (raw - 5) * 2 : 130 + (raw - 20) * 1.5;
  const percentile = raw === 0 ? 3.593 : raw === 1 ? 15.866 : raw === 20 ? 97.725 : 60.5137;
  const npr = raw === 0 ? 0 : raw === 20 ? 2 : raw === 1 ? 0 : 1;
  const vspr = raw === 0 ? 0 : raw === 20 ? 10 : raw === 1 ? 1 : 3;
  const vsi = raw - npr - vspr;
  return {
    ok: true, schema_version: "iq.report.v1", scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    summary: { raw_score: raw, question_count: 30, beta_reference: {
      status: "available", source_kind: "designed_reference",
      model_version: "owner30_design_anchors_2026_10_14_v1",
      raw_score: raw, standard_score: score, display_score: Math.floor(score + 0.5), percentile,
      production_normed: false, claim_eligible: false, population_percentile_eligible: false,
    } },
    scoring: { status: "scored" }, duration_ms: 192000,
    dimensions: {
      visual_spatial_pattern_reasoning: { dimension_code: "VSPR", correct_count: vspr, item_count: 14 },
      visual_spatial_insight: { dimension_code: "VSI", correct_count: vsi, item_count: 13 },
      numerical_pattern_reasoning: { dimension_code: "NPR", correct_count: npr, item_count: 3 },
    },
  } as unknown as ReportResponse;
}
