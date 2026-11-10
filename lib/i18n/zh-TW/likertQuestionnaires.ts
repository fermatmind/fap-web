import { humorSummaries } from "@/components/questionnaires/HumorLandingEditorial";
import { socialBatteryFaq, socialBatterySections, socialBatterySummaries } from "@/components/questionnaires/SocialBatteryLandingEditorial";
import { culturalFaq, culturalSections, culturalExtraReferences, culturalSummaries } from "@/components/questionnaires/CulturalDimensionsLandingEditorial";
import { socialAttitudesLandingFaq, socialAttitudesLandingSections, socialAttitudesLandingReferences } from "@/components/questionnaires/SocialAttitudesLandingEditorial";
import { interpersonalLandingFaq, interpersonalLandingSections } from "@/components/questionnaires/InterpersonalLandingEditorial";
import { competencyLandingFaq, competencyLandingSections, competencyLandingReferences } from "@/components/questionnaires/CompetencyLandingEditorial";
import { cultureFitFaq, cultureFitSections, cultureFitSummaries } from "@/components/questionnaires/CultureFitLandingEditorial";
import { workEthicsFaq, workEthicsSections, workEthicsSummaries } from "@/components/questionnaires/WorkEthicsLandingEditorial";
import { workActivityLandingFaq, workActivityLandingSections, workActivityLandingReferences } from "@/components/questionnaires/WorkActivityLandingEditorial";
import { commitmentLandingFaq, commitmentLandingSections, commitmentLandingReferences } from "@/components/questionnaires/CommitmentLandingEditorial";
import { intimacyValuesLandingFaq, intimacyValuesLandingSections, intimacyValuesLandingReferences } from "@/components/questionnaires/IntimacyValuesLandingEditorial";
import { datingOutlookLandingFaq, datingOutlookLandingSections, datingOutlookLandingReferences } from "@/components/questionnaires/DatingOutlookLandingEditorial";
import { relationshipHabitsLandingFaq, relationshipHabitsLandingSections, relationshipHabitsLandingReferences } from "@/components/questionnaires/RelationshipHabitsLandingEditorial";
import { relationshipWorryLandingFaq, relationshipWorryLandingSections, relationshipWorryLandingReferences } from "@/components/questionnaires/RelationshipWorryLandingEditorial";
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
  "humor-style-test": {
    reading: "humor-style",
    attribute: "humor-style",
    load: () => import("@/lib/questionnaires/result-content/humor-style.json"),
  },
  "social-battery-test": {
    reading: "social-battery",
    attribute: "social-battery",
    load: () => import("@/lib/questionnaires/result-content/social-battery.json"),
    editorial: "SocialBattery",
    prefix: "socialBattery",
    sections: socialBatterySections,
    faq: socialBatteryFaq,
    summaries: socialBatterySummaries,
  },
  "cultural-dimensions": {
    reading: "cultural-dimensions",
    attribute: "cultural-dimensions",
    load: () => import("@/lib/questionnaires/result-content/cultural-dimensions.json"),
    editorial: "CulturalDimensions",
    prefix: "cultural",
    sections: culturalSections,
    faq: culturalFaq,
    summaries: culturalSummaries,
  },
  "social-attitudes-reflection": {
    reading: "social-attitudes-reflection",
    attribute: "social-attitudes",
    load: () => import("@/lib/questionnaires/result-content/social-attitudes-reflection.json"),
    editorial: "SocialAttitudes",
    prefix: "socialAttitudesLanding",
    sections: socialAttitudesLandingSections,
    faq: socialAttitudesLandingFaq,
  },
  "interpersonal-preferences": {
    reading: "interpersonal-preferences",
    attribute: "interpersonal-preferences",
    load: () => import("@/lib/questionnaires/result-content/interpersonal-preferences.json"),
    editorial: "Interpersonal",
    prefix: "interpersonalLanding",
    sections: interpersonalLandingSections,
    faq: interpersonalLandingFaq,
  },
  "competency-test": {
    reading: "competency-test",
    attribute: "work-behavior",
    load: () => import("@/lib/questionnaires/result-content/competency-test.json"),
    editorial: "Competency",
    prefix: "competencyLanding",
    sections: competencyLandingSections,
    faq: competencyLandingFaq,
  },
  "culture-fit": {
    reading: "culture-fit",
    attribute: "culture-fit",
    load: () => import("@/lib/questionnaires/result-content/culture-fit.json"),
    editorial: "CultureFit",
    prefix: "cultureFit",
    sections: cultureFitSections,
    faq: cultureFitFaq,
    summaries: cultureFitSummaries,
  },
  "work-ethics": {
    reading: "work-ethics",
    attribute: "work-ethics",
    load: () => import("@/lib/questionnaires/result-content/work-ethics.json"),
    editorial: "WorkEthics",
    prefix: "workEthics",
    sections: workEthicsSections,
    faq: workEthicsFaq,
    summaries: workEthicsSummaries,
  },
  "work-activity-interests": {
    reading: "work-activity-interests",
    attribute: "work-activity",
    load: () => import("@/lib/questionnaires/result-content/work-activity-interests.json"),
    editorial: "WorkActivity",
    prefix: "workActivityLanding",
    sections: workActivityLandingSections,
    faq: workActivityLandingFaq,
  },
  "relationship-commitment": {
    reading: "relationship-commitment",
    attribute: "relationship-commitment",
    load: () => import("@/lib/questionnaires/result-content/relationship-commitment.json"),
    editorial: "Commitment",
    prefix: "commitmentLanding",
    sections: commitmentLandingSections,
    faq: commitmentLandingFaq,
  },
  "intimacy-values": {
    reading: "intimacy-values",
    attribute: "intimacy-values",
    load: () => import("@/lib/questionnaires/result-content/intimacy-values.json"),
    editorial: "IntimacyValues",
    prefix: "intimacyValuesLanding",
    sections: intimacyValuesLandingSections,
    faq: intimacyValuesLandingFaq,
  },
  "dating-outlook": {
    reading: "dating-outlook",
    attribute: "dating-outlook",
    load: () => import("@/lib/questionnaires/result-content/dating-outlook.json"),
    editorial: "DatingOutlook",
    prefix: "datingOutlookLanding",
    sections: datingOutlookLandingSections,
    faq: datingOutlookLandingFaq,
  },
  "relationship-habits": {
    reading: "relationship-habits",
    attribute: "relationship-habits",
    load: () => import("@/lib/questionnaires/result-content/relationship-habits.json"),
    editorial: "RelationshipHabits",
    prefix: "relationshipHabitsLanding",
    sections: relationshipHabitsLandingSections,
    faq: relationshipHabitsLandingFaq,
  },
  "relationship-worry-habits": {
    reading: "relationship-worry-habits",
    attribute: "relationship-worry-habits",
    load: () => import("@/lib/questionnaires/result-content/relationship-worry-habits.json"),
    editorial: "RelationshipWorry",
    prefix: "relationshipWorryLanding",
    sections: relationshipWorryLandingSections,
    faq: relationshipWorryLandingFaq,
  },
  "friendship-compatibility": {
    reading: "friendship-compatibility",
    attribute: "friendship-compatibility",
    load: () => import("@/lib/questionnaires/result-content/friendship-compatibility.json"),
    editorial: "FriendshipFit",
    prefix: "friendshipFitLanding",
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
    prefix: "conflictStylesLanding",
    sections: conflictStylesLandingSections,
    faq: conflictStylesLandingFaq,
  },
  "apology-language": {
    reading: "apology-language",
    attribute: "apology-language",
    load: () => import("@/lib/questionnaires/result-content/apology-language.json"),
    editorial: "Apology",
    prefix: "apologyLanding",
    sections: apologyLandingSections,
    faq: apologyLandingFaq,
  },
  "everyday-control-style": {
    reading: "everyday-control-style",
    attribute: "everyday-control",
    load: () => import("@/lib/questionnaires/result-content/everyday-control-style.json"),
    editorial: "EverydayControl",
    prefix: "controlLanding",
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
    prefix: "timeManagementLanding",
    sections: timeManagementLandingSections,
    faq: timeManagementLandingFaq,
  },
  "tech-savvy": {
    reading: "tech-savvy",
    attribute: "tech-confidence",
    load: () => import("@/lib/questionnaires/result-content/tech-savvy.json"),
    editorial: "TechConfidence",
    prefix: "techConfidenceLanding",
    sections: techConfidenceLandingSections,
    faq: techConfidenceLandingFaq,
  },
  "grit-test": {
    reading: "grit",
    attribute: "grit",
    load: () => import("@/lib/questionnaires/result-content/grit.json"),
    editorial: "Grit",
    prefix: "gritLanding",
    sections: gritLandingSections,
    faq: gritLandingFaq,
  },
  "growth-mindset-fixed-mindset": {
    reading: "growth-mindset",
    attribute: "growth-mindset",
    load: () => import("@/lib/questionnaires/result-content/growth-mindset.json"),
    editorial: "Growth",
    prefix: "growthLanding",
    sections: growthLandingSections,
    faq: growthLandingFaq,
  },
  hexaco: {
    reading: "hexaco",
    attribute: "hexaco",
    load: () => import("@/lib/questionnaires/result-content/hexaco.json"),
    editorial: "Hexaco",
    prefix: "hexacoLanding",
    sections: hexacoLandingSections,
    faq: hexacoLandingFaq,
  },
  "work-traits-reflection": {
    reading: "work-traits-reflection",
    attribute: "work-traits",
    load: () => import("@/lib/questionnaires/result-content/work-traits-reflection.json"),
    editorial: "WorkTraits",
    prefix: "workTraitsLanding",
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
    prefix: "locusLanding",
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
    prefix: "socialIntelligenceLanding",
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
      if (["empathy", "hexaco", "work-traits-reflection", "tech-savvy", "time-management", "everyday-control-style", "apology-language", "conflict-styles", "love-fight-style", "friendship-compatibility", "relationship-worry-habits", "relationship-habits", "dating-outlook", "intimacy-values", "relationship-commitment", "work-activity-interests", "work-ethics", "culture-fit", "competency-test", "interpersonal-preferences", "social-attitudes-reflection", "cultural-dimensions"].includes(slug)) return mergeResultReadingParagraphs(item, readings);
      return Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item;
    },
  }));
  const summaries: Record<string, { zh: string; en: string }> = slug === "character-strengths"
    ? projectStoryCopy(strengthsSummaries, "components/questionnaires/StrengthsLandingEditorial.ts/strengthsSummaries", units)
    : slug === "procrastinator-type-test" ? projectStoryCopy(procrastinationSummaries,
      "components/questionnaires/ProcrastinationLandingEditorial.ts/procrastinationSummaries", units) : slug === "humor-style-test" ? projectStoryCopy(humorSummaries,
      "components/questionnaires/HumorLandingEditorial.ts/humorSummaries", units) : {};
  const extraReferences = (() => {
    switch (slug) {
      case "hexaco": return projectStoryCopy(hexacoLandingReferences, "components/questionnaires/HexacoLandingEditorial.ts/hexacoLandingReferences", units);
      case "tech-savvy": return projectStoryCopy(techConfidenceLandingReferences, "components/questionnaires/TechConfidenceLandingEditorial.ts/techConfidenceLandingReferences", units);
      case "time-management": return projectStoryCopy(timeManagementLandingReferences, "components/questionnaires/TimeManagementLandingEditorial.ts/timeManagementLandingReferences", units);
      case "everyday-control-style": return projectStoryCopy(controlLandingReferences, "components/questionnaires/EverydayControlLandingEditorial.ts/controlLandingReferences", units);
      case "conflict-styles": return projectStoryCopy(conflictStylesLandingReferences, "components/questionnaires/ConflictStylesLandingEditorial.ts/conflictStylesLandingReferences", units);
      case "friendship-compatibility": return projectStoryCopy(friendshipFitLandingReferences, "components/questionnaires/FriendshipFitLandingEditorial.ts/friendshipFitLandingReferences", units);
      case "relationship-worry-habits": return projectStoryCopy(relationshipWorryLandingReferences, "components/questionnaires/RelationshipWorryLandingEditorial.ts/relationshipWorryLandingReferences", units);
      case "relationship-habits": return projectStoryCopy(relationshipHabitsLandingReferences, "components/questionnaires/RelationshipHabitsLandingEditorial.ts/relationshipHabitsLandingReferences", units);
      case "dating-outlook": return projectStoryCopy(datingOutlookLandingReferences, "components/questionnaires/DatingOutlookLandingEditorial.ts/datingOutlookLandingReferences", units);
      case "intimacy-values": return projectStoryCopy(intimacyValuesLandingReferences, "components/questionnaires/IntimacyValuesLandingEditorial.ts/intimacyValuesLandingReferences", units);
      case "relationship-commitment": return projectStoryCopy(commitmentLandingReferences, "components/questionnaires/CommitmentLandingEditorial.ts/commitmentLandingReferences", units);
      case "work-activity-interests": return projectStoryCopy(workActivityLandingReferences, "components/questionnaires/WorkActivityLandingEditorial.ts/workActivityLandingReferences", units);
      case "competency-test": return projectStoryCopy(competencyLandingReferences, "components/questionnaires/CompetencyLandingEditorial.ts/competencyLandingReferences", units);
      case "social-attitudes-reflection": return projectStoryCopy(socialAttitudesLandingReferences, "components/questionnaires/SocialAttitudesLandingEditorial.ts/socialAttitudesLandingReferences", units);
      case "cultural-dimensions": return projectStoryCopy(culturalExtraReferences, "components/questionnaires/CulturalDimensionsLandingEditorial.ts/culturalExtraReferences", units);
      default: return [];
    }
  })();
  if ("editorial" in edition) {
    const editorial = `components/questionnaires/${edition.editorial}LandingEditorial.ts`;
    return { quiz: { ...quiz, profiles }, summaries: "summaries" in edition
        ? projectStoryCopy(edition.summaries, `${editorial}/${edition.prefix}Summaries`, units) : summaries, extraReferences,
      sections: projectStoryCopy(edition.sections, `${editorial}/${edition.prefix}Sections`, units),
      faq: projectStoryCopy(edition.faq, `${editorial}/${edition.prefix}Faq`, units) };
  }
  return { quiz: { ...quiz, profiles }, summaries, extraReferences, sections: [], faq: [] as Questionnaire["faq"] };
}
