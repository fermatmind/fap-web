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
