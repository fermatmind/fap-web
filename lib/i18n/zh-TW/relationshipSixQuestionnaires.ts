import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { projectStoryCopy } from "./storyReaderCopy";
import { units } from "./relationship-six-copy.mjs";

const readers = {
  "capacity-to-love-test": {
    kind: "ctl41", attribute: "capacity-to-love", editorialName: "Ctl", prefix: "ctl",
    read: () => import("@/lib/questionnaires/result-content/capacity-to-love-test.json"),
    editorial: () => import("@/components/questionnaires/CtlLandingEditorial"),
  },
  "love-languages": {
    kind: "affection", attribute: "love-languages", editorialName: "LoveLanguages", prefix: "loveLanguages",
    read: () => import("@/lib/questionnaires/result-content/love-languages.json"),
    editorial: () => import("@/components/questionnaires/LoveLanguagesLandingEditorial"),
  },
  "love-type-16": {
    kind: "love-type16", attribute: "love-type", editorialName: "LoveCombinations", prefix: "loveCombinations",
    read: () => import("@/lib/questionnaires/result-content/love-type-16.json"),
    editorial: () => import("@/components/questionnaires/LoveCombinationsLandingEditorial"),
  },
  "mote-type": {
    kind: "interaction-pairs", attribute: "interaction-pairs", editorialName: "Mote", prefix: "mote",
    read: () => import("@/lib/questionnaires/result-content/mote-type.json"),
    editorial: () => import("@/components/questionnaires/MoteLandingEditorial"),
  },
  "parenting-style": {
    kind: "parenting-practices", attribute: "parenting-style", editorialName: "Parenting", prefix: "parenting",
    read: () => import("@/lib/questionnaires/result-content/parenting-style.json"),
    editorial: () => import("@/components/questionnaires/ParentingLandingEditorial"),
  },
  "relationship-preferences": {
    kind: "paired-dimensions", attribute: "relationship-preferences", editorialName: "RelationshipPreferences", prefix: "relationshipPreferences",
    read: () => import("@/lib/questionnaires/result-content/relationship-preferences.json"),
    editorial: () => import("@/components/questionnaires/RelationshipPreferencesLandingEditorial"),
  },
} as const;

export async function loadTraditionalRelationshipSix(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug),
    reader.read(),
    reader.editorial(),
  ]);
  if (!source || source.kind !== reader.kind) return null;
  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(
    readings, `lib/questionnaires/result-content/${slug}.json`, units,
  );
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: reader.attribute,
    select: item => reader.kind === "affection"
      ? (Object.hasOwn(additions, item.id) ? { ...item, sections: [...item.sections, ...additions[item.id]] } : item)
      : mergeResultReadingParagraphs(item, additions),
  }));
  const editorialFields = "loveLanguagesLandingSummary" in editorial
    ? {
        summaries: Object.fromEntries(source.profiles.map(profile => [profile.id, {
          zh: editorial.loveLanguagesLandingSummary(profile, "zh"),
          en: editorial.loveLanguagesLandingSummary(profile, "en"),
        }])),
      }
    : editorial;
  const fields: Record<string, unknown> = projectStoryCopy(
    editorialFields, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units,
  );
  return {
    quiz: { ...quiz, profiles },
    takeQuiz: quiz,
    sections: (fields[reader.prefix + "LandingSections"] ?? []) as QuestionnaireSection[],
    faq: (fields[reader.prefix + "LandingFaq"] ?? []) as Questionnaire["faq"],
    summaries: (fields.summaries ?? {}) as Record<string, Text>,
    extraReferences: (fields[reader.prefix + "LandingReferences"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
