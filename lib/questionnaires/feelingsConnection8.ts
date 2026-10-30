import type { Questionnaire, Text } from "./types";

export const feelingsConnectionThemes = ["feelings-and-settling", "closeness-and-boundaries"] as const;
export const feelingsConnectionCategories = [{"id": "0", "label": {"en": "Did not notice this on relevant occasions", "zh": "有相关机会时没有注意到"}}, {"id": "1", "label": {"en": "Rarely noticed", "zh": "很少注意到"}}, {"id": "2", "label": {"en": "Sometimes noticed", "zh": "有时注意到"}}, {"id": "3", "label": {"en": "Often noticed", "zh": "较常注意到"}}, {"id": "4", "label": {"en": "Very often noticed", "zh": "经常注意到"}}, {"id": "na", "label": {"en": "No relevant occasion / cannot recall / prefer not to answer", "zh": "没有相关机会／无法回想／不愿回答"}}] as const;
export type FeelingsConnectionCategory = typeof feelingsConnectionCategories[number]["id"];
export type FeelingsConnectionRecord = {
  id: typeof feelingsConnectionThemes[number];
  counts: Record<FeelingsConnectionCategory, number>;
  observations: { questionId: string; category: FeelingsConnectionCategory }[];
};
export type FeelingsConnectionResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 8; records: FeelingsConnectionRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isFeelingsConnection8ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "feelings-connection-reflection" || quiz.kind !== "feelings-connection8"
    || quiz.code !== "FM_FEELINGS_CONNECTION8_OBSERVATIONS" || quiz.version !== "fm_feelings_connection8_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_feelings_connection_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original8_bilingual_two_by_four_recent_observations_v1"
    || quiz.source.scoringVersion !== "six_label_counts_per_four_no_trauma_diagnosis_or_combination_v1"
    || quiz.source.resultContentVersion !== "two_full_bilingual_feelings_connection_guides_v1"
    || quiz.source.itemBankSha256 !== "84693b124725696ac69045ad3956b77524feea4544ad262216779c83a04f544b"
    || quiz.source.resultContentSha256 !== "ef879c00419102f5c1d7514fbe0460d65751c7ac78d724ab9bbf737dfac56533"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 8
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 2 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 2) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === feelingsConnectionThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `FCO_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === feelingsConnectionCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : feelingsConnectionThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === feelingsConnectionCategories[j].label.en && o.label.zh === feelingsConnectionCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${feelingsConnectionThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === feelingsConnectionThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordFeelingsConnection8(quiz: Questionnaire, answers: unknown): FeelingsConnectionResult {
  if (!isFeelingsConnection8ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !feelingsConnectionCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 8) return { status: "incomplete", answered };
  return { status: "complete", answered: 8, records: feelingsConnectionThemes.map((id, i) => {
    const counts: FeelingsConnectionRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as FeelingsConnectionCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
