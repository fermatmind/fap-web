import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { buildCareerPageDisplaySurface } from '@/lib/career/pageDisplay';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';

// The local authoring loop supplies actual backend output. No occupation body fixture.
const input = process.env.CAREER_LOCAL_PAGE_FILE;
describe.skipIf(!input)('local single-file career candidate', () => {
  const bundle = input ? JSON.parse(readFileSync(input, 'utf8')) : null;
  const raw = bundle?.career_page ?? bundle;
  const slug = raw?.subject.canonical_slug;
  const page = raw ? normalizeCareerPage(raw, 'zh', slug)! : null;
  const build = () => {
    expect(page).not.toBeNull();
    const surface = buildCareerPageDisplaySurface(page!, {slug}, '/zh/tests/holland-career-interest-test-riasec');
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
    return {root, surface};
  };
  it.skipIf(!process.env.CAREER_TEST_PAGE_FILE)('preserves verified baseline question dimensions in the aligned entry tables', () => {
    const baselineBundle = JSON.parse(readFileSync(process.env.CAREER_TEST_PAGE_FILE!, 'utf8'));
    const baseline = baselineBundle.career_page ?? baselineBundle;
    const entryTables = (content: typeof raw) => content.content.blocks
      .flatMap((block: { items: Array<{ copy_key: string; data: { column_keys?: string[]; rows?: unknown[][] } }> }) => block.items);
    for (const key of ['career.item.entry-role-comparison', 'career.item.interview-probation', 'career.item.credential-decision']) {
      const expected = entryTables(baseline).find((item: { copy_key: string }) => item.copy_key === key)!;
      const actual = entryTables(raw).find((item: { copy_key: string }) => item.copy_key === key)!;
      expect(actual.data.column_keys, key).toEqual(expected.data.column_keys);
      expect(actual.data.rows, key).toHaveLength(expected.data.rows.length);
    }
  });
  it.skipIf(!process.env.CAREER_TEST_PAGE_FILE)('aligns the internal description counts of native practice cards and steps', () => {
    const baselineBundle = JSON.parse(readFileSync(process.env.CAREER_TEST_PAGE_FILE!, 'utf8'));
    const baseline = baselineBundle.career_page ?? baselineBundle;
    const shape = (content: typeof raw, key:string) => content.content.blocks
      .flatMap((block: {items: Array<{copy_key:string;data:{entries:Array<{values:string[]}>}}>}) => block.items)
      .find((item: {copy_key:string}) => item.copy_key === key).data.entries
      .map((entry: {values:string[]}) => entry.values.length);
    for (const key of ['career.item.entry-work-sample-data','career.item.entry-portfolio','career.item.seven-day-trial']) {
      expect(shape(raw,key),key).toEqual(shape(baseline,key));
    }
  });
  it('selects every original rich module, including the profile and missing AI container', () => {
    const {root} = build();
    for (const name of ['profile','direction-comparison','ai-impact','china-salary','us-salary','fit-center','work-risk','progression','outlook-transitions']) {
      expect(root.querySelectorAll(`[data-testid="career-dossier-${name}"]`), name).toHaveLength(1);
    }
    expect(root.querySelectorAll('[data-testid="career-production-ai-gauge"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="career-production-hero-stats"] > div')).toHaveLength(5);
    expect(root.querySelectorAll('[data-testid="career-production-hero-badges"] > span')).toHaveLength(3);
    const direction = root.querySelector('[data-testid="career-dossier-direction-comparison"]')!;
    const labels = raw.display.interface;
    for (const [index, key] of ['direction_header', 'work_output_header', 'distinction_header', 'choice_header'].entries()) {
      expect(direction.querySelectorAll('thead th')[index]?.textContent).toBe(labels[`interface.direction_comparison.table.${key}`]);
    }
    expect(direction.querySelector('caption')?.textContent).toBe(labels['interface.direction_comparison.table.caption']);
    expect(direction.querySelector('aside')?.getAttribute('aria-label')).toBe(labels['interface.direction_comparison.evidence_label']);
    expect(direction.querySelector('#career-direction-conclusion-title')?.textContent).toBe(labels['interface.direction_comparison.conclusion_heading']);
    const fit = root.querySelector('[data-testid="career-dossier-fit-center"]')!;
    expect(fit.querySelector('#career-fit-directions-title')?.textContent).toBe(labels['interface.fit.directions_heading']);
    expect(fit.textContent).not.toContain('怎样理解 CEI');
    expect(fit.textContent).not.toContain('哪条会计方向');
    expect(root.textContent).not.toMatch(/问题待补充|字段 1|内容待补充/);
    for (const anchor of root.querySelectorAll('a[href^="#"]')) {
      const id = anchor.getAttribute('href')!.slice(1);
      expect(Array.from(root.querySelectorAll('[id]')).some(node => node.id === id), `Missing anchor ${id}`).toBe(true);
    }
  });
  it.skipIf(!process.env.CAREER_TEST_PAGE_FILE)('preserves the live accountant human-readable source headings', () => {
    const input = JSON.parse(readFileSync(process.env.CAREER_TEST_PAGE_FILE!, 'utf8'));
    const baseline = normalizeCareerPage(input.career_page ?? input, 'zh', 'accountants-and-auditors')!;
    const surface = buildCareerPageDisplaySurface(baseline, {slug:'accountants-and-auditors'}, '/zh/tests/holland-career-interest-test-riasec');
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
    const summaries = root.querySelectorAll('[data-testid="source-list"] summary > span:first-child');
    expect(Array.from(summaries, node => node.textContent)).toEqual(baseline.content.sources.map(source => source.scope ?? source.name));
  });
  it('shows source names instead of internal scope and evidence classification keys', () => {
    const {root} = build();
    const summaries = root.querySelectorAll('[data-testid="source-list"] summary');
    expect(summaries).toHaveLength(page!.content.sources.length);
    for (const [index,source] of page!.content.sources.entries()) {
      expect(summaries[index].querySelector('span')?.textContent).toBe(source.name);
      expect(summaries[index].textContent).not.toMatch(/primary_document|editorial_design|recruitment_proxy|parent_occupation_proxy|editorial_synthesis/);
    }
  });
  it('reads the file-owned AI label even when no verified score is available', () => {
    const changed = structuredClone(raw);
    changed.hero.ai = {...changed.hero.ai, availability:'missing', fact_ref:null, label:'任务暴露说明测试'};
    const normalized = normalizeCareerPage(changed, 'zh', slug)!;
    const surface = buildCareerPageDisplaySurface(normalized, {slug}, '/zh/tests/holland-career-interest-test-riasec');
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
    expect(root.querySelector('[data-testid="career-production-ai-gauge"]')?.textContent).toContain(changed.hero.ai.label);
    expect(surface.presentationV2?.hero.aiExposure).toBeNull();
  });
  it('resolves every risk citation to its module source label instead of exposing internal IDs', () => {
    const {root} = build();
    const risk = raw.display.components.career_risk_cards;
    const sources = new Map<string, {label:string}>(risk.source_links.map((source: {id:string;label:string}) => [source.id, source]));
    for (const card of risk.risks) for (const ref of card.evidence_refs) {
      expect(sources.has(ref), `${card.id}: unresolved citation ${ref}`).toBe(true);
      expect(root.querySelector('[data-testid="career-dossier-work-risk"]')?.textContent).toContain(sources.get(ref)!.label);
    }
  });
  it('renders all body values and native exercises outside hidden audit markup', () => {
    const {root, surface} = build();
    root.querySelectorAll('[aria-hidden="true"],.sr-only,script,style').forEach(node => node.remove());
    const displayed = root.textContent ?? '';
    const compact = (s:string) => s.replace(/\s+/g, '');
    // Only the three documented source-hint fields may use title attributes.
    // A body paragraph embedded in a larger hint still has to appear as body.
    const hintValues: string[] = [];
    const components = raw.display.components;
    for (const row of components.onet_structured_fields_block.rows) hintValues.push(row.value);
    for (const source of components.personality_fit_block.source_links) hintValues.push(source.usage);
    for (const key of ['career_risk_cards', 'career_path_block', 'market_signal_card']) {
      for (const source of components[key].source_links) hintValues.push(source.scope);
    }
    const renderedHints = new Set(Array.from(root.querySelectorAll('[title]'), node => compact(node.getAttribute('title') ?? '')));
    const permittedHints = new Set(hintValues.filter(value => typeof value === 'string').map(compact).filter(value => renderedHints.has(value)));
    const missing:string[] = [];
    const inspect = (text:string, id:string, allowSourceHint = false) => {
      if (!compact(displayed).includes(compact(text)) && !(allowSourceHint && permittedHints.has(compact(text)))) missing.push(`${id}: ${text.slice(0,100)}`);
    };
    for (const block of page!.content.blocks) for (const item of block.items) {
      if (item.type === 'prose') for (const paragraph of item.data.paragraphs as string[]) {
        // These separators are explicit fields of the original component contract.
        const parts = item.copyKey === 'career.item.work-context-block' && paragraph.includes('｜')
          ? paragraph.split('\n').map(row => row.slice(row.indexOf('｜') + 1))
          : item.copyKey === 'career.item.responsibilities-block' ? paragraph.split('｜').slice(1)
          : paragraph.includes(' → ') ? paragraph.split(' → ')
          : [paragraph];
        for (const part of parts) inspect(part, item.id, true);
      }
      if (item.type === 'notice') for (const value of item.data.paragraphs as string[]) inspect(value,item.id);
      if (item.type === 'list') for (const value of item.data.entries as string[]) {
        const parts = item.copyKey === 'career.item.responsibilities-block' ? value.split('｜').slice(1) : [value];
        for (const part of parts) inspect(part,item.id);
      }
      if (item.type === 'cards' || item.type === 'timeline') for (const entry of item.data.entries as Array<{values:string[]}>) for (const value of entry.values) inspect(value,item.id);
      if (item.type === 'table') for (const row of item.data.rows as string[][]) for (const cell of row) inspect(cell,item.id);
      if (item.type === 'faq') for (const entry of item.data.entries as Array<{question:string;answer:string}>) { inspect(entry.question,item.id); inspect(entry.answer,item.id); }
      if (item.type === 'links') for (const entry of item.data.entries as Array<{url:string;entity:string}>) {
        if (entry.url === surface.subject.path) continue;
        expect(Array.from(root.querySelectorAll('a[href]'), a=>a.getAttribute('href')).some(href=>href===entry.url || href?.startsWith(entry.url+'?')), entry.url).toBe(true);
      }
    }
    const hrefs = Array.from(root.querySelectorAll('a[href]'), node => node.getAttribute('href'));
    for (const source of page!.content.sources) {
      for (const detail of source.details) inspect(detail, `source:${source.id}`);
      if (source.limitation) inspect(source.limitation, `source:${source.id}:limitation`);
      if (source.url) expect(hrefs, `Source link ${source.id}`).toContain(source.url);
    }
    expect(missing, 'A resolved binding is not proof that its body is visible').toEqual([]);
  });
  it('uses API-provided profile labels without changing components', () => {
    const candidate = structuredClone(raw);
    candidate.display.interface = {
      ...candidate.display.interface,
      'interface.profile.responsibilities_heading': '本地字段验证',
      'interface.direction_comparison.table.direction_header': '方向字段验证',
    };
    const aiKeys = Object.keys(candidate.display.interface).filter(key => key.startsWith('interface.ai_impact.'));
    expect(aiKeys).toHaveLength(24);
    for (const [index, key] of aiKeys.entries()) candidate.display.interface[key] = `AI界面字段验证${index}。`;
    const fitKeys = Object.keys(candidate.display.interface).filter(key => key.startsWith('interface.fit.'));
    expect(fitKeys).toHaveLength(10);
    for (const [index, key] of fitKeys.entries()) candidate.display.interface[key] = `适配界面字段验证${index}。`;
    const journeyKeys = Object.keys(candidate.display.interface).filter(key => /^interface\.(risk|path|outlook)\./.test(key));
    expect(journeyKeys).toHaveLength(17);
    for (const [index, key] of journeyKeys.entries()) candidate.display.interface[key] = `路径界面字段验证${index}。`;
    const shellKeys = Object.keys(candidate.display.interface).filter(key => /^interface\.(china_salary|us_salary|quick_decision|navigation|sources)\./.test(key));
    expect(shellKeys).toHaveLength(14);
    for (const [index, key] of shellKeys.entries()) candidate.display.interface[key] = `页面界面字段验证${index}。`;
    const changedPage = normalizeCareerPage(candidate, 'zh', slug)!;
    const surface = buildCareerPageDisplaySurface(changedPage, {slug}, '/zh/tests/holland-career-interest-test-riasec');
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
    expect(root.querySelector('[data-testid="responsibilities-block"] h3')?.textContent).toBe('本地字段验证');
    const direction = root.querySelector('[data-testid="career-dossier-direction-comparison"]')!;
    expect(direction.querySelector('thead th')?.textContent).toBe('方向字段验证');
    expect(direction.querySelector('tbody th')?.getAttribute('data-label')).toBe('方向字段验证');
    const ai = root.querySelector('[data-testid="career-dossier-ai-impact"]')!;
    const accessibleText = [ai.textContent, ...Array.from(ai.querySelectorAll('[aria-label]'), node => node.getAttribute('aria-label'))].join(' ');
    for (const key of aiKeys) expect(accessibleText, key).toContain(candidate.display.interface[key]);
    const fit = root.querySelector('[data-testid="career-dossier-fit-center"]')!;
    for (const key of fitKeys) expect(fit.textContent, key).toContain(candidate.display.interface[key]);
    for (const key of journeyKeys) {
      const moduleName = key.startsWith('interface.risk.') ? 'work-risk' : key.startsWith('interface.path.') ? 'progression' : 'outlook-transitions';
      expect(root.querySelector(`[data-testid="career-dossier-${moduleName}"]`)?.textContent, key).toContain(candidate.display.interface[key]);
    }
    const shellText = [root.textContent, ...Array.from(root.querySelectorAll('[aria-label]'), node => node.getAttribute('aria-label'))].join(' ');
    for (const key of shellKeys) expect(shellText, key).toContain(candidate.display.interface[key]);
    candidate.display.interface['interface.profile.responsibilities_heading'] = '';
    expect(() => buildCareerPageDisplaySurface(normalizeCareerPage(candidate, 'zh', slug)!, {slug}, '/zh/tests/holland-career-interest-test-riasec')).toThrow('CAREER_PAGE_DISPLAY_INVALID:interface');
  });
});
