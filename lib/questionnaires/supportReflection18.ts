import type { Questionnaire, Text } from "./types";

export const supportReflectionThemes = ["concerns-carried", "everyday-impact", "available-support", "questions-about-care"] as const;
export const supportReflectionItemCounts = [4, 4, 5, 5] as const;
export const supportReflectionCategories = [
  {
    "id": "not-now",
    "label": {
      "en": "Does not describe my situation now",
      "zh": "不符合我当前情况"
    }
  },
  {
    "id": "partly",
    "label": {
      "en": "Partly describes my situation now",
      "zh": "部分符合我当前情况"
    }
  },
  {
    "id": "fits",
    "label": {
      "en": "Describes my situation now",
      "zh": "符合我当前情况"
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
export type SupportReflectionCategory = typeof supportReflectionCategories[number]["id"];
export type SupportReflectionRecord = {
  id: typeof supportReflectionThemes[number];
  counts: Record<SupportReflectionCategory, number>;
  observations: { questionId: string; category: SupportReflectionCategory }[];
};
export type SupportReflectionResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 18; records: SupportReflectionRecord[] };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isSupportReflection18ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.slug !== "considering-support-reflection" || quiz.kind !== "support-reflection18"
    || quiz.code !== "FM_SUPPORT_REFLECTION18_CURRENT_CATEGORIES" || quiz.version !== "fm_support_reflection18_current_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_support_consideration_statements"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original18_bilingual_four_domains_4_4_5_5_v1"
    || quiz.source.scoringVersion !== "six_current_fit_category_counts_four_four_five_five_no_points_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_support_readings_v1"
    || quiz.source.itemBankSha256 !== "543dbd3ccee9d4259bc2d1298dc71d3b6e28292a6c47be45f28779784ff8277f"
    || quiz.source.resultContentSha256 !== "23b89d1712501170d78deade802b2cc4029f58cfe00bd6c86fbab5b1d55fec7f"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 18
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === supportReflectionThemes[i]
    && d.itemCount === supportReflectionItemCounts[i] && d.comparisons === undefined && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `SUP_${String(i + 1).padStart(2, "0")}`
    && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 6 && Array.from(q.options).every((o, j) => object(o)
      && o.id === supportReflectionCategories[j].id && o.score === undefined
      && o.directionId === (j >= 3 ? "unscored" : supportReflectionThemes[i < 4 ? 0 : i < 8 ? 1 : i < 13 ? 2 : 3])
      && text(o.label) && o.label.en === supportReflectionCategories[j].label.en && o.label.zh === supportReflectionCategories[j].label.zh))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${supportReflectionThemes[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === supportReflectionThemes[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

/** Category IDs are labels only. No clinical scale, points, total or threshold. */
export function recordSupportReflection18(quiz: Questionnaire, answers: unknown): SupportReflectionResult {
  if (!isSupportReflection18ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id)); let answered = 0;
  for (const [id, category] of Object.entries(answers)) {
    if (!ids.has(id) || !supportReflectionCategories.some(c => c.id === category)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 18) return { status: "incomplete", answered };
  return { status: "complete", answered: 18, records: supportReflectionThemes.map((id, i) => {
    const counts: SupportReflectionRecord["counts"] = { "not-now": 0, partly: 0, fits: 0, unsure: 0, na: 0, withheld: 0 };
    const observations = quiz.questions.slice([0, 4, 8, 13][i], [0, 4, 8, 13][i] + supportReflectionItemCounts[i]).map(q => {
      const category = answers[q.id] as SupportReflectionCategory; counts[category]++;
      return { questionId: q.id, category };
    });
    return { id, counts, observations };
  }) };
}
