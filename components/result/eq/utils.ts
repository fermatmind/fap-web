import type { ReportResponse } from "@/lib/api/v0_3";
import { toScaleCodeV1 } from "@/lib/scaleCodeMode";
import type {
  EqActionPrescriptionAsset,
  EqCareerEnvironmentAsset,
  EqCoreFormulationAsset,
  EqMechanismAsset,
  EqRealitySceneAsset,
  EqScientificContractAsset,
  EqScoreSystemAsset,
  EqSjtBridgeAsset,
  EqV5DimensionScore,
  EqV5ReportPayload,
  EqV5ResolvedAssets,
  EqV5ViewModel,
} from "./types";
import type { Locale } from "@/lib/i18n/locales";

const EQ_DIMENSION_ORDER = ["SA", "ER", "EM", "RM"] as const;

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
  if (!payload) return null;

  const assets = normalizeAssetObject<EqV5ResolvedAssets>(payload.assets);

  return {
    locale,
    payload,
    lockedAnomaly: isEqV5AccessRestricted(reportData),
    globalScore: normalizeDimensionScore(payload.scores?.global) ?? null,
    dimensions: normalizeDimensions(payload),
    quality: {
      level: text(payload.quality?.level) || "unknown",
      confidence_label: text(payload.quality?.confidence_label) || text(assets.quality?.confidence_label) || "unknown",
      flags: stringArray(payload.quality?.flags),
      explanation_asset_id: text(payload.quality?.explanation_asset_id) || text(assets.quality?.explanation_asset_id),
    },
    interpretation: {
      core_formulation_id: text(payload.interpretation?.core_formulation_id),
      strongest_dimension: text(payload.interpretation?.strongest_dimension),
      development_lever: text(payload.interpretation?.development_lever),
      primary_mechanism_ids: stringArray(payload.interpretation?.primary_mechanism_ids),
      primary_scene_ids: stringArray(payload.interpretation?.primary_scene_ids),
      career_environment_ids: stringArray(payload.interpretation?.career_environment_ids),
      action_prescription_id: text(payload.interpretation?.action_prescription_id) || null,
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
      scientific_contract: normalizeAssetObject<EqScientificContractAsset>(assets.scientific_contract),
      score_system: normalizeAssetObject<EqScoreSystemAsset>(assets.score_system),
      core_formulation: normalizeAssetObject<EqCoreFormulationAsset>(assets.core_formulation),
      mechanisms: normalizeAssetArray<EqMechanismAsset>(assets.mechanisms),
      reality_scenes: normalizeAssetArray<EqRealitySceneAsset>(assets.reality_scenes),
      career_environment: normalizeAssetArray<EqCareerEnvironmentAsset>(assets.career_environment),
      action_prescription: normalizeAssetObject<EqActionPrescriptionAsset>(assets.action_prescription),
      sjt_bridge: normalizeAssetObject<EqSjtBridgeAsset>(assets.sjt_bridge),
      quality: normalizeAssetObject<{ explanation_asset_id?: string; confidence_label?: string }>(assets.quality),
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
