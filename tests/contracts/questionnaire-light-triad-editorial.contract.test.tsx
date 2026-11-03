import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/light-triad-test.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireLtsReport } from "@/components/questionnaires/QuestionnaireLtsReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("individual Light Triad editorial", () => {
  it("reproduces the twelve-rating example and retains complete facets when one item is unscored", () => {
    const scores = [4,3,2,5,5,4,4,3,4,2,5,4];
    const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id, String(scores[i])]));
    const render = () => {
      const result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("facets" in result)) throw new Error("Complete witness rejected");
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireLtsReport quiz={quiz} result={result} locale="en" />);
      return dom;
    };
    const dom = render();
    expect(dom.querySelector("[data-lts-total]")?.textContent).toBe("45");
    expect(dom.querySelector("[data-lts-overall-mean]")?.textContent).toBe("3.75");
    expect([...dom.querySelectorAll("[data-lts-mean]")].map(e => e.textContent)).toEqual(["3.50 / 5", "4.00 / 5", "3.75 / 5"]);
    answers[quiz.questions[0].id] = "na";
    const missing = render();
    expect(missing.querySelector("[data-lts-total]")?.textContent).toBe("Insufficient information");
    expect([...missing.querySelectorAll("[data-lts-mean]")].map(e => e.textContent)).toEqual(["Insufficient information", "4.00 / 5", "3.75 / 5"]);
    expect(missing.querySelectorAll("[data-lts-profile]")).toHaveLength(3);
  });
  it("renders worked scores, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(3);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(3);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "三个侧面结果" : "Three facet results");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#light-triad-test-reference-2"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "整体总分45" : "overall total is 45");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
