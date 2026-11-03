import { tipi10LandingFaq, tipi10LandingSections } from "@/components/questionnaires/Tipi10LandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/tipi-10.json";
import { scoreTipi10Questionnaire } from "@/lib/questionnaires/tipi10";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("TIPI10 individual bilingual editorial",()=>{
  it("recomputes the displayed two-item examples and retains different patterns",()=>{
    const calculate=(one:string,six:string)=>{const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,'4']));answers['tipi-01']=one;answers['tipi-06']=six;const r=scoreTipi10Questionnaire(quiz,answers);if(r.status!=='complete')throw Error('Example rejected');return r;};
    expect(calculate('6','3').tipi10.extraversion.mean).toBe(5.5);
    const neutral=calculate('4','4'),both=calculate('7','7');
    expect(neutral.tipi10.extraversion.mean).toBe(4);expect(both.tipi10.extraversion.mean).toBe(4);
    expect(neutral.tipi10.extraversion.items.map(x=>x.keyed)).toEqual([4,4]);expect(both.tipi10.extraversion.items.map(x=>x.keyed)).toEqual([7,1]);
    for(const k of ['total','leaders','percentile','profileId'])expect(both).not.toHaveProperty(k);
  });
  it.each(['en','zh'] as const)("renders all original and new prose and direct start in %s",async locale=>{
    const entry=await import('@/components/questionnaires/QuestionnairePage');
    const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({locale,slug:quiz.slug})}));
    const norm=(s:string)=>s.replace(/\[\d+\]/g,'').replace(/\s+/g,' ').trim();const body=norm(dom.textContent??'');
    expect(tipi10LandingSections).toHaveLength(8);expect(tipi10LandingFaq).toHaveLength(8);
    for(const s of [...quiz.guide,...tipi10LandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const s of quiz.guide)for(const p of s.paragraphs)expect(body.split(norm(p[locale])).length-1).toBe(1);
    for(const f of [...quiz.faq,...tipi10LandingFaq])expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(13);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();expect(dom.querySelector('.explore-intro [data-tipi10-attribution]')).toBeNull();expect(dom.querySelectorAll('[data-tipi10-attribution]')).toHaveLength(1);expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#tipi-10-reference-3"]')).not.toBeNull();expect(dom.querySelector('#tipi-10-reference-3')).not.toBeNull();
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  });
});
