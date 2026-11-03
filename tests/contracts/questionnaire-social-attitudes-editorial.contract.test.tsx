import { socialAttitudesLandingFaq, socialAttitudesLandingSections } from "@/components/questionnaires/SocialAttitudesLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/social-attitudes-reflection.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("Social attitudes individual bilingual editorial",()=>{
  it("recomputes complete, four-rating and insufficient examples without rank",()=>{
    for(const [values,sum,rated,mean] of [[['1','2','3','4','5','3'],18,6,3],[['1','2','4','5','na','na'],12,4,3],[['1','2','4','na','na','na'],7,3,null]] as const){
      const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,'na']));
      quiz.questions.filter(q=>q.options[0].directionId==='reviewing-rules').forEach((q,i)=>answers[q.id]=values[i]);
      const r=scoreQuestionnaire(quiz,answers);if(r.status!=='complete'||!('facets'in r))throw Error('Example rejected');
      expect(r.facets['reviewing-rules']).toEqual({sum,rated,total:6,mean});
      for(const k of ['total','leaders','percentile','profileId'])expect(r).not.toHaveProperty(k);
    }
  });
  it.each(['en','zh'] as const)("renders all original and new prose and direct start in %s",async locale=>{
    const entry=await import('@/components/questionnaires/QuestionnairePage');
    const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,'').replace(/\s+/g,' ').trim();const body=norm(dom.textContent??'');
    expect(socialAttitudesLandingSections).toHaveLength(8);expect(socialAttitudesLandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...socialAttitudesLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...socialAttitudesLandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#social-attitudes-reflection-reference-2"]')).not.toBeNull();expect(dom.querySelector('#social-attitudes-reflection-reference-2')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
