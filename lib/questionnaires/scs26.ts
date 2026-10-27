import type { Questionnaire } from "@/lib/questionnaires/types";
const domains = ["self-kindness", "self-judgment", "common-humanity", "isolation", "mindfulness", "over-identification"] as const;
type Domain = typeof domains[number];
const itemNumbers: readonly (readonly number[])[] = [[5, 12, 19, 23, 26], [1, 8, 11, 16, 21], [3, 7, 10, 15], [4, 13, 18, 25], [9, 14, 17, 22], [2, 6, 20, 24]];
const reversed = new Set([1, 2, 4, 6, 8, 11, 13, 16, 18, 20, 21, 24, 25]);
const profileIds = ["overall-mean", ...domains.map(id => `${id}-reading`)];
export type Scs26Part = { rawSum: number; keyedSum: number; rated: number; total: number; rawMean: number | null; keyedMean: number | null };
export type Scs26Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete"; answered: 26;
  scs26: { rated: number; skipped: number; parts: Record<Domain, Scs26Part>; overallNumerator: number | null; overallDenominator: 120; overallMean: number | null };
};
export function isScs26ConfigurationValid(quiz: Questionnaire): boolean {
  if (!quiz || quiz.kind !== "scs26" || quiz.slug !== "self-compassion" || quiz.code !== "SCS26_NEFF_2003"
    || !quiz.source || quiz.source.kind !== "neff_scs26_permission_working_zh"
    || quiz.source.formCode !== "scs26_neff2003_official_en_fm_zh_working_v1" || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "scs26_equal6_unrounded_complete26_rational120_v1"
    || !quiz.instructions || !Array.isArray(quiz.directions) || quiz.directions.length !== 6
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 26 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 7) return false;
  if (!quiz.directions.every((d, i) => d && d.id === domains[i] && d.itemCount === itemNumbers[i].length)) return false;
  if (!quiz.profiles.every((p, i) => p && p.id === profileIds[i] && Array.isArray(p.directionIds)
    && (i === 0 ? p.directionIds.length === 6 && p.directionIds.every((id, j) => id === domains[j])
      : p.directionIds.length === 1 && p.directionIds[0] === domains[i - 1]))) return false;
  return quiz.questions.every((q, i) => {
    const domain = domains[itemNumbers.findIndex(numbers => numbers.includes(i + 1))];
    return q && q.id === `SCS_${String(i + 1).padStart(2, "0")}` && q.reverse === reversed.has(i + 1)
      && Array.isArray(q.options) && q.options.length === 6 && q.options.every((o, j) => o && o.directionId === domain
        && o.id === (j === 5 ? "na" : String(j + 1)) && o.score === (j === 5 ? null : j + 1));
  });
}
export function scoreScs26Questionnaire(quiz: Questionnaire, answers: unknown): Scs26Result {
  if (!isScs26ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const parts = Object.fromEntries(domains.map((id, i) => [id, { rawSum: 0, keyedSum: 0, rated: 0, total: itemNumbers[i].length, rawMean: null, keyedMean: null }])) as Record<Domain, Scs26Part>;
  const questions = new Map(quiz.questions.map((q, i) => [q.id, { question: q, domain: domains[itemNumbers.findIndex(numbers => numbers.includes(i + 1))] }]));
  let answered = 0, rated = 0;
  for (const [id, response] of Object.entries(answers)) {
    const selected = questions.get(id), option = selected?.question.options.find(o => o.id === response);
    if (!selected || !option) return { status: "invalid", answered };
    if (typeof option.score === "number") { const part = parts[selected.domain]; part.rawSum += option.score; part.keyedSum += selected.question.reverse ? 6 - option.score : option.score; part.rated++; rated++; }
    answered++;
  }
  if (answered !== 26) return { status: "incomplete", answered };
  for (const part of Object.values(parts)) if (part.rated === part.total) { part.rawMean = part.rawSum / part.total; part.keyedMean = part.keyedSum / part.total; }
  // 20 is a common denominator of the five-item and four-item part means.
  // Dividing their weighted sum by 6*20 is exactly the source's mean of six means.
  const overallNumerator = rated === 26 ? domains.reduce((sum, id) => sum + parts[id].keyedSum * (20 / parts[id].total), 0) : null;
  return { status: "complete", answered: 26, scs26: { rated, skipped: 26 - rated, parts, overallNumerator, overallDenominator: 120, overallMean: overallNumerator === null ? null : overallNumerator / 120 } };
}
export function formatScs26Mean(numerator: number, denominator: number): string {
  const cents = Math.floor((numerator * 100 + denominator / 2) / denominator);
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
