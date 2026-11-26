export const wave2bMultidimensional = [
  "moral-alignment", "8-values-political", "friendship-compatibility", "people-pleaser", "communication-style",
  "music-taste-test", "values", "conflict-styles", "hexaco", "attachment-styles", "freudian-personality",
  "love-languages", "relationship-preferences", "morality-6", "character-strengths", "intimacy-values", "parenting-style",
  "political-coordinates", "humor-style-test", "love-fight-style", "wholesome-partner", "apology-language",
  "difficult-person-test", "rizz-test", "conservatism", "relationship-commitment", "social-battery-test",
] as const;
export const wave2bScalars = ["introvert-extrovert", "optimism-pessimism"] as const;
export const wave2bPractices = [
  "logical-reasoning", "english-proficiency", "number-series", "situational-judgement", "problem-solving-critical-thinking",
  "german-proficiency", "word-skills", "abstract-reasoning", "aptitude-test", "computer-literacy", "numerical-reasoning",
  "communication-adaptability",
] as const;

const dimensions = new Set<string>(wave2bMultidimensional);
const scalars = new Set<string>(wave2bScalars);
const practices = new Set<string>(wave2bPractices);
const bigFive = new Set<string>([
  "moral-alignment", "8-values-political", "values", "hexaco", "freudian-personality", "morality-6",
  "character-strengths", "political-coordinates", "conservatism", ...wave2bScalars,
]);
const gold = new Set(["moral-alignment", "8-values-political", "values", "morality-6", "character-strengths", "political-coordinates", "conservatism", "optimism-pessimism"]);
const dusk = new Set(["friendship-compatibility", "people-pleaser", "love-languages", "attachment-styles", "relationship-preferences", "intimacy-values", "wholesome-partner", "apology-language", "relationship-commitment", "parenting-style", "social-battery-test"]);
const neon = new Set(["music-taste-test", "humor-style-test", "rizz-test", "love-fight-style"]);

export function wave2bVariant(slug: string) {
  const kind = dimensions.has(slug) ? "dimensions" : scalars.has(slug) ? "scalar" : practices.has(slug) ? "practice" : undefined;
  if (!kind) return;
  const theme = gold.has(slug) ? "gold" : dusk.has(slug) ? "dusk" : neon.has(slug) ? "neon" : "slate";
  const entryOnlyPoster = slug === "intimacy-values" || slug === "attachment-styles";
  return { kind, theme, bigFive: bigFive.has(slug), entryOnlyPoster,
    entryOnly: entryOnlyPoster || slug === "love-languages" || slug === "music-taste-test" } as const;
}
