import type {
  MbtiReadContractRaw,
  MbtiPersonalizationRaw,
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
  "traits.why_this_type",
  "traits.close_call_axes",
  "traits.adjacent_type_contrast",
  "traits.decision_style",
  "career.summary",
  "career.collaboration_fit",
  "career.work_environment",
  "career.work_experiments",
  "career.advantages",
  "career.weaknesses",
  "career.preferred_roles",
  "career.next_step",
  "career.upgrade_suggestions",
  "growth.summary",
  "growth.stability_confidence",
  "growth.next_actions",
  "growth.weekly_experiments",
  "growth.strengths",
  "growth.weaknesses",
  "growth.stress_recovery",
  "growth.watchouts",
  "growth.motivators",
  "growth.drainers",
  "relationships.summary",
  "relationships.strengths",
  "relationships.weaknesses",
  "relationships.communication_style",
  "relationships.try_this_week",
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
  variantKey: string;
};

export type MbtiPersonalizationAxisViewModel = {
  axis: string;
  axisLabel: string;
  side: string;
  sideLabel: string;
  percent: number;
  delta: number;
  state: string;
  band: string;
};

export type MbtiCloseCallAxisViewModel = MbtiPersonalizationAxisViewModel & {
  oppositeSide: string;
  oppositeSideLabel: string;
  boundary: boolean;
};

export type MbtiSceneFingerprintEntryViewModel = {
  scene: string;
  title: string;
  summary: string;
  styleKey: string;
  styleKeys: string[];
  chapterAnchor: string;
  primaryAxis: MbtiPersonalizationAxisViewModel | null;
  supportAxis: MbtiPersonalizationAxisViewModel | null;
  boundaryAxes: string[];
};

export type MbtiUserStateViewModel = {
  isFirstView: boolean;
  isRevisit: boolean;
  hasUnlock: boolean;
  hasFeedback: boolean;
  hasShare: boolean;
  hasActionEngagement: boolean;
  feedbackSentiment: string;
  feedbackCoverage: string;
  actionCompletionTendency: string;
  lastDeepReadSection: string;
  currentIntentCluster: string;
};

export type MbtiOrchestrationViewModel = {
  orderedSectionKeys: string[];
  primaryFocusKey: string;
  secondaryFocusKeys: string[];
  ctaPriorityKeys: string[];
};

export type MbtiContinuityViewModel = {
  carryoverFocusKey: string;
  carryoverReason: string;
  recommendedResumeKeys: string[];
  carryoverSceneKeys: string[];
  carryoverActionKeys: string[];
  feedbackSentiment: string;
  feedbackCoverage: string;
  actionCompletionTendency: string;
  lastDeepReadSection: string;
  currentIntentCluster: string;
};

export type MbtiReadContractFieldGroupViewModel = {
  personalizationFields: string[];
  surfaceFields: string[];
  sources: string[];
};

export type MbtiReadContractViewModel = {
  version: string;
  canonicalReadModel: MbtiReadContractFieldGroupViewModel | null;
  overlayPatch: MbtiReadContractFieldGroupViewModel | null;
  cacheableFields: string[];
  nonCacheableFields: string[];
  telemetryParityFields: string[];
};

export type MbtiResultPersonalizationViewModel = {
  locale: string;
  typeCode: string;
  identity: string;
  explainabilitySummary: string;
  closeCallAxes: MbtiCloseCallAxisViewModel[];
  neighborTypeKeys: string[];
  contrastKeys: Record<string, string>;
  confidenceOrStabilityKeys: string[];
  axisVector: Record<string, MbtiPersonalizationAxisViewModel>;
  axisBands: Record<string, string>;
  boundaryFlags: Record<string, boolean>;
  dominantAxes: MbtiPersonalizationAxisViewModel[];
  sceneFingerprint: Record<string, MbtiSceneFingerprintEntryViewModel>;
  workStyleKeys: string[];
  relationshipStyleKeys: string[];
  decisionStyleKeys: string[];
  stressRecoveryKeys: string[];
  communicationStyleKeys: string[];
  workStyleSummary: string;
  roleFitKeys: string[];
  collaborationFitKeys: string[];
  workEnvPreferenceKeys: string[];
  careerNextStepKeys: string[];
  actionPlanSummary: string;
  weeklyActionKeys: string[];
  relationshipActionKeys: string[];
  workExperimentKeys: string[];
  watchoutKeys: string[];
  orderedRecommendationKeys: string[];
  orderedActionKeys: string[];
  recommendationPriorityKeys: string[];
  actionPriorityKeys: string[];
  readingFocusKey: string;
  actionFocusKey: string;
  userState: MbtiUserStateViewModel | null;
  orchestration: MbtiOrchestrationViewModel | null;
  continuity: MbtiContinuityViewModel | null;
  readContract: MbtiReadContractViewModel | null;
  variantKeys: Record<string, string>;
  packId: string;
  engineVersion: string;
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
  personalization: MbtiResultPersonalizationViewModel | null;
};

export type MbtiSharePageViewModel = {
  card: MbtiPublicProjectionCardViewModel | null;
  shareId: string;
  shareUrl: string;
  attemptId: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  continuity: MbtiContinuityViewModel | null;
  readContract: MbtiReadContractViewModel | null;
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

function getNestedValue(
  value: Record<string, unknown> | null,
  path: readonly string[]
): unknown {
  let current: unknown = value;

  for (const segment of path) {
    const record = asRecord(current);
    if (!record || !Object.prototype.hasOwnProperty.call(record, segment)) {
      return undefined;
    }

    current = record[segment];
  }

  return current;
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

function normalizePersonalizationAxis(
  axisCode: string,
  rawAxis: unknown
): MbtiPersonalizationAxisViewModel | null {
  const axis = asRecord(rawAxis);
  if (!axis) {
    return null;
  }

  return {
    axis: normalizeText(axis.axis, axisCode).toUpperCase(),
    axisLabel: normalizeText(axis.axis_label, axis.axisLabel, axisCode),
    side: normalizeText(axis.side).toUpperCase(),
    sideLabel: normalizeText(axis.side_label, axis.sideLabel),
    percent: toRoundedPercent(axis.pct),
    delta:
      typeof axis.delta === "number" && Number.isFinite(axis.delta)
        ? Math.max(0, Math.round(axis.delta))
        : 0,
    state: normalizeText(axis.state),
    band: normalizeText(axis.band),
  };
}

function normalizeCloseCallAxis(
  axisCode: string,
  rawAxis: unknown
): MbtiCloseCallAxisViewModel | null {
  const base = normalizePersonalizationAxis(axisCode, rawAxis);
  const axis = asRecord(rawAxis);
  if (!base || !axis) {
    return null;
  }

  return {
    ...base,
    oppositeSide: normalizeText(axis.opposite_side).toUpperCase(),
    oppositeSideLabel: normalizeText(axis.opposite_side_label),
    boundary: axis.boundary === true,
  };
}

function normalizeSceneFingerprintEntry(
  sceneKey: string,
  rawEntry: unknown
): MbtiSceneFingerprintEntryViewModel | null {
  const entry = asRecord(rawEntry);
  if (!entry) {
    return null;
  }

  const scene = normalizeText(entry.scene, sceneKey).toLowerCase();
  const title = normalizeText(entry.title);
  const summary = normalizeText(entry.summary);
  const styleKey = normalizeText(entry.style_key);
  const styleKeys = normalizeStringArray(entry.style_keys);
  const chapterAnchor = normalizeText(entry.chapter_anchor);
  const primaryAxis = normalizePersonalizationAxis(`${scene}.primary`, entry.primary_axis);
  const supportAxis = normalizePersonalizationAxis(`${scene}.support`, entry.support_axis);
  const boundaryAxes = normalizeStringArray(entry.boundary_axes).map((axisCode) => axisCode.toUpperCase());

  if (!scene || (!title && !summary && !styleKey)) {
    return null;
  }

  return {
    scene,
    title,
    summary,
    styleKey,
    styleKeys,
    chapterAnchor,
    primaryAxis,
    supportAxis,
    boundaryAxes,
  };
}

function normalizePersonalization(
  rawPersonalization: unknown
): MbtiResultPersonalizationViewModel | null {
  const personalization = asRecord(rawPersonalization) as MbtiPersonalizationRaw | null;
  if (!personalization) {
    return null;
  }

  const axisVectorRecord = asRecord(personalization.axis_vector);
  const axisVector: Record<string, MbtiPersonalizationAxisViewModel> = {};

  for (const [axisCode, rawAxis] of Object.entries(axisVectorRecord ?? {})) {
    const normalized = normalizePersonalizationAxis(axisCode, rawAxis);
    if (!normalized) {
      continue;
    }

    axisVector[normalized.axis] = normalized;
  }

  const dominantAxes = Array.isArray(personalization.dominant_axes)
    ? personalization.dominant_axes
        .map((axis, index) => normalizePersonalizationAxis(String(index), axis))
        .filter((axis): axis is MbtiPersonalizationAxisViewModel => Boolean(axis))
    : [];
  const sceneFingerprint = Object.fromEntries(
    Object.entries(asRecord(personalization.scene_fingerprint) ?? {})
      .map(([sceneKey, rawEntry]) => [sceneKey, normalizeSceneFingerprintEntry(sceneKey, rawEntry)] as const)
      .filter((entry): entry is [string, MbtiSceneFingerprintEntryViewModel] => Boolean(entry[1]))
  );

  const variantKeys = Object.fromEntries(
    Object.entries(asRecord(personalization.variant_keys) ?? {}).map(([sectionKey, value]) => [
      sectionKey,
      normalizeText(value),
    ])
  );
  const contrastKeys = Object.fromEntries(
    Object.entries(asRecord(personalization.contrast_keys) ?? {}).map(([sectionKey, value]) => [
      sectionKey,
      normalizeText(value),
    ])
  );
  const axisBands = Object.fromEntries(
    Object.entries(asRecord(personalization.axis_bands) ?? {}).map(([axisCode, value]) => [
      axisCode.toUpperCase(),
      normalizeText(value),
    ])
  );
  const boundaryFlags = Object.fromEntries(
    Object.entries(asRecord(personalization.boundary_flags) ?? {}).map(([axisCode, value]) => [
      axisCode.toUpperCase(),
      value === true,
    ])
  );
  const closeCallAxes = Array.isArray(personalization.close_call_axes)
    ? personalization.close_call_axes
        .map((axis, index) => normalizeCloseCallAxis(String(index), axis))
        .filter((axis): axis is MbtiCloseCallAxisViewModel => Boolean(axis))
    : [];
  const userStateRecord = asRecord(personalization.user_state);
  const orchestrationRecord = asRecord(personalization.orchestration);
  const continuityRecord = asRecord(personalization.continuity);
  const readContractRecord = asRecord(personalization.read_contract_v1) as MbtiReadContractRaw | null;

  const hasContent =
    Object.keys(axisVector).length > 0 ||
    Object.keys(sceneFingerprint).length > 0 ||
    Object.keys(variantKeys).length > 0 ||
    normalizeText(personalization.type_code) !== "";

  if (!hasContent) {
    return null;
  }

  return {
    locale: normalizeText(personalization.locale),
    typeCode: normalizeText(personalization.type_code).toUpperCase(),
    identity: normalizeText(personalization.identity).toUpperCase(),
    explainabilitySummary: normalizeText(personalization.explainability_summary),
    closeCallAxes,
    neighborTypeKeys: normalizeStringArray(personalization.neighbor_type_keys),
    contrastKeys,
    confidenceOrStabilityKeys: normalizeStringArray(personalization.confidence_or_stability_keys),
    axisVector,
    axisBands,
    boundaryFlags,
    dominantAxes,
    sceneFingerprint,
    workStyleKeys: normalizeStringArray(personalization.work_style_keys),
    relationshipStyleKeys: normalizeStringArray(personalization.relationship_style_keys),
    decisionStyleKeys: normalizeStringArray(personalization.decision_style_keys),
    stressRecoveryKeys: normalizeStringArray(personalization.stress_recovery_keys),
    communicationStyleKeys: normalizeStringArray(personalization.communication_style_keys),
    workStyleSummary: normalizeText(personalization.work_style_summary),
    roleFitKeys: normalizeStringArray(personalization.role_fit_keys),
    collaborationFitKeys: normalizeStringArray(personalization.collaboration_fit_keys),
    workEnvPreferenceKeys: normalizeStringArray(personalization.work_env_preference_keys),
    careerNextStepKeys: normalizeStringArray(personalization.career_next_step_keys),
    actionPlanSummary: normalizeText(personalization.action_plan_summary),
    weeklyActionKeys: normalizeStringArray(personalization.weekly_action_keys),
    relationshipActionKeys: normalizeStringArray(personalization.relationship_action_keys),
    workExperimentKeys: normalizeStringArray(personalization.work_experiment_keys),
    watchoutKeys: normalizeStringArray(personalization.watchout_keys),
    orderedRecommendationKeys: normalizeStringArray(personalization.ordered_recommendation_keys),
    orderedActionKeys: normalizeStringArray(personalization.ordered_action_keys),
    recommendationPriorityKeys: normalizeStringArray(personalization.recommendation_priority_keys),
    actionPriorityKeys: normalizeStringArray(personalization.action_priority_keys),
    readingFocusKey: normalizeText(personalization.reading_focus_key),
    actionFocusKey: normalizeText(personalization.action_focus_key),
    userState: userStateRecord
      ? {
          isFirstView: userStateRecord.is_first_view === true,
          isRevisit: userStateRecord.is_revisit === true,
          hasUnlock: userStateRecord.has_unlock === true,
          hasFeedback: userStateRecord.has_feedback === true,
          hasShare: userStateRecord.has_share === true,
          hasActionEngagement: userStateRecord.has_action_engagement === true,
          feedbackSentiment: normalizeText(userStateRecord.feedback_sentiment),
          feedbackCoverage: normalizeText(userStateRecord.feedback_coverage),
          actionCompletionTendency: normalizeText(userStateRecord.action_completion_tendency),
          lastDeepReadSection: normalizeText(userStateRecord.last_deep_read_section),
          currentIntentCluster: normalizeText(userStateRecord.current_intent_cluster),
        }
      : null,
    orchestration: orchestrationRecord
      ? {
          orderedSectionKeys: normalizeStringArray(orchestrationRecord.ordered_section_keys),
          primaryFocusKey: normalizeText(orchestrationRecord.primary_focus_key),
          secondaryFocusKeys: normalizeStringArray(orchestrationRecord.secondary_focus_keys),
          ctaPriorityKeys: normalizeStringArray(orchestrationRecord.cta_priority_keys),
        }
      : null,
    continuity: continuityRecord
      ? {
          carryoverFocusKey: normalizeText(continuityRecord.carryover_focus_key),
          carryoverReason: normalizeText(continuityRecord.carryover_reason),
          recommendedResumeKeys: normalizeStringArray(continuityRecord.recommended_resume_keys),
          carryoverSceneKeys: normalizeStringArray(continuityRecord.carryover_scene_keys),
          carryoverActionKeys: normalizeStringArray(continuityRecord.carryover_action_keys),
          feedbackSentiment: normalizeText(
            continuityRecord.feedback_sentiment,
            userStateRecord?.feedback_sentiment
          ),
          feedbackCoverage: normalizeText(
            continuityRecord.feedback_coverage,
            userStateRecord?.feedback_coverage
          ),
          actionCompletionTendency: normalizeText(
            continuityRecord.action_completion_tendency,
            userStateRecord?.action_completion_tendency
          ),
          lastDeepReadSection: normalizeText(
            continuityRecord.last_deep_read_section,
            userStateRecord?.last_deep_read_section
          ),
          currentIntentCluster: normalizeText(
            continuityRecord.current_intent_cluster,
            userStateRecord?.current_intent_cluster
          ),
        }
      : null,
    readContract: normalizeReadContract(readContractRecord),
    variantKeys,
    packId: normalizeText(personalization.pack_id),
    engineVersion: normalizeText(personalization.engine_version),
  };
}

function normalizeReadContractGroup(
  rawGroup: unknown
): MbtiReadContractFieldGroupViewModel | null {
  const group = asRecord(rawGroup);
  if (!group) {
    return null;
  }

  const personalizationFields = normalizeStringArray(group.personalization_fields);
  const surfaceFields = normalizeStringArray(group.surface_fields);
  const sources = normalizeStringArray(group.sources);
  if (personalizationFields.length === 0 && surfaceFields.length === 0 && sources.length === 0) {
    return null;
  }

  return {
    personalizationFields,
    surfaceFields,
    sources,
  };
}

function normalizeReadContract(rawContract: MbtiReadContractRaw | null): MbtiReadContractViewModel | null {
  if (!rawContract) {
    return null;
  }

  const version = normalizeText(rawContract.version);
  const canonicalReadModel = normalizeReadContractGroup(rawContract.canonical_read_model);
  const overlayPatch = normalizeReadContractGroup(rawContract.overlay_patch);
  const cacheableFields = normalizeStringArray(rawContract.cacheable_fields);
  const nonCacheableFields = normalizeStringArray(rawContract.non_cacheable_fields);
  const telemetryParityFields = normalizeStringArray(rawContract.telemetry_parity_fields);

  if (
    !version &&
    !canonicalReadModel &&
    !overlayPatch &&
    cacheableFields.length === 0 &&
    nonCacheableFields.length === 0 &&
    telemetryParityFields.length === 0
  ) {
    return null;
  }

  return {
    version,
    canonicalReadModel,
    overlayPatch,
    cacheableFields,
    nonCacheableFields,
    telemetryParityFields,
  };
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
      variantKey: normalizeText(
        getNestedValue(section, ["_meta", "variant_key"]),
        getNestedValue(section, ["payload", "personalization", "variant_key"])
      ),
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
  const projectionMeta = asRecord(core.rawProjection?._meta);
  const reportPayload = asRecord(report.report);
  const reportMeta = asRecord(reportPayload?._meta);
  const normalizedPersonalization = normalizePersonalization(
    projectionMeta?.personalization ?? reportMeta?.personalization
  );
  const topLevelReadContract = normalizeReadContract(
    asRecord(report.mbti_read_contract_v1) as MbtiReadContractRaw | null
  );
  const personalization = normalizedPersonalization
    ? {
        ...normalizedPersonalization,
        readContract: normalizedPersonalization.readContract ?? topLevelReadContract,
      }
    : null;

  return {
    ...core,
    sections,
    hasProjection: hasProjectionCoreContent(core, sections),
    personalization,
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
  const continuityRecord = asRecord(rawShare?.mbti_continuity_v1);
  const shareProjectionMeta = asRecord(asRecord(rawShare?.mbti_public_projection_v1)?._meta);
  const sharePersonalizationRecord = asRecord(shareProjectionMeta?.personalization);
  const shareUserStateRecord = asRecord(sharePersonalizationRecord?.user_state);
  const shareReadContract =
    normalizeReadContract(asRecord(rawShare?.mbti_read_contract_v1) as MbtiReadContractRaw | null) ??
    normalizeReadContract(asRecord(sharePersonalizationRecord?.read_contract_v1) as MbtiReadContractRaw | null);

  return {
    card: normalizeMbtiPublicProjectionCard(rawShare?.mbti_public_projection_v1),
    shareId: normalizeText(rawShare?.share_id, rawShare?.id),
    shareUrl: normalizeText(rawShare?.share_url),
    attemptId: normalizeText(rawShare?.attempt_id),
    primaryCtaLabel: normalizeText(rawShare?.primary_cta_label),
    primaryCtaPath: normalizeText(rawShare?.primary_cta_path),
    continuity: continuityRecord
      ? {
          carryoverFocusKey: normalizeText(continuityRecord.carryover_focus_key),
          carryoverReason: normalizeText(continuityRecord.carryover_reason),
          recommendedResumeKeys: normalizeStringArray(continuityRecord.recommended_resume_keys),
          carryoverSceneKeys: normalizeStringArray(continuityRecord.carryover_scene_keys),
          carryoverActionKeys: normalizeStringArray(continuityRecord.carryover_action_keys),
          feedbackSentiment: normalizeText(
            continuityRecord.feedback_sentiment,
            shareUserStateRecord?.feedback_sentiment
          ),
          feedbackCoverage: normalizeText(
            continuityRecord.feedback_coverage,
            shareUserStateRecord?.feedback_coverage
          ),
          actionCompletionTendency: normalizeText(
            continuityRecord.action_completion_tendency,
            shareUserStateRecord?.action_completion_tendency
          ),
          lastDeepReadSection: normalizeText(
            continuityRecord.last_deep_read_section,
            shareUserStateRecord?.last_deep_read_section
          ),
          currentIntentCluster: normalizeText(
            continuityRecord.current_intent_cluster,
            shareUserStateRecord?.current_intent_cluster
          ),
        }
      : null,
    readContract: shareReadContract,
    compareEnabled: rawShare?.compare_enabled === true,
    compareCtaLabel: normalizeText(rawShare?.compare_cta_label),
  };
}
