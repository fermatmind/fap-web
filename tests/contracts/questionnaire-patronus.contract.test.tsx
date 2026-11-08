import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import data from "@/lib/questionnaires/data/patronus-quiz.json";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import { isPatronusConfigurationValid, scorePatronus, PATRONUS_DISTANCE_DENOMINATOR } from "@/lib/questionnaires/patronus";
import { PatronusClient } from "@/components/questionnaires/PatronusClient";
import { PatronusPage } from "@/components/questionnaires/PatronusPage";
import { PatronusWitness } from "@/components/questionnaires/PatronusWitness";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
vi.mock("@/lib/entertainment/activity",()=>({recordEntertainmentActivity:vi.fn()}));
vi.mock("@/lib/analytics",()=>({trackEvent:vi.fn()}));
const quiz=data as Questionnaire;
type RefQ={id:string;kind:'rank'|'multiple'|'single';dimension?:string;prompt:Text;items?:{id:string;dimension:string;label:Text}[];options?:{id:string;points:number;label:Text}[]};
type RefP={id:string;target:number[];name:Text;guide:Record<string,Text>;witness:{rankOrder:number[];multi:unknown[];singleOptionsByDimension:number[][]}};
const bytes=readFileSync('tests/fixtures/questionnaires/patronus-original20-40-reference.json');
const original=JSON.parse(bytes.toString()) as {questions:RefQ[];profiles:RefP[];dimensions:{id:string;label:Text}[]};
const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
const dims=original.dimensions.map(d=>d.id),max=[17,17,17,17,14,14];
function fixedAnswers(p:RefP){const used=Object.fromEntries(dims.map(d=>[d,0]));return Object.fromEntries(original.questions.map(q=>q.kind==='rank'?[q.id,JSON.stringify(p.witness.rankOrder.map(i=>q.items![i].id))]:q.kind==='multiple'?[q.id,'[]']:(()=>{const n=p.witness.singleOptionsByDimension[dims.indexOf(q.dimension!)][used[q.dimension!]++];return[q.id,q.options!.find(o=>o.points===n)!.id];})()));}
function rawAnswers(raw:number[]){const left=raw.map((n,i)=>n-i);return Object.fromEntries(original.questions.map(q=>{if(q.kind==='rank')return[q.id,JSON.stringify(q.items!.map(o=>o.id))];if(q.kind==='multiple')return[q.id,'[]'];const i=dims.indexOf(q.dimension!),n=Math.min(3,left[i]);left[i]-=n;return[q.id,q.options!.find(o=>o.points===n)!.id];}));}
function oracle(raw:number[]){const distances=original.profiles.map(p=>p.target.reduce((s,n,i)=>s+((raw[i]-n)/max[i])**2,0));const min=Math.min(...distances);return{distances,min,ids:original.profiles.filter((_,i)=>Math.abs(distances[i]-min)<1e-12).map(p=>p.id)};}
afterEach(cleanup);
beforeAll(()=>{HTMLElement.prototype.scrollIntoView=vi.fn();});

describe('original Patronus 20 mixed screens and 40 reachable portraits',()=>{
 it('binds the complete bilingual package, interactions and 40 distinct original drawings',async()=>{
  expect(quiz.source.itemBankSha256).toBe(sha(bytes));expect(quiz.source.resultContentSha256).toBe(sha(JSON.stringify({profiles:quiz.profiles,guide:quiz.guide,faq:quiz.faq})));
  expect(isPatronusConfigurationValid(quiz)).toBe(true);expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);expect((await loadQuestionnaire(quiz.slug))?.source).toEqual(quiz.source);
  expect(quiz.questions.map(q=>q.prompt)).toEqual(original.questions.map(q=>q.prompt));expect(quiz.questions.filter(q=>!q.interaction)).toHaveLength(16);expect(quiz.questions.filter(q=>q.interaction==='rank')).toHaveLength(1);expect(quiz.questions.filter(q=>q.interaction==='multiple')).toHaveLength(3);
  expect(quiz.profiles.map(p=>p.id)).toEqual(original.profiles.map(p=>p.id));const artwork=new Set<string>();
  for(const p of quiz.profiles){const ref=original.profiles.find(r=>r.id===p.id)!;expect(p.sections).toHaveLength(5);for(const s of p.sections){expect(s.paragraphs[0]).toEqual(ref.guide[s.id]);for(const locale of ['en','zh']as const)expect(s.paragraphs[0][locale].length).toBeGreaterThan(8);}const svg=readFileSync(`public/images/quiz-portraits/patronus-quiz/${p.id}.svg`,'utf8');artwork.add(sha(svg.replace(/<title>[\s\S]*?<\/title>/,'')));}
  expect(artwork.size).toBe(40);
 });
 it('reproduces all 40 independently supplied witness patterns with exact zero distance',()=>{
  for(const p of original.profiles){const a=fixedAnswers(p);expect(quiz.patronus!.witnesses[p.id]).toEqual(a);expect(quiz.patronus!.targets[p.id]).toEqual(p.target);const r=scorePatronus(quiz,a);if(r.status!=='complete')throw Error('Reachable witness rejected');expect(dims.map(d=>r.raw[d])).toEqual(p.target);expect(r.minimumDistanceUnits).toBe(0);expect(r.profileIds).toEqual([p.id]);const o=oracle(p.target);for(let i=0;i<40;i++)expect(r.distanceUnits[original.profiles[i].id]/PATRONUS_DISTANCE_DENOMINATOR).toBeCloseTo(o.distances[i],12);}
 });
 it('uses least-to-most rank weights, additive multiple selections and all exact nearest ties',()=>{
  const a=fixedAnswers(original.profiles[0]);const rank=quiz.questions.find(q=>q.interaction==='rank')!;a[rank.id]=JSON.stringify([...rank.options].reverse().map(o=>o.id));const multi=quiz.questions.find(q=>q.interaction==='multiple')!;a[multi.id]=JSON.stringify(multi.options.slice(0,2).map(o=>o.id));const r=scorePatronus(quiz,a);if(r.status!=='complete')throw Error('Valid mixed response rejected');const expected=original.profiles[0].target.map((n,i)=>n+5-2*i+(i<2?1:0));expect(dims.map(d=>r.raw[d])).toEqual(expected);expect(r.profileIds).toEqual(oracle(expected).ids);
  let found=false;for(let state=0;state<4096;state++){let n=state;const raw=Array.from({length:6},()=>{const v=6+n%4;n=Math.floor(n/4);return v;});const o=oracle(raw);if(o.ids.length<2)continue;const tie=scorePatronus(quiz,rawAnswers(raw));if(tie.status!=='complete')throw Error('Tie witness rejected');expect(dims.map(d=>tie.raw[d])).toEqual(raw);expect(tie.profileIds).toEqual(o.ids);found=true;break;}expect(found).toBe(true);
 });
 it('keeps missing choices incomplete, accepts explicit none and refuses malformed or corrupted packages',()=>{
  const a=fixedAnswers(original.profiles[0]);expect(scorePatronus(quiz,{})).toEqual({status:'incomplete',answered:0});const rank=quiz.questions.find(q=>q.interaction==='rank')!;expect(scorePatronus(quiz,{...a,[rank.id]:JSON.stringify(rank.options.slice(0,2).map(o=>o.id))}).status).toBe('incomplete');expect(scorePatronus(quiz,{...a,[rank.id]:'["courage","courage"]'}).status).toBe('invalid');expect(scorePatronus(quiz,{...a,unknown:'x'}).status).toBe('invalid');expect(scorePatronus(quiz,[]).status).toBe('invalid');const bad=structuredClone(quiz);bad.patronus!.targets[bad.profiles[1].id]=[...bad.patronus!.targets[bad.profiles[0].id]];expect(scorePatronus(bad,a).status).toBe('unavailable');const invalid=structuredClone(quiz);invalid.questions[0].options[0].directionId='toString';expect(isPatronusConfigurationValid(invalid)).toBe(false);
 });
 it.each(['en','zh']as const)('publishes all 40 %s guides with complete fixed examples and source paragraphs',locale=>{
  const landing=renderToStaticMarkup(<PatronusPage quiz={quiz} locale={locale}/>);const dom=document.createElement('div');dom.innerHTML=landing;expect(dom.querySelectorAll('h1')).toHaveLength(1);expect(dom.querySelectorAll(`a[href^="/${locale}/tests/explore/patronus-quiz/results/"]`)).toHaveLength(40);for(const s of quiz.guide)for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);
  for(const p of quiz.profiles){dom.innerHTML=renderToStaticMarkup(<PatronusWitness quiz={quiz} id={p.id} locale={locale}/>);expect(dom.querySelectorAll('[data-patronus-witness-screen]')).toHaveLength(20);expect(dom.querySelector('[data-patronus-public-witness]')?.getAttribute('data-patronus-public-witness')).toBe(p.id);}
 });
 it.each(['en','zh']as const)('completes all 20 %s interactions, preserves the original match during comparison and clears on retake',async locale=>{
  const {container}=render(<PatronusClient quiz={quiz} locale={locale}/>);fireEvent.click(container.querySelector('button[data-explore-start]')!);const witness=fixedAnswers(original.profiles[0]);
  for(const q of quiz.questions){expect(container.querySelector('[data-patronus-screen]')?.getAttribute('data-patronus-screen')).toBe(q.id);if(q.interaction){const selected=JSON.parse(witness[q.id])as string[];for(const id of selected)fireEvent.click(container.querySelectorAll('input[type=checkbox]')[q.options.findIndex(o=>o.id===id)]);}else fireEvent.click(container.querySelector(`input[value="${witness[q.id]}"]`)!);fireEvent.click(container.querySelector('button[data-questionnaire-next]')!);}
  expect(container.querySelector('[data-original-patronus-ids]')?.getAttribute('data-original-patronus-ids')).toBe('stag');expect(container.querySelectorAll('#take-test h2')).toHaveLength(1);fireEvent.click(container.querySelector('[data-patronus-compare="badger"]')!);expect(container.querySelector('[data-patronus-comparison]')?.getAttribute('data-patronus-comparison')).toBe('badger');expect(container.querySelector('[data-original-patronus-ids]')?.getAttribute('data-original-patronus-ids')).toBe('stag');
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:vi.fn().mockRejectedValue(new Error('denied'))}});await act(async()=>{fireEvent.click([...container.querySelectorAll('button')].find(b=>b.textContent===(locale==='zh'?'复制我的原始结果':'Copy my original result'))!);});await waitFor(()=>expect(container.querySelector('textarea')?.value).toContain(original.profiles[0].name[locale]));expect(container.querySelector('textarea')?.value).not.toContain(original.profiles.find(p=>p.id==='badger')!.name[locale]);fireEvent.click([...container.querySelectorAll('button')].find(b=>b.textContent===(locale==='zh'?'清空并重新测试':'Clear and retake'))!);expect(container.querySelector('[data-patronus-screen]')?.getAttribute('data-patronus-screen')).toBe(quiz.questions[0].id);expect(container.querySelectorAll('input:checked')).toHaveLength(0);
 },30000);
});
