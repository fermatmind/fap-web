import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { freelanceReadyLandingSections, freelanceReadyLandingFaq } from "@/components/questionnaires/FreelanceReadyLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/freelance-ready.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("gives freelance project scope and trial review their own illustrations",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={raw.slug} category="everyday"/>);
 for(const m of ["freelance-scope-deliverable","freelance-trial-review"])expect(h).toContain(`data-${m}="true"`);
});
it("renders fourteen bilingual FAQ answers, all six original methods and eight research chapters",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));const body=norm(d.textContent??"");
 expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test [data-explore-start]")).not.toBeNull();
 expect(d.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
 expect(d.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);
 expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...raw.guide,...freelanceReadyLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
 for(const f of [...raw.faq,...freelanceReadyLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
 for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
 if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
 }
});
