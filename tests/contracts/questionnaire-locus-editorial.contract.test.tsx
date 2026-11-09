import { locusLandingSections, locusLandingFaq } from "@/components/questionnaires/LocusLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/locus-of-control.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual IPIP total locus editorial", () => {
  it("reproduces the unrounded41total, missing19ratings and identical60patterns",()=>{
    for(const [mode,rated,sum,mean]of [["fortyone",20,41,2.1],["nineteen",19,76,null],["neutral",20,60,3],["agree",20,60,3],["inaccurate",20,60,3],["na",0,0,null]]as const){
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,
        mode==="na"||(mode==="nineteen"&&i===19)?"na":mode==="neutral"?"3":mode==="agree"?"5":mode==="inaccurate"?"1":
        mode==="nineteen"?(q.reverse?"2":"4"):i===0?"3":q.reverse?"4":"2"]));
      const result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete"||!("facets"in result))throw new Error("Examples rejected");
      expect(result.facets["total-control-beliefs"]).toEqual({rated,sum,total:20,mean});
      for(const field of["total","leaders","profileId","percentile","internality","chance","powerfulOthers"])expect(result).not.toHaveProperty(field);
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
      for (const faq of locusLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...locusLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|24 hours|twenty-four hours|resume a draft|恢复草稿/i);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#locus-of-control-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "41÷20＝2.05" : "41÷20=2.05");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
