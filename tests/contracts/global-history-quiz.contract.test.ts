import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GLOBAL_HISTORY_QUESTION_COUNT, globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { closestHistoryPerson, historyAnswerVector, isHistoryVector } from "@/lib/entertainment/global-history/matching";
import { getHistoryGalleryPage, historyPeople } from "@/lib/entertainment/global-history/people";
import cox from "@/lib/entertainment/global-history/cox-estimates.json";
import evidence from "@/lib/entertainment/global-history/new-vector-evidence.json";
import { getCoxEstimate, getHistoryResult, historyBatchEditorial } from "@/lib/entertainment/global-history/result-v2";
import { historyAxes, historyScenes } from "@/lib/entertainment/global-history/questions";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

describe("World Edition history quiz", () => {
  it("can match every released figure through real options and provides a portrait for each", () => {
    expect(historyScenes).toHaveLength(GLOBAL_HISTORY_QUESTION_COUNT);
    expect(historyPeople).toHaveLength(488);
    expect(Object.keys(evidence)).toHaveLength(289);
    expect(new Set(historyPeople.map(person => person.id)).size).toBe(historyPeople.length);
    expect(new Set(historyPeople.map(person => person.qid)).size).toBe(historyPeople.length);
    expect(new Set(historyPeople.map(person => person.vector.join(","))).size).toBe(historyPeople.length);
    for (const person of historyPeople) {
      expect(isHistoryVector(person.vector)).toBe(true);
      expect(person.bio.zh).toMatch(/\p{Script=Han}/u);
      expect(person.bio.en.length).toBeGreaterThan(5);
      expect(existsSync(`public${globalHistoryPortraitPath(person.id)}`)).toBe(true);
      for (const locale of ["zh", "en"] as const) {
        expect(isMissingFunRoute(globalHistoryResultPath(locale, person.id))).toBe(false);
      }
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

  it("binds only released Cox identities and requires six documented axes for each roster addition", () => {
    const trait = {
      zh: /^[高低](开放性|尽责性|外倾性|宜人性|神经质)$/,
      "zh-TW": /^[高低](開放性|盡責性|外傾性|宜人性|神經質)$/,
      en: /^(High|Low) (openness|conscientiousness|extraversion|agreeableness|neuroticism)$/i,
    };
    for (const person of historyPeople) {
      const result = getHistoryResult(person);
      expect(result, person.id).toBeDefined();
      expect(result!.six_dimensions.map(({ score }) => score)).toEqual(person.vector);
      for (const { axis, score, baseline } of result!.six_dimensions) {
        expect(baseline).toEqual(score < 3 ? axis.low : score > 3 ? axis.high : { zh: "视情况而定", "zh-TW": "視情況而定", en: "Depends on the situation" });
      }
    }
    const rows = Object.entries(cox.entries);
    expect(rows).toHaveLength(301);
    const bound = rows.flatMap(([, row]) => row.person_id ? [row.person_id] : []);
    expect(bound).toHaveLength(301);
    expect(new Set(bound).size).toBe(bound.length);
    expect(historyPeople.filter(person => !getCoxEstimate(person.id))).toHaveLength(187);
    for (const [reference, row] of rows) {
      expect(reference).toBe(`${row.table}:${row.sheet_row}`);
      expect(Number.isInteger(row.childhood_corrected) && Number.isInteger(row.youth_corrected)).toBe(true);
      if (row.person_id) expect(historyPeople.some(person => person.id === row.person_id)).toBe(true);
    }
    expect(getCoxEstimate("voltaire")?.youth_corrected).toBe(190);
    expect(getCoxEstimate("blaise-pascal")?.youth_corrected).toBe(195);
    expect(getCoxEstimate("gilbert-burnet")).toMatchObject({ name: "Thomas Burnet", dates: "1643-1715", sheet_row: "1-5-2", youth_corrected: 165 });
    expect(getCoxEstimate("li-bai")).toBeUndefined();
    expect(Object.keys(evidence).sort()).toEqual(historyPeople.slice(199).map(person => person.id).sort());
    for (const record of Object.values(evidence)) {
      expect(Object.keys(record.axes)).toEqual(historyAxes.map(axis => axis.en));
      expect(record.source).toMatch(/^https:\/\//);
      expect(Object.values(record.axes).every(text => text.length > 12)).toBe(true);
    }
    expect(Object.keys(historyBatchEditorial)).toHaveLength(486);
    for (const [id, copy] of Object.entries(historyBatchEditorial)) {
      const person = historyPeople.find(row => row.id === id);
      expect(person).toBeDefined();
      expect(getHistoryResult(person!)?.iq_benchmark.has_cox_data).toBe(Boolean(getCoxEstimate(id)));
      for (const locale of ["zh", "zh-TW", "en"] as const) {
        expect(copy.archetype_title[locale]).toBeTruthy();
        expect(copy.one_line_hook[locale]).toBeTruthy();
        expect(copy.tags[locale]).toHaveLength(3);
        expect(copy.superpower[locale].length).toBeGreaterThanOrEqual(60);
        expect(copy.quirk_or_blindspot[locale].length).toBeGreaterThanOrEqual(60);
        if (locale !== "en") {
          expect(copy.superpower[locale].length).toBeLessThanOrEqual(80);
          expect(copy.quirk_or_blindspot[locale].length).toBeLessThanOrEqual(80);
        }
        const tags = copy.personality_benchmark.big_five_traits[locale];
        expect(tags.length).toBeGreaterThan(0);
        expect(tags.every(label => trait[locale].test(label)), `${id}/${locale}: ${tags}`).toBe(true);
        if (!getCoxEstimate(id)) {
          expect(copy.cognitive_gift_tag?.[locale], `${id}/${locale}`).toBeTruthy();
          expect(copy.personality_benchmark.title[locale]).not.toBe(copy.cognitive_gift_tag?.[locale]);
        }
      }
    }
  });

  it("pairs both story labels with the same low, neutral or high direction", () => {
    const liBai = historyPeople.find(person => person.id === "li-bai")!;
    const newton = historyPeople.find(person => person.id === "isaac-newton")!;
    const li = getHistoryResult(liBai)!;
    const newt = getHistoryResult(newton)!;
    expect(li.six_dimensions.map(({ score }) => score)).toEqual(liBai.vector);
    expect(newt.six_dimensions.map(({ score }) => score)).toEqual(newton.vector);
    expect(li.six_dimensions[1]).toMatchObject({ labels: { zh: "单兵作战狂魔" }, baseline: historyAxes[1].low });
    expect(li.six_dimensions[2]).toMatchObject({ labels: { zh: "先抛个大胆假设" }, baseline: historyAxes[2].high });
    expect(newt.six_dimensions[5]).toMatchObject({ labels: { zh: "幕后把事推成" }, baseline: historyAxes[5].low });
    const collaboration = Array.from({ length: 7 }, (_, score) => {
      const vector = [...liBai.vector];
      vector[1] = score;
      return getHistoryResult({ ...liBai, vector })!.six_dimensions[1];
    });
    expect(collaboration.map(({ labels }) => labels.zh)).toEqual([
      "单兵作战狂魔", "单兵作战狂魔", "单兵作战狂魔", "单刷组队都能打", "一开口就组局", "一开口就组局", "一开口就组局",
    ]);
    expect(collaboration.map(({ baseline }) => baseline.zh)).toEqual([
      "先独立完成", "先独立完成", "先独立完成", "视情况而定", "先把人聚在一起", "先把人聚在一起", "先把人聚在一起",
    ]);
    expect(li.personality_benchmark.big_five_traits.zh).toEqual(["高开放性", "高外倾性", "低尽责性"]);
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

  it("paginates the full roster while keeping the archived World Edition out of the sitemap", () => {
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
    expect(paths).toEqual([]);
  });

  it("projects the complete Taiwan roster without altering IDs, matching or original languages", () => {
    let translated = 0;
    for (const source of historyPeople) {
      const display = displayHistoryPerson(source, "zh-TW");
      expect([display.id, display.qid, display.vector]).toEqual([source.id, source.qid, source.vector]);
      expect([display.name.en, display.region.en, display.field.en, display.bio.en])
        .toEqual([source.name.en, source.region.en, source.field.en, source.bio.en]);
      expect(displayHistoryPerson(source, "zh")).toBe(source);
      if (source.name["zh-TW"]) expect(display.name.zh).toBe(source.name["zh-TW"]);
      expect(traditionalPath(globalHistoryResultPath("en", source.id))).toBe(globalHistoryResultPath("zh-TW", source.id));
      if (display.bio.zh !== source.bio.zh) translated++;
    }
    expect(translated).toBeGreaterThan(180);
    expect(traditionalPath(globalHistoryPath("en"))).toBe(globalHistoryPath("zh-TW"));
    expect(traditionalPath(`${globalHistoryPath("zh-TW")}/take`)).toBe(`${globalHistoryPath("zh-TW")}/take`);
    expect(traditionalPath(globalHistoryResultPath("zh-TW", "unknown"))).toBeNull();
  });
});
