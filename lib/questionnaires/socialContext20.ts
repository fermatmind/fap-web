import type { Questionnaire, Text } from "./types";

export const socialContextThemes = ["being-observed", "conversations-and-contact", "changing-social-plans", "sensations-in-social-context"] as const;
export const socialContextCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type SocialContextCategory = typeof socialContextCategories[number]["id"];
export type SocialContextRecord = {
  id: typeof socialContextThemes[number];
  counts: Record<SocialContextCategory, number>;
  observations: { questionId: string; category: SocialContextCategory }[];
};
export type SocialContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: SocialContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isSocialContext20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "social-context-reflection" || quiz.kind !== "social-context20"
    || quiz.code !== "FM_SOCIAL_CONTEXT20_OBSERVATIONS" || quiz.version !== "fm_social_context20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_social_context_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_four_by_five_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_five_no_social_anxiety_inference_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_social_context_readings_v1"
    || quiz.source.itemBankSha256 !== "3a859e13dceb9ef46b1ae0180a4eae4bbd9240b8d4f5b7a9df2a14238f42d836"
    || quiz.source.resultContentSha256 !== "d82690e3869db08bcc0b433b6402bc1f7bfb4086132c7a968b9dc888d63f09de"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === socialContextThemes[i]
    && d.itemCount === 5 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `SCX_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === socialContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : socialContextThemes[Math.floor(i / 5)])
      && text(o.label) && o.label.en === socialContextCategories[j].label.en && o.label.zh === socialContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${socialContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === socialContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No performance test, clinical scale, points, total or threshold. */
export function recordSocialContext20(quiz: Questionnaire, answers: unknown): SocialContextResult {
  if (!isSocialContext20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !socialContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: socialContextThemes.map((id, i) => {
    const counts: SocialContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 5, i * 5 + 5).map(q => {
      const category = answers[q.id] as SocialContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
