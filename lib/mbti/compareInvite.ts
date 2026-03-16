import type {
  MbtiCompareAxisRaw,
  MbtiCompareInviteResponse,
  MbtiCompareSummaryRaw,
} from "@/lib/api/v0_3";
import {
  normalizeMbtiPublicProjectionCard,
  type MbtiPublicProjectionCardViewModel,
} from "@/lib/mbti/publicProjection";

export type MbtiCompareAxisViewModel = {
  key: string;
  label: string;
  summary: string;
  state: string;
  inviterSide: string;
  inviteeSide: string;
};

export type MbtiCompareSummaryViewModel = {
  title: string;
  summary: string;
  sharedCount: number | null;
  divergingCount: number | null;
  axes: MbtiCompareAxisViewModel[];
};

export type MbtiCompareInviteViewModel = {
  inviteId: string;
  shareId: string;
  status: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  inviterCard: MbtiPublicProjectionCardViewModel | null;
  inviteeCard: MbtiPublicProjectionCardViewModel | null;
  compareSummary: MbtiCompareSummaryViewModel | null;
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

function normalizeAxis(axis: MbtiCompareAxisRaw, index: number): MbtiCompareAxisViewModel | null {
  const key = normalizeText(axis.code, index + 1);
  const label = normalizeText(axis.label, axis.code);
  if (!label) {
    return null;
  }

  return {
    key,
    label,
    summary: normalizeText(axis.summary),
    state: normalizeText(axis.state),
    inviterSide: normalizeText(axis.inviter_side),
    inviteeSide: normalizeText(axis.invitee_side),
  };
}

export function normalizeMbtiCompareSummary(
  rawCompareSummary?: MbtiCompareSummaryRaw | null
): MbtiCompareSummaryViewModel | null {
  if (!rawCompareSummary || typeof rawCompareSummary !== "object") {
    return null;
  }

  return {
    title: normalizeText(rawCompareSummary.title),
    summary: normalizeText(rawCompareSummary.summary),
    sharedCount: normalizeCount(rawCompareSummary.shared_count),
    divergingCount: normalizeCount(rawCompareSummary.diverging_count),
    axes: Array.isArray(rawCompareSummary.axes)
      ? rawCompareSummary.axes
          .map(normalizeAxis)
          .filter((axis): axis is MbtiCompareAxisViewModel => Boolean(axis))
      : [],
  };
}

export function buildCompareInviteViewModel(
  rawCompareInvite?: MbtiCompareInviteResponse | null
): MbtiCompareInviteViewModel {
  return {
    inviteId: normalizeText(rawCompareInvite?.invite_id),
    shareId: normalizeText(rawCompareInvite?.share_id),
    status: normalizeText(rawCompareInvite?.status).toLowerCase() || "pending",
    primaryCtaLabel: normalizeText(rawCompareInvite?.primary_cta_label),
    primaryCtaPath: normalizeText(rawCompareInvite?.primary_cta_path),
    inviterCard: normalizeMbtiPublicProjectionCard(rawCompareInvite?.inviter?.mbti_public_projection_v1),
    inviteeCard: normalizeMbtiPublicProjectionCard(rawCompareInvite?.invitee?.mbti_public_projection_v1),
    compareSummary: normalizeMbtiCompareSummary(rawCompareInvite?.compare),
  };
}
