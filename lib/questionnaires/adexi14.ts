import type { Questionnaire } from "@/lib/questionnaires/types";

const domains = ["working-memory", "inhibition"] as const;
type Domain = typeof domains[number];
const itemNumbers: readonly (readonly number[])[] = [[1, 2, 5, 7, 8, 9, 11, 12, 13], [3, 4, 6, 10, 14]];
const profiles = ["overall-sum-reading", "working-memory-reading", "inhibition-reading"];
export type Adexi14Part = { rated: number; total: number; sum: number | null; mean: number | null };
export type Adexi14Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete"; answered: 14;
  adexi14: { rated: number; skipped: number; parts: Record<Domain, Adexi14Part>; overallSum: number | null };
};

const textValid = (value: unknown): value is { en: string; zh: string } => Boolean(value && typeof value === "object"
  && typeof (value as { en?: unknown }).en === "string" && (value as { en: string }).en.trim()
  && typeof (value as { zh?: unknown }).zh === "string" && (value as { zh: string }).zh.trim());
const everyEntry = <T>(values: readonly T[], predicate: (value: T, index: number) => unknown): boolean =>
  Array.from(values).every(predicate);

export function isAdexi14ConfigurationValid(quiz: Questionnaire): boolean {
  if (!quiz || quiz.kind !== "adexi14" || quiz.slug !== "executive-function" || quiz.code !== "ADEXI14_OFFICIAL_SELFREPORT"
    || !quiz.source || quiz.source.kind !== "adexi_existing_official_en_siu_zh"
    || quiz.source.formCode !== "adexi14_current_official_en_angela_siu_simplified_zh_v1" || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "adexi14_coloured_rawsum_partmean_strictcomplete_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !textValid(quiz.instructions) || !Array.isArray(quiz.directions) || quiz.directions.length !== 2
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 14 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!everyEntry(quiz.directions, (d, i) => d && d.id === domains[i] && d.itemCount === itemNumbers[i].length && textValid(d.title))) return false;
  if (!everyEntry(quiz.profiles, (p, i) => p && p.id === profiles[i] && textValid(p.title) && textValid(p.headline)
    && textValid(p.summary) && textValid(p.scoreReading) && Array.isArray(p.sections) && p.sections.length === 6
    && everyEntry(p.sections, section => section && textValid(section.title) && Array.isArray(section.paragraphs)
      && section.paragraphs.length > 0 && everyEntry(section.paragraphs, textValid))
    && Array.isArray(p.directionIds) && p.directionIds.length === (i === 0 ? 2 : 1)
    && everyEntry(p.directionIds, (id, j) => id === (i === 0 ? domains[j] : domains[i - 1])))) return false;
  return everyEntry(quiz.questions, (q, i) => {
    const domain = domains[itemNumbers.findIndex(numbers => numbers.includes(i + 1))];
    return q && q.id === `ADEXI_${String(i + 1).padStart(2, "0")}` && q.reverse === false
      && q.correctOptionId === undefined && q.explanation === undefined && textValid(q.prompt)
      && Array.isArray(q.options) && q.options.length === 6 && everyEntry(q.options, (o, j) => o && o.directionId === domain
        && o.id === (j === 5 ? "na" : String(j + 1)) && o.score === (j === 5 ? null : j + 1) && textValid(o.label));
  });
}

export function scoreAdexi14Questionnaire(quiz: Questionnaire, answers: unknown): Adexi14Result {
  if (!isAdexi14ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const sums: Record<Domain, { rated: number; sum: number }> = { "working-memory": { rated: 0, sum: 0 }, inhibition: { rated: 0, sum: 0 } };
  const questions = new Map(quiz.questions.map((q, i) => [q.id, { question: q, domain: domains[itemNumbers.findIndex(numbers => numbers.includes(i + 1))] }]));
  let answered = 0;
  for (const [id, response] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.question.options.find(o => o.id === response);
    if (!question || !option) return { status: "invalid", answered };
    if (typeof option.score === "number") { sums[question.domain].sum += option.score; sums[question.domain].rated++; }
    answered++;
  }
  if (answered !== 14) return { status: "incomplete", answered };
  const parts = Object.fromEntries(domains.map((id, i) => {
    const total = itemNumbers[i].length, item = sums[id], available = item.rated === total;
    return [id, { rated: item.rated, total, sum: available ? item.sum : null, mean: available ? item.sum / total : null }];
  })) as Record<Domain, Adexi14Part>;
  const rated = sums["working-memory"].rated + sums.inhibition.rated;
  return { status: "complete", answered: 14, adexi14: { rated, skipped: 14 - rated, parts, overallSum: rated === 14 ? sums["working-memory"].sum + sums.inhibition.sum : null } };
}

export function formatAdexi14Mean(sum: number, itemCount: number): string {
  const cents = Math.floor((sum * 100 + itemCount / 2) / itemCount);
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
