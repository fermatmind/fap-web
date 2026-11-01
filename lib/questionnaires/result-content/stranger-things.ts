import content from "./stranger-things.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function strangerThingsResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
