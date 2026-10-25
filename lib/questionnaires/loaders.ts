import type { Questionnaire } from "./types";

const loaders = {
  disc: async () => (await import("./data/disc.json")).default as Questionnaire,
};

export async function loadQuestionnaire(slug: string): Promise<Questionnaire | null> {
  return Object.prototype.hasOwnProperty.call(loaders, slug) ? loaders[slug as keyof typeof loaders]() : null;
}
