import { introvertExtrovertCurrentEntryCopy, introvertExtrovertLandingSummary } from "@/components/questionnaires/IntrovertExtrovertLandingEditorial";
import { isCatQ25ConfigurationValid, type CatQ25Questionnaire } from "@/lib/questionnaires/catq25";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import { correctTipiMidpoint } from "@/lib/questionnaires/result-content/tipi-midpoint";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { units } from "./traits-social-six-copy.mjs";
import { projectStoryCopy } from "./storyReaderCopy";

const readers = {
  "caliper-style-assessment-test": {
    kind: "most-least", attribute: "most-least", editorialName: "MostLeast", prefix: "mostLeastLanding", result: "caliper-style-assessment-test",
    read: () => import("@/lib/questionnaires/result-content/caliper-style-assessment-test.json"),
    editorial: () => import("@/components/questionnaires/MostLeastLandingEditorial"),
  },
  "introvert-extrovert": {
    kind: "extraversion", attribute: "extraversion", editorialName: "IntrovertExtrovert", prefix: "introvertExtrovertLanding", result: "extraversion",
    read: () => import("@/lib/questionnaires/result-content/extraversion.json"),
    editorial: () => import("@/components/questionnaires/IntrovertExtrovertLandingEditorial"),
  },
  "masking-test": {
    kind: "catq25", attribute: "catq25", editorialName: "CatQ25", prefix: "catQ25Landing", result: "masking-test",
    read: () => import("@/lib/questionnaires/result-content/masking-test.json"),
    editorial: () => import("@/components/questionnaires/CatQ25LandingEditorial"),
  },
  "mattering": {
    kind: "mattering10", attribute: "mattering10", editorialName: "Mattering", prefix: "matteringLanding", result: "mattering",
    read: () => import("@/lib/questionnaires/result-content/mattering.json"),
    editorial: () => import("@/components/questionnaires/MatteringLandingEditorial"),
  },
  "optimism-pessimism": {
    kind: "optimism", attribute: "optimism-pessimism", editorialName: null, prefix: "optimismLanding", result: "optimism-pessimism",
    read: () => import("@/lib/questionnaires/result-content/optimism-pessimism.json"),
    editorial: null,
  },
  "tipi-10": {
    kind: "tipi10", attribute: "tipi10", editorialName: "Tipi10", prefix: "tipi10Landing", result: "tipi-10",
    read: () => import("@/lib/questionnaires/result-content/tipi-10.json"),
    editorial: () => import("@/components/questionnaires/Tipi10LandingEditorial"),
  },
} as const;

function currentExtraversionCopy(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(currentExtraversionCopy);
  if (value && typeof value === "object") {
    if ("zh" in value && typeof value.zh === "string" && "en" in value && typeof value.en === "string") {
      return {
        ...value,
        zh: introvertExtrovertCurrentEntryCopy(value.zh, "zh"),
        en: introvertExtrovertCurrentEntryCopy(value.en, "en"),
      };
    }
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, currentExtraversionCopy(child)]));
  }
  return value;
}

export async function loadTraditionalTraitsSocial(slug: string) {
  if (!Object.hasOwn(readers, slug)) return null;
  const reader = readers[slug as keyof typeof readers];
  const [source, { default: readings }, editorial] = await Promise.all([
    loadQuestionnaire(slug), reader.read(), reader.editorial?.() ?? {},
  ]);
  if (!source || source.kind !== reader.kind) return null;

  const current = reader.kind === "extraversion" ? currentExtraversionCopy(source) as Questionnaire
    : reader.kind === "tipi10" ? { ...source, profiles: source.profiles.map(correctTipiMidpoint) }
      : source;
  const quiz = projectStoryCopy(current, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(
    readings, `lib/questionnaires/result-content/${reader.result}.json`, units,
  );
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: reader.attribute,
    select: item => (reader.kind === "extraversion" || reader.kind === "optimism")
      ? (Object.hasOwn(additions, item.id) ? { ...item, sections: [...item.sections, ...additions[item.id]] } : item)
      : mergeResultReadingParagraphs(item, additions),
    note: reader.kind === "extraversion" ? {
      zh: "20、30、40 分會保留相鄰兩份說明，這是本站顯示約定，並非類型平分、信賴區間或官方門檻。公開讀法與算例不包含個人分數或答案。",
      en: "Totals of 20, 30 and 40 retain adjacent readings under this website’s display convention, rather than divided types, confidence intervals or official cutoffs. Public readings and illustrations contain no personal scores or answers.",
    } : undefined,
  }));
  const entryFields = reader.kind === "extraversion" ? {
    summaries: Object.fromEntries(source.profiles.map(profile => [profile.id, {
      zh: introvertExtrovertLandingSummary(profile, "zh"),
      en: introvertExtrovertLandingSummary(profile, "en"),
    }])),
  } : editorial;
  const fields: Record<string, unknown> = reader.editorialName ? projectStoryCopy(
    entryFields, `components/questionnaires/${reader.editorialName}LandingEditorial.ts`, units,
  ) : {};
  const catqNotice = isCatQ25ConfigurationValid(source)
    ? (quiz as Questionnaire & Pick<CatQ25Questionnaire, "catq25">).catq25
    : undefined;
  return {
    catqNotice,
    quiz: { ...quiz, profiles },
    takeQuiz: quiz,
    summaries: (fields.summaries ?? {}) as Record<string, Text>,
    sections: (fields[reader.prefix + "Sections"] ?? []) as QuestionnaireSection[],
    faq: (fields[reader.prefix + "Faq"] ?? []) as Questionnaire["faq"],
    extraReferences: (fields[reader.prefix + "References"] ?? []) as NonNullable<Questionnaire["references"]>,
  };
}
