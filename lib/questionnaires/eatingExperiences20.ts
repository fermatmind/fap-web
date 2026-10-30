import type { Questionnaire, Text } from "./types";

export const eatingExperiencesThemes = ["body-thoughts", "limiting-eating", "loss-of-control", "undoing-eating", "mental-space"] as const;
export const eatingExperiencesItemCounts = [4, 4, 4, 4, 4] as const;
export const eatingExperiencesCategories = [
  {
    "id": "not-now",
    "label": {
      "en": "Does not describe my past four weeks",
      "zh": "不符合我过去四周的情况"
    }
  },
  {
    "id": "partly",
    "label": {
      "en": "Partly describes my past four weeks",
      "zh": "部分符合我过去四周的情况"
    }
  },
  {
    "id": "fits",
    "label": {
      "en": "Describes my past four weeks",
      "zh": "符合我过去四周的情况"
    }
  },
  {
    "id": "unsure",
    "label": {
      "en": "Cannot judge",
      "zh": "无法判断"
    }
  },
  {
    "id": "na",
    "label": {
      "en": "No relevant experience",
      "zh": "没有相关经历"
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
export type EatingExperiencesCategory = typeof eatingExperiencesCategories[number]["id"];
export type EatingExperiencesRecord = {
  id: typeof eatingExperiencesThemes[number];
  counts: Record<EatingExperiencesCategory, number>;
  observations: { questionId: string; category: EatingExperiencesCategory }[];
};
export type EatingExperiencesResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: EatingExperiencesRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isEatingExperiences20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "eating-experiences-reflection" || quiz.kind !== "eating-experiences20"
    || quiz.code !== "FM_EATING_EXPERIENCES20_CATEGORIES" || quiz.version !== "fm_eating20_four_weeks_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_eating_experience_statements"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_five_themes_four_each_v1"
    || quiz.source.scoringVersion !== "six_description_categories_five_records_no_points_v1"
    || quiz.source.resultContentVersion !== "five_full_bilingual_eating_readings_v1"
    || quiz.source.itemBankSha256 !== "406c0e7aa5e5038a50135d81e3d471595de912256aa3189a05978ec896014ae3"
    || quiz.source.resultContentSha256 !== "55ef6513577485ce6b734ad55cebb2334a3bb812fd20c6f450be119d6aeb1a5e"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === eatingExperiencesThemes[i]
    && d.itemCount === eatingExperiencesItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `EAT_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === eatingExperiencesCategories[j].id && o.score === undefined
      && o.directionId === (j >= 3 ? "unscored" : eatingExperiencesThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === eatingExperiencesCategories[j].label.en && o.label.zh === eatingExperiencesCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${eatingExperiencesThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === eatingExperiencesThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === (j === 6 ? 2 : 1) && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordEatingExperiences20(quiz: Questionnaire, answers: unknown): EatingExperiencesResult {
  if (!isEatingExperiences20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !eatingExperiencesCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: eatingExperiencesThemes.map((id, i) => {
    const counts: EatingExperiencesRecord["counts"] = { "not-now": 0, partly: 0, fits: 0, unsure: 0, na: 0, withheld: 0 };
    const observations = quiz.questions.slice([0, 4, 8, 12, 16][i], [0, 4, 8, 12, 16][i] + eatingExperiencesItemCounts[i]).map(q => {
      const category = answers[q.id] as EatingExperiencesCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
