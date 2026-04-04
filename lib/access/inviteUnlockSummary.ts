import type { UnifiedUnlockSource, UnifiedUnlockStage } from "@/lib/access/unifiedAccess";

export type InviteUnlockSummaryRaw = {
  unlock_stage?: "locked" | "partial" | "full" | string | null;
  unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
  completed_invitees?: number | null;
  required_invitees?: number | null;
  partial_scope?: string | null;
  label?: string | null;
  short_label?: string | null;
  [key: string]: unknown;
};

export type InviteUnlockSummaryView = {
  unlockStage: UnifiedUnlockStage;
  unlockSource: UnifiedUnlockSource;
  completedInvitees: number;
  requiredInvitees: number;
  partialScope: string | null;
  label: string | null;
  shortLabel: string | null;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeUnlockStage(value: unknown): UnifiedUnlockStage {
  const normalized = normalizeText(value);
  if (normalized === "partial" || normalized === "full") {
    return normalized;
  }

  return "locked";
}

function normalizeUnlockSource(value: unknown): UnifiedUnlockSource {
  const normalized = normalizeText(value);
  if (normalized === "invite" || normalized === "payment" || normalized === "mixed") {
    return normalized;
  }

  return "none";
}

function normalizeRequired(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = Math.floor(value);
    if (normalized > 0) {
      return normalized;
    }
  }

  return 2;
}

function normalizeCompleted(value: unknown, required: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = Math.floor(value);
    if (normalized >= 0) {
      return Math.min(required, normalized);
    }
  }

  return 0;
}

export function normalizeInviteUnlockSummary(
  raw: InviteUnlockSummaryRaw | null | undefined,
  fallback?: {
    unlockStage?: UnifiedUnlockStage | null;
    unlockSource?: UnifiedUnlockSource | null;
  }
): InviteUnlockSummaryView | null {
  if (!raw || typeof raw !== "object") {
    if (!fallback?.unlockStage && !fallback?.unlockSource) {
      return null;
    }

    return {
      unlockStage: normalizeUnlockStage(fallback?.unlockStage),
      unlockSource: normalizeUnlockSource(fallback?.unlockSource),
      completedInvitees: 0,
      requiredInvitees: 2,
      partialScope: null,
      label: null,
      shortLabel: null,
    };
  }

  const requiredInvitees = normalizeRequired(raw.required_invitees);

  return {
    unlockStage: normalizeUnlockStage(raw.unlock_stage ?? fallback?.unlockStage),
    unlockSource: normalizeUnlockSource(raw.unlock_source ?? fallback?.unlockSource),
    completedInvitees: normalizeCompleted(raw.completed_invitees, requiredInvitees),
    requiredInvitees,
    partialScope: normalizeText(raw.partial_scope),
    label: normalizeText(raw.label),
    shortLabel: normalizeText(raw.short_label),
  };
}

export function resolveInviteUnlockSummaryBadge(summary: InviteUnlockSummaryView | null, locale: "en" | "zh"): string | null {
  if (!summary) {
    return null;
  }

  if (summary.shortLabel) {
    return summary.shortLabel;
  }

  if (summary.unlockStage === "partial") {
    return locale === "zh" ? `邀请解锁 ${summary.completedInvitees}/${summary.requiredInvitees}` : `Invite ${summary.completedInvitees}/${summary.requiredInvitees}`;
  }

  if (summary.unlockStage === "full") {
    if (summary.unlockSource === "payment") {
      return locale === "zh" ? "支付解锁" : "Paid unlock";
    }
    if (summary.unlockSource === "mixed") {
      return locale === "zh" ? "邀请 + 支付" : "Invite + payment";
    }

    return locale === "zh" ? "邀请解锁完成" : "Invite complete";
  }

  return locale === "zh" ? `邀请进度 ${summary.completedInvitees}/${summary.requiredInvitees}` : `Invite ${summary.completedInvitees}/${summary.requiredInvitees}`;
}

export function resolveInviteUnlockSummaryLabel(summary: InviteUnlockSummaryView | null, locale: "en" | "zh"): string | null {
  if (!summary) {
    return null;
  }

  if (summary.label) {
    return summary.label;
  }

  if (summary.unlockStage === "partial") {
    return locale === "zh"
      ? `已邀请 ${summary.completedInvitees}/${summary.requiredInvitees}，职业章节已解锁`
      : `${summary.completedInvitees}/${summary.requiredInvitees} invitees complete, career unlocked`;
  }

  if (summary.unlockStage === "full") {
    if (summary.unlockSource === "payment") {
      return locale === "zh" ? "已支付解锁完整报告" : "Fully unlocked by payment";
    }
    if (summary.unlockSource === "mixed") {
      return locale === "zh" ? "邀请与支付共同解锁完整报告" : "Fully unlocked by invite + payment";
    }

    return locale === "zh" ? "邀请解锁已完成" : "Fully unlocked by invites";
  }

  return locale === "zh"
    ? `邀请进度 ${summary.completedInvitees}/${summary.requiredInvitees}`
    : `Invite progress ${summary.completedInvitees}/${summary.requiredInvitees}`;
}
