import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { completionGapEditorial } from '@/components/questionnaires/CompletionGapEditorial';
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
describe('285-product closeout: specific remaining editorial and explanation regressions', () => {
  for (const slug of ['flower','chakra','multiple-intelligences','empathy']) it.each(['en','zh'] as const)(`${slug}: actual %s route retains full source and renders dedicated reading`, async locale => {
    const quiz=JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`,'utf8'));
    const route=await import('@/app/(localized)/[locale]/tests/explore/[slug]/page');
    const dom=document.createElement('div'); dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug})}));
    expect(dom.querySelector('h1')?.textContent).toBe(quiz.title[locale]);
    for(const section of completionGapEditorial[slug].sections) for(const p of section.paragraphs) expect(dom.textContent).toContain(p[locale]);
    for(const f of completionGapEditorial[slug].faq) expect(dom.textContent).toContain(f.answer[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/${slug}/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelector('#take-test')).not.toBeNull();
    expect(dom.querySelector('#take-test input[required]')).toBeNull();
  });
  it('names the actual correct option in every previously misplaced explanation without changing keys',()=>{
    for(const [slug,keys] of [['ai-literacy',{AI_06:'B'}],['project-management',{PROJECT_01:'D',PROJECT_08:'B',PROJECT_09:'D',PROJECT_14:'B',PROJECT_24:'C',PROJECT_26:'D',PROJECT_29:'B'}]] as const){
      const quiz=JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`,'utf8'));
      for(const [id,key] of Object.entries(keys)){
        const q=quiz.questions.find((v:{id:string})=>v.id===id);expect(q.correctOptionId).toBe(key);
        expect(q.options.find((o:{id:string})=>o.id===key)).toBeDefined();
        expect(q.explanation.en).toMatch(new RegExp(`\\b${key}\\b`));expect(q.explanation.zh).toContain(key);
        expect(q.explanation.en).not.toMatch(/first (?:request|package|note|choice|record|option|clarification)/i);expect(q.explanation.zh).not.toContain('首项');
      }
    }
  });
});
