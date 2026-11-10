import content from "./delulu.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function deluluResultSections(sections: QuestionnaireSection[]): QuestionnaireSection[] {
  const revised = sections.map(section => {
    if (!["scoring", "archetype-counts", "archetype-ties"].includes(section.id)) return section;
    const paragraphs = section.paragraphs.map(p => ({
      ...p,
      zh: p.zh.replaceAll("各自九节全文", "各自完整说明").replaceAll("六份54模块", "六份完整说明")
        .replaceAll("各自九節全文", "各自完整說明").replaceAll("六份54模組", "六份完整說明"),
      en: p.en.replaceAll("nine-section guide", "full guide").replaceAll("six full guides with fifty-four sections", "six full guides").replaceAll("all six guides and 54 sections", "all six complete guides"),
    }));
    return paragraphs.every((p, i) => p.zh === section.paragraphs[i].zh && p.en === section.paragraphs[i].en) ? section : { ...section, paragraphs };
  });
  return revised.every((section, i) => section === sections[i]) ? sections : revised;
}

export function deluluResultProfile(profile: QuestionnaireProfile, readings: Record<string, QuestionnaireSection[]> = content): QuestionnaireProfile {
  if (!Object.hasOwn(readings, profile.id)) return profile;
  const additions = readings[profile.id];
  return { ...profile, sections: [...deluluResultSections(profile.sections), ...additions] };
}
