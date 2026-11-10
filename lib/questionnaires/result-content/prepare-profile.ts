import type { QuestionnaireProfile, QuestionnaireSection, Text } from "../types";

export type ResultReadingDefinition = {
  attribute: string;
  select: (profile: QuestionnaireProfile) => QuestionnaireProfile;
  note?: Text;
  references?: { title: Text; url: string }[];
};

/** The same identity and materialisation rules for server and selected-edition clients. */
export function prepareSelectedResultProfile(quizSlug: string, profile: QuestionnaireProfile, definition?: ResultReadingDefinition): QuestionnaireProfile {
  if (profile.resultReading?.quizSlug === quizSlug && profile.resultReading.profileId === profile.id) return profile;
  if (!definition) return profile;
  const selected = definition.select(profile);
  if (selected === profile) return profile;
  return { ...selected, resultReading: {
    quizSlug, profileId: profile.id, attribute: definition.attribute,
    ...(definition.note ? { note: definition.note } : {}),
    ...(definition.references ? { references: definition.references } : {}),
  } };
}


export function mergeResultReadingParagraphs(
  profile: QuestionnaireProfile,
  source: Record<string, QuestionnaireSection[]>,
): QuestionnaireProfile {
  if (!Object.hasOwn(source, profile.id)) return profile;
  const additions = source[profile.id];
  const sections = profile.sections.map(section => {
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
  });
  return { ...profile, sections };
}
