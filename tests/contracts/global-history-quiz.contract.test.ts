import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GLOBAL_HISTORY_QUESTION_COUNT, globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { closestHistoryPerson, historyAnswerVector, isHistoryVector } from "@/lib/entertainment/global-history/matching";
import { getHistoryGalleryPage, historyPeople } from "@/lib/entertainment/global-history/people";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

describe("World Edition history quiz", () => {
  it("can match every released figure through real options and provides a portrait for each", () => {
    expect(historyScenes).toHaveLength(GLOBAL_HISTORY_QUESTION_COUNT);
    expect(historyPeople).toHaveLength(199);
    expect(new Set(historyPeople.map(person => person.id)).size).toBe(historyPeople.length);
    expect(new Set(historyPeople.map(person => person.qid)).size).toBe(historyPeople.length);
    expect(new Set(historyPeople.map(person => person.vector.join(","))).size).toBe(historyPeople.length);
    for (const person of historyPeople) {
      expect(isHistoryVector(person.vector)).toBe(true);
      expect(person.bio.zh).toMatch(/\p{Script=Han}/u);
      expect(person.bio.en.length).toBeGreaterThan(5);
      expect(existsSync(`public${globalHistoryPortraitPath(person.id)}`)).toBe(true);
      const answers = historyScenes.map(({ axis, options }, index) => {
        const wanted = index < 6 ? Math.min(person.vector[axis], 3) : Math.max(person.vector[axis] - 3, 0);
        return options.findIndex(([value]) => value === wanted);
      });
      const vector = historyAnswerVector(answers);
      expect(vector).toEqual(person.vector);
      expect(closestHistoryPerson(vector!, historyPeople)?.id).toBe(person.id);
    }
    expect(historyAnswerVector([])).toBeNull();
    expect(historyAnswerVector(Array(12).fill(4))).toBeNull();
    expect(historyAnswerVector(Array(12).fill("1"))).toBeNull();
  });

  it("breaks distance ties by exact axes and then stable ID, independent of input order", () => {
    const seed = historyPeople[0];
    const lowerId = { ...seed, id: "a", vector: [4, 4, 4, 4, 3, 3] };
    const exact = { ...seed, id: "z", vector: [5, 3, 3, 3, 3, 3] };
    const sameExact = { ...seed, id: "y", vector: [1, 3, 3, 3, 3, 3] };
    const vector = [3, 3, 3, 3, 3, 3];
    expect(closestHistoryPerson(vector, [exact, lowerId])).toBe(exact);
    expect(closestHistoryPerson(vector, [exact, sameExact, lowerId])).toBe(sameExact);
    expect(closestHistoryPerson(vector, [lowerId, sameExact, exact])).toBe(sameExact);
  });

  it("matches the final person in a 1,000-entry pool", () => {
    const people = Array.from({ length: 1000 }, (_, index) => ({
      ...historyPeople[0], id: `candidate-${index}`, vector: Array.from({ length: 6 }, (_, axis) => Math.floor(index / 7 ** axis) % 7),
    }));
    expect(closestHistoryPerson(people[999].vector, people)?.id).toBe(people[999].id);
  });

  it("paginates the full roster and exposes only the two landing pages to indexing", () => {
    const end = getHistoryGalleryPage("9999");
    expect(getHistoryGalleryPage(["2", "3"]).page).toBe(1);
    expect(Array.from({ length: end.total }, (_, index) => getHistoryGalleryPage(String(index + 1)).people).flat()).toEqual(historyPeople);
    const paths = appendFunSitemapEntries([]).map(entry => new URL(entry.loc).pathname).filter(path => path.includes("/global-history-quiz"));
    for (const locale of ["zh", "en"] as const) {
      expect(isMissingFunRoute(globalHistoryPath(locale))).toBe(false);
      expect(isMissingFunRoute(`${globalHistoryPath(locale)}/take`)).toBe(false);
      expect(isMissingFunRoute(globalHistoryResultPath(locale, "mansa-musa"))).toBe(false);
      expect(isMissingFunRoute(globalHistoryResultPath(locale, "jorge-luis-borges"))).toBe(true);
    }
    expect(paths).toEqual([globalHistoryPath("en"), globalHistoryPath("zh")]);
  });
});
