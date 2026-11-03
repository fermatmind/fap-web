import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/outfit-line-preferences.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { OutfitLinePreferencesPage } from "@/components/questionnaires/OutfitLinePreferencesPage";
import { outfitLandingSections, outfitLandingFaq } from "@/components/questionnaires/OutfitLineLandingEditorial";
const quiz = raw as Questionnaire;
describe("Outfit-line editorial: preference and missingness remain distinct from body or fit", () => {
  it("verifies the 10/3 example and withholds a two-rating mean without affecting other themes", () => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));
    ["1", "4", "5", "5", "5", "na", "3", "3", "3"].forEach((value, i) => { answers[quiz.questions[i].id] = value; });
    const result = scoreLikertQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw Error("Expected complete reflection");
    expect(result.facets["long-line"]).toMatchObject({ sum: 10, rated: 3, total: 3, mean: 3.3 });
    expect(result.facets["ease-and-room"]).toMatchObject({ sum: 10, rated: 2, mean: null });
    expect(result.facets["even-balance"]).toMatchObject({ mean: 3 });
    expect(result).not.toHaveProperty("profileId");
  });
  for (const locale of ["en", "zh"] as const) it(`renders full ${locale} explanations and all five source guides before answers`, () => {
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<OutfitLinePreferencesPage quiz={quiz} locale={locale} />);
    expect(outfitLandingSections).toHaveLength(8); expect(outfitLandingFaq).toHaveLength(8);
    for (const s of [...outfitLandingSections, ...quiz.guide]) {
      expect(dom.textContent).toContain(s.title[locale]);
      for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...outfitLandingFaq]) expect(dom.textContent).toContain(f.question[locale]);
    for (const p of quiz.profiles) {
      for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      expect(dom.querySelector(`a[href="/${locale}/tests/explore/${quiz.slug}/results/${p.id}"]`)).not.toBeNull();
    }
    expect(dom.querySelectorAll("[data-outfit-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="outfit-faq"] > div')).toHaveLength(14);
    expect(dom.querySelectorAll("#take-test")).toHaveLength(1);
    expect(dom.querySelector("[data-outfit-lines]" )).not.toBeNull();
    expect(dom.querySelector("details,input[type=checkbox],input[type=file]" )).toBeNull();
    expect(dom.querySelector("#outfit-reference-3")).not.toBeNull();
    expect(catalog.find(q => q.slug === quiz.slug)!.description[locale]).toBe(quiz.description[locale]);
  });
});
