import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/attraction-experiences.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { AttractionExperiencesReport } from "@/components/questionnaires/AttractionExperiencesReport";
import { attractionLandingSections, attractionLandingFaq } from "@/components/questionnaires/AttractionLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Attraction experiences bilingual editorial and direct start",()=>{
  it("displays worked means from raw sums and withholds two-rated groups",()=>{
    const score=(values:string[])=>{const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));quiz.questions.slice(0,3).forEach((q,i)=>answers[q.id]=values[i]??"na");const r=scoreLikertQuestionnaire(quiz,answers);if(r.status!=="complete")throw Error("Rejected example");return r;};
    const r=score(["1","4","5"]);expect(r.facets["romantic-presence"]).toEqual({sum:10,rated:3,total:3,mean:3.3});
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<AttractionExperiencesReport quiz={quiz} result={r} locale="en"/>);
    expect(dom.querySelector('[data-atr-facet="romantic-presence"] [data-atr-mean]')?.textContent).toBe("3.3 / 5");
    expect(score(Array(2).fill("5")).facets["romantic-presence"]).toEqual({sum:10,rated:2,total:3,mean:null});
    expect(Object.keys(r).sort()).toEqual(["answered","facets","status"]);
  });
  it.each(["en","zh"] as const)("retains original/new full explanations and attribution in %s",async locale=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");const dom=document.createElement("div");
    dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim(),body=norm(dom.textContent??"");
    expect(attractionLandingSections).toHaveLength(8);expect(attractionLandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...attractionLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...attractionLandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('input[type="checkbox"]')).toBeNull();
    expect(dom.querySelector('a[href="#attraction-experiences-reference-3"]')).not.toBeNull();
    expect(dom.querySelector('#attraction-experiences-reference-3')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
