import type { Questionnaire, Text } from "./types";

export const recentMoodThemes = ["mood-and-interest", "sleep-and-appetite", "energy-attention-and-self-talk"] as const;
export const recentMoodCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type RecentMoodCategory = typeof recentMoodCategories[number]["id"];
export type RecentMoodRecord = {
  id: typeof recentMoodThemes[number];
  counts: Record<RecentMoodCategory, number>;
  observations: { questionId: string; category: RecentMoodCategory }[];
};
export type RecentMoodResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 12; records: RecentMoodRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isRecentMood12ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "recent-mood-reflection" || quiz.kind !== "mood-observations12"
    || quiz.code !== "FM_RECENT_MOOD12_OBSERVATIONS" || quiz.version !== "fm_recent_mood12_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_recent_mood_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original12_bilingual_three_by_four_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_four_no_clinical_inference_v1"
    || quiz.source.resultContentVersion !== "three_full_bilingual_recent_mood_readings_v1"
    || quiz.source.itemBankSha256 !== "6c27d3cdda303082cf4aceec5dd87460731c8f25106f48414e8db88525903b09"
    || quiz.source.resultContentSha256 !== "c7cfe176da0d9c5bcc113c6a41c541dbbc4fd45fc40ea4fce92c531faee59b2a"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 12
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === recentMoodThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `MOD_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === recentMoodCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : recentMoodThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === recentMoodCategories[j].label.en && o.label.zh === recentMoodCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${recentMoodThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === recentMoodThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No performance test, clinical scale, points, total or threshold. */
export function recordRecentMood12(quiz: Questionnaire, answers: unknown): RecentMoodResult {
  if (!isRecentMood12ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !recentMoodCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  return { status: "complete", answered: 12, records: recentMoodThemes.map((id, i) => {
    const counts: RecentMoodRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as RecentMoodCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
