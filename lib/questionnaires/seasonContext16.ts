import type { Questionnaire, Text } from "./types";

export const seasonContextThemes = ["mood-and-energy-across-the-year", "sleep-across-the-year", "appetite-across-the-year", "recalled-time-of-year-patterns"] as const;
export const seasonContextCategories = [
  {
    "id": "0",
    "label": {
      "en": "Does not match my recollection",
      "zh": "与我的回忆不符"
    }
  },
  {
    "id": "1",
    "label": {
      "en": "Matches slightly",
      "zh": "稍微符合"
    }
  },
  {
    "id": "2",
    "label": {
      "en": "Matches partly",
      "zh": "部分符合"
    }
  },
  {
    "id": "3",
    "label": {
      "en": "Matches mostly",
      "zh": "大体符合"
    }
  },
  {
    "id": "4",
    "label": {
      "en": "Matches closely",
      "zh": "很符合"
    }
  },
  {
    "id": "na",
    "label": {
      "en": "No relevant experience / cannot recall / prefer not to answer",
      "zh": "没有相关经历／无法回想／不愿回答"
    }
  }
] as const;
export type SeasonContextCategory = typeof seasonContextCategories[number]["id"];
export type SeasonContextRecord = {
  id: typeof seasonContextThemes[number];
  counts: Record<SeasonContextCategory, number>;
  observations: { questionId: string; category: SeasonContextCategory }[];
};
export type SeasonContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 16; records: SeasonContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isSeasonContext16ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "time-of-year-context-reflection" || quiz.kind !== "season-context16"
    || quiz.code !== "FM_SEASON_CONTEXT16_RECOLLECTIONS" || quiz.version !== "fm_season_context16_recollections_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_season_context_recollections16"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original16_bilingual_four_by_four_v1"
    || quiz.source.scoringVersion !== "six_recollection_match_counts_per_four_no_clinical_inference_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_season_context_readings_v1"
    || quiz.source.itemBankSha256 !== "61bb9d5815530f74642d01a67dcfaeb4e378397dda6641fef6699d9b855ac7ca"
    || quiz.source.resultContentSha256 !== "b11ec1008037a71a203f767a1f45c6464676805803531ee3d604bb5e0085b8ed"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 16
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === seasonContextThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `SEASON_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === seasonContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : seasonContextThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === seasonContextCategories[j].label.en && o.label.zh === seasonContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${seasonContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === seasonContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No performance test, clinical scale, points, total or threshold. */
export function recordSeasonContext16(quiz: Questionnaire, answers: unknown): SeasonContextResult {
  if (!isSeasonContext16ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !seasonContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 16) return { status: "incomplete", answered };
  return { status: "complete", answered: 16, records: seasonContextThemes.map((id, i) => {
    const counts: SeasonContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as SeasonContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
