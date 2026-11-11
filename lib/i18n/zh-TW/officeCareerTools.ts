import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./office-career-tools-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

const readers = {
  "data-entry": {
    kind: "data-entry", attribute: "data-entry", appendSections: true, name: "DataEntry", prefix: "dataEntryLanding",
    read: () => import("@/lib/questionnaires/result-content/data-entry.json"),
    editorial: () => import("@/components/questionnaires/DataEntryLandingEditorial"),
  },
  "ten-key-test": {
    kind: "ten-key", attribute: "ten-key-test", appendSections: false, name: "TenKey", prefix: "tenKeyLanding",
    read: () => import("@/lib/questionnaires/result-content/ten-key-test.json"),
    editorial: () => import("@/components/questionnaires/TenKeyLandingEditorial"),
  },
  "typing-speed": {
    kind: "typing", attribute: "typing", appendSections: true, name: "Typing", prefix: "typingLanding",
    read: () => import("@/lib/questionnaires/result-content/typing-speed.json"),
    editorial: () => import("@/components/questionnaires/TypingLandingEditorial"),
  },
  "skills-audit": {
    kind: "skills-evidence", attribute: "skills-audit", appendSections: false, name: "SkillsAudit", prefix: "skillsAudit",
    read: () => import("@/lib/questionnaires/result-content/skills-audit.json"),
    editorial: () => import("@/components/questionnaires/SkillsAuditLandingEditorial"),
  },
  "work-role-reflection": {
    kind: "work-role12", attribute: "work-role", appendSections: false, name: "WorkRole", prefix: "workRoleLanding",
    read: () => import("@/lib/questionnaires/result-content/work-role-reflection.json"),
    editorial: () => import("@/components/questionnaires/WorkRoleLandingEditorial"),
  },
} as const;

export async function loadTraditionalOfficeTool(slug: string) {
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
    select: item => reader.appendSections
      ? (Object.hasOwn(additions, item.id) ? { ...item, sections: [...item.sections, ...additions[item.id]] } : item)
      : mergeResultReadingParagraphs(item, additions),
  }));
  // The work-role scorer verifies its response labels against the source bank.
  const takeQuiz = reader.kind === "work-role12" ? {
    ...quiz,
    questions: quiz.questions.map((question, index) => ({ ...question, options: source.questions[index].options })),
  } : quiz;
  const fields: Record<string, unknown> = projectStoryCopy(
    editorial, `components/questionnaires/${reader.name}LandingEditorial.ts`, units,
  );
  return {
    quiz: { ...quiz, profiles },
    takeQuiz,
    sections: (fields[reader.prefix + "Sections"] ?? []) as QuestionnaireSection[],
    faq: (fields[reader.prefix + "Faq"] ?? []) as Questionnaire["faq"],
    summaries: (fields.skillsAuditSummaries ?? {}) as Record<string, Text>,
    extraReferences: (fields[reader.prefix + "References"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}

export async function loadTraditionalCareerMatch() {
  const slug = "career-match";
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug),
    import("@/lib/questionnaires/result-content/career-match.json"),
    import("@/components/questionnaires/CareerThemesLandingEditorial"),
  ]);
  if (!source || source.kind !== "career-theme-compare") return null;
  return {
    quiz: projectStoryCopy<Questionnaire>(source, `lib/questionnaires/data/${slug}.json`, units),
    readings: projectStoryCopy(readings, `lib/questionnaires/result-content/${slug}.json`, units),
    editorial: projectStoryCopy(editorial, "components/questionnaires/CareerThemesLandingEditorial.ts", units),
  };
}
