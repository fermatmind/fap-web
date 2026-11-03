import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { stressResponseLandingSections, stressResponseLandingFaq } from "@/components/questionnaires/StressResponseLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/stress-response-patterns-test.json";
import { scoreMiniShadowQuestionnaire } from "@/lib/questionnaires/miniShadow";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("gives five stress-response observation notes and a context sequence their own illustrations",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={raw.slug} category="everyday"/>);
 for(const m of ["stress-five-observation-notes","stress-context-sequence"])expect(h).toContain(`data-${m}="true"`);
});
it("renders sixteen bilingual FAQ answers, all eight original methods and eight research chapters",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));const body=norm(d.textContent??"");
 expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test fieldset > button")?.hasAttribute("data-explore-start")).toBe(true);expect(d.querySelector("[data-entertainment-activity-opt-in] input")?.hasAttribute("checked")).toBe(false);
 expect(d.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(16);
 expect(d.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);
 expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...raw.guide,...stressResponseLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
 for(const f of [...raw.faq,...stressResponseLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
 for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
 if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
 }
});

it("keeps uncertain responses numeric and all 3125 joint five-group records independent",()=>{
 for(let n=0;n<3125;n++){let rest=n;const levels=Array.from({length:5},()=>{const v=rest%5+1;rest=Math.floor(rest/5);return v;});const answers=Object.fromEntries(raw.questions.map((q,i)=>[q.id,String(levels[Math.floor(i/4)])]));const r=scoreMiniShadowQuestionnaire(raw,answers);expect(r.status).toBe("complete");if(r.status!=="complete")throw Error("Missing record");expect(Object.keys(r)).toEqual(["status","answered","facets"]);raw.directions.forEach((d,g)=>expect(r.facets[d.id]).toEqual({sum:levels[g]*4,rated:4,total:4,mean:levels[g]}));}
});
