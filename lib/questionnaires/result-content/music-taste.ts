import content from "./music-taste.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function musicTasteResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
