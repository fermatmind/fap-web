import { maleRoleLandingSections, maleRoleLandingFaq } from "@/components/questionnaires/MaleRoleLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/male-archetype-test.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual four-role editorial", () => {
  it("retains all equal maxima and the worked two-guide tie without a purpose percentage",()=>{
    const tied=scoreArchetypeQuestionnaire(quiz,Object.fromEntries(quiz.questions.map(q=>[q.id,"A"])));
    if(tied.status!=="complete")throw new Error("Tie rejected");
    expect(Object.values(tied.counts)).toEqual([5,5,5,5]);
    expect(tied.profileIds).toHaveLength(4);
    const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,q.options.find(o=>o.directionId===(i<7?"king":i<14?"warrior":i<17?"magician":"lover"))!.id]));
    const result=scoreArchetypeQuestionnaire(quiz,answers);
    if(result.status!=="complete")throw new Error("Example rejected");
    expect(Object.values(result.counts)).toEqual([7,7,3,3]);
    expect(result.profileIds).toEqual(["king","warrior"]);
    expect(result).not.toHaveProperty("matchPercentage");
    expect(result).not.toHaveProperty("secondary");
  });
  it("renders choice-count examples, theory and role distinctions and complete bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(4);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "四份完整" : "four complete");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of maleRoleLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...maleRoleLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#male-archetype-test-reference-1"]')).not.toBeNull();
      expect(dom.querySelector('a[href="#male-archetype-test-reference-2"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "7、7、3、3" : "7, 7, 3, 3");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
