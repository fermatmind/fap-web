import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { trustLandingSections, trustLandingFaq } from "@/components/questionnaires/TrustLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/trust-issues-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("trust principles explanatory editorial", () => {
  it("uses a bounded opening and agreed-review motif without a winning identity", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="trust-issues-test" category="framework" />);
    for (const motif of ["trust-bounded-opening", "trust-agreed-review"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("recalculates direct frequency examples without a reverse or total score", () => {
    expect(quiz.questions).toHaveLength(24);
    expect(quiz.questions.every(q=>!q.reverse)).toBe(true);
    expect([5,2,4,3,1,5].reduce((a,b)=>a+b,0)).toBe(20);
    expect((20/6).toFixed(1)).toBe("3.3");
    expect([1,1,1,5,5,5].reduce((a,b)=>a+b,0)/6).toBe(3);
    for(const locale of ["en","zh"] as const){
      const text=trustLandingSections.flatMap(s=>s.paragraphs.map(p=>p[locale])).join(" ");
      for(const number of ["494","847","35","3.333"])expect(text).toContain(number);
    }
  });
  it("renders thirteen bilingual FAQs, four full guide links and original material", async () => {
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
    const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
    for(const locale of ["en","zh"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
      const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(13);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(9);
      for(const s of [...quiz.guide,...trustLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
      for(const f of [...quiz.faq,...trustLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
      expect(body).toContain(norm(quiz.instructions![locale]));
      for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for(const i of [1,2])expect(dom.querySelector(`a[href="#trust-issues-test-reference-${i}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
