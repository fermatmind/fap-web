export type CareerJobBundleResponseRaw = {
  data?: unknown;
  identity?: unknown;
  titles?: unknown;
  locale_policy?: unknown;
  alias_index?: unknown;
  ontology?: unknown;
  truth_layer?: unknown;
  trust_manifest?: unknown;
  score_bundle?: unknown;
  warnings?: unknown;
  claim_permissions?: unknown;
  seo_contract?: unknown;
  provenance_meta?: unknown;
  integrity_summary?: unknown;
  supporting_truth_summary?: unknown;
  white_box_scores?: unknown;
  structured_data?: CareerJobStructuredDataResponseRaw | unknown;
  lifecycle_companion?: unknown;
  lifecycle_operational?: unknown;
  shortlist_contract?: unknown;
  conversion_closure?: unknown;
};

export type CareerJobStructuredDataOccupationResponseRaw = {
  "@context"?: unknown;
  "@type"?: unknown;
  name?: unknown;
  url?: unknown;
  mainEntityOfPage?: unknown;
  educationRequirements?: unknown;
  experienceRequirements?: unknown;
};

export type CareerJobStructuredDataBreadcrumbListItemResponseRaw = {
  "@type"?: unknown;
  position?: unknown;
  name?: unknown;
  item?: unknown;
};

export type CareerJobStructuredDataBreadcrumbListResponseRaw = {
  "@context"?: unknown;
  "@type"?: unknown;
  itemListElement?: Array<CareerJobStructuredDataBreadcrumbListItemResponseRaw | unknown> | unknown;
};

export type CareerJobStructuredDataResponseRaw = {
  occupation?: CareerJobStructuredDataOccupationResponseRaw | unknown;
  breadcrumb_list?: CareerJobStructuredDataBreadcrumbListResponseRaw | unknown;
};

export type CareerJobIndexItemResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  identity?: unknown;
  titles?: unknown;
  truth_summary?: unknown;
  trust_summary?: unknown;
  score_summary?: unknown;
  seo_contract?: unknown;
  provenance_meta?: unknown;
};

export type CareerJobIndexResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  items?: unknown;
  data?: unknown;
};

export type CareerRecommendationBundleResponseRaw = {
  data?: unknown;
  identity?: unknown;
  recommendation_subject_meta?: unknown;
  score_bundle?: unknown;
  warnings?: unknown;
  claim_permissions?: unknown;
  trust_manifest?: unknown;
  seo_contract?: unknown;
  provenance_meta?: unknown;
  integrity_summary?: unknown;
  supporting_truth_summary?: unknown;
  white_box_scores?: unknown;
  matched_jobs?: unknown;
  matched_guides?: unknown;
  feedback_checkin?: unknown;
  projection_timeline?: unknown;
  projection_delta_summary?: unknown;
  lifecycle_operational?: unknown;
  shortlist_contract?: unknown;
  conversion_closure?: unknown;
};

export type CareerRecommendationFeedbackResponseRaw = {
  ok?: unknown;
  data?: unknown;
};

export type CareerShortlistStateResponseRaw = {
  ok?: unknown;
  data?: unknown;
};

export type CareerShortlistWriteResponseRaw = {
  ok?: unknown;
  data?: unknown;
};

export type CareerLaunchGovernanceClosureResponseRaw = {
  governance_kind?: unknown;
  governance_version?: unknown;
  scope?: unknown;
  counts?: unknown;
  members?: unknown;
  public_statement?: unknown;
};

export type CareerRuntimeConfigResponseRaw = {
  authority_kind?: unknown;
  authority_version?: unknown;
  snapshot_key?: unknown;
  thresholds?: unknown;
  experiments?: unknown;
};

export type CareerCrosswalkReviewQueueResponseRaw = {
  queue_kind?: unknown;
  queue_version?: unknown;
  scope?: unknown;
  filters_applied?: unknown;
  counts?: unknown;
  items?: unknown;
};

export type CareerCrosswalkReviewQueueItemResponseRaw = {
  subject_slug?: unknown;
  canonical_title_en?: unknown;
  family_slug?: unknown;
  current_crosswalk_mode?: unknown;
  candidate_target_kind?: unknown;
  candidate_target_slug?: unknown;
  queue_reason?: unknown;
  requires_editorial_patch?: unknown;
  batch_origin?: unknown;
  publish_track?: unknown;
  blocking_flags?: unknown;
  has_approved_patch?: unknown;
  latest_patch_key?: unknown;
  latest_patch_status?: unknown;
  latest_patch_version?: unknown;
  latest_patch_created_at?: unknown;
};

export type CareerCrosswalkPatchHistoryResponseRaw = {
  history_kind?: unknown;
  history_version?: unknown;
  subject_slug?: unknown;
  count?: unknown;
  latest_patch?: unknown;
  status_counts?: unknown;
  patches?: unknown;
};

export type CareerCrosswalkOverrideSummaryResponseRaw = {
  override_kind?: unknown;
  override_version?: unknown;
  subject_slug?: unknown;
  canonical_title_en?: unknown;
  original_crosswalk_mode?: unknown;
  resolved_crosswalk_mode?: unknown;
  resolved_target_kind?: unknown;
  resolved_target_slug?: unknown;
  override_applied?: unknown;
  applied_patch_key?: unknown;
};

export type CareerCrosswalkPatchMutationResponseRaw = {
  mutation_kind?: unknown;
  status?: unknown;
  patch?: unknown;
};

export type CareerExplainabilityScoreDimensionResponseRaw = {
  value?: unknown;
  integrity_state?: unknown;
  critical_missing_fields?: unknown;
  confidence_cap?: unknown;
  formula_version?: unknown;
  components?: unknown;
  penalties?: unknown;
  degradation_factor?: unknown;
};

export type CareerExplainabilityStrainRadarAxisResponseRaw = {
  value?: unknown;
};

export type CareerExplainabilityStrainRadarResponseRaw = {
  integrity_state?: unknown;
  confidence_cap?: unknown;
  degradation_factor?: unknown;
  formula_version?: unknown;
  axes?: unknown;
};

export type CareerExplainabilityResponseRaw = {
  data?: unknown;
  summary_kind?: unknown;
  summary_version?: unknown;
  subject_kind?: unknown;
  subject_identity?: unknown;
  score_bundle?: unknown;
  strain_radar?: unknown;
  warnings?: unknown;
  claim_permissions?: unknown;
  integrity_summary?: unknown;
};

export type CareerRecommendationIndexItemResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  recommendation_subject_meta?: unknown;
  score_summary?: unknown;
  trust_summary?: unknown;
  seo_contract?: unknown;
  provenance_meta?: unknown;
};

export type CareerRecommendationIndexResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  items?: unknown;
  data?: unknown;
};

export type CareerTransitionPreviewResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  path_type?: unknown;
  steps?: unknown;
  delta?: CareerTransitionPreviewDeltaResponseRaw | unknown;
  target_job?: unknown;
  score_summary?: unknown;
  trust_summary?: unknown;
  why_this_path?: unknown;
  what_is_lost?: unknown;
  bridge_steps_90d?: unknown;
  rationale_codes?: unknown;
  tradeoff_codes?: unknown;
  seo_contract?: unknown;
  provenance_meta?: unknown;
  data?: unknown;
};

export type CareerTransitionPreviewDeltaDirectionResponseRaw = "same" | "higher" | "lower";

export type CareerTransitionPreviewDeltaEntryResponseRaw = {
  source_value?: unknown;
  target_value?: unknown;
  direction?: CareerTransitionPreviewDeltaDirectionResponseRaw | unknown;
};

export type CareerTransitionPreviewDeltaResponseRaw = {
  entry_education_delta?: CareerTransitionPreviewDeltaEntryResponseRaw | unknown;
  work_experience_delta?: CareerTransitionPreviewDeltaEntryResponseRaw | unknown;
  training_delta?: CareerTransitionPreviewDeltaEntryResponseRaw | unknown;
};

export type CareerFamilyHubVisibleChildResponseRaw = {
  occupation_uuid?: unknown;
  canonical_slug?: unknown;
  canonical_title_en?: unknown;
  canonical_title_zh?: unknown;
  seo_contract?: unknown;
  trust_summary?: unknown;
};

export type CareerFamilyHubStructuredDataCollectionPageResponseRaw = {
  "@context"?: unknown;
  "@type"?: unknown;
  name?: unknown;
  url?: unknown;
  mainEntityOfPage?: unknown;
  numberOfItems?: unknown;
};

export type CareerFamilyHubStructuredDataItemListElementResponseRaw = {
  "@type"?: unknown;
  position?: unknown;
  name?: unknown;
  url?: unknown;
};

export type CareerFamilyHubStructuredDataItemListResponseRaw = {
  "@context"?: unknown;
  "@type"?: unknown;
  numberOfItems?: unknown;
  itemListElement?: Array<CareerFamilyHubStructuredDataItemListElementResponseRaw | unknown> | unknown;
};

export type CareerFamilyHubStructuredDataBreadcrumbListItemResponseRaw = {
  "@type"?: unknown;
  position?: unknown;
  name?: unknown;
  item?: unknown;
};

export type CareerFamilyHubStructuredDataBreadcrumbListResponseRaw = {
  "@context"?: unknown;
  "@type"?: unknown;
  itemListElement?: Array<CareerFamilyHubStructuredDataBreadcrumbListItemResponseRaw | unknown> | unknown;
};

export type CareerFamilyHubStructuredDataResponseRaw = {
  collection_page?: CareerFamilyHubStructuredDataCollectionPageResponseRaw | unknown;
  item_list?: CareerFamilyHubStructuredDataItemListResponseRaw | unknown;
  breadcrumb_list?: CareerFamilyHubStructuredDataBreadcrumbListResponseRaw | unknown;
};

export type CareerFamilyHubResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  seo_contract?: unknown;
  family?: unknown;
  visible_children?: unknown;
  counts?: unknown;
  structured_data?: CareerFamilyHubStructuredDataResponseRaw | unknown;
  data?: unknown;
};

export type CareerAliasResolutionOccupationResponseRaw = {
  occupation_uuid?: unknown;
  canonical_slug?: unknown;
  canonical_title_en?: unknown;
  canonical_title_zh?: unknown;
  seo_contract?: unknown;
  trust_summary?: unknown;
};

export type CareerAliasResolutionFamilyResponseRaw = {
  family_uuid?: unknown;
  canonical_slug?: unknown;
  title_en?: unknown;
  title_zh?: unknown;
};

export type CareerAliasResolutionCandidateResponseRaw = {
  candidate_kind?: unknown;
  occupation_uuid?: unknown;
  family_uuid?: unknown;
  canonical_slug?: unknown;
  canonical_title_en?: unknown;
  canonical_title_zh?: unknown;
  title_en?: unknown;
  title_zh?: unknown;
  seo_contract?: unknown;
  trust_summary?: unknown;
};

export type CareerAliasResolutionResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  query?: unknown;
  resolution?: unknown;
  data?: unknown;
};

export type CareerSearchResultItemResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  match_kind?: unknown;
  matched_text?: unknown;
  identity?: unknown;
  titles?: unknown;
  seo_contract?: unknown;
  trust_summary?: unknown;
  provenance_meta?: unknown;
};

export type CareerSearchResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  items?: unknown;
  data?: unknown;
  query?: unknown;
  meta?: unknown;
};

export type CareerFirstWaveReadinessOccupationResponseRaw = {
  occupation_uuid?: unknown;
  canonical_slug?: unknown;
  canonical_title_en?: unknown;
  status?: unknown;
  blocker_type?: unknown;
  remediation_class?: unknown;
  authority_override_supplied?: unknown;
  review_required?: unknown;
  crosswalk_mode?: unknown;
  reviewer_status?: unknown;
  index_state?: unknown;
  index_eligible?: unknown;
  reason_codes?: unknown;
};

export type CareerFirstWaveReadinessSummaryResponseRaw = {
  summary_kind?: unknown;
  summary_version?: unknown;
  wave_name?: unknown;
  counts?: unknown;
  occupations?: unknown;
  data?: unknown;
};

export type CareerFirstWaveLaunchTierResponseRaw = {
  summary_kind?: unknown;
  summary_version?: unknown;
  scope?: unknown;
  counts?: unknown;
  occupations?: unknown;
  data?: unknown;
};

export type CareerFirstWaveLaunchTierOccupationResponseRaw = {
  occupation_uuid?: unknown;
  canonical_slug?: unknown;
  canonical_title_en?: unknown;
  launch_tier?: unknown;
  readiness_status?: unknown;
  lifecycle_state?: unknown;
  public_index_state?: unknown;
  index_eligible?: unknown;
  reviewer_status?: unknown;
  crosswalk_mode?: unknown;
  allow_strong_claim?: unknown;
  confidence_score?: unknown;
  blocked_governance_status?: unknown;
  reason_codes?: unknown;
};

export type CareerFirstWaveDiscoverabilityManifestRouteKindResponseRaw =
  | "career_job_detail"
  | "career_family_hub";

export type CareerFirstWaveDiscoverabilityStateResponseRaw = "discoverable" | "excluded";

export type CareerFirstWaveDiscoverabilityManifestBaseRouteResponseRaw = {
  route_kind?: CareerFirstWaveDiscoverabilityManifestRouteKindResponseRaw | unknown;
  canonical_path?: unknown;
  discoverability_state?: CareerFirstWaveDiscoverabilityStateResponseRaw | unknown;
  reason_codes?: unknown;
};

export type CareerFirstWaveDiscoverabilityManifestJobDetailRouteResponseRaw =
  CareerFirstWaveDiscoverabilityManifestBaseRouteResponseRaw & {
    occupation_uuid?: unknown;
    canonical_slug?: unknown;
    canonical_title_en?: unknown;
    launch_tier?: unknown;
    readiness_status?: unknown;
    public_index_state?: unknown;
    index_eligible?: unknown;
    reviewer_status?: unknown;
    crosswalk_mode?: unknown;
    blocked_governance_status?: unknown;
  };

export type CareerFirstWaveDiscoverabilityManifestFamilyHubRouteResponseRaw =
  CareerFirstWaveDiscoverabilityManifestBaseRouteResponseRaw & {
    family_uuid?: unknown;
    canonical_slug?: unknown;
    title_en?: unknown;
    visible_children_count?: unknown;
  };

export type CareerFirstWaveDiscoverabilityManifestRouteResponseRaw =
  | CareerFirstWaveDiscoverabilityManifestJobDetailRouteResponseRaw
  | CareerFirstWaveDiscoverabilityManifestFamilyHubRouteResponseRaw;

export type CareerFirstWaveDiscoverabilityManifestResponseRaw = {
  manifest_kind?: unknown;
  manifest_version?: unknown;
  scope?: unknown;
  routes?: unknown;
  data?: unknown;
};

export type CareerFirstWaveNextStepLinkRouteKindResponseRaw = "career_family_hub" | "career_job_detail";

export type CareerFirstWaveNextStepLinkReasonCodeResponseRaw =
  | "family_hub_discoverable"
  | "same_family_sibling_discoverable";

export type CareerFirstWaveNextStepLinkBaseResponseRaw = {
  route_kind?: CareerFirstWaveNextStepLinkRouteKindResponseRaw | unknown;
  canonical_path?: unknown;
  canonical_slug?: unknown;
  link_reason_code?: CareerFirstWaveNextStepLinkReasonCodeResponseRaw | unknown;
};

export type CareerFirstWaveNextStepFamilyHubLinkResponseRaw = CareerFirstWaveNextStepLinkBaseResponseRaw & {
  family_uuid?: unknown;
  title_en?: unknown;
};

export type CareerFirstWaveNextStepJobDetailLinkResponseRaw = CareerFirstWaveNextStepLinkBaseResponseRaw & {
  occupation_uuid?: unknown;
  canonical_title_en?: unknown;
};

export type CareerFirstWaveNextStepLinkResponseRaw =
  | CareerFirstWaveNextStepFamilyHubLinkResponseRaw
  | CareerFirstWaveNextStepJobDetailLinkResponseRaw;

export type CareerFirstWaveNextStepLinksResponseRaw = {
  summary_kind?: unknown;
  summary_version?: unknown;
  scope?: unknown;
  subject_kind?: unknown;
  subject_identity?: unknown;
  counts?: unknown;
  next_step_links?: unknown;
  data?: unknown;
};

export type CareerFirstWaveRecommendationCompanionLinkRouteKindResponseRaw =
  | "career_family_hub"
  | "career_job_detail"
  | "test_landing"
  | "topic_detail";

export type CareerFirstWaveRecommendationCompanionLinkReasonCodeResponseRaw =
  | "target_job_detail_companion"
  | "target_family_hub_companion"
  | "matched_job_detail_companion"
  | "recommendation_test_support"
  | "recommendation_topic_support";

export type CareerFirstWaveRecommendationCompanionLinkBaseResponseRaw = {
  route_kind?: CareerFirstWaveRecommendationCompanionLinkRouteKindResponseRaw | unknown;
  canonical_path?: unknown;
  canonical_slug?: unknown;
  link_reason_code?: CareerFirstWaveRecommendationCompanionLinkReasonCodeResponseRaw | unknown;
};

export type CareerFirstWaveRecommendationCompanionFamilyHubLinkResponseRaw =
  CareerFirstWaveRecommendationCompanionLinkBaseResponseRaw & {
    family_uuid?: unknown;
    title_en?: unknown;
  };

export type CareerFirstWaveRecommendationCompanionJobDetailLinkResponseRaw =
  CareerFirstWaveRecommendationCompanionLinkBaseResponseRaw & {
    occupation_uuid?: unknown;
    canonical_title_en?: unknown;
  };

export type CareerFirstWaveRecommendationCompanionTestLandingLinkResponseRaw =
  CareerFirstWaveRecommendationCompanionLinkBaseResponseRaw & {
    scale_code?: unknown;
  };

export type CareerFirstWaveRecommendationCompanionTopicDetailLinkResponseRaw =
  CareerFirstWaveRecommendationCompanionLinkBaseResponseRaw & {
    topic_code?: unknown;
  };

export type CareerFirstWaveRecommendationCompanionLinkResponseRaw =
  | CareerFirstWaveRecommendationCompanionFamilyHubLinkResponseRaw
  | CareerFirstWaveRecommendationCompanionJobDetailLinkResponseRaw
  | CareerFirstWaveRecommendationCompanionTestLandingLinkResponseRaw
  | CareerFirstWaveRecommendationCompanionTopicDetailLinkResponseRaw;

export type CareerFirstWaveRecommendationCompanionLinksResponseRaw = {
  summary_kind?: unknown;
  summary_version?: unknown;
  scope?: unknown;
  subject_kind?: unknown;
  subject_identity?: unknown;
  counts?: unknown;
  companion_links?: unknown;
  data?: unknown;
};

export type CareerDatasetHubResponseRaw = {
  contract_kind?: unknown;
  contract_version?: unknown;
  dataset_key?: unknown;
  dataset_scope?: unknown;
  dataset_name?: unknown;
  dataset_name_zh?: unknown;
  publication?: unknown;
  collection_summary?: unknown;
  filters?: unknown;
  facet_distributions?: unknown;
  scope_summary?: unknown;
  method_url?: unknown;
  members?: unknown;
  structured_data?: unknown;
};

export type CareerDatasetMethodResponseRaw = {
  contract_kind?: unknown;
  contract_version?: unknown;
  dataset_key?: unknown;
  dataset_scope?: unknown;
  method_url?: unknown;
  hub_url?: unknown;
  title?: unknown;
  summary?: unknown;
  source_summary?: unknown;
  review_discipline_summary?: unknown;
  included?: unknown;
  excluded?: unknown;
  boundary_notes?: unknown;
  scope_summary?: unknown;
  publication?: unknown;
  structured_data?: unknown;
};
