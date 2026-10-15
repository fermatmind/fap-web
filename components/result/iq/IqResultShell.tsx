"use client";

import { IqAbilityRadar } from "./IqAbilityRadar";
import { iqResultCopy } from "@/lib/iq/resultCopy";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import { buildIqResultViewModel } from "@/lib/iq/result";
import { buildIqResultPresentation, type IqPerformanceDimension } from "@/lib/iq/presentation";
import type { Locale } from "@/lib/i18n/locales";

function percent(value: number | null): string {
  if (value === null) return "—";
  // Keep rare percentiles readable; 0.5 on a 0–100 scale must remain 0.5%.
  if (value > 0 && value < 0.01) return "<0.01%";
  if (value > 99.99 && value < 100) return ">99.99%";
  return `${Number(value.toFixed(value < 1 || value > 99 ? 2 : 1))}%`;
}

function duration(value: number | null): string {
  if (value === null) return "—";
  const seconds = Math.floor(value / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function ScoreGauge({ score, locale, beta }: { score: number | null; locale: Locale; beta: boolean }) {
  const minimum = beta ? 73 : 55;
  const progress = score === null ? null : (score - minimum) / (145 - minimum);
  const angle = progress === null ? null : Math.PI * (1 - progress);
  const needle = angle === null ? null : { x: 160 + 89 * Math.cos(angle), y: 160 - 89 * Math.sin(angle) };
  return (
    <svg viewBox="0 0 320 245" className="mx-auto w-full max-w-[320px]" role="img"
      aria-label={locale === "zh" ? `IQ得分：${score ?? "待估计"}，显示范围${minimum}至145` : `IQ score: ${score ?? "not available"}, display range ${minimum} to 145`}>
      <path d="M 45 160 A 115 115 0 0 1 275 160" fill="none" stroke="var(--fm-border)" strokeWidth="13" strokeLinecap="round" />
      {progress !== null ? <path d="M 45 160 A 115 115 0 0 1 275 160" pathLength="100" fill="none"
        stroke="var(--fm-accent)" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${progress * 100} 100`}
        className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none" /> : null}
      {(beta ? [73, 85, 100, 115, 130, 145] : [55, 70, 85, 100, 115, 130, 145]).map((tick) => {
        const tickAngle = Math.PI * (1 - (tick - minimum) / (145 - minimum));
        return <text key={tick} x={160 + 142 * Math.cos(tickAngle)} y={165 - 142 * Math.sin(tickAngle)}
          textAnchor="middle" fill="var(--fm-text-muted)" fontSize="11">{tick}</text>;
      })}
      {needle ? <g stroke="var(--fm-accent)" strokeWidth="2.5">
        <line x1="160" y1="160" x2={needle.x} y2={needle.y} />
        <circle cx="160" cy="160" r="5" fill="var(--fm-surface)" />
      </g> : null}
      <text x="160" y="218" textAnchor="middle" fill="var(--fm-text)" fontSize="46" fontWeight="650" data-testid="iq-standard-score-value">{score ?? "—"}</text>
    </svg>
  );
}

function PerformanceRadar({ dimensions, locale }: { dimensions: IqPerformanceDimension[]; locale: Locale }) {
  const zh = locale === "zh";
  const dimension = (code: string) => dimensions.find((item) => item.code === code);
  const measured = (code: string, label: string) => ({ code, label,
    correct: dimension(code)?.correct ?? null, total: dimension(code)?.total ?? null });
  // The bank has three content categories. Logic and verbal are unmeasured;
  // never duplicate spatial values or interpolate a fictional five-factor profile.
  return <IqAbilityRadar locale={locale} axes={[
    measured("NPR", zh ? "数字" : "Numbers"),
    { code: "logic", label: zh ? "逻辑" : "Logic", correct: null, total: null, unmeasured: true },
    measured("VSPR", zh ? "图形" : "Patterns"),
    { code: "verbal", label: zh ? "言语" : "Verbal", correct: null, total: null, unmeasured: true },
    measured("VSI", zh ? "空间" : "Spatial"),
  ]} />;
}

export function IqResultShell({ locale, reportData, resultData, accessView }: {
  locale: Locale;
  reportData: ReportResponse | null;
  resultData: ResultResponse | null;
  accessView: AttemptReportAccessView | null;
}) {
  const viewModel = buildIqResultViewModel({ locale, reportData, resultData, accessView });
  const presentation = buildIqResultPresentation({ locale, reportData, resultData, locked: viewModel.locked });
  const zh = locale === "zh";
  const beta = presentation.scoreKind === "beta_reference";
  const percentileText = beta && presentation.percentile !== null
    ? `${presentation.percentile.toFixed(2)}%` : percent(presentation.percentile);
  const correctText = presentation.correct !== null && presentation.total !== null
    ? `${presentation.correct}/${presentation.total}` : "—";
  const resultCopy = iqResultCopy(presentation.standardScore, locale);

  return (
    <div className="space-y-[var(--fm-gap-lg)]" data-testid="iq-result-shell">
      {viewModel.lockedMessage ? <Alert><span data-testid="iq-report-locked-notice">{viewModel.lockedMessage}</span></Alert> : null}
      {viewModel.bankStatus ? <Alert><span data-testid="iq-bank-placeholder-notice" data-bank-id={viewModel.bankStatus.bankId}>{viewModel.bankStatus.notice}</span></Alert> : null}
      <div className="grid items-stretch gap-[var(--fm-gap-lg)] lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
        <Card data-testid="iq-standard-score-module">
          <CardHeader><CardTitle>{zh ? "IQ得分" : "IQ score"}</CardTitle></CardHeader>
          <CardContent>
            <ScoreGauge score={presentation.standardScore} locale={locale} beta={beta} />
            {presentation.standardScore === null ? <p className="text-center text-sm text-[var(--fm-text-muted)]" data-testid="iq-standard-score-status">
              {zh ? "暂无法估计" : "Not available yet"}
            </p> : null}
          </CardContent>
        </Card>
        <Card data-testid="iq-result-overview">
          <CardHeader><CardTitle data-testid="iq-result-band" data-band={resultCopy.band}>{resultCopy.title}</CardTitle></CardHeader>
          <CardContent className="space-y-[var(--fm-gap-lg)]">
            <p className="max-w-xl text-base leading-7 text-[var(--fm-text-secondary)]">{presentation.blocked
              ? zh ? "本次结果未完成有效评分，请重新完成测试。" : "This attempt could not be scored. Please complete the test again."
              : resultCopy.description}</p>
            <dl className="grid grid-cols-2 gap-x-[var(--fm-gap-lg)] gap-y-[var(--fm-gap-xl)]">
              {[
                { label: zh ? "超过人群比例" : "Proportion exceeded", value: percentileText, testId: presentation.percentile !== null ? "iq-percentile" : "iq-percentile-unavailable" },
                { label: zh ? "答题正确率" : "Answer accuracy", value: percent(presentation.percentCorrect), testId: "iq-accuracy" },
                { label: zh ? "答对题数" : "Correct answers", value: correctText, testId: "iq-correct-count" },
                { label: zh ? "用时" : "Time taken", value: duration(presentation.durationMs), testId: "iq-duration" },
              ].map((metric) => <div key={metric.testId} className="border-t border-[var(--fm-border)] pt-3" data-testid={metric.testId}>
                <dt className="text-sm text-[var(--fm-text-muted)]">{metric.label}</dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--fm-text)] sm:text-3xl">{metric.value}</dd>
              </div>)}
            </dl>
            {presentation.referencePopulation ? <p className="text-xs leading-5 text-[var(--fm-text-muted)]" data-testid="iq-reference-population">{zh ? "参考人群：" : "Reference population: "}{presentation.referencePopulation}</p> : null}
          </CardContent>
        </Card>
      </div>
      <Card data-testid="iq-performance-radar-module">
        <CardHeader>
          <CardTitle>{zh ? "五维能力雷达" : "Five-axis ability radar"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid items-center gap-[var(--fm-gap-lg)] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <PerformanceRadar dimensions={presentation.dimensions} locale={locale} />
            <dl className="space-y-[var(--fm-gap-md)]">
              {presentation.dimensions.map((dimension) => <div key={dimension.code} className="border-b border-[var(--fm-border)] pb-4" data-testid={`iq-performance-${dimension.code.toLowerCase()}`}>
                <dt className="text-sm text-[var(--fm-text-secondary)]">{viewModel.dimensions.find((item) => item.code === dimension.code)?.label}</dt>
                <dd className="mt-2 flex items-baseline justify-between gap-4">
                  <span className="text-xl font-semibold tabular-nums text-[var(--fm-text)]">{percent(dimension.percentCorrect)}</span>
                  <span className="text-sm tabular-nums text-[var(--fm-text-muted)]">{dimension.correct !== null && dimension.total !== null ? `${dimension.correct}/${dimension.total}` : zh ? "数据暂缺" : "Not available"}</span>
                </dd>
              </div>)}
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
