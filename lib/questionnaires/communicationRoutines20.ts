import type { Questionnaire, Text } from "./types";

export const communicationRoutinesThemes = ["joining-an-exchange", "communication-clarity", "changes-and-routines", "details-and-interest", "visual-arrangements"] as const;
export const communicationRoutinesCategories = [{"id": "0", "label": {"en": "Did not notice this on relevant occasions", "zh": "有相关机会时没有注意到"}}, {"id": "1", "label": {"en": "Rarely noticed", "zh": "很少注意到"}}, {"id": "2", "label": {"en": "Sometimes noticed", "zh": "有时注意到"}}, {"id": "3", "label": {"en": "Often noticed", "zh": "较常注意到"}}, {"id": "4", "label": {"en": "Very often noticed", "zh": "经常注意到"}}, {"id": "na", "label": {"en": "No relevant occasion / cannot recall / prefer not to answer", "zh": "没有相关机会／无法回想／不愿回答"}}] as const;
export type CommunicationRoutinesCategory = typeof communicationRoutinesCategories[number]["id"];
export type CommunicationRoutinesRecord = {
  id: typeof communicationRoutinesThemes[number];
  counts: Record<CommunicationRoutinesCategory, number>;
  observations: { questionId: string; category: CommunicationRoutinesCategory }[];
};
export type CommunicationRoutinesResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: CommunicationRoutinesRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isCommunicationRoutines20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "communication-routines-context" || quiz.kind !== "communication-routines20"
    || quiz.code !== "FM_COMMUNICATION_ROUTINES20_OBSERVATIONS" || quiz.version !== "fm_communication_routines20_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_communication_routines_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_five_by_four_contexts_v1"
    || quiz.source.scoringVersion !== "six_label_counts_per_four_no_neurotype_or_ability_v1"
    || quiz.source.resultContentVersion !== "five_full_bilingual_context_guides_v1"
    || quiz.source.itemBankSha256 !== "f5c2f8154500b421f9a1c0f2861cacc4023f7a8b23a2c265df94c86840a413c7"
    || quiz.source.resultContentSha256 !== "91accd4b9f7c648c99382c76cd9b0368888177a9b184334b7f0fe56662020b0c"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === communicationRoutinesThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `CRC_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === communicationRoutinesCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : communicationRoutinesThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === communicationRoutinesCategories[j].label.en && o.label.zh === communicationRoutinesCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${communicationRoutinesThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === communicationRoutinesThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordCommunicationRoutines20(quiz: Questionnaire, answers: unknown): CommunicationRoutinesResult {
  if (!isCommunicationRoutines20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !communicationRoutinesCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: communicationRoutinesThemes.map((id, i) => {
    const counts: CommunicationRoutinesRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as CommunicationRoutinesCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
