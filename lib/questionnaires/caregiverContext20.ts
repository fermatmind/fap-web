import type { Questionnaire, Text } from "./types";

export const caregiverContextThemes = ["shared-activity-attention", "movement-during-activities", "turns-and-starts", "observed-context-and-support"] as const;
export const caregiverContextCategories = [{"id": "0", "label": {"en": "Did not observe this in a relevant situation", "zh": "在相关情境中没有观察到"}}, {"id": "1", "label": {"en": "Rarely observed", "zh": "很少观察到"}}, {"id": "2", "label": {"en": "Sometimes observed", "zh": "有时观察到"}}, {"id": "3", "label": {"en": "Often observed", "zh": "较常观察到"}}, {"id": "4", "label": {"en": "Very often observed", "zh": "经常观察到"}}, {"id": "na", "label": {"en": "Not directly observed / no relevant opportunity / cannot recall / prefer not to answer", "zh": "未直接观察／没有相关机会／无法回想／不愿回答"}}] as const;
export type CaregiverContextCategory = typeof caregiverContextCategories[number]["id"];
export type CaregiverContextRecord = {
  id: typeof caregiverContextThemes[number];
  counts: Record<CaregiverContextCategory, number>;
  observations: { questionId: string; category: CaregiverContextCategory }[];
};
export type CaregiverContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: CaregiverContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isCaregiverContext20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "child-focus-activity-observations" || quiz.kind !== "caregiver-context20"
    || quiz.code !== "FM_CAREGIVER_CONTEXT20_OBSERVATIONS" || quiz.version !== "fm_caregiver_context20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_caregiver_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_direct_observation_four_by_five_v1"
    || quiz.source.scoringVersion !== "six_label_counts_per_five_no_child_score_or_norm_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_caregiver_guides_v1"
    || quiz.source.itemBankSha256 !== "86b63b75eb4526892449475bbd97fc6d4095715093bdd2f10643c45a1b70c7f3"
    || quiz.source.resultContentSha256 !== "aa1597fd3240d04015358cf4a8cea21409fa7339f13ec47a556469e69ef55cbd"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === caregiverContextThemes[i]
    && d.itemCount === 5 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `CGO_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === caregiverContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : caregiverContextThemes[Math.floor(i / 5)])
      && text(o.label) && o.label.en === caregiverContextCategories[j].label.en && o.label.zh === caregiverContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${caregiverContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === caregiverContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordCaregiverContext20(quiz: Questionnaire, answers: unknown): CaregiverContextResult {
  if (!isCaregiverContext20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !caregiverContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: caregiverContextThemes.map((id, i) => {
    const counts: CaregiverContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 5, i * 5 + 5).map(q => {
      const category = answers[q.id] as CaregiverContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
