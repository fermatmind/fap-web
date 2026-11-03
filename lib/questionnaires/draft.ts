import type { Questionnaire, QuestionnaireAnswers } from "./types";

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

export function readQuestionnaireDraftWithScorer(quiz: Questionnaire, raw: string | null, score: (quiz: Questionnaire, answers: unknown) => { status: string }, now = Date.now()): QuestionnaireAnswers | null {
  if (!raw || quiz.kind === "afqt32" || quiz.kind === "anger20" || quiz.kind === "sens16" || quiz.kind === "dvmsq18" || quiz.kind === "synes15" || quiz.kind === "imagery12" || quiz.kind === "imposter20" || quiz.kind === "catq25" || quiz.kind === "most-least" || quiz.kind === "mini-orientation" || quiz.kind === "stress-reflection4" || quiz.kind === "pss4" || quiz.kind === "four-axes" || quiz.kind === "natal-chart" || quiz.kind === "fscrs22" || quiz.kind === "typing" || quiz.kind === "data-entry") return null;
  try {
    const draft: unknown = JSON.parse(raw);
    if (!object(draft) || draft.version !== quiz.version || typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) return null;
    const age = now - draft.savedAt;
    if (age < 0 || age >= 24 * 60 * 60 * 1000 || !object(draft.answers)) return null;
    const result = score(quiz, draft.answers);
    return result.status === "complete" || result.status === "incomplete" ? draft.answers as QuestionnaireAnswers : null;
  } catch { return null; }
}
