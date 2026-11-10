import content from "./big-fish-energy-test.json";
import type { QuestionnaireProfile } from "../types";
import { mergeResultReadingParagraphs } from "./prepare-profile";

export function bigFishEnergyResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return mergeResultReadingParagraphs(profile, content);
}
