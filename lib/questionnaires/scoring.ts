import type { Questionnaire, QuestionnaireAnswers } from "./types";

export type DirectionalResult = {
  status: "incomplete" | "invalid" | "unavailable";
  answered: number;
} | {
  status: "complete";
  answered: number;
  counts: Record<string, number>;
  leaders: string[];
  profileId: string;
};
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const key = (ids: string[]) => [...ids].sort().join("|");

export function isDirectionalConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "directional" || !quiz.questions.length || quiz.directions.length < 2) return false;
  const directions = new Set(quiz.directions.map(d => d.id));
  if (directions.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (question.options.length !== 2 || new Set(question.options.map(o => o.id)).size !== 2 || new Set(question.options.map(o => o.directionId)).size !== 2) return false;
    for (const option of question.options) {
      if (!directions.has(option.directionId)) return false;
      exposure[option.directionId]++;
    }
  }
  if (quiz.directions.some(d => exposure[d.id] !== d.comparisons)) return false;
  const combinations = quiz.profiles.map(p => key(p.directionIds));
  return new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && new Set(combinations).size === quiz.profiles.length
    && quiz.profiles.every(p => p.directionIds.length > 0 && new Set(p.directionIds).size === p.directionIds.length && p.directionIds.every(id => directions.has(id)));
}

export function scoreDirectionalQuestionnaire(quiz: Questionnaire, answers: unknown): DirectionalResult {
  if (!isDirectionalConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++;
    answered++;
  }
  // Partial counts never produce a ranked or interpreted result.
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  const highest = Math.max(...Object.values(counts));
  const leaders = quiz.directions.filter(d => counts[d.id] === highest).map(d => d.id);
  const profile = quiz.profiles.find(p => key(p.directionIds) === key(leaders));
  return profile ? { status: "complete", answered, counts, leaders, profileId: profile.id } : { status: "unavailable", answered };
}

export function readQuestionnaireDraft(quiz: Questionnaire, raw: string | null, now = Date.now()): QuestionnaireAnswers | null {
  if (!raw) return null;
  try {
    const draft: unknown = JSON.parse(raw);
    if (!object(draft) || draft.version !== quiz.version || typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) return null;
    const age = now - draft.savedAt;
    if (age < 0 || age >= 24 * 60 * 60 * 1000 || !object(draft.answers)) return null;
    const result = scoreDirectionalQuestionnaire(quiz, draft.answers);
    return result.status === "complete" || result.status === "incomplete" ? draft.answers as QuestionnaireAnswers : null;
  } catch { return null; }
}
