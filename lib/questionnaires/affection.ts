import type { Questionnaire } from "./types";

export type AffectionFacet = { sum: number; rated: number; total: number; mean: number | null };
export type AffectionResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: number; affectionFacets: Record<string, AffectionFacet>;
};
const categories = ["words", "acts", "gifts", "time", "touch"];
const roles = ["giving", "receiving"];
const facets = roles.flatMap(role => categories.map(category => `${role}_${category}`));

// Fixed original two-role reflection. The minimum is an information-completeness rule, not a validated cutoff.
export function isAffectionConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "affection" || quiz.code !== "LOVE_LANGUAGE_REFLECTION_50"
    || quiz.source.formCode !== "fm_love_languages_bidirectional_mean_50" || quiz.source.scoringVersion !== "1.0.0"
    || !quiz.instructions || quiz.minimumRatedItems !== 3 || quiz.questions.length !== 50
    || quiz.directions.length !== 10 || quiz.profiles.length !== 5) return false;
  if (new Set(quiz.questions.map(q => q.id)).size !== 50 || new Set(quiz.directions.map(d => d.id)).size !== 10
    || new Set(quiz.profiles.map(p => p.id)).size !== 5
    || !quiz.directions.every(d => facets.includes(d.id) && d.itemCount === 5)
    || !quiz.profiles.every(p => categories.includes(p.id) && p.directionIds.length === 2
      && p.directionIds[0] === `giving_${p.id}` && p.directionIds[1] === `receiving_${p.id}`)) return false;
  return quiz.questions.every(q => {
    const match = /^LL_([GR])_(WORDS|ACTS|GIFTS|TIME|TOUCH)_0[1-5]$/.exec(q.id);
    if (!match || q.reverse !== false || q.options.length !== 6 || new Set(q.options.map(o => o.id)).size !== 6) return false;
    const direction = `${match[1] === "G" ? "giving" : "receiving"}_${match[2].toLowerCase()}`;
    return q.options.every(o => o.directionId === direction
      && (o.id === "na" ? o.score === null : /^[1-5]$/.test(o.id) && o.score === Number(o.id)));
  });
}

export function scoreAffectionQuestionnaire(quiz: Questionnaire, answers: unknown): AffectionResult {
  if (!isAffectionConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (answers === null || typeof answers !== "object"
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const affectionFacets: Record<string, AffectionFacet> = Object.fromEntries(facets.map(id => [id, { sum: 0, rated: 0, total: 5, mean: null }]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(o => o.id === value);
    if (!question || !option) return { status: "invalid", answered };
    const facet = affectionFacets[option.directionId];
    if (typeof option.score === "number") { facet.sum += option.score; facet.rated++; }
    answered++;
  }
  if (answered !== 50) return { status: "incomplete", answered };
  for (const facet of Object.values(affectionFacets)) {
    if (facet.rated >= 3) facet.mean = Math.round(facet.sum / facet.rated * 10) / 10;
  }
  return { status: "complete", answered, affectionFacets };
}
