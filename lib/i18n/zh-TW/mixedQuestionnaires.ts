import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./mixed-questionnaires-six-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

export type MixedQuestionnaireEditorial = {
  sections: QuestionnaireSection[];
  faq: Questionnaire["faq"];
  extraReferences: NonNullable<Questionnaire["references"]>;
};

const readers = {
  "food-disgust": {
    kind: "fds32", attribute: "food-disgust", editorialName: "FoodDisgust", prefix: "foodDisgustLanding",
    read: () => import("@/lib/questionnaires/result-content/food-disgust.json"),
    editorial: () => import("@/components/questionnaires/FoodDisgustLandingEditorial"),
  },
  "mental-age": {
    kind: "mental-age", attribute: "mental-age", editorialName: null, prefix: null,
    read: () => import("@/lib/questionnaires/result-content/mental-age.json"), editorial: null,
  },
  "patronus-quiz": {
    kind: "patronus20", attribute: null, editorialName: null, prefix: null, read: null, editorial: null,
  },
  "prakriti-inventory21": {
    kind: "bpi21", attribute: "prakriti-inventory", editorialName: "Bpi21", prefix: "bpi21",
    read: () => import("@/lib/questionnaires/result-content/prakriti-inventory21.json"),
    editorial: () => import("@/components/questionnaires/Bpi21LandingEditorial"),
  },
  "rice-purity-test": {
    kind: "rice100", attribute: null, editorialName: null, prefix: null, read: null, editorial: null,
  },
  "sbti-test": {
    kind: "sbti31", attribute: "sbti31", editorialName: "Sbti31", prefix: "sbti31Landing",
    read: () => import("@/lib/questionnaires/result-content/sbti-test.json"),
    editorial: () => import("@/components/questionnaires/Sbti31LandingEditorial"),
  },
} as const;

export async function loadTraditionalMixedQuestionnaire(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, readings, editorial] = await Promise.all([
    loadQuestionnaire(slug), reader.read?.(), reader.editorial?.(),
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = readings
    ? projectStoryCopy(readings.default, `lib/questionnaires/result-content/${slug}.json`, units)
    : {};
  const attribute = reader.attribute;
  const profiles = attribute ? quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute,
    select: item => mergeResultReadingParagraphs(item, additions),
  })) : quiz.profiles;
  const fields: Record<string, unknown> = editorial && reader.editorialName
    ? projectStoryCopy(editorial, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units)
    : {};
  const prefix = reader.prefix ?? "";
  return {
    quiz: { ...quiz, profiles },
    takeQuiz: reader.kind === "sbti31" ? source : quiz,
    summaries: {} as Record<string, Text>,
    sections: (fields[prefix + "Sections"] ?? []) as QuestionnaireSection[],
    faq: (fields[prefix + "Faq"] ?? []) as Questionnaire["faq"],
    extraReferences: (fields[prefix + "References"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
