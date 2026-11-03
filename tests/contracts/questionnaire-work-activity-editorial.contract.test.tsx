import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/work-activity-interests.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { workActivityLandingSections, workActivityLandingFaq } from "@/components/questionnaires/WorkActivityLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Work activity individual bilingual editorial",()=>{
  it("distinguishes the new eight-rating example, neutral pattern and seven-item insufficiency",()=>{
    const score=(values:string[])=>{ const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));quiz.questions.filter(q=>q.options[0].directionId==="R").forEach((q,i)=>answers[q.id]=values[i]??"na");const r=scoreQuestionnaire(quiz,answers);if(r.status!=="complete"||!("facets" in r))throw Error("Rejected example");return r; };
    const mixed=score(["5","4","4","3","3","2","2","1"]),neutral=score(Array(10).fill("3")),short=score(Array(7).fill("5"));
    expect(mixed.facets.R).toEqual({sum:24,rated:8,total:10,mean:3});
    expect(neutral.facets.R).toEqual({sum:30,rated:10,total:10,mean:3});
    expect(short.facets.R).toEqual({sum:35,rated:7,total:10,mean:null});
    expect(mixed.facets.I.mean).toBeNull();
    expect(Object.keys(mixed).sort()).toEqual(["answered","facets","status"]);
  });
  it.each(["en","zh"] as const)("renders complete original and new text with unobstructed entry in %s",async locale=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=norm(dom.textContent??"");
    expect(workActivityLandingSections).toHaveLength(8);expect(workActivityLandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...workActivityLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...workActivityLandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(13);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(6);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('.explore-intro [data-work-activity-context]')).toBeNull();
    expect(dom.querySelectorAll('[data-work-activity-context]')).toHaveLength(1);
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#work-activity-interests-reference-2"]')).not.toBeNull();
    expect(dom.querySelector('#work-activity-interests-reference-2')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
