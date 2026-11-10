const profiles = {
  "locus-of-control": ["control-continuum"],
  empathy: ["compassion-reading"],
  "social-intelligence-test": ["social-understanding-guide"],
} as const;

export function traditionalLikertRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (!match) return null;
  const [, slug, take, profile] = match;
  if (!Object.hasOwn(profiles, slug)) return null;
  const supported: readonly string[] = profiles[slug as keyof typeof profiles];
  if (profile && !supported.includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
