import type { ReportResponse } from "@/lib/api/v0_3";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import type { EnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import type { Locale } from "@/lib/i18n/locales";

export const ENNEAGRAM_AI_PROMPTS = {
  zh: "这是我在费马测试 FermatMind（https://fermatmind.com）获得的九型结果。先识别105题Likert或144题迫选，保留原单位、候选、近分和质量说明；未知信息不要补造。两题本不能直接换算，第二高不直接等于翼型。请问我近期一次真实冲突：发生了什么、我想保护什么、担心失去什么；再问我偏好的讨论方式。用前两三个候选动机提出能够区分它们的问题，寻找反例，不替我确定唯一人格。健康层级和其他未测理论不能写成本次得分。区分报告事实、我的自述和你的解释。最后给一个能增加回应选择的练习，并形成由我确认、可修改的沟通参考。",
  en: "These are my Enneagram results from FermatMind (https://fermatmind.com). Identify the 105-item Likert or 144-item forced-choice form. Preserve its units, candidates, close scores and quality notes; do not invent missing information. Do not convert between the forms or treat the second-highest score as a wing automatically. Ask about a recent conflict: what happened, what I wanted to protect and what I feared losing. Ask how I prefer to discuss it. Use the leading two or three candidate motivations to ask distinguishing questions and seek counterexamples, rather than assigning a fixed identity. Do not turn health levels or other unmeasured theories into test scores. Separate report facts, my account and your interpretation. Suggest one response practice and draft a revisable communication reference for me to confirm.",
} as const;

export function buildEnneagramAiFacts(view: EnneagramResultViewModel, locale: Locale) {
  const report = view.reportV2;
  if (!report || report.locale !== locale || !view.authority || report.candidates.length === 0) return null;
  const unit = report.form.formCode === "enneagram_likert_105" ? "likert_intensity_0_100" : report.form.formCode === "enneagram_forced_choice_144" ? "forced_choice_selection_rate_0_100" : null;
  if (!unit) return null;
  return {
    product: "ENNEAGRAM" as const,
    formCode: report.form.formCode,
    unit,
    interpretationScope: view.interpretationScope,
    confidence: report.classification.confidenceLevel || null,
    distribution: view.distribution.map(({ typeId, rank, scoreDisplay }) => ({ typeId, rank, value: scoreDisplay, unit })),
    candidates: view.candidates.map((candidate) => ({
      typeId: candidate.typeId, rank: candidate.rank, label: candidate.typeName, value: candidate.scoreDisplay, unit,
      motivation: candidate.sectionMap["2.1"]?.lead ?? null,
      counterexampleQuestion: candidate.sectionMap["2.5"]?.reflectionQuestion ?? null,
    })),
    versions: { report: report.provenance.reportSchemaVersion, engine: report.provenance.reportEngineVersion, registry: report.registry.registryVersion, closeCall: report.provenance.closeCallRuleVersion, quality: report.provenance.qualityPolicyVersion },
    omissions: [locale === "zh" ? "未提供独立翼型、健康层级、本能或临床成绩；第二候选不是翼型。分数只在同题本内比较，不是人群百分位。" : "No independent wing, health level, instinct or clinical score is supplied; the second candidate is not a wing. Scores compare within this form and are not population percentiles."],
    prompt: ENNEAGRAM_AI_PROMPTS[locale],
  };
}


export function buildEnneagramResultExport(report: ReportResponse, locale: Locale, access: AttemptReportAccessView) {
  if (access.accessState !== "ready" || access.reportState !== "ready" || report.generating || report.snapshot_error || report.meta?.generating || report.meta?.snapshot_error) return null;
  // Export only a complete ready report. Restricted readers retain their own UI;
  // no export may turn a partial/preview access decision into full access.
  const restrictedLabels = new Set(["free", "preview", "partial"]);
  if (report.locked === true || [report.variant, report.access_level, access.variant, access.accessLevel].some((value) => typeof value === "string" && restrictedLabels.has(value.trim().toLowerCase()))) return null;
  const fullModules = new Set(["full", "enneagram_full", "report.full", "report_full"]);
  const moduleLists = [Array.isArray(report.modules_allowed) ? report.modules_allowed : [], access.modulesAllowed];
  if (moduleLists.some((items) => items.length > 0 && !items.some((item) => typeof item === "string" && fullModules.has(item.trim().toLowerCase())))) return null;
  const view = assembleEnneagramResultViewModel({ reportData: report, locale, gate: { isFreeVariant: access.variant === "free", modulesAllowed: new Set(access.modulesAllowed), modulesPreview: new Set(access.modulesPreview) } });
  const facts = buildEnneagramAiFacts(view, locale);
  if (!facts) return null;
  const zh = locale === "zh";
  const unit = facts.unit === "likert_intensity_0_100" ? (zh ? "Likert强度 0–100" : "Likert intensity 0–100") : (zh ? "迫选选择率 0–100" : "Forced-choice selection rate 0–100");
  return {
    product: "ENNEAGRAM" as const,
    assessment: { formCode: facts.formCode, questionCount: facts.formCode === "enneagram_likert_105" ? 105 : 144, locale: view.authority?.locale || null },
    versions: Object.entries(facts.versions).map(([label, value]) => ({ label, value })),
    sections: [
      { id: "candidates", title: zh ? "本次真实候选" : "Reported candidates", defaultSelected: true, fields: facts.candidates.flatMap((row) => [{ label: `#${row.rank} ${row.label}`, value: row.value as string | number | null, unit }, { label: zh ? "动机阅读线索" : "Motivation reading clue", value: row.motivation as string | number | null }]) },
      { id: "distribution", title: zh ? "九类分布" : "Nine-type distribution", defaultSelected: true, fields: facts.distribution.map((row) => ({ label: `${zh ? "类型" : "Type"} ${row.typeId}`, value: row.value, unit })) },
      { id: "counterexamples", title: zh ? "候选反例问题" : "Candidate counterexample questions", defaultSelected: false, fields: facts.candidates.map((row) => ({ label: row.label, value: row.counterexampleQuestion })) },
    ],
    reference: [{ label: zh ? "量尺边界" : "Scale boundary", value: zh ? "仅同题本内相对比较；两题本不直接换算，不是人群百分位。" : "Relative comparison within this form only. The forms are not directly convertible; these are not population percentiles." }],
    quality: [{ label: zh ? "解释状态" : "Interpretation status", value: facts.interpretationScope }, { label: zh ? "信心说明" : "Confidence note", value: facts.confidence }],
    limitations: [...facts.omissions, zh ? "候选和近分由本次报告提供；不新增阈值或固定唯一人格。相似行为可以有不同动机，用户经历须单列。" : "Candidates and close scores come from this report; no new thresholds or fixed identity are assigned. Similar behaviors can have different motivations; keep user experiences separate."],
  };
}
