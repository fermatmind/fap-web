import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./sensory-executive-six-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

const readers = {
  "aphantasia-test": {
    kind: "imagery12", attribute: "visual-imagery", editorialName: "Imagery12", prefix: "imagery12", dedicated: true,
    read: () => import("@/lib/questionnaires/result-content/aphantasia-test.json"),
    editorial: () => import("@/components/questionnaires/Imagery12LandingEditorial"),
  },
  "synesthesia-test": {
    kind: "synes15", attribute: "synes15", editorialName: "Synes15", prefix: "synes15", dedicated: true,
    read: () => import("@/lib/questionnaires/result-content/synesthesia-test.json"),
    editorial: () => import("@/components/questionnaires/Synes15LandingEditorial"),
  },
  "sensory-processing-test": {
    kind: "spq92", attribute: "sensory-processing", editorialName: "Spq", prefix: "spq", dedicated: false,
    read: () => import("@/lib/questionnaires/result-content/sensory-processing-test.json"),
    editorial: () => import("@/components/questionnaires/SpqLandingEditorial"),
  },
  "sensory-sensitivity": {
    kind: "sens16", attribute: "sensory-sensitivity", editorialName: "Sens16", prefix: "sens16", dedicated: true,
    read: () => import("@/lib/questionnaires/result-content/sensory-sensitivity.json"),
    editorial: () => import("@/components/questionnaires/Sens16LandingEditorial"),
  },
  "misophonia-screener": {
    kind: "dvmsq18", attribute: "dvmsq18", editorialName: "Dvmsq18", prefix: "dvmsq18", dedicated: true,
    read: () => import("@/lib/questionnaires/result-content/misophonia-screener.json"),
    editorial: () => import("@/components/questionnaires/Dvmsq18LandingEditorial"),
  },
  "executive-function": {
    kind: "adexi14", attribute: "executive-function", editorialName: "Adexi", prefix: "adexi", dedicated: false,
    read: () => import("@/lib/questionnaires/result-content/executive-function.json"),
    editorial: () => import("@/components/questionnaires/AdexiLandingEditorial"),
  },
} as const;

export async function loadTraditionalSensoryExecutive(slug: string) {
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
    // Dedicated engines verify original prompts, anchors, and edition-specific context.
    takeQuiz: reader.dedicated ? source : quiz,
    summaries: {} as Record<string, Text>,
    sections: fields[reader.prefix + "LandingSections"] as QuestionnaireSection[],
    faq: fields[reader.prefix + "LandingFaq"] as Questionnaire["faq"],
    extraReferences: (fields[reader.prefix + "LandingReferences"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
