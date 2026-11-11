import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { projectStoryCopy } from "./storyReaderCopy";
import { units } from "./work-reasoning-questionnaires.generated.json";

const readers = {
  "asvab-practice-test": {
    kind: "afqt32", attribute: "afqt32", editorialName: "Afqt32", prefix: "afqt32",
    read: () => import("@/lib/questionnaires/result-content/asvab-practice-test.json"),
    editorial: () => import("@/components/questionnaires/Afqt32LandingEditorial"),
  },
  "asvab-science-mechanical-practice-test": {
    kind: "technical30", attribute: "technical30", editorialName: "Technical30", prefix: "technical30",
    read: () => import("@/lib/questionnaires/result-content/asvab-science-mechanical-practice-test.json"),
    editorial: () => import("@/components/questionnaires/Technical30LandingEditorial"),
  },
  "employer-reasoning-practice-test": {
    kind: "reasoning18", attribute: "reasoning18", editorialName: "Reasoning18", prefix: "reasoning18",
    read: () => import("@/lib/questionnaires/result-content/employer-reasoning-practice-test.json"),
    editorial: () => import("@/components/questionnaires/Reasoning18LandingEditorial"),
  },
  "watson-glaser-practice-test": {
    kind: "critical30", attribute: "critical30", editorialName: "Critical30", prefix: "critical30",
    read: () => import("@/lib/questionnaires/result-content/watson-glaser-practice-test.json"),
    editorial: () => import("@/components/questionnaires/Critical30LandingEditorial"),
  },
  "written-coordination-practice": {
    kind: "written-coordination", attribute: "written-coordination", editorialName: "WrittenCoordination", prefix: "written",
    read: () => import("@/lib/questionnaires/result-content/written-coordination-practice.json"),
    editorial: () => import("@/components/questionnaires/WrittenCoordinationLandingEditorial"),
  },
  "distributed-work-choices": {
    kind: "distributed-work24", attribute: "distributed-work", editorialName: "DistributedWork", prefix: "distributed",
    read: () => import("@/lib/questionnaires/result-content/distributed-work-choices.json"),
    editorial: () => import("@/components/questionnaires/DistributedWorkLandingEditorial"),
  },
  "freelance-ready": {
    kind: "preparation-actions20", attribute: "freelance-preparation", editorialName: "FreelanceReady", prefix: "freelanceReady",
    read: () => import("@/lib/questionnaires/result-content/freelance-ready.json"),
    editorial: () => import("@/components/questionnaires/FreelanceReadyLandingEditorial"),
  },
  "remote-work": {
    kind: "preparation-actions20", attribute: "remote-preparation", editorialName: "RemoteWork", prefix: "remoteWork",
    read: () => import("@/lib/questionnaires/result-content/remote-work.json"),
    editorial: () => import("@/components/questionnaires/RemoteWorkLandingEditorial"),
  },
} as const;

export async function loadTraditionalWorkReasoning(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug),
    reader.read(),
    reader.editorial(),
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  // The timed bank validates both source-language questions byte for byte.
  const fixedQuestionBank = reader.kind === "technical30" || reader.kind === "reasoning18" || reader.kind === "critical30";
  const takeQuestions = fixedQuestionBank ? source.questions : reader.kind === "distributed-work24"
    ? quiz.questions.map((question, index) => ({
      ...question,
      options: question.options.map((option, choice) => choice === 2 ? source.questions[index].options[choice] : option),
    }))
    : quiz.questions;
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(
    readings, `lib/questionnaires/result-content/${slug}.json`, units,
  );
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: reader.attribute,
    select: item => reader.kind === "written-coordination"
      ? (Object.hasOwn(additions, item.id) ? { ...item, sections: [...item.sections, ...additions[item.id]] } : item)
      : mergeResultReadingParagraphs(item, additions),
  }));
  const fields: Record<string, unknown> = projectStoryCopy(
    editorial, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units,
  );
  return {
    quiz: { ...quiz, profiles },
    takeQuiz: { ...quiz, questions: takeQuestions },
    sections: (fields[reader.prefix + "LandingSections"] ?? []) as QuestionnaireSection[],
    faq: (fields[reader.prefix + "LandingFaq"] ?? []) as Questionnaire["faq"],
    summaries: {} as Record<string, Text>,
    extraReferences: (fields[reader.prefix + "LandingReferences"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
