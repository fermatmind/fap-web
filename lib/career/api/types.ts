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
  matched_jobs?: unknown;
  matched_guides?: unknown;
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

export type CareerFamilyHubResponseRaw = {
  bundle_kind?: unknown;
  bundle_version?: unknown;
  family?: unknown;
  visible_children?: unknown;
  counts?: unknown;
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
  | "test_landing";

export type CareerFirstWaveRecommendationCompanionLinkReasonCodeResponseRaw =
  | "target_job_detail_companion"
  | "target_family_hub_companion"
  | "matched_job_detail_companion"
  | "recommendation_test_support";

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

export type CareerFirstWaveRecommendationCompanionLinkResponseRaw =
  | CareerFirstWaveRecommendationCompanionFamilyHubLinkResponseRaw
  | CareerFirstWaveRecommendationCompanionJobDetailLinkResponseRaw
  | CareerFirstWaveRecommendationCompanionTestLandingLinkResponseRaw;

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
