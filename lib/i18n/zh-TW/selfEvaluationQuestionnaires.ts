import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./self-evaluation-five-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

const readers = {
  "imposter-syndrome": {
    kind: "imposter20", attribute: "imposter20", editorialName: "Imposter20", prefix: "imposter20",
    read: () => import("@/lib/questionnaires/result-content/imposter-syndrome.json"),
    editorial: () => import("@/components/questionnaires/Imposter20LandingEditorial"),
  },
  "inner-critic-voice-test": {
    kind: "fscrs22", attribute: "inner-critic", editorialName: "Fscrs", prefix: "fscrs",
    read: () => import("@/lib/questionnaires/result-content/inner-critic-voice-test.json"),
    editorial: () => import("@/components/questionnaires/FscrsLandingEditorial"),
  },
  "self-compassion": {
    kind: "scs26", attribute: "scs26", editorialName: "Scs26", prefix: "scs26",
    read: () => import("@/lib/questionnaires/result-content/self-compassion.json"),
    editorial: () => import("@/components/questionnaires/Scs26LandingEditorial"),
  },
  "self-esteem": {
    kind: "rosenberg", attribute: "rosenberg", editorialName: "SelfEsteem", prefix: "selfEsteem",
    read: () => import("@/lib/questionnaires/result-content/self-esteem.json"),
    editorial: () => import("@/components/questionnaires/SelfEsteemLandingEditorial"),
  },
  perfectionism: {
    kind: "saps", attribute: "saps", editorialName: "Saps", prefix: "saps",
    read: () => import("@/lib/questionnaires/result-content/perfectionism.json"),
    editorial: () => import("@/components/questionnaires/SapsLandingEditorial"),
  },
} as const;

export async function loadTraditionalSelfEvaluation(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug), reader.read(), reader.editorial(),
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
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
    // The imposter validator compares exact source prompts and anchors.
    takeQuiz: reader.kind === "imposter20" ? { ...quiz, questions: source.questions } : quiz,
    summaries: {} as Record<string, Text>,
    sections: fields[reader.prefix + "LandingSections"] as QuestionnaireSection[],
    faq: fields[reader.prefix + "LandingFaq"] as Questionnaire["faq"],
    extraReferences: (fields[reader.prefix + "LandingReferences"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
