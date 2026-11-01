import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/euphoria-character-quiz.json";
import content from "@/lib/questionnaires/result-content/euphoria-character-quiz.json";
import outcomes from "@/tests/fixtures/questionnaires/euphoria-outcomes-reference.json";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isEuphoriaConfigurationValid } from "@/lib/questionnaires/euphoria";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
describe("Eight bilingual Euphoria character readings", () => {
  it("retains six valid sections, every source paragraph and the exact answer model", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(isEuphoriaConfigurationValid(prepared)).toBe(true);
    expect(prepared.questions).toBe(quiz.questions);
    expect(prepared.directions).toBe(quiz.directions);
    for (const [i, p] of prepared.profiles.entries()) {
      expect(p.sections).toHaveLength(6);
      expect(p.sections.map(s => s.id)).toEqual(quiz.profiles[i].sections.map(s => s.id));
      for (const [j, s] of p.sections.entries()) expect(s.paragraphs.slice(0, quiz.profiles[i].sections[j].paragraphs.length)).toEqual(quiz.profiles[i].sections[j].paragraphs);
    }
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" };
    expect(prepareResultProfile(quiz.slug, unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("opens every complete public %s reading without personal counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(dom.querySelector(`[data-euphoria-result-reading="${p.id}"]`)).not.toBeNull();
      expect(dom.querySelector("[data-archetype-count], [data-archetype-match]")).toBeNull();
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["zh", "en"] as const)("keeps every single lead and a six-way %s tie complete without changing counts", locale => {
    const witnesses = [...outcomes.witnesses.filter(w => w.winnerIds.length === 1), outcomes.witnesses.find(w => w.winnerIds.length === 6)!];
    expect(witnesses).toHaveLength(9);
    for (const witness of witnesses) {
      const result = scoreQuestionnaire(quiz, witness.answers), prepared = prepareQuestionnaireResultReadings(quiz);
      expect(scoreQuestionnaire(prepared, witness.answers)).toEqual(result);
      if (result.status !== "complete" || !("profileIds" in result)) throw Error("Complete archetype witness required");
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepared} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(8);
      expect(dom.querySelectorAll("[data-euphoria-result-reading]")).toHaveLength(result.profileIds.length);
      expect(dom.querySelectorAll("h4")).toHaveLength(result.profileIds.length * 6);
      for (const id of result.profileIds) for (const s of content[id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${id}-${s.id}`)?.textContent).toContain(text[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of dom.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
