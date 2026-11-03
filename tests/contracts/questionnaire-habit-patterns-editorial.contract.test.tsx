import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { habitPatternsLandingSections, habitPatternsLandingFaq } from "@/components/questionnaires/HabitPatternsLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreMiniHabitQuestionnaire, type MiniHabitQuestionnaire } from "@/lib/questionnaires/miniHabit";
import { QuestionnaireHabitReport } from "@/components/questionnaires/QuestionnaireHabitReport";
import raw from "@/lib/questionnaires/data/habit-patterns-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=raw as unknown as MiniHabitQuestionnaire;
it("uses five equal observation cards and a cue notebook without a severity chart",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="daily"/>);for(const m of ["habit-five-observation-cards","habit-cue-notebook"])expect(h).toContain(`data-${m}="true"`);
});
it("keeps three numeric responses available and withholds only groups below that coverage",()=>{
 for(let mask=0;mask<32;mask++)for(const missing of [1,2]){const a=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,(i%4<missing&&(mask&(1<<Math.floor(i/4))))?"na":String([2,4,5,3][i%4])]));const result=scoreMiniHabitQuestionnaire(quiz,a);expect(result.status).toBe("complete");if(result.status!=="complete")throw Error("Missing complete result");quiz.directions.forEach((d,i)=>{const affected=!!(mask&(1<<i));expect(result.facets[d.id]).toEqual({total:4,rated:affected?4-missing:4,sum:affected?(missing===1?12:8):14,mean:affected?(missing===1?4:null):3.5});});const h=renderToStaticMarkup(<QuestionnaireHabitReport quiz={quiz} result={result} locale="en"/>);const d=document.createElement("div");d.innerHTML=h;expect(d.querySelectorAll('[data-habit-mean]')).toHaveLength(missing===1?5:5-mask.toString(2).replace(/0/g,"").length);}
});
it("renders original source methods, eight research chapters and sixteen bilingual FAQ answers with direct start",async()=>{
 expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));const b=norm(d.textContent??"");expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test fieldset > button")?.hasAttribute("data-explore-start")).toBe(true);expect(d.querySelector('[data-entertainment-activity-opt-in] input')).not.toBeNull();expect(d.querySelector('[data-entertainment-activity-opt-in] input:checked,[data-entertainment-activity-opt-in] input[required]')).toBeNull();expect(d.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(16);expect(d.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...quiz.guide,...habitPatternsLandingSections])for(const p of s.paragraphs)expect(b).toContain(norm(p[locale]));for(const f of [...quiz.faq,...habitPatternsLandingFaq]){expect(b).toContain(norm(f.question[locale]));expect(b).toContain(norm(f.answer[locale]));}for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();if(locale==="en")expect(b).not.toMatch(/\p{Script=Han}/u);}
});
