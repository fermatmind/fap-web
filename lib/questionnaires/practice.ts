import type { Questionnaire, QuestionnaireAnswers, Text } from "./types";

export type PracticeResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: number;
  practice: {
    correct: number;
    total: number;
    sections: Record<string, { correct: number; total: number }>;
    items: { questionId: string; selectedOptionId: string; correctOptionId: string; correct: boolean }[];
  };
};

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown): value is Text => object(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());

export function isPracticeConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "practice" || !text(quiz.instructions) || !Array.isArray(quiz.questions) || !quiz.questions.length
    || !Array.isArray(quiz.directions) || !quiz.directions.length || !Array.isArray(quiz.profiles)) return false;
  if (!quiz.directions.every(d => object(d) && typeof d.id === "string" && d.id.trim())
    || !quiz.questions.every(q => object(q) && typeof q.id === "string" && q.id.trim() && Array.isArray(q.options)
      && q.options.every(o => object(o) && typeof o.id === "string" && typeof o.directionId === "string"))
    || !quiz.profiles.every(p => object(p) && typeof p.id === "string" && p.id.trim())) return false;
  const ids = new Set(quiz.directions.map(d => d.id));
  if (ids.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (!question.id || !text(question.prompt) || !text(question.explanation) || (question.reverse !== undefined && question.reverse !== false)
      || !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6
      || new Set(question.options.map(o => o.id)).size !== question.options.length
      || typeof question.correctOptionId !== "string" || !question.options.some(o => o.id === question.correctOptionId)) return false;
    const direction = question.options[0].directionId;
    if (!ids.has(direction) || question.options.some(o => !o.id || !text(o.label) || o.directionId !== direction || o.score !== undefined)) return false;
    exposure[direction]++;
  }
  return quiz.directions.every(d => Boolean(d.id) && text(d.title) && Number.isInteger(d.itemCount) && d.itemCount! > 0 && exposure[d.id] === d.itemCount)
    && quiz.profiles.length === quiz.directions.length
    && new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && quiz.directions.every(d => quiz.profiles.filter(p => Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === d.id).length === 1);
}

export function scorePracticeQuestionnaire(quiz: Questionnaire, answers: unknown): PracticeResult {
  if (!isPracticeConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id);
    if (!question || typeof value !== "string" || !question.options.some(o => o.id === value)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  const selected = answers as QuestionnaireAnswers;
  const sections = Object.fromEntries(quiz.directions.map(d => [d.id, { correct: 0, total: d.itemCount! }]));
  const items = quiz.questions.map(question => {
    const correct = selected[question.id] === question.correctOptionId;
    if (correct) sections[question.options[0].directionId].correct++;
    return { questionId: question.id, selectedOptionId: selected[question.id], correctOptionId: question.correctOptionId!, correct };
  });
  return { status: "complete", answered, practice: { correct: items.filter(i => i.correct).length, total: quiz.questions.length, sections, items } };
}
