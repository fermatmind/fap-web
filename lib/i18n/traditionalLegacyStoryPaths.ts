import { CHANGAN_PORTRAITS, CHANGAN_SLUG } from "@/lib/entertainment/changan";
import members from "./zh-TW/legacy-story-members.generated.json";
import natureMembers from "./zh-TW/nature-story-members.generated.json";

export const traditionalLegacyStorySlugs = Object.keys(members);
export const traditionalNatureStorySlugs = Object.keys(natureMembers);

const results: Readonly<Record<string, readonly string[]>> = members;
const natureResults: Readonly<Record<string, readonly string[]>> = natureMembers;

export function hasTraditionalLegacyStory(slug: string): boolean {
  return Object.hasOwn(results, slug);
}

export function hasTraditionalNatureStory(slug: string): boolean {
  return Object.hasOwn(natureResults, slug);
}

export function traditionalLegacyStoryPath(path: string): boolean {
  if (path === "/tests/play") return true;
  const match = /^\/tests\/play\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (match?.[1] === CHANGAN_SLUG) return !match[3] || CHANGAN_PORTRAITS.some(id => id === match[3]);
  if (match && hasTraditionalNatureStory(match[1])) return !match[3] || natureResults[match[1]].includes(match[3]);
  if (!match || !hasTraditionalLegacyStory(match[1])) return false;
  return !match[3] || results[match[1]].includes(match[3]);
}
