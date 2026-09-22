import {publishedCareerPage} from './publishedCareerPage';
const accountants = await publishedCareerPage('zh');
import {careerEvidenceLabel} from '@/lib/career/evidenceLabels';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {normalizeCareerPage, careerPageHasPublicBody, careerPageFaq, CAREER_PAGE_SECTIONS} from '@/lib/career/careerPage';
import {CareerPageTemplate} from '@/components/career/display/CareerPageTemplate';
import {CareerPageItem} from '@/components/career/display/CareerPageItem';
import {CareerDisplaySurface} from '@/components/career/display/CareerDisplaySurface';
import {supportsCareerDossierFitCenter} from '@/components/career/display/CareerDossierFitCenter';
import {careerDisplayIdentity, buildCareerPageDisplaySurface} from '@/lib/career/pageDisplay';
import {careerContentV3FaqItems} from '@/lib/career/contentV3';

const path = process.env.CAREER_PAGE_CORPUS;
const pages = path ? readFileSync(path,'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
const escape = (v: string) => v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');

it.skipIf(!process.env.CAREER_PUBLIC_API_DIR)('verifies every actual generic FAQ and implicit fit-heading consumer in the supplied public snapshots', () => {
  const directory = process.env.CAREER_PUBLIC_API_DIR!;
  const evidence: Array<Record<string, unknown>> = [];
  for (const file of readdirSync(directory).filter(file => file.endsWith('.json') && !file.endsWith('.en.json')).sort()) {
    const raw = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    const slug = raw.career_page.subject.canonical_slug;
    const page = normalizeCareerPage(raw.career_page, 'zh', slug);
    expect(page, slug).not.toBeNull();
    if (!page) continue;
    const identity = slug === 'accountants-and-auditors' || page.display !== undefined ? careerDisplayIdentity(slug, raw.ontology) : null;
    const surface = identity ? buildCareerPageDisplaySurface(page, identity, '/zh/tests/holland-career-interest-test-riasec') : null;
    if (surface) {
      const fit = surface.publishedComponents?.personality_fit_block;
      if (!surface.interfaceLabels?.['interface.fit.directions_heading'] && supportsCareerDossierFitCenter(fit) && fit.directions.length > 0) {
        const node = document.createElement('div');
        node.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
        const heading = node.querySelector('#career-fit-directions-title')?.textContent;
        expect(heading, slug).toBe('你更可能适合哪些工作方向？');
        evidence.push({slug, source_hash: page.content.sourceContentSha256, branch: 'dedicated', check: 'implicit_fit_heading', heading});
      }
      continue;
    }
    const items = page.content.blocks.flatMap(block => block.items).filter(item => item.type === 'faq' && item.availability === 'available');
    if (!items.length) continue;
    const expected = careerContentV3FaqItems(page.content);
    const node = document.createElement('div');
    node.innerHTML = renderToStaticMarkup(<>{items.map(item => <CareerPageItem key={item.id} item={item} content={page.content} />)}</>);
    const questions = Array.from(node.querySelectorAll('summary'), item => item.textContent);
    expect(questions, slug).toEqual(expected.map(item => item.question));
    expect(careerPageFaq(page), slug).toEqual(expected.map(({question, answer}) => ({question, answer})));
    for (const item of expected) expect(node.textContent, `${slug}: ${item.question}`).toContain(item.answer);
    evidence.push({slug, source_hash: page.content.sourceContentSha256, branch: 'generic', check: 'faq_questions_answers_jsonld', entries: expected.length, questions});
  }
  expect(evidence.filter(item => item.check === 'implicit_fit_heading').length).toBeGreaterThan(0);
  expect(evidence.filter(item => item.branch === 'generic').length).toBeGreaterThan(0);
  if (process.env.CAREER_FOUNDATION_CONSUMER_EVIDENCE) writeFileSync(process.env.CAREER_FOUNDATION_CONSUMER_EVIDENCE, JSON.stringify(evidence, null, 2)+'\n');
  console.info('career_actual_consumer_counts', {fit: evidence.filter(item => item.check === 'implicit_fit_heading').length, faqPages: evidence.filter(item => item.branch === 'generic').length});
}, 120000);

it.skipIf(!path || !process.env.CAREER_FOUNDATION_REVIEWED_SLUGS || !process.env.CAREER_PUBLIC_API_DIR)('keeps reviewed source notes readable through each real page display branch', () => {
  const slugs: string[] = JSON.parse(readFileSync(process.env.CAREER_FOUNDATION_REVIEWED_SLUGS!, 'utf8'));
  const corpus = new Map(pages.filter(raw => raw.locale === 'zh-CN').map(raw => [raw.subject.canonical_slug, raw]));
  const evidence: Array<Record<string, unknown>> = [];
  for (const slug of slugs) {
    const raw = corpus.get(slug);
    expect(raw, slug).toBeDefined();
    const page = normalizeCareerPage(raw, 'zh', slug);
    expect(page, slug).not.toBeNull();
    if (!page) continue;
    const publicBefore = JSON.parse(readFileSync(join(process.env.CAREER_PUBLIC_API_DIR!, slug+'.json'), 'utf8'));
    const identity = slug === 'accountants-and-auditors' || page.display !== undefined ? careerDisplayIdentity(slug, publicBefore.ontology) : null;
    const surface = identity ? buildCareerPageDisplaySurface(page, identity, '/zh/tests/holland-career-interest-test-riasec') : null;
    const node = document.createElement('div');
    node.innerHTML = renderToStaticMarkup(surface ? <CareerDisplaySurface surface={surface} /> : <CareerPageTemplate page={page} ctaHref="/zh/tests/holland-career-interest-test-riasec" />);
    node.querySelectorAll('script,style,noscript').forEach(item => item.remove());
    const text = node.textContent ?? '';
    const titles = Array.from(node.querySelectorAll('[title]'), item => item.getAttribute('title') ?? '');
    const reader = text+' '+titles.join(' ');
    const leaks = Array.from(reader.matchAll(/documented_unavailable|non_material|cn_mapping_status|turn\d+(?:view|search|fetch)\d+/g), match => reader.slice(Math.max(0, match.index-100), match.index+160));
    evidence.push({slug, source_hash: page.content.sourceContentSha256, branch: surface ? 'dedicated' : 'generic', reader_text_characters: text.length, title_tooltips: titles.length, leaks, result: leaks.length ? 'FAIL' : 'PASS'});
  }
  expect(evidence).toHaveLength(slugs.length);
  if (process.env.CAREER_FOUNDATION_SOURCE_EVIDENCE) writeFileSync(process.env.CAREER_FOUNDATION_SOURCE_EVIDENCE, JSON.stringify(evidence, null, 2)+'\n');
  expect(evidence.filter(item => item.result === 'FAIL').map(item => item.slug)).toEqual([]);
}, 120000);

describe.skipIf(!path)('canonical file to final HTML corpus', () => {
  it('renders every locale, body value, item, source and fixed section', () => {
    expect(pages).toHaveLength(2092);
    for (const raw of pages) {
      const label = `${raw.subject.canonical_slug}/${raw.locale}`;
      const page = normalizeCareerPage(raw, raw.locale === 'zh-CN' ? 'zh' : 'en', raw.subject.canonical_slug);
      expect(page, label).not.toBeNull();
      if (!page) continue;
      const html = renderToStaticMarkup(<CareerPageTemplate page={page} ctaHref="/zh/tests/riasec" />);
      for (const section of CAREER_PAGE_SECTIONS) expect(html,label).toContain(`id="career-content-${section}"`);
      let cursor = 0;
      for (const block of page.content.blocks) {
        for (const item of block.items) {
          const offset = html.indexOf(`data-career-content-item="${item.id}"`);
          expect(offset, `${label}/${item.id}`).toBeGreaterThan(-1);
          // Order within each source block is preserved, including four-plus items.
          expect(offset, `${label}/${item.id} order`).toBeGreaterThanOrEqual(cursor);
          cursor = offset;
          const scan = (v: unknown, key = '') => {
            if (typeof v === 'string' && !['id','key','question_key','column_keys','relation','url','fact_refs','source_refs'].includes(key)) expect(html,`${label}/${item.id}/${key}: ${v}`).toContain(escape((key === "evidence_type" || key === "scope") ? careerEvidenceLabel(v,page.content.locale)! : v));
            else if (Array.isArray(v)) v.forEach(x => scan(x,key));
            else if (v && typeof v === 'object') Object.entries(v).forEach(([k,x]) => scan(x,k));
          };
          scan(item.data);
        }
        cursor = 0;
      }
    }
  },120000);
});

describe('file-owned page contract', () => {
  const actors = JSON.parse(readFileSync(process.cwd() + '/tests/fixtures/career-page/actors.zh-CN.json','utf8'));
  const empty = JSON.parse(readFileSync(process.cwd() + '/tests/fixtures/career-page/health-educators.en.json','utf8'));
  it.each([actors,accountants,empty])('renders the same complete template for $subject.canonical_slug/$locale', raw => {
    const page = normalizeCareerPage(raw,raw.locale === 'en' ? 'en':'zh',raw.subject.canonical_slug)!;
    expect(page).not.toBeNull();
    const html = renderToStaticMarkup(<CareerPageTemplate page={page} ctaHref="/en/tests/riasec" />);
    expect(CAREER_PAGE_SECTIONS.every(s=>html.includes(`id="career-content-${s}"`))).toBe(true);
    expect(html).not.toContain('这行就稳');
    if (raw === actors) {
      expect(html).toContain('29.05美元/小时');
      expect(html).toContain('美国时薪中位数');
      expect(html).toContain('数据待补充');
      expect(page.content.blocks[0].items).toHaveLength(4);
    }
    if (raw === empty) {
      expect(html).toContain('Career content pending');
      expect(careerPageHasPublicBody(page)).toBe(false);
    } else {
      expect(careerPageHasPublicBody(page)).toBe(true);
      expect(html).not.toContain('data-career-body-state="pending"');
    }
  });
  it('uses readable source labels and excludes file-marked import controls', () => {
    const page = normalizeCareerPage(accountants,'zh','accountants-and-auditors')!;
    const html = renderToStaticMarkup(<CareerPageTemplate page={page} ctaHref="/zh/tests/riasec" />);
    const root = document.createElement('div');
    root.innerHTML = html;
    expect(root.textContent).not.toMatch(/\bpublished\b|\bqa1\b/);
    expect(root.querySelector('[data-source-name] a')?.textContent).not.toMatch(/^[a-z]+_[a-z_]+/);
    expect(root.querySelectorAll('[data-source-name]').length).toBeGreaterThan(0);
  });
  it('rejects identity, locale, broken available content and unknown fact references', () => {
    expect(normalizeCareerPage(actors,'en','actors')).toBeNull();
    expect(normalizeCareerPage(actors,'zh','accountants-and-auditors')).toBeNull();
    const bad = structuredClone(actors);
    bad.content.blocks[0].items[0].data = {paragraphs: 12};
    expect(normalizeCareerPage(bad,'zh','actors')).toBeNull();
    const fact = structuredClone(actors);
    fact.hero.metrics[0].fact_ref = 'unknown';
    expect(normalizeCareerPage(fact,'zh','actors')).toBeNull();
  });
  it('does not consume poisoned legacy content', () => {
    const poison = {...actors, page:{content:'这行就稳'},presentation_v2:{hero:{title:'WRONG'}}};
    expect(normalizeCareerPage(poison,'zh','actors')).toEqual(normalizeCareerPage(actors,'zh','actors'));
  });
});
