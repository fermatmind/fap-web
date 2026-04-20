import type {
  Big5ReportSection,
  EnneagramPublicProjection,
  ReportResponse,
} from "@/lib/api/v0_3";
import { buildEnneagramFormDisplayLabel, normalizeEnneagramFormSummary } from "@/lib/enneagram/formSummary";
import type { Locale } from "@/lib/i18n/locales";

export type EnneagramTypeRow = {
  code: string;
  label: string;
  score: number | null;
  rank: number | null;
};

export type EnneagramResultViewModel = {
  projection: EnneagramPublicProjection | null;
  formSummaryLabel: string | null;
  primaryType: EnneagramTypeRow | null;
  typeVector: EnneagramTypeRow[];
  topTypes: EnneagramTypeRow[];
  summary: string;
  qualityLevel: string;
  confidenceLabel: string;
  visibleSections: Big5ReportSection[];
  lockedSections: Big5ReportSection[];
};

type AccessGate = {
  isFreeVariant: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeTypeRow(value: unknown): EnneagramTypeRow | null {
  const row = asRecord(value);
  if (!row) {
    const code = normalizeText(value);
    return code ? { code, label: code, score: null, rank: null } : null;
  }

  const code = normalizeText(row.code, row.type_code, row.type, row.key);
  if (!code) {
    return null;
  }

  return {
    code,
    label: normalizeText(row.label, row.name, row.title, code),
    score: normalizeNumber(row.score ?? row.percent ?? row.value),
    rank: normalizeNumber(row.rank),
  };
}

function normalizeTypeRows(value: unknown): EnneagramTypeRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeTypeRow(item))
    .filter((item): item is EnneagramTypeRow => item !== null);
}

function normalizeSections(value: unknown): Big5ReportSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Big5ReportSection => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map((item) => item as Big5ReportSection);
}

function resolveProjection(reportData: ReportResponse): EnneagramPublicProjection | null {
  if (reportData.enneagram_public_projection_v1) {
    return reportData.enneagram_public_projection_v1;
  }

  const metaProjection = asRecord(reportData.report?._meta)?.enneagram_public_projection_v1;
  if (metaProjection && typeof metaProjection === "object" && !Array.isArray(metaProjection)) {
    return metaProjection as EnneagramPublicProjection;
  }

  return null;
}

function resolvePrimaryType(projection: EnneagramPublicProjection | null): EnneagramTypeRow | null {
  if (!projection) {
    return null;
  }

  const primary = projection.primary_type ?? projection.primaryType;
  if (primary) {
    const row = normalizeTypeRow(primary);
    if (row) {
      return row;
    }
  }

  const primaryCode = normalizeText(projection.type_code, projection.primary_type_code);
  return primaryCode ? { code: primaryCode, label: primaryCode, score: null, rank: null } : null;
}

function resolveTypeVector(projection: EnneagramPublicProjection | null): EnneagramTypeRow[] {
  if (!projection) {
    return [];
  }

  return normalizeTypeRows(projection.type_vector ?? projection.typeVector ?? projection.ranked_types ?? projection.rankedTypes);
}

function resolveTopTypes(projection: EnneagramPublicProjection | null): EnneagramTypeRow[] {
  if (!projection) {
    return [];
  }

  return normalizeTypeRows(projection.top_types ?? projection.topTypes);
}

function resolveQualityLevel(projection: EnneagramPublicProjection | null, reportData: ReportResponse): string {
  const quality = asRecord(projection?.quality) ?? asRecord(reportData.quality);
  return normalizeText(quality?.level, quality?.grade, reportData.meta?.quality_level);
}

function resolveConfidenceLabel(projection: EnneagramPublicProjection | null): string {
  const confidence = asRecord(projection?.confidence);
  return normalizeText(confidence?.label, confidence?.level, confidence?.bucket);
}

function resolveSections(reportData: ReportResponse, projection: EnneagramPublicProjection | null): Big5ReportSection[] {
  const reportSections = normalizeSections(reportData.report?.sections);
  if (reportSections.length > 0) {
    return reportSections;
  }

  return normalizeSections(projection?.sections);
}

function splitSections(sections: Big5ReportSection[], gate: AccessGate): {
  visibleSections: Big5ReportSection[];
  lockedSections: Big5ReportSection[];
} {
  if (!gate.isFreeVariant) {
    return {
      visibleSections: sections,
      lockedSections: [],
    };
  }

  return {
    visibleSections: sections.filter((section) => normalizeText(section.access_level).toLowerCase() !== "paid"),
    lockedSections: sections.filter((section) => normalizeText(section.access_level).toLowerCase() === "paid"),
  };
}

export function assembleEnneagramResultViewModel({
  reportData,
  gate,
  locale,
}: {
  reportData: ReportResponse;
  gate: AccessGate;
  locale: Locale;
}): EnneagramResultViewModel {
  const projection = resolveProjection(reportData);
  const formSummary = normalizeEnneagramFormSummary(reportData.enneagram_form_v1 ?? null);
  const sections = resolveSections(reportData, projection);
  const split = splitSections(sections, gate);

  return {
    projection,
    formSummaryLabel: buildEnneagramFormDisplayLabel(formSummary, { locale }),
    primaryType: resolvePrimaryType(projection),
    typeVector: resolveTypeVector(projection),
    topTypes: resolveTopTypes(projection),
    summary: normalizeText(projection?.summary, projection?.headline, reportData.summary, reportData.report?.summary),
    qualityLevel: resolveQualityLevel(projection, reportData),
    confidenceLabel: resolveConfidenceLabel(projection),
    visibleSections: split.visibleSections,
    lockedSections: split.lockedSections,
  };
}

export function hasEnneagramProjection(reportData: ReportResponse | null | undefined): boolean {
  if (!reportData) {
    return false;
  }

  return Boolean(resolveProjection(reportData));
}
