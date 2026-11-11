import { isAnger20ConfigurationValid, type Anger20Questionnaire } from "@/lib/questionnaires/anger20";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./stress-coping-six-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

const readers = {
  "anger-issues-screener": {
    kind: "anger20", attribute: "anger20", editorialName: "Anger20", prefix: "anger20Landing",
    read: () => import("@/lib/questionnaires/result-content/anger-issues-screener.json"),
    editorial: () => import("@/components/questionnaires/Anger20LandingEditorial"),
  },
  "burnout-risk": {
    kind: "cbi", attribute: "cbi", editorialName: "Cbi", prefix: "cbiLanding",
    read: () => import("@/lib/questionnaires/result-content/burnout-risk.json"),
    editorial: () => import("@/components/questionnaires/CbiLandingEditorial"),
  },
  "overthinking-screener": {
    kind: "ptq15", attribute: "overthinking", editorialName: "Ptq", prefix: "ptq",
    read: () => import("@/lib/questionnaires/result-content/overthinking-screener.json"),
    editorial: () => import("@/components/questionnaires/PtqLandingEditorial"),
  },
  "perceived-stress-scale-4": {
    kind: "pss4", attribute: "pss4", editorialName: "Pss4", prefix: "pss4",
    read: () => import("@/lib/questionnaires/result-content/perceived-stress-scale-4.json"),
    editorial: () => import("@/components/questionnaires/Pss4LandingEditorial"),
  },
  "stress-check-in-test": {
    kind: "stress-reflection4", attribute: "stress-check-in", editorialName: "MonthlyStress", prefix: "monthlyStressLanding",
    read: () => import("@/lib/questionnaires/result-content/stress-check-in-test.json"),
    editorial: () => import("@/components/questionnaires/MonthlyStressLandingEditorial"),
  },
  "holding-yourself-back": {
    kind: "holding-back35", attribute: "holding-back", editorialName: "Holding", prefix: "holdingLanding",
    read: () => import("@/lib/questionnaires/result-content/holding-yourself-back.json"),
    editorial: () => import("@/components/questionnaires/HoldingLandingEditorial"),
  },
} as const;

export async function loadTraditionalStressCoping(slug: string) {
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
  const angerNotice = isAnger20ConfigurationValid(source)
    ? (quiz as Questionnaire & Pick<Anger20Questionnaire, "anger20">).anger20
    : undefined;
  const landing = reader.kind === "stress-reflection4" ? {
    description: fields.monthlyStressLandingDescription as Text,
    introduction: fields.monthlyStressLandingIntroduction as Text,
  } : undefined;
  return {
    quiz: { ...quiz, ...landing, profiles },
    // The Anger20 scorer verifies the original prompts and anchors.
    takeQuiz: reader.kind === "anger20" ? source : quiz,
    angerNotice,
    summaries: (fields.ptqSummaries ?? {}) as Record<string, Text>,
    sections: fields[reader.prefix + "Sections"] as QuestionnaireSection[],
    faq: fields[reader.prefix + "Faq"] as Questionnaire["faq"],
    extraReferences: (fields[reader.prefix + "References"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
