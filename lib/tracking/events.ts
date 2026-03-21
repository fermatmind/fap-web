export const TRACKING_EVENTS = {
  // Legacy events (keep for backward compatibility)
  VIEW_LANDING: "view_landing",
  VIEW_TEST: "view_test",
  VIEW_TEST_LANDING: "view_test_landing",
  START_ATTEMPT: "start_attempt",
  SUBMIT_ATTEMPT: "submit_attempt",
  VIEW_RESULT: "view_result",
  REVISIT_RESULT: "revisit_result",
  SHARE_RESULT: "share_result",
  ACCURACY_FEEDBACK: "accuracy_feedback",
  VIEW_PAYWALL: "view_paywall",
  CLICK_UNLOCK: "click_unlock",
  CREATE_ORDER: "create_order",
  PAYMENT_CONFIRMED: "payment_confirmed",
  PAYMENT_FAILED: "payment_failed",
  ABANDONED_PAYWALL: "abandoned_paywall",
  PURCHASE_SUCCESS: "purchase_success",

  // BIG5 funnel events
  LANDING_VIEW: "landing_view",
  START_CLICK: "start_click",
  QUESTION_ANSWER: "question_answer",
  SUBMIT_CLICK: "submit_click",
  REPORT_VIEW_FREE: "report_view_free",
  PAYWALL_VIEW: "paywall_view",
  CHECKOUT_START: "checkout_start",
  PAY_SUCCESS: "pay_success",
  UNLOCK_SUCCESS: "unlock_success",
  PDF_DOWNLOAD: "pdf_download",
  RETAKE_BLOCKED: "retake_blocked",

  // Clinical funnel events
  CLINICAL_START: "clinical_start",
  CLINICAL_SUBMIT: "clinical_submit",
  CLINICAL_REPORT_VIEW: "clinical_report_view",
  CLINICAL_PAYWALL_VIEW: "clinical_paywall_view",
  CLINICAL_CHECKOUT_START: "clinical_checkout_start",
  CLINICAL_UNLOCK_SUCCESS: "clinical_unlock_success",
  CLINICAL_CRISIS_VIEW: "clinical_crisis_view",
  CLINICAL_CRISIS_RESOURCE_ACTION: "clinical_crisis_resource_action",

  // UI unification events
  UI_CARD_IMPRESSION: "ui_card_impression",
  UI_CARD_INTERACTION: "ui_card_interaction",
  UI_QUIZ_MILESTONE: "ui_quiz_milestone",
  UI_REPORT_LOADING_PHASE: "ui_report_loading_phase",

  // Career center events
  CAREER_CENTER_VIEW: "career_center_view",
  CAREER_RECOMMENDATION_VIEW: "career_recommendation_view",
  CAREER_RECOMMENDATION_CLICK: "career_recommendation_click",
  CAREER_RIASEC_START: "career_riasec_start",
  CAREER_RIASEC_SUBMIT: "career_riasec_submit",
  CAREER_RIASEC_RESULT_VIEW: "career_riasec_result_view",

  // Reliability and launch-day SLO events
  QUESTIONS_LOAD_FAILURE: "questions_load_failure",
  SUBMIT_FAILURE: "submit_failure",
  REPORT_LOAD_FAILURE: "report_load_failure",
} as const;

export type TrackingEventName = (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

const COMMON_BIG5_FIELDS = [
  "scale_code",
  "pack_version",
  "manifest_hash",
  "norms_version",
  "quality_level",
  "locked",
  "variant",
  "sku_id",
] as const;

const COMMON_CLINICAL_REPORT_FIELDS = [
  "scale_code",
  "locked",
  "variant",
  "quality_level",
  "crisis_alert",
  "locale",
] as const;

const EVENT_FIELD_WHITELIST: Record<TrackingEventName, readonly string[]> = {
  view_landing: ["locale"],
  view_test: ["slug", "locale"],
  view_test_landing: ["slug", "locale"],
  start_attempt: ["slug", "scaleCode", "attemptIdMasked", "locale"],
  submit_attempt: ["slug", "attemptIdMasked", "durationMs", "locale"],
  view_result: ["attemptIdMasked", "attempt_id", "locked", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "locale"],
  revisit_result: ["attemptIdMasked", "attempt_id", "locked", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "locale"],
  share_result: ["attemptIdMasked", "attempt_id", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "shareMethod", "ctaKey", "ctaRank", "continueTarget", "locale"],
  accuracy_feedback: ["attempt_id", "feedback", "sectionKey", "actionKey", "contrastKey", "synthesisKey", "supportingScale", "crossAssessmentVersion", "neighborTypeKeys", "closeCallAxes", "typeCode", "identity", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "displayOrder", "isPrimaryFocus", "locale"],
  view_paywall: ["attemptIdMasked", "sku", "priceShown", "locale"],
  click_unlock: ["attemptIdMasked", "attempt_id", "sku", "priceShown", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "ctaKey", "ctaRank", "locale"],
  create_order: ["attemptIdMasked", "attempt_id", "orderNoMasked", "sku", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "ctaKey", "ctaRank", "locale"],
  payment_confirmed: ["orderNoMasked", "attemptIdMasked", "provider", "locale"],
  payment_failed: ["orderNoMasked", "attemptIdMasked", "reason", "provider", "locale"],
  abandoned_paywall: ["attemptIdMasked", "locked", "stayMs", "locale"],
  purchase_success: ["orderNoMasked", "attemptIdMasked", "sku", "amount", "currency", "provider", "locale"],

  landing_view: ["slug", "locale", ...COMMON_BIG5_FIELDS],
  start_click: ["slug", "locale", "disclaimer_version", "disclaimer_hash", ...COMMON_BIG5_FIELDS],
  question_answer: ["attempt_id", "question_id", "question_no", "answered_count", "locale", ...COMMON_BIG5_FIELDS],
  submit_click: ["attempt_id", "answered_count", "duration_ms", "locale", ...COMMON_BIG5_FIELDS],
  report_view_free: ["attempt_id", "locale", ...COMMON_BIG5_FIELDS],
  paywall_view: ["attempt_id", "offers_count", "locale", ...COMMON_BIG5_FIELDS],
  checkout_start: ["attempt_id", "order_no", "price", "currency", "locale", ...COMMON_BIG5_FIELDS],
  pay_success: ["attempt_id", "order_no", "locale", ...COMMON_BIG5_FIELDS],
  unlock_success: ["attempt_id", "order_no", "locale", ...COMMON_BIG5_FIELDS],
  pdf_download: ["attempt_id", "pdf_variant", "locale", ...COMMON_BIG5_FIELDS],
  retake_blocked: ["reason", "retry_after_seconds", "locale", ...COMMON_BIG5_FIELDS],
  clinical_start: ["scale_code", "locale"],
  clinical_submit: ["scale_code", "duration_bucket", "locale"],
  clinical_report_view: [...COMMON_CLINICAL_REPORT_FIELDS],
  clinical_paywall_view: [...COMMON_CLINICAL_REPORT_FIELDS],
  clinical_checkout_start: [...COMMON_CLINICAL_REPORT_FIELDS],
  clinical_unlock_success: [...COMMON_CLINICAL_REPORT_FIELDS],
  clinical_crisis_view: ["scale_code", "crisis_alert", "quality_level", "locale"],
  clinical_crisis_resource_action: ["scale_code", "action", "locale"],
  ui_card_impression: ["slug", "scale_code", "visual_kind", "attempt_id", "sectionKey", "sceneKey", "styleKey", "actionKey", "actionRank", "recommendationKey", "recommendationRank", "variantKey", "contrastKey", "synthesisKey", "supportingScale", "supportingScales", "crossAssessmentVersion", "neighborTypeKeys", "closeCallAxes", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "overviewVariantKey", "typeCode", "identity", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "displayOrder", "isPrimaryFocus", "ctaKey", "ctaRank", "continueTarget", "entrySurface", "attributionScope", "publicSummaryFingerprint", "discoverabilityKeys", "graphScope", "graphFingerprint", "graphContractVersion", "embedSurfaceKey", "embedFingerprint", "widgetScope", "widgetContractVersion", "hostMode", "slotKey", "sizePreset", "readScope", "subjectScope", "locale"],
  ui_card_interaction: ["slug", "scale_code", "visual_kind", "interaction", "attempt_id", "sectionKey", "sceneKey", "styleKey", "actionKey", "actionRank", "recommendationKey", "recommendationRank", "variantKey", "contrastKey", "synthesisKey", "supportingScale", "supportingScales", "crossAssessmentVersion", "neighborTypeKeys", "closeCallAxes", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "overviewVariantKey", "typeCode", "identity", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "displayOrder", "isPrimaryFocus", "ctaKey", "ctaRank", "continueTarget", "entrySurface", "attributionScope", "publicSummaryFingerprint", "discoverabilityKeys", "graphScope", "graphFingerprint", "graphContractVersion", "embedSurfaceKey", "embedFingerprint", "widgetScope", "widgetContractVersion", "hostMode", "slotKey", "sizePreset", "readScope", "subjectScope", "locale"],
  ui_quiz_milestone: ["scale_code", "milestone", "duration_bucket", "locale"],
  ui_report_loading_phase: ["scale_code", "phase", "stage_detail", "locked", "variant", "locale"],
  career_center_view: ["locale"],
  career_recommendation_view: ["locale"],
  career_recommendation_click: ["locale", "job_slug", "rank", "score"],
  career_riasec_start: ["locale"],
  career_riasec_submit: ["locale", "answered_count", "primary_code", "secondary_code"],
  career_riasec_result_view: ["locale", "primary_code", "secondary_code"],
  questions_load_failure: ["scale_code", "stage", "stage_detail", "status_group", "status_code", "error_code", "request_id", "route", "locale"],
  submit_failure: ["scale_code", "stage", "stage_detail", "status_group", "status_code", "error_code", "request_id", "route", "locale"],
  report_load_failure: ["scale_code", "stage", "stage_detail", "status_group", "status_code", "error_code", "request_id", "route", "locale"],
};

const FORBIDDEN_FIELD_PATTERNS = [/^answers?($|_)/, /^reports?($|_)/, /email/, /token/, /authorization/];

function sanitizeString(value: string): string {
  return value.slice(0, 256);
}

function sanitizeValue(value: unknown): string | number | boolean | null {
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value;
  if (value === null) return null;
  return sanitizeString(String(value));
}

export function isTrackingEvent(eventName: string): eventName is TrackingEventName {
  return Object.values(TRACKING_EVENTS).includes(eventName as TrackingEventName);
}

export function filterTrackingPayload(
  eventName: TrackingEventName,
  payload: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  const allowed = EVENT_FIELD_WHITELIST[eventName];

  return allowed.reduce<Record<string, string | number | boolean | null>>((acc, key) => {
    const normalizedKey = key.toLowerCase();
    const forbidden = FORBIDDEN_FIELD_PATTERNS.some((pattern) => pattern.test(normalizedKey));
    if (forbidden) return acc;

    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      acc[key] = sanitizeValue(payload[key]);
    }

    return acc;
  }, {});
}
