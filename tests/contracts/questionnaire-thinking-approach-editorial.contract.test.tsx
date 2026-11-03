import { thinkingApproachLandingSections, thinkingApproachLandingFaq } from "@/components/questionnaires/ThinkingApproachLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/intelligence-type-test.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual thinking-approach editorial", () => {
  it("retains six equal maxima and the published twelve-choice example without ability percentages",()=>{
    const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"A"]));
    const tied=scoreArchetypeQuestionnaire(quiz,answers);
    if(tied.status!=="complete")throw new Error("Tie rejected");
    expect(Object.values(tied.counts)).toEqual([3,3,3,3,3,3]);
    expect(tied.profileIds).toHaveLength(6);
    const single=Object.fromEntries(quiz.questions.map(q=>[q.id,(q.options.find(o=>o.directionId==="verbal-framing")??q.options[0]).id]));
    const result=scoreArchetypeQuestionnaire(quiz,single);
    if(result.status!=="complete")throw new Error("Example rejected");
    expect(Object.values(result.counts)).toEqual([12,3,0,3,0,0]);
    expect(result.profileIds).toEqual(["verbal-framing"]);
    expect(result).not.toHaveProperty("matchPercentage");
    expect(result).not.toHaveProperty("secondary");
  });
  it("renders reverse-scoring examples, context distinctions, research scope and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(6);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(6);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "六份完整" : "six complete");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of thinkingApproachLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...thinkingApproachLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#intelligence-type-test-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "12、3、0、3、0、0" : "12,3,0,3,0,0");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
