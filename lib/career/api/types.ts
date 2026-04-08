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
