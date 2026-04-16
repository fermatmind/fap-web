import type {
  CareerCrosswalkOverrideSummaryResponseRaw,
  CareerCrosswalkPatchHistoryResponseRaw,
  CareerCrosswalkReviewQueueResponseRaw,
} from "@/lib/career/api/types";
import type {
  CareerCrosswalkOpsQueueAdapter,
  CareerCrosswalkOpsQueueItemAdapter,
  CareerCrosswalkOverrideSummaryAdapter,
  CareerCrosswalkPatchHistoryAdapter,
  CareerCrosswalkPatchRecordAdapter,
} from "@/lib/career/adapters/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item));
}

function adaptPatchRecord(raw: unknown): CareerCrosswalkPatchRecordAdapter | null {
  const record = isRecord(raw) ? raw : null;
  if (!record) return null;

  return {
    patchKey: asString(record.patch_key) ?? "",
    patchVersion: asString(record.patch_version) ?? "v0",
    patchStatus: asString(record.patch_status) ?? "draft",
    subjectSlug: asString(record.subject_slug),
    targetKind: asString(record.target_kind),
    targetSlug: asString(record.target_slug),
    crosswalkModeOverride: asString(record.crosswalk_mode_override),
    reviewNotes: asString(record.review_notes),
    createdBy: asString(record.created_by),
    reviewedBy: asString(record.reviewed_by),
    createdAt: asString(record.created_at),
    reviewedAt: asString(record.reviewed_at),
    isLatest: asBoolean(record.is_latest, false),
  };
}

function adaptQueueItem(raw: unknown): CareerCrosswalkOpsQueueItemAdapter | null {
  const item = isRecord(raw) ? raw : null;
  if (!item) return null;
  const slug = asString(item.subject_slug);
  if (!slug) return null;

  return {
    subjectSlug: slug,
    canonicalTitleEn: asString(item.canonical_title_en),
    familySlug: asString(item.family_slug),
    currentCrosswalkMode: asString(item.current_crosswalk_mode),
    candidateTargetKind: asString(item.candidate_target_kind),
    candidateTargetSlug: asString(item.candidate_target_slug),
    queueReasons: asStringArray(item.queue_reason),
    requiresEditorialPatch: asBoolean(item.requires_editorial_patch),
    batchOrigin: asString(item.batch_origin),
    publishTrack: asString(item.publish_track),
    blockingFlags: asStringArray(item.blocking_flags),
    hasApprovedPatch: asBoolean(item.has_approved_patch),
    latestPatchKey: asString(item.latest_patch_key),
    latestPatchStatus: asString(item.latest_patch_status),
    latestPatchVersion: asString(item.latest_patch_version),
    latestPatchCreatedAt: asString(item.latest_patch_created_at),
  };
}

export function adaptCareerCrosswalkQueue(payload: CareerCrosswalkReviewQueueResponseRaw | null): CareerCrosswalkOpsQueueAdapter {
  const raw = isRecord(payload) ? payload : {};
  const rawCounts = isRecord(raw.counts) ? raw.counts : {};
  const counts = Object.fromEntries(
    Object.entries(rawCounts).map(([key, value]) => [key, asNumber(value, 0)])
  );

  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => adaptQueueItem(item)).filter((item): item is CareerCrosswalkOpsQueueItemAdapter => item !== null)
    : [];

  return {
    queueKind: asString(raw.queue_kind) ?? "career_crosswalk_review_queue_read_model",
    queueVersion: asString(raw.queue_version) ?? "career.crosswalk.review_queue.read_model.v1",
    scope: asString(raw.scope) ?? "career_crosswalk_editorial_ops",
    counts,
    items,
  };
}

export function adaptCareerCrosswalkPatchHistory(
  payload: CareerCrosswalkPatchHistoryResponseRaw | null
): CareerCrosswalkPatchHistoryAdapter {
  const raw = isRecord(payload) ? payload : {};
  const patches = Array.isArray(raw.patches)
    ? raw.patches.map((item) => adaptPatchRecord(item)).filter((item): item is CareerCrosswalkPatchRecordAdapter => item !== null)
    : [];
  const latestPatch = adaptPatchRecord(raw.latest_patch);

  return {
    historyKind: asString(raw.history_kind) ?? "career_editorial_patch_history",
    historyVersion: asString(raw.history_version) ?? "career.editorial_patch.history.v1",
    subjectSlug: asString(raw.subject_slug) ?? "",
    count: asNumber(raw.count, patches.length),
    patches,
    latestPatch,
  };
}

export function adaptCareerCrosswalkOverrideSummary(
  payload: CareerCrosswalkOverrideSummaryResponseRaw | null
): CareerCrosswalkOverrideSummaryAdapter {
  const raw = isRecord(payload) ? payload : {};

  return {
    overrideKind: asString(raw.override_kind) ?? "career_crosswalk_override_read_model",
    overrideVersion: asString(raw.override_version) ?? "career.crosswalk.override.read_model.v1",
    subjectSlug: asString(raw.subject_slug) ?? "",
    canonicalTitleEn: asString(raw.canonical_title_en),
    originalCrosswalkMode: asString(raw.original_crosswalk_mode),
    resolvedCrosswalkMode: asString(raw.resolved_crosswalk_mode),
    resolvedTargetKind: asString(raw.resolved_target_kind),
    resolvedTargetSlug: asString(raw.resolved_target_slug),
    overrideApplied: asBoolean(raw.override_applied),
    appliedPatchKey: asString(raw.applied_patch_key),
  };
}

