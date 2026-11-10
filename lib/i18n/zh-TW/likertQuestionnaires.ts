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
      if (["empathy", "hexaco", "work-traits-reflection"].includes(slug)) return mergeResultReadingParagraphs(item, readings);
      return Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item;
    },
  }));
  const summaries: Record<string, { zh: string; en: string }> = slug === "character-strengths"
    ? projectStoryCopy(strengthsSummaries, "components/questionnaires/StrengthsLandingEditorial.ts/strengthsSummaries", units)
    : {};
  const extraReferences = slug === "hexaco" ? projectStoryCopy(hexacoLandingReferences,
    "components/questionnaires/HexacoLandingEditorial.ts/hexacoLandingReferences", units) : [];
  if ("editorial" in edition) {
    const editorial = `components/questionnaires/${edition.editorial}LandingEditorial.ts`;
    return { quiz: { ...quiz, profiles }, summaries, extraReferences,
      sections: projectStoryCopy(edition.sections, `${editorial}/${edition.prefix}LandingSections`, units),
      faq: projectStoryCopy(edition.faq, `${editorial}/${edition.prefix}LandingFaq`, units) };
  }
  return { quiz: { ...quiz, profiles }, summaries, extraReferences, sections: [], faq: [] as Questionnaire["faq"] };
}
