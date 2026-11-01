import content from "./thinking-approach.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function thinkingApproachResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
