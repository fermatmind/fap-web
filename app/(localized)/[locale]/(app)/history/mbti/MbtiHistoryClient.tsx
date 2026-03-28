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
  isProjectionProcessing,
  isProjectionUnavailable,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
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

type Row = {
  attemptId: string;
  submittedAt: string;
  typeCode: string;
  accessView: AttemptReportAccessView | null;
};

type RowSurface = {
  statusLabel: string;
  statusDetail: string;
  deliveryLabel: string;
  primaryHref: string | null;
  primaryCtaLabel: string | null;
  latestCtaLabel: string;
  pdfHref: string | null;
};

const PREVIEW_MODULE_LABELS: Record<
  string,
  {
    en: string;
    zh: string;
  }
> = {
  core_free: { en: "Result summary", zh: "结果摘要" },
  core_full: { en: "Full personality reading", zh: "完整人格判读" },
  career: { en: "Career mapping", zh: "职业映射" },
  relationships: { en: "Relationship mapping", zh: "关系映射" },
};

function formatSubmittedAt(value: string, locale: "en" | "zh"): string {
  if (!value) return locale === "zh" ? "时间待同步" : "Pending sync";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return locale === "zh"
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolvePreviewScopeText(view: AttemptReportAccessView | null, locale: "en" | "zh"): string | null {
  if (!view || view.modulesPreview.length === 0) {
    return null;
  }

  const labels = view.modulesPreview
    .map((key) => PREVIEW_MODULE_LABELS[key]?.[locale] ?? key)
    .filter(Boolean);

  if (labels.length === 0) {
    return null;
  }

  return locale === "zh" ? `当前预览范围：${labels.join("、")}` : `Preview scope: ${labels.join(", ")}`;
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
      reason_code: item.access_summary.reason_code ?? null,
      access_level: item.access_summary.access_level ?? null,
      variant: item.access_summary.variant ?? null,
      projection_version: 1,
      modules_allowed: item.access_summary.modules_allowed ?? null,
      modules_preview: item.access_summary.modules_preview ?? null,
      actions: {
        page_href: item.access_summary.actions?.page_href ?? null,
        pdf_href: item.access_summary.actions?.pdf_href ?? null,
        history_href: null,
        lookup_href: null,
      },
      meta: null,
    },
    locale
  );
}

function resolveRowSurface(row: Row, locale: "en" | "zh"): RowSurface {
  const accessView = row.accessView;
  const primaryHref = accessView?.actions.pageHref ?? null;
  const pdfHref = canDownloadReportPdf(accessView) ? accessView?.actions.pdfHref ?? null : null;
  const previewScopeText = resolvePreviewScopeText(accessView, locale);
  const canEnterPage = canEnterReportPage(accessView);
  const isFull = Boolean(canEnterPage && (accessView?.variant === "full" || accessView?.accessLevel === "full"));
  const isPreview = Boolean(
    accessView
    && accessView.accessState === "locked"
    && accessView.reportState === "ready"
    && (accessView.variant === "free" || accessView.accessLevel === "free" || accessView.modulesPreview.length > 0)
  );

  if (!accessView) {
    return {
      statusLabel: locale === "zh" ? "状态同步中" : "Status syncing",
      statusDetail:
        locale === "zh"
          ? "这个 Workspace Lite 入口的当前访问状态仍在同步，请稍后刷新；若你已购买报告，可先使用订单找回。"
          : "This workspace entry has not synced its current access state yet. Refresh later or use order lookup if you purchased access.",
      deliveryLabel: locale === "zh" ? "交付待同步" : "Delivery syncing",
      primaryHref: null,
      primaryCtaLabel: null,
      latestCtaLabel: locale === "zh" ? "查看最新状态" : "Check latest status",
      pdfHref: null,
    };
  }

  if (isProjectionUnavailable(accessView)) {
    return {
      statusLabel: locale === "zh" ? "当前不可用" : "Unavailable",
      statusDetail:
        locale === "zh"
          ? "这个结果入口当前不可直接再次进入，请优先使用订单找回。"
          : "This result entry is not currently available for direct re-entry. Use order lookup first.",
      deliveryLabel: locale === "zh" ? "PDF 未提供" : "PDF unavailable",
      primaryHref: null,
      primaryCtaLabel: null,
      latestCtaLabel: locale === "zh" ? "查看最新状态" : "Check latest status",
      pdfHref: null,
    };
  }

  if (isProjectionProcessing(accessView)) {
    return {
      statusLabel: locale === "zh" ? "结果准备中" : "Preparing result",
      statusDetail:
        locale === "zh"
          ? "这个结果入口仍在准备中，可返回结果页继续等待。"
              : "This result entry is still preparing. Re-open the result page to continue waiting.",
      deliveryLabel: locale === "zh" ? "PDF 未就绪" : "PDF not ready",
      primaryHref,
      primaryCtaLabel: locale === "zh" ? "继续准备中的结果" : "Open processing entry",
      latestCtaLabel: locale === "zh" ? "继续最新结果入口" : "Continue latest entry",
      pdfHref: null,
    };
  }

  if (isFull) {
    return {
      statusLabel: locale === "zh" ? "完整报告已开放" : "Full report unlocked",
      statusDetail:
        locale === "zh"
          ? "这是完整结果的 Workspace Lite 回访入口。"
          : "This is the workspace-lite re-entry for the full result.",
      deliveryLabel: pdfHref ? (locale === "zh" ? "PDF 已就绪" : "PDF ready") : locale === "zh" ? "在线访问" : "Online access",
      primaryHref,
      primaryCtaLabel: locale === "zh" ? "打开完整结果" : "Open full result",
      latestCtaLabel: locale === "zh" ? "继续最新完整结果" : "Continue latest full result",
      pdfHref,
    };
  }

  if (isPreview) {
    return {
      statusLabel: locale === "zh" ? "免费预览" : "Free preview",
      statusDetail:
        previewScopeText
        ?? (locale === "zh"
          ? "当前结果仍处于免费预览，完整解锁继续在结果页完成。"
          : "This entry is still on free preview. Full unlock continues on the result page."),
      deliveryLabel: locale === "zh" ? "PDF 未就绪" : "PDF not ready",
      primaryHref,
      primaryCtaLabel: locale === "zh" ? "继续免费预览" : "Continue free preview",
      latestCtaLabel: locale === "zh" ? "继续最新免费预览" : "Continue latest free preview",
      pdfHref: null,
    };
  }

  return {
    statusLabel: locale === "zh" ? "结果入口" : "Result entry",
    statusDetail:
      locale === "zh"
        ? "这个入口会回到当前结果页，并保留当前回访路径。"
        : "This entry returns to the current result page while keeping the current revisit path.",
    deliveryLabel: pdfHref ? (locale === "zh" ? "PDF 已就绪" : "PDF ready") : locale === "zh" ? "在线访问" : "Online access",
    primaryHref,
    primaryCtaLabel: locale === "zh" ? "打开结果入口" : "Open result entry",
    latestCtaLabel: locale === "zh" ? "继续最新结果入口" : "Continue latest entry",
    pdfHref,
  };
}

function resolveMbtiRow(item: MeAttemptItem, locale: "en" | "zh"): Row | null {
  const attemptId = String(item.attempt_id ?? "").trim();
  if (!attemptId) return null;

  const normalizedScaleCode = normalizeSupportedScaleCode(String(item.scale_code ?? "").trim());
  if (normalizedScaleCode && normalizedScaleCode !== "MBTI") {
    return null;
  }

  return {
    attemptId,
    submittedAt: String(item.submitted_at ?? ""),
    typeCode: String(item.type_code ?? "").trim() || "MBTI",
    accessView: normalizeRowAccessView(item, locale),
  };
}

export default function MbtiHistoryClient() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);
  const isZh = locale === "zh";
  const copy = getDictSync(locale).history.mbti;
  const startTestHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}/take`, locale);
  const orderLookupHref = localizedPath("/orders/lookup", locale);

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const carryoverImpressionTrackedRef = useRef(false);
  const journeyImpressionTrackedRef = useRef(false);
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
  const latestRowSurface = latestRow ? resolveRowSurface(latestRow, locale) : null;
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
  }, [isZh, page]);

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
          {latestResultHref && latestRowSurface?.primaryCtaLabel ? (
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
                  ...continuityTelemetry,
                  ...journeyTelemetry,
                  ...adaptiveTelemetry,
                  locale,
                });
              }}
            >
              {latestRowSurface.latestCtaLabel}
            </Link>
          ) : null}
          <Link
            href={orderLookupHref}
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
              {isZh ? "最新入口" : "Latest entry"} · {latestRow.typeCode}
            </span>
            <span>{isZh ? "：" : ": "}</span>
            <span>{latestRowSurface.statusLabel}</span>
            <span>{isZh ? " · " : " · "}</span>
            <span>{latestRowSurface.deliveryLabel}</span>
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
          const rowSurface = resolveRowSurface(row, locale);

          return (
          <Card key={row.attemptId} data-testid="mbti-history-card">
            <CardHeader className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {copy.completedLabel}
              </p>
              <CardTitle className="text-base text-slate-950">{row.typeCode}</CardTitle>
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
              <div className="flex flex-wrap gap-3">
                {rowSurface.primaryHref && rowSurface.primaryCtaLabel ? (
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
                        ...continuityTelemetry,
                        ...journeyTelemetry,
                        ...adaptiveTelemetry,
                        locale,
                      });
                    }}
                  >
                    {rowSurface.primaryCtaLabel}
                  </Link>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled
                    data-testid={`mbti-history-open-${row.attemptId}`}
                  >
                    {isZh ? "当前不可进入" : "Currently unavailable"}
                  </Button>
                )}
                {rowSurface.pdfHref ? (
                  <a
                    href={rowSurface.pdfHref ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                    data-testid={`mbti-history-pdf-${row.attemptId}`}
                  >
                    {isZh ? "下载 PDF" : "Download PDF"}
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
