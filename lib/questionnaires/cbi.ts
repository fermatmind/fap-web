import type { Questionnaire } from "./types";

export type CbiDomain = "personal" | "work";
export type CbiDomainScore = { rated: number; total: number; minimum: number; sum: number | null; mean: number | null };
export type CbiResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 13; cbiDomains: Record<CbiDomain, CbiDomainScore>;
};
const sourceItems = [
  {
    "id": "CBI_P_01",
    "domain": "personal",
    "en": "How often do you feel tired?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_01",
    "domain": "work",
    "en": "Is your work emotionally exhausting?",
    "reverse": false,
    "format": "degree"
  },
  {
    "id": "CBI_P_02",
    "domain": "personal",
    "en": "How often are you physically exhausted?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_02",
    "domain": "work",
    "en": "Do you feel burnt out because of your work?",
    "reverse": false,
    "format": "degree"
  },
  {
    "id": "CBI_P_03",
    "domain": "personal",
    "en": "How often are you emotionally exhausted?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_03",
    "domain": "work",
    "en": "Does your work frustrate you?",
    "reverse": false,
    "format": "degree"
  },
  {
    "id": "CBI_P_04",
    "domain": "personal",
    "en": "How often do you think: ”I can’t take it anymore”?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_04",
    "domain": "work",
    "en": "Do you feel worn out at the end of the working day?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_P_05",
    "domain": "personal",
    "en": "How often do you feel worn out?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_05",
    "domain": "work",
    "en": "Are you exhausted in the morning at the thought of another day at work?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_P_06",
    "domain": "personal",
    "en": "How often do you feel weak and susceptible to illness?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_06",
    "domain": "work",
    "en": "Do you feel that every working hour is tiring for you?",
    "reverse": false,
    "format": "frequency"
  },
  {
    "id": "CBI_W_07",
    "domain": "work",
    "en": "Do you have enough energy for family and friends during leisure time?",
    "reverse": true,
    "format": "frequency"
  }
] as const;
const frequencyLabels = ["Always", "Often", "Sometimes", "Seldom", "Never/almost never"] as const;
const degreeLabels = ["To a very high degree", "To a high degree", "Somewhat", "To a low degree", "To a very low degree"] as const;
const sourceValues = [100, 75, 50, 25, 0] as const;
const totals = { personal: 6, work: 7 } as const;
const minimums = { personal: 3, work: 4 } as const;

export function isCbiConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "cbi" || quiz.slug !== "burnout-risk" || quiz.code !== "FM_CBI_PERSONAL_WORK_13" || quiz.version !== "1.0.0"
    || quiz.source?.formCode !== "cbi_personal_work_13_zh_working_v1" || quiz.source?.scoringVersion !== "1.0.0"
    || quiz.source?.psychometricValidationCompleted !== false || !quiz.instructions
    || !Array.isArray(quiz.questions) || !Array.isArray(quiz.directions) || !Array.isArray(quiz.profiles)
    || quiz.questions.length !== 13 || quiz.directions.length !== 2 || quiz.profiles.length !== 2) return false;
  if (!(["personal", "work"] as const).every((id, index) => quiz.directions[index]?.id === id
    && quiz.directions[index].itemCount === totals[id]
    && quiz.profiles[index]?.id === id && Array.isArray(quiz.profiles[index].directionIds)
    && quiz.profiles[index].directionIds.length === 1 && quiz.profiles[index].directionIds[0] === id)) return false;
  return quiz.questions.every((question, index) => {
    const source = sourceItems[index], labels = source.format === "frequency" ? frequencyLabels : degreeLabels;
    return question?.id === source.id && question.prompt?.en === source.en && question.reverse === source.reverse
      && Array.isArray(question.options) && question.options.length === 6
      && question.options.every((option, position) => option?.directionId === source.domain
        && (position === 5 ? option.id === "na" && option.score === null
          : option.id === String(sourceValues[position]) && option.score === sourceValues[position] && option.label?.en === labels[position]));
  });
}

export function scoreCbiQuestionnaire(quiz: Questionnaire, answers: unknown): CbiResult {
  if (!isCbiConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || (Object.getPrototypeOf(answers) !== Object.prototype && Object.getPrototypeOf(answers) !== null)) return { status: "invalid", answered: 0 };
  const raw = { personal: { rated: 0, sum: 0 }, work: { rated: 0, sum: 0 } };
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const index = sourceItems.findIndex(item => item.id === id);
    if (index < 0 || typeof value !== "string") return { status: "invalid", answered };
    const option = quiz.questions[index].options.find(option => option.id === value);
    if (!option) return { status: "invalid", answered };
    if (typeof option.score === "number") {
      const item = sourceItems[index], domain = raw[item.domain];
      domain.sum += item.reverse ? 100 - option.score : option.score;
      domain.rated++;
    }
    answered++;
  }
  if (answered !== 13) return { status: "incomplete", answered };
  const domainScore = (id: CbiDomain): CbiDomainScore => {
    const { sum, rated } = raw[id], sufficient = rated >= minimums[id];
    return { rated, total: totals[id], minimum: minimums[id], sum: sufficient ? sum : null, mean: sufficient ? sum / rated : null };
  };
  return { status: "complete", answered: 13, cbiDomains: { personal: domainScore("personal"), work: domainScore("work") } };
}
