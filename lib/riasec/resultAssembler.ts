import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";

export type RiasecDimension = {
  code: string;
  label: string;
  score: number;
};

export type RiasecQualityDisplay = {
  schemaVersion: string;
  locale: string;
  headline: string;
  reasons: string[];
  improvements: string[];
  readingBoundary: string;
};

export type RiasecResultSummary = {
  schemaVersion: string;
  locale: string;
  estimatedReadSeconds: number;
  snapshotBound: boolean;
  snapshotScope: "persisted_result" | "report_snapshot";
  headline: string;
  rankingDisplay: string;
  tieNote: string;
  qualitySummary: string;
  highlights: Array<{
    dimensionCode: string;
    label: string;
    text: string;
  }>;
  nextStep: string;
  boundary: string;
};

export type RiasecTrustedResultCard = {
  schemaVersion: string;
  projectionVersion: string;
  scoreSpaceVersion: string;
  qualityRuleStatus: string;
  qualityState: string;
  lowQualityStrength: string;
  snapshotBound: boolean;
  crossFormComparable: boolean;
  rawScoreDeltaAllowed: boolean;
  occupationExamplesPolicy: string;
  validationStatus: string;
};

export type RiasecInterpretationState = {
  interpretationRuleVersion: string;
  profileShape: string;
  profileShapeVersion: string;
  clarityLabel: string;
  nearTieState: {
    state: string;
    dimensions: string[];
  };
  alternateCode: {
    show: boolean;
    codes: string[];
    displayBoundary: string;
  };
  alternateCodeReason: string | null;
  tieDisplay: {
    schemaVersion: string;
    kind: "none" | "exact_tie" | "near_tie";
    position: string;
    dimensions: string[];
    groups: string[][];
    orderedCode: string;
    alternateCodes: string[];
    orderingPrecisionClaimAllowed: false;
    headline: string;
    note: string;
    boundary: string;
  } | null;
  topCodeConfidence: {
    level: string;
    meaning: string;
  };
  readingStrength: string;
  resultPageStrategy: {
    primaryReadingMode: string;
  };
  moduleVisibilityPolicyId: string;
  validationStatus: string;
  fieldAuthority: Record<string, string>;
};

export type RiasecModuleVisibility = "visible" | "collapsed" | "hidden";

export type RiasecModuleVisibilityPolicy = {
  schemaVersion: string;
  policyId: string;
  qualityState: string;
  profileShape: string;
  formCode: string;
  modules: Array<{
    key: string;
    visibility: RiasecModuleVisibility;
    reason: string;
  }>;
  fallbackPolicy: {
    unknownModule: string;
    missingBackendState: string;
    frontendInferenceAllowed: boolean;
  };
};

export type RiasecDeepContentSlotVisibility = "visible" | "collapsed";

export type RiasecDeepContentSlot = {
  slotKey: string;
  slotGroup: string;
  slotId: string;
  moduleKey: string;
  slotVisibility: RiasecDeepContentSlotVisibility;
  status: string;
  contentStatus: string;
  contentVersion: string;
  reviewStatus: string;
  sourceStatus: string;
  evidenceLevel: string;
  locale: string;
  frontendFallbackAllowed: false;
  fallbackBehavior: string;
  selection: {
    schemaVersion: string;
    dimensionCode: string;
    rank: number;
    isTopThree: boolean;
    scoreBand: "high" | "medium" | "low";
    selectedDetailKey: "high_score_reading" | "medium_score_reading" | "low_score_safe_reading";
  } | null;
  applicability: {
    formCodes: string[];
    profileShapes: string[];
    qualityStates: string[];
    codes: string[];
    dimensions: string[];
  };
  state: Record<string, string>;
  content: Record<string, string | string[]>;
  boundaries: {
    userVisibleBoundary: string;
    requiredBoundaries: string[];
    forbiddenClaims: string[];
  };
};

export type RiasecDeepContentSlotsEnvelope = {
  schemaVersion: string;
  scaleCode: string;
  locale: string;
  contentAuthority: string;
  snapshotBound: boolean;
  sourcePolicy: {
    frontendFallbackAllowed: boolean;
    missingContentBehavior: string;
    pendingContentBehavior: string;
    unknownSlotBehavior: string;
    formalReportGeneration: string;
  };
  slotVisibilityPolicy: {
    moduleVisibilityPolicyId: string;
    hiddenSlotsOmitted: boolean;
    pendingOrUnavailableSlotsOmitted: boolean;
    frontendInferenceAllowed: boolean;
  };
  slots: RiasecDeepContentSlot[];
};

export type RiasecActivityExplorerOccupationExample = {
  occupationExample: string;
  sourceStatus: string;
  displayLabel: string;
  commonTasks: string[];
  skillsToCheck: string[];
  educationBoundary: string;
  skillBoundary: string;
  qualificationBoundary: string;
  localizationNote: string;
  notARecommendation: boolean;
};

export type RiasecActivityExplorerActivity = {
  activityKey: string;
  activityLabel: string;
  activityUserCopy: string;
  riasecDimensions: string[];
  taskExamples: string[];
  occupationExamples: RiasecActivityExplorerOccupationExample[];
  sourceStatus: string;
};

export type RiasecActivityExplorer = {
  schemaVersion: string;
  contentVersion: string;
  status: string;
  sourceStatus: string;
  sourceName: string;
  occupationExamplesPolicy: string;
  registrySourceConnected: boolean;
  fitScoreAllowed: boolean;
  successPredictionAllowed: boolean;
  dimensionActivityFamilies: Array<{
    dimension: string;
    label: string;
    coreDrive: string;
    activityFamilies: string[];
    sourceStatus: string;
  }>;
  codeActivityPack: {
    status: string;
    activities: RiasecActivityExplorerActivity[];
  };
};

export type RiasecFeedbackOverlay = {
  schemaVersion: string;
  status: string;
  feedbackStreamStatus: string;
  snapshotBound: boolean;
  snapshotIdentity: {
    snapshotRequired: boolean;
    snapshotBound: boolean;
    identityScope: string;
    formCode: string;
    scoreSpaceVersion: string;
    measuredHollandCode: string;
  };
  measuredResultGuard: {
    scoresMutationAllowed: boolean;
    hollandCodeMutationAllowed: boolean;
    reportSnapshotMutationAllowed: boolean;
    measurementEvidenceMutationAllowed: boolean;
  };
  surfacePolicy: {
    publicProjectionAllowed: boolean;
    sharePdfExposureAllowed: boolean;
    rawFeedbackPublicExposureAllowed: boolean;
    formalReportMutationAllowed: boolean;
  };
  readModel: {
    hasFeedback: boolean;
    feedbackCount: number;
    latestFeedbackAt: string | null;
    summaryStatus: string;
    rawFeedbackIncluded: boolean;
  };
  claimBoundary: {
    feedbackIsMeasurement: boolean;
    feedbackChangesScores: boolean;
    feedbackChangesMeasuredHollandCode: boolean;
    feedbackIsCareerMatch: boolean;
    feedbackIsSuccessPrediction: boolean;
  };
  actionLab: RiasecFeedbackActionLabBoundary | null;
  nextExplorationNodes: RiasecNextExplorationNodesBoundary | null;
};

export type RiasecFeedbackActionLabBoundary = {
  schemaVersion: string;
  status: string;
  availability: string;
  frontendRendererRequiredForVisibleModule: boolean;
  publicRawFeedbackAllowed: false;
  affectsMeasuredCode: false;
  affectsScore: false;
  affectsSnapshot: false;
  sharePdfHistoryMeasuredPayloadMutationAllowed: false;
  starterActionCount: number;
};

export type RiasecNextExplorationNodesBoundary = {
  schemaVersion: string;
  status: string;
  selectionMode: string;
  frontendRendererRequiredForVisibleModule: boolean;
  publicRawFeedbackAllowed: false;
  affectsMeasuredCode: false;
  affectsScore: false;
  affectsSnapshot: false;
  createsCareerMatch: false;
  sharePdfHistoryMeasuredPayloadMutationAllowed: false;
  nodeCount: number;
};

export type RiasecLifecycleCopySurface = {
  surface: string;
  copy: string;
  publicSafe: boolean;
  rawScoresAllowed: false;
  rawFeedbackAllowed: false;
};

export type RiasecLifecycleCopyFaqItem = {
  q: string;
  a: string;
};

export type RiasecLifecycleCopy = {
  schemaVersion: string;
  contentAuthority: string;
  status: string;
  snapshotBound: boolean;
  sharePdfHistoryAssetId: string;
  faqAssetId: string;
  technicalNoteSummaryAssetId: string;
  professionalMethodBoundaryAssetId: string;
  faqMarkdownReferenceAvailable: boolean;
  publicSafeDefaultSurfaceKeys: string[];
  frontendFallbackAllowed: false;
  missingContentBehavior: string;
  measuredPayloadMutationAllowed: false;
  reportSnapshotMutationAllowed: false;
  rawFeedbackPublicExposureAllowed: false;
  internalSnapshotIdPublicExposureAllowed: false;
  lifeStagePublicExposureAllowed: false;
  organizationContextPublicExposureAllowed: false;
  surfaces: RiasecLifecycleCopySurface[];
  faqItems: RiasecLifecycleCopyFaqItem[];
};

export type RiasecResultViewModel = {
  authority: RiasecPrivateResultAuthorityView | null;
  topCode: string;
  formCode: string | null;
  formKind: string | null;
  formLabel: string | null;
  questionCount: number | null;
  estimatedMinutes: number | null;
  primaryType: string;
  secondaryType: string;
  tertiaryType: string;
  clarityIndex: number;
  breadthIndex: number;
  qualityGrade: string;
  qualityFlags: string[];
  qualityDisplay: RiasecQualityDisplay | null;
  resultSummary: RiasecResultSummary | null;
  dimensions: RiasecDimension[];
  trustedResultCard: RiasecTrustedResultCard | null;
  interpretationState: RiasecInterpretationState | null;
  moduleVisibilityPolicy: RiasecModuleVisibilityPolicy | null;
  deepContentSlots: RiasecDeepContentSlotsEnvelope | null;
  activityExplorer: RiasecActivityExplorer | null;
  feedbackOverlay: RiasecFeedbackOverlay | null;
  lifecycleCopy: RiasecLifecycleCopy | null;
  enhancedBreakdown: {
    activity: Record<string, number>;
    environment: Record<string, number>;
    role: Record<string, number>;
  };
};

export type RiasecPrivateResultAuthorityView = {
  mode: "canonical" | "immutable_legacy_snapshot";
  sourceHash: string;
  compiledHash: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => normalizeText(item)).filter(Boolean) : [];
}

function normalizeRiasecContentLocale(value: unknown): Locale | null {
  const locale = normalizeText(value).toLowerCase();

  if (locale === "en" || locale === "en-us" || locale === "en-gb") {
    return "en";
  }
  if (locale === "zh" || locale === "zh-cn" || locale === "zh-hans") {
    return "zh";
  }

  return null;
}

function buildQualityDisplay(
  raw: Record<string, unknown> | null,
  requestedPageLocale: Locale,
  qualityState: string,
  qualityGrade: string
): RiasecQualityDisplay | null {
  if (!raw || normalizeText(raw.schema_version) !== "riasec.quality_display.v1") {
    return null;
  }

  const expectedLocale = requestedPageLocale === "zh" ? "zh-CN" : "en";
  if (normalizeText(raw.locale) !== expectedLocale) {
    return null;
  }

  const headline = normalizeText(raw.headline);
  const readingBoundary = normalizeText(raw.reading_boundary);
  const reasons = normalizeStringList(raw.reasons);
  const improvements = normalizeStringList(raw.improvements);
  if (!headline || !readingBoundary) {
    return null;
  }
  const isDegraded = qualityState !== "normal" || qualityGrade !== "A";
  if (isDegraded && (reasons.length === 0 || improvements.length === 0)) {
    return null;
  }

  return {
    schemaVersion: "riasec.quality_display.v1",
    locale: expectedLocale,
    headline,
    reasons,
    improvements,
    readingBoundary,
  };
}

function buildResultSummary(
  raw: Record<string, unknown> | null,
  requestedPageLocale: Locale
): RiasecResultSummary | null {
  if (!raw || normalizeText(raw.schema_version) !== "riasec.result_summary.v1") return null;

  const expectedLocale = requestedPageLocale === "zh" ? "zh-CN" : "en";
  const estimatedReadSeconds = Number(raw.estimated_read_seconds);
  const rawHighlights = Array.isArray(raw.highlights) ? raw.highlights : [];
  const highlights = rawHighlights.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      dimensionCode: normalizeText(row.dimension_code),
      label: normalizeText(row.label),
      text: normalizeText(row.text),
    };
  });
  const headline = normalizeText(raw.headline);
  const rankingDisplay = normalizeText(raw.ranking_display);
  const qualitySummary = normalizeText(raw.quality_summary);
  const nextStep = normalizeText(raw.next_step);
  const boundary = normalizeText(raw.boundary);
  const snapshotScope = normalizeText(raw.snapshot_scope);
  const validHighlights =
    highlights.length === 3 &&
    highlights.every((item) => /^[RIASEC]$/.test(item.dimensionCode) && item.label && item.text) &&
    new Set(highlights.map((item) => item.dimensionCode)).size === highlights.length;

  if (
    normalizeText(raw.locale) !== expectedLocale ||
    !Number.isInteger(estimatedReadSeconds) ||
    estimatedReadSeconds < 1 ||
    estimatedReadSeconds > 180 ||
    raw.snapshot_bound !== true ||
    !["persisted_result", "report_snapshot"].includes(snapshotScope) ||
    !headline ||
    !rankingDisplay ||
    !qualitySummary ||
    !nextStep ||
    !boundary ||
    !validHighlights
  ) {
    return null;
  }

  const visibleText = [
    headline,
    rankingDisplay,
    normalizeText(raw.tie_note),
    qualitySummary,
    ...highlights.flatMap((item) => [item.label, item.text]),
    nextStep,
    boundary,
  ].join(requestedPageLocale === "zh" ? "" : " ");
  const lengthWithinLimit = requestedPageLocale === "zh"
    ? Array.from(visibleText).length <= 900
    : visibleText.split(/\s+/).filter(Boolean).length <= 500;
  if (!lengthWithinLimit) return null;

  return {
    schemaVersion: "riasec.result_summary.v1",
    locale: expectedLocale,
    estimatedReadSeconds,
    snapshotBound: raw.snapshot_bound,
    snapshotScope: snapshotScope as "persisted_result" | "report_snapshot",
    headline,
    rankingDisplay,
    tieNote: normalizeText(raw.tie_note),
    qualitySummary,
    highlights,
    nextStep,
    boundary,
  };
}

function isRiasecFormCode(value: string): value is "riasec_60" | "riasec_140" {
  return value === "riasec_60" || value === "riasec_140";
}

function is60QIneligibleSlot(slotKey: string, slotGroup: string): boolean {
  return (
    slotGroup === "structural_difference_copy" ||
    [
      "140q_task_card_copy",
      "140q_environment_card_copy",
      "140q_role_card_copy",
      "140q_layer_agreement_copy",
      "140q_tension_copy",
      "140q_layer_unavailable_copy",
    ].includes(slotKey)
  );
}

function hasReaderVisibleHanText(
  content: Record<string, string | string[]>,
  userVisibleBoundary: unknown
): boolean {
  return [
    ...Object.values(content).flatMap((value) => Array.isArray(value) ? value : [value]),
    normalizeText(userVisibleBoundary),
  ].some((value) => /\p{Script=Han}/u.test(value));
}

function isSafeRiasecSurfaceVariant(surface: string, publicSafe: unknown): boolean {
  const expectedPublicSafe = RIASEC_SAFE_SURFACE_VARIANTS.get(surface);

  return expectedPublicSafe !== undefined && publicSafe === expectedPublicSafe;
}

const KNOWN_RIASEC_MODULE_KEYS = new Set([
  "hero_activity_chain",
  "six_dimension_map",
  "pair_blend",
  "activity_explorer",
  "occupation_examples",
  "140q_cta",
  "140q_context_cards",
  "share_card",
  "pdf",
  "history",
  "feedback_overlay",
]);

const RIASEC_MODULE_VISIBILITIES = new Set<RiasecModuleVisibility>(["visible", "collapsed", "hidden"]);
const RIASEC_DEEP_CONTENT_SLOT_VISIBILITIES = new Set<RiasecDeepContentSlotVisibility>(["visible", "collapsed"]);
const RIASEC_DEEP_CONTENT_STATUSES = new Set(["authored"]);
const KNOWN_RIASEC_DEEP_SLOT_GROUPS = new Set([
  "dimension_deep_copy",
  "pair_blend_copy",
  "140q_layer_copy",
  "quality_copy",
  "structural_difference_copy",
  "aspirations_copy",
  "feedback_response_copy",
]);
const KNOWN_RIASEC_DEEP_SLOT_KEYS = new Set([
  "dimension_deep_copy",
  "pair_blend_copy",
  "140q_task_card_copy",
  "140q_environment_card_copy",
  "140q_role_card_copy",
  "140q_layer_agreement_copy",
  "140q_tension_copy",
  "140q_layer_unavailable_copy",
  "140q_cta_copy",
  "140q_not_recommended_copy",
  "low_quality_copy",
  "cautious_reading_copy",
  "structural_difference_copy",
  "aspirations_calibration_copy",
  "disagree_path_copy",
]);
const KNOWN_RIASEC_DEEP_CONTENT_KEYS = new Set([
  "title",
  "summary",
  "body",
  "core_drive",
  "positive_value",
  "real_world_cost",
  "high_score_reading",
  "medium_score_reading",
  "low_score_safe_reading",
  "work_activity_examples",
  "possible_drains",
  "common_misread",
  "action_advice",
  "pair_label",
  "short_label",
  "chemistry",
  "activities_to_validate",
  "question",
  "what_user_sees",
  "button_label",
]);

const RIASEC_SAFE_SURFACE_VARIANTS = new Map<string, boolean>([
  ["share_safe_card", true],
  ["share_detail_boundary", true],
  ["low_quality_share", true],
  ["pdf_personal", false],
  ["pdf_counselor_discussion", false],
  ["history_same_form", false],
  ["history_cross_form", false],
]);

type RiasecProjectionContainer =
  | Pick<ReportResponse, "riasec_public_projection_v1" | "riasec_public_projection_v2" | "riasec_private_result_authority" | "report">
  | Pick<ResultResponse, "riasec_public_projection_v1" | "riasec_public_projection_v2" | "riasec_private_result_authority">;

type RiasecDeepContentProjectionContext = {
  requestedPageLocale: Locale;
  formCode: "riasec_60" | "riasec_140" | null;
};

export function hasRiasecProjection(reportData: RiasecProjectionContainer | null | undefined): boolean {
  const projectionV2 = asRecord(reportData?.riasec_public_projection_v2);
  if (
    !projectionV2 ||
    normalizeText(projectionV2?.schema_version) !== "riasec.public_projection.v2" ||
    normalizeText(projectionV2?.scale_code) !== "RIASEC"
  ) {
    return false;
  }

  const locale = normalizeText(projectionV2.locale);
  if (locale === "zh-CN" && resolveRiasecPrivateResultAuthority(reportData)?.mode !== "canonical") {
    return false;
  }
  if (locale !== "zh-CN" && locale !== "en") {
    return false;
  }

  const hollandCode = asRecord(projectionV2.holland_code);
  const code = normalizeText(hollandCode?.code);
  const form = asRecord(projectionV2.form);
  const dimensions = Array.isArray(asRecord(projectionV2.scores)?.dimensions)
    ? (asRecord(projectionV2.scores)?.dimensions as unknown[])
    : [];
  const dimensionCodes = dimensions.map((item) => normalizeText(asRecord(item)?.code));
  const quality = asRecord(projectionV2.quality);
  const interpretation = asRecord(projectionV2.interpretation_state);
  const modulePolicy = asRecord(projectionV2.module_visibility_policy);
  const moduleFallback = asRecord(modulePolicy?.fallback_policy);
  const deepContent = asRecord(projectionV2.deep_content_slots_v1);
  const deepSourcePolicy = asRecord(deepContent?.source_policy);
  const lifecycle = asRecord(projectionV2.lifecycle_copy_v1);
  const activityExplorer = asRecord(projectionV2.activity_explorer_v0_1);

  return /^[RIASEC]{3}$/.test(code) && new Set(code).size === 3
    && Boolean(normalizeText(hollandCode?.primary_type))
    && Boolean(normalizeText(hollandCode?.secondary_type))
    && Boolean(normalizeText(hollandCode?.tertiary_type))
    && isRiasecFormCode(normalizeText(form?.form_code))
    && dimensions.length === 6
    && dimensionCodes.every((dimensionCode) => /^[RIASEC]$/.test(dimensionCode))
    && new Set(dimensionCodes).size === 6
    && dimensions.every((item) => Number.isFinite(Number(asRecord(item)?.score)))
    && dimensions.every((item) => Boolean(normalizeText(asRecord(item)?.label)))
    && Boolean(normalizeText(quality?.quality_state))
    && Boolean(interpretation)
    && normalizeText(modulePolicy?.schema_version) === "riasec.module_visibility_policy.v1"
    && moduleFallback?.frontend_inference_allowed === false
    && normalizeText(deepContent?.schema_version) === "riasec.deep_content_slots.v1"
    && deepSourcePolicy?.frontend_fallback_allowed === false
    && normalizeText(lifecycle?.schema_version) === "riasec.lifecycle_copy.v1"
    && lifecycle?.frontend_fallback_allowed === false
    && normalizeText(activityExplorer?.schema_version) === "riasec.activity_explorer.v0.1";
}

export function parseRiasecPrivateResultAuthority(value: unknown): RiasecPrivateResultAuthorityView | null {
  const raw = asRecord(value);
  if (!raw || normalizeText(raw.schema_version) !== "fap.riasec.private_result_authority.v1") {
    return null;
  }

  const mode = normalizeText(raw.mode);
  if (mode === "immutable_legacy_snapshot") {
    return normalizeText(raw.authority_id) === ""
      && normalizeText(raw.source_hash) === ""
      && normalizeText(raw.compiled_hash) === ""
      ? { mode, sourceHash: "", compiledHash: "" }
      : null;
  }
  if (
    mode !== "canonical" ||
    normalizeText(raw.authority_id) !== "FERMATMIND_RIASEC_PRIVATE_RESULT_ZH_CN_CANONICAL" ||
    normalizeText(raw.locale) !== "zh-CN" ||
    normalizeText(raw.compiled_schema) !== "fap.riasec.private_result.compiled.v1" ||
    normalizeText(raw.compiler_schema) !== "fap.riasec.private_result.compiler.v1" ||
    normalizeText(raw.compiler_version) !== "1.0.0" ||
    normalizeText(raw.runtime_contract) !== "riasec.report.v1"
  ) {
    return null;
  }

  const sourceHash = normalizeText(raw.source_hash).toLowerCase();
  const compiledHash = normalizeText(raw.compiled_hash).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(sourceHash) || !/^[0-9a-f]{64}$/.test(compiledHash)) {
    return null;
  }

  return { mode, sourceHash, compiledHash };
}

export function resolveRiasecPrivateResultAuthority(
  reportData: RiasecProjectionContainer | null | undefined
): RiasecPrivateResultAuthorityView | null {
  if (!reportData) return null;

  const projectionV2 = asRecord(reportData.riasec_public_projection_v2);
  const projectionAuthority = parseRiasecPrivateResultAuthority(projectionV2?.private_result_authority);
  const reportMeta = asRecord(asRecord((reportData as { report?: unknown }).report)?._meta);
  const externalAuthority = parseRiasecPrivateResultAuthority(
    (reportData as { riasec_private_result_authority?: unknown }).riasec_private_result_authority
      ?? reportMeta?.riasec_private_result_authority
  );

  if (
    externalAuthority?.mode === "immutable_legacy_snapshot" &&
    !asRecord(projectionV2?.private_result_authority)
  ) {
    return externalAuthority;
  }
  if (projectionAuthority?.mode !== "canonical" || externalAuthority?.mode !== "canonical") {
    return null;
  }
  if (
    projectionAuthority.sourceHash !== externalAuthority.sourceHash ||
    projectionAuthority.compiledHash !== externalAuthority.compiledHash
  ) {
    return null;
  }

  return projectionAuthority;
}

export function assembleRiasecResultViewModel(
  reportData: RiasecProjectionContainer,
  requestedPageLocale: Locale
): RiasecResultViewModel {
  const projectionV2 = asRecord(reportData.riasec_public_projection_v2);
  const projection = asRecord(reportData.riasec_public_projection_v1) ?? {};
  const form = asRecord((reportData as { riasec_form_v1?: unknown }).riasec_form_v1);
  const scores = asRecord(projection.scores_0_100) ?? {};
  const labels = asRecord(projection.dimension_labels) ?? {};
  const enhanced = asRecord(projection.enhanced_breakdown) ?? {};
  const v2HollandCode = asRecord(projectionV2?.holland_code);
  const v2Form = asRecord(projectionV2?.form);
  const v2MeasurementEvidence = asRecord(projectionV2?.measurement_evidence);
  const v2Quality = asRecord(projectionV2?.quality);
  const v2QualityDisplay = asRecord(v2Quality?.display_v1);
  const v2ContentBoundary = asRecord(projectionV2?.content_boundary);
  const v2Scores = asRecord(projectionV2?.scores);
  const v2ActivityExplorer = asRecord(projectionV2?.activity_explorer_v0_1);
  const v2FeedbackOverlay = asRecord(projectionV2?.exploration_feedback_overlay_v0_1);
  const v2LifecycleCopy = asRecord(projectionV2?.lifecycle_copy_v1);
  const v2InterpretationState = asRecord(projectionV2?.interpretation_state);
  const v2ModuleVisibilityPolicy = asRecord(projectionV2?.module_visibility_policy);
  const v2DeepContentSlots = asRecord(projectionV2?.deep_content_slots_v1);
  const v2ResultSummary = asRecord(projectionV2?.result_summary_v1);
  const v2Dimensions = Array.isArray(v2Scores?.dimensions) ? v2Scores.dimensions : [];
  const dimensions = v2Dimensions.length > 0
    ? v2Dimensions.map((rawDimension) => {
        const dimension = asRecord(rawDimension) ?? {};
        const code = normalizeText(dimension.code);

        return {
          code,
          label: normalizeText(dimension.label) || code,
          score: normalizeNumber(dimension.score),
        };
      }).filter((dimension) => dimension.code)
    : ["R", "I", "A", "S", "E", "C"].map((code) => ({
        code,
        label: normalizeText(labels[code]) || code,
        score: normalizeNumber(scores[code]),
      }));
  const formCode = normalizeText(v2Form?.form_code) || normalizeText(form?.form_code) || null;
  const deepContentFormCode = formCode && isRiasecFormCode(formCode) ? formCode : null;
  const topCode = normalizeText(v2HollandCode?.code) || normalizeText(projection.top_code);
  const qualityFlags = Array.isArray(v2Quality?.flags)
    ? v2Quality.flags.map((flag) => normalizeText(flag)).filter(Boolean)
    : Array.isArray(projection.quality_flags)
      ? projection.quality_flags.map((flag) => normalizeText(flag)).filter(Boolean)
      : [];
  const qualityGrade = normalizeText(v2Quality?.grade) || normalizeText(projection.quality_grade) || "A";
  const qualityState = normalizeText(v2Quality?.quality_state);
  const authority = resolveRiasecPrivateResultAuthority(reportData)
    ?? parseRiasecPrivateResultAuthority(projectionV2?.private_result_authority);

  return {
    authority,
    topCode,
    formCode,
    formKind: normalizeText(v2Form?.form_kind) || null,
    formLabel: normalizeText(form?.label) || normalizeText(form?.short_label) || null,
    questionCount: Number.isFinite(Number(v2Form?.question_count))
      ? Number(v2Form?.question_count)
      : Number.isFinite(Number(form?.question_count))
        ? Number(form?.question_count)
        : null,
    estimatedMinutes: Number.isFinite(Number(form?.estimated_minutes)) ? Number(form?.estimated_minutes) : null,
    primaryType: normalizeText(v2HollandCode?.primary_type) || normalizeText(projection.primary_type),
    secondaryType: normalizeText(v2HollandCode?.secondary_type) || normalizeText(projection.secondary_type),
    tertiaryType: normalizeText(v2HollandCode?.tertiary_type) || normalizeText(projection.tertiary_type),
    clarityIndex: normalizeNumber(projection.clarity_index),
    breadthIndex: normalizeNumber(projection.breadth_index),
    qualityGrade,
    qualityFlags,
    qualityDisplay: buildQualityDisplay(v2QualityDisplay, requestedPageLocale, qualityState, qualityGrade),
    resultSummary: buildResultSummary(v2ResultSummary, requestedPageLocale),
    dimensions,
    trustedResultCard: projectionV2
      ? {
          schemaVersion: "riasec.trusted_result_card.v1",
          projectionVersion: normalizeText(projectionV2.schema_version),
          scoreSpaceVersion: normalizeText(v2Form?.score_space_version),
          qualityRuleStatus: normalizeText(v2MeasurementEvidence?.quality_rule_status),
          qualityState: normalizeText(v2Quality?.quality_state),
          lowQualityStrength: normalizeText(v2Quality?.low_quality_strength),
          snapshotBound: normalizeBoolean(v2MeasurementEvidence?.snapshot_bound),
          crossFormComparable: normalizeBoolean(v2Form?.cross_form_comparable),
          rawScoreDeltaAllowed: normalizeBoolean(v2Form?.raw_score_delta_allowed),
          occupationExamplesPolicy: normalizeText(v2ContentBoundary?.occupation_examples_policy),
          validationStatus: normalizeText(v2MeasurementEvidence?.validation_status),
        }
      : null,
    interpretationState: buildInterpretationState(v2InterpretationState, requestedPageLocale, topCode),
    moduleVisibilityPolicy: buildModuleVisibilityPolicy(v2ModuleVisibilityPolicy),
    deepContentSlots: buildDeepContentSlots(v2DeepContentSlots, {
      requestedPageLocale,
      formCode: deepContentFormCode,
    }),
    activityExplorer: buildActivityExplorer(v2ActivityExplorer),
    feedbackOverlay: buildFeedbackOverlay(v2FeedbackOverlay),
    lifecycleCopy: buildLifecycleCopy(v2LifecycleCopy),
    enhancedBreakdown: {
      activity: Object.fromEntries(Object.entries(asRecord(enhanced.activity) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
      environment: Object.fromEntries(Object.entries(asRecord(enhanced.environment) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
      role: Object.fromEntries(Object.entries(asRecord(enhanced.role) ?? {}).map(([key, value]) => [key, normalizeNumber(value)])),
    },
  };
}

export function getRenderableRiasecDeepContentSlots(
  viewModel: Pick<RiasecResultViewModel, "deepContentSlots">,
  moduleKey?: string
): RiasecDeepContentSlot[] {
  const slots = viewModel.deepContentSlots?.slots ?? [];
  return moduleKey ? slots.filter((slot) => slot.moduleKey === moduleKey) : slots;
}

export function getRiasecModuleVisibility(
  viewModel: Pick<RiasecResultViewModel, "moduleVisibilityPolicy">,
  moduleKey: string
): RiasecModuleVisibility {
  const policy = viewModel.moduleVisibilityPolicy;
  if (!policy) {
    return "hidden";
  }

  const moduleState = policy.modules.find((module) => module.key === moduleKey);
  return moduleState?.visibility ?? "hidden";
}

function buildInterpretationState(
  rawState: Record<string, unknown> | null,
  requestedPageLocale: Locale,
  topCode: string
): RiasecInterpretationState | null {
  if (!rawState) {
    return null;
  }

  const nearTieState = asRecord(rawState.near_tie_state) ?? {};
  const alternateCode = asRecord(rawState.alternate_code) ?? {};
  const rawTieDisplay = asRecord(rawState.tie_display_v1);
  const rawTieCopy = asRecord(rawTieDisplay?.display_copy);
  const topCodeConfidence = asRecord(rawState.top_code_confidence) ?? {};
  const resultPageStrategy = asRecord(rawState.result_page_strategy) ?? {};
  const rawFieldAuthority = asRecord(rawState.field_authority) ?? {};

  return {
    interpretationRuleVersion: normalizeText(rawState.interpretation_rule_version),
    profileShape: normalizeText(rawState.profile_shape),
    profileShapeVersion: normalizeText(rawState.profile_shape_version),
    clarityLabel: normalizeText(rawState.clarity_label),
    nearTieState: {
      state: normalizeText(nearTieState.state),
      dimensions: normalizeStringList(nearTieState.dimensions),
    },
    alternateCode: {
      show: normalizeBoolean(alternateCode.show),
      codes: normalizeStringList(alternateCode.codes),
      displayBoundary: normalizeText(alternateCode.display_boundary),
    },
    alternateCodeReason: normalizeText(rawState.alternate_code_reason) || null,
    tieDisplay: buildTieDisplay(rawTieDisplay, rawTieCopy, rawFieldAuthority, requestedPageLocale, topCode),
    topCodeConfidence: {
      level: normalizeText(topCodeConfidence.level),
      meaning: normalizeText(topCodeConfidence.meaning),
    },
    readingStrength: normalizeText(rawState.reading_strength),
    resultPageStrategy: {
      primaryReadingMode: normalizeText(resultPageStrategy.primary_reading_mode),
    },
    moduleVisibilityPolicyId: normalizeText(rawState.module_visibility_policy_id),
    validationStatus: normalizeText(rawState.validation_status),
    fieldAuthority: Object.fromEntries(
      Object.entries(rawFieldAuthority)
        .map(([key, value]) => [key, normalizeText(value)])
        .filter(([, value]) => Boolean(value))
    ),
  };
}

function buildTieDisplay(
  rawTieDisplay: Record<string, unknown> | null,
  rawTieCopy: Record<string, unknown> | null,
  rawFieldAuthority: Record<string, unknown>,
  requestedPageLocale: Locale,
  topCode: string
): RiasecInterpretationState["tieDisplay"] {
  if (!rawTieDisplay || !rawTieCopy) return null;

  const kind = normalizeText(rawTieDisplay.kind);
  const position = normalizeText(rawTieDisplay.position);
  const dimensions = normalizeStringList(rawTieDisplay.dimensions);
  const groups = Array.isArray(rawTieDisplay.groups)
    ? rawTieDisplay.groups.map((group) => normalizeStringList(group)).filter((group) => group.length > 0)
    : [];
  const orderedCode = normalizeText(rawTieDisplay.ordered_code);
  const alternateCodes = normalizeStringList(rawTieDisplay.alternate_codes);
  const expectedLocale = requestedPageLocale === "zh" ? "zh-CN" : "en";
  const isDimension = (value: string) => /^[RIASEC]$/.test(value);
  const isCode = (value: string) => /^[RIASEC]{3}$/.test(value) && new Set(value).size === 3;
  const matches = (expected: string[]) => dimensions.length === expected.length && dimensions.every((value, index) => value === expected[index]);
  const codesMatch = (expected: string[]) => alternateCodes.length === expected.length && alternateCodes.every((value, index) => value === expected[index]);
  const flattenedGroups = groups.flat();
  const commonValid =
    normalizeText(rawTieDisplay.schema_version) === "riasec.tie_display.v1" &&
    normalizeText(rawTieDisplay.locale) === expectedLocale &&
    normalizeText(rawFieldAuthority.tie_display_v1) === "backend_owned" &&
    ["none", "exact_tie", "near_tie"].includes(kind) &&
    rawTieDisplay.ordering_precision_claim_allowed === false &&
    isCode(orderedCode) && orderedCode === topCode &&
    dimensions.every(isDimension) && new Set(dimensions).size === dimensions.length &&
    groups.every((group) => group.length >= 2 && group.every(isDimension) && new Set(group).size === group.length) &&
    alternateCodes.every(isCode) && new Set(alternateCodes).size === alternateCodes.length &&
    Boolean(normalizeText(rawTieCopy.headline));

  let shapeValid = false;
  if (kind === "none") {
    shapeValid = position === "none" && dimensions.length === 0 && groups.length === 0 && alternateCodes.length === 0;
  } else if (kind === "exact_tie") {
    shapeValid = position === "exact_groups" && alternateCodes.length === 0 && groups.length > 0 &&
      flattenedGroups.length === dimensions.length && flattenedGroups.every((value, index) => value === dimensions[index]) && (
      groups.every((group) => group.some((value) => orderedCode.includes(value)))
    );
  } else if (kind === "near_tie") {
    shapeValid = groups.length === 0 && (
      (position === "top1_top2_near_tie" && matches([orderedCode[0], orderedCode[1]]) && codesMatch([`${orderedCode[1]}${orderedCode[0]}${orderedCode[2]}`])) ||
      (position === "top2_top3_near_tie" && matches([orderedCode[1], orderedCode[2]]) && codesMatch([`${orderedCode[0]}${orderedCode[2]}${orderedCode[1]}`])) ||
      (position === "multi_near_tie" && matches(orderedCode.split("")) && codesMatch([
        `${orderedCode[1]}${orderedCode[0]}${orderedCode[2]}`,
        `${orderedCode[0]}${orderedCode[2]}${orderedCode[1]}`,
      ]))
    );
  }

  if (!commonValid || !shapeValid) return null;

  return {
    schemaVersion: "riasec.tie_display.v1",
    kind: kind as "none" | "exact_tie" | "near_tie",
    position,
    dimensions,
    groups,
    orderedCode,
    alternateCodes,
    orderingPrecisionClaimAllowed: false,
    headline: normalizeText(rawTieCopy.headline),
    note: normalizeText(rawTieCopy.note),
    boundary: normalizeText(rawTieCopy.boundary),
  };
}

function buildModuleVisibilityPolicy(rawPolicy: Record<string, unknown> | null): RiasecModuleVisibilityPolicy | null {
  if (!rawPolicy) {
    return null;
  }

  const fallbackPolicy = asRecord(rawPolicy.fallback_policy) ?? {};
  const rawModules = Array.isArray(rawPolicy.modules) ? rawPolicy.modules : [];

  return {
    schemaVersion: normalizeText(rawPolicy.schema_version),
    policyId: normalizeText(rawPolicy.policy_id),
    qualityState: normalizeText(rawPolicy.quality_state),
    profileShape: normalizeText(rawPolicy.profile_shape),
    formCode: normalizeText(rawPolicy.form_code),
    modules: rawModules.map((rawModule) => {
      const moduleState = asRecord(rawModule) ?? {};
      const key = normalizeText(moduleState.key);
      const visibility = normalizeText(moduleState.visibility);

      return {
        key,
        visibility: RIASEC_MODULE_VISIBILITIES.has(visibility as RiasecModuleVisibility)
          ? (visibility as RiasecModuleVisibility)
          : "hidden",
        reason: normalizeText(moduleState.reason),
      };
    }).filter((moduleState) => KNOWN_RIASEC_MODULE_KEYS.has(moduleState.key)),
    fallbackPolicy: {
      unknownModule: normalizeText(fallbackPolicy.unknown_module),
      missingBackendState: normalizeText(fallbackPolicy.missing_backend_state),
      frontendInferenceAllowed: normalizeBoolean(fallbackPolicy.frontend_inference_allowed),
    },
  };
}

function buildDeepContentSlots(
  rawEnvelope: Record<string, unknown> | null,
  context: RiasecDeepContentProjectionContext
): RiasecDeepContentSlotsEnvelope | null {
  if (!rawEnvelope) {
    return null;
  }

  const rawSourcePolicy = asRecord(rawEnvelope.source_policy) ?? {};
  const rawSlotVisibilityPolicy = asRecord(rawEnvelope.slot_visibility_policy) ?? {};
  const envelopeLocale = normalizeRiasecContentLocale(rawEnvelope.locale);
  if (normalizeBoolean(rawSourcePolicy.frontend_fallback_allowed)) {
    return null;
  }
  if (normalizeBoolean(rawSlotVisibilityPolicy.frontend_inference_allowed)) {
    return null;
  }
  if (
    normalizeText(rawEnvelope.scale_code) !== "RIASEC" ||
    !context.formCode ||
    envelopeLocale !== context.requestedPageLocale
  ) {
    return null;
  }

  const rawSlots = Array.isArray(rawEnvelope.slots) ? rawEnvelope.slots : [];
  const slots = rawSlots
    .map((rawSlot) => buildDeepContentSlot(asRecord(rawSlot), context, envelopeLocale))
    .filter((slot): slot is RiasecDeepContentSlot => Boolean(slot));
  const slotIdCounts = new Map<string, number>();
  const dimensionCounts = new Map<string, number>();
  for (const slot of slots) {
    slotIdCounts.set(slot.slotId, (slotIdCounts.get(slot.slotId) ?? 0) + 1);
    if (slot.selection) {
      dimensionCounts.set(slot.selection.dimensionCode, (dimensionCounts.get(slot.selection.dimensionCode) ?? 0) + 1);
    }
  }
  const deduplicatedSlots = slots.filter((slot) =>
    slotIdCounts.get(slot.slotId) === 1 && (!slot.selection || dimensionCounts.get(slot.selection.dimensionCode) === 1)
  );

  return {
    schemaVersion: normalizeText(rawEnvelope.schema_version),
    scaleCode: normalizeText(rawEnvelope.scale_code),
    locale: envelopeLocale,
    contentAuthority: normalizeText(rawEnvelope.content_authority),
    snapshotBound: normalizeBoolean(rawEnvelope.snapshot_bound),
    sourcePolicy: {
      frontendFallbackAllowed: false,
      missingContentBehavior: normalizeText(rawSourcePolicy.missing_content_behavior),
      pendingContentBehavior: normalizeText(rawSourcePolicy.pending_content_behavior),
      unknownSlotBehavior: normalizeText(rawSourcePolicy.unknown_slot_behavior),
      formalReportGeneration: normalizeText(rawSourcePolicy.formal_report_generation),
    },
    slotVisibilityPolicy: {
      moduleVisibilityPolicyId: normalizeText(rawSlotVisibilityPolicy.module_visibility_policy_id),
      hiddenSlotsOmitted: normalizeBoolean(rawSlotVisibilityPolicy.hidden_slots_omitted),
      pendingOrUnavailableSlotsOmitted: normalizeBoolean(rawSlotVisibilityPolicy.pending_or_unavailable_slots_omitted),
      frontendInferenceAllowed: false,
    },
    slots: deduplicatedSlots,
  };
}

function buildDeepContentSlot(
  rawSlot: Record<string, unknown> | null,
  context: RiasecDeepContentProjectionContext,
  envelopeLocale: Locale
): RiasecDeepContentSlot | null {
  if (!rawSlot) {
    return null;
  }

  const slotKey = normalizeText(rawSlot.slot_key);
  const slotGroup = normalizeText(rawSlot.slot_group);
  const slotVisibility = normalizeText(rawSlot.slot_visibility);
  const status = normalizeText(rawSlot.status);
  const contentStatus = normalizeText(rawSlot.content_status);
  const slotId = normalizeText(rawSlot.slot_id);
  if (!KNOWN_RIASEC_DEEP_SLOT_KEYS.has(slotKey) || !KNOWN_RIASEC_DEEP_SLOT_GROUPS.has(slotGroup)) {
    return null;
  }
  if (!RIASEC_DEEP_CONTENT_STATUSES.has(status) || !RIASEC_DEEP_CONTENT_STATUSES.has(contentStatus)) {
    return null;
  }
  if (!RIASEC_DEEP_CONTENT_SLOT_VISIBILITIES.has(slotVisibility as RiasecDeepContentSlotVisibility)) {
    return null;
  }
  if (rawSlot.frontend_fallback_allowed !== false) {
    return null;
  }

  if (!slotId || normalizeRiasecContentLocale(rawSlot.locale) !== envelopeLocale) {
    return null;
  }

  const content = buildDeepContentBody(asRecord(rawSlot.content));
  if (Object.keys(content).length === 0) {
    return null;
  }
  const rawSelection = asRecord(rawSlot.selection_v1);
  let selection: RiasecDeepContentSlot["selection"] = null;
  if (slotKey === "dimension_deep_copy") {
    const scoreBand = normalizeText(rawSelection?.score_band);
    const selectedDetailKey = normalizeText(rawSelection?.selected_detail_key);
    const dimensionCode = normalizeText(rawSelection?.dimension_code);
    const rank = Number(rawSelection?.rank);
    const validDetailKeys = ["high_score_reading", "medium_score_reading", "low_score_safe_reading"] as const;
    const expectedDetailKey = {
      high: "high_score_reading",
      medium: "medium_score_reading",
      low: "low_score_safe_reading",
    }[scoreBand];
    const rawState = asRecord(rawSlot.state) ?? {};
    const isTopThree = normalizeBoolean(rawSelection?.is_top_three);
    const expectedVisibility = isTopThree ? "visible" : "collapsed";
    if (
      normalizeText(rawSelection?.schema_version) !== "riasec.dimension_interpretation_selection.v1" ||
      !["high", "medium", "low"].includes(scoreBand) ||
      !validDetailKeys.includes(selectedDetailKey as (typeof validDetailKeys)[number]) ||
      selectedDetailKey !== expectedDetailKey ||
      !["R", "I", "A", "S", "E", "C"].includes(dimensionCode) ||
      dimensionCode !== normalizeText(rawState.dimension_code) ||
      slotId !== `dimension_deep_copy:${dimensionCode}` ||
      !Number.isInteger(rank) || rank < 1 || rank > 6 ||
      isTopThree !== (rank <= 3) || slotVisibility !== expectedVisibility ||
      !(selectedDetailKey in content) ||
      validDetailKeys.filter((key) => key in content).length !== 1
    ) {
      return null;
    }
    selection = {
      schemaVersion: "riasec.dimension_interpretation_selection.v1",
      dimensionCode,
      rank,
      isTopThree,
      scoreBand: scoreBand as "high" | "medium" | "low",
      selectedDetailKey: selectedDetailKey as (typeof validDetailKeys)[number],
    };
  }

  const applicability = asRecord(rawSlot.applicability) ?? {};
  const boundaries = asRecord(rawSlot.boundaries) ?? {};
  const formCodes = normalizeStringList(applicability.form_codes);
  if (
    !context.formCode ||
    !formCodes.includes(context.formCode) ||
    (context.formCode === "riasec_60" && is60QIneligibleSlot(slotKey, slotGroup))
  ) {
    return null;
  }
  if (context.requestedPageLocale === "en" && hasReaderVisibleHanText(content, boundaries.user_visible_boundary)) {
    return null;
  }

  return {
    slotKey,
    slotGroup,
    slotId,
    moduleKey: normalizeText(rawSlot.module_key),
    slotVisibility: slotVisibility as RiasecDeepContentSlotVisibility,
    status,
    contentStatus,
    contentVersion: normalizeText(rawSlot.content_version),
    reviewStatus: normalizeText(rawSlot.review_status),
    sourceStatus: normalizeText(rawSlot.source_status),
    evidenceLevel: normalizeText(rawSlot.evidence_level),
    locale: envelopeLocale,
    frontendFallbackAllowed: false,
    fallbackBehavior: normalizeText(rawSlot.fallback_behavior),
    selection,
    applicability: {
      formCodes,
      profileShapes: normalizeStringList(applicability.profile_shapes),
      qualityStates: normalizeStringList(applicability.quality_states),
      codes: normalizeStringList(applicability.codes),
      dimensions: normalizeStringList(applicability.dimensions),
    },
    state: buildDeepContentState(asRecord(rawSlot.state)),
    content,
    boundaries: {
      userVisibleBoundary: normalizeText(boundaries.user_visible_boundary),
      requiredBoundaries: normalizeStringList(boundaries.required_boundaries),
      forbiddenClaims: normalizeStringList(boundaries.forbidden_claims),
    },
  };
}

function buildDeepContentBody(rawContent: Record<string, unknown> | null): Record<string, string | string[]> {
  if (!rawContent) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawContent)
      .filter(([key]) => KNOWN_RIASEC_DEEP_CONTENT_KEYS.has(key))
      .map(([key, value]) => [key, Array.isArray(value) ? normalizeStringList(value) : normalizeText(value)])
      .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
  );
}

function buildDeepContentState(rawState: Record<string, unknown> | null): Record<string, string> {
  if (!rawState) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawState)
      .map(([key, value]) => [key, normalizeText(value)])
      .filter(([, value]) => Boolean(value))
  );
}

function buildFeedbackOverlay(rawOverlay: Record<string, unknown> | null): RiasecFeedbackOverlay | null {
  if (!rawOverlay) {
    return null;
  }

  const snapshotIdentity = asRecord(rawOverlay.snapshot_identity) ?? {};
  const measuredResultGuard = asRecord(rawOverlay.measured_result_guard) ?? {};
  const surfacePolicy = asRecord(rawOverlay.surface_policy) ?? {};
  const readModel = asRecord(rawOverlay.read_model) ?? {};
  const claimBoundary = asRecord(rawOverlay.claim_boundary) ?? {};
  const actionLab = buildFeedbackActionLabBoundary(asRecord(rawOverlay.action_lab_v1));
  const nextExplorationNodes = buildNextExplorationNodesBoundary(asRecord(rawOverlay.next_exploration_nodes_v1));

  return {
    schemaVersion: normalizeText(rawOverlay.schema_version),
    status: normalizeText(rawOverlay.status),
    feedbackStreamStatus: normalizeText(rawOverlay.feedback_stream_status),
    snapshotBound: normalizeBoolean(rawOverlay.snapshot_bound),
    snapshotIdentity: {
      snapshotRequired: normalizeBoolean(snapshotIdentity.snapshot_required),
      snapshotBound: normalizeBoolean(snapshotIdentity.snapshot_bound),
      identityScope: normalizeText(snapshotIdentity.identity_scope),
      formCode: normalizeText(snapshotIdentity.form_code),
      scoreSpaceVersion: normalizeText(snapshotIdentity.score_space_version),
      measuredHollandCode: normalizeText(snapshotIdentity.measured_holland_code),
    },
    measuredResultGuard: {
      scoresMutationAllowed: normalizeBoolean(measuredResultGuard.scores_mutation_allowed),
      hollandCodeMutationAllowed: normalizeBoolean(measuredResultGuard.holland_code_mutation_allowed),
      reportSnapshotMutationAllowed: normalizeBoolean(measuredResultGuard.report_snapshot_mutation_allowed),
      measurementEvidenceMutationAllowed: normalizeBoolean(measuredResultGuard.measurement_evidence_mutation_allowed),
    },
    surfacePolicy: {
      publicProjectionAllowed: normalizeBoolean(surfacePolicy.public_projection_allowed),
      sharePdfExposureAllowed: normalizeBoolean(surfacePolicy.share_pdf_exposure_allowed),
      rawFeedbackPublicExposureAllowed: normalizeBoolean(surfacePolicy.raw_feedback_public_exposure_allowed),
      formalReportMutationAllowed: normalizeBoolean(surfacePolicy.formal_report_mutation_allowed),
    },
    readModel: {
      hasFeedback: normalizeBoolean(readModel.has_feedback),
      feedbackCount: normalizeNumber(readModel.feedback_count),
      latestFeedbackAt: normalizeText(readModel.latest_feedback_at) || null,
      summaryStatus: normalizeText(readModel.summary_status),
      rawFeedbackIncluded: normalizeBoolean(readModel.raw_feedback_included),
    },
    claimBoundary: {
      feedbackIsMeasurement: normalizeBoolean(claimBoundary.feedback_is_measurement),
      feedbackChangesScores: normalizeBoolean(claimBoundary.feedback_changes_scores),
      feedbackChangesMeasuredHollandCode: normalizeBoolean(claimBoundary.feedback_changes_measured_holland_code),
      feedbackIsCareerMatch: normalizeBoolean(claimBoundary.feedback_is_career_match),
      feedbackIsSuccessPrediction: normalizeBoolean(claimBoundary.feedback_is_success_prediction),
    },
    actionLab,
    nextExplorationNodes,
  };
}

function buildFeedbackActionLabBoundary(rawActionLab: Record<string, unknown> | null): RiasecFeedbackActionLabBoundary | null {
  if (!rawActionLab) {
    return null;
  }
  if (
    rawActionLab.frontend_fallback_allowed !== false ||
    rawActionLab.public_raw_feedback_allowed !== false ||
    rawActionLab.affects_measured_code !== false ||
    rawActionLab.affects_score !== false ||
    rawActionLab.affects_snapshot !== false ||
    rawActionLab.share_pdf_history_measured_payload_mutation_allowed !== false
  ) {
    return null;
  }

  return {
    schemaVersion: normalizeText(rawActionLab.schema_version),
    status: normalizeText(rawActionLab.status),
    availability: normalizeText(rawActionLab.availability),
    frontendRendererRequiredForVisibleModule: normalizeBoolean(rawActionLab.frontend_renderer_required_for_visible_module),
    publicRawFeedbackAllowed: false,
    affectsMeasuredCode: false,
    affectsScore: false,
    affectsSnapshot: false,
    sharePdfHistoryMeasuredPayloadMutationAllowed: false,
    starterActionCount: Array.isArray(rawActionLab.starter_actions) ? rawActionLab.starter_actions.length : 0,
  };
}

function buildNextExplorationNodesBoundary(rawNodes: Record<string, unknown> | null): RiasecNextExplorationNodesBoundary | null {
  if (!rawNodes) {
    return null;
  }
  if (
    rawNodes.frontend_fallback_allowed !== false ||
    rawNodes.public_raw_feedback_allowed !== false ||
    rawNodes.affects_measured_code !== false ||
    rawNodes.affects_score !== false ||
    rawNodes.affects_snapshot !== false ||
    rawNodes.creates_career_match !== false ||
    rawNodes.share_pdf_history_measured_payload_mutation_allowed !== false
  ) {
    return null;
  }

  return {
    schemaVersion: normalizeText(rawNodes.schema_version),
    status: normalizeText(rawNodes.status),
    selectionMode: normalizeText(rawNodes.selection_mode),
    frontendRendererRequiredForVisibleModule: normalizeBoolean(rawNodes.frontend_renderer_required_for_visible_module),
    publicRawFeedbackAllowed: false,
    affectsMeasuredCode: false,
    affectsScore: false,
    affectsSnapshot: false,
    createsCareerMatch: false,
    sharePdfHistoryMeasuredPayloadMutationAllowed: false,
    nodeCount: Array.isArray(rawNodes.nodes) ? rawNodes.nodes.length : 0,
  };
}

function buildActivityExplorer(rawExplorer: Record<string, unknown> | null): RiasecActivityExplorer | null {
  if (!rawExplorer) {
    return null;
  }

  const boundary = asRecord(rawExplorer.boundary) ?? {};
  const rawFamilies = Array.isArray(rawExplorer.dimension_activity_families) ? rawExplorer.dimension_activity_families : [];
  const rawPack = asRecord(rawExplorer.code_activity_pack) ?? {};
  const rawActivities = Array.isArray(rawPack.activities) ? rawPack.activities : [];

  return {
    schemaVersion: normalizeText(rawExplorer.schema_version),
    contentVersion: normalizeText(rawExplorer.content_version),
    status: normalizeText(rawExplorer.status),
    sourceStatus: normalizeText(rawExplorer.source_status),
    sourceName: normalizeText(rawExplorer.source_name),
    occupationExamplesPolicy: normalizeText(boundary.occupation_examples_policy),
    registrySourceConnected: normalizeBoolean(boundary.registry_source_connected),
    fitScoreAllowed: normalizeBoolean(boundary.fit_score_allowed),
    successPredictionAllowed: normalizeBoolean(boundary.success_prediction_allowed),
    dimensionActivityFamilies: rawFamilies.map((rawFamily) => {
      const family = asRecord(rawFamily) ?? {};

      return {
        dimension: normalizeText(family.dimension),
        label: normalizeText(family.label),
        coreDrive: normalizeText(family.core_drive),
        activityFamilies: normalizeStringList(family.activity_families),
        sourceStatus: normalizeText(family.source_status),
      };
    }).filter((family) => family.dimension && family.label && family.coreDrive),
    codeActivityPack: {
      status: normalizeText(rawPack.status),
      activities: rawActivities.map((rawActivity) => {
        const activity = asRecord(rawActivity) ?? {};
        const rawExamples = Array.isArray(activity.occupation_examples) ? activity.occupation_examples : [];

        return {
          activityKey: normalizeText(activity.activity_key),
          activityLabel: normalizeText(activity.activity_label),
          activityUserCopy: normalizeText(activity.activity_user_copy),
          riasecDimensions: normalizeStringList(activity.riasec_dimensions),
          taskExamples: normalizeStringList(activity.task_examples),
          sourceStatus: normalizeText(activity.source_status),
          occupationExamples: rawExamples.map((rawExample) => {
            const example = asRecord(rawExample) ?? {};

            return {
              occupationExample: normalizeText(example.occupation_example),
              sourceStatus: normalizeText(example.source_status),
              displayLabel: normalizeText(example.display_label),
              commonTasks: normalizeStringList(example.common_tasks),
              skillsToCheck: normalizeStringList(example.skills_to_check),
              educationBoundary: normalizeText(example.education_boundary),
              skillBoundary: normalizeText(example.skill_boundary),
              qualificationBoundary: normalizeText(example.qualification_boundary),
              localizationNote: normalizeText(example.localization_note),
              notARecommendation: normalizeBoolean(example.not_a_recommendation),
            };
          }).filter((example) => example.occupationExample),
        };
      }).filter((activity) => activity.activityKey && activity.activityLabel && activity.activityUserCopy),
    },
  };
}

function buildLifecycleCopy(rawLifecycleCopy: Record<string, unknown> | null): RiasecLifecycleCopy | null {
  if (!rawLifecycleCopy) {
    return null;
  }
  if (
    rawLifecycleCopy.frontend_fallback_allowed !== false ||
    rawLifecycleCopy.measured_payload_mutation_allowed !== false ||
    rawLifecycleCopy.report_snapshot_mutation_allowed !== false ||
    rawLifecycleCopy.raw_feedback_public_exposure_allowed !== false ||
    rawLifecycleCopy.internal_snapshot_id_public_exposure_allowed !== false ||
    rawLifecycleCopy.life_stage_public_exposure_allowed !== false ||
    rawLifecycleCopy.organization_context_public_exposure_allowed !== false
  ) {
    return null;
  }

  const surfaces = (Array.isArray(rawLifecycleCopy.surfaces) ? rawLifecycleCopy.surfaces : [])
    .map((rawSurface) => {
      const surface = asRecord(rawSurface) ?? {};
      const surfaceKey = normalizeText(surface.surface);
      if (
        !isSafeRiasecSurfaceVariant(surfaceKey, surface.public_safe) ||
        normalizeText(surface.copy) === "" ||
        surface.raw_scores_allowed !== false ||
        surface.raw_feedback_allowed !== false
      ) {
        return null;
      }

      return {
        surface: surfaceKey,
        copy: normalizeText(surface.copy),
        publicSafe: normalizeBoolean(surface.public_safe),
        rawScoresAllowed: false,
        rawFeedbackAllowed: false,
      };
    })
    .filter((surface): surface is RiasecLifecycleCopySurface => Boolean(surface));
  const faqItems = (Array.isArray(rawLifecycleCopy.faq_items) ? rawLifecycleCopy.faq_items : [])
    .map((rawItem) => {
      const item = asRecord(rawItem) ?? {};
      const q = normalizeText(item.q);
      const a = normalizeText(item.a);

      return q && a ? { q, a } : null;
    })
    .filter((item): item is RiasecLifecycleCopyFaqItem => Boolean(item));

  return {
    schemaVersion: normalizeText(rawLifecycleCopy.schema_version),
    contentAuthority: normalizeText(rawLifecycleCopy.content_authority),
    status: normalizeText(rawLifecycleCopy.status),
    snapshotBound: normalizeBoolean(rawLifecycleCopy.snapshot_bound),
    sharePdfHistoryAssetId: normalizeText(rawLifecycleCopy.share_pdf_history_asset_id),
    faqAssetId: normalizeText(rawLifecycleCopy.faq_asset_id),
    technicalNoteSummaryAssetId: normalizeText(rawLifecycleCopy.technical_note_summary_asset_id),
    professionalMethodBoundaryAssetId: normalizeText(rawLifecycleCopy.professional_method_boundary_asset_id),
    faqMarkdownReferenceAvailable: normalizeBoolean(rawLifecycleCopy.faq_markdown_reference_available),
    publicSafeDefaultSurfaceKeys: normalizeStringList(rawLifecycleCopy.public_safe_default_surface_keys)
      .filter((surface) => RIASEC_SAFE_SURFACE_VARIANTS.has(surface)),
    frontendFallbackAllowed: false,
    missingContentBehavior: normalizeText(rawLifecycleCopy.missing_content_behavior),
    measuredPayloadMutationAllowed: false,
    reportSnapshotMutationAllowed: false,
    rawFeedbackPublicExposureAllowed: false,
    internalSnapshotIdPublicExposureAllowed: false,
    lifeStagePublicExposureAllowed: false,
    organizationContextPublicExposureAllowed: false,
    surfaces,
    faqItems,
  };
}
