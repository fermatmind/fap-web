import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DataEntryPage } from "@/components/questionnaires/DataEntryPage";
import { dataEntryLandingSections, dataEntryLandingFaq } from "@/components/questionnaires/DataEntryLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreDataEntryRound } from "@/lib/questionnaires/dataEntry";
import raw from "@/lib/questionnaires/data/data-entry.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("data entry explanatory editorial", () => {
  it("illustrates source-to-field transfer and timed exact checking", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="data-entry" category="everyday" />);
    for (const motif of ["entry-source-fields", "entry-match-clock"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("renders bilingual source and editorial text, fourteen FAQ and two complete guide links", () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<DataEntryPage quiz={quiz} locale={locale} />);
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="data-entry-faq"]>div')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="data-entry-public-guides"]>ul>li')).toHaveLength(2);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      for (const section of [...quiz.guide, ...dataEntryLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...dataEntryLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 4, 5]) expect(dom.querySelector(`a[href="#data-entry-reference-${i}"]`)).not.toBeNull();
      expect(quiz.references?.[2]).toMatchObject({ hiddenOnLanding: true });
      expect(dom.querySelector("#data-entry-reference-3")).toBeNull();
      for (const i of [1, 2, 4, 5]) expect(dom.querySelector(`#data-entry-reference-${i}`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it("independently checks fresh unequal-length field examples and the expanded denominator", () => {
    const round = structuredClone(quiz.dataEntry!.rounds[0]);
    round.records[0].values = ["AB-001", "Cedar Box", "003", "D-09"];
    round.records[1].values = ["EF-002", "Other Label", "004", "E-10"];
    const values = ["AB-001", "cedar Box", "003", "D-09"];
    const one = scoreDataEntryRound(round, [{ recordId: round.records[0].id, values }], 60000);
    expect(one).toMatchObject({ status: "complete", enteredCharacters: 22, characterKph: 1320, exactFieldCharacters: 13, exactFieldCharacterKph: 780, fieldAccuracy: 75, exactRecords: 0 });
    const two = scoreDataEntryRound(round, [{ recordId: round.records[0].id, values }, { recordId: round.records[1].id, values: ["EF-002", "", "", ""] }], 60000);
    expect(two).toMatchObject({ status: "complete", consideredFields: 8, exactFields: 4, fieldAccuracy: 50, enteredCharacters: 28, characterKph: 1680, exactFieldCharacterKph: 1140, exactRecords: 0 });
    expect(1320 * .75).toBe(990);
  });
});
