import type { Questionnaire, Text } from "./types";

export const sleepThemes = ["settling-to-sleep", "waking-during-rest", "waking-before-planned", "daytime-experiences", "thoughts-about-sleep"] as const;
export const sleepCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type SleepExperiencesCategory = typeof sleepCategories[number]["id"];
export type SleepExperiencesRecord = {
  id: typeof sleepThemes[number];
  counts: Record<SleepExperiencesCategory, number>;
  observations: { questionId: string; category: SleepExperiencesCategory }[];
};
export type SleepExperiencesResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: SleepExperiencesRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isSleepExperiences20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "sleep-experiences-reflection" || quiz.kind !== "sleep-experiences20"
    || quiz.code !== "FM_SLEEP20_OBSERVATIONS" || quiz.version !== "fm_sleep20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_sleep_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_v1"
    || quiz.source.scoringVersion !== "five_separate_categorical_counts_no_clinical_score_v1"
    || quiz.source.resultContentVersion !== "five_full_bilingual_sleep_readings_v1"
    || quiz.source.itemBankSha256 !== "831e165dc0c9e08715c720a7bc95617c555ae6cd6ce6067495b6354c6f54639c"
    || quiz.source.resultContentSha256 !== "41e866d5c96274c23c7c3b4470afc397437079894970dfe6859d0b52a6c3211c"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === sleepThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `SLP_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === sleepCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : sleepThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === sleepCategories[j].label.en && o.label.zh === sleepCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${sleepThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === sleepThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordSleepExperiences20(quiz: Questionnaire, answers: unknown): SleepExperiencesResult {
  if (!isSleepExperiences20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !sleepCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: sleepThemes.map((id, i) => {
    const counts: SleepExperiencesRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as SleepExperiencesCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
