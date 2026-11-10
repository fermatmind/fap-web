import content from "./villain-era-archetype-test.json";
import type { QuestionnaireProfile } from "../types";
import { mergeResultReadingParagraphs } from "./prepare-profile";

export function villainEraResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return mergeResultReadingParagraphs(profile, content);
}
