import content from "./ginny-georgia.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function ginnyGeorgiaResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
