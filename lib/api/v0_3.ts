import { getFmToken } from "@/lib/auth/fmToken";
import { getOrCreateAnonId, removePendingAnonLinkAttempts } from "@/lib/anon";
import { buildApiUrl } from "@/lib/api-base";
import { ApiError, apiClient } from "@/lib/api-client";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import { buildRequestScaleCodeCandidates } from "@/lib/scaleCodeMode";

export type ScaleQuestionOption = {
  code: string;
  text?: string;
  text_en?: string | null;
  text_zh?: string | null;
  label?: string;
  score?: number;
  svg?: {
    view_box?: string;
    paths?: Array<{
      d?: string;
      fill?: string;
      fill_rule?: string;
      stroke?: string;
      stroke_width?: number | string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ScaleQuestionItem = {
  question_id: string;
  text?: string | null;
  text_en?: string | null;
  text_zh?: string | null;
  order?: number;
  direction?: number;
  dimension?: string;
  facet_code?: string;
  module_code?: string;
  options_set_code?: string;
  is_reverse?: boolean | number;
  options?: ScaleQuestionOption[] | null;
  stem?: {
    prompt_zh?: string;
    prompt_en?: string;
    svg?: {
      view_box?: string;
      paths?: Array<{
        d?: string;
        fill?: string;
        fill_rule?: string;
        stroke?: string;
        stroke_width?: number | string;
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  } | null;
  section_code?: string;
  section_order?: number;
  type?: string;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export type QuestionValidityItem = {
  item_id: string;
  text: string;
  required?: boolean;
};

export type QuestionsMeta = {
  validity_items?: QuestionValidityItem[];
  option_anchors?: Array<{
    code?: string;
    label?: string;
    text?: string;
    [key: string]: unknown;
  }>;
  disclaimer_version?: string;
  disclaimer_hash?: string;
  disclaimer_text?: string;
  consent?: {
    required?: boolean;
    version?: string;
    text?: string;
    [key: string]: unknown;
  };
  disclaimer?: {
    version?: string;
    hash?: string;
    text?: string;
    [key: string]: unknown;
  };
  source?: {
    items?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  };
  modules?: Record<string, { title?: string; guidance?: string }>;
  privacy_addendum?: Record<string, unknown>;
  crisis_resources?: Record<string, unknown>;
  manifest_hash?: string;
  norms_version?: string;
  quality_level?: string;
  [key: string]: unknown;
};

export type QuestionsResponse = {
  ok: boolean;
  scale_code?: string;
  pack_id?: string;
  dir_version?: string;
  content_package_version?: string;
  manifest_hash?: string;
  locale?: string;
  region?: string;
  questions: {
    schema?: string;
    items: ScaleQuestionItem[];
  };
  options?: {
    format?: string[];
    [key: string]: unknown;
  };
  meta?: QuestionsMeta;
};

export type StartAttemptResponse = {
  ok: boolean;
  attempt_id: string;
  form_code?: string;
  pack_id?: string;
  dir_version?: string;
  resume_token?: string;
  resume_expires_at?: string | null;
  scale_code?: string;
  locale?: string;
  region?: string;
  question_count?: number;
};

export type SubmitAnswer = {
  question_id: string;
  code?: string | number;
  option_code?: string | number;
  value?: string | number;
  question_index?: number;
  question_type?: string;
  answer?: Record<string, unknown>;
};

export type SubmitResponse = {
  ok: boolean;
  attempt_id?: string;
  submission_id?: string;
  submission_state?: string;
  generating?: boolean;
  mode?: string;
  result?: Record<string, unknown>;
  report?: ReportResponse;
  meta?: {
    scale_code?: string;
    [key: string]: unknown;
  };
  idempotent?: boolean;
};

export type AttemptSubmissionResponse = {
  ok: boolean;
  attempt_id?: string;
  submission?: {
    id?: string;
    mode?: string;
    state?: string;
    error_code?: string | null;
    error_message?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
  };
  result?: SubmitResponse | Record<string, unknown> | null;
  generating?: boolean;
  retry_after_seconds?: number;
  retry_after?: number;
  meta?: Record<string, unknown>;
};

export type ResultResponse = {
  ok: boolean;
  attempt_id?: string;
  result?: {
    type_code?: string;
    summary?: string;
    dimensions?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  };
  meta?: {
    scale_code?: string;
    [key: string]: unknown;
  };
  mbti_form_v1?: MbtiFormSummaryV1Raw | null;
  big5_form_v1?: Big5FormSummaryV1Raw | null;
  enneagram_form_v1?: EnneagramFormSummaryV1Raw | null;
  riasec_form_v1?: RiasecFormSummaryV1Raw | null;
  big5_public_projection_v1?: Big5PublicProjection | null;
  enneagram_public_projection_v1?: EnneagramPublicProjection | null;
  enneagram_public_projection_v2?: Record<string, unknown> | null;
  enneagram_report_v2?: Record<string, unknown> | null;
  riasec_public_projection_v1?: RiasecPublicProjection | null;
  riasec_public_projection_v2?: Record<string, unknown> | null;
  comparative_v1?: ComparativeRaw | null;
  controlled_narrative_v1?: ControlledNarrativeRaw | null;
  cultural_calibration_v1?: CulturalCalibrationRaw | null;
};

export type OfferPayload = {
  sku?: string;
  label?: string;
  title?: string;
  benefit_code?: string;
  currency?: string;
  amount_cents?: number;
  price_cents?: number;
  formatted_price?: string;
  checkout_url?: string;
  order_no?: string;
  modules_included?: string[];
  modules_allowed?: string[];
  [key: string]: unknown;
};

export type Big5ReportBlock = {
  id?: string;
  kind?: string;
  type?: string;
  title?: string;
  body?: string;
  content?: string;
  metric_level?: string;
  metric_code?: string;
  bucket?: string;
  access_level?: string;
  [key: string]: unknown;
};

export type Big5ReportSection = {
  key?: string;
  title?: string;
  access_level?: string;
  module_code?: string;
  blocks?: Big5ReportBlock[];
  resources?: Array<Record<string, unknown>>;
  reasons?: string[];
  [key: string]: unknown;
};

export type EqReportMode = "self_report" | "integrated";

export type EqV5DimensionScore = {
  code?: string;
  raw_score?: number;
  standard_score?: number;
  percentile?: number;
  band?: string;
  display_band?: string;
  label?: string;
  short_label?: string;
};

export type EqV5ReportPayload = {
  eq_report_mode?: EqReportMode;
  measurement_type?: "self_report_trait_mixed_ei" | string;
  access?: {
    all_results_free?: boolean;
    locked?: boolean;
    blur?: boolean;
    paywall?: boolean;
  };
  scores?: {
    global?: EqV5DimensionScore;
    dimensions?: Record<string, EqV5DimensionScore>;
  };
  dimension_summary?: EqV5DimensionScore[];
  quality?: {
    level?: string;
    confidence_label?: string;
    flags?: string[];
    explanation_asset_id?: string;
  };
  interpretation?: {
    route_id?: string;
    signal_signature?: {
      schema?: string;
      route_id?: string;
      formulation_id?: string;
      quality_level?: string;
      confidence_label?: string;
      dimension_states?: Record<string, string>;
      strongest_dimension?: string;
      development_lever?: string;
      match_pattern?: string;
    };
    core_formulation_id?: string;
    strongest_dimension?: string;
    development_lever?: string;
    primary_mechanism_ids?: string[];
    primary_scene_ids?: string[];
    career_environment_ids?: string[];
    action_prescription_id?: string | null;
    selected_asset_ids?: {
      core_formulation_id?: string;
      mechanism_ids?: string[];
      scene_ids?: string[];
      career_environment_ids?: string[];
      action_prescription_id?: string;
    };
  };
  next_module?: {
    available?: boolean;
    module_code?: string;
    status?: string;
    cta_asset_id?: string;
  };
  methodology?: {
    norm_status?: string;
    scoring_version?: string;
    report_version?: string;
    content_version?: string;
  };
  asset_refs?: unknown;
  assets?: unknown;
};

export type RichResultProfile = {
  type_code?: string;
  type_name?: string;
  tagline?: string;
  rarity?: string | number | Record<string, unknown> | null;
  keywords?: string[];
  short_summary?: string;
  [key: string]: unknown;
};

export type RichResultIdentityCard = {
  title?: string;
  subtitle?: string;
  tagline?: string;
  summary?: string;
  type_code?: string;
  tags?: string[];
  badge?: {
    text?: string;
    version?: string;
    [key: string]: unknown;
  };
  visual?: {
    theme_color?: string;
    accent_color?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type RichResultHighlight = {
  id?: string;
  title?: string;
  label?: string;
  text?: string;
  body?: string;
  desc?: string;
  tips?: string[];
  tags?: string[];
  access_level?: string;
  module_code?: string;
  [key: string]: unknown;
};

export type ReportCta = {
  visible: boolean;
  kind: string;
  title: string | null;
  subtitle: string | null;
  primary_label: string | null;
  secondary_label: string | null;
  benefit_bullets: string[];
  badge: string | null;
  target_sku: string | null;
  target_sku_effective: string | null;
  [key: string]: unknown;
};

export type ReportLayerCard = {
  code?: string;
  title?: string;
  subtitle?: string;
  desc?: string;
  tags?: string[];
  theme?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ReportIdentityLayer = {
  title: string;
  subtitle: string;
  one_liner: string;
  bullets: string[];
  tags: string[];
  [key: string]: unknown;
};

export type ReportRecommendedRead = {
  id: string;
  type: string;
  title: string;
  desc: string | null;
  url: string | null;
  cover: string | null;
  cta: string | null;
  priority: number;
  tags: string[];
  estimated_minutes: number | null;
  status: string | null;
  published_at: string | null;
  updated_at: string | null;
  canonical_id: string | null;
  canonical_url: string | null;
  [key: string]: unknown;
};

export type ReportVersions = {
  engine?: string;
  legacy_dir?: string;
  dir_version?: string;
  content_pack_id?: string;
  profile_version?: string;
  content_package_dir?: string;
  content_package_version?: string;
  [key: string]: unknown;
};

export type ReportBorderlineNote = {
  items?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type RichResultLayers = {
  role_card?: ReportLayerCard;
  strategy_card?: ReportLayerCard;
  identity?: ReportIdentityLayer;
  [key: string]: unknown;
};

export type Big5NormsPayload = {
  status?: "CALIBRATED" | "PROVISIONAL" | "MISSING" | string;
  group_id?: string;
  group_label?: string;
  norms_version?: string;
  [key: string]: unknown;
};

export type Big5QualityPayload = {
  level?: string;
  tone?: "confident" | "cautious" | string;
  crisis_alert?: boolean;
  [key: string]: unknown;
};

export type Big5TraitProjection = {
  key?: string;
  label?: string;
  mean?: number;
  percentile?: number;
  band?: string;
  band_label?: string;
  rank?: number;
  [key: string]: unknown;
};

export type Big5FacetProjection = {
  key?: string;
  label?: string;
  slug?: string;
  domain?: string;
  mean?: number;
  percentile?: number;
  bucket?: string;
  [key: string]: unknown;
};

export type ComparativeMetricRaw = {
  metric_key?: string;
  metric_label?: string;
  value?: number;
  [key: string]: unknown;
};

export type ComparativeReferenceRaw = {
  key?: string;
  label?: string;
  summary?: string;
  [key: string]: unknown;
};

export type ComparativeRaw = {
  version?: string;
  comparative_contract_version?: string;
  enabled?: boolean;
  percentile?: ComparativeMetricRaw | null;
  cohort_relative_position?: ComparativeReferenceRaw | null;
  same_type_contrast?: ComparativeReferenceRaw | null;
  norming_version?: string;
  norming_scope?: string;
  norming_source?: string;
  comparative_fingerprint?: string;
  truth_guard_fields?: string[];
  [key: string]: unknown;
};

export type PublicSurfaceRaw = {
  version?: string;
  entry_surface?: string;
  public_summary_fingerprint?: string;
  discoverability_keys?: string[];
  continue_reading_keys?: string[];
  canonical_url?: string | null;
  robots_policy?: string | null;
  attribution_scope?: string | null;
  [key: string]: unknown;
};

export type SeoSurfaceRaw = {
  version?: string;
  metadata_contract_version?: string;
  metadata_fingerprint?: string;
  metadata_scope?: string;
  surface_type?: string;
  canonical_url?: string | null;
  robots_policy?: string | null;
  title?: string | null;
  description?: string | null;
  og_payload?: Record<string, unknown> | null;
  twitter_payload?: Record<string, unknown> | null;
  alternates?: Record<string, string | null | undefined> | null;
  structured_data_keys?: string[] | null;
  indexability_state?: string | null;
  sitemap_state?: string | null;
  llms_exposure_state?: string | null;
  share_safety_state?: string | null;
  public_summary_fingerprint?: string | null;
  runtime_artifact_ref?: string | null;
  [key: string]: unknown;
};

export type LandingSurfaceRaw = {
  version?: string;
  landing_contract_version?: string;
  landing_fingerprint?: string;
  landing_scope?: string;
  entry_surface?: string;
  entry_type?: string;
  summary_blocks?: Array<Record<string, unknown>> | null;
  discoverability_items?: Array<Record<string, unknown>> | null;
  discoverability_keys?: string[] | null;
  continue_reading_keys?: string[] | null;
  start_test_target?: string | null;
  result_resume_target?: string | null;
  content_continue_target?: string | null;
  cta_bundle?: Array<Record<string, unknown>> | null;
  indexability_state?: string | null;
  attribution_scope?: string | null;
  seo_surface_ref?: string | null;
  public_surface_ref?: string | null;
  surface_family?: string | null;
  primary_content_ref?: string | null;
  related_surface_keys?: string[] | null;
  share_safety_state?: string | null;
  runtime_artifact_ref?: string | null;
  [key: string]: unknown;
};

export type AnswerSurfaceRaw = {
  version?: string;
  answer_contract_version?: string;
  answer_fingerprint?: string;
  answer_scope?: string;
  surface_type?: string;
  summary_blocks?: Array<Record<string, unknown>> | null;
  faq_blocks?: Array<Record<string, unknown>> | null;
  compare_blocks?: Array<Record<string, unknown>> | null;
  scene_summary_blocks?: Array<Record<string, unknown>> | null;
  next_step_blocks?: Array<Record<string, unknown>> | null;
  answer_bundle?: Array<Record<string, unknown>> | null;
  evidence_refs?: string[] | null;
  public_safety_state?: string | null;
  indexability_state?: string | null;
  attribution_scope?: string | null;
  seo_surface_ref?: string | null;
  landing_surface_ref?: string | null;
  public_surface_ref?: string | null;
  primary_content_ref?: string | null;
  related_surface_keys?: string[] | null;
  runtime_artifact_ref?: string | null;
  [key: string]: unknown;
};

export type InsightGraphNodeRaw = {
  id?: string;
  kind?: string;
  title?: string;
  summary?: string;
  source_contract?: string;
  [key: string]: unknown;
};

export type InsightGraphEdgeRaw = {
  from?: string;
  to?: string;
  relation?: string;
  [key: string]: unknown;
};

export type InsightGraphRaw = {
  version?: string;
  graph_contract_version?: string;
  root_node?: string;
  nodes?: InsightGraphNodeRaw[];
  edges?: InsightGraphEdgeRaw[];
  graph_fingerprint?: string;
  graph_scope?: string;
  supporting_scales?: string[];
  [key: string]: unknown;
};

export type EmbedSurfaceRaw = {
  version?: string;
  surface_key?: string;
  graph_scope?: string;
  entry_surface?: string;
  title?: string;
  summary?: string;
  primary_cta_label?: string;
  primary_cta_path?: string;
  continue_target?: string;
  allowed_node_ids?: string[];
  embed_fingerprint?: string;
  render_mode?: string;
  [key: string]: unknown;
};

export type WidgetSurfaceRaw = {
  version?: string;
  widget_scope?: string;
  widget_contract_version?: string;
  surface_key?: string;
  host_mode?: string;
  slot_key?: string;
  size_preset?: string;
  entry_surface?: string;
  title?: string;
  summary?: string;
  primary_cta_label?: string;
  primary_cta_path?: string;
  continue_target?: string;
  allowed_node_ids?: string[];
  allowed_edge_types?: string[];
  graph_fingerprint?: string;
  embed_fingerprint?: string;
  attribution_scope?: string;
  [key: string]: unknown;
};

export type PartnerReadRaw = {
  version?: string;
  graph_scope?: string;
  graph_contract_version?: string;
  graph_fingerprint?: string;
  supporting_scales?: string[];
  allowed_node_ids?: string[];
  allowed_edge_types?: string[];
  read_scope?: string;
  subject_scope?: string;
  attribution_scope?: string;
  [key: string]: unknown;
};

export type Big5PublicProjection = {
  schema_version?: string;
  trait_vector?: Big5TraitProjection[];
  facet_vector?: Big5FacetProjection[];
  trait_bands?: Record<string, string>;
  dominant_traits?: Big5TraitProjection[];
  variant_keys?: string[];
  scene_fingerprint?: Record<string, string>;
  explainability_summary?: {
    headline?: string;
    reasons?: string[];
    [key: string]: unknown;
  };
  action_plan_summary?: {
    headline?: string;
    focus_trait?: string;
    actions?: string[];
    [key: string]: unknown;
  };
  ordered_section_keys?: string[];
  sections?: Big5ReportSection[];
  comparative_v1?: ComparativeRaw | null;
  controlled_narrative_v1?: ControlledNarrativeRaw | null;
  cultural_calibration_v1?: CulturalCalibrationRaw | null;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Big5ReportEngineV2Provenance = {
  atomic_refs?: string[];
  modifier_refs?: string[];
  synergy_refs?: string[];
  facet_refs?: string[];
  action_refs?: string[];
  [key: string]: unknown;
};

export type Big5ReportEngineV2Block = {
  block_uid?: string;
  kind?: string;
  component?: string;
  block_id?: string;
  resolved_copy?: Record<string, unknown>;
  provenance?: Big5ReportEngineV2Provenance;
  analytics?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Big5ReportEngineV2Section = {
  section_key?: string;
  status?: string;
  blocks?: Big5ReportEngineV2Block[];
  [key: string]: unknown;
};

export type Big5ReportEngineV2 = {
  schema_version?: string;
  report_id?: string;
  locale?: string;
  scale_code?: string;
  form_code?: string;
  meta?: Record<string, unknown>;
  score_vector?: {
    domains?: Record<string, unknown>;
    facets?: Record<string, unknown>;
    [key: string]: unknown;
  };
  engine_decisions?: Record<string, unknown>;
  sections?: Big5ReportEngineV2Section[];
  action_matrix?: Record<string, unknown>;
  render_hints?: Record<string, unknown>;
  [key: string]: unknown;
};

export type EnneagramTypeProjection = {
  code?: string;
  type_code?: string;
  label?: string;
  name?: string;
  score?: number | string | null;
  percent?: number | string | null;
  rank?: number | string | null;
  [key: string]: unknown;
};

export type EnneagramPublicProjection = {
  schema_version?: string;
  scale_code?: string;
  primary_type?: string | EnneagramTypeProjection | null;
  primaryType?: string | EnneagramTypeProjection | null;
  type_vector?: EnneagramTypeProjection[];
  typeVector?: EnneagramTypeProjection[];
  ranked_types?: EnneagramTypeProjection[];
  rankedTypes?: EnneagramTypeProjection[];
  top_types?: EnneagramTypeProjection[];
  topTypes?: EnneagramTypeProjection[];
  summary?: string | null;
  headline?: string | null;
  confidence?: Record<string, unknown> | null;
  quality?: Record<string, unknown> | null;
  sections?: Big5ReportSection[];
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export type RiasecPublicProjection = {
  schema?: string;
  top_code?: string;
  primary_type?: string;
  secondary_type?: string;
  tertiary_type?: string;
  scores_0_100?: Record<string, number | string | null>;
  clarity_index?: number | string | null;
  breadth_index?: number | string | null;
  quality_grade?: string;
  quality_flags?: string[];
  dimension_labels?: Record<string, string>;
  enhanced_breakdown?: {
    activity?: Record<string, number | string | null>;
    environment?: Record<string, number | string | null>;
    role?: Record<string, number | string | null>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type MbtiPreviewCardRaw = {
  id: string;
  title: string;
  body?: string | null;
  bullets?: string[];
  tips?: string[];
  tags?: string[];
  module_code: string;
  access_level: "preview";
};

export type MbtiPreviewSectionRaw = {
  key: string;
  module_code: string;
  has_preview_content: boolean;
  visible_preview_cards: MbtiPreviewCardRaw[];
  has_locked_remainder: boolean;
};

export type MbtiPreviewContractV1Raw = {
  mode: "none" | "module_preview";
  modules: string[];
  sections: MbtiPreviewSectionRaw[];
};

export type ReportResponse = {
  ok?: boolean;
  locked?: boolean;
  generating?: boolean;
  snapshot_error?: boolean;
  retry_after?: number;
  retry_after_seconds?: number | null;
  access_level?: string;
  variant?: "free" | "full" | string;
  upgrade_sku?: string;
  upgrade_sku_effective?: string;
  summary?: string;
  type_code?: string;
  dimensions?: Array<Record<string, unknown>>;
  offer?: OfferPayload;
  offers?: OfferPayload[] | Record<string, unknown>;
  modules_allowed?: string[];
  modules_offered?: string[];
  modules_preview?: string[];
  scale_code?: string;
  scale_code_legacy?: string;
  scale_code_v2?: string;
  scale_uid?: string;
  cta?: ReportCta;
  price?: number | string;
  currency?: string;
  checkout_url?: string;
  norms?: Big5NormsPayload;
  quality?: Big5QualityPayload;
  report?: {
    scale_code?: string;
    locale?: string;
    summary?: string;
    profile?: RichResultProfile;
    identity_card?: RichResultIdentityCard;
    versions?: ReportVersions;
    borderline_note?: ReportBorderlineNote;
    recommended_reads?: ReportRecommendedRead[];
    layers?: RichResultLayers;
    tags?: string[];
    highlights?: RichResultHighlight[];
    sections?: Big5ReportSection[] | Record<string, unknown>;
    quality?: Record<string, unknown>;
    scores?: Record<string, unknown>;
    scores_pct?: Record<string, unknown>;
    scoresPct?: Record<string, unknown>;
    axis_states?: Record<string, unknown>;
    warnings?: Array<Record<string, unknown>>;
    dimensions?: Array<Record<string, unknown>>;
    report_tags?: string[];
    [key: string]: unknown;
  };
  view_policy?: Record<string, unknown>;
  meta?: Record<string, unknown> & {
    generating?: boolean;
    snapshot_error?: boolean;
    retry_after_seconds?: number | null;
    scale_code?: string;
    scale_code_legacy?: string;
    scale_code_v2?: string;
    scale_uid?: string;
  };
  mbti_form_v1?: MbtiFormSummaryV1Raw | null;
  big5_form_v1?: Big5FormSummaryV1Raw | null;
  big5_report_engine_v2?: Big5ReportEngineV2 | null;
  enneagram_form_v1?: EnneagramFormSummaryV1Raw | null;
  riasec_form_v1?: RiasecFormSummaryV1Raw | null;
  big5_public_projection_v1?: Big5PublicProjection | null;
  enneagram_public_projection_v1?: EnneagramPublicProjection | null;
  enneagram_public_projection_v2?: Record<string, unknown> | null;
  enneagram_report_v2?: Record<string, unknown> | null;
  riasec_public_projection_v1?: RiasecPublicProjection | null;
  riasec_public_projection_v2?: Record<string, unknown> | null;
  mbti_public_projection_v1?: MbtiPublicProjectionV1Raw | null;
  mbti_read_contract_v1?: MbtiReadContractRaw | null;
  mbti_cross_assessment_v1?: MbtiCrossAssessmentRaw | null;
  comparative_v1?: ComparativeRaw | null;
  controlled_narrative_v1?: ControlledNarrativeRaw | null;
  cultural_calibration_v1?: CulturalCalibrationRaw | null;
  mbti_access_hub_v1?: MbtiAccessHubV1Raw | null;
  mbti_preview_v1?: MbtiPreviewContractV1Raw | null;
  [key: string]: unknown;
};

export type CheckoutResponse = {
  ok?: boolean;
  order_no?: string;
  attempt_id?: string;
  payment_recovery_token?: string | null;
  wait_url?: string | null;
  result_url?: string | null;
  checkout_url?: string;
  provider?: string;
  pay?: {
    type?: "qr" | "redirect" | "html" | string;
    value?: string;
    provider?: string;
    [key: string]: unknown;
  };
  status?: string;
  message?: string;
  offer?: OfferPayload;
  price?: number | string;
  currency?: string;
  [key: string]: unknown;
};

export type CheckoutRegion = "CN_MAINLAND" | "US" | "EU";

export type OrderStatusResponse = {
  ok?: boolean;
  order_no?: string;
  attempt_id?: string;
  exact_result_entry?: AttemptReportAccessResponse | null;
  ownership_verified?: boolean;
  status?: "pending" | "paid" | "failed" | "canceled" | "refunded" | string;
  message?: string;
  payment_recovery_token?: string | null;
  wait_url?: string | null;
  result_url?: string | null;
  amount?: number | string;
  amount_cents?: number;
  currency?: string;
  provider?: string;
  checkout_url?: string;
  pay?: {
    type?: "qr" | "redirect" | "html" | string;
    value?: string;
    provider?: string;
    [key: string]: unknown;
  } | null;
  delivery?: OrderDeliveryState | null;
  mbti_form_v1?: MbtiFormSummaryV1Raw | null;
  big5_form_v1?: Big5FormSummaryV1Raw | null;
  enneagram_form_v1?: EnneagramFormSummaryV1Raw | null;
  mbti_access_hub_v1?: MbtiAccessHubV1Raw | null;
  [key: string]: unknown;
};

export type OrderReturnRecoveryResponse = {
  ok?: boolean;
  order_no?: string;
  payment_recovery_token?: string | null;
  wait_url?: string | null;
  result_url?: string | null;
  [key: string]: unknown;
};

export type InviteUnlockSummaryRaw = {
  unlock_stage?: "locked" | "partial" | "full" | string | null;
  unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
  completed_invitees?: number | null;
  required_invitees?: number | null;
  partial_scope?: string | null;
  label?: string | null;
  short_label?: string | null;
  [key: string]: unknown;
};

export type InviteUnlockDiagnosticRaw = {
  status?: "locked" | "partial_unlock" | "full_unlock" | "mixed_unlock" | string | null;
  status_reason?: string | null;
  completed_invitees?: number | null;
  required_invitees?: number | null;
  remaining_invitees?: number | null;
  progress_ratio?: number | null;
  progress_percent?: number | null;
  unlock_stage?: "locked" | "partial" | "full" | string | null;
  unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
  invite_status?: string | null;
  snapshot_at?: string | null;
  [key: string]: unknown;
};

export type AttemptReportAccessResponse = {
  ok: boolean;
  attempt_id: string;
  access_state: string;
  report_state: string;
  pdf_state: string;
  unlock_stage?: "locked" | "partial" | "full" | string | null;
  unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
  reason_code?: string | null;
  retry_after?: number | null;
  retry_after_seconds?: number | null;
  access_level?: string | null;
  variant?: string | null;
  projection_version?: number;
  modules_allowed?: string[] | null;
  modules_preview?: string[] | null;
  actions?: {
    page_href?: string | null;
    pdf_href?: string | null;
    wait_href?: string | null;
    history_href?: string | null;
    lookup_href?: string | null;
    [key: string]: unknown;
  } | null;
  payload?: Record<string, unknown> | null;
  invite_unlock_v1?: InviteUnlockSummaryRaw | null;
  invite_unlock_diag_v1?: InviteUnlockDiagnosticRaw | null;
  mbti_form_v1?: MbtiFormSummaryV1Raw | null;
  big5_form_v1?: Big5FormSummaryV1Raw | null;
  enneagram_form_v1?: EnneagramFormSummaryV1Raw | null;
  meta?: {
    produced_at?: string | null;
    refreshed_at?: string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

export type AttemptInviteUnlockProgressResponse = {
  ok: boolean;
  invite_id?: string | null;
  invite_code?: string | null;
  invite_url?: string | null;
  status?: string | null;
  required_invitees?: number | null;
  completed_invitees?: number | null;
  target_attempt_id?: string | null;
  unlock_stage?: "locked" | "partial" | "full" | string | null;
  unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
  invite_unlock_v1?: InviteUnlockSummaryRaw | null;
  invite_unlock_diag_v1?: InviteUnlockDiagnosticRaw | null;
  [key: string]: unknown;
};

export type EmailPreferences = {
  marketing_updates: boolean;
  report_recovery: boolean;
  product_updates: boolean;
};

export type EmailPreferencesResponse = {
  ok: boolean;
  email_masked: string;
  preferences: EmailPreferences;
};

export type EmailPreferencesUpdateRequest = {
  token: string;
  marketing_updates: boolean;
  report_recovery: boolean;
  product_updates: boolean;
};

export type EmailPreferencesUpdateResponse = {
  ok: boolean;
  preferences: EmailPreferences;
};

export type EmailUnsubscribeRequest = {
  token: string;
  reason?: string;
};

export type EmailUnsubscribeResponse = {
  ok: boolean;
  status: string;
};

export type MbtiPublicProjectionProfileRaw = {
  type_name?: string | null;
  nickname?: string | null;
  rarity?: string | number | Record<string, unknown> | null;
  keywords?: unknown;
  hero_summary?: string | null;
  [key: string]: unknown;
};

export type MbtiPublicProjectionSummaryCardRaw = {
  title?: string | null;
  subtitle?: string | null;
  summary?: string | null;
  tagline?: string | null;
  public_tags?: unknown;
  [key: string]: unknown;
};

export type MbtiPublicProjectionDimensionRaw = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  label?: string | null;
  axis_code?: string | null;
  axis_title?: string | null;
  axis_left?: string | null;
  axis_right?: string | null;
  left_pole?: string | null;
  right_pole?: string | null;
  left_code?: string | null;
  right_code?: string | null;
  summary?: string | null;
  description?: string | null;
  score_pct?: number | null;
  raw_first_pole_pct?: number | null;
  source?: string | null;
  side?: string | null;
  side_label?: string | null;
  pct?: number | null;
  dominant_pole?: string | null;
  dominant_label?: string | null;
  dominant_pct?: number | null;
  opposite_pct?: number | null;
  strength_band?: string | null;
  state?: string | null;
  [key: string]: unknown;
};

export type MbtiPublicProjectionV1Raw = {
  runtime_type_code?: string | null;
  canonical_type_code?: string | null;
  display_type?: string | null;
  variant_code?: string | null;
  profile?: MbtiPublicProjectionProfileRaw | null;
  summary_card?: MbtiPublicProjectionSummaryCardRaw | null;
  dimensions?: MbtiPublicProjectionDimensionRaw[] | null;
  sections?: Array<Record<string, unknown>> | null;
  seo?: Record<string, unknown> | null;
  offer_set?: unknown;
  _meta?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type MbtiPersonalizationAxisRaw = {
  axis?: string;
  axis_label?: string;
  side?: string;
  side_label?: string;
  pct?: number;
  delta?: number;
  state?: string;
  band?: string;
  [key: string]: unknown;
};

export type MbtiSceneFingerprintEntryRaw = {
  scene?: string;
  title?: string;
  summary?: string;
  style_key?: string;
  style_keys?: string[];
  chapter_anchor?: string;
  primary_axis?: MbtiPersonalizationAxisRaw | null;
  support_axis?: MbtiPersonalizationAxisRaw | null;
  boundary_axes?: string[];
  [key: string]: unknown;
};

export type MbtiCloseCallAxisRaw = MbtiPersonalizationAxisRaw & {
  opposite_side?: string;
  opposite_side_label?: string;
  boundary?: boolean;
};

export type MbtiContinuityRaw = {
  carryover_focus_key?: string;
  carryover_reason?: string;
  recommended_resume_keys?: string[];
  carryover_scene_keys?: string[];
  carryover_action_keys?: string[];
  feedback_sentiment?: string;
  feedback_coverage?: string;
  action_completion_tendency?: string;
  last_deep_read_section?: string;
  current_intent_cluster?: string;
  [key: string]: unknown;
};

export type MbtiReadContractFieldGroupRaw = {
  personalization_fields?: string[];
  surface_fields?: string[];
  sources?: string[];
  [key: string]: unknown;
};

export type MbtiReadContractRaw = {
  version?: string;
  canonical_read_model?: MbtiReadContractFieldGroupRaw | null;
  overlay_patch?: MbtiReadContractFieldGroupRaw | null;
  cacheable_fields?: string[];
  non_cacheable_fields?: string[];
  telemetry_parity_fields?: string[];
  [key: string]: unknown;
};

export type ControlledNarrativeRaw = {
  version?: string;
  narrative_contract_version?: string;
  runtime_contract_version?: string;
  runtime_mode?: string;
  provider_name?: string;
  model_version?: string;
  prompt_version?: string;
  fail_open_mode?: string;
  narrative_fingerprint?: string;
  narrative_intro?: string;
  narrative_summary?: string;
  section_narrative_keys?: string[];
  enabled?: boolean;
  truth_guard_fields?: string[];
  [key: string]: unknown;
};

export type CulturalCalibrationSectionRaw = {
  section_key?: string;
  title?: string;
  body?: string;
  [key: string]: unknown;
};

export type CulturalCalibrationRaw = {
  version?: string;
  calibration_contract_version?: string;
  locale_context?: string;
  cultural_context?: string;
  calibrated_section_keys?: string[];
  calibration_fingerprint?: string;
  calibration_policy_version?: string;
  calibration_source?: string;
  enabled?: boolean;
  narrative_overrides?: {
    intro?: string;
    summary?: string;
    [key: string]: unknown;
  } | null;
  working_life_summary?: string;
  section_overrides?: Record<string, CulturalCalibrationSectionRaw>;
  truth_guard_fields?: string[];
  [key: string]: unknown;
};

export type MbtiCrossAssessmentSectionEnhancementRaw = {
  section_key?: string;
  supporting_scale?: string;
  synthesis_key?: string;
  title?: string;
  body?: string;
  influence_keys?: string[];
  [key: string]: unknown;
};

export type MbtiCrossAssessmentRaw = {
  version?: string;
  supporting_scales?: string[];
  supporting_attempt_id?: string;
  synthesis_keys?: string[];
  big5_influence_keys?: string[];
  mbti_adjusted_focus_keys?: string[];
  supporting_traits?: string[];
  section_enhancements?: Record<string, MbtiCrossAssessmentSectionEnhancementRaw>;
  [key: string]: unknown;
};

export type MbtiWorkingLifeRaw = {
  version?: string;
  career_focus_key?: string;
  career_journey_keys?: string[];
  role_fit_keys?: string[];
  collaboration_fit_keys?: string[];
  work_env_preference_keys?: string[];
  career_next_step_keys?: string[];
  career_action_priority_keys?: string[];
  career_reading_keys?: string[];
  supporting_scales?: string[];
  big5_influence_keys?: string[];
  synthesis_keys?: string[];
  [key: string]: unknown;
};

export type MbtiActionJourneyRaw = {
  journey_contract_version?: string;
  journey_fingerprint_version?: string;
  journey_fingerprint?: string;
  journey_scope?: string;
  journey_state?: string;
  progress_state?: string;
  action_focus_key?: string;
  completed_action_keys?: string[];
  recommended_next_pulse_keys?: string[];
  action_priority_keys?: string[];
  carryover_action_keys?: string[];
  last_pulse_signal?: string;
  revisit_reorder_reason?: string;
  [key: string]: unknown;
};

export type MbtiPulseCheckRaw = {
  pulse_contract_version?: string;
  pulse_state?: string;
  pulse_prompt_keys?: string[];
  pulse_feedback_mode?: string;
  next_pulse_target?: string;
  [key: string]: unknown;
};

export type MbtiIntraTypeProfileRaw = {
  version?: string;
  profile_seed_key?: string;
  same_type_divergence_keys?: string[];
  section_selection_keys?: Record<string, string>;
  action_selection_keys?: Record<string, string>;
  recommendation_selection_keys?: string[];
  selection_fingerprint?: string;
  selection_evidence?: Record<string, unknown>;
  persona_cluster_key?: string;
  [key: string]: unknown;
};

export type MbtiLongitudinalMemoryRaw = {
  version?: string;
  memory_contract_version?: string;
  memory_fingerprint?: string;
  memory_scope?: string;
  memory_state?: string;
  progression_state?: string;
  section_history_keys?: string[];
  behavior_delta_keys?: string[];
  dominant_interest_keys?: string[];
  resume_bias_keys?: string[];
  memory_rewrite_keys?: string[];
  memory_rewrite_reason?: string;
  memory_confidence?: number;
  memory_window?: {
    days?: number;
    attempt_count?: number;
    event_count?: number;
    [key: string]: unknown;
  } | null;
  memory_evidence?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type MbtiAdaptiveSelectionRaw = {
  version?: string;
  adaptive_contract_version?: string;
  adaptive_fingerprint?: string;
  selection_rewrite_reason?: string;
  content_feedback_weights?: Record<string, number>;
  action_effect_weights?: Record<string, number>;
  recommendation_effect_weights?: Record<string, number>;
  cta_effect_weights?: Record<string, number>;
  next_best_action_v1?: {
    key?: string;
    section_key?: string;
    family?: string;
    reason?: string;
    [key: string]: unknown;
  } | null;
  adaptive_evidence?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type MbtiToneProfileRaw = {
  version?: string;
  tone_contract_version?: string;
  tone_fingerprint?: string;
  tone_scope?: string;
  default_tone_mode?: string;
  section_tone_modes?: Record<string, string>;
  section_tone_reasons?: Record<string, string>;
  tone_reason?: string;
  tone_evidence?: Record<string, unknown> | null;
  phrasing_mode?: string;
  tone_softness_mode?: string;
  tone_anchor_keys?: string[];
  [key: string]: unknown;
};

export type MbtiPersonalizationRaw = {
  locale?: string;
  type_code?: string;
  identity?: string;
  explainability_summary?: string;
  close_call_axes?: MbtiCloseCallAxisRaw[];
  neighbor_type_keys?: string[];
  contrast_keys?: Record<string, string>;
  confidence_or_stability_keys?: string[];
  axis_vector?: Record<string, MbtiPersonalizationAxisRaw>;
  axis_bands?: Record<string, string>;
  boundary_flags?: Record<string, boolean>;
  dominant_axes?: MbtiPersonalizationAxisRaw[];
  scene_fingerprint?: Record<string, MbtiSceneFingerprintEntryRaw>;
  work_style_keys?: string[];
  relationship_style_keys?: string[];
  decision_style_keys?: string[];
  stress_recovery_keys?: string[];
  communication_style_keys?: string[];
  work_style_summary?: string;
  role_fit_keys?: string[];
  collaboration_fit_keys?: string[];
  work_env_preference_keys?: string[];
  career_next_step_keys?: string[];
  action_plan_summary?: string;
  weekly_action_keys?: string[];
  relationship_action_keys?: string[];
  work_experiment_keys?: string[];
  watchout_keys?: string[];
  ordered_recommendation_keys?: string[];
  ordered_action_keys?: string[];
  recommendation_priority_keys?: string[];
  action_priority_keys?: string[];
  reading_focus_key?: string;
  action_focus_key?: string;
  user_state?: {
    is_first_view?: boolean;
    is_revisit?: boolean;
    has_unlock?: boolean;
    has_feedback?: boolean;
    has_share?: boolean;
    has_action_engagement?: boolean;
    feedback_sentiment?: string;
    feedback_coverage?: string;
    action_completion_tendency?: string;
    last_deep_read_section?: string;
    current_intent_cluster?: string;
    [key: string]: unknown;
  };
  orchestration?: {
    ordered_section_keys?: string[];
    primary_focus_key?: string;
    secondary_focus_keys?: string[];
    cta_priority_keys?: string[];
    [key: string]: unknown;
  };
  continuity?: MbtiContinuityRaw;
  read_contract_v1?: MbtiReadContractRaw | null;
  comparative_v1?: ComparativeRaw | null;
  controlled_narrative_v1?: ControlledNarrativeRaw | null;
  cultural_calibration_v1?: CulturalCalibrationRaw | null;
  cross_assessment_v1?: MbtiCrossAssessmentRaw | null;
  working_life_v1?: MbtiWorkingLifeRaw | null;
  action_journey_v1?: MbtiActionJourneyRaw | null;
  pulse_check_v1?: MbtiPulseCheckRaw | null;
  intra_type_profile_v1?: MbtiIntraTypeProfileRaw | null;
  longitudinal_memory_v1?: MbtiLongitudinalMemoryRaw | null;
  adaptive_selection_v1?: MbtiAdaptiveSelectionRaw | null;
  tone_profile_v1?: MbtiToneProfileRaw | null;
  profile_seed_key?: string;
  same_type_divergence_keys?: string[];
  section_selection_keys?: Record<string, string>;
  action_selection_keys?: Record<string, string>;
  recommendation_selection_keys?: string[];
  selection_fingerprint?: string;
  selection_evidence?: Record<string, unknown>;
  synthesis_keys?: string[];
  supporting_scales?: string[];
  big5_influence_keys?: string[];
  mbti_adjusted_focus_keys?: string[];
  career_focus_key?: string;
  career_journey_keys?: string[];
  career_action_priority_keys?: string[];
  variant_keys?: Record<string, string>;
  pack_id?: string;
  engine_version?: string;
  sections?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
};

export type MbtiCompareParticipantRaw = {
  share_id?: string;
  share_url?: string;
  attempt_id?: string;
  scale_code?: string;
  locale?: string;
  type_code?: string;
  type_name?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  summary?: string;
  primary_cta_label?: string;
  primary_cta_path?: string;
  mbti_continuity_v1?: MbtiContinuityRaw | null;
  compare_enabled?: boolean;
  compare_cta_label?: string;
  mbti_public_projection_v1?: MbtiPublicProjectionV1Raw | null;
  mbti_public_summary_v1?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type MbtiCompareAxisRaw = {
  code?: string;
  label?: string;
  summary?: string;
  state?: string;
  inviter_side?: string;
  invitee_side?: string;
  [key: string]: unknown;
};

export type MbtiCompareSummaryRaw = {
  title?: string;
  summary?: string;
  shared_count?: number | null;
  diverging_count?: number | null;
  axes?: MbtiCompareAxisRaw[] | null;
  [key: string]: unknown;
};

export type RelationshipSyncSectionRaw = {
  key?: string;
  title?: string;
  summary?: string;
  keys?: string[] | null;
  bullets?: string[] | null;
  [key: string]: unknown;
};

export type RelationshipSyncActionPromptRaw = {
  key?: string;
  title?: string;
  summary?: string;
  cta_label?: string | null;
  cta_path?: string | null;
  [key: string]: unknown;
};

export type RelationshipSyncRaw = {
  version?: string;
  relationship_contract_version?: string;
  relationship_fingerprint_version?: string;
  relationship_fingerprint?: string;
  dyadic_scope?: string;
  subject_join_mode?: string;
  status?: string;
  shared_count?: number | null;
  diverging_count?: number | null;
  friction_keys?: string[] | null;
  complement_keys?: string[] | null;
  communication_bridge_keys?: string[] | null;
  decision_tension_keys?: string[] | null;
  stress_interplay_keys?: string[] | null;
  dyadic_action_prompt_keys?: string[] | null;
  overview?: {
    title?: string;
    summary?: string;
    [key: string]: unknown;
  } | null;
  sections?: RelationshipSyncSectionRaw[] | null;
  action_prompt?: RelationshipSyncActionPromptRaw | null;
  [key: string]: unknown;
};

export type PrivateRelationshipSectionRaw = {
  key?: string;
  title?: string;
  summary?: string | null;
  bullets?: string[] | null;
  [key: string]: unknown;
};

export type PrivateRelationshipActionPromptRaw = {
  key?: string;
  title?: string;
  summary?: string | null;
  cta_label?: string | null;
  cta_path?: string | null;
  [key: string]: unknown;
};

export type PrivateRelationshipRaw = {
  version?: string;
  relationship_scope?: string;
  relationship_contract_version?: string;
  relationship_fingerprint_version?: string;
  relationship_fingerprint?: string;
  access_state?: string;
  subject_join_mode?: string;
  participant_role?: string;
  inviter_summary?: MbtiCompareParticipantRaw | null;
  invitee_summary?: MbtiCompareParticipantRaw | null;
  shared_count?: number | null;
  diverging_count?: number | null;
  friction_keys?: string[] | null;
  complement_keys?: string[] | null;
  communication_bridge_keys?: string[] | null;
  decision_tension_keys?: string[] | null;
  stress_interplay_keys?: string[] | null;
  overview?: {
    title?: string;
    summary?: string;
    [key: string]: unknown;
  } | null;
  private_sync_sections?: PrivateRelationshipSectionRaw[] | null;
  private_action_prompt?: PrivateRelationshipActionPromptRaw | null;
  [key: string]: unknown;
};

export type DyadicConsentRaw = {
  version?: string;
  consent_scope?: string;
  access_state?: string;
  consent_state?: string;
  consent_fingerprint?: string;
  consent_refresh_required?: boolean;
  private_relationship_access_version?: string;
  revocation_state?: string;
  expiry_state?: string;
  subject_join_mode?: string;
  accepted_at?: string | null;
  completed_at?: string | null;
  purchased_at?: string | null;
  consent_artifact_version?: string;
  [key: string]: unknown;
};

export type PrivateRelationshipJourneyRaw = {
  journey_contract_version?: string;
  journey_fingerprint_version?: string;
  journey_fingerprint?: string;
  journey_scope?: string;
  journey_state?: string;
  progress_state?: string;
  dyadic_action_focus_key?: string;
  completed_dyadic_action_keys?: string[] | null;
  recommended_next_dyadic_pulse_keys?: string[] | null;
  revisit_reorder_reason?: string;
  last_dyadic_pulse_signal?: string;
  [key: string]: unknown;
};

export type DyadicPulseCheckRaw = {
  pulse_contract_version?: string;
  pulse_state?: string;
  pulse_prompt_keys?: string[] | null;
  pulse_feedback_mode?: string;
  next_pulse_target?: string;
  [key: string]: unknown;
};

export type RelationshipIndexEntrySummaryRaw = {
  title?: string;
  summary?: string | null;
  badge_label?: string | null;
  badge_key?: string | null;
  [key: string]: unknown;
};

export type RelationshipResumeRaw = {
  resume_version?: string;
  resume_target?: string;
  continue_label?: string | null;
  resume_reason?: string | null;
  revisit_reorder_reason?: string | null;
  relationship_entry_keys?: string[] | null;
  [key: string]: unknown;
};

export type RelationshipIndexItemRaw = {
  invite_id?: string;
  relationship_scope?: string;
  access_state?: string;
  consent_state?: string;
  journey_state?: string;
  progress_state?: string;
  participant_role?: string;
  entry_summary?: RelationshipIndexEntrySummaryRaw | null;
  resume_target?: string;
  revisit_priority_keys?: string[] | null;
  last_dyadic_pulse_signal?: string | null;
  updated_at?: string | null;
  relationship_resume_v1?: RelationshipResumeRaw | null;
  [key: string]: unknown;
};

export type RelationshipIndexRaw = {
  relationship_index_version?: string;
  relationship_index_fingerprint?: string;
  index_scope?: string;
  items?: RelationshipIndexItemRaw[] | null;
  [key: string]: unknown;
};

export type DyadicGraphNodeRaw = {
  id?: string;
  kind?: string;
  title?: string;
  summary?: string;
  source_contract?: string;
  [key: string]: unknown;
};

export type DyadicGraphEdgeRaw = {
  from?: string;
  to?: string;
  relation?: string;
  [key: string]: unknown;
};

export type DyadicGraphRaw = {
  version?: string;
  graph_contract_version?: string;
  root_node?: string;
  nodes?: DyadicGraphNodeRaw[] | null;
  edges?: DyadicGraphEdgeRaw[] | null;
  graph_scope?: string;
  graph_fingerprint?: string;
  supporting_scales?: string[] | null;
  [key: string]: unknown;
};

export type EnneagramPublicSummaryType = {
  code?: string;
  label?: string;
  score?: number | null;
  rank?: number | null;
  role?: string | null;
  [key: string]: unknown;
};

export type EnneagramPublicSummaryPair = {
  type_a?: string | Record<string, unknown> | null;
  type_b?: string | Record<string, unknown> | null;
  trigger_reason?: string | null;
  summary?: string | null;
  [key: string]: unknown;
};

export type EnneagramPublicSummaryV1 = {
  scale_code?: string;
  form_code?: string | null;
  form_label?: string | null;
  form_kind?: string | null;
  methodology_variant?: string | null;
  primary_candidate?: string | Record<string, unknown> | null;
  second_candidate?: string | Record<string, unknown> | null;
  third_candidate?: string | Record<string, unknown> | null;
  top_types?: EnneagramPublicSummaryType[] | null;
  all9_profile_mini?: EnneagramPublicSummaryType[] | null;
  confidence_level?: string | null;
  confidence_label?: string | null;
  interpretation_scope?: string | null;
  interpretation_reason?: string | null;
  close_call_pair?: EnneagramPublicSummaryPair | null;
  dominance_gap_abs?: number | null;
  dominance_gap_pct?: number | null;
  compare_compatibility_group?: string | null;
  cross_form_comparable?: boolean | null;
  interpretation_context_id?: string | null;
  registry_release_hash?: string | null;
  content_release_hash?: string | null;
  content_snapshot_status?: string | null;
  report_schema_version?: string | null;
  projection_version?: string | null;
  generated_at?: string | null;
  public_surface_version?: string | null;
  summary_text?: string | null;
  [key: string]: unknown;
};

export type ShareSummaryResponse = {
  ok?: boolean;
  share_id?: string;
  share_url?: string;
  attempt_id?: string;
  created_at?: string;
  org_id?: string;
  content_package_version?: string;
  id?: string;
  scale_code?: string;
  locale?: string;
  type_code?: string;
  type_name?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  summary?: string;
  primary_cta_label?: string;
  primary_cta_path?: string;
  compare_enabled?: boolean;
  compare_cta_label?: string;
  typeCode?: string;
  typeName?: string;
  rarity?: string | number | Record<string, unknown> | null;
  rarity_label?: string;
  public_tags?: string[];
  publicTags?: string[];
  tags?: string[];
  profile?: Record<string, unknown> | null;
  identity_card?: Record<string, unknown> | null;
  identityCard?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  summary_card?: Record<string, unknown> | null;
  summaryCard?: Record<string, unknown> | null;
  dimensions?: Array<Record<string, unknown>>;
  mbti_read_contract_v1?: MbtiReadContractRaw | null;
  mbti_public_projection_v1?: MbtiPublicProjectionV1Raw | null;
  mbti_public_summary_v1?: Record<string, unknown> | null;
  mbti_cross_assessment_v1?: MbtiCrossAssessmentRaw | null;
  big5_public_projection_v1?: Big5PublicProjection | null;
  enneagram_public_summary_v1?: EnneagramPublicSummaryV1 | null;
  enneagram_public_projection_v1?: EnneagramPublicProjection | null;
  riasec_public_projection_v1?: RiasecPublicProjection | null;
  riasec_public_projection_v2?: Record<string, unknown> | null;
  comparative_v1?: ComparativeRaw | null;
  controlled_narrative_v1?: ControlledNarrativeRaw | null;
  cultural_calibration_v1?: CulturalCalibrationRaw | null;
  working_life_v1?: MbtiWorkingLifeRaw | null;
  public_surface_v1?: PublicSurfaceRaw | null;
  seo_surface_v1?: SeoSurfaceRaw | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
  insight_graph_v1?: InsightGraphRaw | null;
  embed_surface_v1?: EmbedSurfaceRaw | null;
  widget_surface_v1?: WidgetSurfaceRaw | null;
  partner_read_v1?: PartnerReadRaw | null;
  [key: string]: unknown;
};

export type AttemptShareResponse = {
  ok?: boolean;
  share_id?: string;
  share_url?: string;
  shareId?: string;
  shareUrl?: string;
  id?: string;
  url?: string;
  [key: string]: unknown;
};

export type AttributionUtm = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
};

export type AttemptAttributionPayload = {
  share_id?: string;
  compare_invite_id?: string;
  invite_unlock_code?: string;
  share_click_id?: string;
  entrypoint?: string;
  referrer?: string;
  landing_path?: string;
  utm?: AttributionUtm;
};

export type ShareClickMeta = {
  entrypoint?: string;
  landing_path?: string;
  referrer?: string;
  compare_intent?: boolean;
  utm?: AttributionUtm;
};

export type ShareClickResponse = {
  ok?: boolean;
  id?: string;
  share_id?: string;
  recorded_at?: string;
  message?: string;
  [key: string]: unknown;
};

export type EnneagramObservationTask = {
  day?: number | null;
  phase?: string | null;
  prompt?: string | null;
  user_input_schema?: Record<string, unknown> | null;
  analytics_event_key?: string | null;
  event_key?: string | null;
  suggested_next_action?: string | null;
  [key: string]: unknown;
};

export type EnneagramObservationStateV1 = {
  version: "enneagram_observation_state.v1";
  attempt_id: string;
  scale_code: "ENNEAGRAM";
  form_code?: string | null;
  interpretation_context_id?: string | null;
  status: string;
  interpretation_scope?: "clear" | "close_call" | "diffuse" | "low_quality" | string | null;
  close_call_pair?: Record<string, unknown> | null;
  tasks: EnneagramObservationTask[];
  day3_observation_feedback?: Record<string, unknown> | null;
  day7_resonance_feedback?: Record<string, unknown> | null;
  user_confirmed_type?: string | null;
  user_disagreed_reason?: string | null;
  resonance_score?: number | null;
  observation_completion_rate?: number | null;
  suggested_next_action?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type EnneagramObservationResponse = {
  ok?: boolean;
  observation_state_v1?: EnneagramObservationStateV1 | null;
  [key: string]: unknown;
};

export type EnneagramObservationDay3Payload = {
  more_like: "top1" | "top2" | "unclear" | "other";
  evidence_sentence: string;
  confidence_self_rating: number;
  scene_type: "work" | "relationship" | "pressure" | "alone" | "other";
};

export type EnneagramObservationDay7Payload = {
  final_resonance: "top1" | "top2" | "top3" | "other" | "still_uncertain";
  user_confirmed_type?: string | null;
  wants_fc144: boolean;
  wants_retake_same_form: boolean;
  user_disagreed_reason?: string | null;
};

export type ScaleTechnicalNoteSection = {
  section_key: string;
  title?: string;
  body?: string;
  data_status?: "currently_operational" | "collecting_data" | "pending_sample" | "unavailable" | "not_claimed" | string;
  metric_refs?: string[];
  [key: string]: unknown;
};

export type ScaleMethodBoundary = {
  label?: string;
  copy?: string;
  evidence_level?: string;
  content_maturity?: string;
  [key: string]: unknown;
};

export type ScaleMetricDefinition = {
  metric_key: string;
  label?: string;
  description?: string;
  data_status?: "currently_operational" | "collecting_data" | "pending_sample" | "unavailable" | "not_claimed" | string;
  data_status_source?: string;
  minimum_sample_guidance?: string;
  privacy_notes?: string;
  technical_note_visible?: boolean;
  [key: string]: unknown;
};

export type ScaleTechnicalNoteDisclaimer = {
  key?: string;
  label?: string;
  copy?: string;
  [key: string]: unknown;
};

export type ScaleTechnicalNoteV1 = {
  schema_version: string;
  scale_code: "ENNEAGRAM" | "RIASEC" | string;
  registry_version?: string;
  registry_release_hash?: string;
  technical_note_version?: string;
  sections: ScaleTechnicalNoteSection[];
  method_boundaries?: Record<string, ScaleMethodBoundary | Record<string, unknown>>;
  metric_definitions?: ScaleMetricDefinition[];
  data_status_summary?: Record<string, unknown>;
  disclaimers?: Array<ScaleTechnicalNoteDisclaimer | string>;
  generated_at?: string;
  [key: string]: unknown;
};

export type ScaleTechnicalNoteResponse = {
  ok?: boolean;
  scale_code?: "ENNEAGRAM" | "RIASEC" | string;
  technical_note_v1?: ScaleTechnicalNoteV1 | null;
  [key: string]: unknown;
};

export type EnneagramTechnicalNoteSection = ScaleTechnicalNoteSection;
export type EnneagramMethodBoundary = ScaleMethodBoundary;
export type EnneagramMetricDefinition = ScaleMetricDefinition;
export type EnneagramTechnicalNoteDisclaimer = ScaleTechnicalNoteDisclaimer;
export type EnneagramTechnicalNoteV1 = ScaleTechnicalNoteV1 & {
  schema_version: "enneagram.technical_note.v1";
  scale_code: "ENNEAGRAM";
};
export type EnneagramTechnicalNoteResponse = ScaleTechnicalNoteResponse & {
  scale_code?: "ENNEAGRAM" | string;
  technical_note_v1?: EnneagramTechnicalNoteV1 | null;
};

export type RiasecTechnicalNoteV1 = ScaleTechnicalNoteV1 & {
  schema_version: "riasec.technical_note.v1";
  scale_code: "RIASEC";
};
export type RiasecTechnicalNoteResponse = ScaleTechnicalNoteResponse & {
  scale_code?: "RIASEC" | string;
  technical_note_v1?: RiasecTechnicalNoteV1 | null;
};

export type MbtiCompareInviteCreateResponse = {
  ok?: boolean;
  invite_id?: string;
  share_id?: string;
  scale_code?: string;
  locale?: string;
  status?: string;
  take_path?: string;
  compare_path?: string;
  inviter?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type MbtiCompareInviteResponse = {
  ok?: boolean;
  invite_id?: string;
  share_id?: string;
  scale_code?: string;
  locale?: string;
  status?: "pending" | "ready" | "purchased" | string;
  inviter?: MbtiCompareParticipantRaw | null;
  invitee?: MbtiCompareParticipantRaw | null;
  compare?: MbtiCompareSummaryRaw | null;
  relationship_sync_v1?: RelationshipSyncRaw | null;
  dyadic_graph_v1?: DyadicGraphRaw | null;
  primary_cta_label?: string;
  primary_cta_path?: string;
  [key: string]: unknown;
};

export type PrivateMbtiRelationshipResponse = {
  ok?: boolean;
  invite_id?: string;
  share_id?: string;
  scale_code?: string;
  locale?: string;
  status?: "pending" | "ready" | "purchased" | string;
  private_relationship_v1?: PrivateRelationshipRaw | null;
  dyadic_consent_v1?: DyadicConsentRaw | null;
  private_relationship_journey_v1?: PrivateRelationshipJourneyRaw | null;
  dyadic_pulse_check_v1?: DyadicPulseCheckRaw | null;
  dyadic_graph_v1?: DyadicGraphRaw | null;
  [key: string]: unknown;
};

export type MbtiRelationshipIndexResponse = {
  ok?: boolean;
  scale_code?: string;
  relationship_index_v1?: RelationshipIndexRaw | null;
  [key: string]: unknown;
};

export type OrderDeliveryState = {
  contact_email_present?: boolean;
  last_delivery_email_sent_at?: string | null;
  can_request_claim_email?: boolean;
  can_view_report?: boolean;
  report_url?: string | null;
  can_download_pdf?: boolean;
  report_pdf_url?: string | null;
  can_resend?: boolean;
  [key: string]: unknown;
};

export type OrderLookupResponse = {
  ok?: boolean;
  order_no?: string;
  status?: "pending" | "paid" | "failed" | "canceled" | "refunded" | string;
  provider?: string;
  payment_recovery_token?: string | null;
  wait_url?: string | null;
  result_url?: string | null;
  checkout_url?: string | null;
  pay?: {
    type?: "qr" | "redirect" | "html" | string;
    value?: string;
    provider?: string;
    [key: string]: unknown;
  } | null;
  delivery?: OrderDeliveryState | null;
  mbti_form_v1?: MbtiFormSummaryV1Raw | null;
  big5_form_v1?: Big5FormSummaryV1Raw | null;
  mbti_access_hub_v1?: MbtiAccessHubV1Raw | null;
  [key: string]: unknown;
};

export type PublicFormSummaryV1Raw = {
  form_code?: string;
  label?: string;
  short_label?: string;
  question_count?: number;
  estimated_minutes?: number;
  scale_code?: string;
  [key: string]: unknown;
};

export type MbtiFormSummaryV1Raw = PublicFormSummaryV1Raw;
export type Big5FormSummaryV1Raw = PublicFormSummaryV1Raw;
export type EnneagramFormSummaryV1Raw = PublicFormSummaryV1Raw;
export type RiasecFormSummaryV1Raw = PublicFormSummaryV1Raw;

export type OrderResendResponse = {
  ok?: boolean;
  message?: string;
  [key: string]: unknown;
};

export type EmailSubscriberStatus = "active" | "unsubscribed" | "suppressed";

export type EmailCaptureResponse = {
  ok: boolean;
  subscriber_status: EmailSubscriberStatus;
  captured_at: string | null;
  marketing_consent: boolean;
  transactional_recovery_enabled: boolean;
  message?: string;
};

export type ClaimReportEmailResponse = {
  ok?: boolean;
  message?: string;
  [key: string]: unknown;
};

export type AttemptEmailBindResponse = {
  ok: boolean;
  attempt_id?: string;
  status?: "active" | "pending" | "verified" | string;
  binding_id?: string;
  result_url?: string;
  message?: string;
  [key: string]: unknown;
};

export type ResultEmailLookupItem = {
  attempt_id?: string;
  result_id?: string;
  scale_code?: string;
  scale_code_legacy?: string;
  scale_code_v2?: string;
  scale_uid?: string | null;
  scale_version?: string;
  type_code?: string;
  submitted_at?: string | null;
  computed_at?: string | null;
  bound_at?: string | null;
  result_url?: string | null;
  result_access_token?: string;
  result_access_token_expires_at?: string | null;
  [key: string]: unknown;
};

export type ResultEmailLookupResponse = {
  ok: boolean;
  items: ResultEmailLookupItem[];
  email_verification_required?: boolean;
  [key: string]: unknown;
};

export type ScaleLookupResponse = {
  ok?: boolean;
  slug?: string;
  scale_code?: string;
  pack_id?: string | null;
  dir_version?: string | null;
  content_package_version?: string | null;
  manifest_hash?: string | null;
  norms_version?: string | null;
  quality_level?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  is_indexable?: boolean;
  content_i18n_json?: Record<string, unknown> | null;
  report_summary_i18n_json?: Record<string, unknown> | null;
  capabilities?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type ScaleSitemapItem = {
  slug: string;
  lastmod?: string;
  is_indexable?: boolean;
};

export type ScaleSitemapSourceResponse = {
  ok?: boolean;
  locale?: string;
  items?: ScaleSitemapItem[];
  [key: string]: unknown;
};

export type BootResponse = {
  ok?: boolean;
  org_id?: number;
  anon_id?: string;
  flags?: Record<string, unknown>;
  experiments?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type MeAttemptItem = {
  attempt_id: string;
  scale_code?: string;
  submitted_at?: string | null;
  type_code?: string;
  mbti_form_v1?: MbtiFormSummaryV1Raw | null;
  big5_form_v1?: Big5FormSummaryV1Raw | null;
  enneagram_form_v1?: EnneagramFormSummaryV1Raw | null;
  riasec_form_v1?: RiasecFormSummaryV1Raw | null;
  access_summary?: {
    access_state?: string;
    report_state?: string;
    pdf_state?: string;
    unlock_stage?: "locked" | "partial" | "full" | string | null;
    unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
    reason_code?: string | null;
    access_level?: string | null;
    variant?: string | null;
    modules_allowed?: string[];
    modules_preview?: string[];
    invite_unlock_v1?: InviteUnlockSummaryRaw | null;
    actions?: {
      page_href?: string | null;
      pdf_href?: string | null;
      wait_href?: string | null;
      history_href?: string | null;
      lookup_href?: string | null;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  result_summary?: {
    domains_mean?: Record<string, number>;
  };
  top_facets_summary_v1?: {
    items?: Array<{
      key?: string;
      label?: string;
      domain?: string;
      percentile?: number | null;
      bucket?: string | null;
      kind?: string | null;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  quality_summary?: {
    level?: string;
    grade?: string | null;
    [key: string]: unknown;
  };
  norms_summary?: {
    status?: string;
    norms_version?: string | null;
    [key: string]: unknown;
  };
  offer_summary?: {
    primary_offer?: OfferPayload | null;
    [key: string]: unknown;
  };
  share_summary?: {
    enabled?: boolean;
    share_kind?: string;
    [key: string]: unknown;
  };
  compare_policy_v1?: {
    form_code?: string | null;
    form_label?: string | null;
    score_space_version?: string | null;
    compare_compatibility_group?: string | null;
    cross_form_comparable?: boolean | null;
    can_compare?: boolean | null;
    reason?: string | null;
    copy_key?: string | null;
    [key: string]: unknown;
  } | null;
  classification_summary_v1?: {
    interpretation_scope?: string | null;
    interpretation_reason?: string | null;
    confidence_level?: string | null;
    confidence_label?: string | null;
    close_call_pair?: Record<string, unknown> | null;
    interpretation_context_id?: string | null;
    content_release_hash?: string | null;
    content_snapshot_status?: string | null;
    [key: string]: unknown;
  } | null;
  observation_state_v1?: EnneagramObservationStateV1 | null;
  observation_status?: string | null;
  observation_completion_rate?: number | null;
  user_confirmed_type?: string | null;
  suggested_next_action?: string | null;
  day7_submitted?: boolean | null;
  [key: string]: unknown;
};

export type MeAttemptsHistoryCompare = {
  scale_code?: string;
  current_attempt_id?: string;
  previous_attempt_id?: string;
  current_domains_mean?: Record<string, number>;
  previous_domains_mean?: Record<string, number>;
  domains_delta?: Record<
    string,
    {
      delta?: number;
      direction?: "up" | "down" | "flat" | string;
    }
  >;
  compare_guard_v1?: {
    scale_code?: string;
    can_compare?: boolean;
    reason?: string | null;
    copy_key?: string | null;
    attempt_a?: Record<string, unknown> | null;
    attempt_b?: Record<string, unknown> | null;
    [key: string]: unknown;
  } | null;
  current_compare_policy_v1?: Record<string, unknown> | null;
  previous_compare_policy_v1?: Record<string, unknown> | null;
  current_observation_state_v1?: EnneagramObservationStateV1 | null;
  previous_observation_state_v1?: EnneagramObservationStateV1 | null;
  [key: string]: unknown;
};

export type AttemptReportPdfResponse = {
  blob: Blob;
  filenameHint: string | null;
  formLabel: string | null;
};

export type MeAttemptsResponse = {
  ok?: boolean;
  user_id?: string;
  anon_id?: string;
  scale_code?: string | null;
  items?: MeAttemptItem[];
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
  history_compare?: MeAttemptsHistoryCompare | null;
  [key: string]: unknown;
};

export type LinkAnonAttemptsResponse = {
  ok?: boolean;
  linked_attempt_ids?: string[];
  skipped_attempt_ids?: string[];
  [key: string]: unknown;
};

const LINK_ANON_SESSION_DEDUP_KEY = "fm_link_anon_dedup_v1";
const LINK_ANON_UNSUPPORTED_KEY = "fm_link_anon_unsupported_v1";
const LINK_ANON_UNSUPPORTED_TTL_MS = 24 * 60 * 60 * 1000;

type LinkAnonDedupEntry = {
  status: "inflight" | "done";
  updatedAt: number;
};

function canUseWebStorage(): boolean {
  return typeof window !== "undefined";
}

function normalizeLinkAnonAttemptIds(attemptIds: string[]): string[] {
  return Array.from(
    new Set(
      attemptIds
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
  ).sort((left, right) => left.localeCompare(right));
}

function readSessionLinkAnonDedupMap(): Record<string, LinkAnonDedupEntry> {
  if (!canUseWebStorage()) return {};

  try {
    const raw = window.sessionStorage.getItem(LINK_ANON_SESSION_DEDUP_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, LinkAnonDedupEntry>>(
      (acc, [key, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return acc;
        }

        const entry = value as Record<string, unknown>;
        const status = entry.status === "inflight" || entry.status === "done" ? entry.status : null;
        const updatedAt = typeof entry.updatedAt === "number" && Number.isFinite(entry.updatedAt)
          ? entry.updatedAt
          : null;

        if (!status || updatedAt === null) {
          return acc;
        }

        acc[key] = {
          status,
          updatedAt,
        };
        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

function writeSessionLinkAnonDedupMap(entries: Record<string, LinkAnonDedupEntry>): void {
  if (!canUseWebStorage()) return;

  try {
    window.sessionStorage.setItem(LINK_ANON_SESSION_DEDUP_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage failures.
  }
}

function setSessionLinkAnonDedupEntry(key: string, entry: LinkAnonDedupEntry): void {
  if (!canUseWebStorage()) return;
  const current = readSessionLinkAnonDedupMap();
  current[key] = entry;
  writeSessionLinkAnonDedupMap(current);
}

function removeSessionLinkAnonDedupEntry(key: string): void {
  if (!canUseWebStorage()) return;
  const current = readSessionLinkAnonDedupMap();
  if (!(key in current)) return;
  delete current[key];
  writeSessionLinkAnonDedupMap(current);
}

function readLinkAnonUnsupportedUntil(): number | null {
  if (!canUseWebStorage()) return null;

  try {
    const raw = window.localStorage.getItem(LINK_ANON_UNSUPPORTED_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const until = (parsed as Record<string, unknown>).until;
    if (typeof until !== "number" || !Number.isFinite(until) || until <= 0) {
      return null;
    }

    return until;
  } catch {
    return null;
  }
}

function isLinkAnonUnsupportedActive(now: number = Date.now()): boolean {
  const until = readLinkAnonUnsupportedUntil();
  if (!until) return false;

  if (until <= now) {
    if (canUseWebStorage()) {
      try {
        window.localStorage.removeItem(LINK_ANON_UNSUPPORTED_KEY);
      } catch {
        // Ignore storage failures.
      }
    }
    return false;
  }

  return true;
}

function markLinkAnonUnsupported(now: number = Date.now()): void {
  if (!canUseWebStorage()) return;

  try {
    window.localStorage.setItem(
      LINK_ANON_UNSUPPORTED_KEY,
      JSON.stringify({
        until: now + LINK_ANON_UNSUPPORTED_TTL_MS,
      })
    );
  } catch {
    // Ignore storage failures.
  }
}

function buildLinkAnonDedupKey({
  authToken,
  anonId,
  attemptIds,
}: {
  authToken: string;
  anonId: string;
  attemptIds: string[];
}): string {
  return JSON.stringify([
    authToken.trim(),
    anonId.trim(),
    normalizeLinkAnonAttemptIds(attemptIds),
  ]);
}

export function shouldLinkAnonAttemptsOnLoginSuccess({
  authToken,
  anonId,
  attemptIds,
}: {
  authToken: string;
  anonId: string;
  attemptIds: string[];
}): boolean {
  const normalizedToken = authToken.trim();
  const normalizedAnonId = anonId.trim();
  const normalizedAttemptIds = normalizeLinkAnonAttemptIds(attemptIds);

  if (!normalizedToken.startsWith("fm_")) return false;
  if (!normalizedAnonId || normalizedAttemptIds.length === 0) return false;
  if (isLinkAnonUnsupportedActive()) return false;
  if (!canUseWebStorage()) return true;

  const key = buildLinkAnonDedupKey({
    authToken: normalizedToken,
    anonId: normalizedAnonId,
    attemptIds: normalizedAttemptIds,
  });

  return !(key in readSessionLinkAnonDedupMap());
}

export async function linkAnonAttemptsOnceOnLoginSuccess({
  authToken,
  anonId,
  attemptIds,
}: {
  authToken: string;
  anonId: string;
  attemptIds: string[];
}): Promise<void> {
  const normalizedToken = authToken.trim();
  const normalizedAnonId = anonId.trim();
  const normalizedAttemptIds = normalizeLinkAnonAttemptIds(attemptIds);

  if (!normalizedToken.startsWith("fm_")) return;
  if (!normalizedAnonId || normalizedAttemptIds.length === 0) return;
  if (isLinkAnonUnsupportedActive()) return;

  const dedupKey = buildLinkAnonDedupKey({
    authToken: normalizedToken,
    anonId: normalizedAnonId,
    attemptIds: normalizedAttemptIds,
  });

  if (canUseWebStorage()) {
    const dedupEntries = readSessionLinkAnonDedupMap();
    if (dedupKey in dedupEntries) return;
    setSessionLinkAnonDedupEntry(dedupKey, {
      status: "inflight",
      updatedAt: Date.now(),
    });
  }

  try {
    await linkAnonAttempts({
      anonId: normalizedAnonId,
      attemptIds: normalizedAttemptIds,
      authToken: normalizedToken,
    });

    removePendingAnonLinkAttempts(normalizedAttemptIds);
    setSessionLinkAnonDedupEntry(dedupKey, {
      status: "done",
      updatedAt: Date.now(),
    });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 501)) {
      markLinkAnonUnsupported();
      setSessionLinkAnonDedupEntry(dedupKey, {
        status: "done",
        updatedAt: Date.now(),
      });
      return;
    }

    removeSessionLinkAnonDedupEntry(dedupKey);
    throw error;
  }
}

function anonHeader(anonId?: string, extraHeaders?: Record<string, string>) {
  const resolvedAnonId = resolveAnonId(anonId);
  const headers: Record<string, string> = {
    ...(extraHeaders ?? {}),
  };

  if (resolvedAnonId) {
    headers["X-Anon-Id"] = resolvedAnonId;
  }

  if (Object.keys(headers).length === 0) {
    return {};
  }

  return { headers };
}

function explicitAnonHeader(anonId: string | undefined, extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    ...(extraHeaders ?? {}),
  };

  if (anonId) {
    headers["X-Anon-Id"] = anonId;
  }

  if (Object.keys(headers).length === 0) {
    return {};
  }

  return { headers };
}

function normalizeResultAccessToken(accessToken?: string | null): string {
  const normalized = typeof accessToken === "string" ? accessToken.trim() : "";

  return normalized;
}

function resultAccessTokenHeader(accessToken?: string | null): Record<string, string> {
  const normalized = normalizeResultAccessToken(accessToken);

  return normalized ? { "X-Result-Access-Token": normalized } : {};
}

function resolveAnonId(anonId?: string): string | undefined {
  if (anonId && anonId.trim().length > 0) {
    return anonId.trim();
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  const resolved = getOrCreateAnonId();
  return resolved.trim().length > 0 ? resolved : undefined;
}

function assertApiOk<T extends { ok?: boolean }>(response: T, fallbackMessage: string): T {
  if (response.ok === false) {
    throw new Error(fallbackMessage);
  }
  return response;
}

function isScaleCodeFallbackError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (error.status !== 404 && error.status !== 422) {
    return false;
  }

  const normalizedCode = String(error.errorCode ?? "")
    .trim()
    .toUpperCase();

  if (["NOT_FOUND", "SCALE_NOT_FOUND", "VALIDATION_ERROR", "HTTP_404", "HTTP_422"].includes(normalizedCode)) {
    return true;
  }

  return /scale/i.test(error.message);
}

async function runWithScaleCodeCandidates<T>(
  scaleCode: string,
  runner: (resolvedScaleCode: string) => Promise<T>
): Promise<T> {
  const candidates = buildRequestScaleCodeCandidates(scaleCode);
  if (candidates.length === 0) {
    throw new Error("Scale code is required.");
  }

  let lastError: unknown = null;
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    try {
      return await runner(candidate);
    } catch (error) {
      lastError = error;
      const hasNextCandidate = index < candidates.length - 1;
      if (!hasNextCandidate || !isScaleCodeFallbackError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Scale code resolution failed.");
}

function normalizeOrderStatus(
  status: string | undefined
): "pending" | "paid" | "failed" | "canceled" | "refunded" {
  if (!status) return "pending";
  const lower = status.toLowerCase();
  if (lower === "paid" || lower === "success" || lower === "completed" || lower === "fulfilled") {
    return "paid";
  }
  if (lower === "failed" || lower === "error") {
    return "failed";
  }
  if (lower === "canceled" || lower === "cancelled") return "canceled";
  if (lower === "refunded") return "refunded";
  return "pending";
}

function normalizeSubmitAnswers(answers: SubmitAnswer[]): SubmitAnswer[] {
  return answers.map((answer) => {
    const codeCandidate = answer.code ?? answer.option_code ?? answer.value ?? "";
    const normalizedCode = typeof codeCandidate === "number" ? String(codeCandidate) : String(codeCandidate ?? "");

    return {
      question_id: answer.question_id,
      code: normalizedCode,
      ...(typeof answer.question_index === "number" ? { question_index: answer.question_index } : {}),
      ...(answer.question_type ? { question_type: answer.question_type } : {}),
      ...(answer.answer && typeof answer.answer === "object" ? { answer: answer.answer } : {}),
    };
  });
}

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeAttributionUtm(utm?: AttributionUtm): AttributionUtm | undefined {
  if (!utm) {
    return undefined;
  }

  const normalized = {
    source: normalizeOptionalString(utm.source ?? undefined) ?? null,
    medium: normalizeOptionalString(utm.medium ?? undefined) ?? null,
    campaign: normalizeOptionalString(utm.campaign ?? undefined) ?? null,
    term: normalizeOptionalString(utm.term ?? undefined) ?? null,
    content: normalizeOptionalString(utm.content ?? undefined) ?? null,
  };

  return Object.values(normalized).some((value) => value !== null) ? normalized : undefined;
}

function normalizeAttemptAttributionPayload(
  attribution?: AttemptAttributionPayload
): AttemptAttributionPayload | undefined {
  if (!attribution) {
    return undefined;
  }

  const normalized = {
    share_id: normalizeOptionalString(attribution.share_id),
    compare_invite_id: normalizeOptionalString(attribution.compare_invite_id),
    invite_unlock_code: normalizeOptionalString(attribution.invite_unlock_code),
    share_click_id: normalizeOptionalString(attribution.share_click_id),
    entrypoint: normalizeOptionalString(attribution.entrypoint),
    referrer: normalizeOptionalString(attribution.referrer),
    landing_path: normalizeOptionalString(attribution.landing_path),
    utm: normalizeAttributionUtm(attribution.utm),
  };

  return Object.values(normalized).some((value) => value !== undefined) ? normalized : undefined;
}

function normalizeShareClickMeta(meta?: ShareClickMeta): ShareClickMeta | undefined {
  if (!meta) {
    return undefined;
  }

  const normalized = {
    entrypoint: normalizeOptionalString(meta.entrypoint),
    landing_path: normalizeOptionalString(meta.landing_path),
    referrer: normalizeOptionalString(meta.referrer),
    compare_intent: typeof meta.compare_intent === "boolean" ? meta.compare_intent : undefined,
    utm: normalizeAttributionUtm(meta.utm),
  };

  return Object.values(normalized).some((value) => value !== undefined) ? normalized : undefined;
}

export async function startAttempt({
  scaleCode,
  formCode,
  anonId,
  region,
  locale,
  consent,
  meta,
  clientPlatform,
  clientVersion,
  channel,
  referrer,
  share_id,
  compare_invite_id,
  invite_unlock_code,
  share_click_id,
  entrypoint,
  landing_path,
  utm,
}: {
  scaleCode: string;
  formCode?: string;
  anonId?: string;
  region?: string;
  locale?: string;
  consent?: {
    accepted: boolean;
    version: string;
    locale?: string;
  };
  meta?: Record<string, unknown>;
  clientPlatform?: string;
  clientVersion?: string;
  channel?: string;
  referrer?: string;
  share_id?: string;
  compare_invite_id?: string;
  invite_unlock_code?: string;
  share_click_id?: string;
  entrypoint?: string;
  landing_path?: string;
  utm?: AttributionUtm;
}): Promise<StartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const attribution = normalizeAttemptAttributionPayload({
    share_id,
    compare_invite_id,
    invite_unlock_code,
    share_click_id,
    entrypoint,
    referrer,
    landing_path,
    utm,
  });
  const response = await runWithScaleCodeCandidates(scaleCode, (resolvedScaleCode) =>
    apiClient.post<StartAttemptResponse>(
      "/v0.3/attempts/start",
      {
        scale_code: resolvedScaleCode,
        ...(formCode ? { form_code: formCode } : {}),
        anon_id: resolvedAnonId,
        ...(region ? { region } : {}),
        ...(locale ? { locale } : {}),
        ...(consent
          ? {
              consent: {
                accepted: Boolean(consent.accepted),
                version: consent.version,
                ...(consent.locale ? { locale: consent.locale } : {}),
              },
            }
          : {}),
        ...(clientPlatform ? { client_platform: clientPlatform } : {}),
        ...(clientVersion ? { client_version: clientVersion } : {}),
        ...(channel ? { channel } : {}),
        ...(meta ? { meta } : {}),
        ...(attribution ?? {}),
      },
      anonHeader(resolvedAnonId)
    )
  );

  return assertApiOk(response, "Failed to start attempt.");
}

export async function fetchScaleQuestions({
  scaleCode,
  formCode,
  anonId,
  locale,
  region,
}: {
  scaleCode: string;
  formCode?: string;
  anonId?: string;
  locale?: string;
  region?: string;
}): Promise<QuestionsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const query = new URLSearchParams();
  if (formCode) query.set("form_code", formCode);
  if (locale) query.set("locale", locale);
  if (region) query.set("region", region);

  const suffix = query.toString();
  const response = await runWithScaleCodeCandidates(scaleCode, (resolvedScaleCode) =>
    apiClient.get<QuestionsResponse>(
      `/v0.3/scales/${resolvedScaleCode}/questions${suffix ? `?${suffix}` : ""}`,
      anonHeader(resolvedAnonId)
    )
  );

  assertApiOk(response, "Failed to load questions.");

  const items = Array.isArray(response.questions?.items) ? response.questions.items : [];
  const options =
    response.options && typeof response.options === "object"
      ? {
          ...response.options,
          format: Array.isArray(response.options.format) ? response.options.format : undefined,
        }
      : undefined;

  return {
    ...response,
    questions: {
      schema: response.questions?.schema,
      items,
    },
    options,
    meta: response.meta && typeof response.meta === "object" ? response.meta : undefined,
  };
}

export async function submitAttempt({
  attemptId,
  anonId,
  answers,
  durationMs,
  consent,
  share_id,
  compare_invite_id,
  invite_unlock_code,
  share_click_id,
  entrypoint,
  referrer,
  landing_path,
  utm,
}: {
  attemptId: string;
  anonId?: string;
  answers: SubmitAnswer[];
  durationMs: number;
  consent?: {
    accepted: boolean;
    version: string;
    locale?: string;
  };
  share_id?: string;
  compare_invite_id?: string;
  invite_unlock_code?: string;
  share_click_id?: string;
  entrypoint?: string;
  referrer?: string;
  landing_path?: string;
  utm?: AttributionUtm;
}): Promise<SubmitResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const attribution = normalizeAttemptAttributionPayload({
    share_id,
    compare_invite_id,
    invite_unlock_code,
    share_click_id,
    entrypoint,
    referrer,
    landing_path,
    utm,
  });
  const response = await apiClient.post<SubmitResponse>(
    "/v0.3/attempts/submit",
    {
      attempt_id: attemptId,
      answers: normalizeSubmitAnswers(answers),
      duration_ms: durationMs,
      ...(consent
        ? {
            consent: {
              accepted: Boolean(consent.accepted),
              version: consent.version,
              ...(consent.locale ? { locale: consent.locale } : {}),
            },
          }
        : {}),
      ...(attribution ?? {}),
    },
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Submit failed.");
}

export async function fetchAttemptResult({
  attemptId,
  anonId,
  locale,
  accessToken,
}: {
  attemptId: string;
  anonId: string;
  locale?: string;
  accessToken?: string | null;
}): Promise<ResultResponse> {
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const normalizedAccessToken = normalizeResultAccessToken(accessToken);
  if (normalizedAccessToken) params.set("access_token", normalizedAccessToken);
  const response = await apiClient.get<ResultResponse>(
    `/v0.3/attempts/${attemptId}/result${params.size > 0 ? `?${params.toString()}` : ""}`,
    anonHeader(anonId, resultAccessTokenHeader(normalizedAccessToken))
  );

  return assertApiOk(response, "Failed to load result.");
}

export async function fetchAttemptSubmission({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId?: string;
}): Promise<AttemptSubmissionResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<AttemptSubmissionResponse>(
    `/v0.3/attempts/${attemptId}/submission`,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to load submission.");
}

export async function getAttemptReport({
  attemptId,
  anonId,
  refresh,
  locale,
  skipAuth,
  includeAnonId = true,
  accessToken,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
  locale?: string;
  skipAuth?: boolean;
  includeAnonId?: boolean;
  accessToken?: string | null;
}): Promise<ReportResponse> {
  const resolvedAnonId = includeAnonId ? resolveAnonId(anonId) : undefined;
  const params = new URLSearchParams();
  if (refresh) params.set("refresh", "1");
  if (locale) params.set("locale", locale);
  const normalizedAccessToken = normalizeResultAccessToken(accessToken);
  if (normalizedAccessToken) params.set("access_token", normalizedAccessToken);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await apiClient.get<ReportResponse>(
    `/v0.3/attempts/${attemptId}/report${suffix}`,
    {
      ...explicitAnonHeader(resolvedAnonId, resultAccessTokenHeader(normalizedAccessToken)),
      ...(skipAuth ? { skipAuth: true } : {}),
    }
  );

  return assertApiOk(response, "Failed to load report.");
}

export async function fetchAttemptReport({
  attemptId,
  anonId,
  refresh,
  locale,
  skipAuth,
  includeAnonId = true,
  accessToken,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
  locale?: string;
  skipAuth?: boolean;
  includeAnonId?: boolean;
  accessToken?: string | null;
}): Promise<ReportResponse> {
  return getAttemptReport({ attemptId, anonId, refresh, locale, skipAuth, includeAnonId, accessToken });
}

export async function fetchEnneagramObservation({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId?: string;
}): Promise<EnneagramObservationResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<EnneagramObservationResponse>(
    `/v0.3/attempts/${attemptId}/enneagram/observation`,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to load Enneagram observation.");
}

export async function assignEnneagramObservation({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId?: string;
}): Promise<EnneagramObservationResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.post<EnneagramObservationResponse>(
    `/v0.3/attempts/${attemptId}/enneagram/observation/assign`,
    {},
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to start Enneagram observation.");
}

export async function submitEnneagramObservationDay3({
  attemptId,
  payload,
  anonId,
}: {
  attemptId: string;
  payload: EnneagramObservationDay3Payload;
  anonId?: string;
}): Promise<EnneagramObservationResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.post<EnneagramObservationResponse>(
    `/v0.3/attempts/${attemptId}/enneagram/observation/day3`,
    payload,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to submit Day 3 observation feedback.");
}

export async function submitEnneagramObservationDay7({
  attemptId,
  payload,
  anonId,
}: {
  attemptId: string;
  payload: EnneagramObservationDay7Payload;
  anonId?: string;
}): Promise<EnneagramObservationResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.post<EnneagramObservationResponse>(
    `/v0.3/attempts/${attemptId}/enneagram/observation/day7`,
    payload,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to submit Day 7 resonance feedback.");
}

export async function fetchEnneagramTechnicalNote(): Promise<EnneagramTechnicalNoteResponse> {
  const response = await apiClient.get<EnneagramTechnicalNoteResponse>("/v0.3/scales/ENNEAGRAM/technical-note", {
    skipAuth: true,
  });

  return assertApiOk(response, "Failed to load Enneagram Technical Note.");
}

export async function fetchRiasecTechnicalNote(): Promise<RiasecTechnicalNoteResponse> {
  const response = await apiClient.get<RiasecTechnicalNoteResponse>("/v0.3/scales/RIASEC/technical-note", {
    skipAuth: true,
  });

  return assertApiOk(response, "Failed to load RIASEC Technical Note.");
}

export async function fetchAttemptReportAccess({
  attemptId,
  anonId,
  locale,
  skipAuth,
  includeAnonId = true,
  accessToken,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
  skipAuth?: boolean;
  includeAnonId?: boolean;
  accessToken?: string | null;
}): Promise<AttemptReportAccessResponse> {
  const resolvedAnonId = includeAnonId ? resolveAnonId(anonId) : undefined;
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const normalizedAccessToken = normalizeResultAccessToken(accessToken);
  if (normalizedAccessToken) params.set("access_token", normalizedAccessToken);
  const response = await apiClient.get<AttemptReportAccessResponse>(
    `/v0.3/attempts/${attemptId}/report-access${params.size > 0 ? `?${params.toString()}` : ""}`,
    {
      ...explicitAnonHeader(resolvedAnonId, resultAccessTokenHeader(normalizedAccessToken)),
      ...(skipAuth ? { skipAuth: true } : {}),
    }
  );

  return assertApiOk(response, "Failed to load report access.");
}

export async function fetchAttemptInviteUnlockProgress({
  attemptId,
  anonId,
  locale,
  skipAuth,
  includeAnonId = true,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
  skipAuth?: boolean;
  includeAnonId?: boolean;
}): Promise<AttemptInviteUnlockProgressResponse> {
  const resolvedAnonId = includeAnonId ? resolveAnonId(anonId) : undefined;
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const response = await apiClient.get<AttemptInviteUnlockProgressResponse>(
    `/v0.3/attempts/${attemptId}/invite-unlocks${params.size > 0 ? `?${params.toString()}` : ""}`,
    {
      ...anonHeader(resolvedAnonId),
      ...(skipAuth ? { skipAuth: true } : {}),
    }
  );

  return assertApiOk(response, "Failed to load invite unlock progress.");
}

export async function createAttemptInviteUnlock({
  attemptId,
  anonId,
  locale,
  skipAuth,
  includeAnonId = true,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
  skipAuth?: boolean;
  includeAnonId?: boolean;
}): Promise<AttemptInviteUnlockProgressResponse> {
  const resolvedAnonId = includeAnonId ? resolveAnonId(anonId) : undefined;
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const response = await apiClient.post<AttemptInviteUnlockProgressResponse>(
    `/v0.3/attempts/${attemptId}/invite-unlocks${params.size > 0 ? `?${params.toString()}` : ""}`,
    {},
    {
      ...anonHeader(resolvedAnonId),
      ...(skipAuth ? { skipAuth: true } : {}),
    }
  );

  return assertApiOk(response, "Failed to create invite unlock.");
}

export function getAttemptReportPdfUrl({
  attemptId,
  inline,
}: {
  attemptId: string;
  inline?: boolean;
}): string {
  return buildApiUrl(`/v0.3/attempts/${attemptId}/report.pdf${inline ? "?inline=1" : ""}`);
}

export async function fetchAttemptReportPdf({
  attemptId,
  anonId,
  inline,
}: {
  attemptId: string;
  anonId?: string;
  inline?: boolean;
}): Promise<Blob> {
  const resolvedAnonId = resolveAnonId(anonId);
  const authToken = getFmToken();

  const headers = new Headers({
    Accept: "application/pdf",
  });

  if (resolvedAnonId) {
    headers.set("X-Anon-Id", resolvedAnonId);
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(getAttemptReportPdfUrl({ attemptId, inline }), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch report pdf: ${response.status}`);
  }

  return response.blob();
}

export async function fetchAttemptReportPdfWithMeta({
  attemptId,
  anonId,
  inline,
}: {
  attemptId: string;
  anonId?: string;
  inline?: boolean;
}): Promise<AttemptReportPdfResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const authToken = getFmToken();

  const headers = new Headers({
    Accept: "application/pdf",
  });

  if (resolvedAnonId) {
    headers.set("X-Anon-Id", resolvedAnonId);
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(getAttemptReportPdfUrl({ attemptId, inline }), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch report pdf: ${response.status}`);
  }

  return {
    blob: await response.blob(),
    filenameHint: response.headers.get("X-Report-Filename-Hint"),
    formLabel: response.headers.get("X-Report-Form-Label"),
  };
}

export async function getScaleLookup({
  slug,
  locale,
}: {
  slug: string;
  locale?: string;
}): Promise<ScaleLookupResponse> {
  const response = await apiClient.get<ScaleLookupResponse>(
    `/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}${locale ? `&locale=${encodeURIComponent(locale)}` : ""}`,
    locale ? { locale } : undefined
  );

  return assertApiOk(response, "Failed to load scale lookup.");
}

export async function getScaleSitemapSource({
  locale,
}: {
  locale: "en" | "zh";
}): Promise<ScaleSitemapSourceResponse> {
  const response = await apiClient.get<ScaleSitemapSourceResponse>(`/v0.3/scales/sitemap-source?locale=${locale}`, {
    locale,
  });

  return assertApiOk(response, "Failed to load sitemap source.");
}

export async function getBootPayload({ anonId }: { anonId?: string } = {}): Promise<BootResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<BootResponse>("/v0.3/boot", anonHeader(resolvedAnonId));
  return assertApiOk(response, "Failed to load boot payload.");
}

export async function getFeatureFlags({ anonId }: { anonId?: string } = {}): Promise<BootResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<BootResponse>("/v0.3/flags", anonHeader(resolvedAnonId));
  return assertApiOk(response, "Failed to load feature flags.");
}

export async function createCheckoutOrOrder({
  attemptId,
  anonId,
  sku,
  orderNo,
  idempotencyKey,
  provider,
  region,
  attribution,
}: {
  attemptId: string;
  anonId?: string;
  sku?: string;
  orderNo?: string;
  idempotencyKey?: string;
  provider?: string;
  region?: CheckoutRegion;
  attribution?: AttemptAttributionPayload;
}): Promise<CheckoutResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const normalizedAttribution = normalizeAttemptAttributionPayload(attribution);
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  if (region) {
    headers["X-Region"] = region;
  }

  const response = await apiClient.post<CheckoutResponse>(
    "/v0.3/orders/checkout",
    {
      attempt_id: attemptId,
      sku,
      order_no: orderNo,
      ...(provider ? { provider } : {}),
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
      ...(normalizedAttribution ?? {}),
    },
    anonHeader(resolvedAnonId, headers)
  );

  return assertApiOk(response, "Failed to create checkout.");
}

export async function getOrderStatus({
  orderNo,
  anonId,
  includePaymentAction,
  paymentRecoveryToken,
  locale,
}: {
  orderNo: string;
  anonId?: string;
  includePaymentAction?: boolean;
  paymentRecoveryToken?: string;
  locale?: string;
}): Promise<OrderStatusResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const params = new URLSearchParams();
  if (includePaymentAction) {
    params.set("include_payment_action", "1");
  }
  const normalizedPaymentRecoveryToken = normalizeOptionalString(paymentRecoveryToken) ?? undefined;
  if (normalizedPaymentRecoveryToken) {
    params.set("payment_recovery_token", normalizedPaymentRecoveryToken);
  }
  if (locale) {
    params.set("locale", locale);
  }
  const path = `/v0.3/orders/${orderNo}${params.size > 0 ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get<OrderStatusResponse>(
    path,
    anonHeader(
      resolvedAnonId,
      normalizedPaymentRecoveryToken
        ? {
            "X-Payment-Recovery-Token": normalizedPaymentRecoveryToken,
          }
        : undefined
    )
  );

  const normalized = assertApiOk(response, "Failed to load order status.");
  return {
    ...normalized,
    status: normalizeOrderStatus(normalized.status),
  };
}

export async function recoverAlipayReturnContext({
  orderNo,
  query,
  anonId,
}: {
  orderNo: string;
  query: Record<string, string | null | undefined>;
  anonId?: string;
}): Promise<OrderReturnRecoveryResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    const normalized = normalizeOptionalString(value);
    if (!normalized) {
      continue;
    }

    params.set(key, normalized);
  }

  const path = `/v0.3/orders/${orderNo}/recover/alipay-return${params.size > 0 ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get<OrderReturnRecoveryResponse>(path, anonHeader(resolvedAnonId));

  return assertApiOk(response, "Failed to recover the payment return context.");
}

export async function getMyAttempts({
  scaleCode,
  page,
  pageSize,
  anonId,
  locale,
}: {
  scaleCode?: string;
  page?: number;
  pageSize?: number;
  anonId?: string;
  locale?: string;
} = {}): Promise<MeAttemptsResponse> {
  const query = new URLSearchParams();
  const resolvedScaleCode = scaleCode ? (buildRequestScaleCodeCandidates(scaleCode)[0] ?? scaleCode) : undefined;
  if (resolvedScaleCode) query.set("scale", resolvedScaleCode);
  if (typeof page === "number" && Number.isFinite(page) && page > 0) query.set("page", String(page));
  if (typeof pageSize === "number" && Number.isFinite(pageSize) && pageSize > 0) {
    query.set("page_size", String(pageSize));
  }
  if (locale) query.set("locale", locale);

  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<MeAttemptsResponse>(
    `/v0.3/me/attempts${query.size > 0 ? `?${query.toString()}` : ""}`,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to load history attempts.");
}

export async function linkAnonAttempts({
  anonId,
  attemptIds,
  authToken,
}: {
  anonId: string;
  attemptIds: string[];
  authToken?: string;
}): Promise<LinkAnonAttemptsResponse> {
  const normalizedAnonId = anonId.trim();
  const normalizedAttemptIds = normalizeLinkAnonAttemptIds(attemptIds);

  if (!normalizedAnonId || normalizedAttemptIds.length === 0) {
    return {
      ok: true,
      linked_attempt_ids: [],
      skipped_attempt_ids: [],
    };
  }

  const response = await apiClient.post<LinkAnonAttemptsResponse>(
    "/v0.3/me/attempts/link-anon",
    {
      anon_id: normalizedAnonId,
      attempt_ids: normalizedAttemptIds,
    },
    {
      ...anonHeader(normalizedAnonId),
      authToken,
    }
  );

  return assertApiOk(response, "Failed to link anonymous attempts.");
}

export async function getShareSummary({
  shareId,
  anonId,
  locale,
  cache,
}: {
  shareId: string;
  anonId?: string;
  locale?: string;
  cache?: RequestCache;
}): Promise<ShareSummaryResponse> {
  const response = await apiClient.get<ShareSummaryResponse>(
    `/v0.3/shares/${shareId}`,
    {
      ...anonHeader(anonId),
      ...(locale ? { locale } : {}),
      ...(cache ? { cache } : {}),
    }
  );

  return assertApiOk(response, "Share not available.");
}

export async function createAttemptShare({
  attemptId,
  anonId,
  locale,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
}): Promise<AttemptShareResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const path = `/v0.3/attempts/${attemptId}/share`;

  try {
    const response = await apiClient.post<AttemptShareResponse>(
      path,
      resolvedAnonId ? { anon_id: resolvedAnonId } : undefined,
      {
        ...anonHeader(resolvedAnonId),
        ...(locale ? { locale } : {}),
      }
    );
    return assertApiOk(response, "Unable to create a share link.");
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 405)) {
      throw error;
    }

    const response = await apiClient.get<AttemptShareResponse>(
      path,
      {
        ...anonHeader(resolvedAnonId),
        ...(locale ? { locale } : {}),
      }
    );
    return assertApiOk(response, "Unable to create a share link.");
  }
}

export async function trackShareClick({
  shareId,
  anonId,
  meta,
  locale,
}: {
  shareId: string;
  anonId?: string;
  meta?: ShareClickMeta;
  locale?: string;
}): Promise<ShareClickResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const normalizedMeta = normalizeShareClickMeta(meta);
  const response = await apiClient.post<ShareClickResponse>(
    `/v0.3/shares/${shareId}/click`,
    {
      ...(resolvedAnonId ? { anon_id: resolvedAnonId } : {}),
      ...(normalizedMeta ? { meta: normalizedMeta } : {}),
    },
    {
      ...anonHeader(resolvedAnonId),
      ...(locale ? { locale } : {}),
    }
  );

  return assertApiOk(response, "Unable to track share click.");
}

export async function createMbtiCompareInvite({
  shareId,
  anonId,
  entrypoint,
  referrer,
  landingPath,
  compareIntent,
  shareClickId,
  utm,
  locale,
}: {
  shareId: string;
  anonId?: string;
  entrypoint?: string;
  referrer?: string;
  landingPath?: string;
  compareIntent?: boolean;
  shareClickId?: string;
  utm?: AttributionUtm;
  locale?: string;
}): Promise<MbtiCompareInviteCreateResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const normalizedUtm = normalizeAttributionUtm(utm);
  const response = await apiClient.post<MbtiCompareInviteCreateResponse>(
    `/v0.3/shares/${shareId}/compare-invites`,
    {
      ...(resolvedAnonId ? { anon_id: resolvedAnonId } : {}),
      ...(normalizeOptionalString(entrypoint) ? { entrypoint: normalizeOptionalString(entrypoint) } : {}),
      ...(normalizeOptionalString(referrer) ? { referrer: normalizeOptionalString(referrer) } : {}),
      ...(normalizeOptionalString(landingPath) ? { landing_path: normalizeOptionalString(landingPath) } : {}),
      ...(typeof compareIntent === "boolean" ? { compare_intent: compareIntent } : {}),
      ...(normalizedUtm ? { utm: normalizedUtm } : {}),
      ...(normalizeOptionalString(shareClickId)
        ? {
            meta: {
              share_click_id: normalizeOptionalString(shareClickId),
            },
          }
        : {}),
    },
    {
      ...anonHeader(resolvedAnonId),
      ...(locale ? { locale } : {}),
    }
  );

  return assertApiOk(response, "Unable to create compare invite.");
}

export async function getMbtiCompareInvite({
  inviteId,
  anonId,
  locale,
  cache,
  timeoutMs,
}: {
  inviteId: string;
  anonId?: string;
  locale?: string;
  cache?: RequestCache;
  timeoutMs?: number;
}): Promise<MbtiCompareInviteResponse> {
  const response = await apiClient.get<MbtiCompareInviteResponse>(
    `/v0.3/compare/mbti/${inviteId}`,
    {
      ...anonHeader(anonId),
      ...(locale ? { locale } : {}),
      ...(cache ? { cache } : {}),
      ...(typeof timeoutMs === "number" ? { timeoutMs } : {}),
    }
  );

  return assertApiOk(response, "Compare invite not available.");
}

export async function getPrivateMbtiRelationship({
  inviteId,
  locale,
  cache,
  timeoutMs,
}: {
  inviteId: string;
  locale?: string;
  cache?: RequestCache;
  timeoutMs?: number;
}): Promise<PrivateMbtiRelationshipResponse> {
  const response = await apiClient.get<PrivateMbtiRelationshipResponse>(
    `/v0.3/me/relationships/mbti/${inviteId}`,
    {
      ...(locale ? { locale } : {}),
      ...(cache ? { cache } : {}),
      ...(typeof timeoutMs === "number" ? { timeoutMs } : {}),
    }
  );

  return assertApiOk(response, "Private relationship not available.");
}

export async function getPrivateMbtiRelationshipIndex({
  locale,
  cache,
  timeoutMs,
}: {
  locale?: string;
  cache?: RequestCache;
  timeoutMs?: number;
} = {}): Promise<MbtiRelationshipIndexResponse> {
  const response = await apiClient.get<MbtiRelationshipIndexResponse>(
    "/v0.3/me/relationships/mbti",
    {
      ...(locale ? { locale } : {}),
      ...(cache ? { cache } : {}),
      ...(typeof timeoutMs === "number" ? { timeoutMs } : {}),
    }
  );

  return assertApiOk(response, "Relationship index not available.");
}

export async function mutatePrivateMbtiRelationshipConsent({
  inviteId,
  action,
  locale,
}: {
  inviteId: string;
  action: "revoke_access" | "acknowledge_refresh";
  locale?: string;
}): Promise<PrivateMbtiRelationshipResponse> {
  const response = await apiClient.post<PrivateMbtiRelationshipResponse>(
    `/v0.3/me/relationships/mbti/${inviteId}/consent`,
    {
      action,
    },
    {
      ...(locale ? { locale } : {}),
    }
  );

  return assertApiOk(response, "Unable to update private relationship consent.");
}

export async function mutatePrivateMbtiRelationshipJourney({
  inviteId,
  action,
  locale,
}: {
  inviteId: string;
  action: "continue_dyadic_action" | "acknowledge_dyadic_pulse";
  locale?: string;
}): Promise<PrivateMbtiRelationshipResponse> {
  const response = await apiClient.post<PrivateMbtiRelationshipResponse>(
    `/v0.3/me/relationships/mbti/${inviteId}/journey`,
    {
      action,
    },
    {
      ...(locale ? { locale } : {}),
    }
  );

  return assertApiOk(response, "Unable to update private relationship journey.");
}

export async function lookupOrder({
  orderNo,
  email,
  locale,
}: {
  orderNo: string;
  email: string;
  locale?: string;
}): Promise<OrderLookupResponse> {
  const response = await apiClient.post<OrderLookupResponse>(
    "/v0.3/orders/lookup",
    {
      order_no: orderNo,
      email,
    },
    locale ? { locale } : undefined
  );

  return assertApiOk(response, "Unable to find that order.");
}

export async function captureEmailContact({
  email,
  locale,
  surface,
  order_no,
  attempt_id,
  share_id,
  compare_invite_id,
  entrypoint,
  referrer,
  landing_path,
  utm,
  marketing_consent,
}: {
  email: string;
  locale: string;
  surface: string;
  order_no?: string;
  attempt_id?: string;
  share_id?: string;
  compare_invite_id?: string;
  entrypoint?: string;
  referrer?: string;
  landing_path?: string;
  utm?: AttributionUtm;
  marketing_consent?: boolean;
}): Promise<EmailCaptureResponse> {
  const normalizedUtm = normalizeAttributionUtm(utm);
  const normalizedOrderNo = normalizeOptionalString(order_no);
  const normalizedAttemptId = normalizeOptionalString(attempt_id);
  const normalizedShareId = normalizeOptionalString(share_id);
  const normalizedCompareInviteId = normalizeOptionalString(compare_invite_id);
  const normalizedEntrypoint = normalizeOptionalString(entrypoint);
  const normalizedReferrer = normalizeOptionalString(referrer);
  const normalizedLandingPath = normalizeOptionalString(landing_path);
  const response = await apiClient.post<EmailCaptureResponse>(
    "/v0.3/email/capture",
    {
      email,
      locale,
      surface,
      ...(normalizedOrderNo ? { order_no: normalizedOrderNo } : {}),
      ...(normalizedAttemptId ? { attempt_id: normalizedAttemptId } : {}),
      ...(normalizedShareId ? { share_id: normalizedShareId } : {}),
      ...(normalizedCompareInviteId ? { compare_invite_id: normalizedCompareInviteId } : {}),
      ...(normalizedEntrypoint ? { entrypoint: normalizedEntrypoint } : {}),
      ...(normalizedReferrer ? { referrer: normalizedReferrer } : {}),
      ...(normalizedLandingPath ? { landing_path: normalizedLandingPath } : {}),
      ...(normalizedUtm ? { utm: normalizedUtm } : {}),
      ...(typeof marketing_consent === "boolean" ? { marketing_consent } : {}),
    },
    { locale }
  );

  return assertApiOk(response, "Unable to capture that email contact.");
}

export async function requestClaimReportEmail({
  order_no,
  email,
  locale,
  surface,
  entrypoint,
  referrer,
  landing_path,
  utm,
  share_id,
  compare_invite_id,
}: {
  order_no: string;
  email: string;
  locale: string;
  surface: string;
  entrypoint?: string;
  referrer?: string;
  landing_path?: string;
  utm?: AttributionUtm;
  share_id?: string;
  compare_invite_id?: string;
}): Promise<ClaimReportEmailResponse> {
  const normalizedUtm = normalizeAttributionUtm(utm);
  const normalizedEntrypoint = normalizeOptionalString(entrypoint);
  const normalizedReferrer = normalizeOptionalString(referrer);
  const normalizedLandingPath = normalizeOptionalString(landing_path);
  const normalizedShareId = normalizeOptionalString(share_id);
  const normalizedCompareInviteId = normalizeOptionalString(compare_invite_id);
  const response = await apiClient.post<ClaimReportEmailResponse>(
    "/v0.3/claim/report",
    {
      order_no,
      email,
      locale,
      surface,
      ...(normalizedEntrypoint ? { entrypoint: normalizedEntrypoint } : {}),
      ...(normalizedReferrer ? { referrer: normalizedReferrer } : {}),
      ...(normalizedLandingPath ? { landing_path: normalizedLandingPath } : {}),
      ...(normalizedUtm ? { utm: normalizedUtm } : {}),
      ...(normalizedShareId ? { share_id: normalizedShareId } : {}),
      ...(normalizedCompareInviteId ? { compare_invite_id: normalizedCompareInviteId } : {}),
    },
    { locale }
  );

  return assertApiOk(response, "Unable to request a report recovery email.");
}

export async function bindAttemptEmail({
  attemptId,
  email,
  anonId,
  locale,
  surface = "result_gate",
}: {
  attemptId: string;
  email: string;
  anonId?: string;
  locale?: string;
  surface?: "result_gate" | "result_recovery" | "result" | "report";
}): Promise<AttemptEmailBindResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.post<AttemptEmailBindResponse>(
    `/v0.3/attempts/${attemptId}/email-bind`,
    {
      email,
      ...(locale ? { locale } : {}),
      surface,
    },
    {
      ...anonHeader(resolvedAnonId),
      ...(locale ? { locale } : {}),
    }
  );

  return assertApiOk(response, "Unable to bind email to this result.");
}

export async function lookupResultsByEmail({
  email,
  locale,
}: {
  email: string;
  locale?: string;
}): Promise<ResultEmailLookupResponse> {
  const response = await apiClient.post<ResultEmailLookupResponse>(
    "/v0.3/results/lookup-by-email",
    {
      email,
      ...(locale ? { locale } : {}),
    },
    locale ? { locale } : undefined
  );

  return assertApiOk(response, "Unable to find saved results.");
}

export async function getEmailPreferences(token: string): Promise<EmailPreferencesResponse> {
  const response = await apiClient.get<EmailPreferencesResponse>(
    `/v0.3/email/preferences?token=${encodeURIComponent(token)}`
  );

  return assertApiOk(response, "Unable to load email preferences.");
}

export async function updateEmailPreferences(
  input: EmailPreferencesUpdateRequest
): Promise<EmailPreferencesUpdateResponse> {
  const response = await apiClient.post<EmailPreferencesUpdateResponse>("/v0.3/email/preferences", input);

  return assertApiOk(response, "Unable to update email preferences.");
}

export async function unsubscribeEmail(
  input: EmailUnsubscribeRequest
): Promise<EmailUnsubscribeResponse> {
  const response = await apiClient.post<EmailUnsubscribeResponse>("/v0.3/email/unsubscribe", input);

  return assertApiOk(response, "Unable to unsubscribe that email.");
}

export async function resendOrderDelivery({
  orderNo,
}: {
  orderNo: string;
}): Promise<OrderResendResponse> {
  const response = await apiClient.post<OrderResendResponse>(`/v0.3/orders/${orderNo}/resend`);
  return assertApiOk(response, "Unable to resend delivery link.");
}
