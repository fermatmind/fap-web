import type { Questionnaire } from "./types";

export type EightValuesAxis = "econ" | "dipl" | "govt" | "scty";
export type EightValuesEffects = Record<EightValuesAxis, number>;
export type EightValuesConfiguration = { upstreamCommit: string; effects: Record<string, EightValuesEffects> };
export type EightValuesResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: number;
  eightValuesAxes: Record<EightValuesAxis, { sum: number; maximum: number; percentage: number; complement: number }>;
};
export const eightValuesPairs = [
  { axis: "econ", positive: "equality", negative: "markets", maximum: 195 },
  { axis: "dipl", positive: "globe", negative: "nation", maximum: 225 },
  { axis: "govt", positive: "liberty", negative: "authority", maximum: 320 },
  { axis: "scty", positive: "progress", negative: "tradition", maximum: 292 },
] as const;
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const multipliers = [-1, -0.5, 0, 0.5, 1] as const;

// Closed adaptation of the pinned MIT 8values bank; never a generic political classification engine.
export function isEightValuesConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "eight-values" || quiz.code !== "FM_EIGHT_VALUES_MIT_70"
    || quiz.source.formCode !== "fm_8values_upstream3971_70_enzh_v1"
    || quiz.source.scoringVersion !== "8values_3971_signed_weights_v1"
    || quiz.eightValues?.upstreamCommit !== "3971ed8bc0c3dda18f9b001013327f382343b74f"
    || !quiz.instructions || quiz.questions.length !== 70 || quiz.directions.length !== 4 || quiz.profiles.length !== 8
    || !object(quiz.eightValues.effects) || Object.keys(quiz.eightValues.effects).length !== 70) return false;
  const sums = { econ: 0, dipl: 0, govt: 0, scty: 0 };
  for (const [index, question] of quiz.questions.entries()) {
    if (question.id !== `E8_${String(index + 1).padStart(3, "0")}` || question.reverse !== undefined
      || question.correctOptionId !== undefined || question.options.length !== 5) return false;
    for (const [position, option] of question.options.entries()) {
      if (option.id !== String(position + 1) || option.directionId !== "values" || option.score !== multipliers[position]) return false;
    }
    const effects = quiz.eightValues.effects[question.id];
    if (!object(effects) || Object.keys(effects).length !== 4) return false;
    for (const { axis } of eightValuesPairs) {
      const weight = effects[axis];
      if (typeof weight !== "number" || !Number.isInteger(weight) || ![0, 2, 5, 10].includes(Math.abs(weight))) return false;
      sums[axis] += Math.abs(weight);
    }
  }
  return new Set(quiz.directions.map(d => d.id)).size === 4
    && new Set(quiz.profiles.map(p => p.id)).size === 8
    && eightValuesPairs.every(({ axis, positive, negative, maximum }) => sums[axis] === maximum
      && quiz.directions.some(d => d.id === axis)
      && [positive, negative].every(id => quiz.profiles.some(p => p.id === id && p.directionIds.length === 1 && p.directionIds[0] === axis)));
}

export function scoreEightValuesQuestionnaire(quiz: Questionnaire, answers: unknown): EightValuesResult {
  if (!isEightValuesConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const sums = { econ: 0, dipl: 0, govt: 0, scty: 0 };
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option || typeof option.score !== "number") return { status: "invalid", answered };
    const effects = quiz.eightValues!.effects[id];
    for (const { axis } of eightValuesPairs) sums[axis] += option.score * effects[axis];
    answered++;
  }
  if (answered !== 70) return { status: "incomplete", answered };
  const eightValuesAxes = Object.fromEntries(eightValuesPairs.map(({ axis, maximum }) => {
    // Preserve the upstream pure normalization and displayed complement, including decimal rounding.
    const percentage = Number((100 * (maximum + sums[axis]) / (2 * maximum)).toFixed(1));
    return [axis, { sum: sums[axis], maximum, percentage, complement: Number((100 - percentage).toFixed(1)) }];
  })) as Extract<EightValuesResult, { status: "complete" }>["eightValuesAxes"];
  return { status: "complete", answered, eightValuesAxes };
}
