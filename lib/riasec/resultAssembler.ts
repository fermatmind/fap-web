import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";

export type RiasecDimension = {
  code: string;
  label: string;
  score: number;
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
};

export type RiasecResultViewModel = {
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
  dimensions: RiasecDimension[];
  trustedResultCard: RiasecTrustedResultCard | null;
  interpretationState: RiasecInterpretationState | null;
  moduleVisibilityPolicy: RiasecModuleVisibilityPolicy | null;
  deepContentSlots: RiasecDeepContentSlotsEnvelope | null;
  activityExplorer: RiasecActivityExplorer | null;
  feedbackOverlay: RiasecFeedbackOverlay | null;
  enhancedBreakdown: {
    activity: Record<string, number>;
    environment: Record<string, number>;
    role: Record<string, number>;
  };
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

type RiasecProjectionContainer =
  | Pick<ReportResponse, "riasec_public_projection_v1" | "riasec_public_projection_v2">
  | Pick<ResultResponse, "riasec_public_projection_v1" | "riasec_public_projection_v2">;

export function hasRiasecProjection(reportData: RiasecProjectionContainer | null | undefined): boolean {
  return Boolean(asRecord(reportData?.riasec_public_projection_v2) ?? asRecord(reportData?.riasec_public_projection_v1));
}

export function assembleRiasecResultViewModel(reportData: RiasecProjectionContainer): RiasecResultViewModel {
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
  const v2ContentBoundary = asRecord(projectionV2?.content_boundary);
  const v2Scores = asRecord(projectionV2?.scores);
  const v2ActivityExplorer = asRecord(projectionV2?.activity_explorer_v0_1);
  const v2FeedbackOverlay = asRecord(projectionV2?.exploration_feedback_overlay_v0_1);
  const v2InterpretationState = asRecord(projectionV2?.interpretation_state);
  const v2ModuleVisibilityPolicy = asRecord(projectionV2?.module_visibility_policy);
  const v2DeepContentSlots = asRecord(projectionV2?.deep_content_slots_v1);
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
  const topCode = normalizeText(v2HollandCode?.code) || normalizeText(projection.top_code);
  const qualityFlags = Array.isArray(v2Quality?.flags)
    ? v2Quality.flags.map((flag) => normalizeText(flag)).filter(Boolean)
    : Array.isArray(projection.quality_flags)
      ? projection.quality_flags.map((flag) => normalizeText(flag)).filter(Boolean)
      : [];

  return {
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
    qualityGrade: normalizeText(v2Quality?.grade) || normalizeText(projection.quality_grade) || "A",
    qualityFlags,
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
    interpretationState: buildInterpretationState(v2InterpretationState),
    moduleVisibilityPolicy: buildModuleVisibilityPolicy(v2ModuleVisibilityPolicy),
    deepContentSlots: buildDeepContentSlots(v2DeepContentSlots),
    activityExplorer: buildActivityExplorer(v2ActivityExplorer),
    feedbackOverlay: buildFeedbackOverlay(v2FeedbackOverlay),
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
    return "visible";
  }

  const moduleState = policy.modules.find((module) => module.key === moduleKey);
  return moduleState?.visibility ?? "hidden";
}

function buildInterpretationState(rawState: Record<string, unknown> | null): RiasecInterpretationState | null {
  if (!rawState) {
    return null;
  }

  const nearTieState = asRecord(rawState.near_tie_state) ?? {};
  const alternateCode = asRecord(rawState.alternate_code) ?? {};
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

function buildDeepContentSlots(rawEnvelope: Record<string, unknown> | null): RiasecDeepContentSlotsEnvelope | null {
  if (!rawEnvelope) {
    return null;
  }

  const rawSourcePolicy = asRecord(rawEnvelope.source_policy) ?? {};
  const rawSlotVisibilityPolicy = asRecord(rawEnvelope.slot_visibility_policy) ?? {};
  if (normalizeBoolean(rawSourcePolicy.frontend_fallback_allowed)) {
    return null;
  }
  if (normalizeBoolean(rawSlotVisibilityPolicy.frontend_inference_allowed)) {
    return null;
  }

  const rawSlots = Array.isArray(rawEnvelope.slots) ? rawEnvelope.slots : [];
  const slots = rawSlots
    .map((rawSlot) => buildDeepContentSlot(asRecord(rawSlot)))
    .filter((slot): slot is RiasecDeepContentSlot => Boolean(slot));

  return {
    schemaVersion: normalizeText(rawEnvelope.schema_version),
    scaleCode: normalizeText(rawEnvelope.scale_code),
    locale: normalizeText(rawEnvelope.locale),
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
    slots,
  };
}

function buildDeepContentSlot(rawSlot: Record<string, unknown> | null): RiasecDeepContentSlot | null {
  if (!rawSlot) {
    return null;
  }

  const slotKey = normalizeText(rawSlot.slot_key);
  const slotGroup = normalizeText(rawSlot.slot_group);
  const slotVisibility = normalizeText(rawSlot.slot_visibility);
  const status = normalizeText(rawSlot.status);
  const contentStatus = normalizeText(rawSlot.content_status);
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

  const content = buildDeepContentBody(asRecord(rawSlot.content));
  if (Object.keys(content).length === 0) {
    return null;
  }

  const applicability = asRecord(rawSlot.applicability) ?? {};
  const boundaries = asRecord(rawSlot.boundaries) ?? {};

  return {
    slotKey,
    slotGroup,
    slotId: normalizeText(rawSlot.slot_id),
    moduleKey: normalizeText(rawSlot.module_key),
    slotVisibility: slotVisibility as RiasecDeepContentSlotVisibility,
    status,
    contentStatus,
    contentVersion: normalizeText(rawSlot.content_version),
    reviewStatus: normalizeText(rawSlot.review_status),
    sourceStatus: normalizeText(rawSlot.source_status),
    evidenceLevel: normalizeText(rawSlot.evidence_level),
    locale: normalizeText(rawSlot.locale),
    frontendFallbackAllowed: false,
    fallbackBehavior: normalizeText(rawSlot.fallback_behavior),
    applicability: {
      formCodes: normalizeStringList(applicability.form_codes),
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
    }).filter((family) => family.dimension),
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
      }).filter((activity) => activity.activityKey),
    },
  };
}
