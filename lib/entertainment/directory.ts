import catalog from "./catalog.json";
import directoryCopy from "./directory-copy.json";
import { GLOBAL_HISTORY_MINUTES, GLOBAL_HISTORY_QUESTION_COUNT, GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_UPDATED, GLOBAL_HISTORY_VERSION,
  globalHistoryDescription, globalHistoryTitle } from "./global-history/config";
import type { Copy, FunCard } from "./types";

const directoryDescriptions: Partial<Record<string, Copy>> = directoryCopy;

export function directoryDescription(item: { slug: string; description: Copy }): Copy {
  return directoryDescriptions[item.slug] ?? item.description;
}

export const globalHistoryStory: FunCard = {
  slug: GLOBAL_HISTORY_SLUG, title: globalHistoryTitle, description: globalHistoryDescription,
  version: GLOBAL_HISTORY_VERSION, updated: GLOBAL_HISTORY_UPDATED, category: "fantasy",
  minutes: GLOBAL_HISTORY_MINUTES, questionCount: GLOBAL_HISTORY_QUESTION_COUNT, minQuestionCount: GLOBAL_HISTORY_QUESTION_COUNT,
  resultSlugs: [],
};

// Only existing questionnaire adaptations belong in the assessment directory.
// Historical story URLs keep their identity; they are not corresponding tests.
export const isDirectoryQuiz = (slug: string) => slug === "response-color" || slug === "relationship-values";
export const directoryQuizzes = catalog.filter(quiz => isDirectoryQuiz(quiz.slug));

// Existing story identities remain separate from the assessment directory.
export const storyQuizzes = [globalHistoryStory, ...catalog.filter(quiz => !isDirectoryQuiz(quiz.slug))];
