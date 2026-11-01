import content from "./ethical-questions.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function ethicalQuestionsResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const sections = profile.sections.map(section => !["counts", "review-privacy"].includes(section.id) ? section : {
    ...section, paragraphs: section.paragraphs.map(paragraph => ({
      ...paragraph,
      zh: paragraph.zh.replace("九节全文", "完整说明"),
      en: paragraph.en.replace("nine-section", "full"),
    })),
  });
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...sections, ...additions] };
}
