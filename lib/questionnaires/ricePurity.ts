import type { Questionnaire } from "./types";

export function isRice100ConfigurationValid(quiz: Questionnaire): boolean {
  return quiz.kind === "rice100" && quiz.slug === "rice-purity-test"
    && quiz.questions.length === 100 && new Set(quiz.questions.map(q => q.id)).size === 100
    && quiz.questions.every(q => /^experience-\d{3}$/.test(q.id)
      && q.prompt.en.trim() && q.prompt.zh.trim() && q.experienceCategory?.en.trim()
      && q.experienceCategory.zh.trim() && q.options.length === 0)
    && quiz.profiles.length === 1 && quiz.profiles[0].id === "score-reading";
}

/** An unchecked item may be skipped. It is never counted as an answered item. */
export function scoreRiceSelections(quiz: Questionnaire, selected: readonly string[]): { score: number; checked: number } | null {
  if (!isRice100ConfigurationValid(quiz) || !Array.isArray(selected)) return null;
  const valid = new Set(quiz.questions.map(q => q.id));
  if (new Set(selected).size !== selected.length || selected.some(id => !valid.has(id))) return null;
  return { score: 100 - selected.length, checked: selected.length };
}
