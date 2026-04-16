import type { CareerRuntimeConfigResponseRaw } from "@/lib/career/api/types";
import type {
  CareerExplorerPrimaryPathVariant,
  CareerRuntimeConfigAdapter,
  CareerTransitionEmphasisVariant,
  CareerWarningCopyVariant,
} from "@/lib/career/adapters/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeWarningVariant(value: unknown): CareerWarningCopyVariant {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "softer" || normalized === "strict") {
    return normalized;
  }
  return "control";
}

function normalizeExplorerVariant(value: unknown): CareerExplorerPrimaryPathVariant {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "guided_discovery") {
    return "guided_discovery";
  }
  return "jobs_first";
}

function normalizeTransitionVariant(value: unknown): CareerTransitionEmphasisVariant {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "risk_first" || normalized === "upside_first") {
    return normalized;
  }
  return "balanced";
}

export function adaptCareerRuntimeConfig(payload: CareerRuntimeConfigResponseRaw | null): CareerRuntimeConfigAdapter {
  const raw = isRecord(payload) ? payload : {};
  const thresholds = isRecord(raw.thresholds) ? raw.thresholds : {};
  const confidence = isRecord(thresholds.confidence) ? thresholds.confidence : {};
  const warnings = isRecord(thresholds.warnings) ? thresholds.warnings : {};
  const promotion = isRecord(thresholds.promotion) ? thresholds.promotion : {};
  const experiments = isRecord(raw.experiments) ? raw.experiments : {};
  const warningCopy = isRecord(experiments.career_warning_copy_v1) ? experiments.career_warning_copy_v1 : {};
  const explorerPrimaryPath = isRecord(experiments.career_explorer_primary_path_v1)
    ? experiments.career_explorer_primary_path_v1
    : {};
  const transitionEmphasis = isRecord(experiments.career_transition_emphasis_v1)
    ? experiments.career_transition_emphasis_v1
    : {};

  return {
    authorityKind: normalizeString(raw.authority_kind, "career_threshold_experiment_authority"),
    authorityVersion: normalizeString(raw.authority_version, "career.threshold_experiment.v1"),
    snapshotKey: normalizeString(raw.snapshot_key, "career_default_v1"),
    thresholds: {
      confidence: {
        publishMin: normalizeNumber(confidence.publish_min, 60),
        promotionCandidateMin: normalizeNumber(confidence.promotion_candidate_min, 70),
        stableMin: normalizeNumber(confidence.stable_min, 75),
      },
      warnings: {
        lowConfidenceThreshold: normalizeNumber(warnings.low_confidence_threshold, 72),
        highStrainThreshold: normalizeNumber(warnings.high_strain_threshold, 70),
        aiRiskThreshold: normalizeNumber(warnings.ai_risk_threshold, 65),
      },
      promotion: {
        nextStepLinksMin: normalizeNumber(promotion.next_step_links_min, 2),
        strongClaimRequired: normalizeBoolean(promotion.strong_claim_required, true),
      },
    },
    experiments: {
      warningCopy: {
        enabled: normalizeBoolean(warningCopy.enabled, true),
        variant: normalizeWarningVariant(warningCopy.variant),
      },
      explorerPrimaryPath: {
        enabled: normalizeBoolean(explorerPrimaryPath.enabled, true),
        variant: normalizeExplorerVariant(explorerPrimaryPath.variant),
      },
      transitionEmphasis: {
        enabled: normalizeBoolean(transitionEmphasis.enabled, true),
        variant: normalizeTransitionVariant(transitionEmphasis.variant),
      },
    },
  };
}

