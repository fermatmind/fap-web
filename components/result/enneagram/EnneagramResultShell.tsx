"use client";

import Link from "next/link";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { buildEnneagramTakeHref } from "@/lib/enneagram/forms";
import type { EnneagramResultViewModel, EnneagramTypeRow } from "@/lib/enneagram/resultAssembler";
import type { Locale } from "@/lib/i18n/locales";

function formatScore(score: number | null): string {
  if (score === null) {
    return "";
  }

  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function normalizeBarWidth(score: number | null): number | null {
  if (score === null) {
    return null;
  }

  if (score >= 0 && score <= 1) {
    return Math.max(2, Math.min(100, score * 100));
  }

  return Math.max(2, Math.min(100, score));
}

function TypeChip({ type }: { type: EnneagramTypeRow }) {
  const score = formatScore(type.score);

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
      {type.rank ? `#${type.rank} · ` : ""}
      {type.label}
      {score ? ` · ${score}` : ""}
    </span>
  );
}

function TypeVector({ rows }: { rows: EnneagramTypeRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <Card data-testid="enneagram-type-vector" className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-950">Type vector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => {
          const width = normalizeBarWidth(row.score);
          const score = formatScore(row.score);

          return (
            <div key={row.code} className="grid gap-2 sm:grid-cols-[160px_1fr_56px] sm:items-center">
              <div className="text-sm font-semibold text-slate-800">{row.label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                {width !== null ? <div className="h-full rounded-full bg-sky-600" style={{ width: `${width}%` }} /> : null}
              </div>
              <div className="text-sm text-slate-600">{score}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function EnneagramResultShell({
  locale,
  attemptId,
  reportLocked,
  accessProjection,
  viewModel,
}: {
  locale: Locale;
  attemptId: string;
  reportLocked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  viewModel: EnneagramResultViewModel;
}) {
  const isZh = locale === "zh";
  const primaryType = viewModel.primaryType;
  const retakeHref = buildEnneagramTakeHref(SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, locale, viewModel.formCode);
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const topTypes = viewModel.topTypes;

  return (
    <div data-testid="enneagram-result-shell" className="space-y-8">
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-sky-50/80 to-emerald-50/60 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              {isZh ? "九型人格" : "Enneagram"}
            </span>
            {viewModel.formSummaryLabel ? (
              <span
                data-testid="enneagram-form-summary"
                className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {viewModel.formSummaryLabel}
              </span>
            ) : null}
            <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {reportLocked ? (isZh ? "预览访问" : "Preview access") : isZh ? "正式结果" : "Formal result"}
            </span>
            {viewModel.qualityLevel ? (
              <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {isZh ? "质量" : "Quality"} · {viewModel.qualityLevel.toUpperCase()}
              </span>
            ) : null}
            {viewModel.confidenceLabel ? (
              <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {isZh ? "置信" : "Confidence"} · {viewModel.confidenceLabel}
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {primaryType ? primaryType.label : isZh ? "九型人格结果" : "Enneagram result"}
            </h2>
            {primaryType?.code ? (
              <p data-testid="enneagram-primary-type" className="m-0 text-lg font-medium text-slate-700">
                {isZh ? "主型" : "Primary type"} · {primaryType.code}
              </p>
            ) : null}
            {viewModel.summary ? (
              <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{viewModel.summary}</p>
            ) : null}
          </div>

          {topTypes.length > 0 ? (
            <div data-testid="enneagram-top-types" className="flex flex-wrap gap-2">
              {topTypes.map((type) => (
                <TypeChip key={type.code} type={type} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <TypeVector rows={viewModel.typeVector} />

      <Card data-testid="enneagram-actions-card" className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-950">{isZh ? "继续使用这个结果" : "Continue with this result"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {pdfAttemptId ? (
            <div data-testid="enneagram-pdf-entry">
              <PdfDownloadButton
                attemptId={pdfAttemptId}
                locked={reportLocked}
                accessProjection={accessProjection}
                locale={locale}
                filenamePrefix="enneagram-report"
              />
            </div>
          ) : null}
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重新测试" : "Retake test"}
          </Link>
        </CardContent>
      </Card>

      {viewModel.visibleSections.length > 0 ? (
        <div data-testid="enneagram-sections" className="space-y-4">
          {viewModel.visibleSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "section"}
              section={section}
              locked={false}
              locale={locale}
              scaleCode="ENNEAGRAM"
            />
          ))}
        </div>
      ) : null}

      {viewModel.lockedSections.length > 0 ? (
        <div data-testid="enneagram-locked-sections" className="space-y-4">
          {viewModel.lockedSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "locked-section"}
              section={section}
              locked
              locale={locale}
              scaleCode="ENNEAGRAM"
              ctaLabel={isZh ? "解锁完整报告" : "Unlock full report"}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
