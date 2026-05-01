import type {
  MbtiRelationshipIndexResponse,
  RelationshipIndexItemRaw,
  RelationshipIndexRaw,
  RelationshipResumeRaw,
} from "@/lib/api/v0_3";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

export type RelationshipIndexEntrySummaryViewModel = {
  title: string;
  summary: string;
  badgeLabel: string;
  badgeKey: string;
};

export type RelationshipResumeViewModel = {
  version: string;
  resumeTarget: string;
  continueLabel: string;
  resumeReason: string;
  revisitReorderReason: string;
  relationshipEntryKeys: string[];
};

export type RelationshipIndexItemViewModel = {
  inviteId: string;
  relationshipScope: string;
  accessState: string;
  consentState: string;
  journeyState: string;
  progressState: string;
  participantRole: string;
  entrySummary: RelationshipIndexEntrySummaryViewModel;
  resumeTarget: string;
  revisitPriorityKeys: string[];
  lastDyadicPulseSignal: string;
  updatedAt: string;
  resume: RelationshipResumeViewModel | null;
};

export type RelationshipIndexViewModel = {
  version: string;
  fingerprint: string;
  scope: string;
  items: RelationshipIndexItemViewModel[];
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));
}

function normalizeResume(rawResume?: RelationshipResumeRaw | null): RelationshipResumeViewModel | null {
  if (!rawResume || typeof rawResume !== "object") {
    return null;
  }

  const resumeTarget = normalizeInternalHref(rawResume.resume_target);
  if (!resumeTarget) {
    return null;
  }

  return {
    version: normalizeText(rawResume.resume_version),
    resumeTarget,
    continueLabel: normalizeText(rawResume.continue_label),
    resumeReason: normalizeText(rawResume.resume_reason),
    revisitReorderReason: normalizeText(rawResume.revisit_reorder_reason),
    relationshipEntryKeys: normalizeStringArray(rawResume.relationship_entry_keys),
  };
}

function normalizeItem(rawItem: RelationshipIndexItemRaw): RelationshipIndexItemViewModel | null {
  const inviteId = normalizeText(rawItem.invite_id);
  const resume = normalizeResume(rawItem.relationship_resume_v1);
  const resumeTarget = normalizeInternalHref(rawItem.resume_target) || resume?.resumeTarget || "";
  if (!inviteId || !resumeTarget) {
    return null;
  }

  const badgeLabel = normalizeText(rawItem.entry_summary?.badge_label);
  const badgeKey = normalizeText(rawItem.entry_summary?.badge_key, resume?.relationshipEntryKeys[0], rawItem.revisit_priority_keys?.[0]);

  return {
    inviteId,
    relationshipScope: normalizeText(rawItem.relationship_scope),
    accessState: normalizeText(rawItem.access_state),
    consentState: normalizeText(rawItem.consent_state),
    journeyState: normalizeText(rawItem.journey_state),
    progressState: normalizeText(rawItem.progress_state),
    participantRole: normalizeText(rawItem.participant_role),
    entrySummary: {
      title: normalizeText(rawItem.entry_summary?.title),
      summary: normalizeText(rawItem.entry_summary?.summary),
      badgeLabel,
      badgeKey,
    },
    resumeTarget,
    revisitPriorityKeys: normalizeStringArray(rawItem.revisit_priority_keys),
    lastDyadicPulseSignal: normalizeText(rawItem.last_dyadic_pulse_signal),
    updatedAt: normalizeText(rawItem.updated_at),
    resume,
  };
}

export function normalizeRelationshipIndex(
  rawIndex?: RelationshipIndexRaw | null
): RelationshipIndexViewModel | null {
  if (!rawIndex || typeof rawIndex !== "object") {
    return null;
  }

  return {
    version: normalizeText(rawIndex.relationship_index_version),
    fingerprint: normalizeText(rawIndex.relationship_index_fingerprint),
    scope: normalizeText(rawIndex.index_scope),
    items: Array.isArray(rawIndex.items)
      ? rawIndex.items
          .map(normalizeItem)
          .filter((item): item is RelationshipIndexItemViewModel => Boolean(item))
      : [],
  };
}

export function buildRelationshipIndexViewModel(
  response?: MbtiRelationshipIndexResponse | null
): RelationshipIndexViewModel | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  return normalizeRelationshipIndex(response.relationship_index_v1);
}

export function resolveRelationshipIndexBucket(item: RelationshipIndexItemViewModel): string {
  return item.resume?.relationshipEntryKeys[0]
    || item.entrySummary.badgeKey
    || item.revisitPriorityKeys[0]
    || "recently_active";
}
