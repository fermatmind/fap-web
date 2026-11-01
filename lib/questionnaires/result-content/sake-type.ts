import content from "./sake-type.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

const scenes: Record<string, string> = {
  "sparkling-wine": "Suppose you are designing an invitation for a fictional community book swap. A card reveals an unexpected little question first, with the activity details inside. That may be enjoyable, but check whether recipients can tell participation is optional, when it starts and how to join. A playful opening does not replace basic information, and this game has not tested how any real group would respond.",
  "beer": "Imagine writing a notice for a fictional community puzzle swap. Giving the location, explaining that people may simply browse and saying that no items are required makes easy entry concrete. This guarantees no attendance and makes no organiser responsible for everyone’s enjoyment. A person may decline for many reasons; the quiz label cannot establish that the welcome was inadequate.",
  "whisky": "Suppose you are writing a booklet for a fictional community exhibition. An early illustration of an old door number echoes a later invented story about neighbourhood change. The connection may make reading enjoyable, while another reader may simply want to know the exhibition route. Check whether the link helps this material rather than deciding its creator is deeper than someone who gives plain information.",
  "sake": "Imagine arranging a fictional community message corner. One card, a short prompt and blank space around it might be enough for the idea. Check whether people can find the prompt, understand they need not write anything and use the space comfortably. Less content is not automatically considerate. A real space would require hearing from its users rather than assuming the quiz label proves their needs have been considered."
};

export function sakeResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: profile.sections.map(section => {
    const paragraphs = section.id === "scene" ? section.paragraphs.map((text, index) => index === 0 ? { ...text, en: scenes[profile.id] } : text) : section.paragraphs;
    const addition = additions.find(item => item.id === section.id);
    return addition ? { ...section, paragraphs: [...paragraphs, ...addition.paragraphs] } : section;
  }) };
}
