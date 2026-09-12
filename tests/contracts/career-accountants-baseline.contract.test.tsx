import { publishedCareerPage } from './publishedCareerPage';
const currentPage = await publishedCareerPage('zh');
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { careerDisplayIdentity, buildCareerPageDisplaySurface } from '@/lib/career/pageDisplay';
import { CareerDossierChinaSalary, supportsCareerDossierChinaSalary, CareerDossierUsSalary, supportsCareerDossierUsSalary } from '@/components/career/display/CareerDossierSalaryReference';
import { CareerDossierDirectionComparison, supportsCareerDossierDirectionComparison } from '@/components/career/display/CareerDossierDirectionComparison';
import { normalizeCareerPublishedComponents } from '@/lib/career/publishedComponentContract';
import type { CareerPublishedValue } from '@/lib/career/publishedComponentContract';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';

describe('September 5 accountant renderer with current content', () => {
  it.each(['china_soc_row', 'china_class_row', 'china_open'])('exposes the published %s salary explanation to readers and assistive technology', field => {
    const page = normalizeCareerPage(structuredClone(currentPage), 'zh', 'accountants-and-auditors')!;
    const surface = buildCareerPageDisplaySurface(page, {slug: 'accountants-and-auditors'}, '/zh/tests/holland-career-interest-test-riasec');
    const value = surface.publishedComponents!.career_snapshot_primary_locale! as {salary: Record<string, CareerPublishedValue>};
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDossierChinaSalary value={value} locale="zh" />);
    const nodes = root.querySelectorAll(`[data-career-api-field="career_snapshot_primary_locale.salary.${field}"]`);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].textContent).toBe(value.salary[field]);
    expect(nodes[0].closest('[aria-hidden="true"], [hidden], .sr-only, .hidden')).toBeNull();
    expect(nodes[0].tagName).toBe('P');
  });
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
  it('renders the same comparison UI with occupation-neutral data keys', () => {
    const page = normalizeCareerPage(structuredClone(currentPage), 'zh', 'accountants-and-auditors')!;
    const surface = buildCareerPageDisplaySurface(page, {slug: 'accountants-and-auditors'}, '/zh/tests/holland-career-interest-test-riasec');
    const baseline = surface.publishedComponents!.adjacent_career_comparison_table!;
    const neutral = structuredClone(baseline) as {rows: Array<Record<string, CareerPublishedValue>>};
    for (const row of neutral.rows) {
      row['关键区别'] = row['与会计师／审计师的关键区别'];
      delete row['与会计师／审计师的关键区别'];
    }
    expect(supportsCareerDossierDirectionComparison(neutral)).toBe(true);
    expect(normalizeCareerPublishedComponents({adjacent_career_comparison_table:neutral}, ["adjacent_career_comparison_table"])).not.toBeNull();
    const original = document.createElement('div');
    original.innerHTML = renderToStaticMarkup(<CareerDossierDirectionComparison value={baseline} locale="zh" />);
    const shared = document.createElement('div');
    shared.innerHTML = renderToStaticMarkup(<CareerDossierDirectionComparison value={neutral} locale="zh" />);
    expect(shared.textContent).toBe(original.textContent);
    expect(shared.querySelectorAll('tbody tr')).toHaveLength(original.querySelectorAll('tbody tr').length);
    expect(shared.querySelector('[data-career-api-field$=".关键区别"]')).not.toBeNull();
    neutral.rows[0]['关键区别'] = '';
    expect(supportsCareerDossierDirectionComparison(neutral)).toBe(false);
  });
  it('uses supplied hourly wage cells without annualizing or injecting accountant copy', () => {
    const page = normalizeCareerPage(structuredClone(currentPage), 'zh', 'accountants-and-auditors')!;
    const surface = buildCareerPageDisplaySurface(page, {slug: 'accountants-and-auditors'}, '/zh/tests/holland-career-interest-test-riasec');
    const value = structuredClone(surface.publishedComponents!.career_snapshot_secondary_locale!) as Record<string, CareerPublishedValue>;
    value.wage_column_labels = ['统计位置', '小时工资', '换算边界', '口径说明'];
    value.industry_value_label = '小时工资中位数';
    value.wage_tiers = ['低位', '中位', '高位'].map(label => ({label, value: '$29.05 / hour', equivalent: '不换算成年薪', interpretation: '按文件解释该统计位置。'}));
    expect(supportsCareerDossierUsSalary(value)).toBe(true);
    expect(normalizeCareerPublishedComponents({career_snapshot_secondary_locale:value}, ["career_snapshot_secondary_locale"])).not.toBeNull();
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDossierUsSalary value={value} locale="zh" />);
    const table = root.querySelector('[data-career-api-table="career_snapshot_secondary_locale.bls_table.wages"]')!;
    expect(table.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(table.textContent).toContain('$29.05 / hour');
    expect(table.textContent).toContain('不换算成年薪');
    expect(table.textContent).not.toContain('会计师');
    expect(table.textContent).not.toContain('税前月均');
    value.wage_tiers = [];
    expect(supportsCareerDossierUsSalary(value)).toBe(false);
    expect(normalizeCareerPublishedComponents({career_snapshot_secondary_locale:value}, ["career_snapshot_secondary_locale"])).toBeNull();
  });
  it('uses file-provided China salary questions and table labels', () => {
    const page = normalizeCareerPage(structuredClone(currentPage), 'zh', 'accountants-and-auditors')!;
    const surface = buildCareerPageDisplaySurface(page, {slug: 'accountants-and-auditors'}, '/zh/tests/holland-career-interest-test-riasec');
    const value = structuredClone(surface.publishedComponents!.career_snapshot_primary_locale!) as {salary: Record<string, CareerPublishedValue>};
    value.salary.ui = {official_heading: '公开项目报价', scenario_heading: '项目日价怎么比较？', scenario_caption: '报价范围对照', scenario_role_label: '项目类型', scenario_value_label: '报价口径', scenario_interpretation_label: '范围与局限', driver_heading: '计酬条件', ai_heading: '技术与项目报酬'};
    expect(supportsCareerDossierChinaSalary(value)).toBe(true);
    expect(normalizeCareerPublishedComponents({career_snapshot_primary_locale:value}, ["career_snapshot_primary_locale"])).not.toBeNull();
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDossierChinaSalary value={value} locale="zh" />);
    expect(root.querySelector('#china-salary-10k-title')?.textContent).toBe('项目日价怎么比较？');
    expect(root.querySelector('#salary-ai-answer-title')?.textContent).toBe('技术与项目报酬');
    expect(root.querySelector('[data-career-api-table] thead')?.textContent).toBe('项目类型报价口径范围与局限');
    value.salary.ui = {official_heading: 'Partial data must not fall back'};
    expect(supportsCareerDossierChinaSalary(value)).toBe(false);
    expect(normalizeCareerPublishedComponents({career_snapshot_primary_locale:value}, ["career_snapshot_primary_locale"])).toBeNull();
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
