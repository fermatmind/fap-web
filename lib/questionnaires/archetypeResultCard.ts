import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { CANONICAL_SITE_URL } from "@/lib/site";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeResult } from "./basicScoring";
import { questionnairePath } from "./paths";
import type { Questionnaire, QuestionnaireProfile } from "./types";

const groups = {
  neon: ["cyberpunk-edgerunners", "bleach", "space-marine-chapter", "hazbin-hotel-character-quiz", "dexter", "jujutsu-kaisen-character", "blue-lock", "stranger-things", "my-hero-academia-character-quiz", "superpower-test", "twilight-character"],
  gold: ["which-tarot-card-are-you", "harry-potter-character", "hogwarts-house-quiz", "dungeons-dragons-class", "game-of-thrones", "greek-god", "past-life", "mythical-creature", "spirit-animal", "moon-phase", "what-element-am-i"],
  dusk: ["chiikawa", "tsundere-dere-type", "aura-color", "my-little-pony-character-quiz", "flower", "barbie-character", "aesthetic-core-test", "what-dog-breed-am-i", "gilmore-girls", "gossip-girl", "amazing-digital-circus", "anime-character-archetype-test"],
  slate: ["wojak", "south-park", "temperament", "moral-dilemma-test", "male-archetype-test", "inkblot-personality-quiz", "inner-child-personality-test"],
} as const;

export type ArchetypeCardSlug = typeof groups[keyof typeof groups][number];
type Theme = keyof typeof groups;
type Target = "MBTI" | "BIG5_OCEAN" | "EQ_60" | "RIASEC";

const bigFive = new Set<ArchetypeCardSlug>([
  "aura-color", "spirit-animal", "which-tarot-card-are-you", "temperament", "flower", "moral-dilemma-test", "past-life", "moon-phase", "aesthetic-core-test", "greek-god", "inkblot-personality-quiz", "mythical-creature", "what-element-am-i",
]);
const interest = new Set<ArchetypeCardSlug>(["dungeons-dragons-class", "superpower-test"]);
const variants = new Map<ArchetypeCardSlug, { theme: Theme; target: Target }>();
for (const theme of Object.keys(groups) as Theme[]) {
  for (const slug of groups[theme]) {
    const target = bigFive.has(slug) ? "BIG5_OCEAN" : interest.has(slug) ? "RIASEC" : slug === "inner-child-personality-test" ? "EQ_60" : "MBTI";
    variants.set(slug, { theme, target });
  }
}

export const archetypePosterSize = { width: 1080, height: 1440 } as const;

export const archetypeCardThemes = {
  neon: { background: "#131019", glow: "#41232d", line: "#ac756d", light: "#f4bd9e", ink: "#fff2e7" },
  gold: { background: "#141c1a", glow: "#354337", line: "#a88b57", light: "#e9cc91", ink: "#fff3d9" },
  dusk: { background: "#1b1523", glow: "#493343", line: "#ab858b", light: "#eed0c8", ink: "#fff0eb" },
  slate: { background: "#16191d", glow: "#363940", line: "#93877c", light: "#e6cbb3", ink: "#faf0e5" },
} as const;

export function archetypeCardVariant(slug: string, locale: DisplayLocale) {
  return locale === "zh-TW" && slug === "chiikawa" ? undefined : variants.get(slug as ArchetypeCardSlug);
}

const shortEnglish: Partial<Record<ArchetypeCardSlug, string>> = {
  "anime-character-archetype-test": "Anime Story Roles", "aesthetic-core-test": "Aesthetic Core",
  "flower": "Flower Metaphors", "greek-god": "Greek Gods", "mythical-creature": "Mythical Creatures",
  "which-tarot-card-are-you": "Tarot Cards", "what-dog-breed-am-i": "Dog Breeds", "what-element-am-i": "Four Elements",
  "cyberpunk-edgerunners": "Edgerunners", "space-marine-chapter": "Space Marine Chapter",
  "inkblot-personality-quiz": "Inkblot Reflections", "inner-child-personality-test": "Inner Child",
};

export function archetypeCardShortTitle(quiz: Questionnaire, locale: DisplayLocale, copy: (value: string) => string) {
  if (locale === "en") {
    return shortEnglish[quiz.slug as ArchetypeCardSlug] ?? quiz.title.en.split(/: (?=Which\b)/u)[0]
      .replace(/(?: Character| Personality)? (?:Test|Quiz)$/iu, "");
  }
  return copy(quiz.title.zh.replace(/（[^）]+）/gu, "").replace(/[《》]/gu, "").replace(/(?:角色|人格|性格)?(?:测试|測試|測驗)$/u, ""));
}

export type CompleteArchetype = Extract<ArchetypeResult, { status: "complete" }>;

export function archetypeRunnerUp(quiz: Questionnaire, result: CompleteArchetype) {
  if (result.profileIds.length !== 1) return undefined;
  const winner = quiz.profiles.find(profile => profile.id === result.profileIds[0]);
  if (!winner) return undefined;
  const max = result.counts[winner.directionIds[0]];
  const lower = quiz.profiles.filter(profile => profile.id !== winner.id);
  const next = Math.max(...lower.map(profile => result.counts[profile.directionIds[0]]));
  if (!Number.isFinite(max) || next <= 0 || next >= max) return undefined;
  const matches = lower.filter(profile => result.counts[profile.directionIds[0]] === next);
  return matches.length === 1 ? matches[0] : undefined;
}

export function archetypeResultName(profile: QuestionnaireProfile, locale: DisplayLocale, copy: (value: string) => string) {
  const source = locale === "en" ? profile.title.en : copy(profile.title.zh);
  return source.split(/[：:]\s*/u)[0];
}

export function archetypeCardUrl(locale: DisplayLocale, slug: string) {
  return `${CANONICAL_SITE_URL}${questionnairePath(locale, slug)}`;
}

export function archetypeCorePath(locale: DisplayLocale, target: Target) {
  return `/${locale}/tests/${SCALE_CANONICAL_SLUG_MAP[target]}`;
}
