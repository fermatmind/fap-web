import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {render} from '@testing-library/react';
import {CareerDossierAiImpact, supportsCareerDossierAiImpact} from '@/components/career/display/CareerDossierAiImpact';
import type {CareerPublishedValue} from '@/lib/career/publishedComponentContract';
import {CareerDisplaySurface} from '@/components/career/display/CareerDisplaySurface';
import {normalizeCareerPage} from '@/lib/career/careerPage';
import {buildCareerPageDisplaySurface, careerDisplayIdentity} from '@/lib/career/pageDisplay';
import {publishedCareerPage} from '@/tests/fixtures/career-page/publishedCareerPage';

const page = await publishedCareerPage('zh') as {display: {components: {ai_impact_table: CareerPublishedValue}}};
type LinkRow = Record<string, string>;
const sourceGroups = ['evidence_rows', 'questions', 'authority_links'] as const;

function withSourceUrl(url: string) {
  const value = structuredClone(page.display.components.ai_impact_table) as Record<string, CareerPublishedValue>;
  for (const key of sourceGroups) {
    for (const row of value[key] as LinkRow[]) row['链接'] = url;
  }
  return value;
}

describe('Career AI source links from Current files', () => {
  it('keeps separately labelled citations to the same source without React key collisions', () => {
    const value = structuredClone(page.display.components.ai_impact_table) as Record<string, CareerPublishedValue>;
    const links = value.authority_links as LinkRow[];
    links.push({...links[0], '来源': 'The same source, cited for another scope'});
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const {container} = render(<CareerDossierAiImpact value={value} locale="zh" />);
      expect(container.querySelectorAll('[data-career-api-list="ai_impact_table.authority_links"] li')).toHaveLength(links.length);
      expect(container.textContent).toContain('The same source, cited for another scope');
      expect(errors.mock.calls.some(call => String(call[0]).includes('same key'))).toBe(false);
    } finally {
      errors.mockRestore();
    }
  });

  it('renders the unmodified projected AI payload and retains its answer', () => {
    const value = page.display.components.ai_impact_table;
    expect(supportsCareerDossierAiImpact(value)).toBe(true);
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDossierAiImpact value={value} locale="zh" />);
    expect(root.querySelector('[data-career-api-component="ai_impact_table"]')).not.toBeNull();
    expect(root.textContent).toContain(String((value as Record<string, CareerPublishedValue>).answer));
  });

  it.each(['extra-id', 'missing-type'])('keeps malformed authority rows closed: %s', kind => {
    const value = structuredClone(page.display.components.ai_impact_table) as Record<string, CareerPublishedValue>;
    const row = (value.authority_links as LinkRow[])[8] ?? (value.authority_links as LinkRow[])[0];
    if (kind === 'extra-id') row.id = 'family-mental';
    else delete row['类型'];
    expect(supportsCareerDossierAiImpact(value)).toBe(false);
  });

  it.skipIf(!process.env.CAREER_PUBLIC_API_DIR)('renders all four failed public snapshots without changing body or identity', () => {
    for (const slug of ['telemarketers', 'telephone-operators', 'tellers', 'terrazzo-workers-and-finishers']) {
      const raw = JSON.parse(readFileSync(join(process.env.CAREER_PUBLIC_API_DIR!, slug + '.json'), 'utf8'));
      const normalized = normalizeCareerPage(raw.career_page, 'zh', slug);
      expect(normalized, slug).not.toBeNull();
      if (!normalized) continue;
      const surface = buildCareerPageDisplaySurface(normalized, careerDisplayIdentity(slug, raw.ontology), '/zh/tests/holland-career-interest-test-riasec');
      expect(surface.subject.canonicalSlug).toBe(slug);
      expect(surface.contentV3?.sourceContentSha256).toBe(raw.career_page.source_content_sha256);
      const root = document.createElement('div');
      root.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
      expect(root.querySelectorAll('[data-career-api-component]').length, slug).toBe(19);
      expect(root.textContent).toContain(raw.career_page.display.components.ai_impact_table.answer);
    }
  });

  it.each([
    'https://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://scjgj.gz.gov.cn/zcfg/xzfg/content/post_9745565.html',
    'https://www.samr.gov.cn/wljys/gzzd/art/2023/art_3ef1e889c1e644d4b65b5f5c7f432386.html',
    'https://fermatmind.com/zh/career/jobs/terrazzo-workers-and-finishers',
  ])('renders the reviewed source without losing the AI body: %s', url => {
    const value = withSourceUrl(url);
    expect(supportsCareerDossierAiImpact(value)).toBe(true);
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<CareerDossierAiImpact value={value} locale="zh" />);
    expect(root.querySelector('[data-career-api-component="ai_impact_table"]')).not.toBeNull();
    expect(root.querySelectorAll('a[href]').length).toBeGreaterThan(0);
    for (const link of root.querySelectorAll('a[href]')) expect(link.getAttribute('href')).toBe(url);
    expect(root.textContent).toContain(String(value.answer));
  });

  it.each([
    'http://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://user@gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://user:pass@gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html?redirect=https://example.com',
    'https://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html#article-29',
    'https://gdkfq.ezhou.gov.cn.evil.example/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://other.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://evil.example/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'https://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html.other',
    'https://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html/',
    'https://gdkfq.ezhou.gov.cn/',
    'https://gdkfq.ezhou.gov.cn/another-law.html',
    'https://gdkfq.ezhou.gov.cn:8443/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html',
    'http://www.samr.gov.cn/source',
    'https://www.samr.gov.cn.evil.example/source',
    'https://fermatmind.com.evil.example/source',
    'https://unreviewed.example/source',
    'javascript:alert(1)',
  ])('keeps unsupported protocols and hosts closed: %s', url => {
    expect(supportsCareerDossierAiImpact(withSourceUrl(url))).toBe(false);
  });
});
