import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/sbti-test.json";
import reference from "@/tests/fixtures/questionnaires/sbti50-count-reference.json";
import { isSbti50ConfigurationValid, scoreSbti50, SBTI50_THEME_IDS } from "@/lib/questionnaires/sbti50";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";

const answers = (codes = "A".repeat(50)) => Object.fromEntries(data.questions.map((q, index) => [q.id, codes[index]]));
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
describe("SBTI50 original Web repair: literal balanced choices", () => {
  it("binds the new bank and every full guide to their explicit edition without adopting legacy31/hash claims", async () => {
    expect(isSbti50ConfigurationValid(data)).toBe(true);
    if (!isSbti50ConfigurationValid(data)) throw Error("Invalid SBTI50 manuscript");
    expect(hash(data.questions)).toBe(reference.itemBankSha256);
    expect(hash(data.profiles)).toBe(reference.resultContentSha256);
    expect(data.source.itemBankSha256).toBe(reference.itemBankSha256);
    expect(data.source.resultContentSha256).toBe(reference.resultContentSha256);
    expect(await loadQuestionnaire(data.slug)).toEqual(data);
    expect(isQuestionnaireConfigurationValid(data)).toBe(true);
    expect(scoreQuestionnaire(data, answers()).status).toBe("unavailable");
    const ids = data.directions.map(d => d.id);
    expect(ids).toEqual(SBTI50_THEME_IDS);
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(data.questions.flatMap(q => q.options.map(o => o.label[locale]))).size).toBe(100);
      expect(new Set(data.profiles.flatMap(p => p.sections.slice(0, 5).flatMap(s => s.paragraphs.map(p => p[locale])))).size).toBe(250);
      for (const profile of data.profiles) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/sbti-test/results/${profile.id}`)).toBe(true);
      expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/sbti-test`)).toBe(true);
    }
    for (const id of ids) {
      const exposures = data.questions.flatMap(q => q.options.filter(o => o.directionId === id).map(o => o.id));
      expect(exposures.filter(o => o === "A")).toHaveLength(2);
      expect(exposures.filter(o => o === "B")).toHaveLength(2);
    }
  });
  it("matches 25 independently stored unique-leading witnesses and both complete ties, without selecting one tie winner", () => {
    for (const witness of reference.witnesses) {
      const result = scoreSbti50(data, answers(witness.codes));
      expect(result.status).toBe("complete");
      if (result.status !== "complete") throw Error(result.status);
      expect(result.counts).toEqual(witness.counts);
      expect(result.leadingThemes).toEqual(witness.top);
      expect(result.highestCount).toBe(witness.themeId === "all-tied" ? 2 : 4);
      expect(Object.values(result.counts).reduce((a, b) => a + b, 0)).toBe(50);
      expect(Object.keys(result)).toEqual(["status", "answered", "counts", "highestCount", "leadingThemes"]);
    }
  });
  it("changes exactly two raw counts for every single-choice edit, independent of answer property order", () => {
    for (let index = 0; index < 50; index++) {
      const selections = answers(); selections[data.questions[index].id] = "B";
      const result = scoreSbti50(data, selections);
      if (result.status !== "complete") throw Error(result.status);
      for (const id of SBTI50_THEME_IDS) {
        const pair = data.questions[index].options;
        expect(result.counts[id]).toBe(2 - Number(pair[0].directionId === id) + Number(pair[1].directionId === id));
      }
      expect(scoreSbti50(data, Object.fromEntries(Object.entries(selections).reverse()))).toEqual(result);
    }
  });
  it("withholds counts for each missing position and rejects malformed sheets without invoking an accessor", () => {
    expect(scoreSbti50(data, {})).toEqual({ status: "incomplete", answered: 0 });
    for (const q of data.questions) {
      const incomplete = answers(); delete incomplete[q.id];
      expect(scoreSbti50(data, incomplete)).toEqual({ status: "incomplete", answered: 49 });
    }
    let invoked = false;
    const getter = Object.defineProperty({}, data.questions[0].id, { enumerable: true, get() { invoked = true; return "A"; } });
    for (const sheet of [null, [], new Date(), 2, Object.create({ inherited: "A" }), getter,
      { ...answers(), unknown: "A" }, { ...answers(), SBTI50_001: "a" }, { ...answers(), SBTI50_001: 1 },
      { ...answers(), SBTI50_001: "" }, { ...answers(), SBTI50_001: "C" }, { ...answers(), [Symbol()]: "A" }]) {
      expect(scoreSbti50(data, sheet).status).toBe("invalid");
    }
    expect(invoked).toBe(false);
  });
  it("fails closed for missing reports, unbalanced/reassigned choices, unknown method identity and sparse configuration", () => {
    const changes = [
      (q: typeof data) => { q.questions[0].options[0].directionId = "initiator"; },
      (q: typeof data) => { q.questions[0].options[1].id = "A"; },
      (q: typeof data) => { q.questions[0].options[0].score = 2; },
      (q: typeof data) => { delete q.questions[1]; },
      (q: typeof data) => { delete q.questions[0].options[0]; },
      (q: typeof data) => { q.questions[0].reverse = true; },
      (q: typeof data) => { q.profiles[24].sections[0].paragraphs[0].zh = ""; },
      (q: typeof data) => { q.profiles.pop(); },
      (q: typeof data) => { q.directions[0].itemCount = 5; },
      (q: typeof data) => { q.source.scoringVersion = "legacy_hash"; },
      (q: typeof data) => { q.faq.pop(); },
    ];
    for (const change of changes) {
      const broken = structuredClone(data); change(broken);
      expect(isSbti50ConfigurationValid(broken)).toBe(false);
      expect(scoreSbti50(broken, answers())).toEqual({ status: "unavailable", answered: 0 });
    }
  });
});
