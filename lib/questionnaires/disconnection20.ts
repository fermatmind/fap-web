import type { Questionnaire, Text } from "./types";

export const disconnectionThemes = ["experience-of-self", "experience-of-surroundings", "absorption-and-attention", "everyday-recall-uncertainty"] as const;
export const disconnectionCategories = [{"id": "0", "label": {"en": "Did not notice this on relevant occasions", "zh": "有相关机会时没有注意到"}}, {"id": "1", "label": {"en": "Rarely noticed", "zh": "很少注意到"}}, {"id": "2", "label": {"en": "Sometimes noticed", "zh": "有时注意到"}}, {"id": "3", "label": {"en": "Often noticed", "zh": "较常注意到"}}, {"id": "4", "label": {"en": "Very often noticed", "zh": "经常注意到"}}, {"id": "na", "label": {"en": "No relevant occasion / cannot recall / prefer not to answer", "zh": "没有相关机会／无法回想／不愿回答"}}] as const;
export type DisconnectionCategory = typeof disconnectionCategories[number]["id"];
export type DisconnectionRecord = {
  id: typeof disconnectionThemes[number];
  counts: Record<DisconnectionCategory, number>;
  observations: { questionId: string; category: DisconnectionCategory }[];
};
export type DisconnectionResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: DisconnectionRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isDisconnection20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "disconnection-experiences-reflection" || quiz.kind !== "disconnection20"
    || quiz.code !== "FM_DISCONNECTION20_OBSERVATIONS" || quiz.version !== "fm_disconnection20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_disconnection_recall_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_four_by_five_experiences_v1"
    || quiz.source.scoringVersion !== "six_label_counts_per_five_no_dissociation_or_identity_score_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_disconnection_guides_v1"
    || quiz.source.itemBankSha256 !== "779faff5ece1c49f76056b90bb2a595d1163a514616887cb0d2571404c6568eb"
    || quiz.source.resultContentSha256 !== "4fbffa82fb2f342e763f8187edea07405dcdc2e628097d49b83ed7c82b6bea67"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === disconnectionThemes[i]
    && d.itemCount === 5 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `DCO_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === disconnectionCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : disconnectionThemes[Math.floor(i / 5)])
      && text(o.label) && o.label.en === disconnectionCategories[j].label.en && o.label.zh === disconnectionCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${disconnectionThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === disconnectionThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordDisconnection20(quiz: Questionnaire, answers: unknown): DisconnectionResult {
  if (!isDisconnection20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !disconnectionCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: disconnectionThemes.map((id, i) => {
    const counts: DisconnectionRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 5, i * 5 + 5).map(q => {
      const category = answers[q.id] as DisconnectionCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
