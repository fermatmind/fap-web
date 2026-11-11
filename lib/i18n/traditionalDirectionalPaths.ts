const profiles: Readonly<Record<string, readonly string[]>> = {
  "adult-age-preferences": ["older-adult-context", "similar-age-context", "younger-adult-context", "older-similar-tie", "older-younger-tie", "similar-younger-tie", "all-three-tied"],
  "disc": ["single-d", "single-i", "single-s", "single-c", "tied-d-i", "tied-d-s", "tied-d-c", "tied-i-s", "tied-i-c", "tied-s-c", "tied-d-i-s", "tied-d-i-c", "tied-d-s-c", "tied-i-s-c", "tied-d-i-s-c"],
  "egen-teto": ["egen", "teto", "tie"],
  "food-choice": ["familiar", "formal", "mix", "familiar-formal", "familiar-mix", "formal-mix", "all-three"],
  "likable-person-test": ["warmth", "follow-through", "lightness", "curiosity", "boundaries", "warmth-follow-through", "warmth-lightness", "warmth-curiosity", "warmth-boundaries", "follow-through-lightness", "follow-through-curiosity", "follow-through-boundaries", "lightness-curiosity", "lightness-boundaries", "curiosity-boundaries", "warmth-follow-through-lightness", "warmth-follow-through-curiosity", "warmth-follow-through-boundaries", "warmth-lightness-curiosity", "warmth-lightness-boundaries", "warmth-curiosity-boundaries", "follow-through-lightness-curiosity", "follow-through-lightness-boundaries", "follow-through-curiosity-boundaries", "lightness-curiosity-boundaries", "follow-through-lightness-curiosity-boundaries", "warmth-lightness-curiosity-boundaries", "warmth-follow-through-curiosity-boundaries", "warmth-follow-through-lightness-boundaries", "warmth-follow-through-lightness-curiosity", "all-five-tied"],
  "love-personality": ["clear-expression", "attuned-response", "space-regulation", "repair-engagement", "expression-response-tie", "expression-space-tie", "expression-repair-tie", "response-space-tie", "response-repair-tie", "space-repair-tie", "expression-response-space-tie", "expression-response-repair-tie", "expression-space-repair-tie", "response-space-repair-tie", "four-directions-tied"],
  "relationship-values": ["romantic-expression", "practical-partnership", "emotional-companionship", "growth-autonomy", "rituals-cooperation-tie", "rituals-companionship-tie", "rituals-autonomy-tie", "cooperation-companionship-tie", "cooperation-autonomy-tie", "companionship-autonomy-tie", "rituals-cooperation-companionship-tie", "rituals-cooperation-autonomy-tie", "rituals-companionship-autonomy-tie", "cooperation-companionship-autonomy-tie", "four-values-tied"],
  "response-color": ["red", "yellow", "blue", "green", "tied-red-yellow", "tied-red-blue", "tied-red-green", "tied-yellow-blue", "tied-yellow-green", "tied-blue-green", "tied-red-yellow-blue", "tied-red-yellow-green", "tied-red-blue-green", "tied-yellow-blue-green", "tied-red-yellow-blue-green"],
};

export function hasTraditionalDirectional(slug: string) {
  return Object.hasOwn(profiles, slug);
}

export function traditionalDirectionalRoute(path: string) {
  const match = /^\/tests\/(explore|play)\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (!match) return null;
  const [, collection, slug, take, profile] = match;
  if (!hasTraditionalDirectional(slug)) return null;
  const canonicalCollection = slug === "relationship-values" || slug === "response-color" ? "play" : "explore";
  if (collection !== canonicalCollection || (profile && !profiles[slug].includes(profile))) return null;
  return { slug, take: Boolean(take), profile };
}
