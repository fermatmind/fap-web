import { prepareSelectedResultProfile } from "./prepare-profile";
import content from "./cognitive-functions-test.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function cognitiveFunctionsResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: profile.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  }) };
}

export const cognitiveFunctionsReading = { attribute: "cognitive-functions", select: cognitiveFunctionsResultProfile };

export function prepareCognitiveFunctionsResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return prepareSelectedResultProfile("cognitive-functions-test", profile, cognitiveFunctionsReading);
}
