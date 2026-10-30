import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { isEqPrivateResultLocaleCompatible } from "@/lib/eq/privateResultLocale";
import type { ResultExportProjection } from "@/lib/result-export/contract";
import { isEqV5AccessRestricted, isLowConfidenceEqResult, normalizeEqV5Report, getEqDimensionLabel } from "@/components/result/eq/utils";

/** Reuses the qualified visible report projection, never Agent/runtime private context. */
export function buildEqResultExport(reportData: ReportResponse, locale: Locale): ResultExportProjection | null {
  if (reportData.generating || reportData.snapshot_error || reportData.meta?.generating || reportData.meta?.snapshot_error || isEqV5AccessRestricted(reportData) || !isEqPrivateResultLocaleCompatible(reportData, locale)) return null;
  const view = normalizeEqV5Report(reportData, locale);
  if (!view || isLowConfidenceEqResult(view) || view.payload.generating === true || view.payload.snapshot_error === true || ["pending", "failed"].includes(String(view.payload.status))) return null;
  const zh = locale === "zh";
  const metric = (score: typeof view.globalScore) => [
    { label: zh ? "原始总分" : "Raw sum", value: score?.raw_score ?? null, unit: "raw_sum" },
    { label: zh ? "标准分" : "Standard score", value: score?.standard_score ?? null, unit: "standard_score" },
    { label: zh ? "参照百分位" : "Reference percentile", value: score?.percentile ?? null, unit: "percentile (0–100)" },
  ];
  return {
    product: "EQ",
    assessment: { formCode: view.authority.pack_id, questionCount: 60, locale: view.authority.locale },
    versions: [
      { label: zh ? "题包版本" : "Pack version", value: view.authority.pack_version },
      ...(["scoring_version", "report_version", "content_version"] as const).map(label => ({ label, value: view.methodology[label] || null })),
    ],
    sections: [
      { id: "summary", title: view.globalScore?.label || (zh ? "总分" : "Overall score"), fields: metric(view.globalScore) },
      ...view.dimensions.map(score => ({ id: score.code!, title: getEqDimensionLabel(score, view.assets.score_system), fields: metric(score) })),
    ],
    reference: [
      { label: zh ? "参照状态" : "Reference status", value: view.methodology.norm_status || null },
      { label: zh ? "参照版本" : "Reference version", value: view.methodology.norm_provenance?.norm_version || null },
      { label: zh ? "参照来源" : "Reference source", value: view.methodology.norm_provenance?.norm_version === "bootstrap_v1"
        ? (zh ? "Bootstrap 模型参照" : "Bootstrap model reference") : null },
      { label: zh ? "参照说明" : "Reference explanation", value: view.assets.scientific_contract.norm_status_statement || null },
      { label: zh ? "百分位说明" : "Percentile note", value: view.assets.score_system.score_notes?.percentile || null },
    ],
    quality: [
      { label: zh ? "质量" : "Quality", value: view.quality.level || null },
      { label: zh ? "置信度说明" : "Confidence note", value: view.assets.quality_confidence.body || null },
      { label: zh ? "使用局限" : "Interpretation caution", value: view.assets.quality_confidence.do_not_overread || null },
    ],
    limitations: [
      zh ? "60题四维自评，不是MSCEIT能力测验或临床诊断。保留四维原名和原单位。POMP不是人口百分位；PROVISIONAL/MISSING不是成熟人口常模。未提供的参照群体或版本为未知。" : "A 60-item, four-dimension self-report, not an MSCEIT ability test or clinical diagnosis. Preserve the original dimension names and units. POMP is not a population percentile. PROVISIONAL/MISSING are not established population norms. Missing reference groups or versions are unknown.",
      zh ? "以本人选择的近期事件练习，区分触发、感受、想法、行为和反馈，保留反例；不判断他人动机，不将AI解释写回计分。" : "Use a recent event chosen by the user. Separate triggers, feelings, thoughts, actions and feedback, preserve counterexamples, do not decide other people’s motives and never write AI interpretations back into scoring.",
    ],
  };
}
