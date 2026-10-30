import type { ReportResponse } from "@/lib/api/v0_3";
import { parseBig5PrivateResultAuthority, resolveBig5PrivateResultAuthority } from "./privateResultAuthority";

export const BIG5_READING_COPY_REVISION = "big5.reading_copy.20261030.v1";
export type Big5ReadingCopy = { revision: string; sourceHash: string; compiledHash: string };
const HASH = /^[a-f0-9]{64}$/;
const record = (v: unknown): Record<string, unknown> | null => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : null;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** The API keeps the saved report untouched and emits this separately bound, read-only view. */
export function withBig5ReadingCopy(input: ReportResponse, locale?: "en" | "zh-CN"): ReportResponse | null {
  const root = record(input);
  if (!root) return null;
  if (!Object.hasOwn(root, "big5_reading_copy_v1")) return input;
  const view = record(root.big5_reading_copy_v1);
  const original = record(input.report), projected = record(view?.report);
  const originalMeta = record(original?._meta), projectedMeta = record(projected?._meta);
  const authority = resolveBig5PrivateResultAuthority(input);
  const originalCopyAuthority = parseBig5PrivateResultAuthority(view?.original_authority);
  const readingAuthority = parseBig5PrivateResultAuthority(view?.reading_authority);
  if (!view || !original || !projected || !authority || !originalCopyAuthority || !readingAuthority
    || view.status !== "ready" || view.schema_version !== "big5.reading_copy.v1" || view.revision !== BIG5_READING_COPY_REVISION
    || (locale && view.locale !== locale) || readingAuthority.locale !== view.locale
    || readingAuthority.mode !== "canonical" || !["en", "zh-CN"].includes(String(view.locale))
    || !same(authority, originalCopyAuthority)
    || !same(originalMeta?.big5_private_result_authority, projectedMeta?.big5_private_result_authority)
    || !HASH.test(String(view.original_report_sha256)) || !HASH.test(String(view.projected_report_sha256))
    || !Array.isArray(view.applied_keys) || !view.applied_keys.length
    || !Array.isArray(projected.sections)) return null;
  for (const key of ["scale_code", "scale_code_v2", "scale_code_legacy", "scale_uid", "norms", "quality", "variant", "report_snapshot_identity"]) {
    if (!same(original[key], projected[key])) return null;
  }
  const beforeEngine = record(originalMeta?.big5_report_engine_v2);
  const afterEngine = record(projectedMeta?.big5_report_engine_v2);
  for (const key of ["score_vector", "norm_evidence", "quality", "engine_decisions", "report_snapshot_identity", "locale", "form_code"]) {
    if (!same(beforeEngine?.[key], afterEngine?.[key])) return null;
  }
  const beforeProjection = record(originalMeta?.big5_public_projection_v1);
  const afterProjection = record(projectedMeta?.big5_public_projection_v1);
  for (const key of ["trait_vector", "facet_vector", "trait_bands", "dominant_traits", "variant_keys", "_meta"]) {
    if (!same(beforeProjection?.[key], afterProjection?.[key])) return null;
  }
  return {
    ...input,
    report: projected as ReportResponse["report"],
    big5_report_engine_v2: (afterEngine ?? input.big5_report_engine_v2) as ReportResponse["big5_report_engine_v2"],
    big5_public_projection_v1: (record(projectedMeta?.big5_public_projection_v1) ?? input.big5_public_projection_v1) as ReportResponse["big5_public_projection_v1"],
  };
}

export function big5ReadingCopyMetadata(input: ReportResponse): Big5ReadingCopy | undefined {
  const view = record(record(input)?.big5_reading_copy_v1);
  const authority = parseBig5PrivateResultAuthority(view?.reading_authority);
  return view?.status === "ready" && view.revision === BIG5_READING_COPY_REVISION && authority
    ? { revision: BIG5_READING_COPY_REVISION, sourceHash: authority.source_hash, compiledHash: authority.compiled_hash } : undefined;
}
