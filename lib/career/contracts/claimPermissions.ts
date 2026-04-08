export type CareerClaimPermissions = {
  allow_strong_claim: boolean;
  allow_salary_comparison: boolean;
  allow_ai_strategy: boolean;
  allow_transition_recommendation: boolean;
  allow_cross_market_pay_copy: boolean;
  reason_codes: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function normalizeReasonCodes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

export function createConservativeCareerClaimPermissions(reasonCodes: string[] = []): CareerClaimPermissions {
  return {
    allow_strong_claim: false,
    allow_salary_comparison: false,
    allow_ai_strategy: false,
    allow_transition_recommendation: false,
    allow_cross_market_pay_copy: false,
    reason_codes: normalizeReasonCodes(reasonCodes),
  };
}

export function normalizeCareerClaimPermissions(value: unknown): CareerClaimPermissions {
  if (!isRecord(value)) {
    return createConservativeCareerClaimPermissions(["missing_claim_permissions"]);
  }

  return {
    allow_strong_claim: isBoolean(value.allow_strong_claim) ? value.allow_strong_claim : false,
    allow_salary_comparison: isBoolean(value.allow_salary_comparison) ? value.allow_salary_comparison : false,
    allow_ai_strategy: isBoolean(value.allow_ai_strategy) ? value.allow_ai_strategy : false,
    allow_transition_recommendation: isBoolean(value.allow_transition_recommendation)
      ? value.allow_transition_recommendation
      : false,
    allow_cross_market_pay_copy: isBoolean(value.allow_cross_market_pay_copy)
      ? value.allow_cross_market_pay_copy
      : false,
    reason_codes: normalizeReasonCodes(value.reason_codes),
  };
}

export function isCareerClaimPermissions(value: unknown): value is CareerClaimPermissions {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isBoolean(value.allow_strong_claim) &&
    isBoolean(value.allow_salary_comparison) &&
    isBoolean(value.allow_ai_strategy) &&
    isBoolean(value.allow_transition_recommendation) &&
    isBoolean(value.allow_cross_market_pay_copy) &&
    Array.isArray(value.reason_codes) &&
    value.reason_codes.every((item) => typeof item === "string")
  );
}
