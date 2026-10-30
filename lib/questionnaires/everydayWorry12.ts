import type { Questionnaire, Text } from "./types";

export const everydayWorryThemes = ["recurring-worries", "tension-and-restlessness", "worry-in-daily-activities"] as const;
export const everydayWorryCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type EverydayWorryCategory = typeof everydayWorryCategories[number]["id"];
export type EverydayWorryRecord = {
  id: typeof everydayWorryThemes[number];
  counts: Record<EverydayWorryCategory, number>;
  observations: { questionId: string; category: EverydayWorryCategory }[];
};
export type EverydayWorryResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 12; records: EverydayWorryRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isEverydayWorry12ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "everyday-worry-reflection" || quiz.kind !== "worry-observations12"
    || quiz.code !== "FM_EVERYDAY_WORRY12_OBSERVATIONS" || quiz.version !== "fm_everyday_worry12_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_everyday_worry_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original12_bilingual_three_by_four_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_four_no_clinical_inference_v1"
    || quiz.source.resultContentVersion !== "three_full_bilingual_everyday_worry_readings_v1"
    || quiz.source.itemBankSha256 !== "7d83d31f6fb78e8fbe6e0375873ad026671f3659a2a93175445e193644853cc5"
    || quiz.source.resultContentSha256 !== "4c1d6172ae28959c5672bfe233005ea05975840d1c8c5bb3c1ab587d73d21e76"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 12
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === everydayWorryThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `WRY_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === everydayWorryCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : everydayWorryThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === everydayWorryCategories[j].label.en && o.label.zh === everydayWorryCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${everydayWorryThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === everydayWorryThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No performance test, clinical scale, points, total or threshold. */
export function recordEverydayWorry12(quiz: Questionnaire, answers: unknown): EverydayWorryResult {
  if (!isEverydayWorry12ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !everydayWorryCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  return { status: "complete", answered: 12, records: everydayWorryThemes.map((id, i) => {
    const counts: EverydayWorryRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as EverydayWorryCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
