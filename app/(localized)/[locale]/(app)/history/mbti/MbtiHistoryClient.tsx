"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { trackEvent } from "@/lib/analytics";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canEnterReportPage,
  canDownloadReportPdf,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
import {
  normalizeInviteUnlockSummary,
  resolveInviteUnlockSummaryBadge,
  resolveInviteUnlockSummaryLabel,
  type InviteUnlockSummaryView,
} from "@/lib/access/inviteUnlockSummary";
import { getMyAttempts, type MeAttemptItem } from "@/lib/api/v0_3";
import { SCALE_CANONICAL_SLUG_MAP, normalizeSupportedScaleCode } from "@/lib/assessmentSlugMap";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import {
  appendMbtiActionJourneyQuery,
  buildMbtiActionJourneyTelemetryFields,
  parseMbtiActionJourneyQuery,
  resolveMbtiJourneyStateLabel,
  resolveMbtiProgressStateLabel,
  resolveMbtiPulsePromptLabel,
  resolveMbtiRevisitReorderReasonLabel,
} from "@/lib/mbti/actionJourney";
import {
  appendMbtiContinuityQuery,
  buildMbtiContinuityTelemetryFields,
  parseMbtiContinuityQuery,
  resolveMbtiCarryoverFocusLabel,
  resolveMbtiCarryoverReasonLabel,
} from "@/lib/mbti/continuity";
import {
  appendMbtiAdaptiveSelectionQuery,
  buildMbtiAdaptiveTelemetryFields,
  parseMbtiAdaptiveSelectionQuery,
  resolveMbtiAdaptiveContinueReasonLabel,
  resolveMbtiAdaptiveNextBestActionLabel,
} from "@/lib/mbti/adaptiveSelection";
import { buildMbtiFormDisplayLabel, normalizeMbtiFormSummary } from "@/lib/mbti/formSummary";

type Row = {
  attemptId: string;
  submittedAt: string;
  typeCode: string;
  formSummaryLabel: string | null;
  formCode: string | null;
  accessView: AttemptReportAccessView | null;
  inviteSummary: InviteUnlockSummaryView | null;
};

type RowSurface = {
  primaryDisabled: boolean;
  statusLabel: string;
  statusDetail: string;
  deliveryLabel: string;
  primaryHref: string | null;
  primaryLabel: string | null;
  latestPrimaryLabel: string | null;
  disabledLabel: string;
  showPdfAction: boolean;
  pdfHref: string | null;
  pdfLabel: string;
  previewScopeLabel: string | null;
  isFull: boolean;
  isPreview: boolean;
  isProcessing: boolean;
  isRestoring: boolean;
  isUnavailable: boolean;
  isSyncing: boolean;
  showLookupAction: boolean;
  lookupHref: string | null;
};

type HistorySurfaceCopy = ReturnType<typeof getDictSync>["history"]["mbti"]["surface"];

function formatSubmittedAt(value: string, locale: "en" | "zh"): string {
  if (!value) return locale === "zh" ? "时间待同步" : "Pending sync";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return locale === "zh"
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolvePreviewModuleLabel(moduleCode: string, copy: HistorySurfaceCopy): string {
  const normalized = moduleCode.trim().toLowerCase();
  if (normalized === "core_free") return copy.previewModuleLabels.coreFree;
  if (normalized === "core_full") return copy.previewModuleLabels.coreFull;
  if (normalized === "career") return copy.previewModuleLabels.career;
  if (normalized === "relationships") return copy.previewModuleLabels.relationships;

  return moduleCode;
}

function resolvePreviewScopeText(
  view: AttemptReportAccessView | null,
  locale: "en" | "zh",
  copy: HistorySurfaceCopy
): string | null {
  if (!view || view.modulesPreview.length === 0) {
    return null;
  }

  const labels = view.modulesPreview
    .map((key) => resolvePreviewModuleLabel(key, copy))
    .filter(Boolean);

  if (labels.length === 0) {
    return null;
  }

  return `${copy.previewScopePrefix}${locale === "zh" ? "：" : ": "}${labels.join(locale === "zh" ? "、" : ", ")}`;
}

function normalizeRowAccessView(item: MeAttemptItem, locale: "en" | "zh"): AttemptReportAccessView | null {
  if (!item.access_summary || typeof item.access_summary !== "object") {
    return null;
  }

  return normalizeAttemptReportAccess(
    {
      ok: true,
      attempt_id: String(item.attempt_id ?? ""),
      access_state: item.access_summary.access_state ?? "",
      report_state: item.access_summary.report_state ?? "",
      pdf_state: item.access_summary.pdf_state ?? "",
      unlock_stage: item.access_summary.unlock_stage ?? null,
      unlock_source: item.access_summary.unlock_source ?? null,
      reason_code: item.access_summary.reason_code ?? null,
      access_level: item.access_summary.access_level ?? null,
      variant: item.access_summary.variant ?? null,
      projection_version: 1,
      modules_allowed: item.access_summary.modules_allowed ?? null,
      modules_preview: item.access_summary.modules_preview ?? null,
      actions: {
        page_href: item.access_summary.actions?.page_href ?? null,
        pdf_href: item.access_summary.actions?.pdf_href ?? null,
        wait_href: item.access_summary.actions?.wait_href ?? null,
        history_href: item.access_summary.actions?.history_href ?? null,
        lookup_href: item.access_summary.actions?.lookup_href ?? null,
      },
      invite_unlock_v1: item.access_summary.invite_unlock_v1 ?? null,
      meta: null,
    },
    locale
  );
}

function normalizeRowInviteSummary(item: MeAttemptItem, accessView: AttemptReportAccessView | null): InviteUnlockSummaryView | null {
  const accessSummary = item.access_summary && typeof item.access_summary === "object" ? item.access_summary : null;
  const fallbackUnlockStage =
    accessSummary?.unlock_stage === "locked" || accessSummary?.unlock_stage === "partial" || accessSummary?.unlock_stage === "full"
      ? accessSummary.unlock_stage
      : accessView?.unlockStage ?? null;
  const fallbackUnlockSource =
    accessSummary?.unlock_source === "none"
    || accessSummary?.unlock_source === "invite"
    || accessSummary?.unlock_source === "payment"
    || accessSummary?.unlock_source === "mixed"
      ? accessSummary.unlock_source
      : accessView?.unlockSource ?? null;

  return normalizeInviteUnlockSummary(accessSummary?.invite_unlock_v1 ?? null, {
    unlockStage: fallbackUnlockStage,
    unlockSource: fallbackUnlockSource,
  });
}

function resolveRowSurface(row: Row, locale: "en" | "zh", copy: HistorySurfaceCopy): RowSurface {
  const accessView = row.accessView;
  const lookupHref = accessView?.actions.lookupHref ?? null;
  const pdfHref = canDownloadReportPdf(accessView) ? accessView?.actions.pdfHref ?? null : null;
  const previewScopeText = resolvePreviewScopeText(accessView, locale, copy);
  const canEnterPage = canEnterReportPage(accessView);
  const reportState = accessView?.reportState ?? null;
  const accessState = accessView?.accessState ?? null;
  const isProcessing = reportState === "pending";
  const isRestoring = reportState === "restoring";
  const isUnavailable = Boolean(
    reportState === "unavailable"
    || reportState === "expired"
    || reportState === "deleted"
    || accessState === "expired"
    || accessState === "deleted"
  );
  const isFull = Boolean(canEnterPage && (accessView?.variant === "full" || accessView?.accessLevel === "full"));
  const isPreview = Boolean(
    accessView
    && accessView.accessState === "locked"
    && accessView.reportState === "ready"
    && (accessView.variant === "free" || accessView.accessLevel === "free" || accessView.modulesPreview.length > 0)
  );
  const isLockedEntry = Boolean(
    accessView
    && accessView.accessState === "locked"
    && accessView.reportState === "ready"
    && !isPreview
  );
  if (!accessView) {
    return {
      primaryDisabled: true,
      statusLabel: copy.status.syncing,
      statusDetail: copy.detail.syncing,
      deliveryLabel: copy.delivery.syncing,
      primaryHref: null,
      primaryLabel: null,
      latestPrimaryLabel: null,
      disabledLabel: copy.cta.rowDisabledSyncing,
      showPdfAction: false,
      pdfHref: null,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: null,
      isFull: false,
      isPreview: false,
      isProcessing: false,
      isRestoring: false,
      isUnavailable: false,
      isSyncing: true,
      showLookupAction: false,
      lookupHref: null,
    };
  }

  if (isUnavailable) {
    return {
      primaryDisabled: true,
      statusLabel: copy.status.unavailable,
      statusDetail: copy.detail.unavailable,
      deliveryLabel: copy.delivery.pdfUnavailable,
      primaryHref: null,
      primaryLabel: null,
      latestPrimaryLabel: null,
      disabledLabel: copy.cta.rowDisabledUnavailable,
      showPdfAction: false,
      pdfHref: null,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: null,
      isFull: false,
      isPreview: false,
      isProcessing: false,
      isRestoring: false,
      isUnavailable: true,
      isSyncing: false,
      showLookupAction: Boolean(lookupHref),
      lookupHref,
    };
  }

  if (isRestoring) {
    return {
      primaryDisabled: !accessView.actions.waitHref,
      statusLabel: copy.status.restoring,
      statusDetail: copy.detail.restoring,
      deliveryLabel: copy.delivery.pdfNotReady,
      primaryHref: accessView.actions.waitHref ?? null,
      primaryLabel: accessView.actions.waitHref ? copy.cta.rowContinueRestoring : null,
      latestPrimaryLabel: accessView.actions.waitHref ? copy.cta.latestContinueRestoring : null,
      disabledLabel: copy.cta.rowDisabledRestoring,
      showPdfAction: false,
      pdfHref: null,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: null,
      isFull: false,
      isPreview: false,
      isProcessing: false,
      isRestoring: true,
      isUnavailable: false,
      isSyncing: false,
      showLookupAction: Boolean(lookupHref),
      lookupHref,
    };
  }

  if (isProcessing) {
    return {
      primaryDisabled: !accessView.actions.waitHref,
      statusLabel: copy.status.processing,
      statusDetail: copy.detail.processing,
      deliveryLabel: copy.delivery.pdfNotReady,
      primaryHref: accessView.actions.waitHref ?? null,
      primaryLabel: accessView.actions.waitHref ? copy.cta.rowContinueProcessing : null,
      latestPrimaryLabel: accessView.actions.waitHref ? copy.cta.latestContinueProcessing : null,
      disabledLabel: copy.cta.rowDisabledProcessing,
      showPdfAction: false,
      pdfHref: null,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: null,
      isFull: false,
      isPreview: false,
      isProcessing: true,
      isRestoring: false,
      isUnavailable: false,
      isSyncing: false,
      showLookupAction: Boolean(lookupHref),
      lookupHref,
    };
  }

  if (isFull) {
    const showPdfAction = Boolean(pdfHref);
    return {
      primaryDisabled: !accessView.actions.pageHref,
      statusLabel: copy.status.fullUnlocked,
      statusDetail: copy.detail.fullUnlocked,
      deliveryLabel: showPdfAction ? copy.delivery.pdfReady : copy.delivery.pdfNotReady,
      primaryHref: accessView.actions.pageHref ?? null,
      primaryLabel: accessView.actions.pageHref ? copy.cta.rowOpenFull : null,
      latestPrimaryLabel: accessView.actions.pageHref ? copy.cta.latestContinueFull : null,
      disabledLabel: copy.cta.rowDisabledUnavailable,
      showPdfAction,
      pdfHref,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: null,
      isFull: true,
      isPreview: false,
      isProcessing: false,
      isRestoring: false,
      isUnavailable: false,
      isSyncing: false,
      showLookupAction: false,
      lookupHref,
    };
  }

  if (isPreview) {
    const showPdfAction = Boolean(pdfHref);
    return {
      primaryDisabled: !accessView.actions.pageHref,
      statusLabel: copy.status.freePreview,
      statusDetail: previewScopeText ?? copy.detail.freePreview,
      deliveryLabel: showPdfAction ? copy.delivery.pdfReady : copy.delivery.pdfNotReady,
      primaryHref: accessView.actions.pageHref ?? null,
      primaryLabel: accessView.actions.pageHref ? copy.cta.rowContinuePreview : null,
      latestPrimaryLabel: accessView.actions.pageHref ? copy.cta.latestContinuePreview : null,
      disabledLabel: copy.cta.rowDisabledUnavailable,
      showPdfAction,
      pdfHref,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: previewScopeText,
      isFull: false,
      isPreview: true,
      isProcessing: false,
      isRestoring: false,
      isUnavailable: false,
      isSyncing: false,
      showLookupAction: false,
      lookupHref,
    };
  }

  if (isLockedEntry) {
    return {
      primaryDisabled: !accessView.actions.pageHref,
      statusLabel: copy.status.lockedEntry,
      statusDetail: copy.detail.lockedEntry,
      deliveryLabel: copy.delivery.onlineAccess,
      primaryHref: accessView.actions.pageHref ?? null,
      primaryLabel: accessView.actions.pageHref ? copy.cta.rowContinueLocked : null,
      latestPrimaryLabel: accessView.actions.pageHref ? copy.cta.latestContinueLocked : null,
      disabledLabel: copy.cta.rowDisabledUnavailable,
      showPdfAction: false,
      pdfHref: null,
      pdfLabel: copy.cta.downloadPdf,
      previewScopeLabel: null,
      isFull: false,
      isPreview: false,
      isProcessing: false,
      isRestoring: false,
      isUnavailable: false,
      isSyncing: false,
      showLookupAction: Boolean(lookupHref),
      lookupHref,
    };
  }

  return {
    primaryDisabled: !accessView.actions.pageHref,
    statusLabel: copy.status.readyEntry,
    statusDetail: copy.detail.readyEntry,
    deliveryLabel: pdfHref ? copy.delivery.pdfReady : copy.delivery.onlineAccess,
    primaryHref: accessView.actions.pageHref ?? null,
    primaryLabel: accessView.actions.pageHref ? copy.cta.rowOpenReady : null,
    latestPrimaryLabel: accessView.actions.pageHref ? copy.cta.latestContinueReady : null,
    disabledLabel: copy.cta.rowDisabledUnavailable,
    showPdfAction: Boolean(pdfHref),
    pdfHref,
    pdfLabel: copy.cta.downloadPdf,
    previewScopeLabel: null,
    isFull: false,
    isPreview: false,
    isProcessing: false,
    isRestoring: false,
    isUnavailable: false,
    isSyncing: false,
    showLookupAction: false,
    lookupHref,
  };
}

function resolveMbtiRow(item: MeAttemptItem, locale: "en" | "zh"): Row | null {
  const attemptId = String(item.attempt_id ?? "").trim();
  if (!attemptId) return null;

  const normalizedScaleCode = normalizeSupportedScaleCode(String(item.scale_code ?? "").trim());
  if (normalizedScaleCode && normalizedScaleCode !== "MBTI") {
    return null;
  }

  const accessView = normalizeRowAccessView(item, locale);
  return {
    attemptId,
    submittedAt: String(item.submitted_at ?? ""),
    typeCode: String(item.type_code ?? "").trim() || "MBTI",
    formSummaryLabel: buildMbtiFormDisplayLabel(normalizeMbtiFormSummary(item.mbti_form_v1), {
      short: true,
      includeScaleCode: true,
    }),
    formCode: normalizeMbtiFormSummary(item.mbti_form_v1)?.formCode ?? null,
    accessView,
    inviteSummary: normalizeRowInviteSummary(item, accessView),
  };
}

export default function MbtiHistoryClient() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);
  const isZh = locale === "zh";
  const copy = getDictSync(locale).history.mbti;
  const surfaceCopy = copy.surface;
  const startTestHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}/take`, locale);
  const orderLookupHref = localizedPath("/orders/lookup", locale);

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const carryoverImpressionTrackedRef = useRef(false);
  const journeyImpressionTrackedRef = useRef(false);
  const inviteSummaryImpressionTrackedRef = useRef(false);
  const continuity = parseMbtiContinuityQuery(searchParams);
  const journey = parseMbtiActionJourneyQuery(searchParams);
  const adaptiveSelection = parseMbtiAdaptiveSelectionQuery(searchParams);
  const continuityTelemetry = useMemo(() => buildMbtiContinuityTelemetryFields(continuity), [continuity]);
  const journeyTelemetry = useMemo(() => buildMbtiActionJourneyTelemetryFields(journey), [journey]);
  const adaptiveTelemetry = useMemo(() => buildMbtiAdaptiveTelemetryFields(adaptiveSelection), [adaptiveSelection]);
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(String(continuity?.carryoverFocusKey ?? ""), locale);
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(String(continuity?.carryoverReason ?? ""), locale);
  const journeyStateLabel = resolveMbtiJourneyStateLabel(String(journey?.journeyState ?? ""), locale);
  const progressStateLabel = resolveMbtiProgressStateLabel(String(journey?.progressState ?? ""), locale);
  const journeyReasonLabel = resolveMbtiRevisitReorderReasonLabel(String(journey?.revisitReorderReason ?? ""), locale);
  const adaptiveNextBestActionLabel = resolveMbtiAdaptiveNextBestActionLabel(
    String(adaptiveSelection?.nextBestActionKey ?? ""),
    locale
  );
  const adaptiveReasonLabel = resolveMbtiAdaptiveContinueReasonLabel(
    String(adaptiveSelection?.selectionRewriteReason ?? adaptiveSelection?.nextBestActionReason ?? ""),
    locale
  );
  const pulsePromptLabels = (journey?.pulsePromptKeys ?? []).map((key) => resolveMbtiPulsePromptLabel(key, locale));
  const latestRow = rows[0] ?? null;
  const latestRowSurface = latestRow ? resolveRowSurface(latestRow, locale, surfaceCopy) : null;
  const recoveryHref = latestRowSurface?.lookupHref ?? orderLookupHref;
  const latestResultHref = latestRow
    && latestRowSurface?.primaryHref
    ? appendMbtiActionJourneyQuery(
        appendMbtiAdaptiveSelectionQuery(
          appendMbtiContinuityQuery(latestRowSurface.primaryHref, continuity),
          adaptiveSelection
        ),
        journey
      )
    : null;

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await getMyAttempts({
          scaleCode: "MBTI",
          page,
          pageSize: 10,
          locale,
        });
        const items = Array.isArray(history.items) ? history.items : [];
        const filteredRows = items
          .map((item) => resolveMbtiRow(item, locale))
          .filter((item): item is Row => item !== null);

        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(filteredRows);
        setHasNextPage(Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage);
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : isZh ? "MBTI 历史加载失败。" : "Failed to load MBTI history.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [isZh, locale, page]);

  useEffect(() => {
    if (!continuity || carryoverImpressionTrackedRef.current) {
      return;
    }

    carryoverImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-history",
      scale_code: "MBTI",
      visual_kind: "history_carryover_entry",
      continueTarget: "history_latest_result",
      ...continuityTelemetry,
      ...adaptiveTelemetry,
      locale,
    });
  }, [adaptiveTelemetry, continuity, continuityTelemetry, locale]);

  useEffect(() => {
    if (!journey || journeyImpressionTrackedRef.current) {
      return;
    }

    journeyImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-history",
      scale_code: "MBTI",
      visual_kind: "history_action_journey_context",
      continueTarget: "history_latest_result",
      ...journeyTelemetry,
      ...adaptiveTelemetry,
      locale,
    });
  }, [adaptiveTelemetry, journey, journeyTelemetry, locale]);

  useEffect(() => {
    if (!latestRow?.inviteSummary || inviteSummaryImpressionTrackedRef.current) {
      return;
    }

    inviteSummaryImpressionTrackedRef.current = true;
    trackEvent("invite_staged_summary_viewed", {
      scale_code: "MBTI",
      unlock_stage: latestRow.inviteSummary.unlockStage,
      unlock_source: latestRow.inviteSummary.unlockSource,
      completed_invitees: latestRow.inviteSummary.completedInvitees,
      required_invitees: latestRow.inviteSummary.requiredInvitees,
      attempt_id: latestRow.attemptId,
      form_code: latestRow.formCode ?? undefined,
      entry_surface: "history_mbti",
      locale,
    });
  }, [latestRow, locale]);

  return (
    <div data-testid="mbti-history-client" className="space-y-4">
      <section
        data-testid="mbti-history-hero"
        className="space-y-4 rounded-[var(--fm-radius-xl)] border border-[var(--fm-border)] bg-[var(--fm-surface)] px-6 py-6 shadow-[var(--fm-shadow-sm)]"
      >
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{copy.kicker}</p>
          <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
          <p className="m-0 text-sm leading-7 text-slate-600">{copy.descriptionPrimary}</p>
          <p className="m-0 text-sm leading-7 text-slate-600">{copy.descriptionRecovery}</p>
          <p className="m-0 text-sm leading-7 text-slate-600">{copy.descriptionWorkspaceEntry}</p>
          {continuity ? (
            <div
              data-testid="mbti-history-carryover-entry"
              className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                {isZh ? "继续上次重点" : "Continue the current focus"}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-slate-900">{continuityFocusLabel}</p>
              <p className="m-0 mt-1 text-sm leading-7 text-slate-600">{continuityReasonLabel}</p>
            </div>
          ) : null}
          {journey ? (
            <div
              data-testid="mbti-history-journey-context"
              className="rounded-xl border border-sky-200 bg-sky-50/70 p-4"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                {isZh ? "当前行动旅程" : "Current action journey"}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-slate-900">
                {journeyStateLabel}
                {progressStateLabel ? ` · ${progressStateLabel}` : ""}
              </p>
              <p className="m-0 mt-1 text-sm leading-7 text-slate-600">{journeyReasonLabel}</p>
              {pulsePromptLabels.length > 0 ? (
                <ul className="mb-0 mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-slate-600">
                  {pulsePromptLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          {adaptiveSelection ? (
            <div
              data-testid="mbti-history-adaptive-context"
              data-adaptive-fingerprint={adaptiveSelection.adaptiveFingerprint || undefined}
              data-selection-rewrite-reason={adaptiveSelection.selectionRewriteReason || undefined}
              data-next-best-action-key={adaptiveSelection.nextBestActionKey || undefined}
              className="rounded-xl border border-violet-200 bg-violet-50/70 p-4"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
                {isZh ? "自适应继续建议" : "Adaptive continue guidance"}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-slate-900">
                {adaptiveNextBestActionLabel}
                {adaptiveSelection.nextBestActionSection ? ` · ${adaptiveSelection.nextBestActionSection}` : ""}
              </p>
              <p className="m-0 mt-1 text-sm leading-7 text-slate-600">{adaptiveReasonLabel}</p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {latestResultHref && latestRowSurface?.latestPrimaryLabel ? (
            <Link
              href={latestResultHref}
              className={buttonVariants({ className: "w-full sm:w-auto" })}
              data-testid="mbti-history-continue-cta"
              onClick={() => {
                trackEvent("ui_card_interaction", {
                  slug: "mbti-history",
                  scale_code: "MBTI",
                  visual_kind: "history_continue_latest",
                  interaction: "click",
                  continueTarget: "history_latest_result",
                  ctaKey: "history_continue_latest",
                  ctaRank: 1,
                  attempt_id: latestRow?.attemptId,
                  form_code: latestRow?.formCode ?? undefined,
                  ...continuityTelemetry,
                  ...journeyTelemetry,
                  ...adaptiveTelemetry,
                  locale,
                });
              }}
            >
              {latestRowSurface.latestPrimaryLabel}
            </Link>
          ) : null}
          <Link
            href={recoveryHref}
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
            data-testid="mbti-history-recovery-cta"
          >
            {copy.recoverCta}
          </Link>
        </div>
        {latestRow && latestRowSurface ? (
          <div
            data-testid="mbti-history-latest-status"
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700"
          >
            <span className="font-medium text-slate-950">
              {surfaceCopy.latestEntryLabel} · {latestRow.typeCode}
            </span>
            {latestRow.formSummaryLabel ? (
              <>
                <span>{isZh ? " · " : " · "}</span>
                <span data-testid="mbti-history-latest-form">{latestRow.formSummaryLabel}</span>
              </>
            ) : null}
            <span>{isZh ? "：" : ": "}</span>
            <span>{latestRowSurface.statusLabel}</span>
            <span>{isZh ? " · " : " · "}</span>
            <span>{latestRowSurface.deliveryLabel}</span>
            {latestRow.inviteSummary ? (
              <>
                <span>{isZh ? " · " : " · "}</span>
                <span data-testid="mbti-history-latest-invite-stage">
                  {resolveInviteUnlockSummaryBadge(latestRow.inviteSummary, locale)}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </section>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{copy.loading}</CardContent>
        </Card>
      ) : null}

      {!loading && rows.length === 0 ? (
        <Card data-testid="mbti-history-empty">
          <CardContent className="space-y-4 py-6">
            <div className="space-y-2">
              <h2 className="m-0 text-lg font-semibold text-slate-950">{copy.emptyTitle}</h2>
              <p className="m-0 text-sm text-slate-600">{copy.emptyDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={startTestHref} className={buttonVariants({ className: "w-full sm:w-auto" })} data-testid="mbti-history-empty-start">
                {copy.emptyStartCta}
              </Link>
              <Link
                href={orderLookupHref}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                data-testid="mbti-history-empty-recovery"
              >
                {copy.emptyRecoverCta}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!loading && rows.length > 0 ? (
        <section data-testid="mbti-history-list-copy" className="space-y-1">
          <h2 className="m-0 text-lg font-semibold text-slate-950">{copy.listTitle}</h2>
          <p className="m-0 text-sm text-slate-600">{copy.listSubtitle}</p>
        </section>
      ) : null}

      <div className="grid gap-3" data-testid="mbti-history-list">
        {rows.map((row) => {
          const rowSurface = resolveRowSurface(row, locale, surfaceCopy);

          return (
          <Card key={row.attemptId} data-testid="mbti-history-card">
            <CardHeader className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {copy.completedLabel}
              </p>
              <CardTitle className="text-base text-slate-950">{row.typeCode}</CardTitle>
              {row.formSummaryLabel ? (
                <p className="m-0 text-xs text-slate-500" data-testid={`mbti-history-form-${row.attemptId}`}>
                  {row.formSummaryLabel}
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p className="m-0">
                {copy.submittedAtLabel}
                {isZh ? "：" : ": "}
                {formatSubmittedAt(row.submittedAt, locale)}
              </p>
              <p className="m-0">
                {copy.statusLabel}
                {isZh ? "：" : ": "}
                {rowSurface.statusLabel}
              </p>
              <p
                className="m-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600"
                data-testid={`mbti-history-status-${row.attemptId}`}
              >
                {rowSurface.statusDetail}
              </p>
              <p
                className="m-0 text-sm text-slate-600"
                data-testid={`mbti-history-delivery-${row.attemptId}`}
              >
                {copy.deliveryLabel}
                {isZh ? "：" : ": "}
                {rowSurface.deliveryLabel}
              </p>
              {row.inviteSummary ? (
                <p
                  className="m-0 rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2 text-sm text-violet-900"
                  data-testid={`mbti-history-invite-summary-${row.attemptId}`}
                >
                  {resolveInviteUnlockSummaryBadge(row.inviteSummary, locale)}
                  {": "}
                  {resolveInviteUnlockSummaryLabel(row.inviteSummary, locale)}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {rowSurface.primaryHref && rowSurface.primaryLabel ? (
                  <Link
                    href={appendMbtiActionJourneyQuery(
                      appendMbtiAdaptiveSelectionQuery(
                        appendMbtiContinuityQuery(rowSurface.primaryHref, continuity),
                        adaptiveSelection
                      ),
                      journey
                    )}
                    className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                    data-testid={`mbti-history-open-${row.attemptId}`}
                    onClick={() => {
                      trackEvent("ui_card_interaction", {
                        slug: "mbti-history",
                        scale_code: "MBTI",
                        visual_kind: "history_saved_result_entry",
                        interaction: "click",
                        continueTarget: "history_saved_result",
                        ctaKey: "history_saved_result",
                        attempt_id: row.attemptId,
                        form_code: row.formCode ?? undefined,
                        ...continuityTelemetry,
                        ...journeyTelemetry,
                        ...adaptiveTelemetry,
                        locale,
                      });
                    }}
                  >
                    {rowSurface.primaryLabel}
                  </Link>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled
                    data-testid={`mbti-history-open-${row.attemptId}`}
                  >
                    {rowSurface.disabledLabel}
                  </Button>
                )}
                {rowSurface.showPdfAction && rowSurface.pdfHref ? (
                  <a
                    href={rowSurface.pdfHref ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                    data-testid={`mbti-history-pdf-${row.attemptId}`}
                  >
                    {rowSurface.pdfLabel}
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          {copy.previousPage}
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
          {copy.nextPage}
        </Button>
      </div>
    </div>
  );
}
