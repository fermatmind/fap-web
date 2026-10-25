import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { buildMbtiResultExport } from "@/lib/result-export/mbti";

const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null;
const QUALITY_FLAGS = new Set(["INCOMPLETE_ANSWERS", "STRAIGHTLINING", "INCONSISTENT"]);

export function MbtiPrintReportContext({ report, locale }: { report: ReportResponse; locale: Locale }) {
  const projection = buildMbtiResultExport(report, locale);
  if (!projection) return <div data-pdf-error="MBTI_REPORT_CONTEXT_UNAVAILABLE" />;
  const zh = locale === "zh";
  const unknown = zh ? "未提供（Unknown）" : "Not provided (Unknown)";
  const versions = record(report.report?.versions);
  const meta = record(report.meta);
  const quality = record(report.quality);
  const grade = (value: unknown) => typeof value === "string" && /^[ABCD]$/.test(value) ? value : unknown;
  const flags = Array.isArray(quality.flags)
    ? quality.flags.length === 0 ? (zh ? "未记录质量提示" : "No flags recorded")
      : quality.flags.every((flag) => typeof flag === "string" && QUALITY_FLAGS.has(flag)) ? quality.flags.join(", ") : unknown
    : unknown;
  const fields = [
    [zh ? "题本" : "Question form", projection.assessment.questionCount ? `MBTI · ${projection.assessment.questionCount}${zh ? "题" : " questions"}` : unknown],
    [zh ? "语言" : "Language", zh ? "中文" : "English"],
    [zh ? "报告版本" : "Report version", text(versions.engine) ?? text(meta.report_engine_version) ?? unknown],
    [zh ? "内容版本" : "Content version", text(versions.content_package_version) ?? text(meta.content_package_version) ?? unknown],
    [zh ? "解释版本" : "Profile version", text(versions.profile_version) ?? unknown],
    [zh ? "计分版本" : "Scoring version", text(meta.scoring_spec_version) ?? unknown],
    [zh ? "报告质量等级（level）" : "Reported quality level", grade(quality.level)],
    [zh ? "报告质量等级（grade）" : "Reported quality grade", grade(quality.grade)],
    [zh ? "报告质量提示" : "Reported quality flags", flags],
  ];

  return <section data-testid="mbti-print-report-context" style={{ fontSize: "9pt", lineHeight: 1.5, marginBottom: "5mm" }}>
    <h2 style={{ fontSize: "12pt" }}>{zh ? "本次报告与阅读边界" : "This report and its limits"}</h2>
    <dl style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1mm 4mm" }}>
      {fields.map(([label, value]) => <div key={label} style={{ display: "contents" }}><dt>{label}</dt><dd style={{ margin: 0 }}>{value}</dd></div>)}
    </dl>
    {projection.limitations.map((limit) => <p key={limit}>{limit}</p>)}
    <table style={{ width: "100%", borderCollapse: "collapse", breakInside: "avoid" }}>
      <caption>{zh ? "五项方向得分（A/T 为独立附加指标）" : "Directional scores (A/T is a separate additional indicator)"}</caption>
      <thead><tr>{(zh ? ["指标", "方向", "方向得分比例", "第一极原值比例", "相对方向比例", "报告边界标记"] : ["Indicator", "Direction", "Directional proportion", "First-pole proportion", "Opposite proportion", "Reported boundary band"]).map((label) => <th key={label} style={{ textAlign: "left", padding: "1mm" }}>{label}</th>)}</tr></thead>
      <tbody>{projection.sections.filter((section) => ["EI", "SN", "TF", "JP", "AT"].includes(section.id)).map((section) => <tr key={section.id}>
        <th style={{ textAlign: "left", padding: "1mm" }}>{section.id}</th>
        {section.fields.filter((_, index) => [0, 1, 2, 4, 5].includes(index)).map((field) => <td key={field.label} style={{ padding: "1mm" }}>{field.value == null ? unknown : `${field.value}${field.unit ?? ""}`}</td>)}
      </tr>)}</tbody>
    </table>
    {projection.sections.filter((section) => section.fields[5]?.value === "boundary").map((section) => <p key={section.id}>{section.id} · {section.fields[3]?.value}</p>)}
  </section>;
}
