"use client";

import type { AttemptReportAccessResponse } from "@/lib/api/v0_3";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export type UnifiedAccessState =
  | "pending"
  | "ready"
  | "locked"
  | "restoring"
  | "unavailable"
  | "expired"
  | "deleted";

export type AttemptReportAccessView = {
  attemptId: string;
  accessState: UnifiedAccessState;
  reportState: UnifiedAccessState;
  pdfState: UnifiedAccessState;
  reasonCode: string | null;
  projectionVersion: number;
  actions: {
    pageHref: string | null;
    pdfHref: string | null;
    waitHref: string | null;
    historyHref: string | null;
    lookupHref: string | null;
  };
  payload: Record<string, unknown> | null;
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

function normalizeActionHref(value: unknown, locale: Locale): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("/api/")) {
    return normalized;
  }

  const candidate = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const firstSegment = candidate.split("/").filter(Boolean)[0];
  if (firstSegment === "en" || firstSegment === "zh") {
    return candidate;
  }

  return localizedPath(candidate, locale);
}

function normalizePayload(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
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
    reasonCode: normalizeText(raw.reason_code),
    projectionVersion:
      typeof raw.projection_version === "number" && Number.isFinite(raw.projection_version)
        ? raw.projection_version
        : 1,
    actions: {
      pageHref: normalizeActionHref(raw.actions?.page_href, locale),
      pdfHref: normalizeActionHref(raw.actions?.pdf_href, locale),
      waitHref: normalizeActionHref(raw.actions?.wait_href, locale),
      historyHref: normalizeActionHref(raw.actions?.history_href, locale),
      lookupHref: normalizeActionHref(raw.actions?.lookup_href, locale),
    },
    payload: normalizePayload(raw.payload),
    meta: {
      producedAt: normalizeText(raw.meta?.produced_at),
      refreshedAt: normalizeText(raw.meta?.refreshed_at),
    },
  };
}

export function canEnterReportPage(view: AttemptReportAccessView | null): boolean {
  return Boolean(view?.actions.pageHref) && view?.reportState === "ready";
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
