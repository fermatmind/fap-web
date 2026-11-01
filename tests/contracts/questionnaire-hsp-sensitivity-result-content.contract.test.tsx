import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import source from '@/lib/questionnaires/data/hsp-sensitivity-quiz.json';
import { hspSensitivityResultProfile } from '@/lib/questionnaires/result-content/hsp-sensitivity-quiz';
import { prepareResultProfile, prepareQuestionnaireResultReadings } from '@/lib/questionnaires/result-content/readings';
import { isLikertConfigurationValid, scoreLikertQuestionnaire } from '@/lib/questionnaires/scoring';
import { QuestionnaireSensitivityExperienceReport } from '@/components/questionnaires/QuestionnaireSensitivityExperienceReport';
import type { Questionnaire } from '@/lib/questionnaires/types';
vi.mock('next/headers',()=>({headers:async()=>new Headers()}));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
describe('Four original recent-experience readings without an assigned HSP identity',()=>{
 it('keeps source identity, original paragraphs and incomplete admission with immutable idempotent readings',()=>{
  const before=JSON.stringify(quiz);expect(isLikertConfigurationValid(prepared)).toBe(true);for(const p of quiz.profiles){const r=hspSensitivityResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(r.sections.find(t=>t.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);const ready=prepareResultProfile(quiz.slug,p);expect(prepareResultProfile(quiz.slug,ready)).toBe(ready);}const all=Object.fromEntries(quiz.questions.map(q=>[q.id,'1']));for(const q of quiz.questions){const a={...all};delete a[q.id];expect(scoreLikertQuestionnaire(prepared,a)).toEqual({status:'incomplete',answered:23});}expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:'__proto__'};expect(hspSensitivityResultProfile(unknown)).toBe(unknown);
 });
 it.each(['zh','en']as const)('opens four complete public %s readings without personal values',async locale=>{
  const route=await import('@/components/questionnaires/QuestionnaireGuide');for(const p of quiz.profiles){const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelectorAll('[data-hsp-sensitivity-result-reading] h2')).toHaveLength(6);expect(dom.querySelector('[data-sensitivity-experience-score]')).toBeNull();for(const s of hspSensitivityResultProfile(p).sections)for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);if(locale==='en')expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(['zh','en']as const)('retains each %s six-item mean and independent skipped groups with every general reading',locale=>{
  const patterns=Array.from({length:25},(_,extra)=>Object.fromEntries(quiz.questions.map((q,i)=>[q.id,String(1+Math.min(4,Math.max(0,extra-(i%6)*4)))])));
  patterns.push(Object.fromEntries(quiz.questions.map(q=>[q.id,'na'])),Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i===0?'na':'3'])));
  for(const a of patterns){const r=scoreLikertQuestionnaire(prepared,a);expect(r).toEqual(scoreLikertQuestionnaire(quiz,a));if(r.status!=='complete')throw Error('Complete explicit answers required');const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(<QuestionnaireSensitivityExperienceReport quiz={prepared} result={r} locale={locale}/>);expect(dom.querySelectorAll('[data-hsp-sensitivity-result-reading] h4')).toHaveLength(24);for(const[id,p]of Object.entries(r.facets)){const expected=p.mean===null?(locale==='zh'?`资料不足：${p.rated}/6题有数值回答；需要六题完整，不计算本组均分。`:`Insufficient information: ${p.rated}/6 items rated; all six are needed. No mean is calculated for this group.`):(locale==='zh'?`近期体验频率均分：${p.mean.toFixed(1)} / 5（6/6题有效）`:`Recent-experience frequency mean: ${p.mean.toFixed(1)} / 5 (6/6 items rated)`);expect(dom.querySelector(`[data-sensitivity-experience-score="${id}"]`)?.textContent).toBe(expected);}for(const p of quiz.profiles)for(const s of hspSensitivityResultProfile(p).sections)for(const t of s.paragraphs)expect(dom.querySelector(`[data-hsp-sensitivity-result-reading="${p.id}"]`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);}
 });
});
