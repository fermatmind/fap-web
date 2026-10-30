import type { Questionnaire, Text } from "./types";

export const spatialContextThemes = ["spatial-relationships"] as const;
export const spatialContextCategories = [{"id": "0", "label": {"en": "Did not notice this on relevant occasions", "zh": "有相关机会时没有注意到"}}, {"id": "1", "label": {"en": "Rarely noticed", "zh": "很少注意到"}}, {"id": "2", "label": {"en": "Sometimes noticed", "zh": "有时注意到"}}, {"id": "3", "label": {"en": "Often noticed", "zh": "较常注意到"}}, {"id": "4", "label": {"en": "Very often noticed", "zh": "经常注意到"}}, {"id": "na", "label": {"en": "No relevant occasion / cannot recall / prefer not to answer", "zh": "没有相关机会／无法回想／不愿回答"}}] as const;
export type SpatialContextCategory = typeof spatialContextCategories[number]["id"];
export type SpatialContextRecord = {
  id: typeof spatialContextThemes[number];
  counts: Record<SpatialContextCategory, number>;
  observations: { questionId: string; category: SpatialContextCategory }[];
};
export type SpatialContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 4; records: SpatialContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isSpatialContext4ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "spatial-thinking-reflection" || quiz.kind !== "spatial-context4"
    || quiz.code !== "FM_SPATIAL_CONTEXT4_OBSERVATIONS" || quiz.version !== "fm_spatial_context4_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_spatial_thinking_recollections"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original4_bilingual_spatial_relation_recollections_v1"
    || quiz.source.scoringVersion !== "six_label_counts_per_four_no_accuracy_speed_or_ability_v1"
    || quiz.source.resultContentVersion !== "one_full_bilingual_spatial_recollection_guide_v1"
    || quiz.source.itemBankSha256 !== "015ebbac0d63e9512f27bc9ceb301777eeca61f2c799e54510d350e4908d4679"
    || quiz.source.resultContentSha256 !== "9a1ec669ddb668040029bc10d9c351d1e990965f689d3ac76979c6042fefa72b"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 4
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 1 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 1) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === spatialContextThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `SPO_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === spatialContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : spatialContextThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === spatialContextCategories[j].label.en && o.label.zh === spatialContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${spatialContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === spatialContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordSpatialContext4(quiz: Questionnaire, answers: unknown): SpatialContextResult {
  if (!isSpatialContext4ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !spatialContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 4) return { status: "incomplete", answered };
  return { status: "complete", answered: 4, records: spatialContextThemes.map((id, i) => {
    const counts: SpatialContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as SpatialContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
