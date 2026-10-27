import type { Questionnaire } from "@/lib/questionnaires/types";

const domains = ["core", "unproductive", "mental-capacity"] as const;
type Domain = typeof domains[number];
const itemNumbers: readonly (readonly number[])[] = [[1, 2, 3, 6, 7, 8, 11, 12, 13], [4, 9, 14], [5, 10, 15]];
const profiles = ["total-reading", "core-reading", "unproductive-reading", "mental-capacity-reading"];
const anchors = ["Never", "Rarely", "Sometimes", "Often", "Almost always"];
export type Ptq15Part = { rated: number; total: number; sum: number | null; maximum: number };
export type Ptq15Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete"; answered: 15;
  ptq15: { rated: number; skipped: number; parts: Record<Domain, Ptq15Part>; overallSum: number | null };
};

const textValid = (value: unknown): value is { en: string; zh: string } => Boolean(value && typeof value === "object"
  && typeof (value as { en?: unknown }).en === "string" && (value as { en: string }).en.trim()
  && typeof (value as { zh?: unknown }).zh === "string" && (value as { zh: string }).zh.trim());

const everyEntry = <T>(values: readonly T[], predicate: (value: T, index: number) => unknown): boolean =>
  Array.from(values).every(predicate);

export function isPtq15ConfigurationValid(quiz: Questionnaire): boolean {
  if (!quiz || quiz.kind !== "ptq15" || quiz.slug !== "overthinking-screener" || quiz.code !== "PTQ15_EHRING2011_CC_BY"
    || !quiz.source || quiz.source.kind !== "ptq15_published_appendix_fmzh_working"
    || quiz.source.formCode !== "ptq15_ehring2011_appendix_fmzh_working_v1" || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "ptq15_unreversed_three_complete_sums_and_strict15_total_no_bands_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !textValid(quiz.instructions) || !Array.isArray(quiz.directions) || quiz.directions.length !== 3
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 15 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!everyEntry(quiz.directions, (d, i) => d && d.id === domains[i] && d.itemCount === itemNumbers[i].length && textValid(d.title))) return false;
  if (!everyEntry(quiz.profiles, (p, i) => p && p.id === profiles[i] && textValid(p.title) && textValid(p.headline)
    && textValid(p.summary) && textValid(p.scoreReading) && Array.isArray(p.sections) && p.sections.length === 6
    && everyEntry(p.sections, section => section && textValid(section.title) && Array.isArray(section.paragraphs)
      && section.paragraphs.length > 0 && everyEntry(section.paragraphs, textValid))
    && Array.isArray(p.directionIds) && p.directionIds.length === (i === 0 ? 3 : 1)
    && everyEntry(p.directionIds, (id, j) => id === (i === 0 ? domains[j] : domains[i - 1])))) return false;
  return everyEntry(quiz.questions, (q, i) => {
    const domain = domains[itemNumbers.findIndex(numbers => numbers.includes(i + 1))];
    return q && q.id === `PTQ_${String(i + 1).padStart(2, "0")}` && q.reverse === undefined
      && q.correctOptionId === undefined && q.explanation === undefined && textValid(q.prompt)
      && Array.isArray(q.options) && q.options.length === 6 && everyEntry(q.options, (o, j) => o && o.directionId === domain
        && o.id === (j === 5 ? "na" : String(j)) && o.score === (j === 5 ? null : j)
        && textValid(o.label) && (j === 5 || o.label.en === anchors[j]));
  });
}

export function scorePtq15Questionnaire(quiz: Questionnaire, answers: unknown): Ptq15Result {
  if (!isPtq15ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const sums: Record<Domain, { rated: number; sum: number }> = {
    core: { rated: 0, sum: 0 }, unproductive: { rated: 0, sum: 0 }, "mental-capacity": { rated: 0, sum: 0 },
  };
  const questions = new Map(quiz.questions.map((q, i) => [q.id, { question: q, domain: domains[itemNumbers.findIndex(numbers => numbers.includes(i + 1))] }]));
  let answered = 0;
  for (const [id, response] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.question.options.find(o => o.id === response);
    if (!question || !option) return { status: "invalid", answered };
    if (typeof option.score === "number") { sums[question.domain].sum += option.score; sums[question.domain].rated++; }
    answered++;
  }
  if (answered !== 15) return { status: "incomplete", answered };
  const parts = Object.fromEntries(domains.map((id, i) => {
    const total = itemNumbers[i].length, item = sums[id];
    return [id, { rated: item.rated, total, maximum: total * 4, sum: item.rated === total ? item.sum : null }];
  })) as Record<Domain, Ptq15Part>;
  const rated = domains.reduce((n, id) => n + sums[id].rated, 0);
  return { status: "complete", answered: 15, ptq15: {
    rated, skipped: 15 - rated, parts, overallSum: rated === 15 ? domains.reduce((n, id) => n + sums[id].sum, 0) : null,
  } };
}
