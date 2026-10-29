import type { Questionnaire, Text } from "./types";

export const connectionCheckInThemes = ["felt-distance", "wanted-listening", "finding-belonging"] as const;
export const connectionCheckInCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type ConnectionCheckInCategory = typeof connectionCheckInCategories[number]["id"];
export type ConnectionCheckInRecord = {
  id: typeof connectionCheckInThemes[number];
  counts: Record<ConnectionCheckInCategory, number>;
  observations: { questionId: string; category: ConnectionCheckInCategory }[];
};
export type ConnectionCheckInResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 21; records: ConnectionCheckInRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isConnectionCheckIn21ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "connection-belonging-check-in" || quiz.kind !== "connection-checkin21"
    || quiz.code !== "FM_CONNECTION_CHECKIN21_OBSERVATIONS" || quiz.version !== "fm_connection_checkin21_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_connection_belonging_observations"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original21_bilingual_three_by_seven_observations_v1"
    || quiz.source.scoringVersion !== "six_categorical_counts_per_seven_items_no_points_v1"
    || quiz.source.resultContentVersion !== "three_full_bilingual_connection_readings_v1"
    || quiz.source.itemBankSha256 !== "1b6c80a5cf103303abf2bcc3cbe6f05333262935fdf903845d584a39f875a2c2"
    || quiz.source.resultContentSha256 !== "2addd2a5ea92635e1329a3304bbf95a246d1c825ca71cd99f43e8ca42fe8102f"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 21
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === connectionCheckInThemes[i]
    && d.itemCount === 7 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `CON_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === connectionCheckInCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : connectionCheckInThemes[Math.floor(i / 7)])
      && text(o.label) && o.label.en === connectionCheckInCategories[j].label.en && o.label.zh === connectionCheckInCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${connectionCheckInThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === connectionCheckInThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordConnectionCheckIn21(quiz: Questionnaire, answers: unknown): ConnectionCheckInResult {
  if (!isConnectionCheckIn21ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !connectionCheckInCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 21) return { status: "incomplete", answered };
  return { status: "complete", answered: 21, records: connectionCheckInThemes.map((id, i) => {
    const counts: ConnectionCheckInRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 7, i * 7 + 7).map(q => {
      const category = answers[q.id] as ConnectionCheckInCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
