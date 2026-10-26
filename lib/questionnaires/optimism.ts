import type { Questionnaire } from "./types";

export type OptimismResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: number;
  rated: number;
  total: number | null;
  mean: number | null;
  outlookProfileIds: string[];
};

const profileIds = ["lower", "lower-middle", "middle", "upper-middle", "higher"];

// Fixed public-domain IPIP single-construct Optimism form. Bands are this website's reading convention.
export function isOptimismConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "optimism" || quiz.code !== "IPIP_OPTIMISM_10"
    || quiz.source.formCode !== "ipip_single_construct_optimism_10_web" || quiz.source.scoringVersion !== "1.0.0"
    || !quiz.instructions || quiz.minimumRatedItems !== 10 || quiz.questions.length !== 10
    || quiz.directions.length !== 1 || quiz.directions[0].id !== "optimism"
    || quiz.directions[0].itemCount !== 10 || quiz.profiles.length !== 5) return false;
  if (new Set(quiz.questions.map(q => q.id)).size !== 10
    || new Set(quiz.profiles.map(p => p.id)).size !== 5
    || !quiz.profiles.every(p => profileIds.includes(p.id) && p.directionIds.length === 1 && p.directionIds[0] === "optimism")) return false;
  return quiz.questions.every(q => {
    if (!/^IPIP_OPT_(0[1-9]|10)$/.test(q.id) || q.reverse !== ([2, 4, 6, 8, 9, 10].includes(Number(q.id.slice(-2))))
      || q.options.length !== 6 || new Set(q.options.map(o => o.id)).size !== 6) return false;
    return q.options.every(o => o.directionId === "optimism"
      && (o.id === "na" ? o.score === null : /^[1-5]$/.test(o.id) && o.score === Number(o.id)));
  });
}

export function scoreOptimismQuestionnaire(quiz: Questionnaire, answers: unknown): OptimismResult {
  if (!isOptimismConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
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
  if (rated !== 10) return { status: "complete", answered, rated, total: null, mean: null, outlookProfileIds: [] };
  const matches = sum < 18 ? [0] : sum === 18 ? [0, 1] : sum < 26 ? [1]
    : sum === 26 ? [1, 2] : sum < 34 ? [2] : sum === 34 ? [2, 3] : sum < 42 ? [3] : sum === 42 ? [3, 4] : [4];
  return { status: "complete", answered, rated, total: sum, mean: sum / 10, outlookProfileIds: matches.map(i => profileIds[i]) };
}
