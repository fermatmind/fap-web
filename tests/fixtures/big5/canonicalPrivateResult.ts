import type { MeAttemptItem, ReportResponse, ShareSummaryResponse } from "@/lib/api/v0_3";
import liveBridge from "@/tests/fixtures/big5/report_live_bridge_v2.projection.json";

export const BIG5_SOURCE_HASH = "6b107f6779fdaa8fe2c889adc1200943edbc548544b739fa2ac54d00d53deb39";
export const BIG5_COMPILED_HASH = "29fb4575d9b02c2da17bb1c630b21149aaef6db8ace25ee900d040add206d600";

export const BIG5_AUTHORITY = {
  schema_version: "fap.big5.private_result_authority.v1" as const,
  mode: "canonical" as const,
  locale: "zh-CN",
  source_hash: BIG5_SOURCE_HASH,
  compiled_hash: BIG5_COMPILED_HASH,
};

export function canonicalPrivateReport(): ReportResponse {
  const report = structuredClone(liveBridge) as ReportResponse;
  report.big5_private_result_authority = { ...BIG5_AUTHORITY };
  if (report.report) {
    report.report._meta = {
      ...(report.report._meta as Record<string, unknown> | undefined),
      big5_private_result_authority: { ...BIG5_AUTHORITY },
    };
  }
  return report;
}

export function canonicalHistoryItem(attemptId = "attempt-canonical"): MeAttemptItem {
  return {
    attempt_id: attemptId,
    scale_code: "BIG5_OCEAN",
    submitted_at: "2026-08-16T00:00:00Z",
    big5_private_result_authority: { ...BIG5_AUTHORITY },
    result_summary: { domains_mean: { O: 60, C: 55, E: 50, A: 45, N: 40 } },
    top_facets_summary_v1: { items: [] },
  };
}

export function canonicalShareSummary(): ShareSummaryResponse {
  const report = canonicalPrivateReport();
  return {
    ok: true,
    scale_code: "BIG5_OCEAN",
    share_id: "share-canonical",
    big5_private_result_authority: { ...BIG5_AUTHORITY },
    big5_public_projection_v1: report.big5_public_projection_v1,
  };
}
