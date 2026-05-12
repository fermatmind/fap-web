"use client";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IqReportModuleViewModel, IqResultMetricValue } from "@/lib/iq/result";
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

function renderMetricRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-[var(--fm-text-muted)]">{label}</dt>
      <dd className="text-right font-semibold text-[var(--fm-text)]">{value}</dd>
    </div>
  );
}

export function IqReportModule({
  locale,
  viewModel,
}: {
  locale: Locale;
  viewModel: IqReportModuleViewModel;
}) {
  return (
    <div className="space-y-[var(--fm-gap-md)]" data-testid="iq-report-module">
      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-text-muted)]">
            {locale === "zh" ? "结果说明" : "Interpretation"}
          </p>
          <CardTitle>{locale === "zh" ? "详细报告模块" : "Detailed report module"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewModel.lockedMessage ? (
            <Alert>
              <span data-testid="iq-report-module-locked">{viewModel.lockedMessage}</span>
            </Alert>
          ) : null}

          {viewModel.detailedReportMessage ? (
            <p className="text-sm leading-6 text-[var(--fm-text-muted)]" data-testid="iq-report-module-unavailable">
              {viewModel.detailedReportMessage}
            </p>
          ) : null}

          <div
            className="rounded-[12px] border border-[var(--fm-border)] bg-[var(--fm-surface-subtle,#f8fafc)] p-4"
            data-testid="iq-method-boundary"
          >
            <p className="text-sm leading-6 text-[var(--fm-text-muted)]">{viewModel.boundaryMessage}</p>
          </div>

          <div
            className="rounded-[12px] border border-[var(--fm-border)] bg-[var(--fm-surface-subtle,#f8fafc)] p-4"
            data-testid="iq-interpretation-boundary"
          >
            <p className="text-sm leading-6 text-[var(--fm-text-muted)]">{viewModel.interpretationMessage}</p>
          </div>

          {viewModel.sections.length > 0 ? (
            <div className="space-y-4" data-testid="iq-report-sections">
              {viewModel.sections.map((section) => (
                <div
                  key={section.key}
                  className="rounded-[12px] border border-[var(--fm-border)] p-4"
                  data-testid={`iq-report-section-${section.key}`}
                >
                  {section.title ? (
                    <h3 className="text-base font-semibold text-[var(--fm-text)]">{section.title}</h3>
                  ) : null}
                  {section.body ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{section.body}</p>
                  ) : null}
                  {section.bullets.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>• {bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3" data-testid="iq-report-dimensions">
            {viewModel.dimensions.map((dimension) => (
              <div
                key={dimension.key}
                className="rounded-[12px] border border-[var(--fm-border)] p-4"
                data-testid={`iq-report-dimension-detail-${dimension.code.toLowerCase()}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                  {dimension.code}
                </p>
                <h3 className="mt-2 text-base font-semibold text-[var(--fm-text)]">{dimension.label}</h3>
                {dimension.missing ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">
                    {locale === "zh" ? "该维度详细说明暂未生成。" : "Detailed interpretation for this dimension is not available yet."}
                  </p>
                ) : (
                  <dl className="mt-3 space-y-3">
                    {renderMetricRow({
                      label: locale === "zh" ? "原始分" : "Raw score",
                      value: formatMetricValue(dimension.rawScore),
                    })}
                    {renderMetricRow({
                      label: locale === "zh" ? "标准化分" : "Normalized score",
                      value: formatMetricValue(dimension.normalizedScore),
                    })}
                    {renderMetricRow({
                      label: locale === "zh" ? "百分位" : "Percentile",
                      value: formatPercentValue(dimension.percentile),
                    })}
                    {renderMetricRow({
                      label: locale === "zh" ? "分段" : "Band",
                      value: dimension.band,
                    })}
                    {dimension.insight ? (
                      <div className="pt-1 text-sm leading-6 text-[var(--fm-text-muted)]">{dimension.insight}</div>
                    ) : null}
                  </dl>
                )}
              </div>
            ))}
          </div>

          {viewModel.pdfPlaceholder ? (
            <Alert>
              <span data-testid="iq-pdf-placeholder">{viewModel.pdfPlaceholder}</span>
            </Alert>
          ) : null}

          {viewModel.certificatePlaceholder ? (
            <Alert>
              <span data-testid="iq-certificate-placeholder">{viewModel.certificatePlaceholder}</span>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
