import type { EnneagramPublicSummaryPair, ShareSummaryResponse } from "@/lib/api/v0_3";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { buildEnneagramTakeHref } from "@/lib/enneagram/forms";
import { isEnneagramPrivateSurfaceLocaleCompatible } from "@/lib/enneagram/privateResultLocale";
import { resolveEnneagramShareAuthority } from "@/lib/enneagram/privateResultAuthority";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export type EnneagramShareType = {
  code: string;
  label: string;
  rank: number | null;
  role: string | null;
};

export type EnneagramSharePair = {
  typeA: EnneagramShareType | null;
  typeB: EnneagramShareType | null;
};

export type EnneagramShareViewModel = {
  scaleCode: string;
  shareId: string;
  formCode: string | null;
  formLabel: string | null;
  formKind: string | null;
  methodologyVariant: string | null;
  interpretationScope: "clear" | "close_call" | "diffuse" | "low_quality";
  confidenceLevel: string | null;
  confidenceLabel: string | null;
  primaryCandidate: EnneagramShareType | null;
  secondCandidate: EnneagramShareType | null;
  thirdCandidate: EnneagramShareType | null;
  topTypes: EnneagramShareType[];
  all9ProfileMini: EnneagramShareType[];
  closeCallPair: EnneagramSharePair | null;
  compareCompatibilityGroup: string | null;
  crossFormComparable: boolean;
  generatedAt: string | null;
  publicSurfaceVersion: string | null;
  summaryText: string | null;
  title: string;
  lead: string;
  methodologyBoundary: string | null;
  startTestHref: string;
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

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeScope(value: unknown): EnneagramShareViewModel["interpretationScope"] {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "close_call" || normalized === "diffuse" || normalized === "low_quality") {
    return normalized;
  }

  return "clear";
}

function normalizeType(value: unknown, fallbackRank?: number | null, fallbackRole?: string | null): EnneagramShareType | null {
  const row = asRecord(value);
  if (!row) {
    const code = normalizeText(value);
    return code ? { code, label: code, rank: fallbackRank ?? null, role: fallbackRole ?? null } : null;
  }

  const code = normalizeText(row.code, row.type_code, row.type, row.key);
  if (!code) {
    return null;
  }

  return {
    code,
    label: normalizeText(row.label, row.name, row.title, code),
    rank: normalizeNumber(row.rank) ?? fallbackRank ?? null,
    role: normalizeText(row.role, row.candidate_role, fallbackRole) || null,
  };
}

function normalizeTypeList(value: unknown): EnneagramShareType[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeType(entry, index + 1, null))
    .filter((entry): entry is EnneagramShareType => entry !== null);
}

function normalizePair(value: EnneagramPublicSummaryPair | null | undefined): EnneagramSharePair | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    typeA: normalizeType(value.type_a, 1, "primary"),
    typeB: normalizeType(value.type_b, 2, "secondary"),
  };
}

export function buildEnneagramShareViewModel(
  rawShare: ShareSummaryResponse | null | undefined,
  locale: Locale
): EnneagramShareViewModel | null {
  const rawSummary = asRecord(rawShare?.enneagram_public_summary_v1);
  if (
    !isEnneagramPrivateSurfaceLocaleCompatible(rawShare, locale) ||
    !isEnneagramPrivateSurfaceLocaleCompatible(rawSummary, locale) ||
    resolveEnneagramShareAuthority(rawShare, locale)?.mode !== "canonical"
  ) {
    return null;
  }
  const scaleCode = normalizeText(rawShare?.scale_code, rawSummary?.scale_code).toUpperCase();
  if (scaleCode !== "ENNEAGRAM" || !rawSummary) {
    return null;
  }

  const formCode = normalizeText(rawSummary.form_code) || null;
  const formLabel = normalizeText(rawSummary.form_label) || null;
  const formKind = normalizeText(rawSummary.form_kind) || null;
  const methodologyVariant = normalizeText(rawSummary.methodology_variant) || null;
  const interpretationScope = normalizeScope(rawSummary.interpretation_scope);
  const topTypes = normalizeTypeList(rawSummary.top_types);
  const all9ProfileMini = normalizeTypeList(rawSummary.all9_profile_mini);
  const primaryCandidate =
    normalizeType(rawSummary.primary_candidate, 1, "primary") ??
    topTypes[0] ??
    null;
  const secondCandidate =
    normalizeType(rawSummary.second_candidate, 2, "secondary") ??
    topTypes[1] ??
    null;
  const thirdCandidate =
    normalizeType(rawSummary.third_candidate, 3, "tertiary") ??
    topTypes[2] ??
    null;
  const closeCallPair = normalizePair(rawSummary.close_call_pair as EnneagramPublicSummaryPair | null | undefined);
  const title = normalizeText(rawShare?.title);
  const summaryText = normalizeText(rawSummary.summary_text);
  if (!title || !summaryText) return null;

  return {
    scaleCode,
    shareId: normalizeText(rawShare?.share_id, rawShare?.id),
    formCode,
    formLabel,
    formKind,
    methodologyVariant,
    interpretationScope,
    confidenceLevel: normalizeText(rawSummary.confidence_level) || null,
    confidenceLabel: normalizeText(rawSummary.confidence_label) || null,
    primaryCandidate,
    secondCandidate,
    thirdCandidate,
    topTypes,
    all9ProfileMini,
    closeCallPair,
    compareCompatibilityGroup: normalizeText(rawSummary.compare_compatibility_group) || null,
    crossFormComparable: rawSummary.cross_form_comparable === true,
    generatedAt: normalizeText(rawSummary.generated_at, rawShare?.created_at) || null,
    publicSurfaceVersion: normalizeText(rawSummary.public_surface_version) || null,
    summaryText,
    title,
    lead: summaryText,
    methodologyBoundary: normalizeText(rawSummary.methodology_boundary) || null,
    startTestHref: buildEnneagramTakeHref(SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, locale, formCode) || localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM}/take`, locale),
  };
}
