import type { Questionnaire, Text } from "./types";

export const emotionsConnectionsThemes = ["separation-feelings", "changing-views", "self-understanding", "quick-decisions", "feeling-shifts", "emptiness-experiences", "anger-experiences"] as const;
export const emotionsConnectionsItemCounts = [3, 3, 3, 3, 3, 3, 3] as const;
export const emotionsConnectionsCategories = [
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
export type EmotionsConnectionsCategory = typeof emotionsConnectionsCategories[number]["id"];
export type EmotionsConnectionsRecord = {
  id: typeof emotionsConnectionsThemes[number];
  counts: Record<EmotionsConnectionsCategory, number>;
  observations: { questionId: string; category: EmotionsConnectionsCategory }[];
};
export type EmotionsConnectionsResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 21; records: EmotionsConnectionsRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isEmotionsConnections21ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "emotions-connections-reflection" || quiz.kind !== "emotions-connections21"
    || quiz.code !== "FM_EMOTIONS_CONNECTIONS21_CATEGORIES" || quiz.version !== "fm_emotions21_four_weeks_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_emotions_connections_statements"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original21_bilingual_seven_themes_three_each_v1"
    || quiz.source.scoringVersion !== "six_mixed_categories_seven_records_no_points_v1"
    || quiz.source.resultContentVersion !== "seven_full_bilingual_emotions_readings_v1"
    || quiz.source.itemBankSha256 !== "ceec27cfc0680332495dfb62770fd61b539435298fd801120cf277daf902d014"
    || quiz.source.resultContentSha256 !== "9f315c2d75a3906f85ddb8f458d80571ecec9f3c34eb282623039887d3e57c1e"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 21
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 7 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 7) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === emotionsConnectionsThemes[i]
    && d.itemCount === emotionsConnectionsItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `ECN_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === emotionsConnectionsCategories[j].id && o.score === undefined
      && o.directionId === (j >= 3 ? "unscored" : emotionsConnectionsThemes[Math.floor(i / 3)])
      && text(o.label) && o.label.en === emotionsConnectionsCategories[j].label.en && o.label.zh === emotionsConnectionsCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${emotionsConnectionsThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === emotionsConnectionsThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === (j === 6 ? 2 : 1) && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordEmotionsConnections21(quiz: Questionnaire, answers: unknown): EmotionsConnectionsResult {
  if (!isEmotionsConnections21ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !emotionsConnectionsCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 21) return { status: "incomplete", answered };
  return { status: "complete", answered: 21, records: emotionsConnectionsThemes.map((id, i) => {
    const counts: EmotionsConnectionsRecord["counts"] = { "not-now": 0, partly: 0, fits: 0, unsure: 0, na: 0, withheld: 0 };
    const observations = quiz.questions.slice([0, 3, 6, 9, 12, 15, 18][i], [0, 3, 6, 9, 12, 15, 18][i] + emotionsConnectionsItemCounts[i]).map(q => {
      const category = answers[q.id] as EmotionsConnectionsCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
