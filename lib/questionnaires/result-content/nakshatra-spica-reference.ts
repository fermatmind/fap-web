import content from "./nakshatra-spica-reference.json";
import { correctPairedFigure } from "./nakshatra-paired-figure";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function nakshatraSpicaResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  const publicProfile = correctPairedFigure(profile);
  return { ...publicProfile, sections: publicProfile.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  }) };
}
