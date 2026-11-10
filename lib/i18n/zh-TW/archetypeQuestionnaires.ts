import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import { isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import type { QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";
import generated from "./archetype-questionnaires.generated.json";

const units: TextUnits = generated.units;
const sources = {
  "mythical-creature": { name: "mythical-creature", type: "生物", en: "creature", load: () => import("@/lib/questionnaires/result-content/mythical-creature.json") },
  "what-dog-breed-am-i": { name: "dog-breed", type: "犬種", en: "breed", load: () => import("@/lib/questionnaires/result-content/dog-breed.json") },
  "superpower-test": { name: "superpower", type: "超能力", en: "power", load: () => import("@/lib/questionnaires/result-content/superpower.json") },
  "barbie-character": { name: "barbie-character", load: () => import("@/lib/questionnaires/result-content/barbie-character.json") },
  "avengers-character": { name: "avengers-character", load: () => import("@/lib/questionnaires/result-content/avengers-character.json") },
  "wednesday-addams-character": { name: "wednesday-addams-character", load: () => import("@/lib/questionnaires/result-content/wednesday-addams-character.json") },
  "twilight-character": { name: "twilight-character", load: () => import("@/lib/questionnaires/result-content/twilight-character.json") },
};

export function archetypeEditorial<T>(slug: string, field: string, original: T): T {
  return projectStoryCopy(original, `${slug}/editorial/${field}`, units);
}

export function archetypePrivacyAnswer(slug: string): string {
  const unit = units[`${slug}/editorial/privacy`];
  if (!unit) throw new Error(`Missing Taiwan privacy text: ${slug}`);
  return unit.text;
}

export async function loadTraditionalArchetype(slug: string) {
  if (!hasTraditionalArchetype(slug)) return null;
  const source = await loadQuestionnaire(slug);
  if (!source || !isArchetypeConfigurationValid(source)) return null;
  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  if (!Object.hasOwn(sources, slug)) return quiz;
  const edition = sources[slug as keyof typeof sources];
  const { default: additional } = await edition.load();
  const readings: Record<string, QuestionnaireSection[]> = projectStoryCopy(additional, `lib/questionnaires/result-content/${edition.name}.json`, units);
  const note: Text | undefined = "type" in edition ? {
    zh: `若本次有多個最高匹配，請分別讀各份說明。並列不會合成新的${edition.type}，也不會指定主次。分享公開說明只會開啟通用讀法，且不附個人計數或答案。`,
    en: `If several matches share the highest count, read each separately. A tie creates neither a new ${edition.en} nor a primary and secondary match. Sharing a public reading opens only the general guide, without personal counts or answers.`,
  } : undefined;
  return { ...quiz, profiles: quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: edition.name,
    select: (item) => Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item,
    note,
  })) };
}
