import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { intimacyLandingSections, intimacyLandingFaq } from "@/components/questionnaires/IntimacyLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreMiniIntimacyQuestionnaire, type MiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";
import raw from "@/lib/questionnaires/data/intimacy-preference-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=raw as unknown as MiniIntimacyQuestionnaire;
it("gives the four different topics their own window illustration and an open boundary",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="relationship"/>);for(const m of ["intimacy-four-windows","intimacy-open-boundary"])expect(h).toContain(`data-${m}="true"`);
});
it("preserves four non-ranked means while withholding exactly those groups with an unscored answer",()=>{
 const v=[5,4,3,5,4,4,2,3,1,4,2,4,5,3,4,2,4,4,3,5,2,3,4,2],means=[4.1667,2.6667,3.6667,3.1667],sums=[25,16,22,19];
 for(let mask=0;mask<16;mask++){const a=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,(i%6===0&&(mask&(1<<Math.floor(i/6))))?"na":String(v[i])]));const result=scoreMiniIntimacyQuestionnaire(quiz,a);expect(result.status).toBe("complete");if(result.status!=="complete")throw Error("Missing complete result");expect(Object.keys(result)).toEqual(["status","answered","facets"]);quiz.directions.forEach((d,i)=>expect(result.facets[d.id]).toMatchObject({rated:mask&(1<<i)?5:6,mean:mask&(1<<i)?null:means[i],sum:sums[i]-(mask&(1<<i)?v[i*6]:0)}));}
 const all3=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));const patterned=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i%2?"1":"5"]));expect(scoreMiniIntimacyQuestionnaire(quiz,all3)).toEqual(scoreMiniIntimacyQuestionnaire(quiz,patterned));
});
it("renders all source methods and eight complete bilingual research chapters with sixteen FAQ answers",async()=>{
 expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));const b=norm(d.textContent??"");expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test fieldset > button")?.hasAttribute("data-explore-start")).toBe(true);expect(d.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(16);expect(d.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...quiz.guide,...intimacyLandingSections])for(const p of s.paragraphs)expect(b).toContain(norm(p[locale]));for(const f of [...quiz.faq,...intimacyLandingFaq]){expect(b).toContain(norm(f.question[locale]));expect(b).toContain(norm(f.answer[locale]));}for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();if(locale==="en")expect(b).not.toMatch(/\p{Script=Han}/u);}
});
