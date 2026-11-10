import { friendshipFitLandingFaq, friendshipFitLandingSections, friendshipFitLandingReferences } from "@/components/questionnaires/FriendshipFitLandingEditorial";
import { conflictStylesLandingFaq, conflictStylesLandingSections, conflictStylesLandingReferences } from "@/components/questionnaires/ConflictStylesLandingEditorial";
import { apologyLandingFaq, apologyLandingSections } from "@/components/questionnaires/ApologyLandingEditorial";
import { controlLandingFaq, controlLandingSections, controlLandingReferences } from "@/components/questionnaires/EverydayControlLandingEditorial";
import { procrastinationSummaries } from "@/components/questionnaires/ProcrastinationLandingEditorial";
import { timeManagementLandingFaq, timeManagementLandingSections, timeManagementLandingReferences } from "@/components/questionnaires/TimeManagementLandingEditorial";
import { techConfidenceLandingFaq, techConfidenceLandingSections, techConfidenceLandingReferences } from "@/components/questionnaires/TechConfidenceLandingEditorial";
import { gritLandingFaq, gritLandingSections } from "@/components/questionnaires/GritLandingEditorial";
import { growthLandingFaq, growthLandingSections } from "@/components/questionnaires/GrowthLandingEditorial";
import { hexacoLandingFaq, hexacoLandingReferences, hexacoLandingSections } from "@/components/questionnaires/HexacoLandingEditorial";
import { workTraitsLandingFaq, workTraitsLandingSections } from "@/components/questionnaires/WorkTraitsLandingEditorial";
import { strengthsSummaries } from "@/components/questionnaires/StrengthsLandingEditorial";
import { locusLandingFaq, locusLandingSections } from "@/components/questionnaires/LocusLandingEditorial";
import { socialIntelligenceLandingFaq, socialIntelligenceLandingSections } from "@/components/questionnaires/SocialIntelligenceLandingEditorial";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

// The generation check validates this dictionary before the production build.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { units } = require("./likert-questionnaires.generated.json") as { units: TextUnits };

const sources = {
  "friendship-compatibility": {
    reading: "friendship-compatibility",
    attribute: "friendship-compatibility",
    load: () => import("@/lib/questionnaires/result-content/friendship-compatibility.json"),
    editorial: "FriendshipFit",
    prefix: "friendshipFit",
    sections: friendshipFitLandingSections,
    faq: friendshipFitLandingFaq,
  },
  "love-fight-style": {
    reading: "love-fight-style",
    attribute: "love-conflict",
    load: () => import("@/lib/questionnaires/result-content/love-fight-style.json"),
  },
  "conflict-styles": {
    reading: "conflict-styles",
    attribute: "conflict-styles",
    load: () => import("@/lib/questionnaires/result-content/conflict-styles.json"),
    editorial: "ConflictStyles",
    prefix: "conflictStyles",
    sections: conflictStylesLandingSections,
    faq: conflictStylesLandingFaq,
  },
  "apology-language": {
    reading: "apology-language",
    attribute: "apology-language",
    load: () => import("@/lib/questionnaires/result-content/apology-language.json"),
    editorial: "Apology",
    prefix: "apology",
    sections: apologyLandingSections,
    faq: apologyLandingFaq,
  },
  "everyday-control-style": {
    reading: "everyday-control-style",
    attribute: "everyday-control",
    load: () => import("@/lib/questionnaires/result-content/everyday-control-style.json"),
    editorial: "EverydayControl",
    prefix: "control",
    sections: controlLandingSections,
    faq: controlLandingFaq,
  },
  "procrastinator-type-test": {
    reading: "procrastination",
    attribute: "procrastination",
    load: () => import("@/lib/questionnaires/result-content/procrastination.json"),
  },
  "time-management": {
    reading: "time-management",
    attribute: "time-management",
    load: () => import("@/lib/questionnaires/result-content/time-management.json"),
    editorial: "TimeManagement",
    prefix: "timeManagement",
    sections: timeManagementLandingSections,
    faq: timeManagementLandingFaq,
  },
  "tech-savvy": {
    reading: "tech-savvy",
    attribute: "tech-confidence",
    load: () => import("@/lib/questionnaires/result-content/tech-savvy.json"),
    editorial: "TechConfidence",
    prefix: "techConfidence",
    sections: techConfidenceLandingSections,
    faq: techConfidenceLandingFaq,
  },
  "grit-test": {
    reading: "grit",
    attribute: "grit",
    load: () => import("@/lib/questionnaires/result-content/grit.json"),
    editorial: "Grit",
    prefix: "grit",
    sections: gritLandingSections,
    faq: gritLandingFaq,
  },
  "growth-mindset-fixed-mindset": {
    reading: "growth-mindset",
    attribute: "growth-mindset",
    load: () => import("@/lib/questionnaires/result-content/growth-mindset.json"),
    editorial: "Growth",
    prefix: "growth",
    sections: growthLandingSections,
    faq: growthLandingFaq,
  },
  hexaco: {
    reading: "hexaco",
    attribute: "hexaco",
    load: () => import("@/lib/questionnaires/result-content/hexaco.json"),
    editorial: "Hexaco",
    prefix: "hexaco",
    sections: hexacoLandingSections,
    faq: hexacoLandingFaq,
  },
  "work-traits-reflection": {
    reading: "work-traits-reflection",
    attribute: "work-traits",
    load: () => import("@/lib/questionnaires/result-content/work-traits-reflection.json"),
    editorial: "WorkTraits",
    prefix: "workTraits",
    sections: workTraitsLandingSections,
    faq: workTraitsLandingFaq,
  },
  "character-strengths": {
    reading: "character-strengths",
    attribute: "character-strengths",
    load: () => import("@/lib/questionnaires/result-content/character-strengths.json"),
  },
  "locus-of-control": {
    reading: "locus-of-control",
    attribute: "locus",
    load: () => import("@/lib/questionnaires/result-content/locus-of-control.json"),
    editorial: "Locus",
    prefix: "locus",
    sections: locusLandingSections,
    faq: locusLandingFaq,
  },
  empathy: {
    reading: "empathy",
    attribute: "compassion",
    load: () => import("@/lib/questionnaires/result-content/empathy.json"),
  },
  "social-intelligence-test": {
    reading: "social-understanding",
    attribute: "social-understanding",
    load: () => import("@/lib/questionnaires/result-content/social-understanding.json"),
    editorial: "SocialIntelligence",
    prefix: "socialIntelligence",
    sections: socialIntelligenceLandingSections,
    faq: socialIntelligenceLandingFaq,
  },
};

export async function loadTraditionalLikert(slug: string) {
  if (!Object.hasOwn(sources, slug)) return null;
  const edition = sources[slug as keyof typeof sources];
  const [source, { default: resultSource }] = await Promise.all([loadQuestionnaire(slug), edition.load()]);
  if (!source || source.kind !== "likert" || !isQuestionnaireConfigurationValid(source)) return null;
  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  const readings: Record<string, QuestionnaireSection[]> = projectStoryCopy(resultSource, `lib/questionnaires/result-content/${edition.reading}.json`, units);
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: edition.attribute,
    select: item => {
      if (["empathy", "hexaco", "work-traits-reflection", "tech-savvy", "time-management", "everyday-control-style", "apology-language", "conflict-styles", "love-fight-style", "friendship-compatibility"].includes(slug)) return mergeResultReadingParagraphs(item, readings);
      return Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item;
    },
  }));
  const summaries: Record<string, { zh: string; en: string }> = slug === "character-strengths"
    ? projectStoryCopy(strengthsSummaries, "components/questionnaires/StrengthsLandingEditorial.ts/strengthsSummaries", units)
    : slug === "procrastinator-type-test" ? projectStoryCopy(procrastinationSummaries,
      "components/questionnaires/ProcrastinationLandingEditorial.ts/procrastinationSummaries", units) : {};
  const extraReferences = (() => {
    switch (slug) {
      case "hexaco": return projectStoryCopy(hexacoLandingReferences, "components/questionnaires/HexacoLandingEditorial.ts/hexacoLandingReferences", units);
      case "tech-savvy": return projectStoryCopy(techConfidenceLandingReferences, "components/questionnaires/TechConfidenceLandingEditorial.ts/techConfidenceLandingReferences", units);
      case "time-management": return projectStoryCopy(timeManagementLandingReferences, "components/questionnaires/TimeManagementLandingEditorial.ts/timeManagementLandingReferences", units);
      case "everyday-control-style": return projectStoryCopy(controlLandingReferences, "components/questionnaires/EverydayControlLandingEditorial.ts/controlLandingReferences", units);
      case "conflict-styles": return projectStoryCopy(conflictStylesLandingReferences, "components/questionnaires/ConflictStylesLandingEditorial.ts/conflictStylesLandingReferences", units);
      case "friendship-compatibility": return projectStoryCopy(friendshipFitLandingReferences, "components/questionnaires/FriendshipFitLandingEditorial.ts/friendshipFitLandingReferences", units);
      default: return [];
    }
  })();
  if ("editorial" in edition) {
    const editorial = `components/questionnaires/${edition.editorial}LandingEditorial.ts`;
    return { quiz: { ...quiz, profiles }, summaries, extraReferences,
      sections: projectStoryCopy(edition.sections, `${editorial}/${edition.prefix}LandingSections`, units),
      faq: projectStoryCopy(edition.faq, `${editorial}/${edition.prefix}LandingFaq`, units) };
  }
  return { quiz: { ...quiz, profiles }, summaries, extraReferences, sections: [], faq: [] as Questionnaire["faq"] };
}
