import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {CareerDossierAiImpact, supportsCareerDossierAiImpact} from '@/components/career/display/CareerDossierAiImpact';
import type {CareerPublishedValue} from '@/lib/career/publishedComponentContract';
import {CareerDisplaySurface} from '@/components/career/display/CareerDisplaySurface';
import {normalizeCareerPage} from '@/lib/career/careerPage';
import {buildCareerPageDisplaySurface, careerDisplayIdentity} from '@/lib/career/pageDisplay';
import {publishedCareerPage} from './publishedCareerPage';

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
    'http://www.samr.gov.cn/source',
    'https://www.samr.gov.cn.evil.example/source',
    'https://fermatmind.com.evil.example/source',
    'https://unreviewed.example/source',
    'javascript:alert(1)',
  ])('keeps unsupported protocols and hosts closed: %s', url => {
    expect(supportsCareerDossierAiImpact(withSourceUrl(url))).toBe(false);
  });
});
