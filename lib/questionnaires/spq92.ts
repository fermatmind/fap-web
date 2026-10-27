import type { Questionnaire } from "@/lib/questionnaires/types";
const reverseNumbers = new Set([3,4,5,6,10,13,15,16,17,18,20,22,25,26,27,28,29,31,34,39,40,42,43,44,46,47,48,51,53,54,56,57,63,66,67,72,75,77,78,79,80,86,89,92]);
const anchors = ["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"];
export type Spq92Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete"; answered: 92; spq92: { rated: number; skipped: number; total: number | null };
};
const textValid = (value: unknown): value is { en: string; zh: string } => Boolean(value && typeof value === "object"
  && typeof (value as { en?: unknown }).en === "string" && (value as { en: string }).en.trim()
  && typeof (value as { zh?: unknown }).zh === "string" && (value as { zh: string }).zh.trim());
const denseEvery = <T>(values: readonly T[], predicate: (value: T, index: number) => unknown): boolean => Array.from(values).every(predicate);
export function isSpq92ConfigurationValid(quiz: Questionnaire): boolean {
  if (!quiz || quiz.kind !== "spq92" || quiz.slug !== "sensory-processing-test" || quiz.code !== "SPQ92_TAVASSOLI2014_CC_BY"
    || !quiz.source || quiz.source.kind !== "spq92_published_table4_fmzh_working"
    || quiz.source.formCode !== "spq92_table4_2014_arc92key2024_fmzh_working_v1"
    || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "spq92_arc44reverse_strict92_total276_no_bands_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !textValid(quiz.instructions) || !Array.isArray(quiz.directions) || quiz.directions.length !== 1
    || !denseEvery(quiz.directions, d => d && d.id === "spq92-total" && d.itemCount === 92 && textValid(d.title))
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 92
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 1) return false;
  if (!denseEvery(quiz.profiles, p => p && p.id === "spq92-total-reading" && textValid(p.title) && textValid(p.headline)
    && textValid(p.summary) && textValid(p.scoreReading) && Array.isArray(p.directionIds) && p.directionIds.length === 1
    && denseEvery(p.directionIds, id => id === "spq92-total") && Array.isArray(p.sections) && p.sections.length === 6
    && denseEvery(p.sections, section => section && textValid(section.title) && Array.isArray(section.paragraphs)
      && section.paragraphs.length > 0 && denseEvery(section.paragraphs, textValid)))) return false;
  return denseEvery(quiz.questions, (question, i) => question && question.id === `SPQ92_${String(i + 1).padStart(2, "0")}`
    && textValid(question.prompt) && question.reverse === reverseNumbers.has(i + 1)
    && question.correctOptionId === undefined && question.explanation === undefined
    && Array.isArray(question.options) && question.options.length === 5
    && denseEvery(question.options, (option, j) => option && option.directionId === "spq92-total"
      && option.id === (j === 4 ? "na" : String(j)) && option.score === (j === 4 ? null : j)
      && textValid(option.label) && (j === 4 || option.label.en === anchors[j])));
}
export function scoreSpq92Questionnaire(quiz: Questionnaire, answers: unknown): Spq92Result {
  if (!isSpq92ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(question => [question.id, question]));
  let answered = 0, rated = 0, total = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(o => o.id === value);
    if (!question || !option) return { status: "invalid", answered };
    if (typeof option.score === "number") { total += question.reverse ? 3 - option.score : option.score; rated++; }
    answered++;
  }
  if (answered !== 92) return { status: "incomplete", answered };
  return { status: "complete", answered: 92, spq92: { rated, skipped: 92 - rated, total: rated === 92 ? total : null } };
}
