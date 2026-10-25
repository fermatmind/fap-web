import type { Questionnaire } from "./types";

const loaders = {
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
