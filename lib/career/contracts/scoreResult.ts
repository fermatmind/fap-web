export type CareerScoreComponentBreakdown = Record<string, number | null>;

export type CareerScorePenalty = {
  code: string;
  value: number | null;
  reason: string | null;
};

export type CareerScoreResult = {
  value: number | null;
  integrity_state: string;
  critical_missing_fields: string[];
  confidence_cap: number | null;
  formula_ref: string | null;
  component_breakdown: CareerScoreComponentBreakdown;
  penalties: CareerScorePenalty[];
  degradation_factor: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function normalizeComponentBreakdown(value: unknown): CareerScoreComponentBreakdown {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, normalizeNumber(nestedValue)])
  );
}

function normalizePenalties(value: unknown): CareerScorePenalty[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      code: normalizeString(item.code) ?? "unspecified_penalty",
      value: normalizeNumber(item.value),
      reason: normalizeString(item.reason),
    }));
}

export function createUnavailableCareerScoreResult(reason: string): CareerScoreResult {
  return {
    value: null,
    integrity_state: "missing",
    critical_missing_fields: [reason],
    confidence_cap: null,
    formula_ref: null,
    component_breakdown: {},
    penalties: [],
    degradation_factor: null,
  };
}

export function normalizeCareerScoreResult(value: unknown, reason = "missing_score_result"): CareerScoreResult {
  if (!isRecord(value)) {
    return createUnavailableCareerScoreResult(reason);
  }

  return {
    value: normalizeNumber(value.value),
    integrity_state: normalizeString(value.integrity_state) ?? "missing",
    critical_missing_fields: normalizeStringArray(value.critical_missing_fields),
    confidence_cap: normalizeNumber(value.confidence_cap),
    formula_ref: normalizeString(value.formula_ref),
    component_breakdown: normalizeComponentBreakdown(value.component_breakdown),
    penalties: normalizePenalties(value.penalties),
    degradation_factor: normalizeNumber(value.degradation_factor),
  };
}

export function isCareerScoreResult(value: unknown): value is CareerScoreResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    "value" in value &&
    typeof value.integrity_state === "string" &&
    Array.isArray(value.critical_missing_fields) &&
    typeof value.component_breakdown === "object" &&
    Array.isArray(value.penalties) &&
    "degradation_factor" in value
  );
}
