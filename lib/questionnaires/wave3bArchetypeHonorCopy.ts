import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "./archetypeHonorCardCopy";
import copy from "./wave3b-archetype-honor-copy.json";
import titles from "./wave3b-archetype-titles.json";

export const wave3bArchetypeTitles: Readonly<Record<string, Record<DisplayLocale, string>>> = titles;
export const wave3bArchetypeHonorCorpus: Readonly<Record<string, Record<string, Record<DisplayLocale, readonly string[]>>>> = copy;

export function getWave3bArchetypeHonorCopy(slug: string, profileId: string, locale: DisplayLocale): ArchetypeHonorCopy {
  const row = wave3bArchetypeHonorCorpus[slug]?.[profileId]?.[locale];
  if (!row || row.length !== 4) throw new Error(`Missing Wave 3B honor copy for ${slug}/${profileId}/${locale}`);
  const [first, second, third, soulVerdict] = row;
  return { personalityTags: [first, second, third], soulVerdict };
}
