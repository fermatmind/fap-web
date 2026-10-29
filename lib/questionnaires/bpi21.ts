import type { Questionnaire, Text } from "./types";

export const bpi21Keys = ["vata", "pitta", "kapha"] as const;
export type Bpi21Key = typeof bpi21Keys[number];
export type Bpi21Result = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 21; unscored: number;
  counts: Record<Bpi21Key, number> | null; percentages: Record<Bpi21Key, number> | null;
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isBpi21ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "bpi21" || quiz.slug !== "prakriti-inventory21"
    || quiz.code !== "BPI21_NOMINAL_WORKING_ZH" || quiz.version !== "bpi21_en_working_zh_na_v1"
    || !object(quiz.source) || quiz.source.kind !== "licensed-bpi21-nominal-working-zh-with-unscored-extension"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "bpi21-table2-v2-en-working-zh-na-v1"
    || quiz.source.scoringVersion !== "source-three-counts-over21-all-scored-no-classification-v1"
    || quiz.source.resultContentVersion !== "fm-bpi21-three-cultural-guides-v1"
    || quiz.source.itemBankSha256 !== "6d8a11b6ed1c9a8bc378025ee3c685ea3a529a2766813a4c1c77bc7e8df1cff5" || quiz.source.resultContentSha256 !== "2d0a5b97a77b3a4b8bdcc16f3dc598ad169b4cf06d8d4ce683b897af8e7209ce"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 21
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === bpi21Keys[i] && d.itemCount === 21 && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === `BPI21_${String(i + 1).padStart(3, "0")}` && text(q.prompt)
    && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 4 && Array.from(q.options).every((o, j) => object(o)
      && o.id === (j === 3 ? "na" : bpi21Keys[j]) && o.directionId === (j === 3 ? "unscored" : bpi21Keys[j]) && o.score === undefined && text(o.label)))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === bpi21Keys[i] && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === bpi21Keys[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 8 && Array.from(p.sections).every((s, j) => object(s) && s.id === `reading-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text)));
}

/** Nominal source key: one mapped choice per item. Any NA withholds every personal number. */
export function scoreBpi21(quiz: Questionnaire, answers: unknown): Bpi21Result {
  if (!isBpi21ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts: Record<Bpi21Key, number> = { vata: 0, pitta: 0, kapha: 0 };
  let answered = 0, unscored = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    if (option.id === "na") unscored++; else counts[option.directionId as Bpi21Key]++;
    answered++;
  }
  if (answered !== 21) return { status: "incomplete", answered };
  return { status: "complete", answered: 21, unscored, counts: unscored ? null : counts,
    percentages: unscored ? null : Object.fromEntries(bpi21Keys.map(k => [k, Math.round(counts[k] / 21 * 1000) / 10])) as Record<Bpi21Key, number> };
}

/** Presentation order is created after Start, never during server rendering. The source keys stay stable. */
export function createBpi21OptionOrder(quiz: Questionnaire, random: () => number = Math.random): Record<string, string[]> {
  if (!isBpi21ConfigurationValid(quiz)) return {};
  return Object.fromEntries(quiz.questions.map(q => {
    const keys: string[] = [...bpi21Keys];
    for (let i = keys.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [keys[i], keys[j]] = [keys[j], keys[i]]; }
    return [q.id, [...keys, "na"]];
  }));
}
