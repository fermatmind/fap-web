import { philosopherLandingSections, philosopherLandingFaq } from "@/components/questionnaires/PhilosopherLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/philosopher-personality-test.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual nine-path philosophy editorial", () => {
  it("reproduces the exact public two-approach tie example from actual options", () => {
    const ids = ["B","C","B","B","D","B","B","A","D","D","C","C","A","B","C","C","B","A"];
    const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id,ids[i]]));
    const result = scoreArchetypeQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if(result.status!=="complete")throw new Error("Complete public example rejected");
    expect(Object.values(result.counts)).toEqual([4,4,2,2,2,1,1,1,1]);
    expect([...result.profileIds].sort()).toEqual(["aristotle","socrates"]);
  });
  it("renders fixed-sum examples, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(9);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(9);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "九位哲学家" : "Nine philosopher");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of philosopherLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...philosopherLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#philosopher-personality-test-reference-10"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "4、4、2、2、2、1、1、1、1" : "4, 4, 2, 2, 2, 1, 1, 1, 1");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
