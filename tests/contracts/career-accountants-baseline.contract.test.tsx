import { publishedCareerPage } from './publishedCareerPage';
const currentPage = await publishedCareerPage('zh');
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { careerDisplayIdentity, buildCareerPageDisplaySurface } from '@/lib/career/pageDisplay';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';

describe('September 5 accountant renderer with current content', () => {
  it.each(['zh'] as const)('binds and renders %s', locale => {
    const raw=structuredClone(currentPage);
    const page=normalizeCareerPage(raw,locale,'accountants-and-auditors')!;
    expect(page).not.toBeNull();
    const surface=buildCareerPageDisplaySurface(page,{slug:'accountants-and-auditors'},`/${locale}/tests/holland-career-interest-test-riasec`);
    const html=renderToStaticMarkup(<CareerDisplaySurface surface={surface}/>);
    expect(html).toContain('career-production-v1');
    expect(html).not.toContain('问题待补充');
    expect(html).not.toContain('字段 1');
    expect(html).not.toContain('内容待补充');
    const root=document.createElement('div');
    root.innerHTML=html;
    for (const name of [...(locale === 'zh' ? ['profile', 'direction-comparison', 'ai-impact'] : []), 'china-salary', 'us-salary', 'fit-center', 'work-risk', 'progression', 'outlook-transitions']) {
      expect(root.querySelectorAll(`[data-testid="career-dossier-${name}"]`), `Original ${name} component`).toHaveLength(1);
    }
    // data-* audit attributes are not reader-visible content. Native title hints
    // and expanded details are original, accessible presentation locations.
    const displayed=[root.textContent,...Array.from(root.querySelectorAll('[title]')).map(n=>n.getAttribute('title'))].join(' ');
    const compact=(s:string)=>s.replace(/\s+/g,'');
    const missing:string[]=[];
    for(const block of page.content.blocks) for(const item of block.items) {
      if(item.type!=='prose') continue;
      for(const paragraph of item.data.paragraphs as string[]) {
        const parts=paragraph.includes('｜https://') ? [paragraph.split('｜https://')[0]] : item.id==='work-context-block-1' ? paragraph.split('\n').map(row=>row.slice(row.indexOf('｜')+1)) : paragraph.includes(' → ') ? paragraph.split(' → ') : [paragraph];
        if(parts.some(part=>!compact(displayed).includes(compact(part)))) missing.push(`${item.id}: ${(paragraph).slice(0,100)}`);
      }
    }
    const hrefs=Array.from(root.querySelectorAll('a[href]')).map(n=>n.getAttribute('href')!);
    const inspectText=(v:string,id:string)=>{ if(!compact(displayed).includes(compact(v))) missing.push(`${id}: ${v.slice(0,100)}`); };
    for(const block of page.content.blocks) for(const item of block.items) {
      if(item.type==='list') for(const value of item.data.entries as string[]) {
        for(const part of item.id==='responsibilities-block-1' ? value.split('｜').slice(1) : [value]) inspectText(part,item.id);
      }
      if(item.type==='notice') for(const value of item.data.paragraphs as string[]) inspectText(value,item.id);
      if(item.type==='faq') for(const entry of item.data.entries as Array<{answer:string}>) inspectText(entry.answer,item.id);
      if(item.type==='cards'||item.type==='timeline') for(const entry of item.data.entries as Array<{values:string[]}>) for(const value of entry.values) inspectText(value,item.id);
      if(item.type==='table') for(const row of item.data.rows as string[][]) for(const cell of row) inspectText(cell,item.id);
      if(item.type==='links') for(const entry of item.data.entries as Array<{url:string;entity:string}>) {
        if(item.id==='navigation-links' && entry.entity==='path') { expect(surface.subject.path).toBe(entry.url); continue; }
        if(!hrefs.some(h=>h===entry.url || h.startsWith(entry.url+'?'))) missing.push(`${item.id}: link ${entry.url}`);
      }
      if(item.type==='sources') for(const entry of page.content.sources) {
        for(const detail of entry.details) inspectText(detail.split('https://')[0].replace(/｜\s*$/,''),entry.id);
        if(entry.url&&!hrefs.includes(entry.url)) missing.push(`${entry.id}: source link ${entry.url}`);
      }
    }
    expect(missing,'Every public paragraph needs a reader-visible location in the September 5 components').toEqual([]);
  });
  it('uses current ontology codes and rejects ambiguous identities', () => {
    const ontology={crosswalks:[{source_system:'us_soc',source_code:'13-2011',mapping_type:'exact'},{source_system:'onet_soc_2019',source_code:'13-2011.00',mapping_type:'direct_match'}]};
    expect(careerDisplayIdentity('accountants-and-auditors',ontology)).toEqual({slug:'accountants-and-auditors',socCode:'13-2011',onetCode:'13-2011.00'});
    expect(()=>careerDisplayIdentity('accountants-and-auditors',{crosswalks:[...ontology.crosswalks,{source_system:'us_soc',source_code:'99-9999',mapping_type:'exact'}]})).toThrow('identity.us_soc');
  });
  it('consumes the resolved display directly, independent of content item order', () => {
    const page=normalizeCareerPage(structuredClone(currentPage),'zh','accountants-and-auditors')!;
    const restore=(p:typeof page)=>buildCareerPageDisplaySurface(p,{slug:'accountants-and-auditors'},'/zh/tests/holland-career-interest-test-riasec');
    const before=restore(page);
    page.content.blocks.forEach(block=>block.items.reverse());
    expect(restore(page).publishedComponents).toEqual(before.publishedComponents);
    const display=page.display as {components:Record<string,unknown>};
    display.components.definition_block='Updated single-file definition from the backend.';
    expect(restore(page).publishedComponents?.definition_block).toBe(display.components.definition_block);
    expect(()=>buildCareerPageDisplaySurface(page,{slug:'actors'},'/zh/tests/holland-career-interest-test-riasec')).toThrow('CAREER_PAGE_DISPLAY_INVALID');
  });
  it('rejects missing or invalid display without using a frontend content fallback', () => {
    const page=normalizeCareerPage(structuredClone(currentPage),'zh','accountants-and-auditors')!;
    const restore=(display:unknown)=>buildCareerPageDisplaySurface({...page,display},{slug:'accountants-and-auditors'},'/zh/tests/holland-career-interest-test-riasec');
    const display=page.display as {contract_version:string;component_order:string[];components:Record<string,unknown>};
    expect(()=>restore(undefined)).toThrow('CAREER_PAGE_DISPLAY_INVALID');
    expect(()=>restore({...display,contract_version:'unknown'})).toThrow('CAREER_PAGE_DISPLAY_INVALID');
    expect(()=>restore({...display,component_order:[...display.component_order,display.component_order[0]]})).toThrow('CAREER_PAGE_DISPLAY_INVALID');
    const components={...display.components};
    delete components.definition_block;
    expect(()=>restore({...display,components})).toThrow('CAREER_PAGE_DISPLAY_INVALID');
  });
});
