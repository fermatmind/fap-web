import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import source from '@/lib/questionnaires/data/overthinking-screener.json';
import { overthinkingResultProfile } from '@/lib/questionnaires/result-content/overthinking-screener';
import { prepareResultProfile, prepareQuestionnaireResultReadings } from '@/lib/questionnaires/result-content/readings';
import { isPtq15ConfigurationValid, scorePtq15Questionnaire } from '@/lib/questionnaires/ptq15';
import { QuestionnairePtq15Report } from '@/components/questionnaires/QuestionnairePtq15Report';
import type { Questionnaire } from '@/lib/questionnaires/types';
vi.mock('next/headers',()=>({headers:async()=>new Headers()}));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
describe('Four complete PTQ readings with strict missingness and original sums',()=>{
 it('keeps source identity, paragraphs and incomplete admission with immutable idempotent readings',()=>{
  const before=JSON.stringify(quiz);expect(isPtq15ConfigurationValid(prepared)).toBe(true);for(const p of quiz.profiles){const r=overthinkingResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(r.sections.find(t=>t.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);const ready=prepareResultProfile(quiz.slug,p);expect(prepareResultProfile(quiz.slug,ready)).toBe(ready);}const all=Object.fromEntries(quiz.questions.map(q=>[q.id,'0']));for(const q of quiz.questions){const a={...all};delete a[q.id];expect(scorePtq15Questionnaire(prepared,a)).toEqual({status:'incomplete',answered:14});}expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:'__proto__'};expect(overthinkingResultProfile(unknown)).toBe(unknown);
 });
 it.each(['zh','en']as const)('opens four complete public %s readings without values and with original attribution',async locale=>{
  const route=await import('@/components/questionnaires/QuestionnaireGuide');for(const p of quiz.profiles){const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelectorAll('[data-overthinking-result-reading] h2')).toHaveLength(6);expect(dom.querySelector('[data-ptq15-score]')).toBeNull();expect(dom.querySelector('[data-ptq15-source]')?.textContent).toContain('CC BY 3.0');for(const s of overthinkingResultProfile(p).sections)for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);if(locale==='en')expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(['zh','en']as const)('preserves each %s total and independent skipped parts with all general readings',locale=>{
  const patterns=Array.from({length:61},(_,sum)=>Object.fromEntries(quiz.questions.map((q,i)=>[q.id,String(Math.min(4,Math.max(0,sum-i*4)))])));
  patterns.push(Object.fromEntries(quiz.questions.map(q=>[q.id,'na'])),Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i===0?'na':'2'])));
  for(const a of patterns){const r=scorePtq15Questionnaire(prepared,a);expect(r).toEqual(scorePtq15Questionnaire(quiz,a));if(r.status!=='complete')throw Error('Complete explicit answers required');const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(<QuestionnairePtq15Report quiz={prepared} result={r} locale={locale}/>);expect(dom.querySelectorAll('[data-overthinking-result-reading] h4')).toHaveLength(24);const rows=[{id:'total-reading',sum:r.ptq15.overallSum,rated:r.ptq15.rated,total:15,maximum:60},...Object.entries(r.ptq15.parts).map(([id,p])=>({...p,id:id+'-reading'}))];for(const p of rows){const expected=p.sum===null?(locale==='zh'?`资料不足：${p.rated}/${p.total}项有数值回答；需要完整，不计算本项原始和。`:`Insufficient information: ${p.rated}/${p.total} items rated; all are needed. No raw sum is calculated.`):(locale==='zh'?`原始和：${p.sum}（可取范围0—${p.maximum}；${p.rated}/${p.total}项有效）`:`Raw sum: ${p.sum} (possible range 0–${p.maximum}; ${p.rated}/${p.total} items rated)`);expect(dom.querySelector(`[data-ptq15-score="${p.id}"]`)?.textContent).toBe(expected);}for(const p of quiz.profiles)for(const s of overthinkingResultProfile(p).sections)for(const t of s.paragraphs)expect(dom.querySelector(`[data-overthinking-result-reading="${p.id}"]`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);}
 });
});
