import { renderQuestionnaireTakeDom } from "@/tests/fixtures/questionnaires/renderQuestionnaireTake";
import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { orientationLandingSections, orientationLandingFaq } from "@/components/questionnaires/OrientationLandingEditorial";
import raw from "@/lib/questionnaires/data/orientation-exploration-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("renders all original methods, eight bespoke chapters and sixteen FAQ answers in both languages",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 expect(orientationLandingSections).toHaveLength(8);expect(orientationLandingFaq).toHaveLength(8);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){
  const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));const takeDom=await renderQuestionnaireTakeDom(locale,raw.slug);expect(takeDom.querySelectorAll('input[type="checkbox"][required],input[type="checkbox"]:checked')).toHaveLength(0);const body=norm(d.textContent??"");
  expect(d.querySelectorAll("h1")).toHaveLength(1);
  const start=d.querySelector("#take-test [data-explore-start]")!;expect(start).not.toBeNull();expect(start.closest("form")?.getAttribute("action")).toBe(`/${locale}/tests/explore/${raw.slug}/take`);
  expect(d.querySelector('#take-test fieldset input[type="checkbox"]')).toBeNull();
  for(const section of [...raw.guide,...orientationLandingSections]){expect(body).toContain(norm(section.title[locale]));for(const p of section.paragraphs)expect(body).toContain(norm(p[locale]));}
  for(const faq of [...raw.faq,...orientationLandingFaq]){expect(body).toContain(norm(faq.question[locale]));expect(body).toContain(norm(faq.answer[locale]));}
  for(const p of raw.profiles)expect(d.querySelector(`a[href="/${locale}/tests/explore/${raw.slug}/results/${p.id}"]`)).not.toBeNull();
 }
});
