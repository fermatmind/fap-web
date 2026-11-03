import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { mfq2LandingSections, mfq2LandingFaq } from "@/components/questionnaires/Mfq2LandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/morality-6.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("MFQ-2 bilingual explanatory editorial", () => {
  it("uses six independent readings and two distribution illustrations without a winning identity", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="morality-6" category="framework" />);
    for (const motif of ["mfq2-six-readings", "mfq2-two-distributions"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("recalculates fresh direct-key examples without hidden preliminary rounding", () => {
    expect(quiz.questions).toHaveLength(36);expect(quiz.questions.every(q=>!q.reverse)).toBe(true);
    const x=[5,1,4,2,3,5];expect(x.reduce((a,b)=>a+b,0)).toBe(20);expect((20/6).toFixed(2)).toBe("3.33");
    x[0]=4;expect(x.reduce((a,b)=>a+b,0)).toBe(19);expect((19/6).toFixed(2)).toBe("3.17");
    expect([1,1,1,5,5,5].reduce((a,b)=>a+b,0)/6).toBe(3);
    for(const locale of ["en","zh"] as const){const text=mfq2LandingSections.flatMap(s=>s.paragraphs.map(p=>p[locale])).join(" ");for(const n of ["3.17","3,360","3,902","1,410","1,049"])expect(text).toContain(n);}
  });
  it("renders fourteen bilingual FAQs, six full guide links and original material", async () => {
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
    const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
    for(const locale of ["en","zh"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
      const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(6);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      expect(dom.querySelector(".explore-intro [data-mfq2-attribution]")).toBeNull();
      expect(dom.querySelector("[data-mfq2-attribution]")?.closest("details")).toBeNull();
      expect(dom.querySelector("[data-mfq2-attribution]")).not.toBeNull();
      for(const s of [...quiz.guide,...mfq2LandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
      for(const f of [...quiz.faq,...mfq2LandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
      expect(body).toContain(norm(quiz.instructions![locale]));
      for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for(const i of [1,2,3,4,5])expect(dom.querySelector(`a[href="#morality-6-reference-${i}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
