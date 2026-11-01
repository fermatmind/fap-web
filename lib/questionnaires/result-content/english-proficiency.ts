import content from "./english-proficiency.json";
import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection } from "../types";

export function englishProficiencyResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}

/** Clarify two distractor letters in the English review copy; preserve source keys and prompts. */
export function englishProficiencyResultQuestions(questions: Questionnaire["questions"]): Questionnaire["questions"] {
  let changed = false;
  const prepared = questions.map(question => {
    if (question.id !== "ENGLISH_20" || !question.explanation?.en.includes("The first and last alternatives assume an answer")) return question;
    changed = true;
    return { ...question, explanation: { ...question.explanation, en: question.explanation.en.replace("The first and last alternatives assume an answer", "Options A and C assume an answer") } };
  });
  return changed ? prepared : questions;
}
