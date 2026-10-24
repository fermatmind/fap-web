import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { ResultExportProjection } from "@/lib/result-export/contract";
import { IQ_OWNER_ORIGINAL_30_FORM_CODE } from "@/lib/iq/constants";
import { buildIqResultPresentation } from "@/lib/iq/presentation";
import { buildIqResultViewModel } from "@/lib/iq/result";

const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null;

/** Whitelist the visible result; never pass an API envelope or legacy IQ fields to export. */
export function buildIqResultExport(input: {
  locale: Locale; reportData: ReportResponse | null; resultData: ResultResponse | null; accessView: AttemptReportAccessView | null;
}): ResultExportProjection | null {
  const { locale, reportData, resultData, accessView } = input;
  if (accessView && (accessView.accessState !== "ready" || accessView.reportState !== "ready")) return null;
  const view = buildIqResultViewModel(input);
  const presentation = buildIqResultPresentation({ ...input, locked: view.locked });
  const outer = record(reportData);
  const report = record(outer?.report) ?? outer;
  const resultOuter = record(resultData);
  const result = record(resultOuter?.result) ?? resultOuter;
  const normed = record(result?.normed_json);
  const scoring = record(report?.scoring);
  const form = text(scoring?.bank_id) ?? text(report?.bank_id) ?? text(report?.form_code) ?? text(normed?.bank_id) ?? text(resultOuter?.meta && record(resultOuter.meta)?.bank_id);
  const notReady = [outer, report, scoring, record(outer?.meta), resultOuter, result, normed, record(resultOuter?.meta)].some(source => source?.generating === true || source?.snapshot_error === true || ["pending", "failed", "blocked_unscored"].includes(String(source?.status)));
  if (notReady || view.locked || !view.scaleCode || presentation.blocked || form !== IQ_OWNER_ORIGINAL_30_FORM_CODE || presentation.total !== 30 || presentation.correct === null) return null;
  const zh = locale === "zh";
  const beta = presentation.scoreKind === "beta_reference";
  return {
    product: "IQ_RAVEN",
    assessment: { formCode: form, questionCount: presentation.total, locale: text(report?.locale) ?? text(result?.locale) },
    versions: [{ label: zh ? "计分版本" : "Scoring version", value: text(scoring?.scoring_engine_version) }],
    sections: [
      { id: "summary", title: zh ? "本题本表现" : "Performance on this form", fields: [
        { label: zh ? "正确题数" : "Correct answers", value: presentation.correct, unit: zh ? "题" : "items" },
        { label: zh ? "总题数" : "Total items", value: presentation.total, unit: zh ? "题" : "items" },
        { label: zh ? "正确率" : "Accuracy", value: presentation.percentCorrect, unit: "%" },
        { label: zh ? "实际用时" : "Elapsed time", value: presentation.durationMs, unit: "ms" },
      ] },
      ...(presentation.scoreKind ? [{ id: "reference-score", title: beta ? zh ? "Beta设计参考" : "Designed Beta reference" : zh ? "报告参照分" : "Reported reference score", fields: [
        { label: beta ? zh ? "Beta参考分" : "Beta reference score" : zh ? "推理标准分" : "Reasoning standard score", value: presentation.standardScore, unit: beta ? "designed_reference" : "standard_score" },
        { label: beta ? zh ? "模型参考百分位" : "Model-reference percentile" : zh ? "参考样本百分位" : "Reference-sample percentile", value: presentation.percentile, unit: "percentile (0–100)" },
      ] }] : []),
      ...presentation.dimensions.map(dimension => ({ id: dimension.code, title: view.dimensions.find(item => item.code === dimension.code)?.label ?? dimension.code, fields: [
        { label: zh ? "正确题数" : "Correct answers", value: dimension.correct, unit: zh ? "题" : "items" },
        { label: zh ? "题数" : "Item count", value: dimension.total, unit: zh ? "题" : "items" },
        { label: zh ? "正确率" : "Accuracy", value: dimension.percentCorrect, unit: "%" },
      ] })),
    ],
    reference: [{ label: zh ? "参照来源/版本" : "Reference source / versions", value: presentation.referenceSource }, { label: zh ? "参照人群" : "Reference population", value: presentation.referencePopulation }],
    quality: [{ label: zh ? "作答质量" : "Response quality", value: view.qualityLevel }],
    limitations: [
      zh ? "正确率只描述本次题目表现。Beta设计参考分/模型百分位不是人口排名、正式IQ或门萨资格；合格常模解释也限本报告来源。未提供信息为未知，不由旧字段换算。" : "Accuracy describes this form only. Designed Beta scores/model percentiles are not population ranks, formal IQ or Mensa eligibility. Eligible normative interpretation is limited to this report’s source. Missing information is unknown and is not derived from legacy fields.",
      zh ? "中断、疲劳、图形显示及类似题型经验需由本人补充。逻辑、言语等未测能力不可推断；图表可访问性不证明等价非视觉智测。原题、答卷和答案键均不导出。" : "The user may add interruptions, fatigue, display issues and similar-task experience. Do not infer unmeasured logic or verbal ability. Accessible charts do not establish an equivalent nonvisual test. No questions, responses or answer keys are exported.",
    ],
  };
}
