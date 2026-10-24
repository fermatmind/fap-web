import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { resolveMbtiClarityState } from "@/lib/mbti/resultScientificInterpretation";
import type { ResultExportProjection, ResultExportSection } from "./contract";

const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value : null;
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const percent = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
export function buildMbtiResultExport(report: ReportResponse, locale: Locale): ResultExportProjection | null {
  if (report.generating || report.snapshot_error || report.meta?.generating || report.meta?.snapshot_error) return null;
  const projection = report.mbti_public_projection_v1;
  if (!projection) return null;
  const type = text(projection.display_type) ?? text(projection.runtime_type_code);
  if (!type || !/^[EI][SN][TF][JP](?:-[AT])?$/.test(type)) return null;
  const zh = locale === "zh";
  const sections: ResultExportSection[] = [{ id: "summary", title: zh ? "核心结果" : "Core result", fields: [
    { label: zh ? "类型" : "Type", value: type },
    { label: zh ? "摘要" : "Summary", value: text(projection.summary_card?.summary) },
  ] }];
  for (const code of ["EI", "SN", "TF", "JP", "AT"]) {
    const axis = projection.dimensions?.find(item => String(item.axis_code ?? item.code ?? item.id).replace(/[^A-Z]/gi, "").toUpperCase() === code);
    const value = percent(axis?.dominant_pct) ?? percent(axis?.pct);
    sections.push({ id: code, title: code === "AT" ? (zh ? "独立附加 A/T" : "Separate additional A/T") : text(axis?.axis_title) ? `${code} · ${axis?.axis_title}` : code, fields: [
      { label: zh ? "方向" : "Direction", value: text(axis?.dominant_pole) ?? text(axis?.side) },
      { label: zh ? "方向得分比例" : "Directional score proportion", value, unit: "%" },
      { label: zh ? `第一极 ${code[0]} 比例` : `First-pole ${code[0]} proportion`, value: percent(axis?.raw_first_pole_pct) ?? percent(axis?.score_pct), unit: "%" },
      { label: zh ? "本次边界提示" : "Boundary note", value: value === null ? null : ["tie", "close_call"].includes(resolveMbtiClarityState(value)) || axis?.strength_band === "boundary" ? (zh ? "接近中点或平分；不固定归类，不是置信度。" : "Near the midpoint or tied; avoid fixed labels. This is not confidence.") : (zh ? "本次方向分数，不代表能力或固定人格强度。" : "This response direction is not ability or fixed personality strength.") },
      { label: zh ? "相对方向比例" : "Opposite direction proportion", value: percent(axis?.opposite_pct), unit: "%" },
      { label: zh ? "报告边界标记" : "Reported boundary band", value: text(axis?.strength_band) ?? text(axis?.state) },
    ] });
  }
  const rawQuality = record(report.quality);
  const quality = Object.keys(rawQuality).length ? [
    { label: zh ? "报告质量等级" : "Reported quality level", value: text(rawQuality.level) ?? text(rawQuality.grade) },
    { label: zh ? "报告质量标记" : "Reported quality flags", value: Array.isArray(rawQuality.flags) ? rawQuality.flags.filter((value): value is string => typeof value === "string").join(", ") || (zh ? "无标记（不等于质量已获证明）" : "No flags (not proof of quality)") : null },
  ] : [];
  const versions = report.report?.versions;
  const personalization = record(record(report.report?._meta).personalization);
  const projectionPersonalization = record(record(projection._meta).personalization);
  const resultLocale = text(report.report?.locale) ?? text(report.meta?.locale) ?? text(personalization.locale) ?? text(projectionPersonalization.locale);
  return {
    product: "MBTI",
    assessment: { formCode: text(report.mbti_form_v1?.form_code), questionCount: typeof report.mbti_form_v1?.question_count === "number" ? report.mbti_form_v1.question_count : null, locale: resultLocale },
    versions: [
      ...["engine", "content_pack_id", "content_package_version", "profile_version"].map(key => ({ label: key, value: text(versions?.[key]) })),
      ...["scoring_spec_version", "report_engine_version", "pack_id", "dir_version"].map(key => ({ label: key, value: text(report.meta?.[key]) })),
    ],
    sections, reference: [], quality,
    limitations: [zh ? "MBTI式自我报告偏好，四组偏好与A/T分开解释；不测八认知功能、能力或最佳职业。百分比不是人群百分位、准确率或置信度。" : "MBTI-style self-reported preferences. Keep four preference pairs separate from A/T. No eight cognitive functions, abilities or best career are measured. Percentages are not population percentiles, accuracy or confidence.", zh ? "结合沟通、决策或安排任务的具体经历，保留反例；报告不是固定人格判定。" : "Check against actual communication, decision-making or organizing experiences and counterexamples; this report is not a fixed personality judgment."],
  };
}
