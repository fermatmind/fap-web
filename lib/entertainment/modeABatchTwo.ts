// Frozen Mode A cohort for the second entertainment SEO release.
const batchTwo = new Set([
  "inner-child-personality-test", "superpower-test", "spirit-animal", "hogwarts-house-quiz",
  "mythical-creature", "wojak", "greek-god", "dungeons-dragons-class", "which-tarot-card-are-you",
  "amazing-digital-circus", "game-of-thrones", "blue-lock", "gilmore-girls", "gossip-girl",
  "jujutsu-kaisen-character", "my-hero-academia-character-quiz", "barbie-character", "dexter",
  "inkblot-personality-quiz", "what-element-am-i", "aesthetic-core-test", "character-strengths",
  "hazbin-hotel-character-quiz", "past-life", "twilight-character",
]);

export function isModeABatchTwo(slug: string): boolean {
  return batchTwo.has(slug);
}
