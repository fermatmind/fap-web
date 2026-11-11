import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isDirectionalConfigurationValid } from "@/lib/questionnaires/basicScoring";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

const sources = {
  "adult-age-preferences": { reading: "adult-age-preferences", load: () => import("@/lib/questionnaires/result-content/adult-age-preferences.json"), editorial: () => import("@/components/questionnaires/AdultAgePreferencesLandingEditorial") },
  disc: { reading: "disc", load: () => import("@/lib/questionnaires/result-content/disc.json") },
  "egen-teto": { reading: "egen-teto", load: () => import("@/lib/questionnaires/result-content/egen-teto.json"), editorial: () => import("@/components/questionnaires/EgenTetoLandingEditorial") },
  "food-choice": { reading: "food-choice", load: () => import("@/lib/questionnaires/result-content/food-choice.json"), editorial: () => import("@/components/questionnaires/FoodChoiceLandingEditorial") },
  "likable-person-test": { reading: "liked-reason", load: () => import("@/lib/questionnaires/result-content/liked-reason.json"), editorial: () => import("@/components/questionnaires/LikableLandingEditorial") },
  "love-personality": { reading: "love-personality", load: () => import("@/lib/questionnaires/result-content/love-personality.json"), editorial: () => import("@/components/questionnaires/LovePersonalityLandingEditorial") },
  "relationship-values": { reading: "relationship-values", load: () => import("@/lib/questionnaires/result-content/relationship-values.json"), editorial: () => import("@/components/questionnaires/RelationshipValuesLandingEditorial") },
  "response-color": { reading: "response-color", load: () => import("@/lib/questionnaires/result-content/response-color.json"), editorial: () => import("@/components/questionnaires/ResponseColorLandingEditorial") },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { units } = require("./directional-questionnaires.generated.json") as { units: TextUnits };

export async function loadTraditionalDirectional(slug: string) {
  if (!Object.hasOwn(sources, slug)) return null;
  const edition = sources[slug as keyof typeof sources];
  const [source, { default: resultSource }, editorial, copy] = await Promise.all([
    loadQuestionnaire(slug),
    edition.load(),
    "editorial" in edition ? edition.editorial() : undefined,
    loadTraditionalAssessmentText(),
  ]);
  if (!source || source.kind !== "directional" || !isDirectionalConfigurationValid(source)) return null;
  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  const readings = projectStoryCopy(resultSource, `lib/questionnaires/result-content/${edition.reading}.json`, units);

  const sections: QuestionnaireSection[] = [];
  const faq: Questionnaire["faq"] = [];
  const extraReferences: NonNullable<Questionnaire["references"]> = [];
  let summaries: Record<string, Text> = {};
  if (editorial) {
    const names = {
      "adult-age-preferences": "AdultAgePreferences", "egen-teto": "EgenTeto", "food-choice": "FoodChoice",
      "likable-person-test": "Likable", "love-personality": "LovePersonality", "relationship-values": "RelationshipValues", "response-color": "ResponseColor",
    } as const;
    const name = names[slug as keyof typeof names];
    const prefix = name[0].toLowerCase() + name.slice(1);
    const file = `components/questionnaires/${name}LandingEditorial.ts`;
    const fields = projectStoryCopy(editorial, file, units) as Record<string, unknown>;
    const supplement = name === "FoodChoice" ? prefix : prefix + "Landing";
    sections.push(...(fields[supplement + "Sections"] as QuestionnaireSection[] | undefined ?? []));
    faq.push(...(fields[supplement + "Faq"] as Questionnaire["faq"] | undefined ?? []));
    extraReferences.push(...(fields[supplement + "References"] as typeof extraReferences | undefined ?? []));
    summaries = fields[supplement + "Summaries"] as Record<string, Text> | undefined ?? {};
  }
  const referenceMap = new Map((quiz.references ?? []).map(reference => [reference.url, reference]));
  const landingReferences = extraReferences.filter(reference => !referenceMap.has(reference.url));

  let select = (profile: QuestionnaireProfile) => mergeResultReadingParagraphs(profile, readings as Record<string, QuestionnaireSection[]>);
  let references: typeof extraReferences | undefined;
  if (slug === "disc") {
    const { discReading, discResultProfile } = await import("@/lib/questionnaires/result-content/disc");
    select = profile => discResultProfile(profile, readings as NonNullable<Parameters<typeof discResultProfile>[1]>, copy);
    references = discReading.references.map(reference => ({ ...reference, title: { ...reference.title, zh: copy(reference.title.zh) } }));
  } else if (slug === "response-color") {
    const { responseColorReading, responseColorResultProfile } = await import("@/lib/questionnaires/result-content/response-color");
    select = profile => responseColorResultProfile(profile, readings as NonNullable<Parameters<typeof responseColorResultProfile>[1]>, copy);
    references = responseColorReading.references.map(reference => ({ ...reference, title: { ...reference.title, zh: copy(reference.title.zh) } }));
  } else if (slug === "likable-person-test") {
    select = profile => ({ ...profile, sections: [...profile.sections, ...((readings as Record<string, QuestionnaireSection[]>)[profile.id] ?? [])] });
  }
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: edition.reading, select, references,
  }));
  return { quiz: { ...quiz, profiles }, summaries, extraReferences: landingReferences, sections, faq };
}
