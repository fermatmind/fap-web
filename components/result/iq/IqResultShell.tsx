"use client";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IqReportModule } from "@/components/result/iq/IqReportModule";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import { buildIqResultViewModel, type IqResultMetricValue } from "@/lib/iq/result";
import type { Locale } from "@/lib/i18n/locales";

function formatMetricValue(value: IqResultMetricValue): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  const normalized = value.trim();
  return normalized || null;
}

function formatPercentValue(value: IqResultMetricValue): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    const normalized = value >= 0 && value <= 1 ? value * 100 : value;
    const rounded = Math.round(normalized * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.includes("%") ? trimmed : `${trimmed}%`;
}

function formatConfidenceInterval({
  lower,
  upper,
  level,
}: {
  lower: IqResultMetricValue;
  upper: IqResultMetricValue;
  level: string | null;
}): string | null {
  const lowerText = formatMetricValue(lower);
  const upperText = formatMetricValue(upper);

  if (!lowerText && !upperText && !level) {
    return null;
  }

  const range = lowerText && upperText
    ? `${lowerText} - ${upperText}`
    : lowerText ?? upperText ?? "";

  return level ? `${range}${range ? " · " : ""}${level}` : range;
}

function renderMetricRow({
  label,
  value,
  testId,
}: {
  label: string;
  value: string | null;
  testId?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm" data-testid={testId}>
      <dt className="text-[var(--fm-text-muted)]">{label}</dt>
      <dd className="text-right font-semibold text-[var(--fm-text)]">{value}</dd>
    </div>
  );
}

export function IqResultShell({
  locale,
  reportData,
  resultData,
  accessView,
}: {
  locale: Locale;
  reportData: ReportResponse | null;
  resultData: ResultResponse | null;
  accessView: AttemptReportAccessView | null;
}) {
  const viewModel = buildIqResultViewModel({
    locale,
    reportData,
    resultData,
    accessView,
  });

  const confidenceIntervalText = viewModel.confidenceInterval
    ? formatConfidenceInterval(viewModel.confidenceInterval)
    : null;
  const iqEstimateText = formatMetricValue(viewModel.iqEstimate);
  const rawScoreText = formatMetricValue(viewModel.rawScore);
  const percentileText = formatPercentValue(viewModel.percentile);

  return (
    <div className="space-y-[var(--fm-gap-md)]" data-testid="iq-result-shell">
      {viewModel.lockedMessage ? (
        <Alert>
          <span data-testid="iq-report-locked-notice">{viewModel.lockedMessage}</span>
        </Alert>
      ) : null}

      <Card data-testid="iq-result-summary">
        <CardHeader className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-text-muted)]">
            {locale === "zh" ? "测评结果" : "Assessment result"}
          </p>
          <CardTitle data-testid="iq-result-title">{viewModel.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewModel.summary ? (
            <p className="text-sm leading-6 text-[var(--fm-text-muted)]">{viewModel.summary}</p>
          ) : null}

          {iqEstimateText ? (
            <div className="rounded-[12px] border border-[var(--fm-border)] bg-[var(--fm-surface-subtle,#f8fafc)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                {locale === "zh" ? "IQ 估计值" : "IQ estimate"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--fm-text)]" data-testid="iq-iq-estimate-value">
                {iqEstimateText}
              </p>
            </div>
          ) : (
            <div
              className="rounded-[12px] border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface-subtle,#f8fafc)] p-4 text-sm leading-6 text-[var(--fm-text-muted)]"
              data-testid="iq-iq-estimate-unavailable"
            >
              {locale === "zh"
                ? "当前结果暂未生成完整 IQ 估计值"
                : "The IQ estimate is not available for this result yet"}
            </div>
          )}

          <dl className="space-y-3">
            {renderMetricRow({
              label: locale === "zh" ? "原始分" : "Raw score",
              value: rawScoreText,
              testId: "iq-raw-score",
            })}
            {renderMetricRow({
              label: locale === "zh" ? "百分位" : "Percentile",
              value: percentileText,
              testId: "iq-percentile",
            })}
            {renderMetricRow({
              label: locale === "zh" ? "置信区间" : "Confidence interval",
              value: confidenceIntervalText,
              testId: "iq-confidence-interval",
            })}
            {renderMetricRow({
              label: locale === "zh" ? "结果质量" : "Quality level",
              value: viewModel.qualityLevel,
              testId: "iq-quality-level",
            })}
            {renderMetricRow({
              label: locale === "zh" ? "稳定性状态" : "Stability status",
              value: viewModel.stabilityStatus,
              testId: "iq-stability-status",
            })}
            {renderMetricRow({
              label: locale === "zh" ? "稳定性说明" : "Stability note",
              value: viewModel.stabilityReason,
              testId: "iq-stability-reason",
            })}
          </dl>

          {viewModel.qualityFlags.length > 0 ? (
            <div className="space-y-2" data-testid="iq-quality-flags">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                {locale === "zh" ? "质量标记" : "Quality flags"}
              </p>
              <div className="flex flex-wrap gap-2">
                {viewModel.qualityFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs text-[var(--fm-text-muted)]"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {viewModel.dimensions.map((dimension) => {
          const rawScore = formatMetricValue(dimension.rawScore);
          const scaledScore = formatMetricValue(dimension.scaledScore);
          const normalizedScore = formatMetricValue(dimension.normalizedScore);
          const percentile = formatPercentValue(dimension.percentile);

          return (
            <Card key={dimension.key} data-testid={`iq-dimension-card-${dimension.code.toLowerCase()}`}>
              <CardHeader className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                  {dimension.code}
                </p>
                <CardTitle className="text-lg">{dimension.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3">
                  {renderMetricRow({
                    label: locale === "zh" ? "原始分" : "Raw score",
                    value: rawScore,
                  })}
                  {renderMetricRow({
                    label: locale === "zh" ? "缩放分" : "Scaled score",
                    value: scaledScore,
                  })}
                  {renderMetricRow({
                    label: locale === "zh" ? "标准化分" : "Normalized score",
                    value: normalizedScore,
                  })}
                  {renderMetricRow({
                    label: locale === "zh" ? "百分位" : "Percentile",
                    value: percentile,
                  })}
                  {renderMetricRow({
                    label: locale === "zh" ? "分段" : "Band",
                    value: dimension.band,
                  })}
                </dl>

                {dimension.insight ? (
                  <p className="text-sm leading-6 text-[var(--fm-text-muted)]">{dimension.insight}</p>
                ) : null}

                {dimension.missing ? (
                  <p className="text-sm text-[var(--fm-text-muted)]" data-testid={`iq-dimension-missing-${dimension.code.toLowerCase()}`}>
                    {locale === "zh"
                      ? "该维度数据暂未生成。"
                      : "This dimension is not available yet."}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <IqReportModule locale={locale} viewModel={viewModel.reportModule} />
    </div>
  );
}
