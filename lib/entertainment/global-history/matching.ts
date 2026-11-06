import { historyAxes, historyScenes } from "./questions";
import type { HistoryPerson } from "./people";

export function isHistoryVector(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === historyAxes.length
    && value.every(score => Number.isInteger(score) && score >= 0 && score <= 6);
}

export function historyAnswerVector(answers: unknown): number[] | null {
  if (!Array.isArray(answers) || answers.length !== historyScenes.length) return null;
  const vector = historyAxes.map(() => 0);
  for (const [index, scene] of historyScenes.entries()) {
    const choice = answers[index];
    if (typeof choice !== "number" || !Number.isInteger(choice) || choice < 0 || choice >= scene.options.length) return null;
    vector[scene.axis] += scene.options[choice][0];
  }
  return vector;
}

export function closestHistoryPerson(vector: readonly number[], people: readonly HistoryPerson[]) {
  let best: HistoryPerson | undefined;
  let bestDistance = Infinity;
  let bestExact = -1;
  for (const person of people) {
    let distance = 0;
    let exact = 0;
    for (const [index, score] of vector.entries()) {
      const difference = score - person.vector[index];
      distance += difference * difference;
      if (difference === 0) exact++;
    }
    if (!best || distance < bestDistance || (
      distance === bestDistance && (exact > bestExact || (exact === bestExact && person.id < best.id))
    )) {
      best = person;
      bestDistance = distance;
      bestExact = exact;
    }
  }
  return best;
}

export function historyProfileHighlights(vector: readonly number[]) {
  return historyAxes.map((axis, index) => ({ axis, index, score: vector[index] }))
    .sort((a, b) => Math.abs(b.score - 3) - Math.abs(a.score - 3))
    .filter(item => item.score !== 3)
    .slice(0, 3)
    .map(({ axis, score }) => score < 3 ? axis.low : axis.high);
}
