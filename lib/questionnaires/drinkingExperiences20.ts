import type { Questionnaire, Text } from "./types";

export const drinkingExperiencesThemes = ["plans-and-pull", "daily-effects", "situations-and-choices", "body-experiences"] as const;
export const drinkingExperiencesItemCounts = [5, 5, 5, 5] as const;
export const drinkingExperiencesCategories = [
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
export type DrinkingExperiencesCategory = typeof drinkingExperiencesCategories[number]["id"];
export type DrinkingExperiencesRecord = {
  id: typeof drinkingExperiencesThemes[number];
  counts: Record<DrinkingExperiencesCategory, number>;
  observations: { questionId: string; category: DrinkingExperiencesCategory }[];
};
export type DrinkingExperiencesResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; records: DrinkingExperiencesRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isDrinkingExperiences20ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "drinking-experiences-reflection" || quiz.kind !== "drinking-experiences20"
    || quiz.code !== "FM_DRINKING_EXPERIENCES20_CATEGORIES" || quiz.version !== "fm_drinking20_four_weeks_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_drinking_experience_statements"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original20_bilingual_four_themes_five_each_v1"
    || quiz.source.scoringVersion !== "six_description_categories_no_points_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_drinking_readings_v1"
    || quiz.source.itemBankSha256 !== "e8f656eedda4d0f8eb6bf4580b6894e9582e12ad83dc0d54a90e069bbdc5b449"
    || quiz.source.resultContentSha256 !== "68f795e4428f3355a3660bdc06e1a87c2f2b9b61cea2734fec5f07b12bfeeecc"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === drinkingExperiencesThemes[i]
    && d.itemCount === drinkingExperiencesItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `DRK_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === drinkingExperiencesCategories[j].id && o.score === undefined
      && o.directionId === (j >= 3 ? "unscored" : drinkingExperiencesThemes[Math.floor(i / 5)])
      && text(o.label) && o.label.en === drinkingExperiencesCategories[j].label.en && o.label.zh === drinkingExperiencesCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${drinkingExperiencesThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === drinkingExperiencesThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === (j === 6 ? 2 : 1) && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordDrinkingExperiences20(quiz: Questionnaire, answers: unknown): DrinkingExperiencesResult {
  if (!isDrinkingExperiences20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !drinkingExperiencesCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, records: drinkingExperiencesThemes.map((id, i) => {
    const counts: DrinkingExperiencesRecord["counts"] = { "not-now": 0, partly: 0, fits: 0, unsure: 0, na: 0, withheld: 0 };
    const observations = quiz.questions.slice([0, 5, 10, 15][i], [0, 5, 10, 15][i] + drinkingExperiencesItemCounts[i]).map(q => {
      const category = answers[q.id] as DrinkingExperiencesCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
