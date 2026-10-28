import type { Questionnaire, Text } from "./types";

export type MentalAgeResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: 12; mentalAge: { sum: number; playfulAge: number; points: Record<string, number> };
};
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown): value is Text => plain(value) && typeof value.en === "string" && !!value.en.trim()
  && typeof value.zh === "string" && !!value.zh.trim();
const dense = (value: unknown, length: number, test: (v: unknown, i: number) => boolean) =>
  Array.isArray(value) && value.length === length && Array.from(value).every(test);
const sectionIds = ["meaning", "arithmetic", "examples", "situations", "counterexamples", "comparison", "action", "method"];

/** Original entertainment arithmetic; no age calibration, norm or developmental classification. */
export function isMentalAgeConfigurationValid(quiz: unknown): quiz is Questionnaire {
  if (!plain(quiz) || quiz.kind !== "mental-age" || quiz.slug !== "mental-age" || quiz.code !== "FM_MENTAL_AGE12"
    || quiz.version !== "fm_mental_age12_v1" || !text(quiz.title) || !text(quiz.seoTitle) || !text(quiz.description)
    || !text(quiz.introduction) || !text(quiz.instructions) || !text(quiz.resultHeading) || !plain(quiz.source)
    || quiz.source.kind !== "fermatmind_original_playful_mental_age" || quiz.source.formCode !== quiz.version
    || quiz.source.itemBankVersion !== quiz.version || quiz.source.scoringVersion !== "fm_mental_age12_sum0to36_age18plus2s_v1"
    || quiz.source.resultContentVersion !== "fm_mental_age12_continuous_full8_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  return dense(quiz.directions, 1, d => plain(d) && d.id === "age-points" && d.itemCount === 12 && text(d.title))
    && dense(quiz.questions, 12, (q, i) => plain(q) && q.id === `MAGE_${String(i + 1).padStart(2, "0")}`
      && text(q.prompt) && q.reverse === undefined && q.correctOptionId === undefined
      && dense(q.options, 4, (o, j) => plain(o) && o.id === "abcd"[j] && text(o.label)
        && o.directionId === "age-points" && o.score === (j + i) % 4))
    && dense(quiz.profiles, 1, p => plain(p) && p.id === "understanding-your-playful-age"
      && dense(p.directionIds, 1, d => d === "age-points") && text(p.title) && text(p.headline) && text(p.summary)
      && text(p.scoreReading) && plain(p.seo) && text(p.seo.title) && text(p.seo.description)
      && dense(p.sections, 8, (s, i) => plain(s) && s.id === sectionIds[i] && text(s.title) && dense(s.paragraphs, 2, text)))
    && dense(quiz.guide, 6, (s, i) => plain(s) && s.id === ["source", "calculation", "example", "complete", "limits", "privacy"][i]
      && text(s.title) && dense(s.paragraphs, 1, text))
    && dense(quiz.faq, 8, f => plain(f) && text(f.question) && text(f.answer));
}

export function scoreMentalAgeQuestionnaire(quiz: unknown, answers: unknown): MentalAgeResult {
  if (!isMentalAgeConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(descriptors).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const points: Record<string, number> = {};
  let answered = 0, sum = 0;
  for (const [id, descriptor] of Object.entries(descriptors)) {
    const value: unknown = descriptor.value;
    const option = typeof value === "string" ? questions.get(id)?.options.find(o => o.id === value) : undefined;
    if (!option || typeof option.score !== "number") return { status: "invalid", answered };
    points[id] = option.score; sum += option.score; answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  return { status: "complete", answered: 12, mentalAge: { sum, playfulAge: 18 + 2 * sum, points } };
}
