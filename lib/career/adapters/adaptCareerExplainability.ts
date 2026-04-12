import { normalizeCareerClaimPermissions } from "@/lib/career/contracts";
import type { CareerExplainabilityResponseRaw } from "@/lib/career/api/types";
import type {
  CareerExplainabilityAdapter,
  CareerExplainabilityScoreDimensionAdapter,
  CareerIntegritySummaryAdapter,
  CareerWarningsAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerExplainabilityInput = {
  payload: CareerExplainabilityResponseRaw | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapPayload<T extends { data?: unknown }>(payload: T | null): Record<string, unknown> | null {
  if (!payload) {
    return null;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  return isRecord(payload) ? payload : null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildWarnings(raw: Record<string, unknown>): CareerWarningsAdapter {
  const warnings = isRecord(raw.warnings) ? raw.warnings : {};

  return {
    redFlags: normalizeStringArray(warnings.red_flags),
    amberFlags: normalizeStringArray(warnings.amber_flags),
    blockedClaims: normalizeStringArray(warnings.blocked_claims),
  };
}

function buildIntegritySummary(raw: Record<string, unknown>): CareerIntegritySummaryAdapter {
  const summary = isRecord(raw.integrity_summary) ? raw.integrity_summary : {};

  return {
    integrityState: normalizeString(summary.overall_state) ?? normalizeString(summary.integrity_state) ?? null,
    criticalMissingFields: normalizeStringArray(summary.critical_missing_fields),
    confidenceCap: normalizeNumber(summary.confidence_cap),
    degradationFactor: normalizeNumber(summary.degradation_factor),
  };
}

function buildExplainabilityDimension(value: unknown): CareerExplainabilityScoreDimensionAdapter {
  const raw = isRecord(value) ? value : {};

  const components = isRecord(raw.components)
    ? Object.fromEntries(
        Object.entries(raw.components).map(([key, componentValue]) => [key, normalizeNumber(componentValue)])
      )
    : {};

  const penalties = Array.isArray(raw.penalties)
    ? raw.penalties
        .filter(isRecord)
        .map((penalty) => ({
          code: normalizeString(penalty.code) ?? "unspecified_penalty",
          value: normalizeNumber(penalty.value),
          reason: normalizeString(penalty.reason),
        }))
    : [];

  return {
    value: normalizeNumber(raw.value),
    integrityState: normalizeString(raw.integrity_state) ?? "missing",
    criticalMissingFields: normalizeStringArray(raw.critical_missing_fields),
    confidenceCap: normalizeNumber(raw.confidence_cap),
    formulaVersion: normalizeString(raw.formula_version),
    components,
    penalties,
    degradationFactor: normalizeNumber(raw.degradation_factor),
  };
}

export function adaptCareerExplainability(input: AdaptCareerExplainabilityInput): CareerExplainabilityAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const subjectIdentity = isRecord(raw.subject_identity) ? raw.subject_identity : {};
  const scoreBundle = isRecord(raw.score_bundle) ? raw.score_bundle : {};
  const subjectKind = normalizeString(raw.subject_kind);

  if (subjectKind !== "job" && subjectKind !== "recommendation") {
    return null;
  }

  return {
    summaryKind: normalizeString(raw.summary_kind) ?? "career_explainability",
    summaryVersion: normalizeString(raw.summary_version) ?? "career.explainability.v1",
    subjectKind,
    subjectIdentity: {
      occupationUuid: normalizeString(subjectIdentity.occupation_uuid),
      canonicalSlug: normalizeString(subjectIdentity.canonical_slug),
      canonicalTitleEn: normalizeString(subjectIdentity.canonical_title_en),
      publicRouteSlug: normalizeString(subjectIdentity.public_route_slug),
      type: normalizeString(subjectIdentity.type),
      canonicalTypeCode: normalizeString(subjectIdentity.canonical_type_code),
      displayTitle: normalizeString(subjectIdentity.display_title),
    },
    scoreBundle: {
      fitScore: buildExplainabilityDimension(scoreBundle.fit_score),
      strainScore: buildExplainabilityDimension(scoreBundle.strain_score),
      aiSurvivalScore: buildExplainabilityDimension(scoreBundle.ai_survival_score),
      mobilityScore: buildExplainabilityDimension(scoreBundle.mobility_score),
      confidenceScore: buildExplainabilityDimension(scoreBundle.confidence_score),
    },
    warnings: buildWarnings(raw),
    claimPermissions: normalizeCareerClaimPermissions(raw.claim_permissions),
    integritySummary: buildIntegritySummary(raw),
  };
}

export function adaptCareerJobExplainability(payload: CareerExplainabilityResponseRaw | null) {
  const adapted = adaptCareerExplainability({ payload });
  return adapted?.subjectKind === "job" ? adapted : null;
}

export function adaptCareerRecommendationExplainability(payload: CareerExplainabilityResponseRaw | null) {
  const adapted = adaptCareerExplainability({ payload });
  return adapted?.subjectKind === "recommendation" ? adapted : null;
}
