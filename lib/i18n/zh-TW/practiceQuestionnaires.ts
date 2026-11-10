import { attentionDetailLandingFaq, attentionDetailLandingSections } from "@/components/questionnaires/AttentionDetailLandingEditorial";
import { cybersecurityLandingFaq, cybersecurityLandingSections } from "@/components/questionnaires/CybersecurityLandingEditorial";
import { workplaceTechnologyLandingFaq, workplaceTechnologyLandingSections } from "@/components/questionnaires/WorkplaceTechnologyLandingEditorial";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { QuestionnaireSection } from "@/lib/questionnaires/types";
import generated from "./practice-questionnaires.generated.json";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

const units: TextUnits = generated.units;

const editions = {
  "attention-to-detail": {
    reading: "attention-to-detail",
    load: () => import("@/lib/questionnaires/result-content/attention-to-detail.json"),
    editorial: "AttentionDetailLandingEditorial",
    prefix: "attentionDetail",
    sections: attentionDetailLandingSections,
    faq: attentionDetailLandingFaq,
  },
  "cybersecurity-awareness": {
    reading: "cybersecurity",
    load: () => import("@/lib/questionnaires/result-content/cybersecurity.json"),
    editorial: "CybersecurityLandingEditorial",
    prefix: "cybersecurity",
    sections: cybersecurityLandingSections,
    faq: cybersecurityLandingFaq,
  },
  "workplace-technology": {
    reading: "workplace-technology",
    load: () => import("@/lib/questionnaires/result-content/workplace-technology.json"),
    editorial: "WorkplaceTechnologyLandingEditorial",
    prefix: "workplaceTechnology",
    sections: workplaceTechnologyLandingSections,
    faq: workplaceTechnologyLandingFaq,
  },
};

export async function loadTraditionalPractice(slug: string) {
  if (!Object.hasOwn(editions, slug)) return null;
  const edition = editions[slug as keyof typeof editions];
  const original = await loadQuestionnaire(slug);
  if (!original || !isPracticeConfigurationValid(original)) return null;
  const quiz = projectStoryCopy(original, `lib/questionnaires/data/${slug}.json`, units);
  const { default: source } = await edition.load();
  const readings: Record<string, QuestionnaireSection[]> = projectStoryCopy(source, `lib/questionnaires/result-content/${edition.reading}.json`, units);
  const root = `components/questionnaires/${edition.editorial}.ts/${edition.prefix}Landing`;
  return {
    quiz: { ...quiz, profiles: quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
      attribute: edition.reading,
      select: (item) => Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item,
    })) },
    sections: projectStoryCopy(edition.sections, `${root}Sections`, units),
    faq: projectStoryCopy(edition.faq, `${root}Faq`, units),
  };
}
