"use client";

import { useId } from "react";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { buildIqResultExport } from "@/lib/iq/export";
import { IqProcessPractice } from "./IqProcessPractice";
import { IqAbilityRadar } from "./IqAbilityRadar";
import { iqResultCopy } from "@/lib/iq/resultCopy";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import { buildIqResultViewModel } from "@/lib/iq/result";
import { buildIqResultPresentation, type IqPerformanceDimension } from "@/lib/iq/presentation";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { assessmentChineseCopy } from "@/lib/tests/traditionalAssessmentDisplay";

const TAIWAN_DIMENSION_LABELS = {
  VSI: "視覺空間洞察",
  VSPR: "視覺空間模式推理",
  NPR: "數字規律推理",
} as const;

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

const SCORE_TICKS = [55, 70, 85, 100, 115, 130, 145];
const SCORE_BASELINE = 213;
const scoreX = (score: number) => 59 + (score - 55) * 312 / 90;
const curveY = (score: number) => SCORE_BASELINE - 7 - 184 * Math.exp(-0.5 * ((score - 100) / 13) ** 2);
const distributionPath = `M59 ${SCORE_BASELINE} L${Array.from({ length: 91 }, (_, index) => {
  const score = 55 + index;
  return `${scoreX(score)} ${curveY(score)}`;
}).join(" L")} L371 ${SCORE_BASELINE}Z`;

function ScoreDistribution({ score, locale, displayLocale }: { score: number | null; locale: Locale; displayLocale: DisplayLocale }) {
  const id = useId();
  const distributionFill = `${id}-distribution`;
  const markerFill = `${id}-marker`;
  const zh = locale === "zh";
  const copy = (source: string, traditional: string) => assessmentChineseCopy(displayLocale, source, traditional);
  const markerX = score === null ? 0 : scoreX(score);
  const markerY = score === null ? 0 : curveY(score);
  const arrowTip = Math.max(12, markerY - 24);
  const chartLabel = zh
    ? copy("参考分布示意，显示范围55至145", "參考分布示意，顯示範圍55至145")
    : "Illustrative reference distribution, display range 55 to 145";

  return (
    <figure className="m-0">
      <div className="mb-3 text-[clamp(3rem,5vw,3.625rem)] leading-none font-bold tracking-tight tabular-nums" data-testid="iq-standard-score-value">{score ?? "—"}</div>
      <svg viewBox="0 -28 424 288" className="mx-auto block w-full max-w-[424px]" role="img" aria-label={chartLabel}>
        <defs>
          <linearGradient id={distributionFill}>
            <stop stopColor="#65c7ec" /><stop offset=".16" stopColor="#31b3de" />
            <stop offset=".27" stopColor="#006fae" /><stop offset=".34" stopColor="#56bce6" />
            <stop offset=".41" stopColor="#009dd0" /><stop offset=".50" stopColor="#0073b5" />
            <stop offset=".61" stopColor="#009dd0" /><stop offset=".68" stopColor="#55bce6" />
            <stop offset=".78" stopColor="#0078b7" /><stop offset=".88" stopColor="#31b3de" />
            <stop offset="1" stopColor="#65c7ec" />
          </linearGradient>
          <linearGradient id={markerFill}>
            <stop stopColor="#ff2400" /><stop offset=".62" stopColor="#ff9600" /><stop offset="1" stopColor="#ffdc00" />
          </linearGradient>
        </defs>
        <path d="M27 12V235H413" fill="none" stroke="#959b9f" strokeWidth="1.5" />
        <path d="M24 13L27 3l3 10z M410 232l10 3-10 3z" fill="#959b9f" />
        <path d={distributionPath} fill={`url(#${distributionFill})`} />
        {score !== null ? (
          <g transform={`translate(${markerX} 0)`} fill={`url(#${markerFill})`} data-testid="iq-score-marker">
            <path d={`M-1.7 ${SCORE_BASELINE}V${markerY + 5}l3.4-7V${SCORE_BASELINE}z`} />
            <path d={`M-2.8 ${arrowTip - 34}h5.6v25h7l-9.8 11-9.8-11h7z`} />
          </g>
        ) : null}
        <g fill="var(--fm-text)" fontSize="12" fontWeight="700" textAnchor="middle">
          {SCORE_TICKS.map((tick) => <text key={tick} x={scoreX(tick)} y="229">{tick}</text>)}
          <text x="215" y="253">{zh ? "智商" : "IQ"}</text>
          <text x="13" y="122" transform="rotate(-90 13 122)">{zh ? copy("参考频率", "參考頻率") : "Reference frequency"}</text>
        </g>
      </svg>
      <figcaption className="text-center text-sm text-[var(--fm-text-muted)]">{zh ? copy("参考分布示意", "參考分布示意") : "Illustrative reference distribution"}</figcaption>
    </figure>
  );
}

function PerformanceRadar({ dimensions, locale, displayLocale }: { dimensions: IqPerformanceDimension[]; locale: Locale; displayLocale: DisplayLocale }) {
  const zh = locale === "zh";
  const copy = (source: string, traditional: string) => assessmentChineseCopy(displayLocale, source, traditional);
  const dimension = (code: string) => dimensions.find((item) => item.code === code);
  const measured = (code: string, label: string) => ({ code, label,
    correct: dimension(code)?.correct ?? null, total: dimension(code)?.total ?? null });
  // The bank has three content categories. Logic and verbal are unmeasured;
  // never duplicate spatial values or interpolate a fictional five-factor profile.
  return <IqAbilityRadar locale={locale} displayLocale={displayLocale} axes={[
    measured("NPR", zh ? copy("数字", "數字") : "Numbers"),
    { code: "logic", label: zh ? copy("逻辑", "邏輯") : "Logic", correct: null, total: null, unmeasured: true },
    measured("VSPR", zh ? copy("图形", "圖形") : "Patterns"),
    { code: "verbal", label: zh ? copy("言语", "語文") : "Verbal", correct: null, total: null, unmeasured: true },
    measured("VSI", zh ? copy("空间", "空間") : "Spatial"),
  ]} />;
}

export function IqResultShell({ locale, displayLocale = locale, reportData, resultData, accessView, exportPdfState = "unavailable", onDownloadPdf }: {
  locale: Locale;
  displayLocale?: DisplayLocale;
  reportData: ReportResponse | null;
  resultData: ResultResponse | null;
  accessView: AttemptReportAccessView | null;
  exportPdfState?: "ready" | "pending" | "unavailable";
  onDownloadPdf?: () => Promise<void>;
}) {
  const viewModel = buildIqResultViewModel({ locale, reportData, resultData, accessView });
  const presentation = buildIqResultPresentation({ locale, reportData, resultData, locked: viewModel.locked });
  const exportProjection = buildIqResultExport({ locale, reportData, resultData, accessView });
  const zh = locale === "zh";
  const copy = (source: string, traditional: string) => assessmentChineseCopy(displayLocale, source, traditional);
  const beta = presentation.scoreKind === "beta_reference";
  const percentileText = beta && presentation.percentile !== null
    ? `${presentation.percentile.toFixed(2)}%` : percent(presentation.percentile);
  const correctText = presentation.correct !== null && presentation.total !== null
    ? `${presentation.correct}/${presentation.total}` : "—";
  const resultCopy = iqResultCopy(presentation.standardScore, locale, displayLocale);

  return (
    <div className="space-y-[var(--fm-gap-lg)]" data-testid="iq-result-shell">
      {viewModel.lockedMessage ? <Alert><span data-testid="iq-report-locked-notice">{copy(viewModel.lockedMessage, "目前為免費預覽。完整 IQ 報告須在取得後端授權後才會顯示。")}</span></Alert> : null}
      {viewModel.bankStatus ? <Alert><span data-testid="iq-bank-placeholder-notice" data-bank-id={viewModel.bankStatus.bankId}>{copy(viewModel.bankStatus.notice, "此結果屬於未來的 50 題 beta 版本。題庫、計分與常模完成驗證前，作答入口維持關閉。")}</span></Alert> : null}
      <div className="grid items-stretch gap-[var(--fm-gap-lg)] lg:grid-cols-[minmax(280px,1.1fr)_minmax(0,1fr)]">
        <Card data-testid="iq-standard-score-module">
          <CardHeader><CardTitle>{zh ? copy("IQ预估得分", "IQ預估得分") : "Estimated IQ score"}</CardTitle></CardHeader>
          <CardContent>
            <ScoreDistribution score={presentation.standardScore} locale={locale} displayLocale={displayLocale} />
            {beta ? <p className="text-center text-sm text-[var(--fm-text-muted)]">
              {zh ? copy("按本题本模型估算", "依本題本模型估算") : "Estimated using this form’s scoring model"}
            </p> : null}
            {presentation.standardScore === null ? <p className="text-center text-sm text-[var(--fm-text-muted)]" data-testid="iq-standard-score-status">
              {zh ? copy("暂无法估计", "暫無法估計") : "Not available yet"}
            </p> : null}
          </CardContent>
        </Card>
        <Card data-testid="iq-result-overview">
          <CardHeader><CardTitle data-testid="iq-result-band" data-band={resultCopy.band}>{resultCopy.title}</CardTitle></CardHeader>
          <CardContent className="space-y-[var(--fm-gap-lg)]">
            <p className="max-w-xl text-base leading-7 text-[var(--fm-text-secondary)]">{presentation.blocked
              ? zh ? copy("本次结果未完成有效评分，请重新完成测试。", "本次結果未完成有效評分，請重新完成測試。") : "This attempt could not be scored. Please complete the test again."
              : resultCopy.description}</p>
            <dl className="grid grid-cols-2 gap-x-[var(--fm-gap-lg)] gap-y-[var(--fm-gap-xl)]">
              {[
                { label: beta ? zh ? copy("模型参考百分位", "模型參照百分位") : "Model-reference percentile" : zh ? copy("参考样本百分位", "參照樣本百分位") : "Reference-sample percentile", value: percentileText, testId: presentation.percentile !== null ? "iq-percentile" : "iq-percentile-unavailable" },
                { label: zh ? copy("答题正确率", "答對率") : "Answer accuracy", value: percent(presentation.percentCorrect), testId: "iq-accuracy" },
                { label: zh ? copy("答对题数", "答對題數") : "Correct answers", value: correctText, testId: "iq-correct-count" },
                { label: zh ? copy("用时", "作答時間") : "Time taken", value: duration(presentation.durationMs), testId: "iq-duration" },
              ].map((metric) => <div key={metric.testId} className="border-t border-[var(--fm-border)] pt-3" data-testid={metric.testId}>
                <dt className="text-sm text-[var(--fm-text-muted)]">{metric.label}</dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--fm-text)] sm:text-3xl">{metric.value}</dd>
              </div>)}
            </dl>
            {presentation.referencePopulation ? <p className="text-xs leading-5 text-[var(--fm-text-muted)]" data-testid="iq-reference-population">{zh ? copy("参考人群：", "參照群體：") : "Reference population: "}{presentation.referencePopulation}</p> : null}
          </CardContent>
        </Card>
      </div>
      {exportProjection ? <ResultExportPanel projection={exportProjection} locale={displayLocale} pdfState={exportPdfState} onDownloadPdf={onDownloadPdf} /> : null}
      <Card data-testid="iq-performance-radar-module">
        <CardHeader>
          <CardTitle>{zh ? copy("本题本表现", "本題本表現") : "Performance on this form"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid items-center gap-[var(--fm-gap-lg)] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <PerformanceRadar dimensions={presentation.dimensions} locale={locale} displayLocale={displayLocale} />
            <dl className="space-y-[var(--fm-gap-md)]">
              {presentation.dimensions.map((dimension) => <div key={dimension.code} className="border-b border-[var(--fm-border)] pb-4" data-testid={`iq-performance-${dimension.code.toLowerCase()}`}>
                <dt className="text-sm text-[var(--fm-text-secondary)]">{displayLocale === "zh-TW" ? TAIWAN_DIMENSION_LABELS[dimension.code] : viewModel.dimensions.find((item) => item.code === dimension.code)?.label}</dt>
                <dd className="mt-2 flex items-baseline justify-between gap-4">
                  <span className="text-xl font-semibold tabular-nums text-[var(--fm-text)]">{percent(dimension.percentCorrect)}</span>
                  <span className="text-sm tabular-nums text-[var(--fm-text-muted)]">{dimension.correct !== null && dimension.total !== null ? `${dimension.correct}/${dimension.total}` : zh ? copy("数据暂缺", "資料暫缺") : "Not available"}</span>
                </dd>
              </div>)}
            </dl>
          </div>
        </CardContent>
      </Card>
      {!presentation.blocked && !viewModel.locked && presentation.correct !== null ? <IqProcessPractice locale={locale} displayLocale={displayLocale} /> : null}
    </div>
  );
}
