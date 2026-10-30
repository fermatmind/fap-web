import type { Questionnaire, Text } from "./types";

export const birthContextThemes = ["mood-and-interest-after-childbirth", "worry-and-self-blame-after-childbirth", "rest-and-demands-after-childbirth", "connection-with-self-after-childbirth"] as const;
export const birthContextCategories = [
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
export type BirthContextCategory = typeof birthContextCategories[number]["id"];
export type BirthContextRecord = {
  id: typeof birthContextThemes[number];
  counts: Record<BirthContextCategory, number>;
  observations: { questionId: string; category: BirthContextCategory }[];
};
export type BirthContextResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 16; records: BirthContextRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isBirthContext16ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "after-childbirth-context-reflection" || quiz.kind !== "birth-context16"
    || quiz.code !== "FM_BIRTH_CONTEXT16_RECOLLECTIONS" || quiz.version !== "fm_birth_context16_recollections_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_birth_context_recollections16"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original16_bilingual_four_by_four_v1"
    || quiz.source.scoringVersion !== "six_recollection_match_counts_per_four_no_clinical_inference_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_birth_context_readings_v1"
    || quiz.source.itemBankSha256 !== "0252cf3cad3dfa375c66d4069514340b5d631909bcbe6fe39223bf8fa9344cb2"
    || quiz.source.resultContentSha256 !== "a91b632d35707dea19aa7730431d2a8c2708639c8d8b840fd59ed0d2394a2a69"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 16
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === birthContextThemes[i]
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `BIRTH_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === birthContextCategories[j].id && o.score === undefined
      && o.directionId === (j === 5 ? "unscored" : birthContextThemes[Math.floor(i / 4)])
      && text(o.label) && o.label.en === birthContextCategories[j].label.en && o.label.zh === birthContextCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${birthContextThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === birthContextThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No performance test, clinical scale, points, total or threshold. */
export function recordBirthContext16(quiz: Questionnaire, answers: unknown): BirthContextResult {
  if (!isBirthContext16ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !birthContextCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 16) return { status: "incomplete", answered };
  return { status: "complete", answered: 16, records: birthContextThemes.map((id, i) => {
    const counts: BirthContextRecord["counts"] = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, na: 0 };
    const observations = quiz.questions.slice(i * 4, i * 4 + 4).map(q => {
      const category = answers[q.id] as BirthContextCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
