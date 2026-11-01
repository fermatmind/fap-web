import content from "./space-marine-chapter.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function spaceMarineChapterResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
