import { DISC_LANDING_PATH } from "@/lib/questionnaires/discRoutes";
import catalog from "./catalog.json";
import { GLOBAL_HISTORY_PATH, GLOBAL_HISTORY_PORTRAITS_UPDATED } from "./global-history/config";
import { historyPeople } from "./global-history/people";
import questionnaires from "../questionnaires/catalog.json";
import { gta6IndexablePaths } from "../questionnaires/gta6CharacterQuiz";
import { PUBLIC_PATH, RESOURCE_PATHS } from "../friendship/core";
import { isArchivedEntertainmentPath } from "../seo/discoverabilityExposurePolicy";

export function entertainmentSearchEntries(): { path: string; lastmod: string }[] {
  const entries = new Map<string, string>();
  for (const quiz of catalog) {
    if (questionnaires.some(native => native.slug === quiz.slug)) continue;
    const path = `/tests/explore/${quiz.slug}`;
    const lastmod = `${quiz.updated}T00:00:00.000Z`;
    entries.set(path, lastmod);
    for (const portrait of quiz.resultSlugs) entries.set(`${path}/results/${portrait}`, lastmod);
  }
  for (const quiz of questionnaires) {
    if (quiz.slug === "career-match") continue;
    const path = `/tests/explore/${quiz.slug}`;
    const lastmod = `${quiz.updated}T00:00:00.000Z`;
    entries.set(quiz.slug === "disc" ? DISC_LANDING_PATH : path, lastmod);
    for (const profile of quiz.resultSlugs) entries.set(`${path}/results/${profile}`, lastmod);
  }
  for (const [index, path] of gta6IndexablePaths.entries()) {
    entries.set(path, index === 0 ? "2026-11-21T00:00:00.000Z" : "2026-11-20T00:00:00.000Z");
  }
  for (const { id } of historyPeople) {
    entries.set(`${GLOBAL_HISTORY_PATH}/results/${id}`, GLOBAL_HISTORY_PORTRAITS_UPDATED);
  }
  return Array.from(entries, ([path, lastmod]) => ({ path, lastmod }))
    .filter(({ path }) => !isArchivedEntertainmentPath(path));
}

const friendshipSearchEntries = RESOURCE_PATHS.map(suffix => ({
  path: PUBLIC_PATH + suffix,
  lastmod: "2026-11-07T00:00:00.000Z",
}));

export const traditionalEntertainmentSearchCandidates = [...entertainmentSearchEntries(), ...friendshipSearchEntries];
export const entertainmentSearchPaths = new Set(traditionalEntertainmentSearchCandidates.map(({ path }) => path));
