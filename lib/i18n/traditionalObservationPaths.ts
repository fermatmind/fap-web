const profiles: Readonly<Record<string, readonly string[]>> = {
  "care-feelings-reflection": ["remembered-emotional-attention-reading", "remembered-feelings-responses-reading", "remembered-comfort-and-support-reading", "feelings-and-support-now-reading"],
  "connection-belonging-check-in": ["felt-distance-reading", "wanted-listening-reading", "finding-belonging-reading"],
  "disconnection-experiences-reflection": ["experience-of-self-reading", "experience-of-surroundings-reading", "absorption-and-attention-reading", "everyday-recall-uncertainty-reading"],
  "emotions-connections-reflection": ["separation-feelings-reading", "changing-views-reading", "self-understanding-reading", "quick-decisions-reading", "feeling-shifts-reading", "emptiness-experiences-reading", "anger-experiences-reading"],
  "feelings-connection-reflection": ["feelings-and-settling-reading", "closeness-and-boundaries-reading"],
  "social-context-reflection": ["being-observed-reading", "conversations-and-contact-reading", "changing-social-plans-reading", "sensations-in-social-context-reading"],
};

export function hasTraditionalObservation(slug: string) {
  return Object.hasOwn(profiles, slug);
}

export function traditionalObservationRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (!match) return null;
  const [, slug, take, profile] = match;
  if (!hasTraditionalObservation(slug)) return null;
  if (profile && !profiles[slug].includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
