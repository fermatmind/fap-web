import type { Questionnaire } from "./types";

const loaders = {
  "which-tarot-card-are-you": async () => (await import("./data/which-tarot-card-are-you.json")).default as Questionnaire,
  "greek-god": async () => (await import("./data/greek-god.json")).default as Questionnaire,
  "hogwarts-house-quiz": async () => (await import("./data/hogwarts-house-quiz.json")).default as Questionnaire,
  "tsundere-dere-type": async () => (await import("./data/tsundere-dere-type.json")).default as Questionnaire,
  "character-strengths": async () => (await import("./data/character-strengths.json")).default as Questionnaire,
  "learning-style": async () => (await import("./data/learning-style.json")).default as Questionnaire,
  "procrastinator-type-test": async () => (await import("./data/procrastinator-type-test.json")).default as Questionnaire,
  "likable-person-test": async () => (await import("./data/likable-person-test.json")).default as Questionnaire,
  "difficult-person-test": async () => (await import("./data/difficult-person-test.json")).default as Questionnaire,
  "people-pleaser": async () => (await import("./data/people-pleaser.json")).default as Questionnaire,
  "music-taste-test": async () => (await import("./data/music-taste-test.json")).default as Questionnaire,
  "aesthetic-core-test": async () => (await import("./data/aesthetic-core-test.json")).default as Questionnaire,
  "travel-personality-test": async () => (await import("./data/travel-personality-test.json")).default as Questionnaire,
  "humor-style-test": async () => (await import("./data/humor-style-test.json")).default as Questionnaire,
  "leadership-style": async () => (await import("./data/leadership-style.json")).default as Questionnaire,
  "communication-style": async () => (await import("./data/communication-style.json")).default as Questionnaire,
  "attachment-styles": async () => (await import("./data/attachment-styles.json")).default as Questionnaire,
  "love-languages": async () => (await import("./data/love-languages.json")).default as Questionnaire,
  temperament: async () => (await import("./data/temperament.json")).default as Questionnaire,
  "introvert-extrovert": async () => (await import("./data/introvert-extrovert.json")).default as Questionnaire,
  "jungian-archetype": async () => (await import("./data/jungian-archetype.json")).default as Questionnaire,
  "moral-alignment": async () => (await import("./data/moral-alignment.json")).default as Questionnaire,
  "superpower-test": async () => (await import("./data/superpower-test.json")).default as Questionnaire,
  "mythical-creature": async () => (await import("./data/mythical-creature.json")).default as Questionnaire,
  "what-dog-breed-am-i": async () => (await import("./data/what-dog-breed-am-i.json")).default as Questionnaire,
  flower: async () => (await import("./data/flower.json")).default as Questionnaire,
  "spirit-animal": async () => (await import("./data/spirit-animal.json")).default as Questionnaire,
  "social-battery-test": async () => (await import("./data/social-battery-test.json")).default as Questionnaire,
  "response-color": async () => (await import("./data/response-color.json")).default as Questionnaire,
  disc: async () => (await import("./data/disc.json")).default as Questionnaire,
};

export async function loadQuestionnaire(slug: string): Promise<Questionnaire | null> {
  return Object.prototype.hasOwnProperty.call(loaders, slug) ? loaders[slug as keyof typeof loaders]() : null;
}
