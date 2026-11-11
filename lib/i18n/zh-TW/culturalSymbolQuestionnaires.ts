import { correctPairedFigure } from "@/lib/questionnaires/result-content/nakshatra-paired-figure";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./cultural-symbol-five-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

export type CulturalEditorial = {
  sections: QuestionnaireSection[];
  faq: Questionnaire["faq"];
  extraReferences: NonNullable<Questionnaire["references"]>;
};

const readers = {
  "life-path-number": {
    kind: "birth-number", attribute: "birth-symbol", editorialName: "BirthNumber", prefix: "birthNumber",
    read: () => import("@/lib/questionnaires/result-content/life-path-number.json"),
    editorial: () => import("@/components/questionnaires/BirthNumberLandingEditorial"),
  },
  "nakshatra-spica-reference": {
    kind: "nakshatra27", attribute: "nakshatra-spica", editorialName: "Nakshatra", prefix: "nakshatra",
    read: () => import("@/lib/questionnaires/result-content/nakshatra-spica-reference.json"),
    editorial: () => import("@/components/questionnaires/NakshatraLandingEditorial"),
  },
  "natal-chart": {
    kind: "natal-chart", attribute: "natal-symbol", editorialName: "Natal", prefix: "natalLanding",
    read: () => import("@/lib/questionnaires/result-content/natal-chart.json"),
    editorial: () => import("@/components/questionnaires/NatalLandingEditorial"),
  },
  "nine-star-ki": {
    kind: "nine-star-year", attribute: "nine-star-cultural", editorialName: "NineStar", prefix: "nineStarLanding",
    read: () => import("@/lib/questionnaires/result-content/nine-star-ki.json"),
    editorial: () => import("@/components/questionnaires/NineStarLandingEditorial"),
  },
  "weton-story-preferences": {
    kind: "weton-story35", attribute: "weton-story", editorialName: "WetonStory", prefix: "wetonStory",
    read: () => import("@/lib/questionnaires/result-content/weton-story-preferences.json"),
    editorial: () => import("@/components/questionnaires/WetonStoryLandingEditorial"),
  },
} as const;

export async function loadTraditionalCulturalSymbol(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug), reader.read(), reader.editorial(),
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const current = reader.kind === "nakshatra27" ? { ...source, profiles: source.profiles.map(correctPairedFigure) } : source;
  const quiz = projectStoryCopy(current, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(
    readings, `lib/questionnaires/result-content/${slug}.json`, units,
  );
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: reader.attribute,
    select: item => mergeResultReadingParagraphs(item, additions),
  }));
  const fields: Record<string, unknown> = projectStoryCopy(
    editorial, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units,
  );
  return {
    quiz: { ...quiz, profiles },
    takeQuiz: quiz,
    summaries: {} as Record<string, Text>,
    sections: fields[reader.prefix + "Sections"] as QuestionnaireSection[],
    faq: fields[reader.prefix + "Faq"] as Questionnaire["faq"],
    extraReferences: (fields[reader.prefix + "References"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
