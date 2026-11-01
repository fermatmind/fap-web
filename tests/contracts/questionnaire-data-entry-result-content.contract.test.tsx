import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/data-entry.json";
import content from "@/lib/questionnaires/result-content/data-entry.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isDataEntryConfigurationValid, scoreDataEntryRound } from "@/lib/questionnaires/dataEntry";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
describe("Two bilingual structured-entry result readings", () => {
  it("preserves original records and scoring while adding both complete readings", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.dataEntry).toBe(quiz.dataEntry);
    expect(prepared.questions).toBe(quiz.questions);
    expect(isDataEntryConfigurationValid(prepared)).toBe(true);
    for (const [i, p] of prepared.profiles.entries()) {
      expect(p.sections.slice(0, 7)).toEqual(quiz.profiles[i].sections);
      expect(p.sections).toHaveLength(9);
    }
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
  });
  it("checks the unequal-length and swapped-record examples without conflating metric units", () => {
    const round = structuredClone(quiz.dataEntry!.rounds[0]);
    round.records[0].values = ["ST-012", "Oak Box", "004", "C-09"];
    const row = { recordId: round.records[0].id, values: ["ST-012", "oak Box", "004", "C-09"] };
    expect(scoreDataEntryRound(round, [row], 60000)).toMatchObject({ fieldAccuracy: 75, exactRecords: 0, enteredCharacters: 20, exactFieldCharacters: 13, characterKph: 1200, exactFieldCharacterKph: 780 });
    expect(scoreDataEntryRound(round, [row, { recordId: round.records[1].id, values: ["", "", "", ""] }], 60000)).toMatchObject({ consideredFields: 8, exactFields: 3, fieldAccuracy: 37.5 });
    const dispatch = structuredClone(quiz.dataEntry!.rounds[1]);
    dispatch.records[0].values = ["PK-182", "2026-05-16", "4.50", "WEST-08"];
    dispatch.records[1].values = ["PK-183", "2026-05-17", "7.20", "EAST-09"];
    const rows = dispatch.records.slice(0, 2).map(r => ({ recordId: r.id, values: [...r.values] }));
    [rows[0].values[1], rows[1].values[1]] = [rows[1].values[1], rows[0].values[1]];
    expect(scoreDataEntryRound(dispatch, rows, 60000)).toMatchObject({ consideredFields: 8, exactFields: 6, exactRecords: 0, fieldAccuracy: 75, characterKph: 3240, exactFieldCharacterKph: 2040 });
    expect(scoreDataEntryRound(dispatch, [], 60000)).toMatchObject({ fieldAccuracy: null });
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without private entries or counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(dom.querySelector(`[data-data-entry-result-reading="${p.id}"]`)).not.toBeNull();
      expect(dom.querySelector("[data-data-entry-result], #data-entry-field-0, [data-data-entry-kph]")).toBeNull();
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of dom.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
