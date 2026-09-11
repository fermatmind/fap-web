import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { accountantsIdentity, restoreAccountantsSurface } from '@/lib/career/accountantsBaseline/adapter';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';

describe('September 5 accountant renderer with current content', () => {
  it.each(['zh','en'] as const)('binds and renders %s', locale => {
    const raw=JSON.parse(readFileSync(`tests/fixtures/career-page/accountants-and-auditors.${locale==='zh'?'zh-CN':'en'}.json`,'utf8'));
    const page=normalizeCareerPage(raw,locale,'accountants-and-auditors')!;
    expect(page).not.toBeNull();
    const surface=restoreAccountantsSurface(page,{slug:'accountants-and-auditors'},`/${locale}/tests/holland-career-interest-test-riasec`);
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
    expect(accountantsIdentity('accountants-and-auditors',ontology)).toEqual({slug:'accountants-and-auditors',socCode:'13-2011',onetCode:'13-2011.00'});
    expect(()=>accountantsIdentity('accountants-and-auditors',{crosswalks:[...ontology.crosswalks,{source_system:'us_soc',source_code:'99-9999',mapping_type:'exact'}]})).toThrow('identity.us_soc');
  });
  it('binds by ID rather than source position and never falls back to historical prose', () => {
    const raw=JSON.parse(readFileSync('tests/fixtures/career-page/accountants-and-auditors.zh-CN.json','utf8'));
    const page=normalizeCareerPage(raw,'zh','accountants-and-auditors')!;
    const cta='/zh/tests/holland-career-interest-test-riasec';
    const before=restoreAccountantsSurface(page,{slug:'accountants-and-auditors'},cta);
    page.content.blocks.forEach(block=>block.items.reverse());
    const after=restoreAccountantsSurface(page,{slug:'accountants-and-auditors'},cta);
    expect(after.publishedComponents).toEqual(before.publishedComponents);
    const item=page.content.blocks.flatMap(b=>b.items).find(i=>i.id==='definition-block-1')!;
    item.data.paragraphs=['Current authority changed this definition.'];
    expect(restoreAccountantsSurface(page,{slug:'accountants-and-auditors'},cta).publishedComponents?.definition_block).toBe('Current authority changed this definition.');
    expect(()=>restoreAccountantsSurface(page,{slug:'actors'},cta)).toThrow('identity');
    page.content.blocks[0].items.push({...item,id:'unknown-public-item'});
    expect(()=>restoreAccountantsSurface(page,{slug:'accountants-and-auditors'},cta)).toThrow('unknown-public-item');
  });
  it('rejects a missing binding, an added source link, and a cross-block swap', () => {
    const raw=JSON.parse(readFileSync('tests/fixtures/career-page/accountants-and-auditors.zh-CN.json','utf8'));
    const page=normalizeCareerPage(raw,'zh','accountants-and-auditors')!;
    const restore=(p:typeof page)=>restoreAccountantsSurface(p,{slug:'accountants-and-auditors'},'/zh/tests/holland-career-interest-test-riasec');
    const missing=structuredClone(page);
    missing.content.blocks.find(b=>b.id==='profile')!.items=missing.content.blocks.find(b=>b.id==='profile')!.items.filter(i=>i.id!=='definition-block-1');
    expect(()=>restore(missing)).toThrow('definition-block-1');
    const added=structuredClone(page);
    const links=added.content.blocks.flatMap(b=>b.items).find(i=>i.id==='ai-impact-table-114')!.data.entries as Array<Record<string,unknown>>;
    links.push({...links[0],id:'link-unmapped'});
    expect(()=>restore(added)).toThrow('ai-impact-table-114');
    const moved=structuredClone(page);
    const profile=moved.content.blocks.find(b=>b.id==='profile')!;
    moved.content.blocks.find(b=>b.id==='fit')!.items.push(profile.items.shift()!);
    expect(()=>restore(moved)).toThrow('definition-block-1');
  });

});
