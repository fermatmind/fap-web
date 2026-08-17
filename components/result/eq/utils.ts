import type { ReportResponse } from "@/lib/api/v0_3";
import { toScaleCodeV1 } from "@/lib/scaleCodeMode";
import type {
  EqActionPrescriptionAsset,
  EqAgentDialoguePlaybookAsset,
  EqBackendIntegrationContractAsset,
  EqCareerEnvironmentAsset,
  EqCommercialConversionActionAsset,
  EqCrossAssessmentContextAsset,
  EqCoreFormulationAsset,
  EqDimensionRanking,
  EqDimensionRankingEntry,
  EqDimensionRankingStatus,
  EqV5AssetRefs,
  EqMechanismAsset,
  EqPsychometricEvidenceAsset,
  EqQualityConfidenceAsset,
  EqPrivateResultAuthority,
  EqRealitySceneAsset,
  EqResultPageDepthModuleAsset,
  EqResultSnapshotAsset,
  EqScientificContractAsset,
  EqScoreSystemAsset,
  EqSjtBridgeAsset,
  EqSnapshotBinding,
  EqV5DimensionScore,
  EqV5ReportPayload,
  EqV5ResolvedAssets,
  EqV5SelectedAssetIds,
  EqV5SignalSignature,
  EqV5ViewModel,
} from "./types";
import type { Locale } from "@/lib/i18n/locales";

const EQ_DIMENSION_ORDER = ["SA", "ER", "EM", "RM"] as const;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const RELEASE_ID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const AUTHORITY_ID = "FERMATMIND_EQ_60_BILINGUAL_CANONICAL";

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function lowerText(value: unknown): string {
  return text(value).toLowerCase();
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean)
    : [];
}

const DIMENSION_RANKING_STATUSES = new Set<EqDimensionRankingStatus>([
  "unique",
  "tie",
  "suppressed",
  "unavailable",
]);

function normalizeDimensionRankingEntry(value: unknown): EqDimensionRankingEntry | null {
  const record = asRecord(value);
  const status = text(record?.status) as EqDimensionRankingStatus;
  if (!record || !DIMENSION_RANKING_STATUSES.has(status)) {
    return null;
  }

  return {
    status,
    codes: stringArray(record.codes),
  };
}

function normalizeDimensionRanking(value: unknown): EqDimensionRanking | undefined {
  const record = asRecord(value);
  const strongest = normalizeDimensionRankingEntry(record?.strongest);
  const development = normalizeDimensionRankingEntry(record?.development);
  if (!strongest || !development) {
    return undefined;
  }

  return { strongest, development };
}

function normalizeDimensionScore(value: unknown, fallbackCode?: string): EqV5DimensionScore | null {
  const record = asRecord(value);
  if (!record) return null;

  return {
    code: text(record.code) || fallbackCode,
    raw_score: numberOrUndefined(record.raw_score),
    standard_score: numberOrUndefined(record.standard_score),
    percentile: numberOrUndefined(record.percentile),
    band: text(record.band) || undefined,
    display_band: text(record.display_band) || undefined,
    label: text(record.label) || undefined,
    short_label: text(record.short_label) || undefined,
  };
}

function normalizeDimensions(payload: EqV5ReportPayload): EqV5DimensionScore[] {
  if (Array.isArray(payload.dimension_summary)) {
    const summary = payload.dimension_summary
      .map((item) => normalizeDimensionScore(item, item.code))
      .filter((item): item is EqV5DimensionScore => item !== null);
    if (summary.length > 0) return summary;
  }

  const dimensions = asRecord(payload.scores?.dimensions);
  if (!dimensions) return [];

  return EQ_DIMENSION_ORDER.map((code) => normalizeDimensionScore(dimensions[code], code)).filter(
    (item): item is EqV5DimensionScore => item !== null
  );
}

function normalizeAssetObject<T extends Record<string, unknown>>(value: unknown): T {
  return (asRecord(value) ?? {}) as T;
}

function normalizeAssetArray<T extends Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value)
    ? value.filter((item): item is T => Boolean(asRecord(item)))
    : [];
}

function assetRefs(payload: EqV5ReportPayload): EqV5AssetRefs {
  return normalizeAssetObject<EqV5AssetRefs>(payload.asset_refs);
}

function normalizeSelectedAssetIds(value: unknown): Required<EqV5SelectedAssetIds> {
  const record = asRecord(value);

  return {
    core_formulation_id: text(record?.core_formulation_id),
    mechanism_ids: stringArray(record?.mechanism_ids),
    scene_ids: stringArray(record?.scene_ids),
    scene_variant_ids: stringArray(record?.scene_variant_ids),
    career_environment_ids: stringArray(record?.career_environment_ids),
    action_prescription_id: text(record?.action_prescription_id),
  };
}

function normalizeSignalSignature(value: unknown): EqV5SignalSignature {
  const record = asRecord(value);
  const dimensionStates = asRecord(record?.dimension_states);

  return {
    schema: text(record?.schema),
    route_id: text(record?.route_id),
    formulation_id: text(record?.formulation_id),
    route_priority: numberOrUndefined(record?.route_priority),
    route_claim_risk: text(record?.route_claim_risk),
    quality_level: text(record?.quality_level),
    confidence_label: text(record?.confidence_label),
    dimension_states: dimensionStates
      ? Object.fromEntries(Object.entries(dimensionStates).map(([key, item]) => [key, text(item)]))
      : {},
    strongest_dimension: text(record?.strongest_dimension),
    development_lever: text(record?.development_lever),
    match_pattern: text(record?.match_pattern),
  };
}

function orderAssetsByIds<T extends { id?: string }>(items: T[], ids: string[]): T[] {
  if (items.length === 0 || ids.length === 0) return items;

  const byId = new Map<string, T>();
  for (const item of items) {
    const id = text(item.id);
    if (id) {
      byId.set(id, item);
    }
  }
  const ordered = ids.map((id) => byId.get(id)).filter((item): item is T => Boolean(item));
  const used = new Set(ordered.map((item) => text(item.id)));
  const rest = items.filter((item) => !used.has(text(item.id)));

  return [...ordered, ...rest];
}

export function resolveEqV5Payload(reportData: ReportResponse | null | undefined): EqV5ReportPayload | null {
  const reportPayload = asRecord(reportData?.report);
  const rootPayload = asRecord(reportData);
  const candidates = [reportPayload, rootPayload].filter(Boolean) as Record<string, unknown>[];

  for (const candidate of candidates) {
    const scaleCode = toScaleCodeV1(text(candidate.scale_code ?? reportData?.scale_code ?? reportData?.meta?.scale_code));
    if (scaleCode !== "EQ_60") continue;
    if (candidate.eq_report_mode !== "self_report") continue;
    if (candidate.measurement_type !== "self_report_trait_mixed_ei") continue;
    return candidate as EqV5ReportPayload;
  }

  return null;
}

export function isEqV5ReportResponse(reportData: ReportResponse | null | undefined): boolean {
  return resolveEqV5Payload(reportData) !== null;
}

function requiredText(record: Record<string, unknown> | null, key: string): boolean {
  return text(record?.[key]).length > 0;
}

function hasRequiredEditorialAssets(payload: EqV5ReportPayload): boolean {
  const assets = asRecord(payload.assets);
  const snapshot = asRecord(assets?.result_snapshot);
  const route = asRecord(assets?.personalization_route);
  const quality = asRecord(assets?.quality_confidence);
  const science = asRecord(assets?.scientific_contract);
  const formulation = asRecord(assets?.core_formulation);
  const action = asRecord(assets?.action_prescription);
  const lowConfidence = text(payload.interpretation?.core_formulation_id) === "low_confidence_result";
  const requiredSnapshot = ["headline", "core_judgment", "evidence_point", "minimal_action", "share_safe_sentence", "do_not_overread"];
  const requiredScience = ["test_definition", "self_report_statement", "non_clinical_statement", "non_hiring_statement", "non_ability_statement", "norm_status_statement", "quality_rules_statement", "version_statement"];

  if (!assets || !requiredSnapshot.every((key) => requiredText(snapshot, key))) return false;
  if (!["route_headline", "why_this_feels_specific", "evidence_snapshot_label", "next_best_action", "save_reason"].every((key) => requiredText(route, key))) return false;
  if (!["label", "body", "why_this_level", "how_to_read", "do_not_overread"].every((key) => requiredText(quality, key))) return false;
  if (!requiredScience.every((key) => requiredText(science, key))) return false;
  if (!["title", "one_liner", "core_claim", "development_lever", "do_not_overread"].every((key) => requiredText(formulation, key))) return false;
  if (!["id", "title", "why_this_matters", "do_today"].every((key) => requiredText(action, key))) return false;
  if (!requiredText(asRecord(payload.methodology), "scoring_version") || !requiredText(asRecord(payload.methodology), "content_version")) return false;

  if (lowConfidence) return true;

  return normalizeDimensions(payload).length === EQ_DIMENSION_ORDER.length &&
    normalizeAssetArray<EqMechanismAsset>(assets.mechanisms).length > 0 &&
    normalizeAssetArray<EqRealitySceneAsset>(assets.reality_scenes).length > 0 &&
    normalizeAssetArray<EqCareerEnvironmentAsset>(assets.career_environment).length > 0;
}

export function resolveEqV5Authority(
  reportData: ReportResponse | null | undefined,
  locale: Locale
): { authority: EqPrivateResultAuthority; snapshotBinding: EqSnapshotBinding } | null {
  const payload = resolveEqV5Payload(reportData);
  if (!payload || payload.schema_version !== "eq_60.report.v2") return null;

  const meta = asRecord(payload._meta);
  const authority = asRecord(meta?.eq60_private_result_authority);
  const binding = asRecord(meta?.snapshot_binding_v1);
  const expectedLocale = locale === "zh" ? "zh-CN" : "en";
  const releaseId = text(authority?.release_id);
  const sourceHash = text(authority?.source_hash);
  const compiledHash = text(authority?.compiled_hash);

  if (!authority || !binding ||
    authority.schema_version !== "fap.eq60.private_result_authority.v1" ||
    authority.authority_id !== AUTHORITY_ID || authority.mode !== "canonical_active_release" ||
    authority.pack_id !== "EQ_60" || text(authority.pack_version) === "" ||
    authority.locale !== expectedLocale || payload.locale !== expectedLocale ||
    !Array.isArray(authority.locales) || authority.locales.join("|") !== "zh-CN|en" ||
    !RELEASE_ID_PATTERN.test(releaseId) || !HASH_PATTERN.test(sourceHash) || !HASH_PATTERN.test(compiledHash) ||
    binding.schema_version !== "fap.eq60.snapshot_binding.v1" ||
    binding.canonical_authority_identity !== AUTHORITY_ID ||
    binding.canonical_release_id !== releaseId || binding.canonical_source_hash !== sourceHash ||
    binding.canonical_compiled_hash !== compiledHash || !HASH_PATTERN.test(text(binding.canonical_payload_sha256)) ||
    binding.locale !== expectedLocale || binding.pack_version !== authority.pack_version ||
    !text(payload.methodology?.content_version).endsWith(`/${text(authority.pack_version)}`) ||
    !hasRequiredEditorialAssets(payload)) {
    return null;
  }

  return {
    authority: authority as unknown as EqPrivateResultAuthority,
    snapshotBinding: binding as unknown as EqSnapshotBinding,
  };
}

function hasOfferPayload(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return asRecord(value) !== null;
}

export function isEqV5AccessRestricted(reportData: ReportResponse | null | undefined): boolean {
  const payload = resolveEqV5Payload(reportData);
  if (!payload) return false;

  const root = asRecord(reportData);
  const access = asRecord(payload.access);
  const viewPolicy = asRecord(root?.view_policy);
  const restrictedStateMarkers = new Set(["locked", "lock", "paywall", "paywalled", "blur", "blurred", "restricted"]);
  const accessStateCandidates = [
    lowerText(root?.access_state),
    lowerText(root?.report_state),
    lowerText(payload.access_state),
    lowerText(payload.report_state),
    lowerText(access?.state),
    lowerText(access?.access_state),
    lowerText(viewPolicy?.mode),
    lowerText(viewPolicy?.state),
  ].filter(Boolean);

  return Boolean(
    reportData?.locked === true ||
      payload.locked === true ||
      access?.locked === true ||
      access?.blur === true ||
      access?.paywall === true ||
      accessStateCandidates.some((candidate) => restrictedStateMarkers.has(candidate)) ||
      text(reportData?.upgrade_sku) ||
      text(reportData?.upgrade_sku_effective) ||
      text(payload.upgrade_sku) ||
      text(payload.upgrade_sku_effective) ||
      hasOfferPayload(reportData?.offers) ||
      hasOfferPayload(payload.offers) ||
      hasOfferPayload(payload.offer)
  );
}

export function normalizeEqV5Report(reportData: ReportResponse, locale: Locale): EqV5ViewModel | null {
  const payload = resolveEqV5Payload(reportData);
  const canonical = resolveEqV5Authority(reportData, locale);
  if (!payload || !canonical) return null;

  const assets = normalizeAssetObject<EqV5ResolvedAssets>(payload.assets);
  const refs = assetRefs(payload);
  const routeAsset = normalizeAssetObject<NonNullable<EqV5ResolvedAssets["personalization_route"]>>(
    assets.personalization_route
  );
  const selectedAssetIds = normalizeSelectedAssetIds(
    payload.interpretation?.selected_asset_ids ?? refs.selected_asset_ids ?? routeAsset.selected_asset_ids
  );
  const signalSignature = normalizeSignalSignature(
    payload.interpretation?.signal_signature ?? refs.signal_signature ?? routeAsset.signal_signature
  );
  const routeId =
    text(payload.interpretation?.route_id) ||
    text(refs.personalization_route_id) ||
    text(routeAsset.id) ||
    text(payload.interpretation?.core_formulation_id);
  const resolvedMechanisms = orderAssetsByIds(
    normalizeAssetArray<EqMechanismAsset>(assets.mechanisms),
    selectedAssetIds.mechanism_ids
  );
  const resolvedScenes = orderAssetsByIds(
    normalizeAssetArray<EqRealitySceneAsset>(assets.reality_scenes),
    selectedAssetIds.scene_variant_ids.length > 0 ? selectedAssetIds.scene_variant_ids : selectedAssetIds.scene_ids
  );
  const resolvedCareer = orderAssetsByIds(
    normalizeAssetArray<EqCareerEnvironmentAsset>(assets.career_environment),
    selectedAssetIds.career_environment_ids
  );

  return {
    locale,
    payload,
    lockedAnomaly: isEqV5AccessRestricted(reportData),
    authority: canonical.authority,
    snapshotBinding: canonical.snapshotBinding,
    globalScore: normalizeDimensionScore(payload.scores?.global) ?? null,
    dimensions: normalizeDimensions(payload),
    quality: {
      level: text(payload.quality?.level),
      confidence_label: text(payload.quality?.confidence_label) || text(assets.quality?.confidence_label),
      flags: stringArray(payload.quality?.flags),
      explanation_asset_id: text(payload.quality?.explanation_asset_id) || text(assets.quality?.explanation_asset_id),
    },
    interpretation: {
      route_id: routeId,
      signal_signature: signalSignature,
      core_formulation_id: text(payload.interpretation?.core_formulation_id),
      strongest_dimension: text(payload.interpretation?.strongest_dimension),
      development_lever: text(payload.interpretation?.development_lever),
      dimension_ranking: normalizeDimensionRanking(payload.interpretation?.dimension_ranking),
      primary_mechanism_ids: stringArray(payload.interpretation?.primary_mechanism_ids),
      primary_scene_ids: stringArray(payload.interpretation?.primary_scene_ids),
      career_environment_ids: stringArray(payload.interpretation?.career_environment_ids),
      action_prescription_id: text(payload.interpretation?.action_prescription_id) || null,
      selected_asset_ids: selectedAssetIds,
    },
    route: {
      routeId,
      signalSignature,
      selectedAssetIds,
    },
    nextModule: {
      available: payload.next_module?.available === true,
      module_code: text(payload.next_module?.module_code),
      status: text(payload.next_module?.status),
      cta_asset_id: text(payload.next_module?.cta_asset_id),
    },
    methodology: {
      norm_status: text(payload.methodology?.norm_status),
      scoring_version: text(payload.methodology?.scoring_version),
      report_version: text(payload.methodology?.report_version),
      content_version: text(payload.methodology?.content_version),
    },
    assets: {
      result_snapshot: normalizeAssetObject<EqResultSnapshotAsset>(assets.result_snapshot),
      commercial_conversion_actions: normalizeAssetArray<EqCommercialConversionActionAsset>(
        assets.commercial_conversion_actions
      ),
      scientific_contract: normalizeAssetObject<EqScientificContractAsset>(assets.scientific_contract),
      score_system: normalizeAssetObject<EqScoreSystemAsset>(assets.score_system),
      core_formulation: normalizeAssetObject<EqCoreFormulationAsset>(assets.core_formulation),
      mechanisms: resolvedMechanisms,
      reality_scenes: resolvedScenes,
      career_environment: resolvedCareer,
      action_prescription: normalizeAssetObject<EqActionPrescriptionAsset>(assets.action_prescription),
      sjt_bridge: normalizeAssetObject<EqSjtBridgeAsset>(assets.sjt_bridge),
      quality: normalizeAssetObject<{ explanation_asset_id?: string; confidence_label?: string }>(assets.quality),
      quality_confidence: normalizeAssetObject<EqQualityConfidenceAsset>(assets.quality_confidence),
      psychometric_evidence_status: normalizeAssetArray<EqPsychometricEvidenceAsset>(
        assets.psychometric_evidence_status
      ),
      agent_dialogue_playbooks: normalizeAssetArray<EqAgentDialoguePlaybookAsset>(assets.agent_dialogue_playbooks),
      backend_integration_contract: normalizeAssetArray<EqBackendIntegrationContractAsset>(
        assets.backend_integration_contract
      ),
      result_page_depth_modules: normalizeAssetArray<EqResultPageDepthModuleAsset>(assets.result_page_depth_modules),
      cross_assessment_context: normalizeAssetArray<EqCrossAssessmentContextAsset>(assets.cross_assessment_context),
      personalization_route: {
        ...routeAsset,
        id: routeId,
        signal_signature: signalSignature,
        selected_asset_ids: selectedAssetIds,
      },
    },
  };
}

export function formatEqScore(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? String(Math.round(value)) : "—";
}

export function getEqDimensionLabel(score: EqV5DimensionScore, scoreSystem?: EqScoreSystemAsset): string {
  const code = text(score.code);
  return text(score.label) || text(score.short_label) || text(scoreSystem?.dimensions?.[code]?.label) || code || "—";
}

export function isLowConfidenceEqResult(viewModel: EqV5ViewModel): boolean {
  return viewModel.interpretation.core_formulation_id === "low_confidence_result";
}
