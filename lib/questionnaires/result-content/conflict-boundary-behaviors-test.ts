import { correctConflictReadingPrivacy } from "./conflict-boundary-privacy";
import content from "./conflict-boundary-behaviors-test.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function conflictBoundaryResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  const current = correctConflictReadingPrivacy(profile);
  return { ...current, sections: current.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  }) };
}
