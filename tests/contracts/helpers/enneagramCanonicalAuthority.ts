import type { ReportResponse, ShareSummaryResponse } from "@/lib/api/v0_3";

export const ENNEAGRAM_SOURCE_HASH = "a".repeat(64);
export const ENNEAGRAM_COMPILED_HASH = "b".repeat(64);
export const ENNEAGRAM_RELEASE_ID = "00000000-0000-4000-8000-000000000001";

export function canonicalEnneagramAuthority(locale: "en" | "zh-CN" = "en") {
  return {
    schema_version: "fap.enneagram.private_result_authority.v1",
    authority_id: "FERMATMIND_ENNEAGRAM_PRIVATE_RESULT_CANONICAL",
    mode: "canonical" as const,
    locale,
    release_id: ENNEAGRAM_RELEASE_ID,
    source_hash: ENNEAGRAM_SOURCE_HASH,
    compiled_hash: ENNEAGRAM_COMPILED_HASH,
    compiled_schema: "fap.enneagram.private_result.compiled.v1",
    compiler_schema: "fap.enneagram.private_result.compiler.v1",
    compiler_version: "1.0.0",
    runtime_contract: "enneagram.report.v2",
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function bindCanonicalEnneagramReport<T extends ReportResponse>(report: T, locale: "en" | "zh-CN" = "en"): T {
  const mutableReport = report as ReportResponse & Record<string, unknown>;
  const authority = canonicalEnneagramAuthority(locale);
  const reportMeta = asRecord(report.report?._meta) ?? {};
  const reportV2 = asRecord(report.enneagram_report_v2 ?? reportMeta.enneagram_report_v2);
  if (!reportV2) throw new Error("Test fixture requires enneagram_report_v2");

  mutableReport.locale = locale;
  report.enneagram_private_result_authority = authority;
  reportV2.locale = locale;
  reportV2.registry = {
    ...(asRecord(reportV2.registry) ?? {}),
    active_release_id: ENNEAGRAM_RELEASE_ID,
    source_hash: ENNEAGRAM_SOURCE_HASH,
    compiled_hash: ENNEAGRAM_COMPILED_HASH,
  };
  reportV2.provenance = {
    ...(asRecord(reportV2.provenance) ?? {}),
    canonical_release_id: ENNEAGRAM_RELEASE_ID,
    canonical_source_hash: ENNEAGRAM_SOURCE_HASH,
    canonical_compiled_hash: ENNEAGRAM_COMPILED_HASH,
  };

  const modules = Array.isArray(reportV2.modules)
    ? reportV2.modules
    : Array.isArray(reportV2.pages)
      ? reportV2.pages.flatMap((page) => {
          const pageModules = asRecord(page)?.modules;
          return Array.isArray(pageModules) ? pageModules : [];
        })
      : [];
  for (const reportModule of modules) {
    const content = asRecord(asRecord(reportModule)?.content);
    if (content) content.locale = locale;
  }

  if (report.report) {
    report.report._meta = {
      ...reportMeta,
      enneagram_private_result_authority: authority,
      enneagram_report_v2: reportV2,
    };
  }
  if (report.enneagram_report_v2) report.enneagram_report_v2 = reportV2;

  return report;
}

export function bindCanonicalEnneagramShare<T extends ShareSummaryResponse>(share: T, locale: "en" | "zh-CN" = "en"): T {
  const authority = canonicalEnneagramAuthority(locale);
  const summary = asRecord(share.enneagram_public_summary_v1);
  if (!summary) throw new Error("Test fixture requires enneagram_public_summary_v1");

  share.title = summary.summary_text ? `Canonical ${summary.interpretation_scope ?? "clear"} title` : "";
  share.enneagram_private_result_authority = authority;
  summary.canonical_authority_id = authority.authority_id;
  summary.canonical_release_id = authority.release_id;
  summary.canonical_source_hash = authority.source_hash;
  summary.canonical_compiled_hash = authority.compiled_hash;
  return share;
}

export function bindCanonicalEnneagramHistoryItem<T extends Record<string, unknown>>(item: T, locale: "en" | "zh-CN" = "en"): T {
  const mutableItem = item as Record<string, unknown>;
  const authority = canonicalEnneagramAuthority(locale);
  mutableItem.enneagram_private_result_authority = authority;
  mutableItem.enneagram_snapshot_binding_v1 = {
    canonical_release_id: authority.release_id,
    canonical_source_hash: authority.source_hash,
    canonical_compiled_hash: authority.compiled_hash,
  };
  return item;
}
