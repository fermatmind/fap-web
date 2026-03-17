import type {
  MbtiPublicProjectionDimensionRaw,
  MbtiPublicProjectionV1Raw,
  ReportResponse,
  ShareSummaryResponse,
} from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";

const TECHNICAL_TAG_PREFIXES = [
  "axis:",
  "state:",
  "type:",
  "role:",
  "strategy:",
  "borderline:",
] as const;

const RESULT_SECTION_ORDER = [
  "letters_intro",
  "overview",
  "trait_overview",
  "career.summary",
  "career.advantages",
  "career.weaknesses",
  "career.preferred_roles",
  "career.upgrade_suggestions",
  "growth.summary",
  "growth.strengths",
  "growth.weaknesses",
  "growth.motivators",
  "growth.drainers",
  "relationships.summary",
  "relationships.strengths",
  "relationships.weaknesses",
  "relationships.rel_advantages",
  "relationships.rel_risks",
] as const;

const SUPPORTED_RESULT_SECTION_RENDERS = [
  "rich_text",
  "bullets",
  "letters_intro",
  "trait_dimension_grid",
  "preferred_role_list",
  "premium_teaser",
] as const;

const MBTI_CANONICAL_TYPE_PATTERN = /^([EI][SN][TF][JP])(?:-([AT]))?$/i;

type SupportedResultSectionRender = (typeof SUPPORTED_RESULT_SECTION_RENDERS)[number];

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

export type MbtiResultProjectionSectionViewModel = {
  key: string;
  render: SupportedResultSectionRender;
  title: string;
  bodyMd: string;
  payload: Record<string, unknown> | null;
  isPremiumTeaser: boolean;
  source: string;
};

export type MbtiResultProjectionViewModel = {
  canonicalTypeCode: string;
  displayType: string;
  variantCode: string;
  typeName: string;
  nickname: string;
  rarity: string;
  keywords: string[];
  heroSummary: string;
  title: string;
  subtitle: string;
  summary: string;
  tagline: string;
  publicTags: string[];
  dimensions: MbtiPublicProjectionDimensionViewModel[];
  sections: MbtiResultProjectionSectionViewModel[];
  seo: Record<string, unknown> | null;
  rawProjection: MbtiPublicProjectionV1Raw | null;
  hasProjection: boolean;
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

type ProjectionCoreViewModel = Omit<MbtiResultProjectionViewModel, "sections" | "hasProjection">;

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

function parseMbtiTypeCode(value: unknown): { canonicalTypeCode: string; variantCode: string } | null {
  const normalized = normalizeText(value).toUpperCase();
  if (!normalized) {
    return null;
  }

  const match = MBTI_CANONICAL_TYPE_PATTERN.exec(normalized);
  if (!match?.[1]) {
    return null;
  }

  return {
    canonicalTypeCode: match[1],
    variantCode: normalizeText(match[2]).toUpperCase(),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
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

  const record = asRecord(value);
  if (!record) {
    return "";
  }

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

function buildProjectionCore(
  rawProjection?: MbtiPublicProjectionV1Raw | null
): ProjectionCoreViewModel {
  const projection = asRecord(rawProjection) as MbtiPublicProjectionV1Raw | null;
  const profile = asRecord(projection?.profile);
  const summaryCard = asRecord(projection?.summary_card);
  const keywords = normalizeStringArray(profile?.keywords).filter(isPublicTag);
  const publicTags = [
    ...normalizeStringArray(summaryCard?.public_tags ?? summaryCard?.tags).filter(isPublicTag),
    ...keywords,
  ];
  const dimensions = Array.isArray(projection?.dimensions)
    ? projection.dimensions
        .map(normalizeDimension)
        .filter((dimension): dimension is MbtiPublicProjectionDimensionViewModel => Boolean(dimension))
    : [];

  return {
    canonicalTypeCode: normalizeText(projection?.canonical_type_code).toUpperCase(),
    displayType: normalizeText(projection?.display_type, projection?.runtime_type_code).toUpperCase(),
    variantCode: normalizeText(projection?.variant_code).toUpperCase(),
    typeName: normalizeText(profile?.type_name),
    nickname: normalizeText(profile?.nickname),
    rarity: resolveRarity(profile?.rarity),
    keywords,
    heroSummary: normalizeText(profile?.hero_summary, profile?.summary),
    title: normalizeText(
      summaryCard?.title,
      projection?.display_type,
      profile?.type_name,
      projection?.canonical_type_code
    ),
    subtitle: normalizeText(summaryCard?.subtitle, summaryCard?.tagline),
    summary: normalizeText(summaryCard?.summary, profile?.hero_summary, profile?.summary),
    tagline: normalizeText(summaryCard?.tagline, summaryCard?.subtitle),
    publicTags: Array.from(new Set(publicTags)),
    dimensions,
    seo: asRecord(projection?.seo),
    rawProjection: projection,
  };
}

function normalizeSectionRender(value: unknown): SupportedResultSectionRender | null {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "bullet_list") {
    return "bullets";
  }

  return SUPPORTED_RESULT_SECTION_RENDERS.includes(normalized as SupportedResultSectionRender)
    ? (normalized as SupportedResultSectionRender)
    : null;
}

function normalizeResultProjectionSections(rawSections: unknown): MbtiResultProjectionSectionViewModel[] {
  const sections = Array.isArray(rawSections)
    ? rawSections
    : Object.entries(asRecord(rawSections) ?? {}).map(([key, value]) => ({
        ...(asRecord(value) ?? {}),
        key: normalizeText(asRecord(value)?.key, key),
      }));

  const byKey = new Map<string, MbtiResultProjectionSectionViewModel>();

  for (const entry of sections) {
    const section = asRecord(entry);
    if (!section) {
      continue;
    }

    const key = normalizeText(section.key).toLowerCase();
    const render = normalizeSectionRender(section.render ?? section.render_variant);

    if (!key || !render || byKey.has(key) || !RESULT_SECTION_ORDER.includes(key as (typeof RESULT_SECTION_ORDER)[number])) {
      continue;
    }

    byKey.set(key, {
      key,
      render,
      title: normalizeText(section.title) || key,
      bodyMd: normalizeText(section.body_md, section.bodyMd),
      payload: asRecord(section.payload),
      isPremiumTeaser: render === "premium_teaser",
      source: normalizeText(section.source, "projection"),
    });
  }

  return RESULT_SECTION_ORDER.map((key) => byKey.get(key)).filter(
    (section): section is MbtiResultProjectionSectionViewModel => section !== undefined
  );
}

function hasProjectionCoreContent(core: ProjectionCoreViewModel, sections: MbtiResultProjectionSectionViewModel[]): boolean {
  return Boolean(
    core.displayType ||
      core.canonicalTypeCode ||
      core.variantCode ||
      core.typeName ||
      core.nickname ||
      core.title ||
      core.subtitle ||
      core.summary ||
      core.heroSummary ||
      core.publicTags.length > 0 ||
      core.keywords.length > 0 ||
      core.dimensions.length > 0 ||
      sections.length > 0
  );
}

export function normalizeMbtiPublicProjectionCard(
  rawProjection?: MbtiPublicProjectionV1Raw | null
): MbtiPublicProjectionCardViewModel | null {
  const core = buildProjectionCore(rawProjection);

  if (!hasProjectionCoreContent(core, [])) {
    return null;
  }

  return {
    canonicalTypeCode: core.canonicalTypeCode,
    displayType: core.displayType,
    variantCode: core.variantCode,
    typeName: core.typeName,
    title: core.title,
    subtitle: core.subtitle,
    summary: core.summary,
    tagline: core.tagline,
    rarity: core.rarity,
    publicTags: core.publicTags,
    dimensions: core.dimensions,
  };
}

export function buildMbtiResultProjectionViewModel(
  report: ReportResponse
): MbtiResultProjectionViewModel {
  const core = buildProjectionCore(report.mbti_public_projection_v1);
  const sections = normalizeResultProjectionSections(core.rawProjection?.sections);

  return {
    ...core,
    sections,
    hasProjection: hasProjectionCoreContent(core, sections),
  };
}

export function hasMbtiResultProjection(report: ReportResponse): boolean {
  return buildMbtiResultProjectionViewModel(report).hasProjection;
}

export function normalizeMbtiCanonicalTypeCode(value: unknown): string {
  return parseMbtiTypeCode(value)?.canonicalTypeCode ?? "";
}

export function isMbtiCanonicalTypeCode(value: unknown): boolean {
  const parsed = parseMbtiTypeCode(value);
  return Boolean(parsed && !parsed.variantCode);
}

export function buildMbtiCareerRecommendationHref(
  locale: Locale,
  displayType: unknown
): string {
  const parsed = parseMbtiTypeCode(displayType);
  if (!parsed) {
    return "";
  }

  const slug = parsed.variantCode
    ? `${parsed.canonicalTypeCode}-${parsed.variantCode}`
    : parsed.canonicalTypeCode;

  return `/${locale}/career/recommendations/mbti/${slug.toLowerCase()}`;
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
