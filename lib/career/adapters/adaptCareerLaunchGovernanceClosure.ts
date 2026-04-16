import type { CareerLaunchGovernanceClosureResponseRaw } from "@/lib/career/api/types";
import type {
  CareerLaunchGovernanceClosureAdapter,
  CareerLaunchGovernanceClosureMemberAdapter,
  CareerLaunchGovernanceState,
  CareerOperationsState,
} from "@/lib/career/adapters/types";

type AdaptCareerLaunchGovernanceClosureInput = {
  payload: CareerLaunchGovernanceClosureResponseRaw | null;
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function normalizeGovernanceState(value: unknown): CareerLaunchGovernanceState | null {
  const state = normalizeString(value);
  if (
    state === "mature_public_launch" ||
    state === "public_but_conservative" ||
    state === "not_yet_mature"
  ) {
    return state;
  }

  return null;
}

function normalizeOperationsState(value: unknown): CareerOperationsState | null {
  const state = normalizeString(value);
  if (state === "strong_operations_ready" || state === "not_strong_operations_ready") {
    return state;
  }

  return null;
}

function adaptMember(raw: Record<string, unknown>): CareerLaunchGovernanceClosureMemberAdapter | null {
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const governanceState = normalizeGovernanceState(raw.governance_state);
  const operationsState = normalizeOperationsState(raw.operations_state);
  const releaseState = normalizeString(raw.release_state);
  const strongIndexState = normalizeString(raw.strong_index_state);

  if (!canonicalSlug || !governanceState || !operationsState || !releaseState || !strongIndexState) {
    return null;
  }

  return {
    canonicalSlug,
    releaseState,
    strongIndexState,
    operationsState,
    governanceState,
    strongIndexReady: raw.strong_index_ready === true,
    strongOperationsReady: raw.strong_operations_ready === true,
    blockingReasons: normalizeStringArray(raw.blocking_reasons),
  };
}

export function adaptCareerLaunchGovernanceClosure(
  input: AdaptCareerLaunchGovernanceClosureInput
): CareerLaunchGovernanceClosureAdapter | null {
  const payload = input.payload;
  if (!payload || !isRecord(payload)) {
    return null;
  }

  const counts = isRecord(payload.counts) ? payload.counts : {};
  const trackingCounts = isRecord(counts.tracking_counts) ? counts.tracking_counts : {};
  const summary = isRecord(counts.summary) ? counts.summary : {};
  const publicStatement = isRecord(payload.public_statement) ? payload.public_statement : {};

  const members = Array.isArray(payload.members)
    ? payload.members
        .filter(isRecord)
        .map(adaptMember)
        .filter((member): member is CareerLaunchGovernanceClosureMemberAdapter => member !== null)
    : [];

  return {
    authoritySource: "career_backend_launch_governance_closure.v0.5",
    governanceKind: normalizeString(payload.governance_kind) ?? "career_launch_governance_closure",
    governanceVersion: normalizeString(payload.governance_version) ?? "unknown",
    scope: normalizeString(payload.scope) ?? "career_all_342",
    trackingCounts: {
      expectedTotalOccupations: normalizeNumber(trackingCounts.expected_total_occupations),
      trackedTotalOccupations: normalizeNumber(trackingCounts.tracked_total_occupations),
      trackingComplete: trackingCounts.tracking_complete === true,
    },
    summary: {
      maturePublicLaunchCount: normalizeNumber(summary.mature_public_launch_count),
      publicButConservativeCount: normalizeNumber(summary.public_but_conservative_count),
      strongIndexReadyCount: normalizeNumber(summary.strong_index_ready_count),
      strongOperationsReadyCount: normalizeNumber(summary.strong_operations_ready_count),
      notYetReadyCount: normalizeNumber(summary.not_yet_ready_count),
    },
    publicStatement: {
      canClaimMaturePublicLaunch: publicStatement.can_claim_mature_public_launch === true,
      canClaimStrongIndexReady: publicStatement.can_claim_strong_index_ready === true,
      canClaimStrongOperationsReady: publicStatement.can_claim_strong_operations_ready === true,
      allowedExternalStatement:
        normalizeString(publicStatement.allowed_external_statement) ??
        "Career governance closure requires cohort-qualified statement.",
    },
    members,
    membersBySlug: Object.fromEntries(members.map((member) => [member.canonicalSlug, member])),
  };
}

