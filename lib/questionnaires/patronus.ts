import type { Questionnaire, QuestionnaireAnswers } from "./types";
import { selectedChoiceIds } from "./orderedChoices";

export const PATRONUS_DIMENSIONS = ["courage", "care", "insight", "patience", "play", "independence"] as const;
export type PatronusConfiguration = {
  maxima: number[];
  targets: Record<string, number[]>;
  witnesses: Record<string, QuestionnaireAnswers>;
};
export type PatronusResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 20; raw: Record<string, number>;
  distanceUnits: Record<string, number>; minimumDistanceUnits: number; profileIds: string[];
};
export const PATRONUS_DISTANCE_DENOMINATOR = 17 * 17 * 14 * 14;
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

export function isPatronusConfigurationValid(quiz: Questionnaire): boolean {
  const c = quiz.patronus;
  if (quiz.kind !== "patronus20" || quiz.slug !== "patronus-quiz" || !c
    || JSON.stringify(c.maxima) !== JSON.stringify([17, 17, 17, 17, 14, 14])
    || quiz.directions.map(d => d.id).join("|") !== PATRONUS_DIMENSIONS.join("|")
    || quiz.questions.length !== 20 || new Set(quiz.questions.map(q => q.id)).size !== 20
    || quiz.profiles.length !== 40 || new Set(quiz.profiles.map(p => p.id)).size !== 40
    || !record(c.targets) || !record(c.witnesses)) return false;
  const ids = new Set(quiz.profiles.map(p => p.id));
  if (Object.keys(c.targets).length !== 40 || Object.keys(c.witnesses).length !== 40
    || Object.keys(c.targets).some(id => !ids.has(id)) || Object.keys(c.witnesses).some(id => !ids.has(id))
    || new Set(Object.values(c.targets).map(target => JSON.stringify(target))).size !== 40
    || Object.values(c.targets).some(target => !Array.isArray(target) || target.length !== 6
      || target.some((n, i) => !Number.isInteger(n) || n < 0 || n > c.maxima[i]))) return false;
  const exposure = Object.fromEntries(PATRONUS_DIMENSIONS.map(id => [id, 0]));
  let rank = 0, multiple = 0, single = 0;
  for (const q of quiz.questions) {
    if (!q.prompt.en.trim() || !q.prompt.zh.trim() || new Set(q.options.map(o => o.id)).size !== q.options.length
      || q.options.some(o => !o.label.en.trim() || !o.label.zh.trim() || !Object.hasOwn(exposure, o.directionId))) return false;
    if (q.interaction) {
      if (q.interaction !== "rank" && q.interaction !== "multiple") return false;
      if (q.options.length !== 6 || new Set(q.options.map(o => o.directionId)).size !== 6) return false;
      if (q.interaction === "rank") rank++;
      else { multiple++; if (q.minimumSelections !== 0 || q.maximumSelections !== 6 || q.options.some(o => o.score !== 1)) return false; }
    } else {
      single++;
      if (q.options.length !== 4 || new Set(q.options.map(o => o.directionId)).size !== 1
        || [...q.options.map(o => o.score)].sort().join("|") !== "0|1|2|3") return false;
      exposure[q.options[0].directionId]++;
    }
  }
  return rank === 1 && multiple === 3 && single === 16
    && PATRONUS_DIMENSIONS.every((id, i) => exposure[id] === (i < 4 ? 3 : 2));
}

/** Exact integer distances share denominator 56644; every nearest tie is retained. */
export function scorePatronus(quiz: Questionnaire, answers: unknown): PatronusResult {
  if (!isPatronusConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Object.keys(answers).some(id => !quiz.questions.some(q => q.id === id))) return { status: "invalid", answered: 0 };
  const raw = Object.fromEntries(PATRONUS_DIMENSIONS.map(id => [id, 0]));
  let answered = 0;
  for (const q of quiz.questions) {
    if (!Object.hasOwn(answers, q.id)) continue;
    const value = answers[q.id];
    if (typeof value !== "string") return { status: "invalid", answered };
    const selected = selectedChoiceIds(q, value);
    if (selected === null) return { status: "invalid", answered };
    if (selectedChoiceIds(q, value, true) === null) continue;
    answered++;
    selected.forEach((id, position) => {
      const option = q.options.find(o => o.id === id)!;
      raw[option.directionId] += q.interaction === "rank" ? position : option.score!;
    });
  }
  if (answered !== 20) return { status: "incomplete", answered };
  const distanceUnits = Object.fromEntries(quiz.profiles.map(p => [p.id, PATRONUS_DIMENSIONS.reduce((sum, id, i) => {
    const delta = raw[id] - quiz.patronus!.targets[p.id][i];
    return sum + delta * delta * (i < 4 ? 196 : 289);
  }, 0)]));
  const minimumDistanceUnits = Math.min(...Object.values(distanceUnits));
  return { status: "complete", answered: 20, raw, distanceUnits, minimumDistanceUnits,
    profileIds: quiz.profiles.filter(p => distanceUnits[p.id] === minimumDistanceUnits).map(p => p.id) };
}
