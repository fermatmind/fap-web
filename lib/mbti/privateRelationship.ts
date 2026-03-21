import type {
  DyadicConsentRaw,
  DyadicGraphRaw,
  PrivateMbtiRelationshipResponse,
  PrivateRelationshipActionPromptRaw,
  PrivateRelationshipRaw,
  PrivateRelationshipSectionRaw,
} from "@/lib/api/v0_3";
import { normalizeDyadicGraph, type DyadicGraphViewModel } from "@/lib/mbti/compareInvite";
import {
  normalizeMbtiPublicProjectionCard,
  type MbtiPublicProjectionCardViewModel,
} from "@/lib/mbti/publicProjection";

export type PrivateRelationshipSectionViewModel = {
  key: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type PrivateRelationshipActionPromptViewModel = {
  key: string;
  title: string;
  summary: string;
  ctaLabel: string;
  ctaPath: string;
};

export type PrivateRelationshipViewModel = {
  contractVersion: string;
  fingerprintVersion: string;
  fingerprint: string;
  scope: string;
  accessState: string;
  subjectJoinMode: string;
  participantRole: string;
  sharedCount: number | null;
  divergingCount: number | null;
  frictionKeys: string[];
  complementKeys: string[];
  communicationBridgeKeys: string[];
  decisionTensionKeys: string[];
  stressInterplayKeys: string[];
  overviewTitle: string;
  overviewSummary: string;
  inviterCard: MbtiPublicProjectionCardViewModel | null;
  inviteeCard: MbtiPublicProjectionCardViewModel | null;
  sections: PrivateRelationshipSectionViewModel[];
  actionPrompt: PrivateRelationshipActionPromptViewModel | null;
};

export type DyadicConsentViewModel = {
  contractVersion: string;
  scope: string;
  accessState: string;
  consentState: string;
  consentFingerprint: string;
  consentRefreshRequired: boolean;
  privateRelationshipAccessVersion: string;
  revocationState: string;
  expiryState: string;
  subjectJoinMode: string;
  acceptedAt: string;
  completedAt: string;
  purchasedAt: string;
};

export type PrivateMbtiRelationshipViewModel = {
  inviteId: string;
  shareId: string;
  status: string;
  relationship: PrivateRelationshipViewModel | null;
  consent: DyadicConsentViewModel | null;
  dyadicGraph: DyadicGraphViewModel | null;
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

function normalizeCount(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));
}

function normalizePrivateSection(
  rawSection: PrivateRelationshipSectionRaw,
  index: number
): PrivateRelationshipSectionViewModel | null {
  const key = normalizeText(rawSection.key, index + 1);
  const title = normalizeText(rawSection.title);
  if (!key || !title) {
    return null;
  }

  return {
    key,
    title,
    summary: normalizeText(rawSection.summary),
    bullets: normalizeStringArray(rawSection.bullets),
  };
}

function normalizePrivateActionPrompt(
  rawActionPrompt?: PrivateRelationshipActionPromptRaw | null
): PrivateRelationshipActionPromptViewModel | null {
  if (!rawActionPrompt || typeof rawActionPrompt !== "object") {
    return null;
  }

  const key = normalizeText(rawActionPrompt.key);
  const title = normalizeText(rawActionPrompt.title);
  const summary = normalizeText(rawActionPrompt.summary);
  if (!key && !title && !summary) {
    return null;
  }

  return {
    key,
    title,
    summary,
    ctaLabel: normalizeText(rawActionPrompt.cta_label),
    ctaPath: normalizeText(rawActionPrompt.cta_path),
  };
}

export function normalizePrivateRelationship(
  rawRelationship?: PrivateRelationshipRaw | null
): PrivateRelationshipViewModel | null {
  if (!rawRelationship || typeof rawRelationship !== "object") {
    return null;
  }

  return {
    contractVersion: normalizeText(rawRelationship.relationship_contract_version, rawRelationship.version),
    fingerprintVersion: normalizeText(rawRelationship.relationship_fingerprint_version),
    fingerprint: normalizeText(rawRelationship.relationship_fingerprint),
    scope: normalizeText(rawRelationship.relationship_scope),
    accessState: normalizeText(rawRelationship.access_state),
    subjectJoinMode: normalizeText(rawRelationship.subject_join_mode),
    participantRole: normalizeText(rawRelationship.participant_role),
    sharedCount: normalizeCount(rawRelationship.shared_count),
    divergingCount: normalizeCount(rawRelationship.diverging_count),
    frictionKeys: normalizeStringArray(rawRelationship.friction_keys),
    complementKeys: normalizeStringArray(rawRelationship.complement_keys),
    communicationBridgeKeys: normalizeStringArray(rawRelationship.communication_bridge_keys),
    decisionTensionKeys: normalizeStringArray(rawRelationship.decision_tension_keys),
    stressInterplayKeys: normalizeStringArray(rawRelationship.stress_interplay_keys),
    overviewTitle: normalizeText(rawRelationship.overview?.title),
    overviewSummary: normalizeText(rawRelationship.overview?.summary),
    inviterCard: normalizeMbtiPublicProjectionCard(rawRelationship.inviter_summary?.mbti_public_projection_v1),
    inviteeCard: normalizeMbtiPublicProjectionCard(rawRelationship.invitee_summary?.mbti_public_projection_v1),
    sections: Array.isArray(rawRelationship.private_sync_sections)
      ? rawRelationship.private_sync_sections
          .map(normalizePrivateSection)
          .filter((section): section is PrivateRelationshipSectionViewModel => Boolean(section))
      : [],
    actionPrompt: normalizePrivateActionPrompt(rawRelationship.private_action_prompt),
  };
}

export function normalizeDyadicConsent(rawConsent?: DyadicConsentRaw | null): DyadicConsentViewModel | null {
  if (!rawConsent || typeof rawConsent !== "object") {
    return null;
  }

  return {
    contractVersion: normalizeText(rawConsent.consent_artifact_version, rawConsent.version),
    scope: normalizeText(rawConsent.consent_scope),
    accessState: normalizeText(rawConsent.access_state),
    consentState: normalizeText(rawConsent.consent_state),
    consentFingerprint: normalizeText(rawConsent.consent_fingerprint),
    consentRefreshRequired: Boolean(rawConsent.consent_refresh_required),
    privateRelationshipAccessVersion: normalizeText(rawConsent.private_relationship_access_version),
    revocationState: normalizeText(rawConsent.revocation_state),
    expiryState: normalizeText(rawConsent.expiry_state),
    subjectJoinMode: normalizeText(rawConsent.subject_join_mode),
    acceptedAt: normalizeText(rawConsent.accepted_at),
    completedAt: normalizeText(rawConsent.completed_at),
    purchasedAt: normalizeText(rawConsent.purchased_at),
  };
}

export function buildPrivateMbtiRelationshipViewModel(
  rawRelationship?: PrivateMbtiRelationshipResponse | null
): PrivateMbtiRelationshipViewModel {
  return {
    inviteId: normalizeText(rawRelationship?.invite_id),
    shareId: normalizeText(rawRelationship?.share_id),
    status: normalizeText(rawRelationship?.status).toLowerCase() || "pending",
    relationship: normalizePrivateRelationship(rawRelationship?.private_relationship_v1),
    consent: normalizeDyadicConsent(rawRelationship?.dyadic_consent_v1),
    dyadicGraph: normalizeDyadicGraph(rawRelationship?.dyadic_graph_v1 as DyadicGraphRaw | null | undefined),
  };
}
