import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/sdt-motivation.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual SDT needs editorial", () => {
  it("reproduces paired satisfaction/frustration examples without reversing, subtracting or imputing", () => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, "3"]));
    const satisfaction = quiz.questions.filter(q => q.options[0].directionId === "autonomy-satisfaction");
    const frustration = quiz.questions.filter(q => q.options[0].directionId === "autonomy-frustration");
    ["4", "3", "na", "5"].forEach((value,i) => { answers[satisfaction[i].id] = value; });
    ["2", "2", "1", "na"].forEach((value,i) => { answers[frustration[i].id] = value; });
    const result = scoreQuestionnaire(quiz, answers);
    if (result.status !== "complete" || !("facets" in result)) throw new Error("Public example rejected");
    expect(result.facets["autonomy-satisfaction"]).toEqual({ sum: 12, rated: 3, total: 4, mean: 4 });
    expect(result.facets["autonomy-frustration"]).toEqual({ sum: 5, rated: 3, total: 4, mean: 1.7 });
    answers[satisfaction[1].id] = "na";
    const sparse = scoreQuestionnaire(quiz, answers);
    if (sparse.status !== "complete" || !("facets" in sparse)) throw new Error("Sparse example rejected");
    expect(sparse.facets["autonomy-satisfaction"]).toEqual({ sum: 9, rated: 2, total: 4, mean: null });
    expect(sparse.facets["autonomy-frustration"].mean).toBe(1.7);
    expect(sparse.facets["competence-satisfaction"].mean).toBe(3);
    expect(sparse).not.toHaveProperty("total");
  });
  it("renders all bilingual chapters and six full-guide cards with resolved primary-source citations", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const body = normalize(dom.textContent ?? "");
      expect(quiz.seoTitle[locale]).not.toContain("| FermatMind");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(6);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const profile of quiz.profiles) expect(body).toContain(profile.summary[locale]);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#sdt-motivation-reference-4"]')).not.toBeNull();
      expect(body).toContain("1.7");
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
