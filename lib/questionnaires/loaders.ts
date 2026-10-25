import type { Questionnaire } from "./types";

const loaders = {
  "response-color": async () => (await import("./data/response-color.json")).default as Questionnaire,
  disc: async () => (await import("./data/disc.json")).default as Questionnaire,
};

export async function loadQuestionnaire(slug: string): Promise<Questionnaire | null> {
  return Object.prototype.hasOwnProperty.call(loaders, slug) ? loaders[slug as keyof typeof loaders]() : null;
}
