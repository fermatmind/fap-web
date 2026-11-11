import { moralAlignmentCurrentEntryCopy, moralAlignmentLandingSummary } from "@/components/questionnaires/MoralAlignmentLandingEditorial";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./values-orientations-six-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

const readers = {
  "8-values-political": {
    kind: "eight-values", attribute: "eight-values", editorialName: "EightValues", prefix: "eightValuesLanding", result: "8-values-political",
    read: () => import("@/lib/questionnaires/result-content/8-values-political.json"),
    editorial: () => import("@/components/questionnaires/EightValuesLandingEditorial"),
  },
  "conservatism": {
    kind: "secs", attribute: "secs", editorialName: "Conservatism", prefix: "conservatismLanding", result: "conservatism",
    read: () => import("@/lib/questionnaires/result-content/conservatism.json"),
    editorial: () => import("@/components/questionnaires/ConservatismLandingEditorial"),
  },
  "political-coordinates": {
    kind: "political-coordinates", attribute: "political", editorialName: "PoliticalCoordinates", prefix: "politicalCoordinatesLanding", result: "political-coordinates",
    read: () => import("@/lib/questionnaires/result-content/political-coordinates.json"),
    editorial: () => import("@/components/questionnaires/PoliticalCoordinatesLandingEditorial"),
  },
  "four-axes-test": {
    kind: "four-axes", attribute: "four-axes", editorialName: "FourAxes", prefix: "fourAxesLanding", result: "four-axes-test",
    read: () => import("@/lib/questionnaires/result-content/four-axes-test.json"),
    editorial: () => import("@/components/questionnaires/FourAxesLandingEditorial"),
  },
  "moral-alignment": {
    kind: "alignment", attribute: "moral-alignment", editorialName: "MoralAlignment", prefix: "moralAlignmentLanding", result: "moral-alignment",
    read: () => import("@/lib/questionnaires/result-content/moral-alignment.json"),
    editorial: () => import("@/components/questionnaires/MoralAlignmentLandingEditorial"),
  },
  "arabic-personality-compass": {
    kind: "compass", attribute: "compass", editorialName: "Compass", prefix: "compassLanding", result: "compass",
    read: () => import("@/lib/questionnaires/result-content/compass.json"),
    editorial: () => import("@/components/questionnaires/CompassLandingEditorial"),
  },
} as const;

function currentAlignmentCopy(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(currentAlignmentCopy);
  if (value && typeof value === "object") {
    if ("zh" in value && typeof value.zh === "string" && "en" in value && typeof value.en === "string") {
      return {
        ...value,
        zh: moralAlignmentCurrentEntryCopy(value.zh, "zh"),
        en: moralAlignmentCurrentEntryCopy(value.en, "en"),
      };
    }
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, currentAlignmentCopy(child)]));
  }
  return value;
}

export async function loadTraditionalValuesOrientations(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug), reader.read(), reader.editorial(),
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const current = reader.kind === "alignment" ? currentAlignmentCopy(source) as Questionnaire : source;
  const quiz = projectStoryCopy(current, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(
    readings, `lib/questionnaires/result-content/${reader.result}.json`, units,
  );
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: reader.attribute,
    select: item => (reader.kind === "alignment" || reader.kind === "compass")
      ? (Object.hasOwn(additions, item.id) ? { ...item, sections: [...item.sections, ...additions[item.id]] } : item)
      : mergeResultReadingParagraphs(item, additions),
    note: reader.kind === "alignment" ? {
      zh: "多個匹配來自兩軸 4 或 8 次的顯示邊界，最多保留四份。這些匹配不表示四種陣營各占一部分，也不隨機挑出主型。分享公開說明不包含個人計數或答案。",
      en: "Multiple matches come from count-4 or count-8 display boundaries on the two axes, retaining up to four readings. They are neither portions of four alignments nor a randomly selected primary type. Public readings contain no personal counts or answers.",
    } : undefined,
  }));
  const entryFields = reader.kind === "alignment" ? {
    summaries: Object.fromEntries(source.profiles.map(profile => [profile.id, {
      zh: moralAlignmentLandingSummary(profile, "zh"),
      en: moralAlignmentLandingSummary(profile, "en"),
    }])),
  } : editorial;
  const fields: Record<string, unknown> = projectStoryCopy(
    entryFields, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units,
  );
  const landing = reader.kind === "four-axes" ? {
    description: fields.fourAxesLandingDescription as Text,
    introduction: fields.fourAxesLandingIntroduction as Text,
  } : undefined;
  return {
    quiz: { ...quiz, ...landing, profiles },
    takeQuiz: quiz,
    summaries: (fields.summaries ?? {}) as Record<string, Text>,
    sections: (fields[reader.prefix + "Sections"] ?? []) as QuestionnaireSection[],
    faq: (fields[reader.prefix + "Faq"] ?? []) as Questionnaire["faq"],
    extraReferences: (fields[reader.prefix + "References"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
