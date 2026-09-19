import type { ReportResponse, ShareSummaryResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";

const AUTHORITY_SCHEMA = "fap.enneagram.private_result_authority.v1";
const AUTHORITY_ID = "FERMATMIND_ENNEAGRAM_PRIVATE_RESULT_CANONICAL";
const COMPILED_SCHEMA = "fap.enneagram.private_result.compiled.v1";
const COMPILER_SCHEMA = "fap.enneagram.private_result.compiler.v1";
const COMPILER_VERSION = "1.0.0";
const RUNTIME_CONTRACT = "enneagram.report.v2";
const HASH_PATTERN = /^[0-9a-f]{64}$/;

type RecordValue = Record<string, unknown>;

export type EnneagramPrivateResultAuthorityView = {
  mode: "canonical" | "immutable_legacy_snapshot";
  locale: "zh-CN" | "en" | null;
  releaseId: string;
  sourceHash: string;
  compiledHash: string;
};

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RecordValue) : null;
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function normalizeLocale(value: unknown): "zh-CN" | "en" | null {
  const normalized = text(value).toLowerCase().replace("_", "-");
  if (normalized === "zh" || normalized === "zh-cn") return "zh-CN";
  if (normalized === "en" || normalized === "en-us") return "en";
  return null;
}

function requestedLocale(locale: Locale): "zh-CN" | "en" {
  return locale === "zh" ? "zh-CN" : "en";
}

export function parseEnneagramPrivateResultAuthority(
  value: unknown,
  locale?: Locale
): EnneagramPrivateResultAuthorityView | null {
  const raw = asRecord(value);
  if (!raw || text(raw.schema_version) !== AUTHORITY_SCHEMA) return null;

  const mode = text(raw.mode);
  const authorityLocale = normalizeLocale(raw.locale);
  if (locale && authorityLocale !== requestedLocale(locale)) return null;

  if (mode === "immutable_legacy_snapshot") {
    return text(raw.authority_id) === "" && text(raw.release_id) === "" && text(raw.source_hash) === "" && text(raw.compiled_hash) === ""
      ? { mode, locale: authorityLocale, releaseId: "", sourceHash: "", compiledHash: "" }
      : null;
  }

  const releaseId = text(raw.release_id);
  const sourceHash = text(raw.source_hash).toLowerCase();
  const compiledHash = text(raw.compiled_hash).toLowerCase();
  if (
    mode !== "canonical" ||
    text(raw.authority_id) !== AUTHORITY_ID ||
    authorityLocale === null ||
    releaseId === "" ||
    !HASH_PATTERN.test(sourceHash) ||
    !HASH_PATTERN.test(compiledHash) ||
    text(raw.compiled_schema) !== COMPILED_SCHEMA ||
    text(raw.compiler_schema) !== COMPILER_SCHEMA ||
    text(raw.compiler_version) !== COMPILER_VERSION ||
    text(raw.runtime_contract) !== RUNTIME_CONTRACT
  ) {
    return null;
  }

  return { mode, locale: authorityLocale, releaseId, sourceHash, compiledHash };
}

function sameAuthority(
  left: EnneagramPrivateResultAuthorityView | null,
  right: EnneagramPrivateResultAuthorityView | null
): boolean {
  return Boolean(
    left &&
      right &&
      left.mode === right.mode &&
      left.locale === right.locale &&
      left.releaseId === right.releaseId &&
      left.sourceHash === right.sourceHash &&
      left.compiledHash === right.compiledHash
  );
}

export function resolveEnneagramPrivateResultAuthority(
  reportData: ReportResponse | null | undefined,
  locale: Locale
): EnneagramPrivateResultAuthorityView | null {
  if (!reportData) return null;

  const report = asRecord(reportData.report);
  const meta = asRecord(report?._meta);
  const topLevelAuthorityValue = reportData.enneagram_private_result_authority;
  const metaAuthorityValue = meta?.enneagram_private_result_authority;
  const topLevelAuthority = topLevelAuthorityValue === undefined
    ? null
    : parseEnneagramPrivateResultAuthority(topLevelAuthorityValue, locale);
  const metaAuthority = metaAuthorityValue === undefined
    ? null
    : parseEnneagramPrivateResultAuthority(metaAuthorityValue, locale);
  if (
    topLevelAuthorityValue !== undefined &&
    metaAuthorityValue !== undefined &&
    !sameAuthority(topLevelAuthority, metaAuthority)
  ) {
    return null;
  }
  const external = topLevelAuthorityValue !== undefined ? topLevelAuthority : metaAuthority;
  const reportV2 = asRecord(reportData.enneagram_report_v2 ?? meta?.enneagram_report_v2);

  if (external?.mode === "immutable_legacy_snapshot" && !reportV2) return external;
  if (external?.mode !== "canonical" || !reportV2) return null;

  const projectionV2 = asRecord(reportData.enneagram_public_projection_v2 ?? meta?.enneagram_public_projection_v2);
  if (projectionV2?.private_result_authority !== undefined) {
    const projectionAuthority = parseEnneagramPrivateResultAuthority(projectionV2.private_result_authority, locale);
    if (!sameAuthority(external, projectionAuthority)) return null;
  }

  const registry = asRecord(reportV2.registry);
  const provenance = asRecord(reportV2.provenance);
  if (
    text(reportV2.schema_version) !== RUNTIME_CONTRACT ||
    text(reportV2.scale_code).toUpperCase() !== "ENNEAGRAM" ||
    normalizeLocale(reportV2.locale) !== requestedLocale(locale) ||
    text(registry?.active_release_id) !== external.releaseId ||
    text(registry?.source_hash).toLowerCase() !== external.sourceHash ||
    text(registry?.compiled_hash).toLowerCase() !== external.compiledHash ||
    text(provenance?.canonical_release_id) !== external.releaseId ||
    text(provenance?.canonical_source_hash).toLowerCase() !== external.sourceHash ||
    text(provenance?.canonical_compiled_hash).toLowerCase() !== external.compiledHash
  ) {
    return null;
  }

  return external;
}

export function resolveEnneagramShareAuthority(
  share: ShareSummaryResponse | null | undefined,
  locale: Locale
): EnneagramPrivateResultAuthorityView | null {
  if (!share) return null;
  const authority = parseEnneagramPrivateResultAuthority(share.enneagram_private_result_authority, locale);
  const summary = asRecord(share.enneagram_public_summary_v1);
  if (
    authority?.mode !== "canonical" ||
    text(summary?.canonical_authority_id) !== AUTHORITY_ID ||
    text(summary?.canonical_release_id) !== authority.releaseId ||
    text(summary?.canonical_source_hash).toLowerCase() !== authority.sourceHash ||
    text(summary?.canonical_compiled_hash).toLowerCase() !== authority.compiledHash
  ) {
    return null;
  }

  return authority;
}
