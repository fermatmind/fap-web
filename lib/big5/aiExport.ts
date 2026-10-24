import type { ReportResponse } from "@/lib/api/v0_3";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import type { Big5ResultViewModel } from "@/lib/big5/resultAssembler";
import type { Locale } from "@/lib/i18n/locales";
import { BIG5_DOMAIN_LABELS, BIG5_DOMAIN_ORDER, BIG5_FACETS, type Big5DomainCode } from "@/lib/big5/taxonomy";

export const BIG5_AI_PROMPTS = {
  zh: "这是我在费马测试 FermatMind（https://fermatmind.com）获得的大五人格结果。请确认90或120题、版本及实际提供的OCEAN与facet，不推测未导出的facet。保留raw、POMP、z、T、percentile原单位；只有参照群体和状态支持时才作人群比较，缺失写未知。先问我想改善的一个习惯、一个与分数描述不一致的经历，以及我偏好的解释方式。选择两项相关特质，说明它们在不同情境下可能怎样表现，不把高低当好坏。区分报告事实、我的经历和你的推测。设计一个可逆的小实验，写清要观察的行为和可能的反例。最后给一份可修改的AI协作参考，由我确认，不根据某个分数自动决定我的沟通风格。",
  en: "These are my Big Five results from FermatMind (https://fermatmind.com). Confirm the 90- or 120-item form, versions, and OCEAN domains and facets actually provided. Do not infer omitted facets. Preserve raw, POMP, z, T and percentile units. Make population comparisons only when the reference group and status support them; mark missing information as unknown. Ask about one habit I want to improve, an experience that does not fit the score description, and how I prefer explanations. Discuss two relevant traits in context without treating high or low as inherently good or bad. Separate report facts, my experiences and your interpretations. Propose one reversible behavior experiment, what to observe and a possible counterexample. Draft a revisable AI collaboration reference for me to confirm, without choosing my communication style from a score.",
} as const;

/** Domain facts only. The shared owner handles selection, serialization and user notes. */
export function buildBig5AiFacts(view: Big5ResultViewModel, locale: Locale) {
  const compatible = view.authority?.locale.toLowerCase().split(/[-_]/)[0] === locale;
  if (!compatible || view.visibleSections.length === 0) return null;
  const context = view.readingContext;
  return {
    product: "BIG5_OCEAN" as const,
    formLabel: view.formSummaryLabel,
    domains: context.domains.map((row) => ({ ...row, label: BIG5_DOMAIN_LABELS[row.code as Big5DomainCode][locale] })),
    facets: context.facets.filter((row) => row.band !== null || row.mean !== null || row.percentile !== null).map((row) => ({ ...row, label: BIG5_FACETS.find((facet) => facet.facet_code === row.code)!.display_label[locale] })),
    reference: context.norm,
    quality: context.quality,
    omissions: [locale === "zh" ? "未提供的分数单位、未授权或未选择的facet不代表零分；参照不充分时省略精确百分位。" : "Missing units and unavailable or unselected facets do not mean zero; precise percentiles are omitted when reference evidence is insufficient."],
    prompt: BIG5_AI_PROMPTS[locale],
  };
}


/** Accept only the private reader’s ready access decision; never unlock from an export. */
export function buildBig5ResultExport(report: ReportResponse, locale: Locale, access: AttemptReportAccessView) {
  if (access.accessState !== "ready" || access.reportState !== "ready" || report.generating || report.snapshot_error || report.meta?.generating || report.meta?.snapshot_error) return null;
  // Export only a complete ready report. Restricted readers retain their own UI;
  // no export may turn a partial/preview access decision into full access.
  const restrictedLabels = new Set(["free", "preview", "partial"]);
  if (report.locked === true || [report.variant, report.access_level, access.variant, access.accessLevel].some((value) => typeof value === "string" && restrictedLabels.has(value.trim().toLowerCase()))) return null;
  const fullModules = new Set(["full", "big5_full", "report.full", "report_full"]);
  const moduleLists = [Array.isArray(report.modules_allowed) ? report.modules_allowed : [], access.modulesAllowed];
  if (moduleLists.some((items) => items.length > 0 && !items.some((item) => typeof item === "string" && fullModules.has(item.trim().toLowerCase())))) return null;
  const view = assembleBig5ResultViewModel({ reportData: report, locale, gate: {
    isFreeVariant: access.variant === "free", modulesAllowed: new Set(access.modulesAllowed), modulesPreview: new Set(access.modulesPreview), freeSections: null,
  } });
  const facts = buildBig5AiFacts(view, locale);
  if (!facts) return null;
  const zh = locale === "zh";
  const norm = facts.reference;
  const fields = (rows: typeof facts.domains) => rows.flatMap((row) => [
    ...(row.band ? [{ label: row.label, value: row.band, unit: zh ? "本次报告分档" : "reported band" }] : []),
    { label: row.label, value: row.mean, unit: zh ? "原量尺均分" : "response-scale mean" },
    ...(row.percentile === null ? [] : [{ label: row.label, value: row.percentile, unit: "percentile" }]),
  ]);
  const engine = report.big5_report_engine_v2;
  const formCode = typeof report.big5_form_v1?.form_code === "string" ? report.big5_form_v1.form_code : typeof engine?.form_code === "string" ? engine.form_code : null;
  const count = report.big5_form_v1?.question_count;
  if (formCode !== "big5_90" && formCode !== "big5_120") return null;
  if (engine?.form_code && engine.form_code !== formCode) return null;
  if (typeof count === "number" && count !== (formCode === "big5_90" ? 90 : 120)) return null;
  return {
    product: "BIG5_OCEAN" as const,
    assessment: { formCode, questionCount: typeof count === "number" ? count : null, locale: view.authority?.locale || null },
    versions: [{ label: zh ? "报告schema" : "Report schema", value: engine?.schema_version ?? null }, { label: zh ? "参照版本" : "Reference version", value: norm.version || null }],
    sections: [
      { id: "domains", title: zh ? "五域概览" : "Five-domain overview", defaultSelected: true, fields: fields(facts.domains) },
      ...BIG5_DOMAIN_ORDER.map((code) => ({ id: `facets-${code}`, title: `${BIG5_DOMAIN_LABELS[code][locale]} · facet`, defaultSelected: false, fields: fields(facts.facets.filter((row) => row.code.startsWith(code))) })).filter((section) => section.fields.length > 0),
    ],
    reference: [
      { label: zh ? "状态" : "Status", value: norm.status || null }, { label: zh ? "群体" : "Sample", value: norm.sample || null },
      { label: zh ? "样本量" : "Sample size", value: norm.sampleN }, { label: zh ? "地区" : "Region", value: norm.region || null },
      { label: zh ? "参照语言" : "Reference language", value: norm.locale || null }, { label: zh ? "年龄范围" : "Age range", value: norm.ageRange || null },
      { label: zh ? "限制" : "Limit", value: norm.explanation || null },
    ],
    quality: [{ label: zh ? "作答质量" : "Response quality", value: facts.quality.level || null }, { label: zh ? "解释提示" : "Interpretation note", value: facts.quality.notice || null }],
    limitations: [...facts.omissions, zh ? "五域是连续特质，不是能力、诊断或好坏标签。90和120题不可混用参照；POMP不是百分位；不由语言推测国家。用户经历单列，不写回测量。" : "Domains are continuous traits, not abilities, diagnoses or good/bad labels. Keep 90- and 120-item references separate. POMP is not percentile; language does not determine country. User experiences remain separate from measurements."],
  };
}
