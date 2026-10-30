import type { Questionnaire, Text } from "./types";

export const uncertaintyEaseThemes = ["ease-with-uncertainty"] as const;
export const uncertaintyEaseItemCounts = [6] as const;
export const uncertaintyEaseCategories = [
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
export type UncertaintyEaseCategory = typeof uncertaintyEaseCategories[number]["id"];
export type UncertaintyEaseRecord = {
  id: typeof uncertaintyEaseThemes[number];
  counts: Record<UncertaintyEaseCategory, number>;
  observations: { questionId: string; category: UncertaintyEaseCategory }[];
};
export type UncertaintyEaseResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 6; records: UncertaintyEaseRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isUncertaintyEase6ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "uncertainty-ease-reflection" || quiz.kind !== "uncertainty-ease6"
    || quiz.code !== "FM_UNCERTAINTY_EASE6_CATEGORIES" || quiz.version !== "fm_uncertainty6_four_weeks_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_uncertainty_ease_statements"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original6_bilingual_one_theme_six_items_v1"
    || quiz.source.scoringVersion !== "six_mixed_categories_one_record_no_points_v1"
    || quiz.source.resultContentVersion !== "one_full_bilingual_uncertainty_reading_v1"
    || quiz.source.itemBankSha256 !== "4d558e8d1be130e2613179277b24ffa90e3f8e310f382a792c9af823940cce53"
    || quiz.source.resultContentSha256 !== "2201b0d0b3dcf20ea2c3ce041c1242e90de2a74632b6bcf54c03b7e1e71a9797"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 6
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 1 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 1) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === uncertaintyEaseThemes[i]
    && d.itemCount === uncertaintyEaseItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `UNC_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === uncertaintyEaseCategories[j].id && o.score === undefined
      && o.directionId === (j >= 3 ? "unscored" : uncertaintyEaseThemes[Math.floor(i / 6)])
      && text(o.label) && o.label.en === uncertaintyEaseCategories[j].label.en && o.label.zh === uncertaintyEaseCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${uncertaintyEaseThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === uncertaintyEaseThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === (j === 6 ? 2 : 1) && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordUncertaintyEase6(quiz: Questionnaire, answers: unknown): UncertaintyEaseResult {
  if (!isUncertaintyEase6ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !uncertaintyEaseCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 6) return { status: "incomplete", answered };
  return { status: "complete", answered: 6, records: uncertaintyEaseThemes.map((id, i) => {
    const counts: UncertaintyEaseRecord["counts"] = { "not-now": 0, partly: 0, fits: 0, unsure: 0, na: 0, withheld: 0 };
    const observations = quiz.questions.slice([0][i], [0][i] + uncertaintyEaseItemCounts[i]).map(q => {
      const category = answers[q.id] as UncertaintyEaseCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
