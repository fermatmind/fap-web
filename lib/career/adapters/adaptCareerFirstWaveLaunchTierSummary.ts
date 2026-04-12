import type { CareerFirstWaveLaunchTierResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFirstWaveLaunchTier,
  CareerFirstWaveLaunchTierOccupationAdapter,
  CareerFirstWaveLaunchTierSummaryAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerFirstWaveLaunchTierSummaryInput = {
  payload: CareerFirstWaveLaunchTierResponseRaw | null;
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

function normalizeNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeLaunchTier(value: unknown): CareerFirstWaveLaunchTier | null {
  const normalized = normalizeString(value);

  if (normalized === "stable" || normalized === "candidate" || normalized === "hold") {
    return normalized;
  }

  return null;
}

function adaptOccupation(raw: Record<string, unknown>): CareerFirstWaveLaunchTierOccupationAdapter | null {
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const launchTier = normalizeLaunchTier(raw.launch_tier);

  if (!canonicalSlug || !launchTier) {
    return null;
  }

  return {
    occupationUuid: normalizeString(raw.occupation_uuid),
    canonicalSlug,
    canonicalTitleEn: normalizeString(raw.canonical_title_en),
    launchTier,
    readinessStatus: normalizeString(raw.readiness_status),
    lifecycleState: normalizeString(raw.lifecycle_state),
    publicIndexState: normalizeString(raw.public_index_state),
    indexEligible: normalizeBoolean(raw.index_eligible),
    reviewerStatus: normalizeString(raw.reviewer_status),
    crosswalkMode: normalizeString(raw.crosswalk_mode),
    allowStrongClaim: raw.allow_strong_claim === true,
    confidenceScore: normalizeNullableNumber(raw.confidence_score),
    blockedGovernanceStatus: normalizeString(raw.blocked_governance_status),
    reasonCodes: normalizeStringArray(raw.reason_codes),
  };
}

export function adaptCareerFirstWaveLaunchTierSummary(
  input: AdaptCareerFirstWaveLaunchTierSummaryInput
): CareerFirstWaveLaunchTierSummaryAdapter | null {
  const raw = input.payload;
  if (!raw || !isRecord(raw)) {
    return null;
  }

  const counts = isRecord(raw.counts) ? raw.counts : {};
  const occupations = Array.isArray(raw.occupations)
    ? raw.occupations
        .filter(isRecord)
        .map(adaptOccupation)
        .filter((item): item is CareerFirstWaveLaunchTierOccupationAdapter => item !== null)
    : [];

  return {
    authoritySource: "career_backend_first_wave_launch_tier.v0.5",
    summaryKind: normalizeString(raw.summary_kind) ?? "career_first_wave_launch_tier",
    summaryVersion: normalizeString(raw.summary_version) ?? "unknown",
    scope: normalizeString(raw.scope) ?? "unknown",
    counts: {
      total: normalizeNumber(counts.total),
      stable: normalizeNumber(counts.stable),
      candidate: normalizeNumber(counts.candidate),
      hold: normalizeNumber(counts.hold),
    },
    occupations,
    occupationsBySlug: Object.fromEntries(occupations.map((occupation) => [occupation.canonicalSlug, occupation])),
    launchTierBySlug: Object.fromEntries(occupations.map((occupation) => [occupation.canonicalSlug, occupation.launchTier])),
  };
}
