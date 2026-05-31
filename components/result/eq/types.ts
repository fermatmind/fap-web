import type { Locale } from "@/lib/i18n/locales";

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
  scale_code?: string;
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
    signal_signature?: EqV5SignalSignature;
    core_formulation_id?: string;
    strongest_dimension?: string;
    development_lever?: string;
    primary_mechanism_ids?: string[];
    primary_scene_ids?: string[];
    career_environment_ids?: string[];
    action_prescription_id?: string | null;
    selected_asset_ids?: EqV5SelectedAssetIds;
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
  assets?: EqV5ResolvedAssets;
  report_tags?: string[];
  [key: string]: unknown;
};

export type EqV5SignalSignature = {
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

export type EqV5SelectedAssetIds = {
  core_formulation_id?: string;
  mechanism_ids?: string[];
  scene_ids?: string[];
  career_environment_ids?: string[];
  action_prescription_id?: string;
};

export type EqV5AssetRefs = {
  personalization_route_id?: string;
  signal_signature?: EqV5SignalSignature;
  selected_asset_ids?: EqV5SelectedAssetIds;
  core_formulation_id?: string;
  mechanism_ids?: string[];
  scene_ids?: string[];
  career_environment_ids?: string[];
  action_prescription_id?: string;
  [key: string]: unknown;
};

export type EqScientificContractAsset = {
  test_definition?: string;
  self_report_statement?: string;
  non_clinical_statement?: string;
  non_hiring_statement?: string;
  non_ability_statement?: string;
  norm_status_statement?: string;
  quality_rules_statement?: string;
  version_statement?: string;
};

export type EqScoreSystemAsset = {
  global_index?: {
    label?: string;
    meaning?: string;
  };
  score_notes?: {
    standard_score?: string;
    percentile?: string;
  };
  bands?: Record<string, string>;
  dimensions?: Record<
    string,
    {
      label?: string;
      definition?: string;
      band_explanations?: Record<string, string>;
    }
  >;
};

export type EqCoreFormulationAsset = {
  id?: string;
  title?: string;
  one_liner?: string;
  core_claim?: string;
  evidence_basis?: string[];
  primary_strength?: string;
  likely_cost?: string;
  development_lever?: string;
  do_not_overread?: string;
};

export type EqMechanismAsset = {
  id?: string;
  pair?: string;
  state?: string;
  title?: string;
  why_it_matters?: string;
  what_it_feels_like?: string;
  strength?: string;
  cost?: string;
  development_lever?: string;
  micro_action?: string;
};

export type EqRealitySceneAsset = {
  id?: string;
  title?: string;
  typical_response?: string;
  strength?: string;
  cost?: string;
  better_move?: string;
};

export type EqCareerEnvironmentAsset = {
  id?: string;
  variable?: string;
  level?: string;
  label?: string;
  meaning?: string;
  fit_signal?: string;
  strain_signal?: string;
  what_to_verify?: string;
};

export type EqActionPrescriptionAsset = {
  id?: string;
  title?: string;
  why_this_matters?: string;
  do_today?: string;
  script?: string;
  seven_day_plan?: string[];
  watch_out?: string;
};

export type EqSjtBridgeAsset = {
  id?: string;
  available?: boolean;
  status?: string;
  title?: string;
  description?: string;
  complements?: string;
  not_this?: string;
  what_it_adds?: string;
  what_it_is_not?: string;
  completed_report_adds?: string[];
  button_label?: string;
};

export type EqV5ResolvedAssets = {
  scientific_contract?: EqScientificContractAsset;
  score_system?: EqScoreSystemAsset;
  core_formulation?: EqCoreFormulationAsset;
  mechanisms?: EqMechanismAsset[];
  reality_scenes?: EqRealitySceneAsset[];
  career_environment?: EqCareerEnvironmentAsset[];
  action_prescription?: EqActionPrescriptionAsset;
  sjt_bridge?: EqSjtBridgeAsset;
  quality?: {
    explanation_asset_id?: string;
    confidence_label?: string;
  };
  personalization_route?: {
    id?: string;
    signal_signature?: EqV5SignalSignature;
    selected_asset_ids?: EqV5SelectedAssetIds;
  };
};

export type EqV5PersonalizationRoute = {
  routeId: string;
  signalSignature: EqV5SignalSignature;
  selectedAssetIds: Required<EqV5SelectedAssetIds>;
};

export type EqV5ViewModel = {
  locale: Locale;
  payload: EqV5ReportPayload;
  lockedAnomaly: boolean;
  globalScore: EqV5DimensionScore | null;
  dimensions: EqV5DimensionScore[];
  quality: NonNullable<EqV5ReportPayload["quality"]>;
  interpretation: NonNullable<EqV5ReportPayload["interpretation"]>;
  route: EqV5PersonalizationRoute;
  nextModule: NonNullable<EqV5ReportPayload["next_module"]>;
  methodology: NonNullable<EqV5ReportPayload["methodology"]>;
  assets: Required<EqV5ResolvedAssets>;
};
