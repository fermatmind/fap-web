import type { Questionnaire } from "./types";

export type SecsDomain = "social" | "economic";
export type SecsDomainScore = { rated: number; total: number; sum: number | null; mean: number | null };
export type SecsResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 12; secsDomains: Record<SecsDomain, SecsDomainScore>;
};
const terms = ["Abortion.", "Limited government.", "Military and national security.", "Religion.", "Welfare benefits.", "Gun ownership.", "Traditional marriage.", "Traditional values.", "Fiscal responsibility.", "Business.", "The family unit.", "Patriotism."] as const;
const domains: SecsDomain[] = ["social", "economic", "social", "social", "economic", "economic", "social", "social", "economic", "economic", "social", "social"];
const totalItems = { social: 7, economic: 5 } as const;

export function isSecsConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "secs" || quiz.slug !== "conservatism" || quiz.code !== "SECS_2013_US_12" || quiz.version !== "1.0.0"
    || quiz.source?.formCode !== "fm_secs_2013_us_warmth_12" || quiz.source?.scoringVersion !== "1.0.0"
    || quiz.source?.psychometricValidationCompleted !== false || !quiz.instructions
    || !Array.isArray(quiz.questions) || !Array.isArray(quiz.directions) || !Array.isArray(quiz.profiles)
    || quiz.questions.length !== 12 || quiz.directions.length !== 2 || quiz.profiles.length !== 2) return false;
  if (!(["social", "economic"] as const).every((id, index) => quiz.directions[index]?.id === id
    && quiz.directions[index].itemCount === totalItems[id]
    && quiz.profiles[index]?.id === id && Array.isArray(quiz.profiles[index].directionIds) && quiz.profiles[index].directionIds.length === 1 && quiz.profiles[index].directionIds[0] === id)) return false;
  return quiz.questions.every((question, index) => question?.id === `SECS_${String(index + 1).padStart(2, "0")}`
    && question.prompt?.en === terms[index] && question.reverse === (index === 0 || index === 4)
    && Array.isArray(question.options) && question.options.length === 12 && question.options.every((option, position) => option?.directionId === domains[index]
      && (position === 11 ? option.id === "na" && option.score === null : option.id === String(position * 10) && option.score === position * 10)));
}

export function scoreSecsQuestionnaire(quiz: Questionnaire, answers: unknown): SecsResult {
  if (!isSecsConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || (Object.getPrototypeOf(answers) !== Object.prototype && Object.getPrototypeOf(answers) !== null)) return { status: "invalid", answered: 0 };
  const raw = { social: { rated: 0, sum: 0 }, economic: { rated: 0, sum: 0 } };
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const index = quiz.questions.findIndex(question => question.id === id);
    if (index < 0 || typeof value !== "string") return { status: "invalid", answered };
    const question = quiz.questions[index], option = question.options.find(option => option.id === value);
    if (!option) return { status: "invalid", answered };
    if (typeof option.score === "number") {
      const domain = raw[domains[index]];
      domain.sum += question.reverse ? 100 - option.score : option.score;
      domain.rated++;
    }
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  const domainScore = (id: SecsDomain): SecsDomainScore => {
    const { sum, rated } = raw[id], total = totalItems[id], complete = rated === total;
    return { rated, total, sum: complete ? sum : null, mean: complete ? sum / total : null };
  };
  return { status: "complete", answered: 12, secsDomains: { social: domainScore("social"), economic: domainScore("economic") } };
}
