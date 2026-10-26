import type { Questionnaire } from "./types";

export type CompassResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: number;
  counts: Record<string, number>;
  leaders: string[];
  neighbours: Record<string, string | null>;
  compassProfileIds: string[];
};
const perpendicular: Record<string, readonly string[]> = {
  north: ["east", "west"], south: ["east", "west"],
  east: ["north", "south"], west: ["north", "south"],
};
const directions = Object.keys(perpendicular);
const profileIds = directions.flatMap(id => [id, ...perpendicular[id].map(neighbour => `${id}-${neighbour}`)]);

// Closed original form and editorial reading rule, not the official PCTI instrument.
export function isCompassConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "compass" || quiz.code !== "COMPASS_ORIGINAL_CROSS_AXIS"
    || quiz.source.formCode !== "fm_compass_original_choices_36" || quiz.source.scoringVersion !== "1.0.0"
    || !quiz.instructions || quiz.questions.length !== 36 || quiz.directions.length !== 4 || quiz.profiles.length !== 12) return false;
  if (new Set(quiz.directions.map(d => d.id)).size !== 4
    || !quiz.directions.every(d => directions.includes(d.id) && d.comparisons === 36)
    || new Set(quiz.questions.map(q => q.id)).size !== 36) return false;
  const positions = Object.fromEntries(directions.map(id => [id, [0, 0, 0, 0]]));
  for (const [index, question] of quiz.questions.entries()) {
    if (question.id !== `COMP_${String(index + 1).padStart(2, "0")}` || question.reverse !== undefined
      || question.options.length !== 4 || new Set(question.options.map(o => o.id)).size !== 4
      || new Set(question.options.map(o => o.directionId)).size !== 4) return false;
    for (const [position, option] of question.options.entries()) {
      if (!directions.includes(option.directionId) || option.score !== undefined) return false;
      positions[option.directionId][position]++;
    }
  }
  return directions.every(id => positions[id].every(count => count === 9))
    && new Set(quiz.profiles.map(p => p.id)).size === 12
    && quiz.profiles.every(p => profileIds.includes(p.id) && p.directionIds.join("-") === p.id
      && p.directionIds.length === p.id.split("-").length);
}

export function scoreCompassQuestionnaire(quiz: Questionnaire, answers: unknown): CompassResult {
  if (!isCompassConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (answers === null || typeof answers !== "object"
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts: Record<string, number> = Object.fromEntries(directions.map(id => [id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++; answered++;
  }
  if (answered !== 36) return { status: "incomplete", answered };
  const maximum = Math.max(...Object.values(counts));
  const leaders = directions.filter(id => counts[id] === maximum);
  const neighbours: Record<string, string | null> = {};
  const matches = new Set(leaders.map(id => {
    const [a, b] = perpendicular[id];
    const neighbour = counts[a] === counts[b] ? null : counts[a] > counts[b] ? a : b;
    neighbours[id] = neighbour;
    return neighbour === null ? id : `${id}-${neighbour}`;
  }));
  return { status: "complete", answered, counts, leaders, neighbours, compassProfileIds: quiz.profiles.filter(p => matches.has(p.id)).map(p => p.id) };
}
