import type { Questionnaire } from "./types";

export type AlignmentResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: number;
  counts: Record<string, number>;
  alignmentIds: string[];
};

const order = ["chaotic", "order-neutral", "lawful"];
const morality = ["evil", "moral-neutral", "good"];
const endpoints = ["lawful", "chaotic", "good", "evil"];
const pairKey = (ids: string[]) => [...ids].sort().join("|");

// Fixed method for this original 24-item form, not general D&D scoring or validated cutoffs.
export function isAlignmentConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "alignment" || quiz.source.formCode !== "fm_moral_alignment_choices_24"
    || quiz.source.scoringVersion !== "1.0.0" || !quiz.instructions || quiz.questions.length !== 24
    || quiz.directions.length !== 4 || quiz.profiles.length !== 9) return false;
  if (new Set(quiz.directions.map(d => d.id)).size !== 4
    || !quiz.directions.every(d => endpoints.includes(d.id) && d.comparisons === 12)
    || new Set(quiz.questions.map(q => q.id)).size !== 24) return false;
  const exposure: Record<string, number> = Object.fromEntries(endpoints.map(id => [id, 0]));
  for (const question of quiz.questions) {
    if (question.reverse !== undefined || question.options.length !== 2
      || new Set(question.options.map(o => o.id)).size !== 2
      || question.options.some(o => o.score !== undefined)
      || !["chaotic|lawful", "evil|good"].includes(pairKey(question.options.map(o => o.directionId)))) return false;
    for (const option of question.options) exposure[option.directionId]++;
  }
  const combinations = new Set(order.flatMap(a => morality.map(b => pairKey([a, b]))));
  return endpoints.every(id => exposure[id] === 12)
    && new Set(quiz.profiles.map(p => p.id)).size === 9
    && new Set(quiz.profiles.map(p => pairKey(p.directionIds))).size === 9
    && quiz.profiles.every(p => p.directionIds.length === 2 && combinations.has(pairKey(p.directionIds)));
}

function bands(count: number, ids: string[]): string[] {
  if (count <= 3) return [ids[0]];
  if (count === 4) return ids.slice(0, 2);
  if (count <= 7) return [ids[1]];
  if (count === 8) return ids.slice(1);
  return [ids[2]];
}

export function scoreAlignmentQuestionnaire(quiz: Questionnaire, answers: unknown): AlignmentResult {
  if (!isAlignmentConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (answers === null || typeof answers !== "object"
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers))) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts: Record<string, number> = Object.fromEntries(endpoints.map(id => [id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++; answered++;
  }
  if (answered !== 24) return { status: "incomplete", answered };
  const matches = new Set(bands(counts.lawful, order).flatMap(a => bands(counts.good, morality).map(b => pairKey([a, b]))));
  return { status: "complete", answered, counts, alignmentIds: quiz.profiles.filter(p => matches.has(pairKey(p.directionIds))).map(p => p.id) };
}
