import type { Questionnaire } from "./types";
import {
  HOLDING_BACK_DOMAINS,
  scoreHoldingBackOriginal35,
  type HoldingBackAnswer,
  type HoldingBackReport,
} from "./holdingBack35Method";

export type HoldingBack35Questionnaire = Omit<Questionnaire, "kind"> & { kind: "holding-back35" };
export type HoldingBack35Result = {
  status: "invalid" | "incomplete" | "unavailable";
  answered: number;
} | {
  status: "complete";
  answered: 35;
  holdingBack35: HoldingBackReport;
};
const labels = ["Never", "Rarely", "Sometimes", "Often", "Almost always", "Not applicable / prefer not to answer"];
const textValid = (value: unknown): boolean => Boolean(value && typeof value === "object"
  && typeof (value as { en?: unknown }).en === "string" && (value as { en: string }).en.trim()
  && typeof (value as { zh?: unknown }).zh === "string" && (value as { zh: string }).zh.trim());
const denseEvery = <T>(values: readonly T[], predicate: (value: T, index: number) => unknown): boolean =>
  Array.from(values).every(predicate);

export function isHoldingBack35ConfigurationValid(value: unknown): value is HoldingBack35Questionnaire {
  if (!value || typeof value !== "object") return false;
  const quiz = value as HoldingBack35Questionnaire;
  if (quiz.kind !== "holding-back35" || quiz.slug !== "holding-yourself-back" || quiz.code !== "FM_HOLDING_BACK_ORIGINAL35"
    || !quiz.source || quiz.source.kind !== "fermatmind_original_seven_daily_topics"
    || quiz.source.formCode !== "fm_holding_back_original35_fourweeks_v1"
    || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "fm_seven_strict5_means_1dp_no_overall_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !textValid(quiz.instructions) || !Array.isArray(quiz.directions) || quiz.directions.length !== 7
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 35
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 7) return false;
  if (!denseEvery(quiz.directions, (d, i) => d && d.id === HOLDING_BACK_DOMAINS[i].id
    && d.itemCount === 5 && textValid(d.title))) return false;
  if (!denseEvery(quiz.profiles, (p, i) => p && p.id === `${HOLDING_BACK_DOMAINS[i].id}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === HOLDING_BACK_DOMAINS[i].id
    && textValid(p.title) && textValid(p.headline) && textValid(p.summary) && textValid(p.scoreReading)
    && p.seo && textValid(p.seo.title) && textValid(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 6
    && denseEvery(p.sections, s => s && textValid(s.title) && Array.isArray(s.paragraphs)
      && s.paragraphs.length > 0 && denseEvery(s.paragraphs, textValid)))) return false;
  return denseEvery(quiz.questions, (q, i) => {
    const domain = HOLDING_BACK_DOMAINS[Math.floor(i / 5)];
    return q && q.id === domain.itemIds[i % 5] && textValid(q.prompt) && q.reverse === false
      && q.correctOptionId === undefined && q.explanation === undefined
      && Array.isArray(q.options) && q.options.length === 6
      && denseEvery(q.options, (o, j) => o && o.id === (j === 5 ? "na" : String(j + 1))
        && o.directionId === domain.id && o.score === (j === 5 ? null : j + 1)
        && textValid(o.label) && o.label.en === labels[j]);
  });
}

/** The generic form supplies string option IDs; map only selected, validated options. */
export function scoreHoldingBack35Questionnaire(quiz: unknown, input: unknown): HoldingBack35Result {
  if (!isHoldingBack35ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!input || typeof input !== "object" || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const numeric: Record<string, HoldingBackAnswer> = Object.create(null);
  let answered = 0;
  for (const id of Reflect.ownKeys(input)) {
    if (typeof id !== "string") return { status: "invalid", answered };
    const descriptor = Object.getOwnPropertyDescriptor(input, id);
    if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) return { status: "invalid", answered };
    const selected: unknown = descriptor.value;
    const option = typeof selected === "string" ? questions.get(id)?.options.find(o => o.id === selected) : undefined;
    if (!option) return { status: "invalid", answered };
    if (option.id === "na") numeric[id] = "na";
    else if (typeof option.score === "number" && Number.isInteger(option.score) && option.score >= 1 && option.score <= 5)
      numeric[id] = option.score as HoldingBackAnswer;
    else return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 35) return { status: "incomplete", answered };
  const holdingBack35 = scoreHoldingBackOriginal35(numeric);
  return holdingBack35 ? { status: "complete", answered: 35, holdingBack35 } : { status: "unavailable", answered };
}
