const profiles = {
  "mental-age": ["understanding-your-playful-age"],
  "patronus-quiz": ["stag", "doe", "fox", "wolf", "otter", "cat", "dog", "hare", "badger", "hedgehog", "squirrel", "mouse", "horse", "mountain-goat", "red-panda", "bear", "lynx", "tiger", "lion", "cheetah", "elephant", "robin", "owl", "raven", "eagle", "heron", "swan", "kingfisher", "hummingbird", "albatross", "dolphin", "seal", "whale", "sea-turtle", "seahorse", "manta-ray", "phoenix", "unicorn", "dragon", "hippogriff"],
  "prakriti-inventory21": ["vata", "pitta", "kapha"],
  "rice-purity-test": ["score-reading"],
  "sbti-test": ["self-critic", "initiator", "caregiver", "social-adapter", "detached-observer", "pause-taker", "action-starter", "pressure-speaker", "contingency-planner", "lightener", "expressive-styler", "easygoing", "resource-keeper", "risk-watcher", "quiet-observer", "venting-fixer", "appreciator", "improviser", "giver", "reflective-thinker", "independent-walker", "romantic-connector", "surprised-commentator", "atmosphere-seeker", "low-battery-rebuilder"],
} as const;

export function hasTraditionalMixedQuestionnaire(slug: string): boolean {
  return slug === "food-disgust" || Object.hasOwn(profiles, slug);
}

export function traditionalMixedQuestionnaireRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !Object.hasOwn(profiles, match[1])) return null;
  const [, slug, take, profile] = match;
  const allowed: readonly string[] = profiles[slug as keyof typeof profiles];
  if (profile && !allowed.includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
