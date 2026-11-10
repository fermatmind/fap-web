import content from "./euphoria-character-quiz.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function euphoriaResultProfile(
  profile: QuestionnaireProfile,
  source: Record<string, QuestionnaireSection[]> = content,
): QuestionnaireProfile {
  if (!Object.hasOwn(source, profile.id)) return profile;
  const additions = source[profile.id];
  return { ...profile, sections: profile.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  }) };
}
