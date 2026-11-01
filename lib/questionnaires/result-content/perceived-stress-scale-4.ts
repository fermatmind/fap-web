import content from "./perceived-stress-scale-4.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function pss4ResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: profile.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  }) };
}
