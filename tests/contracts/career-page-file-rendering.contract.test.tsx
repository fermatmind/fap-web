import {careerEvidenceLabel} from '@/lib/career/evidenceLabels';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {normalizeCareerPage, CAREER_PAGE_SECTIONS} from '@/lib/career/careerPage';
import {CareerPageTemplate} from '@/components/career/display/CareerPageTemplate';

const path = process.env.CAREER_PAGE_CORPUS;
const pages = path ? readFileSync(path,'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
const escape = (v: string) => v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');

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
  const accountants = JSON.parse(readFileSync(process.cwd() + '/tests/fixtures/career-page/accountants-and-auditors.zh-CN.json','utf8'));
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
    if (raw === empty) expect(html).toContain('Content pending');
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
