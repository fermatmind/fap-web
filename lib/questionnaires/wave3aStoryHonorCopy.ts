import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "./archetypeHonorCardCopy";
import everyday from "./wave3a-stories-copy/everyday.json";
import fantasy from "./wave3a-stories-copy/fantasy.json";
import metaphor from "./wave3a-stories-copy/metaphor.json";
import nature from "./wave3a-stories-copy/nature.json";
import relationships from "./wave3a-stories-copy/relationships.json";
import social from "./wave3a-stories-copy/social.json";
import titles from "./wave3a-stories-copy/titles.json";

export const wave3aStoryHonorCorpus: Readonly<Record<string, Readonly<Record<string, readonly string[][]>>>> = {
  ...everyday, ...fantasy, ...metaphor, ...nature, ...relationships, ...social,
};
const titleTable: Readonly<Record<string, readonly string[]>> = titles;
const localeIndexes = { zh: 0, "zh-TW": 1, en: 2 } as const;

export function getWave3aStoryHonorCopy(slug: string, ending: string, locale: DisplayLocale): ArchetypeHonorCopy & { shortTitle: string } {
  const index = localeIndexes[locale];
  const row = wave3aStoryHonorCorpus[slug]?.[ending]?.[index];
  const shortTitle = titleTable[slug]?.[index];
  if (!shortTitle || row?.length !== 4) throw new Error(`Missing story honor copy: ${slug}/${ending}/${locale}`);
  const [first, second, third, soulVerdict] = row;
  return { shortTitle, personalityTags: [first, second, third], soulVerdict };
}
