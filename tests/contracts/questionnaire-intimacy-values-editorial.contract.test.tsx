import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/intimacy-values.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { intimacyValuesLandingSections, intimacyValuesLandingFaq } from "@/components/questionnaires/IntimacyValuesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Intimacy values individual bilingual editorial",()=>{
  it("recomputes examples without confusing moderate importance, missing or a winner",()=>{
    const score=(values:string[])=>{const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));quiz.questions.filter(q=>q.options[0].directionId==="privacy").forEach((q,i)=>answers[q.id]=values[i]??"na");const r=scoreQuestionnaire(quiz,answers);if(r.status!=="complete"||!("facets" in r))throw Error("Rejected example");return r;};
    expect(score(["1","3","4","5"]).facets.privacy).toEqual({sum:13,rated:4,total:5,mean:3.3});
    expect(score(["5","5","5"]).facets.privacy).toEqual({sum:15,rated:3,total:5,mean:null});
    const mixed=score(["1","2","4","5"]),moderate=score(Array(5).fill("3"));
    expect(mixed.facets.privacy).toEqual({sum:12,rated:4,total:5,mean:3});
    expect(moderate.facets.privacy).toEqual({sum:15,rated:5,total:5,mean:3});
    expect(Object.keys(mixed).sort()).toEqual(["answered","facets","status"]);
    expect(quiz.questions[0].options[2].label.en).toBe("Moderately important to me");
  });
  it.each(["en","zh"] as const)("renders every original and new paragraph with direct entry in %s",async locale=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");const dom=document.createElement("div");
    dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=norm(dom.textContent??"");
    expect(intimacyValuesLandingSections).toHaveLength(8);expect(intimacyValuesLandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...intimacyValuesLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...intimacyValuesLandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(13);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#intimacy-values-reference-2"]')).not.toBeNull();
    expect(dom.querySelector('#intimacy-values-reference-2')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
