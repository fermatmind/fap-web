import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  normalizeInviteUnlockSummary,
  type InviteUnlockSummaryRaw,
  type InviteUnlockSummaryView,
} from "@/lib/access/inviteUnlockSummary";

type MbtiAccessState = "locked" | "ready" | "pending" | "recovery_available" | string;
type MbtiAccessSource = "report_gate" | "order_delivery" | "attempt_pdf" | "none" | string;
type MbtiWorkspaceEntryKind = "mbti_history" | string;

type MbtiAccessHubId = string | number | null | undefined;

export type MbtiAccessHubV1Raw = {
  access_state: MbtiAccessState;
  unlock_stage?: "locked" | "partial" | "full" | string | null;
  unlock_source?: "none" | "invite" | "payment" | "mixed" | string | null;
  invite_unlock_v1?: InviteUnlockSummaryRaw | null;
  report_access: {
    can_view_report: boolean;
    attempt_id: MbtiAccessHubId;
    order_no: string | null;
    report_url: string | null;
    source: "report_gate" | "order_delivery" | "none" | string;
  };
  pdf_access: {
    can_download_pdf: boolean;
    report_pdf_url: string | null;
    source: "attempt_pdf" | "order_delivery" | "none" | string;
  };
  recovery: {
    can_lookup_order: boolean;
    can_request_claim_email: boolean;
    can_resend: boolean;
    attempt_id: MbtiAccessHubId;
    share_id: string | null;
    compare_invite_id: string | null;
  };
  workspace_lite: {
    has_entry: boolean;
    entry_kind: MbtiWorkspaceEntryKind;
    attempt_id: MbtiAccessHubId;
  };
};

export type MbtiAccessHubLinks = {
  historyHref: string;
  lookupHref: string;
  orderHref: string | null;
  reportHref: string | null;
};

export type MbtiAccessHubViewModel = {
  accessState: MbtiAccessState;
  unlockStage: "locked" | "partial" | "full" | null;
  unlockSource: "none" | "invite" | "payment" | "mixed" | null;
  inviteUnlock: InviteUnlockSummaryView | null;
  reportAccess: {
    canViewReport: boolean;
    attemptId: string | null;
    orderNo: string | null;
    reportUrl: string | null;
    source: MbtiAccessSource;
    href: string | null;
  };
  pdfAccess: {
    canDownloadPdf: boolean;
    reportPdfUrl: string | null;
    source: MbtiAccessSource;
    href: string | null;
  };
  recovery: {
    canLookupOrder: boolean;
    canRequestClaimEmail: boolean;
    canResend: boolean;
    attemptId: string | null;
    shareId: string | null;
    compareInviteId: string | null;
    claimHref: string | null;
  };
  workspaceLite: {
    hasEntry: boolean;
    entryKind: MbtiWorkspaceEntryKind;
    attemptId: string | null;
    href: string | null;
  };
  links: MbtiAccessHubLinks;
};

type MbtiAccessHubCoreViewModel = Omit<MbtiAccessHubViewModel, "links">;

function normalizeText(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function normalizeId(value: MbtiAccessHubId): string | null {
  return normalizeText(value);
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function toHref(value: string | null, locale: Locale): string | null {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalized = value.startsWith("/") ? value : `/${value}`;
  if (normalized.startsWith("/api/")) {
    return normalized;
  }

  const firstSegment = normalized.split("/").filter(Boolean)[0];
  if (firstSegment === "en" || firstSegment === "zh") {
    return normalized;
  }

  return localizedPath(normalized, locale);
}

function extractAttemptIdFromAttemptReportUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://fermatmind.local");
    const matched = parsed.pathname.match(/^\/api\/v0\.3\/attempts\/([^/]+)\/report$/i);
    return normalizeText(matched?.[1]);
  } catch {
    return null;
  }
}

function buildClaimHref(orderNo: string | null, locale: Locale): string | null {
  if (!orderNo) {
    return null;
  }

  const query = new URLSearchParams({
    orderNo,
    mode: "claim",
  });
  return localizedPath(`/orders/lookup?${query.toString()}`, locale);
}

export function buildMbtiAccessHubLinks(
  viewModel: Pick<MbtiAccessHubCoreViewModel, "reportAccess" | "workspaceLite">,
  locale: Locale
): MbtiAccessHubLinks {
  const historyHref = localizedPath("/history/mbti", locale);
  const lookupHref = localizedPath("/orders/lookup", locale);
  const orderHref = viewModel.reportAccess.orderNo ? localizedPath(`/orders/${viewModel.reportAccess.orderNo}`, locale) : null;
  const reportAttemptId =
    viewModel.reportAccess.attemptId
    ?? extractAttemptIdFromAttemptReportUrl(viewModel.reportAccess.reportUrl)
    ?? viewModel.workspaceLite.attemptId;
  const reportHref = reportAttemptId
    ? localizedPath(`/result/${reportAttemptId}`, locale)
    : toHref(viewModel.reportAccess.reportUrl, locale);

  return {
    historyHref,
    lookupHref,
    orderHref,
    reportHref,
  };
}

export function extractMbtiAccessHubAttemptId(raw: MbtiAccessHubV1Raw | null | undefined): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return (
    normalizeId(raw.report_access?.attempt_id)
    ?? normalizeId(raw.recovery?.attempt_id)
    ?? normalizeId(raw.workspace_lite?.attempt_id)
    ?? extractAttemptIdFromAttemptReportUrl(normalizeText(raw.report_access?.report_url))
  );
}

export function normalizeMbtiAccessHub(
  raw: MbtiAccessHubV1Raw | null | undefined,
  locale: Locale
): MbtiAccessHubViewModel | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const reportAttemptId = normalizeId(raw.report_access?.attempt_id);
  const recoveryAttemptId = normalizeId(raw.recovery?.attempt_id);
  const workspaceAttemptId = normalizeId(raw.workspace_lite?.attempt_id);
  const reportUrl = normalizeText(raw.report_access?.report_url);
  const pdfUrl = normalizeText(raw.pdf_access?.report_pdf_url);
  const orderNo = normalizeText(raw.report_access?.order_no);
  const core: MbtiAccessHubCoreViewModel = {
    accessState: normalizeText(raw.access_state) ?? "locked",
    unlockStage: null,
    unlockSource: null,
    inviteUnlock: normalizeInviteUnlockSummary(raw.invite_unlock_v1 ?? null, {
      unlockStage:
        raw.unlock_stage === "locked" || raw.unlock_stage === "partial" || raw.unlock_stage === "full"
          ? raw.unlock_stage
          : null,
      unlockSource:
        raw.unlock_source === "none" || raw.unlock_source === "invite" || raw.unlock_source === "payment" || raw.unlock_source === "mixed"
          ? raw.unlock_source
          : null,
    }),
    reportAccess: {
      canViewReport: normalizeBoolean(raw.report_access?.can_view_report),
      attemptId: reportAttemptId,
      orderNo,
      reportUrl,
      source: normalizeText(raw.report_access?.source) ?? "none",
      href: null,
    },
    pdfAccess: {
      canDownloadPdf: normalizeBoolean(raw.pdf_access?.can_download_pdf),
      reportPdfUrl: pdfUrl,
      source: normalizeText(raw.pdf_access?.source) ?? "none",
      href: null,
    },
    recovery: {
      canLookupOrder: normalizeBoolean(raw.recovery?.can_lookup_order),
      canRequestClaimEmail: normalizeBoolean(raw.recovery?.can_request_claim_email),
      canResend: normalizeBoolean(raw.recovery?.can_resend),
      attemptId: recoveryAttemptId,
      shareId: normalizeText(raw.recovery?.share_id),
      compareInviteId: normalizeText(raw.recovery?.compare_invite_id),
      claimHref: null,
    },
    workspaceLite: {
      hasEntry: normalizeBoolean(raw.workspace_lite?.has_entry),
      entryKind: normalizeText(raw.workspace_lite?.entry_kind) ?? "mbti_history",
      attemptId: workspaceAttemptId,
      href: null,
    },
  };

  core.unlockStage = core.inviteUnlock?.unlockStage ?? null;
  core.unlockSource = core.inviteUnlock?.unlockSource ?? null;

  const links = buildMbtiAccessHubLinks(core, locale);
  const workspaceHref =
    core.workspaceLite.hasEntry && core.workspaceLite.entryKind === "mbti_history"
      ? links.historyHref
      : null;

  return {
    ...core,
    reportAccess: {
      ...core.reportAccess,
      canViewReport: core.reportAccess.canViewReport && Boolean(links.reportHref),
      href: links.reportHref,
    },
    pdfAccess: {
      ...core.pdfAccess,
      canDownloadPdf: core.pdfAccess.canDownloadPdf && Boolean(pdfUrl),
      href: toHref(pdfUrl, locale),
    },
    recovery: {
      ...core.recovery,
      claimHref: core.recovery.canRequestClaimEmail ? buildClaimHref(orderNo, locale) : null,
    },
    workspaceLite: {
      ...core.workspaceLite,
      href: workspaceHref,
    },
    links,
  };
}
