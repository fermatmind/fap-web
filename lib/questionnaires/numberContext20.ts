import type { Questionnaire, Text } from "./types";

export const numberContextThemes = ["noticing-written-numbers", "following-calculation-steps", "time-and-measure-context", "prices-and-daily-records"] as const;
export const numberContextCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type NumberContextCategory = typeof numberContextCategories[number]["id"];
export type NumberContextRecord = {
  id: typeof numberContextThemes[number];
  counts: Record<NumberContextCategory, number>;
  observations: { questionId: string; category: NumberContextCategory }[];
};
export type NumberContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: NumberContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isNumberContext20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "number-context-reflection" || quiz.kind !== "number-context20"
    || quiz.code !== "FM_NUMBER_CONTEXT20_OBSERVATIONS" || quiz.version !== "fm_number_context20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_number_context_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_four_by_five_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_five_no_dyscalculia_inference_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_number_context_readings_v1"
    || quiz.source.itemBankSha256 !== "fbe0bd43900fea57c057541888a6418d843afcfa4225c5997c3f61f5535851df"
    || quiz.source.resultContentSha256 !== "163e780b4c2c2016b68ea124e168d2abdbcebd7737511b5727a3ff9fa84b776b"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === numberContextThemes[i]
    && d.itemCount === 5 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `NCT_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === numberContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : numberContextThemes[Math.floor(i / 5)])
      && text(o.label) && o.label.en === numberContextCategories[j].label.en && o.label.zh === numberContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${numberContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === numberContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No performance test, clinical scale, points, total or threshold. */
export function recordNumberContext20(quiz: Questionnaire, answers: unknown): NumberContextResult {
  if (!isNumberContext20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !numberContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: numberContextThemes.map((id, i) => {
    const counts: NumberContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 5, i * 5 + 5).map(q => {
      const category = answers[q.id] as NumberContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
