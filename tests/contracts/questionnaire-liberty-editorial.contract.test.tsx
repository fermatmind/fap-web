import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { libertyLandingSections, libertyLandingFaq } from "@/components/questionnaires/LibertyLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/libertarian.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("liberty principles explanatory editorial", () => {
  it("uses four separate pages and a reverse-code motif without a winning identity", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="libertarian" category="framework" />);
    for (const motif of ["liberty-four-pages", "liberty-reverse-codes"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("recalculates the fresh examples independently from group ordering", () => {
    const adjusted = (x: number[]) => x.map((n, i) => i % 2 ? 6 - n : n);
    const x = [5,4,2,1,3,2,4,3];
    expect(adjusted(x)).toEqual([5,2,2,5,3,4,4,3]);
    expect(adjusted(x).reduce((a,b)=>a+b,0)).toBe(28);
    x[0] = 4;
    expect(adjusted(x).reduce((a,b)=>a+b,0)/8).toBe(3.375);
    expect((27/8).toFixed(2)).toBe("3.38");
    for (const n of [1,2,3,4,5]) expect(adjusted(Array(8).fill(n)).reduce((a,b)=>a+b,0)).toBe(24);
    const reverse = quiz.questions.flatMap((q,i)=>q.reverse?[i+1]:[]);
    expect(reverse).toEqual([5,6,7,8,13,14,15,16,21,22,23,24,29,30,31,32]);
    expect([1,1,1,1,5,5,5,5].reduce((a,b)=>a+b,0)/8).toBe(3);
    for (const locale of ["en", "zh"] as const) {
      const text = libertyLandingSections.flatMap(s=>s.paragraphs.map(p=>p[locale])).join(" ");
      for (const token of ["28", "3.375", "3.38", "11,994"]) expect(text).toContain(token);
    }
  });
  it("renders fourteen bilingual FAQs, four full guide links and original material", async () => {
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
    const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
    for(const locale of ["en","zh"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
      const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      for(const s of [...quiz.guide,...libertyLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
      for(const f of [...quiz.faq,...libertyLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
      expect(body).toContain(norm(quiz.instructions![locale]));
      for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for(const i of [1,2,3])expect(dom.querySelector(`a[href="#libertarian-reference-${i}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
