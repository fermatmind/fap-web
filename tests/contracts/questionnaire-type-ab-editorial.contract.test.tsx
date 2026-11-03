import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/type-ab.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual A/B behaviour editorial", () => {
  it("reproduces the public reverse/NA example and keeps a two-rating part insufficient without changing other parts", () => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, "3"]));
    const part = quiz.questions.filter(q => q.options[0].directionId === "time-urgency");
    ["4", "2", "3", "4", "na"].forEach((value,i) => { answers[part[i].id] = value; });
    const result = scoreQuestionnaire(quiz, answers);
    if (result.status !== "complete" || !("facets" in result)) throw new Error("Public example rejected");
    expect(result.facets["time-urgency"]).toEqual({ sum: 13, rated: 4, total: 5, mean: 3.3 });
    answers[part[2].id] = "na"; answers[part[3].id] = "na";
    const sparse = scoreQuestionnaire(quiz, answers);
    if (sparse.status !== "complete" || !("facets" in sparse)) throw new Error("Sparse completed example rejected");
    expect(sparse.facets["time-urgency"]).toEqual({ sum: 8, rated: 2, total: 5, mean: null });
    expect(sparse.facets["competitive-comparison"].mean).toBe(3);
    expect(sparse).not.toHaveProperty("total");
  });
  it("renders all bilingual chapters and four full-guide cards with resolved primary-source citations", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const body = normalize(dom.textContent ?? "");
      expect(quiz.seoTitle[locale]).not.toContain("| FermatMind");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const profile of quiz.profiles) expect(body).toContain(profile.summary[locale]);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#type-ab-reference-3"]')).not.toBeNull();
      expect(body).toContain("3.3");
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
