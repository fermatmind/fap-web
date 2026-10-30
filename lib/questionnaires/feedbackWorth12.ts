import type { Questionnaire, Text } from "./types";

export const feedbackWorthThemes = ["feedback-feelings", "feedback-and-worth", "returning-attention"] as const;
export const feedbackWorthItemCounts = [4, 4, 4] as const;
export const feedbackWorthCategories = [
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
export type FeedbackWorthCategory = typeof feedbackWorthCategories[number]["id"];
export type FeedbackWorthRecord = {
  id: typeof feedbackWorthThemes[number];
  counts: Record<FeedbackWorthCategory, number>;
  observations: { questionId: string; category: FeedbackWorthCategory }[];
};
export type FeedbackWorthResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 12; records: FeedbackWorthRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isFeedbackWorth12ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "feedback-self-worth-reflection" || quiz.kind !== "feedback-worth12"
    || quiz.code !== "FM_FEEDBACK_WORTH12_CATEGORIES" || quiz.version !== "fm_feedback12_four_weeks_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_feedback_worth_statements"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original12_bilingual_three_themes_four_each_v1"
    || quiz.source.scoringVersion !== "six_mixed_categories_three_records_no_points_v1"
    || quiz.source.resultContentVersion !== "three_full_bilingual_feedback_readings_v1"
    || quiz.source.itemBankSha256 !== "6dbf1101a8df42b48f4e926f5db7bbbbf7cbf43e2db97aa7e9e8c626310160d9"
    || quiz.source.resultContentSha256 !== "992b2f41fd8a6b5b4a15a278976847dc2b3799093740cf1db3691b483b410d45"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 12
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === feedbackWorthThemes[i]
    && d.itemCount === feedbackWorthItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `FBW_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === feedbackWorthCategories[j].id && o.score === undefined
      && o.directionId === (j >= 3 ? "unscored" : feedbackWorthThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === feedbackWorthCategories[j].label.en && o.label.zh === feedbackWorthCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${feedbackWorthThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === feedbackWorthThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === (j === 6 ? 2 : 1) && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordFeedbackWorth12(quiz: Questionnaire, answers: unknown): FeedbackWorthResult {
  if (!isFeedbackWorth12ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !feedbackWorthCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  return { status: "complete", answered: 12, records: feedbackWorthThemes.map((id, i) => {
    const counts: FeedbackWorthRecord["counts"] = { "not-now": 0, partly: 0, fits: 0, unsure: 0, na: 0, withheld: 0 };
    const observations = quiz.questions.slice([0, 4, 8][i], [0, 4, 8][i] + feedbackWorthItemCounts[i]).map(q => {
      const category = answers[q.id] as FeedbackWorthCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
