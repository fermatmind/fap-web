const profiles = {
  "attachment-styles": ["secure", "anxious", "avoidant", "fearful"],
  "communication-style": ["assertive", "passive", "aggressive", "passive-aggressive"],
} satisfies Record<string, readonly string[]>;

export const relationshipQuestionnaireSlugs = Object.keys(profiles);

export function relationshipQuestionnaireRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z-]+)(?:\/(take)|\/results\/([a-z-]+))?$/u.exec(path);
  if (!match) return null;
  const [, slug, take, profileId] = match;
  if (!Object.hasOwn(profiles, slug)) return null;
  const supportedProfiles = (profiles as Record<string, readonly string[]>)[slug];
  if (profileId && !supportedProfiles.includes(profileId)) return null;
  return { slug, take: Boolean(take), profileId };
}
