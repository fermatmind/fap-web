import content from "./apocalypse-survival-type-test.json";
import type { QuestionnaireProfile } from "../types";
import { mergeResultReadingParagraphs } from "./prepare-profile";

export function apocalypseStoryResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return mergeResultReadingParagraphs(profile, content);
}
