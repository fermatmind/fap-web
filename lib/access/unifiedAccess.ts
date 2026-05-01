"use client";

import type { AttemptReportAccessResponse } from "@/lib/api/v0_3";
import { normalizeReportActionHref } from "@/lib/access/reportActionUrls";
import type { Locale } from "@/lib/i18n/locales";

export type UnifiedAccessState =
  | "pending"
  | "ready"
  | "locked"
  | "restoring"
  | "unavailable"
  | "expired"
  | "deleted";

export type UnifiedUnlockStage = "locked" | "partial" | "full";
export type UnifiedUnlockSource = "none" | "invite" | "payment" | "mixed";

export type AttemptReportAccessView = {
  attemptId: string;
  accessState: UnifiedAccessState;
  reportState: UnifiedAccessState;
  pdfState: UnifiedAccessState;
  unlockStage: UnifiedUnlockStage | null;
  unlockSource: UnifiedUnlockSource | null;
  reasonCode: string | null;
  accessLevel: string | null;
  variant: string | null;
  projectionVersion: number;
  modulesAllowed: string[];
  modulesPreview: string[];
  actions: {
    pageHref: string | null;
    pdfHref: string | null;
    waitHref: string | null;
    historyHref: string | null;
    lookupHref: string | null;
  };
  meta: {
    producedAt: string | null;
    refreshedAt: string | null;
  };
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeState(value: unknown, fallback: UnifiedAccessState): UnifiedAccessState {
  const normalized = normalizeText(value)?.toLowerCase();
  if (
    normalized === "pending"
    || normalized === "ready"
    || normalized === "locked"
    || normalized === "restoring"
    || normalized === "unavailable"
    || normalized === "expired"
    || normalized === "deleted"
  ) {
    return normalized;
  }

  return fallback;
}

function normalizePayload(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => normalizeText(item))
        .filter((item): item is string => Boolean(item))
    )
  );
}

function resolveAccessPayloadRecord(raw: AttemptReportAccessResponse): Record<string, unknown> | null {
  return normalizePayload(raw.payload);
}

function normalizeAccessTextField(
  raw: AttemptReportAccessResponse,
  field: "access_level" | "variant"
): string | null {
  const payload = resolveAccessPayloadRecord(raw);
  return normalizeText(raw[field]) ?? normalizeText(payload?.[field]);
}

function normalizeAccessStringArrayField(
  raw: AttemptReportAccessResponse,
  field: "modules_allowed" | "modules_preview"
): string[] {
  const direct = normalizeStringArray(raw[field]);
  if (direct.length > 0) {
    return direct;
  }

  const payload = resolveAccessPayloadRecord(raw);
  return normalizeStringArray(payload?.[field]);
}

function normalizeUnlockStageField(raw: AttemptReportAccessResponse): UnifiedUnlockStage | null {
  const payload = resolveAccessPayloadRecord(raw);
  const normalized = normalizeText(raw.unlock_stage) ?? normalizeText(payload?.unlock_stage);
  if (normalized === "locked" || normalized === "partial" || normalized === "full") {
    return normalized;
  }

  return null;
}

function normalizeUnlockSourceField(raw: AttemptReportAccessResponse): UnifiedUnlockSource | null {
  const payload = resolveAccessPayloadRecord(raw);
  const normalized = normalizeText(raw.unlock_source) ?? normalizeText(payload?.unlock_source);
  if (normalized === "none" || normalized === "invite" || normalized === "payment" || normalized === "mixed") {
    return normalized;
  }

  return null;
}

export function normalizeAttemptReportAccess(
  raw: AttemptReportAccessResponse | null | undefined,
  locale: Locale
): AttemptReportAccessView | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const attemptId = normalizeText(raw.attempt_id);
  if (!attemptId) {
    return null;
  }

  return {
    attemptId,
    accessState: normalizeState(raw.access_state, "locked"),
    reportState: normalizeState(raw.report_state, "unavailable"),
    pdfState: normalizeState(raw.pdf_state, "unavailable"),
    unlockStage: normalizeUnlockStageField(raw),
    unlockSource: normalizeUnlockSourceField(raw),
    reasonCode: normalizeText(raw.reason_code),
    accessLevel: normalizeAccessTextField(raw, "access_level"),
    variant: normalizeAccessTextField(raw, "variant"),
    projectionVersion:
      typeof raw.projection_version === "number" && Number.isFinite(raw.projection_version)
        ? raw.projection_version
        : 1,
    modulesAllowed: normalizeAccessStringArrayField(raw, "modules_allowed"),
    modulesPreview: normalizeAccessStringArrayField(raw, "modules_preview"),
    actions: {
      pageHref: normalizeReportActionHref(raw.actions?.page_href, locale, "page"),
      pdfHref: normalizeReportActionHref(raw.actions?.pdf_href, locale, "pdf"),
      waitHref: normalizeReportActionHref(raw.actions?.wait_href, locale, "wait"),
      historyHref: normalizeReportActionHref(raw.actions?.history_href, locale, "history"),
      lookupHref: normalizeReportActionHref(raw.actions?.lookup_href, locale, "lookup"),
    },
    meta: {
      producedAt: normalizeText(raw.meta?.produced_at),
      refreshedAt: normalizeText(raw.meta?.refreshed_at),
    },
  };
}

export function canEnterReportPage(view: AttemptReportAccessView | null): boolean {
  return (
    Boolean(view?.actions.pageHref)
    && view?.reportState === "ready"
    && view?.accessState === "ready"
  );
}

export function canDownloadReportPdf(view: AttemptReportAccessView | null): boolean {
  return Boolean(view?.actions.pdfHref) && view?.pdfState === "ready";
}

export function isProjectionProcessing(view: AttemptReportAccessView | null): boolean {
  return view?.reportState === "pending" || view?.reportState === "restoring";
}

export function isProjectionLocked(view: AttemptReportAccessView | null): boolean {
  return view?.accessState === "locked";
}

export function isProjectionUnavailable(view: AttemptReportAccessView | null): boolean {
  return view?.reportState === "unavailable" || view?.reportState === "expired" || view?.reportState === "deleted";
}
