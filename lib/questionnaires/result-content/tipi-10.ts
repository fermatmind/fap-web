import { correctTipiMidpoint } from "./tipi-midpoint";
import content from "./tipi-10.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function tipiResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  profile = correctTipiMidpoint(profile);
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: profile.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  }) };
}
