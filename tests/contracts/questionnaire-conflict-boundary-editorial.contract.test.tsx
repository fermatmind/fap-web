import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { conflictBoundaryLandingSections, conflictBoundaryLandingFaq } from "@/components/questionnaires/ConflictBoundaryLandingEditorial";
import raw from "@/lib/questionnaires/data/conflict-boundary-behaviors-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("renders all original methods, eight bespoke chapters and sixteen FAQ answers in both languages",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 expect(conflictBoundaryLandingSections).toHaveLength(8);expect(conflictBoundaryLandingFaq).toHaveLength(8);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){
  const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));const body=norm(d.textContent??"");
  expect(d.querySelectorAll("h1")).toHaveLength(1);
  const start=d.querySelector("#take-test fieldset [data-explore-start]")!;expect(start).not.toBeNull();expect(start.previousElementSibling?.tagName).toBe("LEGEND");
  expect(d.querySelector('#take-test fieldset input[type="checkbox"]')).toBeNull();
  for(const section of [...raw.guide,...conflictBoundaryLandingSections]){expect(body).toContain(norm(section.title[locale]));for(const p of section.paragraphs)expect(body).toContain(norm(p[locale]));}
  for(const faq of [...raw.faq,...conflictBoundaryLandingFaq]){expect(body).toContain(norm(faq.question[locale]));expect(body).toContain(norm(faq.answer[locale]));}
  for(const p of raw.profiles)expect(d.querySelector(`a[href="/${locale}/tests/explore/${raw.slug}/results/${p.id}"]`)).not.toBeNull();
 }
});
