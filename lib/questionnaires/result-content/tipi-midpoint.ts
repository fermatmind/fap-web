import type { QuestionnaireProfile } from "../types";

/** Source anchor four is neutral, never moderate agreement. Preserve source data. */
export function correctTipiMidpoint(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (profile.id !== "conscientiousness-reading") return profile;
  let changed = false;
  const sections = profile.sections.map(section => {
    if (section.id !== "conscientiousness-4") return section;
    const paragraphs = section.paragraphs.map(paragraph => {
      const zh = paragraph.zh.replace("后者可能是对两对都中度认同。", "后者两次选择“既不同意也不赞同”的中点。");
      const en = paragraph.en.replace("The second may reflect moderate endorsement of both pairs.", "The second selects neither agree nor disagree for both pairs.");
      if (zh === paragraph.zh && en === paragraph.en) return paragraph;
      changed = true;
      return { ...paragraph, zh, en };
    });
    return { ...section, paragraphs };
  });
  return changed ? { ...profile, sections } : profile;
}
