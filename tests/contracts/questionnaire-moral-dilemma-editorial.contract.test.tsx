import { moralDilemmaLandingSections, moralDilemmaLandingFaq } from "@/components/questionnaires/MoralDilemmaLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/moral-dilemma-test.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual five ethical-inquiry editorial", () => {
  it("retains all equal maxima and the worked two-guide tie without a purpose percentage",()=>{
    const tied=scoreArchetypeQuestionnaire(quiz,Object.fromEntries(quiz.questions.map(q=>[q.id,"A"])));
    if(tied.status!=="complete")throw new Error("Tie rejected");
    expect(Object.values(tied.counts)).toEqual([4,4,4,4,4]);
    expect(tied.profileIds).toHaveLength(5);
    const witness=["A", "D", "D", "C", "B", "A", "D", "C", "B", "A", "A", "D", "B", "A", "D", "C", "A", "A", "D", "C"];
    const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,witness[i]]));
    const result=scoreArchetypeQuestionnaire(quiz,answers);
    if(result.status!=="complete")throw new Error("Example rejected");
    expect(Object.values(result.counts)).toEqual([6,6,3,3,2]);
    expect(result.profileIds).toEqual(["consequences","principles"]);
    expect(result).not.toHaveProperty("matchPercentage");
    expect(result).not.toHaveProperty("secondary");
  });
  it("renders choice-count examples, ethical questions and action distinctions and complete bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(5);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "五份完整" : "five complete");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of moralDilemmaLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...moralDilemmaLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#moral-dilemma-test-reference-1"]')).not.toBeNull();
      for(const n of [2,3,4,5])expect(dom.querySelector(`a[href="#moral-dilemma-test-reference-${n}"]`)).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "6、6、3、3、2" : "6, 6, 3, 3, 2");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
