import type { Locale } from "@/lib/i18n/locales";

// Frozen Mode A long-tail cohort.
const batchFour = new Set([
  "abstract-reasoning", "aptitude-test", "computer-literacy",
  "conservatism", "data-entry", "english-proficiency",
  "flower", "freudian-personality", "german-proficiency",
  "harry-potter-character", "hexaco", "logical-reasoning",
  "moral-alignment", "moral-dilemma-test", "morality-6",
  "my-little-pony-character-quiz", "number-series", "numerical-reasoning",
  "optimism-pessimism", "political-coordinates", "problem-solving-critical-thinking",
  "situational-judgement", "stranger-things", "temperament",
  "values",
]);

export function isModeABatchFour(slug: string): boolean {
  return batchFour.has(slug);
}

// Public landing copy can follow observed search intent independently of the question bank.
const landingTitles: Readonly<Partial<Record<string, Partial<Record<Locale, string>>>>> = {
  temperament: { en: "Four Temperaments Test: Find Your Temperament in 24 Questions" },
  "my-little-pony-character-quiz": { en: "My Little Pony Character Quiz: Which Pony Are You?" },
  "logical-reasoning": { zh: "逻辑推理测试：24 道演绎推理题与完整解析" },
};

export function modeABatchFourLandingTitle(slug: string, locale: Locale): string | undefined {
  return landingTitles[slug]?.[locale];
}
