import catalog from "./catalog.json";
import { globalHistoryStory } from "./directory";
import questionnaires from "../questionnaires/catalog.json";
import { PUBLIC_PATH, RESOURCE_PATHS } from "../friendship/core";

export function entertainmentSearchEntries(): { path: string; lastmod: string }[] {
  const entries = new Map<string, string>();
  for (const quiz of [...catalog, globalHistoryStory]) {
    if (questionnaires.some(native => native.slug === quiz.slug)) continue;
    const path = `/tests/play/${quiz.slug}`;
    const lastmod = `${quiz.updated}T00:00:00.000Z`;
    entries.set(path, lastmod);
    for (const portrait of quiz.resultSlugs) entries.set(`${path}/results/${portrait}`, lastmod);
  }
  for (const quiz of questionnaires) {
    const path = `/tests/${quiz.collection}/${quiz.slug}`;
    const lastmod = `${quiz.updated}T00:00:00.000Z`;
    entries.set(path, lastmod);
    for (const profile of quiz.resultSlugs) entries.set(`${path}/results/${profile}`, lastmod);
  }
  return Array.from(entries, ([path, lastmod]) => ({ path, lastmod }));
}

const friendshipSearchEntries = RESOURCE_PATHS.map(suffix => ({
  path: PUBLIC_PATH + suffix,
  lastmod: "2026-11-07T00:00:00.000Z",
}));

export const traditionalEntertainmentSearchCandidates = [...entertainmentSearchEntries(), ...friendshipSearchEntries];
export const entertainmentSearchPaths = new Set(traditionalEntertainmentSearchCandidates.map(({ path }) => path));
