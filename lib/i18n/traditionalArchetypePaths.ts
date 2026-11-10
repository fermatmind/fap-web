import members from "./zh-TW/archetype-questionnaire-members.generated.json";

const profiles: Readonly<Record<string, readonly string[]>> = members;

export function hasTraditionalArchetype(slug: string): boolean {
  return Object.hasOwn(profiles, slug);
}

export function traditionalArchetypeRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !hasTraditionalArchetype(match[1]) || (match[3] && !profiles[match[1]].includes(match[3]))) return null;
  return { slug: match[1], take: Boolean(match[2]), profile: match[3] };
}
