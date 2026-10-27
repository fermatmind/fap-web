import type { Questionnaire } from "./types";

export type PoliticalCoordinateAxis = "economic" | "social";
export type PoliticalCoordinateScore = {
  rated: number;
  total: 18;
  negativeCount: number | null;
  positiveCount: number | null;
  difference: number | null;
};
export type PoliticalCoordinatesResult = {
  status: "unavailable" | "invalid" | "incomplete";
  answered: number;
} | {
  status: "complete";
  answered: 36;
  politicalCoordinates: Record<PoliticalCoordinateAxis, PoliticalCoordinateScore>;
  politicalCoordinateProfileIds: string[];
};

const ends = { economic: ["left", "right"], social: ["communitarian", "liberal"] } as const;
const directionIds = ["left", "right", "communitarian", "liberal"];
const profiles = [
  { id: "left-communitarian", ends: ["left", "communitarian"] },
  { id: "left-liberal", ends: ["left", "liberal"] },
  { id: "right-communitarian", ends: ["right", "communitarian"] },
  { id: "right-liberal", ends: ["right", "liberal"] },
];

export function isPoliticalCoordinatesConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "political-coordinates" || quiz.slug !== "political-coordinates"
    || quiz.code !== "FM_ORIGINAL_POLICY_COORDINATES" || quiz.version !== "1.0.0"
    || quiz.source?.formCode !== "fm_original_policy_coordinates_36_v1"
    || quiz.source?.scoringVersion !== "1.0.0" || quiz.source?.psychometricValidationCompleted !== false
    || !quiz.instructions || !Array.isArray(quiz.questions) || quiz.questions.length !== 36
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!quiz.directions.every((direction, index) => direction?.id === directionIds[index] && direction.itemCount === 18)
    || !quiz.profiles.every((profile, index) => profile?.id === profiles[index].id
      && Array.isArray(profile.directionIds) && profile.directionIds.length === 2
      && profile.directionIds.every((id, position) => id === profiles[index].ends[position]))) return false;
  return quiz.questions.every((question, index) => {
    const axis: PoliticalCoordinateAxis = index % 2 === 0 ? "economic" : "social";
    const expected = Math.floor(index / 2) % 2 === 0 ? [...ends[axis]] : [...ends[axis]].reverse();
    return question?.id === `POL_${String(index + 1).padStart(3, "0")}`
      && question.reverse !== true && Array.isArray(question.options) && question.options.length === 3
      && question.options.every((option, position) => position === 2
        ? option?.id === "na" && option.directionId === axis && option.score === null
        : option?.id === expected[position] && option.directionId === expected[position] && option.score === 1);
  });
}

export function scorePoliticalCoordinatesQuestionnaire(quiz: Questionnaire, answers: unknown): PoliticalCoordinatesResult {
  if (!isPoliticalCoordinatesConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || (Object.getPrototypeOf(answers) !== Object.prototype && Object.getPrototypeOf(answers) !== null)) {
    return { status: "invalid", answered: 0 };
  }
  const raw = {
    economic: { rated: 0, negativeCount: 0, positiveCount: 0 },
    social: { rated: 0, negativeCount: 0, positiveCount: 0 },
  };
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const index = quiz.questions.findIndex(question => question.id === id);
    if (index < 0 || typeof value !== "string") return { status: "invalid", answered };
    const option = quiz.questions[index].options.find(option => option.id === value);
    if (!option) return { status: "invalid", answered };
    const axis: PoliticalCoordinateAxis = index % 2 === 0 ? "economic" : "social";
    if (option.score !== null) {
      raw[axis].rated++;
      if (option.directionId === ends[axis][0]) raw[axis].negativeCount++;
      else raw[axis].positiveCount++;
    }
    answered++;
  }
  if (answered !== 36) return { status: "incomplete", answered };
  const domain = (axis: PoliticalCoordinateAxis): PoliticalCoordinateScore => {
    const { rated, negativeCount, positiveCount } = raw[axis], complete = rated === 18;
    return {
      rated, total: 18,
      negativeCount: complete ? negativeCount : null,
      positiveCount: complete ? positiveCount : null,
      difference: complete ? positiveCount - negativeCount : null,
    };
  };
  const economic = domain("economic"), social = domain("social");
  const economicDifference = economic.difference, socialDifference = social.difference;
  const politicalCoordinateProfileIds = economicDifference === null || socialDifference === null ? [] : profiles.filter(profile =>
    (economicDifference === 0 || profile.ends[0] === (economicDifference < 0 ? "left" : "right"))
    && (socialDifference === 0 || profile.ends[1] === (socialDifference < 0 ? "communitarian" : "liberal"))).map(profile => profile.id);
  return { status: "complete", answered: 36, politicalCoordinates: { economic, social }, politicalCoordinateProfileIds };
}
