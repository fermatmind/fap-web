import type { EnneagramPublicSummaryPair, ShareSummaryResponse } from "@/lib/api/v0_3";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { buildEnneagramTakeHref } from "@/lib/enneagram/forms";
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
  triggerReason: string | null;
  summary: string | null;
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
  lead: string;
  methodologyBoundary: string;
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
    triggerReason: normalizeText(value.trigger_reason) || null,
    summary: normalizeText(value.summary) || null,
  };
}

function buildLead(options: {
  locale: Locale;
  scope: EnneagramShareViewModel["interpretationScope"];
  primaryLabel: string;
  secondaryLabel: string;
}): string {
  const { locale, scope, primaryLabel, secondaryLabel } = options;

  if (locale === "zh") {
    if (scope === "close_call") {
      return primaryLabel && secondaryLabel
        ? `这次结果更接近 ${primaryLabel}，但也和 ${secondaryLabel} 保持近邻竞争。`
        : "这次结果显示出两个近邻候选，需要结合后续阅读谨慎理解。";
    }

    if (scope === "diffuse") {
      return "这次结果呈现分散结构，更适合把 Top3 当作阅读入口，而不是直接下单一主型判断。";
    }

    if (scope === "low_quality") {
      return "这次结果仍可阅读，但解释边界较宽，建议优先关注方法边界和后续观察。";
    }

    return primaryLabel ? `这次结果当前更接近 ${primaryLabel}。` : "这次结果提供了一个当前更接近的主候选。";
  }

  if (scope === "close_call") {
    return primaryLabel && secondaryLabel
      ? `This result leans toward ${primaryLabel}, while ${secondaryLabel} remains a close neighboring candidate.`
      : "This result shows two nearby candidates and should be read cautiously.";
  }

  if (scope === "diffuse") {
    return "This result is more diffuse, so the Top 3 is a better reading entry than a hard single-type claim.";
  }

  if (scope === "low_quality") {
    return "This result is still readable, but the interpretation boundary is wider than usual.";
  }

  return primaryLabel ? `This result currently leans toward ${primaryLabel}.` : "This result provides a current best-fit candidate.";
}

function buildMethodologyBoundary(locale: Locale, formLabel: string, methodologyVariant: string): string {
  if (locale === "zh") {
    return `${formLabel || "当前题型"}采用 ${methodologyVariant || "当前方法"}。同属 FermatMind 九型模型，不代表和其他题型处于同一分数空间。`;
  }

  return `${formLabel || "This form"} uses ${methodologyVariant || "its current method"}. It stays within the FermatMind Enneagram model, but it does not imply the same score space as other forms.`;
}

export function buildEnneagramShareViewModel(
  rawShare: ShareSummaryResponse | null | undefined,
  locale: Locale
): EnneagramShareViewModel | null {
  const rawSummary = asRecord(rawShare?.enneagram_public_summary_v1);
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
  const primaryLabel = primaryCandidate?.label ?? "";
  const secondaryLabel = secondCandidate?.label ?? closeCallPair?.typeB?.label ?? "";

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
    summaryText: normalizeText(rawSummary.summary_text) || null,
    lead: buildLead({ locale, scope: interpretationScope, primaryLabel, secondaryLabel }),
    methodologyBoundary: buildMethodologyBoundary(locale, formLabel ?? "", methodologyVariant ?? ""),
    startTestHref: buildEnneagramTakeHref(SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, locale, formCode) || localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM}/take`, locale),
  };
}
