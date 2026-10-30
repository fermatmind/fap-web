import type { Questionnaire, Text } from "./types";

export const unwantedActionsThemes = ["cleaning-concerns", "checking-again", "order-and-repetition", "unwanted-thoughts", "keeping-and-discarding"] as const;
export const unwantedActionsCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type UnwantedActionsCategory = typeof unwantedActionsCategories[number]["id"];
export type UnwantedActionsRecord = {
  id: typeof unwantedActionsThemes[number];
  counts: Record<UnwantedActionsCategory, number>;
  observations: { questionId: string; category: UnwantedActionsCategory }[];
};
export type UnwantedActionsResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: UnwantedActionsRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isUnwantedActions20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "unwanted-thoughts-actions-reflection" || quiz.kind !== "unwanted-actions20"
    || quiz.code !== "FM_UNWANTED_ACTIONS20_OBSERVATIONS" || quiz.version !== "fm_unwanted_actions20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_unwanted_actions_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_five_by_four_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_four_no_danger_or_diagnosis_v1"
    || quiz.source.resultContentVersion !== "five_full_bilingual_unwanted_actions_readings_v1"
    || quiz.source.itemBankSha256 !== "f0e8d4c1b635c84f6e4ddee37f4b60e002e64e69da3559c07f047194100f0afc"
    || quiz.source.resultContentSha256 !== "af42369eea2113aae1ed3a3fed07f0d6a3a5ce61125810157e3393f07b0cd084"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === unwantedActionsThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `URA_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === unwantedActionsCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : unwantedActionsThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === unwantedActionsCategories[j].label.en && o.label.zh === unwantedActionsCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${unwantedActionsThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === unwantedActionsThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordUnwantedActions20(quiz: Questionnaire, answers: unknown): UnwantedActionsResult {
  if (!isUnwantedActions20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !unwantedActionsCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: unwantedActionsThemes.map((id, i) => {
    const counts: UnwantedActionsRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as UnwantedActionsCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
