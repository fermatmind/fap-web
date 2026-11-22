import type { Questionnaire } from "@/lib/questionnaires/types";

export function bindFacetSampleAnswers(quiz: Questionnaire, answers: string) {
  if (answers.length !== quiz.questions.length) throw new Error(`Invalid sample length for ${quiz.slug}`);
  return Object.fromEntries(quiz.questions.map((question, index) => [
    question.id, answers[index] === "N" ? "na" : answers[index],
  ]));
}
