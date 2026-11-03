import { growthLandingSections, growthLandingFaq } from "@/components/questionnaires/GrowthLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/growth-mindset-fixed-mindset.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual selected-skill growth belief editorial", () => {
  it("reproduces reverse-scored nine-rating and midpoint examples without type assignment", () => {
    for (const [mode, rated, sum, mean] of [["nine",9,36,4],["eight",8,32,null],["neutral",12,36,3],["agree",12,36,3],["na",0,0,null]] as const) {
      const answers = Object.fromEntries(quiz.questions.map((q,i)=>[q.id,
        mode==="na" || (mode==="nine" && i>=9) || (mode==="eight" && i>=8) ? "na" :
        mode==="neutral" ? "3" : mode==="agree" ? "5" : q.reverse ? "2" : "4"]));
      const result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete"||!("facets" in result))throw new Error("Examples rejected");
      expect(result.facets["changeability-belief"]).toEqual({rated,sum,total:12,mean});
      for(const field of ["total","leaders","profileId","percentile"])expect(result).not.toHaveProperty(field);
    }
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
      expect(new Set(summaries).size).toBe(1);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(1);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "完整连续" : "complete continuous");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of growthLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...growthLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#growth-mindset-fixed-mindset-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "4、2、4、2、4、2、4、2、4" : "4, 2, 4, 2, 4, 2, 4, 2, 4");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
