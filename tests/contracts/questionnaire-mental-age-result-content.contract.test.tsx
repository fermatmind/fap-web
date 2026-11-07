import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import raw from "@/lib/questionnaires/data/mental-age.json";
import type {Questionnaire} from "@/lib/questionnaires/types";
import {MentalAgeClassicResult} from "@/components/questionnaires/MentalAgeClassicClient";
import {scoreMentalAgeQuestionnaire} from "@/lib/questionnaires/mentalAge";
import {mentalAgeResultProfile} from "@/lib/questionnaires/result-content/mental-age";
const q=raw as Questionnaire;
it("never appends the retired 12-item reading to the new stable guide identity",()=>{expect(mentalAgeResultProfile(q.profiles[0])).toBe(q.profiles[0]);});
it.each(["en","zh"]as const)("renders every reachable %s result, its style, formula, choices and optional comparison",locale=>{
 for(let sum=0;sum<=60;sum++){
  const answers=Object.fromEntries(q.questions.map((item,i)=>[item.id,item.options.find(o=>o.score===Math.min(2,Math.max(0,sum-i*2)))!.id]));const result=scoreMentalAgeQuestionnaire(q,answers);if(result.status!=="complete")throw Error('complete');
  const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(<MentalAgeClassicResult quiz={q} result={result} answers={answers} locale={locale} actualAge={35} year={2026}/>);
  expect(dom.querySelector('[data-mental-age-value]')?.textContent).toBe(`${sum+10}${locale==='zh'?'岁':' years'}`);expect(dom.querySelector('[data-mental-age-sum]')?.textContent).toBe(`${sum} / 60`);expect(dom.querySelectorAll('[data-mental-age-answer]')).toHaveLength(30);expect(dom.querySelector('[data-mental-age-equivalent]')?.textContent).toContain(String(2026-sum-10));expect(dom.querySelector('[data-mental-age-sharing]')).not.toBeNull();
 }
});
