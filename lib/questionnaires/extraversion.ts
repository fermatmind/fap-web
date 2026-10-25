import type { Questionnaire } from "./types";

export type ExtraversionResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: number;
  rated: number;
  total: number | null;
  mean: number | null;
  scaleProfileIds: string[];
};

const profileIds = ["introvert", "ambivert-intro", "ambivert-extro", "extrovert"];

// Fixed public-domain IPIP BFM Extraversion form. Bands are this website's reading convention.
export function isExtraversionConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "extraversion" || quiz.code !== "IPIP_EXTRAVERSION_10"
    || quiz.source.formCode !== "ipip_bfm_extraversion_10_web" || quiz.source.scoringVersion !== "fm-1.0.0"
    || !quiz.instructions || quiz.minimumRatedItems !== 10 || quiz.questions.length !== 10
    || quiz.directions.length !== 1 || quiz.directions[0].id !== "extraversion"
    || quiz.directions[0].itemCount !== 10 || quiz.profiles.length !== 4) return false;
  if (new Set(quiz.questions.map(q => q.id)).size !== 10
    || new Set(quiz.profiles.map(p => p.id)).size !== 4
    || !quiz.profiles.every(p => profileIds.includes(p.id) && p.directionIds.length === 1 && p.directionIds[0] === "extraversion")) return false;
  return quiz.questions.every(q => {
    if (!/^EXTRA_(0[1-9]|10)$/.test(q.id) || q.reverse !== (Number(q.id.slice(-2)) % 2 === 0)
      || q.options.length !== 6 || new Set(q.options.map(o => o.id)).size !== 6) return false;
    return q.options.every(o => o.directionId === "extraversion"
      && (o.id === "na" ? o.score === null : /^[1-5]$/.test(o.id) && o.score === Number(o.id)));
  });
}

export function scoreExtraversionQuestionnaire(quiz: Questionnaire, answers: unknown): ExtraversionResult {
  if (!isExtraversionConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (answers === null || typeof answers !== "object"
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  let answered = 0, rated = 0, sum = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(o => o.id === value);
    if (!question || !option) return { status: "invalid", answered };
    if (typeof option.score === "number") {
      sum += question.reverse ? 6 - option.score : option.score;
      rated++;
    }
    answered++;
  }
  if (answered !== 10) return { status: "incomplete", answered };
  if (rated !== 10) return { status: "complete", answered, rated, total: null, mean: null, scaleProfileIds: [] };
  const matches = sum < 20 ? [0] : sum === 20 ? [0, 1] : sum < 30 ? [1]
    : sum === 30 ? [1, 2] : sum < 40 ? [2] : sum === 40 ? [2, 3] : [3];
  return { status: "complete", answered, rated, total: sum, mean: sum / 10, scaleProfileIds: matches.map(i => profileIds[i]) };
}
