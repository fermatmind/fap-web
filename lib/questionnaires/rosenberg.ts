import type { Questionnaire } from "./types";

const positiveNumbers = new Set([1, 2, 4, 6, 7]);
const anchorScores: Readonly<Record<string, number | null>> = { sa: 3, a: 2, d: 1, sd: 0, na: null };
const anchors = ["sa", "a", "d", "sd", "na"] as const;
export type RosenbergResult = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 10;
  rosenberg: { total: number | null; rated: number; totalItems: 10; skipped: number };
};

export function isRosenbergConfigurationValid(quiz: Questionnaire): boolean {
  if (!quiz || !quiz.source || !Array.isArray(quiz.questions) || !Array.isArray(quiz.directions) || !Array.isArray(quiz.profiles)
    || quiz.kind !== "rosenberg" || quiz.slug !== "self-esteem" || quiz.code !== "RSES_UMD_ORIGINAL10"
    || quiz.source.formCode !== "rses_umd_original_order_10_fm_zh_working_v1"
    || quiz.source.scoringVersion !== "rses_umd_0_30_full10_v1"
    || quiz.source.kind !== "rosenberg_umd_public_domain_original10" || quiz.source.itemBankVersion !== quiz.source.formCode
    || !quiz.instructions || quiz.questions.length !== 10 || quiz.directions.length !== 1 || quiz.profiles.length !== 1) return false;
  const direction = quiz.directions[0], profile = quiz.profiles[0];
  if (!direction || !profile || !Array.isArray(profile.directionIds) || direction.id !== "global-self-regard" || direction.itemCount !== 10 || profile.id !== "score-reading"
    || profile.directionIds.length !== 1 || profile.directionIds[0] !== direction.id) return false;
  return quiz.questions.every((question, index) => question && question.id === `RSES_${String(index + 1).padStart(2, "0")}`
    && question.reverse === !positiveNumbers.has(index + 1)
    && Array.isArray(question.options) && question.options.length === 5
    && question.options.every((option, optionIndex) => option && option.id === anchors[optionIndex]
      && option.directionId === direction.id && option.score === anchorScores[option.id]));
}

export function scoreRosenbergQuestionnaire(quiz: Questionnaire, answers: unknown): RosenbergResult {
  if (!isRosenbergConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(question => [question.id, question]));
  let answered = 0, rated = 0, sum = 0;
  for (const [id, choice] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(candidate => candidate.id === choice);
    if (!question || !option) return { status: "invalid", answered };
    if (typeof option.score === "number") { sum += question.reverse ? 3 - option.score : option.score; rated++; }
    answered++;
  }
  if (answered !== 10) return { status: "incomplete", answered };
  return { status: "complete", answered: 10, rosenberg: { total: rated === 10 ? sum : null, rated, totalItems: 10, skipped: 10 - rated } };
}
