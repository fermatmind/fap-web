import catalog from "./catalog.json";

// Only existing questionnaire adaptations belong in the assessment directory.
// Historical story URLs keep their identity; they are not corresponding tests.
export const isDirectoryQuiz = (slug: string) => slug === "response-color" || slug === "relationship-values";
export const directoryQuizzes = catalog.filter(quiz => isDirectoryQuiz(quiz.slug));

// Existing story identities remain separate from the assessment directory.
export const storyQuizzes = catalog.filter(quiz => !isDirectoryQuiz(quiz.slug));
