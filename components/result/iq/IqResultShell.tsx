"use client";

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

function ScoreGauge({ score, locale }: { score: number | null; locale: Locale }) {
  const progress = score === null ? null : (score - 55) / 90;
  const angle = progress === null ? null : Math.PI * (1 - progress);
  const needle = angle === null ? null : { x: 160 + 89 * Math.cos(angle), y: 160 - 89 * Math.sin(angle) };
  return (
    <svg viewBox="0 0 320 245" className="mx-auto w-full max-w-[320px]" role="img"
      aria-label={locale === "zh" ? `推理标准分：${score ?? "待估计"}，显示范围55至145` : `Reasoning standard score: ${score ?? "not available"}, display range 55 to 145`}>
      <path d="M 45 160 A 115 115 0 0 1 275 160" fill="none" stroke="var(--fm-border)" strokeWidth="13" strokeLinecap="round" />
      {progress !== null ? <path d="M 45 160 A 115 115 0 0 1 275 160" pathLength="100" fill="none"
        stroke="var(--fm-accent)" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${progress * 100} 100`}
        className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none" /> : null}
      {[55, 70, 85, 100, 115, 130, 145].map((tick) => {
        const tickAngle = Math.PI * (1 - (tick - 55) / 90);
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

const LABELS = {
  zh: { VSPR: "空间模式", VSI: "空间洞察", NPR: "数字规律" },
  en: { VSPR: "Spatial patterns", VSI: "Spatial insight", NPR: "Number patterns" },
};

function point(index: number, fraction: number): [number, number] {
  const angle = (-90 + index * 120) * Math.PI / 180;
  return [220 + 97 * fraction * Math.cos(angle), 155 + 97 * fraction * Math.sin(angle)];
}

function polygon(fractions: number[]): string {
  return fractions.map((fraction, index) => point(index, fraction).map((value) => value.toFixed(2)).join(",")).join(" ");
}

function PerformanceRadar({ dimensions, locale }: { dimensions: IqPerformanceDimension[]; locale: Locale }) {
  const complete = dimensions.every((dimension) => dimension.percentCorrect !== null);
  const labels = [[220, 27], [353, 220], [87, 220]];
  return (
    <svg viewBox="0 0 440 280" className="mx-auto w-full max-w-[520px]" role="img"
      aria-label={locale === "zh" ? "三维推理表现雷达图，展示本次答题正确率" : "Three-dimension reasoning radar showing accuracy on this attempt"}>
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <polygon key={fraction} points={polygon([fraction, fraction, fraction])} fill="none" stroke="var(--fm-border)" />
      ))}
      {dimensions.map((dimension, index) => {
        const endpoint = point(index, 1);
        return <g key={dimension.code}>
          <line x1="220" y1="155" x2={endpoint[0]} y2={endpoint[1]} stroke="var(--fm-border)" />
          <text x={labels[index][0]} y={labels[index][1]} textAnchor="middle" fill="var(--fm-text-muted)" fontSize="12">{LABELS[locale][dimension.code]}</text>
          <text x={labels[index][0]} y={labels[index][1] + 20} textAnchor="middle" fill="var(--fm-accent)" fontSize="14" fontWeight="600">{percent(dimension.percentCorrect)}</text>
        </g>;
      })}
      {complete ? <g data-testid="iq-radar-values">
        <polygon points={polygon(dimensions.map((dimension) => dimension.percentCorrect! / 100))}
          fill="var(--fm-accent)" fillOpacity="0.13" stroke="var(--fm-accent)" strokeWidth="2" />
        {dimensions.map((dimension, index) => {
          const location = point(index, dimension.percentCorrect! / 100);
          return <circle key={dimension.code} cx={location[0]} cy={location[1]} r="3.5" fill="var(--fm-accent)" />;
        })}
      </g> : null}
    </svg>
  );
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
  const correctText = presentation.correct !== null && presentation.total !== null
    ? `${presentation.correct}/${presentation.total}` : "—";
  const shortSummary = presentation.percentile !== null
    ? zh ? `本次表现约处于参考人群的第${percent(presentation.percentile).replace("%", "")}百分位。`
      : `This result is approximately at percentile ${percent(presentation.percentile).replace("%", "")} in the reference population.`
    : zh ? "推理标准分与人群位置暂未生成。" : "A standard score and population rank are not available yet.";

  return (
    <div className="space-y-[var(--fm-gap-lg)]" data-testid="iq-result-shell">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--fm-text-muted)]">FermatMind</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--fm-text)]" data-testid="iq-result-title">{zh ? "智商测试结果" : "IQ Test Results"}</h2>
      </header>
      {viewModel.lockedMessage ? <Alert><span data-testid="iq-report-locked-notice">{viewModel.lockedMessage}</span></Alert> : null}
      {viewModel.bankStatus ? <Alert><span data-testid="iq-bank-placeholder-notice" data-bank-id={viewModel.bankStatus.bankId}>{viewModel.bankStatus.notice}</span></Alert> : null}
      <div className="grid items-stretch gap-[var(--fm-gap-lg)] lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
        <Card data-testid="iq-standard-score-module">
          <CardHeader><CardTitle>{zh ? "推理标准分" : "Reasoning standard score"}</CardTitle></CardHeader>
          <CardContent>
            <ScoreGauge score={presentation.standardScore} locale={locale} />
            <p className="text-center text-sm text-[var(--fm-text-muted)]" data-testid="iq-standard-score-status">
              {presentation.standardScore !== null ? zh ? "依据真人参考分布换算" : "Based on the human reference distribution"
                : zh ? "暂无法估计" : "Not available yet"}
            </p>
          </CardContent>
        </Card>
        <Card data-testid="iq-result-overview">
          <CardHeader><CardTitle>{zh ? "成绩概览" : "Result overview"}</CardTitle></CardHeader>
          <CardContent className="space-y-[var(--fm-gap-lg)]">
            <p className="max-w-xl text-base leading-7 text-[var(--fm-text-secondary)]">{presentation.blocked
              ? zh ? "本次结果未完成有效评分，请重新完成测试。" : "This attempt could not be scored. Please complete the test again."
              : shortSummary}</p>
            <dl className="grid grid-cols-2 gap-x-[var(--fm-gap-lg)] gap-y-[var(--fm-gap-xl)]">
              {[
                { label: zh ? "百分位" : "Percentile", value: percent(presentation.percentile), testId: presentation.percentile !== null ? "iq-percentile" : "iq-percentile-unavailable" },
                { label: zh ? "正确率" : "Accuracy", value: percent(presentation.percentCorrect), testId: "iq-accuracy" },
                { label: zh ? "答对题数" : "Correct answers", value: correctText, testId: "iq-correct-count" },
                { label: zh ? "用时" : "Time taken", value: duration(presentation.durationMs), testId: "iq-duration" },
              ].map((metric) => <div key={metric.testId} className="border-t border-[var(--fm-border)] pt-3" data-testid={metric.testId}>
                <dt className="text-sm text-[var(--fm-text-muted)]">{metric.label}</dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--fm-text)] sm:text-3xl">{metric.value}</dd>
              </div>)}
            </dl>
            {presentation.referencePopulation ? <p className="text-xs leading-5 text-[var(--fm-text-muted)]" data-testid="iq-reference-population">{zh ? "参考人群：" : "Reference population: "}{presentation.referencePopulation}</p> : null}
            {viewModel.qualityFlags.length > 0 && !presentation.blocked ? <p className="text-xs leading-5 text-[var(--fm-text-muted)]" data-testid="iq-quality-notice">{zh ? "本次作答有质量提示，解读时请结合实际作答情况。" : "This attempt has quality indicators. Consider the conditions of your attempt when interpreting it."}</p> : null}
          </CardContent>
        </Card>
      </div>
      <Card data-testid="iq-performance-radar-module">
        <CardHeader>
          <CardTitle>{zh ? "推理表现" : "Reasoning performance"}</CardTitle>
          <p className="text-sm text-[var(--fm-text-muted)]">{zh ? "各维度本次答题正确率" : "Accuracy in each dimension on this attempt"}</p>
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
          <p className="mt-4 text-xs leading-5 text-[var(--fm-text-muted)]">{zh ? "维度正确率描述本次题目表现，不代表人群排名。" : "Dimension accuracy describes performance on these items, rather than population rank."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
