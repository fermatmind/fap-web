import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { correctConflictReadingPrivacy } from "@/lib/questionnaires/result-content/conflict-boundary-privacy";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { projectStoryCopy } from "./storyReaderCopy";
import { units } from "./private-reflection-questionnaires.generated.json";

const readers = {
  "annoying-person-test": {
    kind: "mini-friction", attribute: "mini-friction", editorialName: "Friction",
    read: () => import("@/lib/questionnaires/result-content/annoying-person-test.json"),
    editorial: () => import("@/components/questionnaires/FrictionLandingEditorial"),
  },
  "breakup-reflection-test": {
    kind: "mini-breakup", attribute: "breakup-reflection", editorialName: "Breakup",
    read: () => import("@/lib/questionnaires/result-content/breakup-reflection-test.json"),
    editorial: () => import("@/components/questionnaires/BreakupLandingEditorial"),
  },
  "conflict-boundary-behaviors-test": {
    kind: "mini-conflict", attribute: "conflict-boundary", editorialName: "ConflictBoundary",
    read: () => import("@/lib/questionnaires/result-content/conflict-boundary-behaviors-test.json"),
    editorial: () => import("@/components/questionnaires/ConflictBoundaryLandingEditorial"),
  },
  "coping-rhythm-test": {
    kind: "mini-coping", attribute: "coping-rhythm", editorialName: "CopingRhythm",
    read: () => import("@/lib/questionnaires/result-content/coping-rhythm-test.json"),
    editorial: () => import("@/components/questionnaires/CopingRhythmLandingEditorial"),
  },
  "habit-patterns-test": {
    kind: "mini-habit", attribute: "habit-patterns", editorialName: "HabitPatterns",
    read: () => import("@/lib/questionnaires/result-content/habit-patterns-test.json"),
    editorial: () => import("@/components/questionnaires/HabitPatternsLandingEditorial"),
  },
  "intimacy-preference-test": {
    kind: "mini-intimacy", attribute: "intimacy-preference", editorialName: "Intimacy",
    read: () => import("@/lib/questionnaires/result-content/intimacy-preference-test.json"),
    editorial: () => import("@/components/questionnaires/IntimacyLandingEditorial"),
  },
  "orientation-exploration-test": {
    kind: "mini-orientation", attribute: "orientation-exploration", editorialName: "Orientation",
    read: () => import("@/lib/questionnaires/result-content/orientation-exploration-test.json"),
    editorial: () => import("@/components/questionnaires/OrientationLandingEditorial"),
  },
  "stress-response-patterns-test": {
    kind: "mini-shadow", attribute: "stress-patterns", editorialName: "StressResponse",
    read: () => import("@/lib/questionnaires/result-content/stress-response-patterns-test.json"),
    editorial: () => import("@/components/questionnaires/StressResponseLandingEditorial"),
  },
} as const;

export async function loadTraditionalPrivateReflection(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug),
    reader.read(),
    reader.editorial(),
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const current = slug === "conflict-boundary-behaviors-test"
    ? { ...source, profiles: source.profiles.map(correctConflictReadingPrivacy) }
    : source;
  const quiz = projectStoryCopy(current, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(
    readings, `lib/questionnaires/result-content/${slug}.json`, units,
  );
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: reader.attribute,
    select: item => mergeResultReadingParagraphs(item, additions),
  }));
  const fields = projectStoryCopy(
    editorial, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units,
  );
  const projected = fields as Record<string, unknown>;
  const prefix = {
    Friction: "friction", Breakup: "breakup", ConflictBoundary: "conflictBoundary",
    CopingRhythm: "copingRhythm", HabitPatterns: "habitPatterns", Intimacy: "intimacy",
    Orientation: "orientation", StressResponse: "stressResponse",
  }[reader.editorialName];
  return {
    quiz: { ...quiz, profiles },
    takeQuiz: quiz,
    sections: (projected[prefix + "LandingSections"] ?? []) as QuestionnaireSection[],
    faq: (projected[prefix + "LandingFaq"] ?? []) as Questionnaire["faq"],
    summaries: (projected.frictionSummaries ?? {}) as Record<string, Text>,
    extraReferences: (projected[prefix + "LandingReferences"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
