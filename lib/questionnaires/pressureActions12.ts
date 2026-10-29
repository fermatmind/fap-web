import type { Questionnaire, Text } from "./types";

export const pressureActionsThemes = ["protecting-a-position", "moving-away", "getting-stuck", "agreeing-early"] as const;
export const pressureActionsCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant opportunity / cannot recall / prefer not to answer", zh: "没有相关机会／无法回想／不愿回答" } },
] as const;
export type PressureActionsCategory = typeof pressureActionsCategories[number]["id"];
export type PressureActionsRecord = {
  id: typeof pressureActionsThemes[number];
  counts: Record<PressureActionsCategory, number>;
  observations: { questionId: string; category: PressureActionsCategory }[];
};
export type PressureActionsResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 12; records: PressureActionsRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isPressureActions12ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "pressure-response-actions" || quiz.kind !== "pressure-actions12"
    || quiz.code !== "FM_PRESSURE_ACTIONS12_OBSERVATIONS" || quiz.version !== "fm_pressure_actions12_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_under_pressure_action_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original12_bilingual_four_by_three_observations_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_three_items_no_points_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_pressure_action_readings_v1"
    || quiz.source.itemBankSha256 !== "ef0ad817225ec69f8b1334642f2b0147d67c4220e8932082c1be34f75d755cb0"
    || quiz.source.resultContentSha256 !== "8bb6273f2e7f40b75089b449a96361f7e55a88170fe9bdd9a1fcc2edd407d3c0"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 12
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === pressureActionsThemes[i]
    && d.itemCount === 3 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `PRA_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === pressureActionsCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : pressureActionsThemes[Math.floor(i / 3)])
      && text(o.label) && o.label.en === pressureActionsCategories[j].label.en && o.label.zh === pressureActionsCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${pressureActionsThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === pressureActionsThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordPressureActions12(quiz: Questionnaire, answers: unknown): PressureActionsResult {
  if (!isPressureActions12ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !pressureActionsCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  return { status: "complete", answered: 12, records: pressureActionsThemes.map((id, i) => {
    const counts: PressureActionsRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 3, i * 3 + 3).map(q => {
      const category = answers[q.id] as PressureActionsCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
