import content from "./jungian-archetype.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function jungianArchetypeResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
