import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/dark-tetrad-sd4.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireSd4Report } from "@/components/questionnaires/QuestionnaireSd4Report";
import { sd4LandingSections, sd4LandingFaq } from "@/components/questionnaires/Sd4LandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Published SD4 bilingual editorial and direct start",()=>{
  it("displays worked means from raw sums and withholds six-rated groups",()=>{
    const score=(values:string[])=>{const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));quiz.questions.slice(0,7).forEach((q,i)=>answers[q.id]=values[i]??"na");const r=scoreLikertQuestionnaire(quiz,answers);if(r.status!=="complete")throw Error("Rejected example");return r;};
    const r=score(["1","1","2","3","4","4","5"]);expect(r.facets.machiavellianism).toEqual({sum:20,rated:7,total:7,mean:2.9});
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireSd4Report quiz={quiz} result={r} locale="en"/>);
    expect(dom.querySelector('[data-sd4-facet="machiavellianism"] [data-sd4-mean]')?.textContent).toBe("2.86 / 5");
    expect(score(Array(6).fill("5")).facets.machiavellianism).toEqual({sum:30,rated:6,total:7,mean:null});
    expect(Object.keys(r).sort()).toEqual(["answered","facets","status"]);
  });
  it.each(["en","zh"] as const)("retains original/new full explanations and attribution in %s",async locale=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");const dom=document.createElement("div");
    dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim(),body=norm(dom.textContent??"");
    expect(sd4LandingSections).toHaveLength(8);expect(sd4LandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...sd4LandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...sd4LandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('.explore-intro [data-sd4-source]')).toBeNull();
    expect(dom.querySelector('[data-sd4-source]')).not.toBeNull();
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('input[type="checkbox"]')).toBeNull();
    expect(dom.querySelector('a[href="#dark-tetrad-sd4-reference-4"]')).not.toBeNull();
    expect(dom.querySelector('#dark-tetrad-sd4-reference-4')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
