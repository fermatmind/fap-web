import type { Questionnaire, Text } from "./types";

export const focusContextThemes = ["attention-in-activities", "restlessness-in-activities", "feelings-and-energy-context", "interpreting-social-experiences"] as const;
export const focusContextCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type FocusContextCategory = typeof focusContextCategories[number]["id"];
export type FocusContextRecord = {
  id: typeof focusContextThemes[number];
  counts: Record<FocusContextCategory, number>;
  observations: { questionId: string; category: FocusContextCategory }[];
};
export type FocusContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 16; records: FocusContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isFocusContext16ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "focus-energy-context-reflection" || quiz.kind !== "focus-context16"
    || quiz.code !== "FM_FOCUS_CONTEXT16_OBSERVATIONS" || quiz.version !== "fm_focus_context16_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_focus_context_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original16_bilingual_four_by_four_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_four_no_adhd_inference_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_focus_context_readings_v1"
    || quiz.source.itemBankSha256 !== "bae2e18fb444d7e53627d9d135a7aa942299b6d850bec4b7afb6b3d15340f836"
    || quiz.source.resultContentSha256 !== "8d3b1d6a67a5f6aa2bd856dc8f8869fea51e872c549e027b978609971583ce5d"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 16
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === focusContextThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `FCX_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === focusContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : focusContextThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === focusContextCategories[j].label.en && o.label.zh === focusContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${focusContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === focusContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordFocusContext16(quiz: Questionnaire, answers: unknown): FocusContextResult {
  if (!isFocusContext16ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !focusContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 16) return { status: "incomplete", answered };
  return { status: "complete", answered: 16, records: focusContextThemes.map((id, i) => {
    const counts: FocusContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as FocusContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
