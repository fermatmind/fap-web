import content from "./spanish-proficiency.json";
import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection } from "../types";

export function spanishProficiencyResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}

/** Correct the named distractor in both result explanations, preserving source answer authority. */
export function spanishProficiencyResultQuestions(questions: Questionnaire["questions"]): Questionnaire["questions"] {
  let changed = false;
  const prepared = questions.map(question => {
    if (question.id !== "SPANISH_08" || !question.explanation) return question;
    const en = question.explanation.en.replace("The final alternative adds a condition", "Option C adds a condition");
    const zh = question.explanation.zh.replace("最后一项增加了", "C项增加了");
    if (en === question.explanation.en && zh === question.explanation.zh) return question;
    changed = true;
    return { ...question, explanation: { en, zh } };
  });
  return changed ? prepared : questions;
}
