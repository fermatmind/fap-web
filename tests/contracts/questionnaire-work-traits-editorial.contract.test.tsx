import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/work-traits-reflection.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { workTraitsLandingSections, workTraitsLandingFaq } from "@/components/questionnaires/WorkTraitsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Work traits individual bilingual editorial",()=>{
  it("recomputes examples without confusing neutrality, missing or a winning identity",()=>{
    const score=(values:string[])=>{const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));quiz.questions.filter(q=>q.options[0].directionId==="composure").forEach((q,i)=>answers[q.id]=values[i]??"na");const r=scoreQuestionnaire(quiz,answers);if(r.status!=="complete"||!("facets" in r))throw Error("Rejected example");return r;};
    expect(score(["1","2","4","4","5"]).facets.composure).toEqual({sum:16,rated:5,total:6,mean:3.2});
    expect(score(Array(4).fill("5")).facets.composure).toEqual({sum:20,rated:4,total:6,mean:null});
    const mixed=score(["2","2","3","4","4"]),moderate=score(Array(6).fill("3"));
    expect(mixed.facets.composure).toEqual({sum:15,rated:5,total:6,mean:3});
    expect(moderate.facets.composure).toEqual({sum:18,rated:6,total:6,mean:3});
    expect(Object.keys(mixed).sort()).toEqual(["answered","facets","status"]);
    expect(quiz.questions[0].options[2].label.en).toBe("Sometimes");
  });
  it.each(["en","zh"] as const)("renders every original and new paragraph with direct entry in %s",async locale=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");const dom=document.createElement("div");
    dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=norm(dom.textContent??"");
    expect(workTraitsLandingSections).toHaveLength(8);expect(workTraitsLandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...workTraitsLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...workTraitsLandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(7);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#work-traits-reflection-reference-2"]')).not.toBeNull();
    expect(dom.querySelector('#work-traits-reflection-reference-2')).not.toBeNull();
    expect(dom.querySelector('.explore-intro [data-work-traits-context]')).toBeNull();
    expect(dom.querySelector('[data-work-traits-context]')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
