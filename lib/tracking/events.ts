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
  INVITE_CTA_SHOWN: "invite_cta_shown",
  INVITE_LINK_COPIED: "invite_link_copied",
  INVITE_LINK_OPENED: "invite_link_opened",
  INVITE_PROGRESS_VIEWED: "invite_progress_viewed",
  RESULT_REVISIT_AFTER_INVITE: "result_revisit_after_invite",
  INVITE_STAGED_SUMMARY_VIEWED: "invite_staged_summary_viewed",
  INVITE_CREATE_START: "invite_create_start",
  INVITE_CREATE_SUCCESS: "invite_create_success",
  INVITE_CREATE_FAILED: "invite_create_failed",
  INVITE_SHARE_OR_COPY: "invite_share_or_copy",
  INVITE_PROGRESS_ADVANCED: "invite_progress_advanced",

  // Career center events
  CAREER_CENTER_VIEW: "career_center_view",
  CAREER_RECOMMENDATION_VIEW: "career_recommendation_view",
  CAREER_RECOMMENDATION_CLICK: "career_recommendation_click",
  CAREER_RIASEC_START: "career_riasec_start",
  CAREER_RIASEC_SUBMIT: "career_riasec_submit",
  CAREER_RIASEC_RESULT_VIEW: "career_riasec_result_view",
  CAREER_LANDING_VIEW: "career_landing_view",
  CAREER_JOB_INDEX_VIEW: "career_job_index_view",
  CAREER_JOB_DETAIL_VIEW: "career_job_detail_view",
  CAREER_FAMILY_HUB_VIEW: "career_family_hub_view",
  CAREER_RECOMMENDATION_INDEX_VIEW: "career_recommendation_index_view",
  CAREER_RECOMMENDATION_DETAIL_VIEW: "career_recommendation_detail_view",
  CAREER_JOB_SEARCH_SUBMIT: "career_job_search_submit",
  CAREER_JOB_SEARCH_RESULT_CLICK: "career_job_search_result_click",
  CAREER_JOB_INDEX_RESULT_CLICK: "career_job_index_result_click",
  CAREER_FAMILY_HUB_CHILD_CLICK: "career_family_hub_child_click",
  CAREER_JOB_DETAIL_CTA_CLICK: "career_job_detail_cta_click",
  CAREER_SHORTLIST_ADD: "career_shortlist_add",
  CAREER_FEEDBACK_SUBMIT: "career_feedback_submit",
  CAREER_SUPPORT_LINK_CLICK: "career_support_link_click",
  CAREER_RECOMMENDATION_RESULT_CLICK: "career_recommendation_result_click",
  CAREER_RECOMMENDATION_MATCHED_JOB_CLICK: "career_recommendation_matched_job_click",
  CAREER_TRANSITION_PREVIEW_VIEW: "career_transition_preview_view",
  CAREER_TRANSITION_PREVIEW_TARGET_CLICK: "career_transition_preview_target_click",
  CAREER_ALIAS_RESOLUTION_SUBMIT: "career_alias_resolution_submit",
  CAREER_ALIAS_RESOLUTION_TARGET_CLICK: "career_alias_resolution_target_click",
  CAREER_ALIAS_RESOLUTION_NO_RESULT: "career_alias_resolution_no_result",
  CAREER_READY_SURFACE_EXPOSED: "career_ready_surface_exposed",
  CAREER_BLOCKED_SURFACE_EXPOSED: "career_blocked_surface_exposed",
  CAREER_CLAIM_BLOCKED_SURFACE_EXPOSED: "career_claim_blocked_surface_exposed",

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

const COMMON_MBTI_ADAPTIVE_FIELDS = [
  "adaptiveContractVersion",
  "adaptiveFingerprint",
  "selectionRewriteReason",
  "contentFeedbackWeights",
  "actionEffectWeights",
  "recommendationEffectWeights",
  "ctaEffectWeights",
  "nextBestActionKey",
  "nextBestActionSection",
  "nextBestActionReason",
] as const;

const COMMON_INVITE_UNLOCK_FIELDS = [
  "scale_code",
  "unlock_stage",
  "unlock_source",
  "completed_invitees",
  "required_invitees",
  "target_attempt_id",
  "attempt_id",
  "form_code",
  "entry_surface",
  "locale",
] as const;

const COMMON_CAREER_ATTRIBUTION_FIELDS = [
  "locale",
  "entry_surface",
  "source_page_type",
  "target_action",
  "landing_path",
  "route_family",
  "subject_kind",
  "subject_key",
  "query_mode",
] as const;

const EVENT_FIELD_WHITELIST: Record<TrackingEventName, readonly string[]> = {
  view_landing: ["locale"],
  view_test: ["slug", "locale"],
  view_test_landing: ["slug", "locale"],
  start_attempt: ["slug", "test_slug", "scaleCode", "attemptIdMasked", "attempt_id", "form_code", "entry_surface", "source_page_type", "target_action", "landing_path", "locale"],
  submit_attempt: ["slug", "attemptIdMasked", "durationMs", "form_code", "locale"],
  view_result: ["attemptIdMasked", "attempt_id", "locked", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "journeyContractVersion", "journeyFingerprint", "journeyScope", "journeyState", "progressState", "completedActionKeys", "recommendedNextPulseKeys", "revisitReorderReason", "pulseState", "pulsePromptKeys", "form_code", "locale"],
  revisit_result: ["attemptIdMasked", "attempt_id", "locked", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "journeyContractVersion", "journeyFingerprint", "journeyScope", "journeyState", "progressState", "completedActionKeys", "recommendedNextPulseKeys", "revisitReorderReason", "pulseState", "pulsePromptKeys", "form_code", "locale"],
  share_result: ["attemptIdMasked", "attempt_id", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "journeyContractVersion", "journeyFingerprint", "journeyScope", "journeyState", "progressState", "completedActionKeys", "recommendedNextPulseKeys", "revisitReorderReason", "pulseState", "pulsePromptKeys", "shareMethod", "ctaKey", "ctaRank", "continueTarget", "form_code", "locale"],
  accuracy_feedback: ["attempt_id", "feedback", "sectionKey", "actionKey", "contrastKey", "synthesisKey", "supportingScale", "crossAssessmentVersion", "neighborTypeKeys", "closeCallAxes", "typeCode", "identity", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "journeyContractVersion", "journeyFingerprint", "journeyScope", "journeyState", "progressState", "completedActionKeys", "recommendedNextPulseKeys", "revisitReorderReason", "pulseState", "pulsePromptKeys", "displayOrder", "isPrimaryFocus", "locale"],
  view_paywall: ["attemptIdMasked", "sku", "priceShown", "locale"],
  click_unlock: ["attemptIdMasked", "attempt_id", "sku", "priceShown", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "ctaKey", "ctaRank", "form_code", "locale"],
  create_order: ["attemptIdMasked", "attempt_id", "orderNoMasked", "sku", "typeCode", "identity", "variantKey", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "ctaKey", "ctaRank", "form_code", "locale"],
  payment_confirmed: ["orderNoMasked", "attemptIdMasked", "provider", "form_code", "locale"],
  payment_failed: ["orderNoMasked", "attemptIdMasked", "reason", "provider", "form_code", "locale"],
  abandoned_paywall: ["attemptIdMasked", "locked", "stayMs", "locale"],
  purchase_success: ["orderNoMasked", "attemptIdMasked", "sku", "amount", "currency", "provider", "form_code", "locale"],

  landing_view: ["slug", "test_slug", "form_code", "entry_surface", "source_page_type", "target_action", "landing_path", "locale", ...COMMON_BIG5_FIELDS],
  start_click: ["slug", "test_slug", "form_code", "entry_surface", "source_page_type", "target_action", "landing_path", "locale", "disclaimer_version", "disclaimer_hash", ...COMMON_BIG5_FIELDS],
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
  ui_card_impression: ["slug", "scale_code", "visual_kind", "attempt_id", "sectionKey", "sceneKey", "styleKey", "actionKey", "actionRank", "recommendationKey", "recommendationRank", "variantKey", "contrastKey", "synthesisKey", "supportingScale", "supportingScales", "crossAssessmentVersion", "neighborTypeKeys", "closeCallAxes", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "overviewVariantKey", "typeCode", "identity", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "journeyContractVersion", "journeyFingerprint", "journeyScope", "journeyState", "progressState", "completedActionKeys", "recommendedNextPulseKeys", "revisitReorderReason", "pulseContractVersion", "pulseState", "pulsePromptKeys", "dyadicActionFocusKey", "completedDyadicActionKeys", "recommendedNextDyadicPulseKeys", "displayOrder", "isPrimaryFocus", "ctaKey", "ctaRank", "continueTarget", "entrySurface", "attributionScope", "publicSummaryFingerprint", "discoverabilityKeys", "relationshipIndexVersion", "relationshipIndexFingerprint", "indexScope", "relationshipScope", "relationshipFingerprint", "relationshipContractVersion", "subjectJoinMode", "participantRole", "accessState", "consentScope", "consentState", "consentFingerprint", "consentArtifactVersion", "consentRefreshRequired", "privateRelationshipAccessVersion", "revocationState", "expiryState", "graphScope", "graphFingerprint", "graphContractVersion", "embedSurfaceKey", "embedFingerprint", "widgetScope", "widgetContractVersion", "hostMode", "slotKey", "sizePreset", "readScope", "subjectScope", "form_code", "locale"],
  ui_card_interaction: ["slug", "scale_code", "visual_kind", "interaction", "attempt_id", "sectionKey", "sceneKey", "styleKey", "actionKey", "actionRank", "recommendationKey", "recommendationRank", "variantKey", "contrastKey", "synthesisKey", "supportingScale", "supportingScales", "crossAssessmentVersion", "neighborTypeKeys", "closeCallAxes", "variantKeys", "sceneFingerprint", "boundaryFlags", "axisBands", "overviewVariantKey", "typeCode", "identity", "packId", "engineVersion", "userState", "feedbackSentiment", "feedbackCoverage", "actionCompletionTendency", "lastDeepReadSection", "currentIntentCluster", "primaryFocusKey", "secondaryFocusKeys", "orderedSectionKeys", "orderedRecommendationKeys", "orderedActionKeys", "recommendationPriorityKeys", "actionPriorityKeys", "readingFocusKey", "actionFocusKey", "ctaPriorityKeys", "carryoverFocusKey", "carryoverReason", "recommendedResumeKeys", "carryoverSceneKeys", "carryoverActionKeys", "memoryContractVersion", "memoryFingerprint", "memoryScope", "memoryState", "memoryProgressionState", "sectionHistoryKeys", "behaviorDeltaKeys", "dominantInterestKeys", "resumeBiasKeys", "memoryRewriteKeys", "memoryRewriteReason", ...COMMON_MBTI_ADAPTIVE_FIELDS, "journeyContractVersion", "journeyFingerprint", "journeyScope", "journeyState", "progressState", "completedActionKeys", "recommendedNextPulseKeys", "revisitReorderReason", "pulseContractVersion", "pulseState", "pulsePromptKeys", "dyadicActionFocusKey", "completedDyadicActionKeys", "recommendedNextDyadicPulseKeys", "displayOrder", "isPrimaryFocus", "ctaKey", "ctaRank", "continueTarget", "entrySurface", "attributionScope", "publicSummaryFingerprint", "discoverabilityKeys", "relationshipIndexVersion", "relationshipIndexFingerprint", "indexScope", "relationshipScope", "relationshipFingerprint", "relationshipContractVersion", "subjectJoinMode", "participantRole", "accessState", "consentScope", "consentState", "consentFingerprint", "consentArtifactVersion", "consentRefreshRequired", "privateRelationshipAccessVersion", "revocationState", "expiryState", "graphScope", "graphFingerprint", "graphContractVersion", "embedSurfaceKey", "embedFingerprint", "widgetScope", "widgetContractVersion", "hostMode", "slotKey", "sizePreset", "readScope", "subjectScope", "form_code", "locale"],
  ui_quiz_milestone: ["scale_code", "milestone", "duration_bucket", "locale"],
  ui_report_loading_phase: ["scale_code", "phase", "stage_detail", "locked", "variant", "form_code", "locale"],
  invite_cta_shown: [...COMMON_INVITE_UNLOCK_FIELDS],
  invite_link_copied: [...COMMON_INVITE_UNLOCK_FIELDS],
  invite_link_opened: [...COMMON_INVITE_UNLOCK_FIELDS],
  invite_progress_viewed: [...COMMON_INVITE_UNLOCK_FIELDS],
  result_revisit_after_invite: [...COMMON_INVITE_UNLOCK_FIELDS],
  invite_staged_summary_viewed: [...COMMON_INVITE_UNLOCK_FIELDS],
  invite_create_start: [...COMMON_INVITE_UNLOCK_FIELDS, "has_invite"],
  invite_create_success: [...COMMON_INVITE_UNLOCK_FIELDS, "has_invite"],
  invite_create_failed: [...COMMON_INVITE_UNLOCK_FIELDS, "has_invite", "reason"],
  invite_share_or_copy: [...COMMON_INVITE_UNLOCK_FIELDS, "action"],
  invite_progress_advanced: [
    ...COMMON_INVITE_UNLOCK_FIELDS,
    "previous_completed_invitees",
    "previous_required_invitees",
    "previous_unlock_stage",
    "previous_unlock_source",
    "reason",
  ],
  career_center_view: ["locale"],
  career_recommendation_view: ["locale"],
  career_recommendation_click: ["locale", "job_slug", "rank", "score"],
  career_riasec_start: ["locale"],
  career_riasec_submit: ["locale", "answered_count", "primary_code", "secondary_code"],
  career_riasec_result_view: ["locale", "primary_code", "secondary_code"],
  career_landing_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_job_index_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_job_detail_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_family_hub_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_recommendation_index_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_recommendation_detail_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_job_search_submit: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_job_search_result_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_job_index_result_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_family_hub_child_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_job_detail_cta_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_shortlist_add: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_feedback_submit: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_support_link_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_recommendation_result_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_recommendation_matched_job_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_transition_preview_view: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_transition_preview_target_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_alias_resolution_submit: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_alias_resolution_target_click: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_alias_resolution_no_result: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_ready_surface_exposed: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_blocked_surface_exposed: [...COMMON_CAREER_ATTRIBUTION_FIELDS],
  career_claim_blocked_surface_exposed: [...COMMON_CAREER_ATTRIBUTION_FIELDS, "blocked_claim_kind"],
  questions_load_failure: ["scale_code", "stage", "stage_detail", "status_group", "status_code", "error_code", "request_id", "route", "form_code", "locale"],
  submit_failure: ["scale_code", "stage", "stage_detail", "status_group", "status_code", "error_code", "request_id", "route", "form_code", "locale"],
  report_load_failure: ["scale_code", "stage", "stage_detail", "status_group", "status_code", "error_code", "request_id", "route", "form_code", "locale"],
};

const CAREER_ATTRIBUTION_EVENTS = [
  TRACKING_EVENTS.CAREER_LANDING_VIEW,
  TRACKING_EVENTS.CAREER_JOB_INDEX_VIEW,
  TRACKING_EVENTS.CAREER_JOB_DETAIL_VIEW,
  TRACKING_EVENTS.CAREER_FAMILY_HUB_VIEW,
  TRACKING_EVENTS.CAREER_RECOMMENDATION_INDEX_VIEW,
  TRACKING_EVENTS.CAREER_RECOMMENDATION_DETAIL_VIEW,
  TRACKING_EVENTS.CAREER_JOB_SEARCH_SUBMIT,
  TRACKING_EVENTS.CAREER_JOB_SEARCH_RESULT_CLICK,
  TRACKING_EVENTS.CAREER_JOB_INDEX_RESULT_CLICK,
  TRACKING_EVENTS.CAREER_FAMILY_HUB_CHILD_CLICK,
  TRACKING_EVENTS.CAREER_JOB_DETAIL_CTA_CLICK,
  TRACKING_EVENTS.CAREER_SHORTLIST_ADD,
  TRACKING_EVENTS.CAREER_FEEDBACK_SUBMIT,
  TRACKING_EVENTS.CAREER_SUPPORT_LINK_CLICK,
  TRACKING_EVENTS.CAREER_RECOMMENDATION_RESULT_CLICK,
  TRACKING_EVENTS.CAREER_RECOMMENDATION_MATCHED_JOB_CLICK,
  TRACKING_EVENTS.CAREER_TRANSITION_PREVIEW_VIEW,
  TRACKING_EVENTS.CAREER_TRANSITION_PREVIEW_TARGET_CLICK,
  TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_SUBMIT,
  TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_TARGET_CLICK,
  TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_NO_RESULT,
  TRACKING_EVENTS.CAREER_READY_SURFACE_EXPOSED,
  TRACKING_EVENTS.CAREER_BLOCKED_SURFACE_EXPOSED,
  TRACKING_EVENTS.CAREER_CLAIM_BLOCKED_SURFACE_EXPOSED,
] as const satisfies readonly TrackingEventName[];

export type CareerTrackingEventName = (typeof CAREER_ATTRIBUTION_EVENTS)[number];

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

export function isCareerAttributionEvent(eventName: string): eventName is CareerTrackingEventName {
  return CAREER_ATTRIBUTION_EVENTS.includes(eventName as CareerTrackingEventName);
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
