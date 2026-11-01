import content from "./social-understanding.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function socialUnderstandingResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const sections = profile.sections.map(section => section.id !== "review-privacy" ? section : {
    ...section, paragraphs: section.paragraphs.map(paragraph => ({
      ...paragraph,
      zh: paragraph.zh.replace("完整九节", "完整说明"),
      en: paragraph.en.replace("All nine sections,", "The full explanation,"),
    })),
  });
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...sections, ...additions] };
}
