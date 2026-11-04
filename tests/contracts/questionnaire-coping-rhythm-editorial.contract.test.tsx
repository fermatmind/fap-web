import { renderQuestionnaireTakeDom } from "@/tests/fixtures/questionnaires/renderQuestionnaireTake";
import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { copingRhythmLandingSections, copingRhythmLandingFaq } from "@/components/questionnaires/CopingRhythmLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { copingPairDefinitions, scoreMiniCopingQuestionnaire, type MiniCopingQuestionnaire } from "@/lib/questionnaires/miniCoping";
import raw from "@/lib/questionnaires/data/coping-rhythm-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=raw as unknown as MiniCopingQuestionnaire;
it("gives the four independent pairs their own six-choice routes and a scene-review illustration",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="everyday"/>);for(const m of ["coping-four-paired-routes","coping-scene-review"])expect(h).toContain(`data-${m}="true"`);
});
it("preserves every combination of four pair counts without inventing an overall type",()=>{
 for(let pattern=0;pattern<2401;pattern++){let rest=pattern;const firstCounts=Array.from({length:4},()=>{const n=rest%7;rest=Math.floor(rest/7);return n;});const a=Object.fromEntries(quiz.questions.map((q,i)=>{const g=Math.floor(i/6),pole=copingPairDefinitions[g].poleIds[i%6<firstCounts[g]?0:1];return[q.id,q.options.find(o=>o.directionId===pole)!.id];}));const result=scoreMiniCopingQuestionnaire(quiz,a);expect(result.status).toBe("complete");if(result.status!=="complete")throw Error("Missing complete result");expect(Object.keys(result)).toEqual(["status","answered","interactionPairs"]);result.interactionPairs.forEach((p,g)=>{expect(Object.values(p.counts)).toEqual([firstCounts[g],6-firstCounts[g]]);expect(p.leaders).toEqual(copingPairDefinitions[g].poleIds.filter((_,i)=>(i===0?firstCounts[g]:6-firstCounts[g])===Math.max(firstCounts[g],6-firstCounts[g])).sort());expect(p.profileId).toBe(quiz.profiles[g].id);});}
});
it("renders sixteen bilingual FAQ answers, all source methods, complete research chapters and direct start",async()=>{
 expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));const takeDom=await renderQuestionnaireTakeDom(locale,quiz.slug);expect(takeDom.querySelectorAll('input[type="checkbox"][required],input[type="checkbox"]:checked')).toHaveLength(0);const b=norm(d.textContent??"");expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test form > button")?.hasAttribute("data-explore-start")).toBe(true);expect(takeDom.querySelector('[data-entertainment-activity-opt-in] input')?.hasAttribute('checked')).toBe(false);expect(d.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(16);expect(d.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...quiz.guide,...copingRhythmLandingSections])for(const p of s.paragraphs)expect(b).toContain(norm(p[locale]));for(const f of [...quiz.faq,...copingRhythmLandingFaq]){expect(b).toContain(norm(f.question[locale]));expect(b).toContain(norm(f.answer[locale]));}for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();if(locale==="en")expect(b).not.toMatch(/\p{Script=Han}/u);}
});
