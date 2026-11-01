import content from "./social-battery.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

/** These additions interpret separate self-reports; they never turn means into a type or total. */
export function socialBatteryResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}
