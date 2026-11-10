import content from "./euphoria-character-quiz.json";
import type { QuestionnaireProfile } from "../types";
import { mergeResultReadingParagraphs } from "./prepare-profile";

export function euphoriaResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return mergeResultReadingParagraphs(profile, content);
}
