import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import { isEuphoriaConfigurationValid } from "@/lib/questionnaires/euphoria";
import { isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

// The generator validates the dictionary before builds. Only the reader shape needs TypeScript checking.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { units } = require("./archetype-questionnaires.generated.json") as { units: TextUnits };
const sources = {
  "mythical-creature": { name: "mythical-creature", type: "生物", en: "creature", load: () => import("@/lib/questionnaires/result-content/mythical-creature.json") },
  "what-dog-breed-am-i": { name: "dog-breed", type: "犬種", en: "breed", load: () => import("@/lib/questionnaires/result-content/dog-breed.json") },
  "superpower-test": { name: "superpower", type: "超能力", en: "power", load: () => import("@/lib/questionnaires/result-content/superpower.json") },
  "barbie-character": { name: "barbie-character", load: () => import("@/lib/questionnaires/result-content/barbie-character.json") },
  "avengers-character": { name: "avengers-character", load: () => import("@/lib/questionnaires/result-content/avengers-character.json") },
  "wednesday-addams-character": { name: "wednesday-addams-character", load: () => import("@/lib/questionnaires/result-content/wednesday-addams-character.json") },
  "twilight-character": { name: "twilight-character", load: () => import("@/lib/questionnaires/result-content/twilight-character.json") },
  "stranger-things": { name: "stranger-things", load: () => import("@/lib/questionnaires/result-content/stranger-things.json") },
  "ginny-and-georgia-character-quiz": { name: "ginny-georgia", load: () => import("@/lib/questionnaires/result-content/ginny-georgia.json") },
  "gilmore-girls": { name: "gilmore-girls", load: () => import("@/lib/questionnaires/result-content/gilmore-girls.json") },
  "dexter": { name: "dexter", load: () => import("@/lib/questionnaires/result-content/dexter.json") },
  "gossip-girl": { name: "gossip-girl", load: () => import("@/lib/questionnaires/result-content/gossip-girl.json") },
  "game-of-thrones": { name: "game-of-thrones", load: () => import("@/lib/questionnaires/result-content/game-of-thrones.json") },
  "harry-potter-character": { name: "harry-potter-character", load: () => import("@/lib/questionnaires/result-content/harry-potter-character.json") },
  "euphoria-character-quiz": { name: "euphoria-character-quiz", mergeParagraphs: true, attribute: "euphoria", load: () => import("@/lib/questionnaires/result-content/euphoria-character-quiz.json") },
  "hazbin-hotel-character-quiz": { name: "hazbin-hotel", load: () => import("@/lib/questionnaires/result-content/hazbin-hotel.json") },
  "my-hero-academia-character-quiz": { name: "my-hero-academia", load: () => import("@/lib/questionnaires/result-content/my-hero-academia.json") },
  "my-little-pony-character-quiz": { name: "my-little-pony", load: () => import("@/lib/questionnaires/result-content/my-little-pony.json") },
  "nana-character": { name: "nana-character", load: () => import("@/lib/questionnaires/result-content/nana-character.json") },
  "south-park": { name: "south-park", load: () => import("@/lib/questionnaires/result-content/south-park.json") },
  "jujutsu-kaisen-character": { name: "jujutsu-kaisen-character", load: () => import("@/lib/questionnaires/result-content/jujutsu-kaisen-character.json") },
  "amazing-digital-circus": { name: "amazing-digital-circus", load: () => import("@/lib/questionnaires/result-content/amazing-digital-circus.json") },
  "blue-lock": { name: "blue-lock", load: () => import("@/lib/questionnaires/result-content/blue-lock.json") },
  "anime-character-archetype-test": { name: "anime-character-archetype-test", load: () => import("@/lib/questionnaires/result-content/anime-character-archetype-test.json") },
  "space-marine-chapter": { name: "space-marine-chapter", load: () => import("@/lib/questionnaires/result-content/space-marine-chapter.json") },
  "hundred-acre-wood-friend-quiz": { name: "hundred-acre-wood-friend-quiz", load: () => import("@/lib/questionnaires/result-content/hundred-acre-wood-friend-quiz.json") },
  "apocalypse-survival-type-test": { name: "apocalypse-survival-type-test", mergeParagraphs: true, load: () => import("@/lib/questionnaires/result-content/apocalypse-survival-type-test.json") },
  "next-life": { name: "next-life", load: () => import("@/lib/questionnaires/result-content/next-life.json") },
  "villain-era-archetype-test": { name: "villain-era-archetype-test", mergeParagraphs: true, load: () => import("@/lib/questionnaires/result-content/villain-era-archetype-test.json") },
  "big-fish-energy-test": { name: "big-fish-energy-test", mergeParagraphs: true, load: () => import("@/lib/questionnaires/result-content/big-fish-energy-test.json") },
  "decade-aesthetic-test": { name: "decade-aesthetic-test", mergeParagraphs: true, load: () => import("@/lib/questionnaires/result-content/decade-aesthetic-test.json") },
  "bojack-horseman-character-quiz": { name: "bojack-horseman", load: () => import("@/lib/questionnaires/result-content/bojack-horseman.json") },
  "naruto-character": { name: "naruto-character", load: () => import("@/lib/questionnaires/result-content/naruto-character.json") },
  "death-note": { name: "death-note", load: () => import("@/lib/questionnaires/result-content/death-note.json") },
  "star-wars-character": { name: "star-wars-character", load: () => import("@/lib/questionnaires/result-content/star-wars-character.json") },
  "hello-kitty": { name: "hello-kitty", load: () => import("@/lib/questionnaires/result-content/hello-kitty.json") },
  "disney-princess": { name: "disney-princess", load: () => import("@/lib/questionnaires/result-content/disney-princess.json") },
  "jungian-archetype": { name: "jungian-archetype", load: () => import("@/lib/questionnaires/result-content/jungian-archetype.json") },
  "temperament": { name: "temperament", load: () => import("@/lib/questionnaires/result-content/temperament.json") },
  "leadership-style": { name: "leadership-style", load: () => import("@/lib/questionnaires/result-content/leadership-style.json") },
  "travel-personality-test": { name: "travel-personality", load: () => import("@/lib/questionnaires/result-content/travel-personality.json") },
  "aesthetic-core-test": { name: "aesthetic-core", load: () => import("@/lib/questionnaires/result-content/aesthetic-core.json") },
  "tsundere-dere-type": { name: "dere-type", load: () => import("@/lib/questionnaires/result-content/dere-type.json") },
  "hogwarts-house-quiz": { name: "hogwarts-house", load: () => import("@/lib/questionnaires/result-content/hogwarts-house.json") },
  "found-family-role-test": { name: "found-family-role-test", mergeParagraphs: true, load: () => import("@/lib/questionnaires/result-content/found-family-role-test.json") },
  "chinese-zodiac": { name: "chinese-zodiac", load: () => import("@/lib/questionnaires/result-content/chinese-zodiac.json") },
  "zodiac-sign-quiz": { name: "zodiac-sign-quiz", load: () => import("@/lib/questionnaires/result-content/zodiac-sign-quiz.json") },
  "male-archetype-test": { name: "four-roles", load: () => import("@/lib/questionnaires/result-content/four-roles.json") },
  "wojak": { name: "wojak", load: () => import("@/lib/questionnaires/result-content/wojak.json") },
  "greek-god": { name: "greek-god", load: () => import("@/lib/questionnaires/result-content/greek-god.json") },
  "what-element-am-i": { name: "element", load: () => import("@/lib/questionnaires/result-content/element.json") },
  "past-life": { name: "past-life", load: () => import("@/lib/questionnaires/result-content/past-life.json") },
  "inner-child-personality-test": { name: "inner-child", load: () => import("@/lib/questionnaires/result-content/inner-child.json") },
  "dungeons-dragons-class": { name: "dungeons-dragons-class", load: () => import("@/lib/questionnaires/result-content/dungeons-dragons-class.json") },
  "socionics": { name: "socionics", load: () => import("@/lib/questionnaires/result-content/socionics.json") },
  "which-tarot-card-are-you": { name: "tarot-card", load: () => import("@/lib/questionnaires/result-content/tarot-card.json") },
};

export function archetypeEditorial<T>(slug: string, field: string, original: T): T {
  return projectStoryCopy(original, `${slug}/editorial/${field}`, units);
}

export function archetypeLandingSummary(slug: string, profileId: string): string {
  const unit = units[`${slug}/editorial/summaries/${profileId}`];
  if (!unit) throw new Error(`Missing Taiwan landing summary: ${slug}/${profileId}`);
  return unit.text;
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
  if (slug === "euphoria-character-quiz" && !isEuphoriaConfigurationValid(source)) return null;
  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  if (!Object.hasOwn(sources, slug)) return quiz;
  const edition = sources[slug as keyof typeof sources];
  const { default: additional } = await edition.load();
  const readings: Record<string, QuestionnaireSection[]> = projectStoryCopy(additional, `lib/questionnaires/result-content/${edition.name}.json`, units);
  const note: Text | undefined = "type" in edition ? {
    zh: `若本次有多個最高匹配，請分別讀各份說明。並列不會合成新的${edition.type}，也不會指定主次。分享公開說明只會開啟通用讀法，且不附個人計數或答案。`,
    en: `If several matches share the highest count, read each separately. A tie creates neither a new ${edition.en} nor a primary and secondary match. Sharing a public reading opens only the general guide, without personal counts or answers.`,
  } : undefined;
  const select = "mergeParagraphs" in edition
    ? (profile: Questionnaire["profiles"][number]) => mergeResultReadingParagraphs(profile, readings)
    : (profile: Questionnaire["profiles"][number]) => Object.hasOwn(readings, profile.id)
      ? { ...profile, sections: [...profile.sections, ...readings[profile.id]] }
      : profile;
  return { ...quiz, profiles: quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: "attribute" in edition ? edition.attribute : edition.name,
    select,
    note,
  })) };
}
