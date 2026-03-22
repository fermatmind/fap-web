"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { trackEvent } from "@/lib/analytics";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canEnterReportPage, normalizeAttemptReportAccess } from "@/lib/access/unifiedAccess";
import { fetchAttemptReportAccess, getMyAttempts, type MeAttemptItem } from "@/lib/api/v0_3";
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
};

function formatSubmittedAt(value: string, locale: "en" | "zh"): string {
  if (!value) return locale === "zh" ? "时间待同步" : "Pending sync";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return locale === "zh"
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolveMbtiRow(item: MeAttemptItem): Row | null {
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
  const [latestResultPath, setLatestResultPath] = useState<string | null>(null);
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
  const latestResultHref = latestRow
    ? appendMbtiActionJourneyQuery(
        appendMbtiAdaptiveSelectionQuery(
          appendMbtiContinuityQuery(latestResultPath ?? localizedPath(`/result/${latestRow.attemptId}`, locale), continuity),
          adaptiveSelection
        ),
        journey
      )
    : null;

  useEffect(() => {
    let active = true;

    if (!latestRow?.attemptId) {
      setLatestResultPath(null);
      return () => {
        active = false;
      };
    }

    void fetchAttemptReportAccess({ attemptId: latestRow.attemptId })
      .then((response) => {
        if (!active) return;
        const accessView = normalizeAttemptReportAccess(response, locale);
        setLatestResultPath(
          canEnterReportPage(accessView) && accessView?.actions.pageHref
            ? accessView.actions.pageHref
            : localizedPath(`/result/${latestRow.attemptId}`, locale)
        );
      })
      .catch(() => {
        if (!active) return;
        setLatestResultPath(localizedPath(`/result/${latestRow.attemptId}`, locale));
      });

    return () => {
      active = false;
    };
  }, [latestRow?.attemptId, locale]);

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
          .map((item) => resolveMbtiRow(item))
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
          <p className="m-0 text-sm leading-7 text-slate-600">
            {isZh
              ? "这里现在就是你的 MBTI Workspace Lite 入口：继续查看当前结果，或用订单找回恢复已购报告。"
              : "This is now your MBTI Workspace Lite entry: continue from saved results here, or recover a purchased report through order lookup."}
          </p>
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
          {latestResultHref ? (
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
              {isZh ? "继续查看最新结果" : "Continue with latest result"}
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
        {rows.map((row) => (
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
                {copy.statusValue}
              </p>
              <Link
                href={appendMbtiActionJourneyQuery(
                  appendMbtiAdaptiveSelectionQuery(
                    appendMbtiContinuityQuery(localizedPath(`/result/${row.attemptId}`, locale), continuity),
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
                {copy.viewReport}
              </Link>
            </CardContent>
          </Card>
        ))}
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
