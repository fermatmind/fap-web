import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/face-self-image.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { faceSelfImageLandingSections, faceSelfImageLandingFaq } from "@/components/questionnaires/FaceSelfImageLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Face self-image individual bilingual editorial",()=>{
  it("recomputes examples without confusing neutrality, missing or a winning identity",()=>{
    const score=(values:string[])=>{const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));quiz.questions.filter(q=>q.options[0].directionId==="face-view").forEach((q,i)=>answers[q.id]=values[i]??"na");const r=scoreQuestionnaire(quiz,answers);if(r.status!=="complete"||!("facets" in r))throw Error("Rejected example");return r;};
    expect(score(["2","4","4"]).facets["face-view"]).toEqual({sum:10,rated:3,total:4,mean:3.3});
    expect(score(["5","5"]).facets["face-view"]).toEqual({sum:10,rated:2,total:4,mean:null});
    const mixed=score(["1","3","5"]),moderate=score(Array(4).fill("3"));
    expect(mixed.facets["face-view"]).toEqual({sum:9,rated:3,total:4,mean:3});
    expect(moderate.facets["face-view"]).toEqual({sum:12,rated:4,total:4,mean:3});
    expect(Object.keys(mixed).sort()).toEqual(["answered","facets","status"]);
    expect(quiz.questions[0].options[2].label.en).toBe("Sometimes");
  });
  it.each(["en","zh"] as const)("renders every original and new paragraph with direct entry in %s",async locale=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");const dom=document.createElement("div");
    dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=norm(dom.textContent??"");
    expect(faceSelfImageLandingSections).toHaveLength(8);expect(faceSelfImageLandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...faceSelfImageLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...faceSelfImageLandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(13);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#face-self-image-reference-2"]')).not.toBeNull();
    expect(dom.querySelector('#face-self-image-reference-2')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
