import type {
  Big5PublicProjection,
  ComparativeRaw,
  ControlledNarrativeRaw,
  CulturalCalibrationRaw,
  EmbedSurfaceRaw,
  InsightGraphRaw,
  LandingSurfaceRaw,
  MbtiAdaptiveSelectionRaw,
  MbtiActionJourneyRaw,
  MbtiCrossAssessmentRaw,
  MbtiIntraTypeProfileRaw,
  MbtiLongitudinalMemoryRaw,
  MbtiReadContractRaw,
  MbtiPersonalizationRaw,
  MbtiPulseCheckRaw,
  MbtiPublicProjectionDimensionRaw,
  MbtiPublicProjectionV1Raw,
  MbtiWorkingLifeRaw,
  PartnerReadRaw,
  PublicSurfaceRaw,
  ReportResponse,
  SeoSurfaceRaw,
  ShareSummaryResponse,
  WidgetSurfaceRaw,
} from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";

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
  sectionSelectionKey: string;
  selectedBlocks: string[];
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

export type ControlledNarrativeViewModel = {
  version: string;
  narrativeContractVersion: string;
  runtimeContractVersion: string;
  runtimeMode: string;
  providerName: string;
  modelVersion: string;
  promptVersion: string;
  failOpenMode: string;
  narrativeFingerprint: string;
  narrativeIntro: string;
  narrativeSummary: string;
  sectionNarrativeKeys: string[];
  enabled: boolean;
  truthGuardFields: string[];
};

export type ComparativeReferenceViewModel = {
  key: string;
  label: string;
  summary: string;
};

export type ComparativeViewModel = {
  version: string;
  comparativeContractVersion: string;
  enabled: boolean;
  percentileMetricKey: string;
  percentileMetricLabel: string;
  percentileValue: number | null;
  cohortRelativePosition: ComparativeReferenceViewModel | null;
  sameTypeContrast: ComparativeReferenceViewModel | null;
  normingVersion: string;
  normingScope: string;
  normingSource: string;
  comparativeFingerprint: string;
  truthGuardFields: string[];
};

export type CulturalCalibrationSectionViewModel = {
  sectionKey: string;
  title: string;
  body: string;
};

export type CulturalCalibrationViewModel = {
  version: string;
  calibrationContractVersion: string;
  localeContext: string;
  culturalContext: string;
  calibratedSectionKeys: string[];
  calibrationFingerprint: string;
  calibrationPolicyVersion: string;
  calibrationSource: string;
  narrativeIntro: string;
  narrativeSummary: string;
  workingLifeSummary: string;
  enabled: boolean;
  sectionOverrides: Record<string, CulturalCalibrationSectionViewModel>;
  truthGuardFields: string[];
};

export type MbtiCrossAssessmentSectionEnhancementViewModel = {
  sectionKey: string;
  supportingScale: string;
  synthesisKey: string;
  title: string;
  body: string;
  influenceKeys: string[];
};

export type MbtiCrossAssessmentViewModel = {
  version: string;
  supportingScales: string[];
  supportingAttemptId: string;
  synthesisKeys: string[];
  big5InfluenceKeys: string[];
  mbtiAdjustedFocusKeys: string[];
  supportingTraits: string[];
  sectionEnhancements: Record<string, MbtiCrossAssessmentSectionEnhancementViewModel>;
};

export type MbtiWorkingLifeViewModel = {
  version: string;
  careerFocusKey: string;
  careerJourneyKeys: string[];
  roleFitKeys: string[];
  collaborationFitKeys: string[];
  workEnvPreferenceKeys: string[];
  careerNextStepKeys: string[];
  careerActionPriorityKeys: string[];
  careerReadingKeys: string[];
  supportingScales: string[];
  big5InfluenceKeys: string[];
  synthesisKeys: string[];
};

export type MbtiActionJourneyViewModel = {
  journeyContractVersion: string;
  journeyFingerprintVersion: string;
  journeyFingerprint: string;
  journeyScope: string;
  journeyState: string;
  progressState: string;
  actionFocusKey: string;
  completedActionKeys: string[];
  recommendedNextPulseKeys: string[];
  actionPriorityKeys: string[];
  carryoverActionKeys: string[];
  lastPulseSignal: string;
  revisitReorderReason: string;
};

export type MbtiPulseCheckViewModel = {
  pulseContractVersion: string;
  pulseState: string;
  pulsePromptKeys: string[];
  pulseFeedbackMode: string;
  nextPulseTarget: string;
};

export type MbtiIntraTypeProfileViewModel = {
  version: string;
  profileSeedKey: string;
  sameTypeDivergenceKeys: string[];
  sectionSelectionKeys: Record<string, string>;
  actionSelectionKeys: Record<string, string>;
  recommendationSelectionKeys: string[];
  selectionFingerprint: string;
  selectionEvidence: Record<string, unknown> | null;
  personaClusterKey: string;
};

export type MbtiLongitudinalMemoryViewModel = {
  version: string;
  memoryContractVersion: string;
  memoryFingerprint: string;
  memoryScope: string;
  memoryState: string;
  progressionState: string;
  sectionHistoryKeys: string[];
  behaviorDeltaKeys: string[];
  dominantInterestKeys: string[];
  resumeBiasKeys: string[];
  memoryRewriteKeys: string[];
  memoryRewriteReason: string;
  memoryConfidence: number | null;
  memoryWindow: {
    days: number | null;
    attemptCount: number | null;
    eventCount: number | null;
  } | null;
  memoryEvidence: Record<string, unknown> | null;
};

export type MbtiAdaptiveNextBestActionViewModel = {
  key: string;
  sectionKey: string;
  family: string;
  reason: string;
};

export type MbtiAdaptiveSelectionViewModel = {
  version: string;
  adaptiveContractVersion: string;
  adaptiveFingerprint: string;
  selectionRewriteReason: string;
  contentFeedbackWeights: Record<string, number>;
  actionEffectWeights: Record<string, number>;
  recommendationEffectWeights: Record<string, number>;
  ctaEffectWeights: Record<string, number>;
  nextBestAction: MbtiAdaptiveNextBestActionViewModel | null;
  adaptiveEvidence: Record<string, unknown> | null;
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
  comparative: ComparativeViewModel | null;
  controlledNarrative: ControlledNarrativeViewModel | null;
  culturalCalibration: CulturalCalibrationViewModel | null;
  crossAssessment: MbtiCrossAssessmentViewModel | null;
  workingLife: MbtiWorkingLifeViewModel | null;
  actionJourney: MbtiActionJourneyViewModel | null;
  pulseCheck: MbtiPulseCheckViewModel | null;
  intraTypeProfile: MbtiIntraTypeProfileViewModel | null;
  longitudinalMemory: MbtiLongitudinalMemoryViewModel | null;
  adaptiveSelection: MbtiAdaptiveSelectionViewModel | null;
  profileSeedKey: string;
  sameTypeDivergenceKeys: string[];
  sectionSelectionKeys: Record<string, string>;
  actionSelectionKeys: Record<string, string>;
  recommendationSelectionKeys: string[];
  selectionFingerprint: string;
  selectionEvidence: Record<string, unknown> | null;
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
  scaleCode: string;
  card: MbtiPublicProjectionCardViewModel | null;
  shareId: string;
  shareUrl: string;
  attemptId: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  continuity: MbtiContinuityViewModel | null;
  readContract: MbtiReadContractViewModel | null;
  publicSurface: PublicSurfaceViewModel | null;
  seoSurface: SeoSurfaceViewModel | null;
  landingSurface: LandingSurfaceViewModel | null;
  insightGraph: InsightGraphViewModel | null;
  embedSurface: EmbedSurfaceViewModel | null;
  widgetSurface: WidgetSurfaceViewModel | null;
  partnerRead: PartnerReadViewModel | null;
  comparative: ComparativeViewModel | null;
  controlledNarrative: ControlledNarrativeViewModel | null;
  culturalCalibration: CulturalCalibrationViewModel | null;
  workingLife: MbtiWorkingLifeViewModel | null;
  compareEnabled: boolean;
  compareCtaLabel: string;
};

export type PublicSurfaceViewModel = {
  version: string;
  entrySurface: string;
  publicSummaryFingerprint: string;
  discoverabilityKeys: string[];
  continueReadingKeys: string[];
  canonicalUrl: string;
  robotsPolicy: string;
  attributionScope: string;
};

export type InsightGraphNodeViewModel = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  sourceContract: string;
};

export type InsightGraphEdgeViewModel = {
  from: string;
  to: string;
  relation: string;
};

export type InsightGraphViewModel = {
  version: string;
  graphContractVersion: string;
  rootNode: string;
  nodes: InsightGraphNodeViewModel[];
  edges: InsightGraphEdgeViewModel[];
  graphFingerprint: string;
  graphScope: string;
  supportingScales: string[];
};

export type EmbedSurfaceViewModel = {
  version: string;
  surfaceKey: string;
  graphScope: string;
  entrySurface: string;
  title: string;
  summary: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  continueTarget: string;
  allowedNodeIds: string[];
  embedFingerprint: string;
  renderMode: string;
};

export type WidgetSurfaceViewModel = {
  version: string;
  widgetScope: string;
  widgetContractVersion: string;
  surfaceKey: string;
  hostMode: string;
  slotKey: string;
  sizePreset: string;
  entrySurface: string;
  title: string;
  summary: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  continueTarget: string;
  allowedNodeIds: string[];
  allowedEdgeTypes: string[];
  graphFingerprint: string;
  embedFingerprint: string;
  attributionScope: string;
};

export type PartnerReadViewModel = {
  version: string;
  graphScope: string;
  graphContractVersion: string;
  graphFingerprint: string;
  supportingScales: string[];
  allowedNodeIds: string[];
  allowedEdgeTypes: string[];
  readScope: string;
  subjectScope: string;
  attributionScope: string;
};

type ProjectionCoreViewModel = Omit<MbtiResultProjectionViewModel, "sections" | "hasProjection" | "personalization">;

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
  const comparativeRecord = asRecord(personalization.comparative_v1) as ComparativeRaw | null;
  const controlledNarrativeRecord = asRecord(personalization.controlled_narrative_v1) as ControlledNarrativeRaw | null;
  const culturalCalibrationRecord = asRecord(personalization.cultural_calibration_v1) as CulturalCalibrationRaw | null;
  const crossAssessmentRecord = asRecord(personalization.cross_assessment_v1) as MbtiCrossAssessmentRaw | null;
  const workingLifeRecord = asRecord(personalization.working_life_v1) as MbtiWorkingLifeRaw | null;
  const actionJourneyRecord = asRecord(personalization.action_journey_v1) as MbtiActionJourneyRaw | null;
  const pulseCheckRecord = asRecord(personalization.pulse_check_v1) as MbtiPulseCheckRaw | null;
  const intraTypeProfileRecord = asRecord(personalization.intra_type_profile_v1) as MbtiIntraTypeProfileRaw | null;
  const longitudinalMemoryRecord = asRecord(personalization.longitudinal_memory_v1) as MbtiLongitudinalMemoryRaw | null;
  const adaptiveSelectionRecord = asRecord(personalization.adaptive_selection_v1) as MbtiAdaptiveSelectionRaw | null;

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
    comparative: normalizeComparative(comparativeRecord),
    controlledNarrative: normalizeControlledNarrative(controlledNarrativeRecord),
    culturalCalibration: normalizeCulturalCalibration(culturalCalibrationRecord),
    crossAssessment: normalizeCrossAssessment(crossAssessmentRecord),
    workingLife: normalizeWorkingLife(workingLifeRecord),
    actionJourney: normalizeActionJourney(actionJourneyRecord),
    pulseCheck: normalizePulseCheck(pulseCheckRecord),
    intraTypeProfile: normalizeIntraTypeProfile(intraTypeProfileRecord),
    longitudinalMemory: normalizeLongitudinalMemory(longitudinalMemoryRecord),
    adaptiveSelection: normalizeAdaptiveSelection(adaptiveSelectionRecord),
    profileSeedKey: normalizeText(personalization.profile_seed_key),
    sameTypeDivergenceKeys: normalizeStringArray(personalization.same_type_divergence_keys),
    sectionSelectionKeys: Object.fromEntries(
      Object.entries(asRecord(personalization.section_selection_keys) ?? {}).map(([sectionKey, value]) => [
        sectionKey,
        normalizeText(value),
      ])
    ),
    actionSelectionKeys: Object.fromEntries(
      Object.entries(asRecord(personalization.action_selection_keys) ?? {}).map(([sectionKey, value]) => [
        sectionKey,
        normalizeText(value),
      ])
    ),
    recommendationSelectionKeys: normalizeStringArray(personalization.recommendation_selection_keys),
    selectionFingerprint: normalizeText(personalization.selection_fingerprint),
    selectionEvidence: asRecord(personalization.selection_evidence),
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

function normalizeIntraTypeProfile(
  rawProfile: MbtiIntraTypeProfileRaw | null
): MbtiIntraTypeProfileViewModel | null {
  if (!rawProfile) {
    return null;
  }

  const version = normalizeText(rawProfile.version);
  const profileSeedKey = normalizeText(rawProfile.profile_seed_key);
  const sameTypeDivergenceKeys = normalizeStringArray(rawProfile.same_type_divergence_keys);
  const sectionSelectionKeys = Object.fromEntries(
    Object.entries(asRecord(rawProfile.section_selection_keys) ?? {}).map(([sectionKey, value]) => [
      sectionKey,
      normalizeText(value),
    ])
  );
  const actionSelectionKeys = Object.fromEntries(
    Object.entries(asRecord(rawProfile.action_selection_keys) ?? {}).map(([sectionKey, value]) => [
      sectionKey,
      normalizeText(value),
    ])
  );
  const recommendationSelectionKeys = normalizeStringArray(rawProfile.recommendation_selection_keys);
  const selectionFingerprint = normalizeText(rawProfile.selection_fingerprint);
  const selectionEvidence = asRecord(rawProfile.selection_evidence);

  if (
    !version &&
    !profileSeedKey &&
    sameTypeDivergenceKeys.length === 0 &&
    Object.keys(sectionSelectionKeys).length === 0 &&
    Object.keys(actionSelectionKeys).length === 0 &&
    recommendationSelectionKeys.length === 0 &&
    !selectionFingerprint
  ) {
    return null;
  }

  return {
    version,
    profileSeedKey,
    sameTypeDivergenceKeys,
    sectionSelectionKeys,
    actionSelectionKeys,
    recommendationSelectionKeys,
    selectionFingerprint,
    selectionEvidence,
    personaClusterKey: normalizeText(rawProfile.persona_cluster_key, profileSeedKey),
  };
}

function normalizeLongitudinalMemory(
  rawMemory: MbtiLongitudinalMemoryRaw | null
): MbtiLongitudinalMemoryViewModel | null {
  if (!rawMemory) {
    return null;
  }

  const version = normalizeText(rawMemory.version, rawMemory.memory_contract_version);
  const memoryContractVersion = normalizeText(rawMemory.memory_contract_version, rawMemory.version);
  const memoryFingerprint = normalizeText(rawMemory.memory_fingerprint);
  const memoryScope = normalizeText(rawMemory.memory_scope);
  const memoryState = normalizeText(rawMemory.memory_state);
  const progressionState = normalizeText(rawMemory.progression_state);
  const sectionHistoryKeys = normalizeStringArray(rawMemory.section_history_keys);
  const behaviorDeltaKeys = normalizeStringArray(rawMemory.behavior_delta_keys);
  const dominantInterestKeys = normalizeStringArray(rawMemory.dominant_interest_keys);
  const resumeBiasKeys = normalizeStringArray(rawMemory.resume_bias_keys);
  const memoryRewriteKeys = normalizeStringArray(rawMemory.memory_rewrite_keys);
  const memoryRewriteReason = normalizeText(rawMemory.memory_rewrite_reason);
  const memoryConfidence =
    typeof rawMemory.memory_confidence === "number" ? rawMemory.memory_confidence : null;
  const memoryWindowRecord = asRecord(rawMemory.memory_window);
  const memoryWindow = memoryWindowRecord
    ? {
        days: typeof memoryWindowRecord.days === "number" ? memoryWindowRecord.days : null,
        attemptCount:
          typeof memoryWindowRecord.attempt_count === "number"
            ? memoryWindowRecord.attempt_count
            : null,
        eventCount:
          typeof memoryWindowRecord.event_count === "number" ? memoryWindowRecord.event_count : null,
      }
    : null;
  const memoryEvidence = asRecord(rawMemory.memory_evidence);

  if (
    !version &&
    !memoryContractVersion &&
    !memoryFingerprint &&
    !memoryScope &&
    !memoryState &&
    !progressionState &&
    sectionHistoryKeys.length === 0 &&
    behaviorDeltaKeys.length === 0 &&
    dominantInterestKeys.length === 0 &&
    resumeBiasKeys.length === 0 &&
    memoryRewriteKeys.length === 0 &&
    !memoryRewriteReason &&
    memoryConfidence === null &&
    !memoryWindow &&
    !memoryEvidence
  ) {
    return null;
  }

  return {
    version,
    memoryContractVersion,
    memoryFingerprint,
    memoryScope,
    memoryState,
    progressionState,
    sectionHistoryKeys,
    behaviorDeltaKeys,
    dominantInterestKeys,
    resumeBiasKeys,
    memoryRewriteKeys,
    memoryRewriteReason,
    memoryConfidence,
    memoryWindow,
    memoryEvidence,
  };
}

function normalizeNumericMap(rawMap: unknown): Record<string, number> {
  return Object.fromEntries(
    Object.entries(asRecord(rawMap) ?? {})
      .map(([key, value]) => {
        const normalizedKey = normalizeText(key);
        const normalizedValue =
          typeof value === "number" && Number.isFinite(value) ? value : Number.NaN;

        if (!normalizedKey || Number.isNaN(normalizedValue)) {
          return null;
        }

        return [normalizedKey, normalizedValue] as const;
      })
      .filter((entry): entry is readonly [string, number] => Boolean(entry))
  );
}

function normalizeAdaptiveSelection(
  rawAdaptive: MbtiAdaptiveSelectionRaw | null
): MbtiAdaptiveSelectionViewModel | null {
  if (!rawAdaptive) {
    return null;
  }

  const version = normalizeText(rawAdaptive.version);
  const adaptiveContractVersion = normalizeText(rawAdaptive.adaptive_contract_version, version);
  const adaptiveFingerprint = normalizeText(rawAdaptive.adaptive_fingerprint);
  const selectionRewriteReason = normalizeText(rawAdaptive.selection_rewrite_reason);
  const contentFeedbackWeights = normalizeNumericMap(rawAdaptive.content_feedback_weights);
  const actionEffectWeights = normalizeNumericMap(rawAdaptive.action_effect_weights);
  const recommendationEffectWeights = normalizeNumericMap(rawAdaptive.recommendation_effect_weights);
  const ctaEffectWeights = normalizeNumericMap(rawAdaptive.cta_effect_weights);
  const nextBestActionRecord = asRecord(rawAdaptive.next_best_action_v1);
  const nextBestAction =
    nextBestActionRecord &&
    (
      normalizeText(nextBestActionRecord.key) ||
      normalizeText(nextBestActionRecord.section_key) ||
      normalizeText(nextBestActionRecord.family) ||
      normalizeText(nextBestActionRecord.reason)
    )
      ? {
          key: normalizeText(nextBestActionRecord.key),
          sectionKey: normalizeText(nextBestActionRecord.section_key),
          family: normalizeText(nextBestActionRecord.family),
          reason: normalizeText(nextBestActionRecord.reason),
        }
      : null;
  const adaptiveEvidence = asRecord(rawAdaptive.adaptive_evidence);

  if (
    !version &&
    !adaptiveContractVersion &&
    !adaptiveFingerprint &&
    !selectionRewriteReason &&
    Object.keys(contentFeedbackWeights).length === 0 &&
    Object.keys(actionEffectWeights).length === 0 &&
    Object.keys(recommendationEffectWeights).length === 0 &&
    Object.keys(ctaEffectWeights).length === 0 &&
    !nextBestAction &&
    !adaptiveEvidence
  ) {
    return null;
  }

  return {
    version,
    adaptiveContractVersion,
    adaptiveFingerprint,
    selectionRewriteReason,
    contentFeedbackWeights,
    actionEffectWeights,
    recommendationEffectWeights,
    ctaEffectWeights,
    nextBestAction,
    adaptiveEvidence,
  };
}

function normalizeControlledNarrative(
  rawNarrative: ControlledNarrativeRaw | null
): ControlledNarrativeViewModel | null {
  if (!rawNarrative) {
    return null;
  }

  const version = normalizeText(rawNarrative.version);
  const narrativeIntro = normalizeText(rawNarrative.narrative_intro);
  const narrativeSummary = normalizeText(rawNarrative.narrative_summary);
  const sectionNarrativeKeys = normalizeStringArray(rawNarrative.section_narrative_keys);
  const runtimeMode = normalizeText(rawNarrative.runtime_mode);
  const enabled =
    rawNarrative.enabled === true ||
    narrativeIntro.length > 0 ||
    narrativeSummary.length > 0 ||
    sectionNarrativeKeys.length > 0;

  if (!enabled && !version && !runtimeMode) {
    return null;
  }

  return {
    version,
    narrativeContractVersion: normalizeText(rawNarrative.narrative_contract_version, version),
    runtimeContractVersion: normalizeText(rawNarrative.runtime_contract_version),
    runtimeMode,
    providerName: normalizeText(rawNarrative.provider_name),
    modelVersion: normalizeText(rawNarrative.model_version),
    promptVersion: normalizeText(rawNarrative.prompt_version),
    failOpenMode: normalizeText(rawNarrative.fail_open_mode),
    narrativeFingerprint: normalizeText(rawNarrative.narrative_fingerprint),
    narrativeIntro,
    narrativeSummary,
    sectionNarrativeKeys,
    enabled,
    truthGuardFields: normalizeStringArray(rawNarrative.truth_guard_fields),
  };
}

function normalizeComparative(rawComparative: ComparativeRaw | null): ComparativeViewModel | null {
  if (!rawComparative) {
    return null;
  }

  const percentile = asRecord(rawComparative.percentile);
  const cohort = asRecord(rawComparative.cohort_relative_position);
  const sameTypeContrast = asRecord(rawComparative.same_type_contrast);
  const version = normalizeText(rawComparative.version);
  const comparativeContractVersion = normalizeText(rawComparative.comparative_contract_version, version);
  const percentileMetricKey = normalizeText(percentile?.metric_key);
  const percentileMetricLabel = normalizeText(percentile?.metric_label, percentileMetricKey);
  const percentileValue =
    typeof percentile?.value === "number" && Number.isFinite(percentile.value)
      ? percentile.value
      : null;
  const enabled =
    rawComparative.enabled === true ||
    percentileValue !== null ||
    normalizeText(rawComparative.norming_version).length > 0 ||
    normalizeText(rawComparative.comparative_fingerprint).length > 0;

  if (
    !enabled &&
    !version &&
    !comparativeContractVersion &&
    !normalizeText(rawComparative.norming_scope) &&
    !normalizeText(rawComparative.norming_source)
  ) {
    return null;
  }

  const normalizeReference = (value: Record<string, unknown> | null): ComparativeReferenceViewModel | null => {
    if (!value) {
      return null;
    }

    const key = normalizeText(value.key);
    const label = normalizeText(value.label);
    const summary = normalizeText(value.summary);
    if (!key && !label && !summary) {
      return null;
    }

    return { key, label, summary };
  };

  return {
    version,
    comparativeContractVersion,
    enabled,
    percentileMetricKey,
    percentileMetricLabel,
    percentileValue,
    cohortRelativePosition: normalizeReference(cohort),
    sameTypeContrast: normalizeReference(sameTypeContrast),
    normingVersion: normalizeText(rawComparative.norming_version),
    normingScope: normalizeText(rawComparative.norming_scope),
    normingSource: normalizeText(rawComparative.norming_source),
    comparativeFingerprint: normalizeText(rawComparative.comparative_fingerprint),
    truthGuardFields: normalizeStringArray(rawComparative.truth_guard_fields),
  };
}

function normalizePublicSurface(rawPublicSurface: PublicSurfaceRaw | null): PublicSurfaceViewModel | null {
  if (!rawPublicSurface) {
    return null;
  }

  const version = normalizeText(rawPublicSurface.version);
  const entrySurface = normalizeText(rawPublicSurface.entry_surface);
  const publicSummaryFingerprint = normalizeText(rawPublicSurface.public_summary_fingerprint);
  const discoverabilityKeys = normalizeStringArray(rawPublicSurface.discoverability_keys);
  const continueReadingKeys = normalizeStringArray(rawPublicSurface.continue_reading_keys);
  const canonicalUrl = normalizeText(rawPublicSurface.canonical_url);
  const robotsPolicy = normalizeText(rawPublicSurface.robots_policy);
  const attributionScope = normalizeText(rawPublicSurface.attribution_scope);

  if (
    !version &&
    !entrySurface &&
    !publicSummaryFingerprint &&
    discoverabilityKeys.length === 0 &&
    continueReadingKeys.length === 0 &&
    !canonicalUrl &&
    !robotsPolicy &&
    !attributionScope
  ) {
    return null;
  }

  return {
    version,
    entrySurface,
    publicSummaryFingerprint,
    discoverabilityKeys,
    continueReadingKeys,
    canonicalUrl,
    robotsPolicy,
    attributionScope,
  };
}

function normalizeInsightGraph(rawGraph: InsightGraphRaw | null): InsightGraphViewModel | null {
  if (!rawGraph) {
    return null;
  }

  const version = normalizeText(rawGraph.version);
  const graphContractVersion = normalizeText(rawGraph.graph_contract_version, version);
  const rootNode = normalizeText(rawGraph.root_node);
  const nodes = (Array.isArray(rawGraph.nodes) ? rawGraph.nodes : [])
    .map((node) => {
      const record = asRecord(node);
      const id = normalizeText(record?.id);
      const kind = normalizeText(record?.kind);
      const title = normalizeText(record?.title);
      const summary = normalizeText(record?.summary);
      if (!id && !kind && !title && !summary) {
        return null;
      }

      return {
        id,
        kind,
        title,
        summary,
        sourceContract: normalizeText(record?.source_contract),
      };
    })
    .filter((value): value is InsightGraphNodeViewModel => Boolean(value));
  const edges = (Array.isArray(rawGraph.edges) ? rawGraph.edges : [])
    .map((edge) => {
      const record = asRecord(edge);
      const from = normalizeText(record?.from);
      const to = normalizeText(record?.to);
      const relation = normalizeText(record?.relation);
      if (!from && !to && !relation) {
        return null;
      }

      return { from, to, relation };
    })
    .filter((value): value is InsightGraphEdgeViewModel => Boolean(value));
  const graphFingerprint = normalizeText(rawGraph.graph_fingerprint);
  const graphScope = normalizeText(rawGraph.graph_scope);
  const supportingScales = normalizeStringArray(rawGraph.supporting_scales);

  if (
    !version &&
    !graphContractVersion &&
    !rootNode &&
    nodes.length === 0 &&
    edges.length === 0 &&
    !graphFingerprint &&
    !graphScope &&
    supportingScales.length === 0
  ) {
    return null;
  }

  return {
    version,
    graphContractVersion,
    rootNode,
    nodes,
    edges,
    graphFingerprint,
    graphScope,
    supportingScales,
  };
}

function normalizeEmbedSurface(rawEmbedSurface: EmbedSurfaceRaw | null): EmbedSurfaceViewModel | null {
  if (!rawEmbedSurface) {
    return null;
  }

  const version = normalizeText(rawEmbedSurface.version);
  const surfaceKey = normalizeText(rawEmbedSurface.surface_key);
  const graphScope = normalizeText(rawEmbedSurface.graph_scope);
  const entrySurface = normalizeText(rawEmbedSurface.entry_surface);
  const title = normalizeText(rawEmbedSurface.title);
  const summary = normalizeText(rawEmbedSurface.summary);
  const primaryCtaLabel = normalizeText(rawEmbedSurface.primary_cta_label);
  const primaryCtaPath = normalizeText(rawEmbedSurface.primary_cta_path);
  const continueTarget = normalizeText(rawEmbedSurface.continue_target);
  const allowedNodeIds = normalizeStringArray(rawEmbedSurface.allowed_node_ids);
  const embedFingerprint = normalizeText(rawEmbedSurface.embed_fingerprint);
  const renderMode = normalizeText(rawEmbedSurface.render_mode);

  if (
    !version &&
    !surfaceKey &&
    !graphScope &&
    !entrySurface &&
    !title &&
    !summary &&
    !primaryCtaLabel &&
    !primaryCtaPath &&
    !continueTarget &&
    allowedNodeIds.length === 0 &&
    !embedFingerprint &&
    !renderMode
  ) {
    return null;
  }

  return {
    version,
    surfaceKey,
    graphScope,
    entrySurface,
    title,
    summary,
    primaryCtaLabel,
    primaryCtaPath,
    continueTarget,
    allowedNodeIds,
    embedFingerprint,
    renderMode,
  };
}

function normalizePartnerRead(rawPartnerRead: PartnerReadRaw | null): PartnerReadViewModel | null {
  if (!rawPartnerRead) {
    return null;
  }

  const version = normalizeText(rawPartnerRead.version);
  const graphScope = normalizeText(rawPartnerRead.graph_scope);
  const graphContractVersion = normalizeText(rawPartnerRead.graph_contract_version);
  const graphFingerprint = normalizeText(rawPartnerRead.graph_fingerprint);
  const supportingScales = normalizeStringArray(rawPartnerRead.supporting_scales);
  const allowedNodeIds = normalizeStringArray(rawPartnerRead.allowed_node_ids);
  const allowedEdgeTypes = normalizeStringArray(rawPartnerRead.allowed_edge_types);
  const readScope = normalizeText(rawPartnerRead.read_scope);
  const subjectScope = normalizeText(rawPartnerRead.subject_scope);
  const attributionScope = normalizeText(rawPartnerRead.attribution_scope);

  if (
    !version &&
    !graphScope &&
    !graphContractVersion &&
    !graphFingerprint &&
    supportingScales.length === 0 &&
    allowedNodeIds.length === 0 &&
    allowedEdgeTypes.length === 0 &&
    !readScope &&
    !subjectScope &&
    !attributionScope
  ) {
    return null;
  }

  return {
    version,
    graphScope,
    graphContractVersion,
    graphFingerprint,
    supportingScales,
    allowedNodeIds,
    allowedEdgeTypes,
    readScope,
    subjectScope,
    attributionScope,
  };
}

function normalizeWidgetSurface(rawWidgetSurface: WidgetSurfaceRaw | null): WidgetSurfaceViewModel | null {
  if (!rawWidgetSurface) {
    return null;
  }

  const version = normalizeText(rawWidgetSurface.version);
  const widgetScope = normalizeText(rawWidgetSurface.widget_scope);
  const widgetContractVersion = normalizeText(rawWidgetSurface.widget_contract_version);
  const surfaceKey = normalizeText(rawWidgetSurface.surface_key);
  const hostMode = normalizeText(rawWidgetSurface.host_mode);
  const slotKey = normalizeText(rawWidgetSurface.slot_key);
  const sizePreset = normalizeText(rawWidgetSurface.size_preset);
  const entrySurface = normalizeText(rawWidgetSurface.entry_surface);
  const title = normalizeText(rawWidgetSurface.title);
  const summary = normalizeText(rawWidgetSurface.summary);
  const primaryCtaLabel = normalizeText(rawWidgetSurface.primary_cta_label);
  const primaryCtaPath = normalizeText(rawWidgetSurface.primary_cta_path);
  const continueTarget = normalizeText(rawWidgetSurface.continue_target);
  const allowedNodeIds = normalizeStringArray(rawWidgetSurface.allowed_node_ids);
  const allowedEdgeTypes = normalizeStringArray(rawWidgetSurface.allowed_edge_types);
  const graphFingerprint = normalizeText(rawWidgetSurface.graph_fingerprint);
  const embedFingerprint = normalizeText(rawWidgetSurface.embed_fingerprint);
  const attributionScope = normalizeText(rawWidgetSurface.attribution_scope);

  if (
    !version &&
    !widgetScope &&
    !widgetContractVersion &&
    !surfaceKey &&
    !hostMode &&
    !slotKey &&
    !sizePreset &&
    !entrySurface &&
    !title &&
    !summary &&
    !primaryCtaLabel &&
    !primaryCtaPath &&
    !continueTarget &&
    allowedNodeIds.length === 0 &&
    allowedEdgeTypes.length === 0 &&
    !graphFingerprint &&
    !embedFingerprint &&
    !attributionScope
  ) {
    return null;
  }

  return {
    version,
    widgetScope,
    widgetContractVersion,
    surfaceKey,
    hostMode,
    slotKey,
    sizePreset,
    entrySurface,
    title,
    summary,
    primaryCtaLabel,
    primaryCtaPath,
    continueTarget,
    allowedNodeIds,
    allowedEdgeTypes,
    graphFingerprint,
    embedFingerprint,
    attributionScope,
  };
}

function normalizeShareCard(rawShare?: ShareSummaryResponse | null): MbtiPublicProjectionCardViewModel | null {
  const mbtiCard = normalizeMbtiPublicProjectionCard(rawShare?.mbti_public_projection_v1);
  if (mbtiCard) {
    return mbtiCard;
  }

  const big5Projection = asRecord(rawShare?.big5_public_projection_v1) as Big5PublicProjection | null;
  const big5TraitVector = Array.isArray(big5Projection?.trait_vector) ? big5Projection.trait_vector : [];
  const dimensions = (
    Array.isArray(rawShare?.dimensions) && rawShare?.dimensions.length > 0
      ? rawShare?.dimensions
      : big5TraitVector
  )
    .map((rawDimension) => {
      const dimension = asRecord(rawDimension);
      if (!dimension) {
        return null;
      }

      return {
        code: normalizeText(dimension.code, dimension.key),
        label: normalizeText(dimension.label, dimension.key),
        percent: toRoundedPercent(dimension.pct ?? dimension.percentile ?? dimension.percent),
        side: normalizeText(dimension.side, dimension.key),
        sideLabel: normalizeText(dimension.side_label, dimension.sideLabel, dimension.label),
        state: normalizeText(dimension.state, dimension.band_label, dimension.winnerLabel),
        summary: normalizeText(dimension.summary, dimension.band_label, dimension.winnerLabel),
      };
    })
    .filter((dimension): dimension is MbtiPublicProjectionDimensionViewModel => Boolean(dimension));

  const publicTags = Array.from(
    new Set([
      ...normalizeStringArray(rawShare?.public_tags),
      ...normalizeStringArray(rawShare?.publicTags),
      ...normalizeStringArray(rawShare?.tags).filter(
        (tag) => !TECHNICAL_TAG_PREFIXES.some((prefix) => tag.toLowerCase().startsWith(prefix))
      ),
    ])
  );

  const title = normalizeText(rawShare?.title, rawShare?.type_name, rawShare?.type_code);
  const subtitle = normalizeText(rawShare?.subtitle, rawShare?.tagline);
  const summary = normalizeText(rawShare?.summary, rawShare?.tagline);
  const typeName = normalizeText(rawShare?.type_name, rawShare?.title);
  const displayType = normalizeText(rawShare?.type_code, rawShare?.scale_code);

  if (!title && !summary && !typeName && dimensions.length === 0) {
    return null;
  }

  return {
    canonicalTypeCode: displayType,
    displayType,
    variantCode: "",
    typeName,
    title,
    subtitle,
    summary,
    tagline: normalizeText(rawShare?.tagline, rawShare?.subtitle),
    rarity: resolveRarity(rawShare?.rarity),
    publicTags,
    dimensions,
  };
}

function normalizeCulturalCalibration(
  rawCalibration: CulturalCalibrationRaw | null
): CulturalCalibrationViewModel | null {
  if (!rawCalibration) {
    return null;
  }

  const sectionOverrides = Object.fromEntries(
    Object.entries(asRecord(rawCalibration.section_overrides) ?? {})
      .map(([sectionKey, rawOverride]) => {
        const override = asRecord(rawOverride);
        if (!override) {
          return null;
        }

        const normalized = {
          sectionKey: normalizeText(override.section_key, sectionKey),
          title: normalizeText(override.title),
          body: normalizeText(override.body),
        };

        if (!normalized.sectionKey || (!normalized.title && !normalized.body)) {
          return null;
        }

        return [normalized.sectionKey, normalized] as const;
      })
      .filter((entry): entry is [string, CulturalCalibrationSectionViewModel] => Boolean(entry))
  );

  const version = normalizeText(rawCalibration.version);
  const calibrationContractVersion = normalizeText(
    rawCalibration.calibration_contract_version,
    version
  );
  const localeContext = normalizeText(rawCalibration.locale_context);
  const culturalContext = normalizeText(rawCalibration.cultural_context);
  const calibratedSectionKeys = normalizeStringArray(rawCalibration.calibrated_section_keys);
  const calibrationFingerprint = normalizeText(rawCalibration.calibration_fingerprint);
  const narrativeRecord = asRecord(rawCalibration.narrative_overrides);
  const narrativeIntro = normalizeText(narrativeRecord?.intro);
  const narrativeSummary = normalizeText(narrativeRecord?.summary);
  const workingLifeSummary = normalizeText(rawCalibration.working_life_summary);
  const enabled =
    rawCalibration.enabled === true ||
    calibratedSectionKeys.length > 0 ||
    Object.keys(sectionOverrides).length > 0 ||
    narrativeIntro.length > 0 ||
    narrativeSummary.length > 0 ||
    workingLifeSummary.length > 0;

  if (
    !enabled &&
    !version &&
    !calibrationContractVersion &&
    !localeContext &&
    !culturalContext &&
    !calibrationFingerprint
  ) {
    return null;
  }

  return {
    version,
    calibrationContractVersion,
    localeContext,
    culturalContext,
    calibratedSectionKeys,
    calibrationFingerprint,
    calibrationPolicyVersion: normalizeText(rawCalibration.calibration_policy_version),
    calibrationSource: normalizeText(rawCalibration.calibration_source),
    narrativeIntro,
    narrativeSummary,
    workingLifeSummary,
    enabled,
    sectionOverrides,
    truthGuardFields: normalizeStringArray(rawCalibration.truth_guard_fields),
  };
}

function normalizeCrossAssessment(
  rawCrossAssessment: MbtiCrossAssessmentRaw | null
): MbtiCrossAssessmentViewModel | null {
  if (!rawCrossAssessment) {
    return null;
  }

  const sectionEnhancements = Object.fromEntries(
    Object.entries(asRecord(rawCrossAssessment.section_enhancements) ?? {})
      .map(([sectionKey, rawEnhancement]) => {
        const enhancement = asRecord(rawEnhancement);
        if (!enhancement) {
          return null;
        }

        const normalized = {
          sectionKey: normalizeText(enhancement.section_key, sectionKey),
          supportingScale: normalizeText(enhancement.supporting_scale),
          synthesisKey: normalizeText(enhancement.synthesis_key),
          title: normalizeText(enhancement.title),
          body: normalizeText(enhancement.body),
          influenceKeys: normalizeStringArray(enhancement.influence_keys),
        };

        if (!normalized.sectionKey || !normalized.synthesisKey) {
          return null;
        }

        return [normalized.sectionKey, normalized] as const;
      })
      .filter((entry): entry is [string, MbtiCrossAssessmentSectionEnhancementViewModel] => Boolean(entry))
  );

  const version = normalizeText(rawCrossAssessment.version);
  const supportingScales = normalizeStringArray(rawCrossAssessment.supporting_scales);
  const supportingAttemptId = normalizeText(rawCrossAssessment.supporting_attempt_id);
  const synthesisKeys = normalizeStringArray(rawCrossAssessment.synthesis_keys);
  const big5InfluenceKeys = normalizeStringArray(rawCrossAssessment.big5_influence_keys);
  const mbtiAdjustedFocusKeys = normalizeStringArray(rawCrossAssessment.mbti_adjusted_focus_keys);
  const supportingTraits = normalizeStringArray(rawCrossAssessment.supporting_traits);

  if (
    !version &&
    supportingScales.length === 0 &&
    synthesisKeys.length === 0 &&
    big5InfluenceKeys.length === 0 &&
    mbtiAdjustedFocusKeys.length === 0 &&
    supportingTraits.length === 0 &&
    Object.keys(sectionEnhancements).length === 0
  ) {
    return null;
  }

  return {
    version,
    supportingScales,
    supportingAttemptId,
    synthesisKeys,
    big5InfluenceKeys,
    mbtiAdjustedFocusKeys,
    supportingTraits,
    sectionEnhancements,
  };
}

function normalizeWorkingLife(
  rawWorkingLife: MbtiWorkingLifeRaw | null
): MbtiWorkingLifeViewModel | null {
  if (!rawWorkingLife) {
    return null;
  }

  const version = normalizeText(rawWorkingLife.version);
  const careerFocusKey = normalizeText(rawWorkingLife.career_focus_key);
  const careerJourneyKeys = normalizeStringArray(rawWorkingLife.career_journey_keys);
  const roleFitKeys = normalizeStringArray(rawWorkingLife.role_fit_keys);
  const collaborationFitKeys = normalizeStringArray(rawWorkingLife.collaboration_fit_keys);
  const workEnvPreferenceKeys = normalizeStringArray(rawWorkingLife.work_env_preference_keys);
  const careerNextStepKeys = normalizeStringArray(rawWorkingLife.career_next_step_keys);
  const careerActionPriorityKeys = normalizeStringArray(rawWorkingLife.career_action_priority_keys);
  const careerReadingKeys = normalizeStringArray(rawWorkingLife.career_reading_keys);
  const supportingScales = normalizeStringArray(rawWorkingLife.supporting_scales);
  const big5InfluenceKeys = normalizeStringArray(rawWorkingLife.big5_influence_keys);
  const synthesisKeys = normalizeStringArray(rawWorkingLife.synthesis_keys);

  if (
    !version &&
    !careerFocusKey &&
    careerJourneyKeys.length === 0 &&
    careerActionPriorityKeys.length === 0 &&
    careerReadingKeys.length === 0 &&
    synthesisKeys.length === 0
  ) {
    return null;
  }

  return {
    version,
    careerFocusKey,
    careerJourneyKeys,
    roleFitKeys,
    collaborationFitKeys,
    workEnvPreferenceKeys,
    careerNextStepKeys,
    careerActionPriorityKeys,
    careerReadingKeys,
    supportingScales,
    big5InfluenceKeys,
    synthesisKeys,
  };
}

function normalizeActionJourney(
  rawJourney: MbtiActionJourneyRaw | null
): MbtiActionJourneyViewModel | null {
  if (!rawJourney) {
    return null;
  }

  const journeyContractVersion = normalizeText(rawJourney.journey_contract_version);
  const journeyFingerprint = normalizeText(rawJourney.journey_fingerprint);
  const journeyState = normalizeText(rawJourney.journey_state);
  const progressState = normalizeText(rawJourney.progress_state);

  if (!journeyContractVersion && !journeyFingerprint && !journeyState && !progressState) {
    return null;
  }

  return {
    journeyContractVersion,
    journeyFingerprintVersion: normalizeText(rawJourney.journey_fingerprint_version),
    journeyFingerprint,
    journeyScope: normalizeText(rawJourney.journey_scope),
    journeyState,
    progressState,
    actionFocusKey: normalizeText(rawJourney.action_focus_key),
    completedActionKeys: normalizeStringArray(rawJourney.completed_action_keys),
    recommendedNextPulseKeys: normalizeStringArray(rawJourney.recommended_next_pulse_keys),
    actionPriorityKeys: normalizeStringArray(rawJourney.action_priority_keys),
    carryoverActionKeys: normalizeStringArray(rawJourney.carryover_action_keys),
    lastPulseSignal: normalizeText(rawJourney.last_pulse_signal),
    revisitReorderReason: normalizeText(rawJourney.revisit_reorder_reason),
  };
}

function normalizePulseCheck(
  rawPulseCheck: MbtiPulseCheckRaw | null
): MbtiPulseCheckViewModel | null {
  if (!rawPulseCheck) {
    return null;
  }

  const pulseContractVersion = normalizeText(rawPulseCheck.pulse_contract_version);
  const pulseState = normalizeText(rawPulseCheck.pulse_state);

  if (!pulseContractVersion && !pulseState) {
    return null;
  }

  return {
    pulseContractVersion,
    pulseState,
    pulsePromptKeys: normalizeStringArray(rawPulseCheck.pulse_prompt_keys),
    pulseFeedbackMode: normalizeText(rawPulseCheck.pulse_feedback_mode),
    nextPulseTarget: normalizeText(rawPulseCheck.next_pulse_target),
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
      sectionSelectionKey: normalizeText(
        getNestedValue(section, ["payload", "personalization", "section_selection_key"])
      ),
      selectedBlocks: normalizeStringArray(
        getNestedValue(section, ["payload", "personalization", "selected_blocks"])
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
  const topLevelComparative = normalizeComparative(
    asRecord(report.comparative_v1) as ComparativeRaw | null
  );
  const topLevelControlledNarrative = normalizeControlledNarrative(
    asRecord(report.controlled_narrative_v1) as ControlledNarrativeRaw | null
  );
  const topLevelCulturalCalibration = normalizeCulturalCalibration(
    asRecord(report.cultural_calibration_v1) as CulturalCalibrationRaw | null
  );
  const personalization = normalizedPersonalization
    ? {
        ...normalizedPersonalization,
        readContract: normalizedPersonalization.readContract ?? topLevelReadContract,
        comparative: normalizedPersonalization.comparative ?? topLevelComparative,
        controlledNarrative: normalizedPersonalization.controlledNarrative ?? topLevelControlledNarrative,
        culturalCalibration:
          normalizedPersonalization.culturalCalibration ?? topLevelCulturalCalibration,
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
  const shareScaleCode = normalizeText(rawShare?.scale_code).toUpperCase();
  const continuityRecord = asRecord(rawShare?.mbti_continuity_v1);
  const shareProjectionMeta = asRecord(asRecord(rawShare?.mbti_public_projection_v1)?._meta);
  const sharePersonalizationRecord = asRecord(shareProjectionMeta?.personalization);
  const shareUserStateRecord = asRecord(sharePersonalizationRecord?.user_state);
  const shareBig5Projection = asRecord(rawShare?.big5_public_projection_v1) as Big5PublicProjection | null;
  const shareReadContract =
    normalizeReadContract(asRecord(rawShare?.mbti_read_contract_v1) as MbtiReadContractRaw | null) ??
    normalizeReadContract(asRecord(sharePersonalizationRecord?.read_contract_v1) as MbtiReadContractRaw | null);
  const sharePublicSurface = normalizePublicSurface(asRecord(rawShare?.public_surface_v1) as PublicSurfaceRaw | null);
  const shareSeoSurface = normalizeSeoSurface(asRecord(rawShare?.seo_surface_v1) as SeoSurfaceRaw | null);
  const shareLandingSurface = normalizeLandingSurface(asRecord(rawShare?.landing_surface_v1) as LandingSurfaceRaw | null);
  const shareInsightGraph = normalizeInsightGraph(asRecord(rawShare?.insight_graph_v1) as InsightGraphRaw | null);
  const shareEmbedSurface = normalizeEmbedSurface(asRecord(rawShare?.embed_surface_v1) as EmbedSurfaceRaw | null);
  const shareWidgetSurface = normalizeWidgetSurface(asRecord(rawShare?.widget_surface_v1) as WidgetSurfaceRaw | null);
  const sharePartnerRead = normalizePartnerRead(asRecord(rawShare?.partner_read_v1) as PartnerReadRaw | null);
  const shareComparative =
    normalizeComparative(asRecord(rawShare?.comparative_v1) as ComparativeRaw | null) ??
    normalizeComparative(asRecord(sharePersonalizationRecord?.comparative_v1) as ComparativeRaw | null) ??
    normalizeComparative(asRecord(shareBig5Projection?.comparative_v1) as ComparativeRaw | null);
  const shareControlledNarrative =
    normalizeControlledNarrative(asRecord(rawShare?.controlled_narrative_v1) as ControlledNarrativeRaw | null) ??
    normalizeControlledNarrative(asRecord(sharePersonalizationRecord?.controlled_narrative_v1) as ControlledNarrativeRaw | null) ??
    normalizeControlledNarrative(asRecord(shareBig5Projection?.controlled_narrative_v1) as ControlledNarrativeRaw | null);
  const shareCulturalCalibration =
    normalizeCulturalCalibration(asRecord(rawShare?.cultural_calibration_v1) as CulturalCalibrationRaw | null) ??
    normalizeCulturalCalibration(asRecord(sharePersonalizationRecord?.cultural_calibration_v1) as CulturalCalibrationRaw | null) ??
    normalizeCulturalCalibration(asRecord(shareBig5Projection?.cultural_calibration_v1) as CulturalCalibrationRaw | null);
  const shareWorkingLife =
    normalizeWorkingLife(asRecord(rawShare?.working_life_v1) as MbtiWorkingLifeRaw | null) ??
    normalizeWorkingLife(asRecord(sharePersonalizationRecord?.working_life_v1) as MbtiWorkingLifeRaw | null);

  return {
    scaleCode: shareScaleCode,
    card: normalizeShareCard(rawShare),
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
    publicSurface: sharePublicSurface,
    seoSurface: shareSeoSurface,
    landingSurface: shareLandingSurface,
    insightGraph: shareInsightGraph,
    embedSurface: shareEmbedSurface,
    widgetSurface: shareWidgetSurface,
    partnerRead: sharePartnerRead,
    comparative: shareComparative,
    controlledNarrative: shareControlledNarrative,
    culturalCalibration: shareCulturalCalibration,
    workingLife: shareWorkingLife,
    compareEnabled: shareScaleCode === "MBTI" && rawShare?.compare_enabled === true,
    compareCtaLabel: normalizeText(rawShare?.compare_cta_label),
  };
}
