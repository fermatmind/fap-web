import content from "./dark-triad.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function darkTriadResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const sections = profile.sections.map(section => !["scoring", "privacy"].includes(section.id) ? section : {
    ...section, paragraphs: section.paragraphs.map(paragraph => ({
      ...paragraph,
      zh: paragraph.zh.replace("三份九节说明", "三份完整说明").replace("三份九节全文", "三份完整说明"),
      en: paragraph.en.replace("nine-section", "full"),
    })),
  });
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...sections, ...additions] };
}
