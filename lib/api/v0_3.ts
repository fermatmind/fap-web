import { getFmToken } from "@/lib/auth/fmToken";
import { getOrCreateAnonId, removePendingAnonLinkAttempts } from "@/lib/anon";
import { buildApiUrl } from "@/lib/api-base";
import { ApiError, apiClient } from "@/lib/api-client";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import { buildRequestScaleCodeCandidates } from "@/lib/scaleCodeMode";

export type ScaleQuestionOption = {
  code: string;
  text?: string;
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
  result?: Record<string, unknown>;
  report?: ReportResponse;
  meta?: {
    scale_code?: string;
    [key: string]: unknown;
  };
  idempotent?: boolean;
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
  big5_public_projection_v1?: Big5PublicProjection | null;
};

export type OfferPayload = {
  sku?: string;
  label?: string;
  title?: string;
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

export type Big5PublicProjection = {
  schema_version?: string;
  trait_vector?: Big5TraitProjection[];
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
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
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
  big5_public_projection_v1?: Big5PublicProjection | null;
  mbti_public_projection_v1?: MbtiPublicProjectionV1Raw | null;
  mbti_read_contract_v1?: MbtiReadContractRaw | null;
  mbti_cross_assessment_v1?: MbtiCrossAssessmentRaw | null;
  mbti_access_hub_v1?: MbtiAccessHubV1Raw | null;
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
  mbti_access_hub_v1?: MbtiAccessHubV1Raw | null;
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
  axis_left?: string | null;
  axis_right?: string | null;
  summary?: string | null;
  description?: string | null;
  score_pct?: number | null;
  source?: string | null;
  side?: string | null;
  side_label?: string | null;
  pct?: number | null;
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
  cross_assessment_v1?: MbtiCrossAssessmentRaw | null;
  synthesis_keys?: string[];
  supporting_scales?: string[];
  big5_influence_keys?: string[];
  mbti_adjusted_focus_keys?: string[];
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
  primary_cta_label?: string;
  primary_cta_path?: string;
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
  mbti_access_hub_v1?: MbtiAccessHubV1Raw | null;
  [key: string]: unknown;
};

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
  result_summary?: {
    domains_mean?: Record<string, number>;
  };
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
  [key: string]: unknown;
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
  tokenFromUrl,
  anonId,
  attemptIds,
}: {
  tokenFromUrl: string;
  anonId: string;
  attemptIds: string[];
}): string {
  return JSON.stringify([
    tokenFromUrl.trim(),
    anonId.trim(),
    normalizeLinkAnonAttemptIds(attemptIds),
  ]);
}

export function shouldLinkAnonAttemptsOnLoginSuccess({
  tokenFromUrl,
  anonId,
  attemptIds,
}: {
  tokenFromUrl: string;
  anonId: string;
  attemptIds: string[];
}): boolean {
  const normalizedToken = tokenFromUrl.trim();
  const normalizedAnonId = anonId.trim();
  const normalizedAttemptIds = normalizeLinkAnonAttemptIds(attemptIds);

  if (!normalizedToken.startsWith("fm_")) return false;
  if (!normalizedAnonId || normalizedAttemptIds.length === 0) return false;
  if (isLinkAnonUnsupportedActive()) return false;
  if (!canUseWebStorage()) return true;

  const key = buildLinkAnonDedupKey({
    tokenFromUrl: normalizedToken,
    anonId: normalizedAnonId,
    attemptIds: normalizedAttemptIds,
  });

  return !(key in readSessionLinkAnonDedupMap());
}

export async function linkAnonAttemptsOnceOnLoginSuccess({
  tokenFromUrl,
  anonId,
  attemptIds,
}: {
  tokenFromUrl: string;
  anonId: string;
  attemptIds: string[];
}): Promise<void> {
  const normalizedToken = tokenFromUrl.trim();
  const normalizedAnonId = anonId.trim();
  const normalizedAttemptIds = normalizeLinkAnonAttemptIds(attemptIds);

  if (!normalizedToken.startsWith("fm_")) return;
  if (!normalizedAnonId || normalizedAttemptIds.length === 0) return;
  if (isLinkAnonUnsupportedActive()) return;

  const dedupKey = buildLinkAnonDedupKey({
    tokenFromUrl: normalizedToken,
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
  share_click_id,
  entrypoint,
  landing_path,
  utm,
}: {
  scaleCode: string;
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
  share_click_id?: string;
  entrypoint?: string;
  landing_path?: string;
  utm?: AttributionUtm;
}): Promise<StartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const attribution = normalizeAttemptAttributionPayload({
    share_id,
    compare_invite_id,
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
  anonId,
  locale,
  region,
}: {
  scaleCode: string;
  anonId?: string;
  locale?: string;
  region?: string;
}): Promise<QuestionsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const query = new URLSearchParams();
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
}: {
  attemptId: string;
  anonId: string;
}): Promise<ResultResponse> {
  const response = await apiClient.get<ResultResponse>(`/v0.3/attempts/${attemptId}/result`, anonHeader(anonId));

  return assertApiOk(response, "Failed to load result.");
}

export async function getAttemptReport({
  attemptId,
  anonId,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const suffix = refresh ? "?refresh=1" : "";
  const response = await apiClient.get<ReportResponse>(
    `/v0.3/attempts/${attemptId}/report${suffix}`,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to load report.");
}

export async function fetchAttemptReport({
  attemptId,
  anonId,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
}): Promise<ReportResponse> {
  return getAttemptReport({ attemptId, anonId, refresh });
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
}: {
  attemptId: string;
  anonId?: string;
  sku?: string;
  orderNo?: string;
  idempotencyKey?: string;
  provider?: string;
  region?: CheckoutRegion;
}): Promise<CheckoutResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
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
}: {
  orderNo: string;
  anonId?: string;
  includePaymentAction?: boolean;
  paymentRecoveryToken?: string;
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

export async function getMyAttempts({
  scaleCode,
  page,
  pageSize,
  anonId,
}: {
  scaleCode?: string;
  page?: number;
  pageSize?: number;
  anonId?: string;
} = {}): Promise<MeAttemptsResponse> {
  const query = new URLSearchParams();
  const resolvedScaleCode = scaleCode ? (buildRequestScaleCodeCandidates(scaleCode)[0] ?? scaleCode) : undefined;
  if (resolvedScaleCode) query.set("scale", resolvedScaleCode);
  if (typeof page === "number" && Number.isFinite(page) && page > 0) query.set("page", String(page));
  if (typeof pageSize === "number" && Number.isFinite(pageSize) && pageSize > 0) {
    query.set("page_size", String(pageSize));
  }

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

export async function lookupOrder({
  orderNo,
  email,
}: {
  orderNo: string;
  email: string;
}): Promise<OrderLookupResponse> {
  const response = await apiClient.post<OrderLookupResponse>("/v0.3/orders/lookup", {
    order_no: orderNo,
    email,
  });

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
