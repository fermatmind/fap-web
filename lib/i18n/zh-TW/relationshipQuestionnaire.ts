import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { QuestionnaireSection } from "@/lib/questionnaires/types";
import generated from "./relationship-questionnaires.generated.json";

const units: Record<string, { text: string }> = generated.units;
const resultSources = {
  "attachment-styles": () => import("@/lib/questionnaires/result-content/attachment-styles.json"),
  "communication-style": () => import("@/lib/questionnaires/result-content/communication-style.json"),
};

type RelationshipQuestionnaireSlug = keyof typeof resultSources;

function isRelationshipQuestionnaire(slug: string): slug is RelationshipQuestionnaireSlug {
  return Object.hasOwn(resultSources, slug);
}

function projectText<T>(value: T, path: string): T {
  if (value && typeof value === "object" && "zh" in value && "en" in value && typeof value.zh === "string" && typeof value.en === "string") {
    const unit = units[path];
    if (!unit) throw new Error(`Missing Taiwan questionnaire text: ${path}`);
    // Keep the source locale used by the existing reader and scorer.
    return { ...value, zh: unit.text };
  }
  if (Array.isArray(value)) return value.map((item, index) => projectText(item, `${path}/${index}`)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, projectText(child, `${path}/${key}`)])) as T;
  }
  return value;
}

export async function loadTraditionalRelationshipQuestionnaire(slug: string) {
  if (!isRelationshipQuestionnaire(slug)) return null;
  const [source, { default: sourceReadings }] = await Promise.all([loadQuestionnaire(slug), resultSources[slug]()]);
  if (!source) return null;
  const quiz = projectText(source, `lib/questionnaires/data/${slug}.json`);
  const readings: Record<string, QuestionnaireSection[]> = projectText(sourceReadings, `lib/questionnaires/result-content/${slug}.json`);
  return {
    ...quiz,
    profiles: quiz.profiles.map((profile) => prepareSelectedResultProfile(slug, profile, {
      attribute: slug,
      select: (item) => Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item,
    })),
  };
}
