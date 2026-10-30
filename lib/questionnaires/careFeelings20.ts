import type { Questionnaire, Text } from "./types";

export const careFeelingsThemes = ["remembered-emotional-attention", "remembered-feelings-responses", "remembered-comfort-and-support", "feelings-and-support-now"] as const;
export const careFeelingsCategories = [{"id": "0", "label": {"en": "Does not fit what I recall", "zh": "与我的回忆不符"}}, {"id": "1", "label": {"en": "Fits a little", "zh": "有一点符合"}}, {"id": "2", "label": {"en": "Fits partly", "zh": "部分符合"}}, {"id": "3", "label": {"en": "Fits closely", "zh": "较符合"}}, {"id": "4", "label": {"en": "Fits very closely", "zh": "很符合"}}, {"id": "na", "label": {"en": "Cannot say / no relevant experience or recollection / prefer not to answer", "zh": "无法判断／没有相关经历或回忆／不愿回答"}}] as const;
export type CareFeelingsCategory = typeof careFeelingsCategories[number]["id"];
export type CareFeelingsRecord = {
  id: typeof careFeelingsThemes[number];
  counts: Record<CareFeelingsCategory, number>;
  observations: { questionId: string; category: CareFeelingsCategory }[];
};
export type CareFeelingsResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: CareFeelingsRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isCareFeelings20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "care-feelings-reflection" || quiz.kind !== "care-feelings20"
    || quiz.code !== "FM_CARE_FEELINGS20_OBSERVATIONS" || quiz.version !== "fm_care_feelings20_mixed_recall_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_care_feelings_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_four_by_five_mixed_recall_v1"
    || quiz.source.scoringVersion !== "six_category_counts_per_five_no_reversal_or_history_verdict_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_care_feelings_readings_v1"
    || quiz.source.itemBankSha256 !== "f220f6e9da82a2b95ae5cee9f030d99a94017f3a830ad8d10cfb5d4b909561f7"
    || quiz.source.resultContentSha256 !== "fe517ba481258b29c3a66b00a589de52550a941e2d389356fc7a38bfe06c1b7e"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === careFeelingsThemes[i]
    && d.itemCount === 5 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `CFN_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === careFeelingsCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : careFeelingsThemes[Math.floor(i / 5)])
      && text(o.label) && o.label.en === careFeelingsCategories[j].label.en && o.label.zh === careFeelingsCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${careFeelingsThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === careFeelingsThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordCareFeelings20(quiz: Questionnaire, answers: unknown): CareFeelingsResult {
  if (!isCareFeelings20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !careFeelingsCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: careFeelingsThemes.map((id, i) => {
    const counts: CareFeelingsRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 5, i * 5 + 5).map(q => {
      const category = answers[q.id] as CareFeelingsCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
