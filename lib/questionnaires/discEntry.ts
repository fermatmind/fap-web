import type { Questionnaire } from "./types";
import type { DirectionalQuestionnaire } from "./basicScoring";
import type { QuestionnaireTrackingDefinition } from "./tracking";

export type DiscEntryDefinition = DirectionalQuestionnaire & QuestionnaireTrackingDefinition & Pick<Questionnaire, "version" | "instructions">;

/** Answer/draft identity only; the full current DISC source stays in its selected engine. */
export function discEntryDefinition(quiz: Questionnaire): DiscEntryDefinition {
  return { slug: quiz.slug, kind: quiz.kind, version: quiz.version, code: quiz.code,
    source: { formCode: quiz.source.formCode }, instructions: quiz.instructions,
    questions: quiz.questions, directions: quiz.directions,
    profiles: quiz.profiles.map(({ id, directionIds }) => ({ id, directionIds })),
  };
}
