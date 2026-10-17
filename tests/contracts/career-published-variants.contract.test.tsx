import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { publishedCareerPage } from '@/tests/fixtures/career-page/publishedCareerPage';
import { normalizeCareerPublishedComponents } from '@/lib/career/publishedComponentContract';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { buildCareerPageDisplaySurface, careerDisplayIdentity } from '@/lib/career/pageDisplay';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';
import { CareerDossierAiImpact } from '@/components/career/display/CareerDossierAiImpact';
import { CareerDossierChinaSalary, CareerDossierUsSalary } from '@/components/career/display/CareerDossierSalaryReference';

const original = await publishedCareerPage('zh');
const components = () => structuredClone(original.display.components);

it('preserves annual salary labels and a single distinct authority URL', () => {
  const c = components();
  const salary = c.career_snapshot_primary_locale.salary;
  salary.china_salary_table = salary.china_salary_table.map((row: Record<string, string>) => ({ '城市/区间': row['城市/区间'], '年工资参照（行业/人员大类）': row['月薪参考'] }));
  salary.china_intl = salary.china_ref;
  salary.sources_note = salary.china_ref;
  salary.edu = 'Qualification boundary';
  salary.fact_refs = [];
  expect(normalizeCareerPublishedComponents(c, ['career_snapshot_primary_locale'])).not.toBeNull();
  const html = renderToStaticMarkup(<CareerDossierChinaSalary value={c.career_snapshot_primary_locale} locale="zh" />);
  for (const row of salary.china_salary_table) expect(html).toContain(row['年工资参照（行业/人员大类）']);
  expect(html).toContain('].年工资参照（行业/人员大类）');
});

it('renders every supplied wage tier and readable authority text without inventing URLs', () => {
  const c = components();
  const value = c.career_snapshot_secondary_locale;
  value.wage_tiers = Array.from({ length: 5 }, (_, i) => ({ label: `Position ${i}`, value: `Value ${i}`, equivalent: `Boundary ${i}`, interpretation: `Interpretation ${i}` }));
  value.wage_column_labels = ['Position', 'Value', 'Boundary', 'Interpretation'];
  value.industry_value_label = 'Industry reference';
  value.authority_sources = 'Reviewed authority note with no external URL';
  value.bls_table.forEach((row: Record<string, string>) => { row['说明'] = 'Reviewed source note'; });
  value.bls_table = value.bls_table.filter((row: Record<string, string>) => row['指标'].includes('就业')).slice(0, 1);
  expect(normalizeCareerPublishedComponents(c, ['career_snapshot_secondary_locale'])).not.toBeNull();
  const html = renderToStaticMarkup(<CareerDossierUsSalary value={value} locale="zh" />);
  for (let i = 0; i < 5; i++) expect(html).toContain(`Value ${i}`);
  expect(html).toContain('<p data-career-api-field="career_snapshot_secondary_locale.authority_sources">Reviewed authority note with no external URL</p>');
});

it('accepts optional source descriptions and preserves explicit unavailable links', () => {
  const c = components();
  c.market_signal_card.transitions = c.market_signal_card.transitions.slice(0, 1);
  delete c.market_signal_card.source_links[0].scope;
  c.career_risk_cards.source_links[0].href = '#career-visual-group-risk';
  c.career_risk_cards.source_links[1].href = null;
  c.personality_fit_block.source_links[0] = { id: 'source', label: 'Authority', href: null, scope: 'Unavailable link' };
  expect(normalizeCareerPublishedComponents(c, ['market_signal_card', 'career_risk_cards', 'personality_fit_block'])).not.toBeNull();
  c.career_risk_cards.source_links[0].href = 'javascript:alert(1)';
  expect(normalizeCareerPublishedComponents(c, ['career_risk_cards'])).toBeNull();
  c.market_signal_card.transitions[0].target_href = '/zh/career/jobs/wrong-target';
  expect(normalizeCareerPublishedComponents(c, ['market_signal_card'])).toBeNull();
});

it('renders nullable AI links as text and rejects unsafe or unapproved external links', () => {
  const value = components().ai_impact_table;
  value.questions[0]['链接'] = null;
  value.questions[1]['链接'] = '编辑建议，无外部链接或采用效果证据';
  value.authority_links[0]['链接'] = 'https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html';
  const html = renderToStaticMarkup(<CareerDossierAiImpact value={value} locale="zh" />);
  expect(html).toContain('career-dossier-ai-impact');
  expect(html).toContain('编辑建议，无外部链接或采用效果证据');
  expect(html).toContain('https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html');
  for (const href of ['javascript:alert(1)', 'https://evil.example/', 'https://www.stats.gov.cn/unreviewed.html', 'https://user:password@www.stats.gov.cn/']) {
    value.authority_links[0]['链接'] = href;
    expect(renderToStaticMarkup(<CareerDossierAiImpact value={value} locale="zh" />)).toBe('');
  }
});

it('renders declared fit copy independently of historical body marker items', () => {
  const page = normalizeCareerPage(original, 'zh', 'accountants-and-auditors');
  expect(page).not.toBeNull();
  if (!page) return;
  const fit = page.content.blocks.find(block => block.copyKey === 'career.block.fit');
  expect(fit).toBeDefined();
  if (!fit) return;
  fit.items = fit.items.filter(item => item.copyKey !== 'career.item.personality-fit-block');
  const surface = buildCareerPageDisplaySurface(page, careerDisplayIdentity('accountants-and-auditors', {}), original.display.components.primary_cta.href);
  const html = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
  expect(html).toContain('career-dossier-fit-center');
  expect(html).toContain(original.display.components.personality_fit_block.direct_answer);
});

it.skipIf(!process.env.CAREER_PUBLIC_API_DIR)('renders every supplied public API page through the actual component tree', async () => {
  const dir = process.env.CAREER_PUBLIC_API_DIR!;
  const files = readdirSync(dir).filter(file => file.endsWith('.json'));
  expect(files.length).toBeGreaterThan(0);
  for (const [index, file] of files.entries()) {
    if (index % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const slug = raw.identity.canonical_slug;
    const page = normalizeCareerPage(raw.career_page, 'zh', slug);
    expect(page, slug).not.toBeNull();
    if (!page) continue;
    const surface = buildCareerPageDisplaySurface(page, careerDisplayIdentity(slug, raw.ontology), raw.career_page.display.components.primary_cta.href);
    const node = document.createElement('div');
    node.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
    expect(node.querySelector('[data-testid="career-display-surface"]'), slug).not.toBeNull();
    for (const component of ['career-dossier-ai-impact', 'career-dossier-china-salary', 'career-dossier-us-salary', 'career-dossier-fit-center']) {
      expect(node.querySelector(`[data-testid="${component}"]`), `${slug}:${component}`).not.toBeNull();
    }
    expect(node.querySelectorAll('a[href^="javascript:"]'), slug).toHaveLength(0);
  }
}, 180000);
