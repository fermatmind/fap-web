import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { euphoriaLandingSections, euphoriaLandingFaq } from "@/components/questionnaires/EuphoriaLandingEditorial";
import raw from "@/lib/questionnaires/data/euphoria-character-quiz.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("renders eight bespoke reading chapters and sixteen complete FAQ answers in both locales",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 expect(euphoriaLandingSections).toHaveLength(8);expect(euphoriaLandingFaq).toHaveLength(8);
 for(const locale of ["en","zh"] as const){
  const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));
  const body=d.textContent??"";
  expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test [data-explore-start]")).not.toBeNull();
  for(const section of euphoriaLandingSections){expect(body).toContain(section.title[locale]);for(const paragraph of section.paragraphs)expect(body).toContain(paragraph[locale]);}
  for(const faq of [...raw.faq,...euphoriaLandingFaq]){expect(body).toContain(faq.question[locale]);expect(body).toContain(faq.answer[locale]);}
  for(const p of raw.profiles)expect(d.querySelector(`a[href="/${locale}/tests/explore/${raw.slug}/results/${p.id}"]`)).not.toBeNull();
 }
});
