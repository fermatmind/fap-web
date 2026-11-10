import content from "./decade-aesthetic-test.json";
import type { QuestionnaireProfile } from "../types";
import { mergeResultReadingParagraphs } from "./prepare-profile";

export function decadeAestheticResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return mergeResultReadingParagraphs(profile, content);
}
