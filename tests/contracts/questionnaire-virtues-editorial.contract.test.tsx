import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { virtuesLandingSections, virtuesLandingFaq } from "@/components/questionnaires/VirtuesLandingEditorial";
import raw from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("renders ten bilingual themed chapters, eighteen FAQ answers and separate research attribution",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 expect(virtuesLandingSections).toHaveLength(10);expect(virtuesLandingFaq).toHaveLength(8);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){
  const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));
  const body=norm(d.textContent??"");expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test [data-explore-start]")).not.toBeNull();
  for(const section of virtuesLandingSections){expect(body).toContain(norm(section.title[locale]));for(const p of section.paragraphs)expect(body).toContain(norm(p[locale]));}
  for(const faq of [...raw.faq,...virtuesLandingFaq]){expect(body).toContain(norm(faq.question[locale]));expect(body).toContain(norm(faq.answer[locale]));}
  for(const p of raw.profiles)expect(d.querySelector(`a[href="/${locale}/tests/explore/${raw.slug}/results/${p.id}"]`)).not.toBeNull();
  expect(d.querySelector('a[href="https://library.scottbarrykaufman.com/uploads/2014/04/Veselka-et-al.-2014.pdf"]')).not.toBeNull();
 }
});
