import type { Questionnaire, Text } from "./types";

export const bereavementThemes = ["missing-the-person", "changed-roles", "distance-from-reminders", "future-and-activities", "feelings-and-support"] as const;
export const bereavementItemCounts = [4, 3, 3, 3, 3] as const;
export const bereavementTimeChoices = [
  {
    "id": "under-three-months",
    "label": {
      "en": "Less than three months",
      "zh": "不足三个月"
    }
  },
  {
    "id": "three-to-twenty-four-months",
    "label": {
      "en": "Three to twenty-four months",
      "zh": "三至二十四个月"
    }
  },
  {
    "id": "over-twenty-four-months",
    "label": {
      "en": "More than twenty-four months",
      "zh": "超过二十四个月"
    }
  },
  {
    "id": "uncertain",
    "label": {
      "en": "Cannot place the timing",
      "zh": "无法判断时间"
    }
  },
  {
    "id": "withheld",
    "label": {
      "en": "Prefer not to answer",
      "zh": "不愿回答"
    }
  }
] as const;
export type BereavementTimeId = typeof bereavementTimeChoices[number]["id"];
export const isBereavementTimeId = (value: unknown): value is BereavementTimeId => bereavementTimeChoices.some(c => c.id === value);
export const bereavementCategories = [
  { id: "0", label: { en: "Did not notice", zh: "没有注意到" } },
  { id: "1", label: { en: "Rarely", zh: "很少" } },
  { id: "2", label: { en: "Sometimes", zh: "有时" } },
  { id: "3", label: { en: "Often", zh: "较常" } },
  { id: "4", label: { en: "Very often", zh: "经常" } },
  { id: "na", label: { en: "No relevant experience / cannot recall / prefer not to answer", zh: "没有相关经历／无法回想／不愿回答" } },
] as const;
export type BereavementCategory = typeof bereavementCategories[number]["id"];
export type BereavementRecord = {
  id: typeof bereavementThemes[number];
  counts: Record<BereavementCategory, number>;
  observations: { questionId: string; category: BereavementCategory }[];
};
export type BereavementResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 16; records: BereavementRecord[]; timeContext: BereavementTimeId };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isBereavement16ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "after-bereavement-reflection" || quiz.kind !== "bereavement16"
    || quiz.code !== "FM_BEREAVEMENT16_OBSERVATIONS" || quiz.version !== "fm_bereavement16_observations_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_bereavement_observations_with_optional_time"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original16_and_optional_elapsed_context_bilingual_v1"
    || quiz.source.scoringVersion !== "five_categorical_counts_4_3_3_3_3_time_never_scored_v1"
    || quiz.source.resultContentVersion !== "five_full_bilingual_bereavement_readings_v1"
    || quiz.source.itemBankSha256 !== "5e3492237e2e1166addcccdece8781512d985df8c15bc0f4290d50c382eae347"
    || quiz.source.resultContentSha256 !== "10d283abc2bdaebd98609f0180a6fa722fbef66f0a9435c4cad1f3d3bf8ab04f"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 16
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  const timing = quiz.bereavementTimeContext;
  if (!object(timing) || timing.id !== "BRV_CONTEXT_TIME" || timing.optional !== true || timing.default !== "withheld"
    || !text(timing.question) || !text(timing.boundary) || !Array.isArray(timing.options) || timing.options.length !== 5
    || !Array.from(timing.options).every((o, i) => object(o) && o.id === bereavementTimeChoices[i].id && !Object.hasOwn(o, "score")
      && text(o.label) && o.label.en === bereavementTimeChoices[i].label.en && o.label.zh === bereavementTimeChoices[i].label.zh)) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === bereavementThemes[i]
    && d.itemCount === bereavementItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `BRV_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === bereavementCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : bereavementThemes[i < 4 ? 0 : i < 7 ? 1 : i < 10 ? 2 : i < 13 ? 3 : 4])
      && text(o.label) && o.label.en === bereavementCategories[j].label.en && o.label.zh === bereavementCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${bereavementThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === bereavementThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordBereavement16(quiz: Questionnaire, answers: unknown, timeContext: unknown = undefined): BereavementResult {
  if (!isBereavement16ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  if (timeContext !== undefined && !isBereavementTimeId(timeContext)) return { status: "invalid", answered: 0 };
  const selectedTime: BereavementTimeId = timeContext === undefined ? "withheld" : timeContext;
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !bereavementCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 16) return { status: "incomplete", answered };
  return { status: "complete", answered: 16, timeContext: selectedTime, records: bereavementThemes.map((id, i) => {
    const counts: BereavementRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice([0, 4, 7, 10, 13][i], [0, 4, 7, 10, 13][i] + bereavementItemCounts[i]).map(q => {
      const category = answers[q.id] as BereavementCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
