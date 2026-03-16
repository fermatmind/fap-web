import type {
  MbtiPublicProjectionDimensionRaw,
  MbtiPublicProjectionV1Raw,
  ShareSummaryResponse,
} from "@/lib/api/v0_3";

const TECHNICAL_TAG_PREFIXES = [
  "axis:",
  "state:",
  "type:",
  "role:",
  "strategy:",
  "borderline:",
] as const;

export type MbtiPublicProjectionDimensionViewModel = {
  code: string;
  label: string;
  percent: number;
  side: string;
  sideLabel: string;
  state: string;
  summary: string;
};

export type MbtiPublicProjectionCardViewModel = {
  canonicalTypeCode: string;
  displayType: string;
  variantCode: string;
  typeName: string;
  title: string;
  subtitle: string;
  summary: string;
  tagline: string;
  rarity: string;
  publicTags: string[];
  dimensions: MbtiPublicProjectionDimensionViewModel[];
};

export type MbtiSharePageViewModel = {
  card: MbtiPublicProjectionCardViewModel | null;
  shareId: string;
  shareUrl: string;
  attemptId: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  compareEnabled: boolean;
  compareCtaLabel: string;
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => normalizeText(item))
        .filter(Boolean)
    )
  );
}

function resolveRarity(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return normalizeText(value);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;
  return normalizeText(record.label, record.text, record.value, record.title);
}

function toRoundedPercent(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  const normalized = value > 1 ? value : value * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function isPublicTag(tag: string): boolean {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return !TECHNICAL_TAG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function normalizeDimension(
  dimension: MbtiPublicProjectionDimensionRaw,
  index: number
): MbtiPublicProjectionDimensionViewModel | null {
  const code = normalizeText(dimension.code, dimension.id).toUpperCase();
  const label = normalizeText(dimension.label, dimension.name, code);
  if (!label) {
    return null;
  }

  return {
    code: code || `DIMENSION_${index + 1}`,
    label,
    percent: toRoundedPercent(
      typeof dimension.pct === "number"
        ? dimension.pct
        : dimension.score_pct
    ),
    side: normalizeText(dimension.side),
    sideLabel: normalizeText(dimension.side_label),
    state: normalizeText(dimension.state),
    summary: normalizeText(dimension.summary, dimension.description),
  };
}

export function normalizeMbtiPublicProjectionCard(
  rawProjection?: MbtiPublicProjectionV1Raw | null
): MbtiPublicProjectionCardViewModel | null {
  if (!rawProjection || typeof rawProjection !== "object") {
    return null;
  }

  const canonicalTypeCode = normalizeText(rawProjection.canonical_type_code).toUpperCase();
  const displayType = normalizeText(rawProjection.display_type, canonicalTypeCode);
  const variantCode = normalizeText(rawProjection.variant_code).toUpperCase();
  const profile = rawProjection.profile;
  const summaryCard = rawProjection.summary_card;
  const typeName = normalizeText(profile?.type_name);
  const title = normalizeText(summaryCard?.title, displayType, typeName, canonicalTypeCode);
  const subtitle = normalizeText(summaryCard?.subtitle);
  const summary = normalizeText(summaryCard?.summary, profile?.hero_summary);
  const tagline = normalizeText(summaryCard?.tagline);
  const rarity = resolveRarity(profile?.rarity);
  const publicTags = [
    ...normalizeStringArray(summaryCard?.public_tags),
    ...normalizeStringArray(profile?.keywords),
  ].filter(isPublicTag);
  const dimensions = Array.isArray(rawProjection.dimensions)
    ? rawProjection.dimensions
        .map(normalizeDimension)
        .filter((dimension): dimension is MbtiPublicProjectionDimensionViewModel => Boolean(dimension))
    : [];

  if (!canonicalTypeCode && !displayType && !title) {
    return null;
  }

  return {
    canonicalTypeCode,
    displayType,
    variantCode,
    typeName,
    title,
    subtitle,
    summary,
    tagline,
    rarity,
    publicTags: Array.from(new Set(publicTags)),
    dimensions,
  };
}

export function buildSharePageViewModel(
  rawShare?: ShareSummaryResponse | null
): MbtiSharePageViewModel {
  return {
    card: normalizeMbtiPublicProjectionCard(rawShare?.mbti_public_projection_v1),
    shareId: normalizeText(rawShare?.share_id, rawShare?.id),
    shareUrl: normalizeText(rawShare?.share_url),
    attemptId: normalizeText(rawShare?.attempt_id),
    primaryCtaLabel: normalizeText(rawShare?.primary_cta_label),
    primaryCtaPath: normalizeText(rawShare?.primary_cta_path),
    compareEnabled: rawShare?.compare_enabled === true,
    compareCtaLabel: normalizeText(rawShare?.compare_cta_label),
  };
}
