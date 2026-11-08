import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import data from "@/lib/questionnaires/data/avatar-bender-quiz.json";
import element from "@/lib/questionnaires/data/what-element-am-i.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { FantasyArchetypeReport } from "@/components/questionnaires/FantasyArchetypeReport";

const quiz=data as Questionnaire;
const reference=readFileSync('tests/fixtures/questionnaires/avatar-bending-original24-reference.json');
const original=JSON.parse(reference.toString());
const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
function answers(counts:number[]){let offset=0;return Object.fromEntries(counts.flatMap((n,d)=>Array.from({length:n},()=>{const q=quiz.questions[offset++];return [q.id,q.options.find(o=>o.directionId===quiz.directions[d].id)!.id]})));}

describe('original Avatar bending 24-scenario edition',()=>{
 it('binds the full bilingual package, equal option exposure and separate product identity',async()=>{
  expect(quiz.questions).toEqual(original.questions);expect(quiz.directions).toEqual(original.directions);
  expect(quiz.source.itemBankSha256).toBe(sha(reference));expect(quiz.source.resultContentSha256).toBe(sha(JSON.stringify({profiles:quiz.profiles,guide:quiz.guide,faq:quiz.faq})));
  expect(quiz.questions).toHaveLength(24);expect(quiz.profiles.map(p=>p.id)).toEqual(['water','earth','fire','air']);
  expect(isArchetypeConfigurationValid(quiz)).toBe(true);expect((await loadQuestionnaire(quiz.slug))?.source).toEqual(quiz.source);
  expect(quiz.slug).not.toBe(element.slug);expect(quiz.questions).not.toEqual(element.questions);
  for(const d of quiz.directions)for(let p=0;p<4;p++)expect(quiz.questions.filter(q=>q.options[p].directionId===d.id)).toHaveLength(6);
  for(const p of quiz.profiles){expect(p.sections).toHaveLength(6);for(const section of p.sections)for(const locale of ['en','zh'] as const){expect(section.title[locale].length).toBeGreaterThan(3);expect(section.paragraphs[0][locale].length).toBeGreaterThan(10);}expect(readFileSync(`public/images/quiz-portraits/${quiz.slug}/${p.id}.svg`,'utf8')).toContain('<svg');}
 });
 it('proves all 2925 attainable count quadruples and all 15 single or tied winner sets',()=>{
  let witnesses=0;const sets=new Set<string>();
  for(let a=0;a<=24;a++)for(let b=0;b<=24-a;b++)for(let c=0;c<=24-a-b;c++){
   const counts=[a,b,c,24-a-b-c],r=scoreArchetypeQuestionnaire(quiz,answers(counts));if(r.status!=='complete')throw Error('Valid count witness rejected');
   const expected=quiz.directions.filter((_,i)=>counts[i]===Math.max(...counts)).map(d=>d.id);expect(Object.values(r.counts)).toEqual(counts);expect(r.profileIds).toEqual(expected);sets.add(expected.join('|'));witnesses++;
  }
  expect(witnesses).toBe(2925);expect(sets.size).toBe(15);
  const complete=answers([24,0,0,0]);const partial={...complete};delete partial.q24;
  expect(scoreArchetypeQuestionnaire(quiz,partial).status).toBe('incomplete');expect(scoreArchetypeQuestionnaire(quiz,{...complete,q01:'unknown'}).status).toBe('invalid');expect(scoreArchetypeQuestionnaire(quiz,{...complete,unknown:'x'}).status).toBe('invalid');
 });
 it.each(['en','zh'] as const)('renders every tied %s match without a hidden Avatar result and keeps comparison links separate',locale=>{
  const result=scoreArchetypeQuestionnaire(quiz,answers([6,6,6,6]));if(result.status!=='complete')throw Error('Four-way tie rejected');
  const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(<FantasyArchetypeReport quiz={quiz} result={result} locale={locale} answers={answers([6,6,6,6])}/>);
  expect(dom.querySelectorAll('[data-archetype-match]')).toHaveLength(4);expect(dom.querySelectorAll('h2')).toHaveLength(0);
  for(const p of quiz.profiles){expect(dom.textContent).toContain(p.title[locale]);expect(dom.querySelector(`a[href="/${locale}/tests/explore/avatar-bender-quiz/results/${p.id}"][target="_blank"]`)).not.toBeNull();}
  expect(result.profileIds).not.toContain('avatar');expect(dom.querySelector('[data-bending-boundary]')?.textContent).toBe(quiz.instructions![locale]);
 });
 it('has a real directory cover and stable destination',()=>{
  const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(<MoreTests locale="en"/>);const card=[...dom.querySelectorAll('article')].find(a=>a.querySelector('a[href="/en/tests/explore/avatar-bender-quiz"]'));
  expect(card?.querySelector('img')?.getAttribute('src')).toBe('/images/test-covers/avatar-bender-quiz.webp');expect(readFileSync('public/images/test-covers/avatar-bender-quiz.webp').subarray(8,12).toString()).toBe('WEBP');
 });
});
