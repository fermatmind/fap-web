import type { Questionnaire, Text } from "./types";

export const healthWorryThemes = ["attention-to-sensations", "requests-and-care-decisions", "serious-possibilities"] as const;
export const healthWorryCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type HealthWorryCategory = typeof healthWorryCategories[number]["id"];
export type HealthWorryRecord = {
  id: typeof healthWorryThemes[number];
  counts: Record<HealthWorryCategory, number>;
  observations: { questionId: string; category: HealthWorryCategory }[];
};
export type HealthWorryResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 21; records: HealthWorryRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isHealthWorry21ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "health-worries-reflection" || quiz.kind !== "health-worries21"
    || quiz.code !== "FM_HEALTH_WORRIES21_OBSERVATIONS" || quiz.version !== "fm_health_worries21_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_health_worry_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original21_bilingual_three_by_seven_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_seven_no_medical_verdict_v1"
    || quiz.source.resultContentVersion !== "three_full_bilingual_health_worry_readings_v1"
    || quiz.source.itemBankSha256 !== "1d1cc6f7bfd4876dfad8da984ed6375a8f9d6d8d15e6c4a0a7394fd30c478602"
    || quiz.source.resultContentSha256 !== "3d9f09e37b4f45fb42bf39a430bc993547150e5fd0873f52397edde72c34a07d"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 21
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === healthWorryThemes[i]
    && d.itemCount === 7 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `HLW_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === healthWorryCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : healthWorryThemes[Math.floor(i / 7)])
      && text(o.label) && o.label.en === healthWorryCategories[j].label.en && o.label.zh === healthWorryCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${healthWorryThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === healthWorryThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordHealthWorry21(quiz: Questionnaire, answers: unknown): HealthWorryResult {
  if (!isHealthWorry21ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !healthWorryCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 21) return { status: "incomplete", answered };
  return { status: "complete", answered: 21, records: healthWorryThemes.map((id, i) => {
    const counts: HealthWorryRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 7, i * 7 + 7).map(q => {
      const category = answers[q.id] as HealthWorryCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
