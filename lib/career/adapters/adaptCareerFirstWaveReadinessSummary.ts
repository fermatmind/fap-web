import type { CareerFirstWaveReadinessSummaryResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFirstWaveReadinessOccupationAdapter,
  CareerFirstWaveReadinessStatus,
  CareerFirstWaveReadinessSummaryAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerFirstWaveReadinessSummaryInput = {
  payload: CareerFirstWaveReadinessSummaryResponseRaw | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeStatus(value: unknown): CareerFirstWaveReadinessStatus | null {
  const normalized = normalizeString(value);

  if (
    normalized === "publish_ready" ||
    normalized === "blocked_override_eligible" ||
    normalized === "blocked_not_safely_remediable" ||
    normalized === "partial_raw"
  ) {
    return normalized;
  }

  return null;
}

function adaptOccupation(raw: Record<string, unknown>): CareerFirstWaveReadinessOccupationAdapter | null {
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const status = normalizeStatus(raw.status);

  if (!canonicalSlug || !status) {
    return null;
  }

  return {
    occupationUuid: normalizeString(raw.occupation_uuid),
    canonicalSlug,
    canonicalTitleEn: normalizeString(raw.canonical_title_en),
    status,
    blockerType: normalizeString(raw.blocker_type),
    remediationClass: normalizeString(raw.remediation_class),
    authorityOverrideSupplied: raw.authority_override_supplied === true,
    reviewRequired: raw.review_required === true,
    crosswalkMode: normalizeString(raw.crosswalk_mode),
    reviewerStatus: normalizeString(raw.reviewer_status),
    indexState: normalizeString(raw.index_state),
    indexEligible: normalizeBoolean(raw.index_eligible),
    reasonCodes: normalizeStringArray(raw.reason_codes),
  };
}

export function adaptCareerFirstWaveReadinessSummary(
  input: AdaptCareerFirstWaveReadinessSummaryInput
): CareerFirstWaveReadinessSummaryAdapter | null {
  const raw = input.payload;
  if (!raw || !isRecord(raw)) {
    return null;
  }

  const counts = isRecord(raw.counts) ? raw.counts : {};
  const occupations = Array.isArray(raw.occupations)
    ? raw.occupations.filter(isRecord).map(adaptOccupation).filter((item): item is CareerFirstWaveReadinessOccupationAdapter => item !== null)
    : [];

  return {
    authoritySource: "career_backend_first_wave_readiness_summary.v0.5",
    summaryKind: normalizeString(raw.summary_kind) ?? "career_first_wave_readiness",
    summaryVersion: normalizeString(raw.summary_version) ?? "unknown",
    waveName: normalizeString(raw.wave_name) ?? "unknown",
    counts: {
      total: normalizeNumber(counts.total),
      publishReady: normalizeNumber(counts.publish_ready),
      blockedOverrideEligible: normalizeNumber(counts.blocked_override_eligible),
      blockedNotSafelyRemediable: normalizeNumber(counts.blocked_not_safely_remediable),
      blockedTotal: normalizeNumber(counts.blocked_total),
      partialRaw: normalizeNumber(counts.partial_raw),
    },
    occupations,
    occupationsBySlug: Object.fromEntries(occupations.map((occupation) => [occupation.canonicalSlug, occupation])),
  };
}
