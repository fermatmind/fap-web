import members from "./zh-TW/legacy-story-members.generated.json";

export const traditionalLegacyStorySlugs = Object.keys(members);

const results: Readonly<Record<string, readonly string[]>> = members;

export function hasTraditionalLegacyStory(slug: string): boolean {
  return Object.hasOwn(results, slug);
}

export function traditionalLegacyStoryPath(path: string): boolean {
  if (path === "/tests/play") return true;
  const match = /^\/tests\/play\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (!match || !hasTraditionalLegacyStory(match[1])) return false;
  return !match[3] || results[match[1]].includes(match[3]);
}
