import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { Children, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { buildCareerPageDisplaySurface } from '@/lib/career/pageDisplay';
import { publishedCareerPage } from './publishedCareerPage';

const { fetchBundle } = vi.hoisted(() => ({ fetchBundle: vi.fn() }));
vi.mock('@/lib/career/api/fetchCareerJobBundle', () => ({ fetchCareerJobBundle: fetchBundle }));
vi.mock('@/hooks/useAnalytics', () => ({ AnalyticsPageViewTracker: () => null }));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('not-found'); },
  permanentRedirect: (href: string) => { throw new Error(`redirect:${href}`); },
  usePathname: () => '/en/career',
}));
import CareerJobDetailPage from '@/app/(localized)/[locale]/career/jobs/[slug]/page';

type RawPage = Awaited<ReturnType<typeof publishedCareerPage>>;
// The file reader's current envelope fields, bound to the real projected page.
// Business/score fields are omitted, never synthesized as product truth.
function bundle(page: RawPage) {
  const locale = page.locale === 'zh-CN' ? 'zh' : 'en';
  const slug = page.subject.canonical_slug;
  const path = `/${locale}/career/jobs/${slug}`;
  return {
    bundle_kind: 'career_job_detail', bundle_version: 'career.detail.page.v1',
    identity: { canonical_slug: slug },
    titles: { [locale === 'zh' ? 'canonical_zh' : 'canonical_en']: page.subject.name },
    locale_policy: { requested_locale: page.locale, available_locales: ['en', 'zh-CN'] },
    seo_contract: { canonical_path: path, canonical_target: path,
      metadata_fingerprint: page.source_content_sha256, robots_policy: 'index,follow',
      index_state: 'indexable', index_eligible: true,
      reason_codes: ['runtime_publish_projection', 'release_gate_pass'] },
    career_page: page,
  };
}
function sharedSurface(node: ReactNode): ReactNode {
  let result: ReactNode = null;
  Children.forEach(node, child => {
    if (!isValidElement<{children?: ReactNode}>(child)) return;
    if (child.type === CareerDisplaySurface) result = child;
    else result ??= sharedSurface(child.props.children);
  });
  return result;
}
async function route(page: RawPage) {
  fetchBundle.mockResolvedValue(bundle(page));
  const node = await CareerJobDetailPage({params: Promise.resolve({
    locale: page.locale === 'zh-CN' ? 'zh' : 'en', slug: page.subject.canonical_slug,
  })});
  const surface = sharedSurface(node);
  expect(surface, `${page.locale}:${page.subject.canonical_slug}`).not.toBeNull();
  return surface;
}
const slugs = ['accountants-and-auditors', 'actors', 'actuaries', 'registered-nurses', 'electrical-and-electronics-engineering-technicians'];
const samples = await Promise.all(slugs.flatMap(slug => (['zh', 'en'] as const).map(locale => publishedCareerPage(locale, slug))));

function readerRoot(node: ReactNode) {
  const root = document.createElement('div');
  root.innerHTML = renderToStaticMarkup(node);
  root.querySelectorAll('script,style,[hidden],[aria-hidden="true"],.hidden,.sr-only').forEach(item => item.remove());
  return root;
}

describe('Current shared UI through the actual detail route', () => {
  it.each(samples)('renders $locale/$subject.canonical_slug with the existing rich UI and reader-visible content', async raw => {
    const root = readerRoot(await route(raw));
    expect(root.querySelector('[data-career-production-template="career-production-v1"]')).not.toBeNull();
    for (const part of ['profile', 'direction-comparison', 'ai-impact', 'china-salary', 'us-salary', 'fit-center', 'work-risk', 'progression', 'outlook-transitions']) {
      expect(root.querySelector(`[data-testid="career-dossier-${part}"]`), part).not.toBeNull();
    }
    const c = raw.display.components;
    const wage = root.querySelector('[data-career-api-table$=".wages"]')!;
    expect(wage.querySelectorAll('tbody tr')).toHaveLength(c.career_snapshot_secondary_locale.wage_tiers.length);
    for (const tier of c.career_snapshot_secondary_locale.wage_tiers) expect(wage.textContent).toContain(tier.value);
    c.career_snapshot_secondary_locale.bls_table.forEach((row: Record<string,string>, index: number) => {
      const note = root.querySelector(`[data-career-api-field="career_snapshot_secondary_locale.bls_table[${index}].说明"]`);
      expect(note, String(index)).not.toBeNull();
      expect(note!.textContent?.length).toBeGreaterThan(0);
    });
    for (const row of c.work_context_block.split('\n')) {
      const parts = row.split(/｜| \| /u);
      expect(root.textContent).toContain(parts.slice(1).join(parts.length > 1 ? ' | ' : '') || row);
    }
    for (const value of c.responsibilities_block) {
      for (const text of value.split(/｜| \| /u).slice(1)) expect(root.textContent).toContain(text);
    }
    for (const row of c.onet_structured_fields_block.rows) expect(root.textContent).toContain(row.value);
    for (const source of normalizeCareerPage(raw, raw.locale === 'zh-CN' ? 'zh' : 'en', raw.subject.canonical_slug)!.content.sources) {
      expect([...root.querySelectorAll('[data-testid="source-list"] details')].some(item => item.textContent?.includes(source.name) || (source.scope !== null && item.textContent?.includes(source.scope)))).toBe(true);
    }
    for (const link of root.querySelectorAll('[data-testid="career-dossier-toc"] a')) {
      expect(root.querySelector(link.getAttribute('href')!)).not.toBeNull();
    }
    expect(root.querySelector('#career-content-navigation')).toBeNull();
    for (const item of c.faq_block.items) {
      expect(root.textContent).toContain(item.question);
      expect(root.textContent).toContain(item.answer);
    }
  });

  it('uses existing positions instead of translated wage labels, retaining all original indices', () => {
    const raw = structuredClone(samples[1]);
    raw.display.components.career_snapshot_secondary_locale.bls_table.forEach((row: Record<string,string>, index: number) => { row['指标'] = `Localized metric ${index}`; });
    const page = normalizeCareerPage(raw, 'en', raw.subject.canonical_slug)!;
    expect(() => buildCareerPageDisplaySurface(page, {slug:raw.subject.canonical_slug}, '/en/tests/holland-career-interest-test-riasec')).not.toThrow();
    raw.display.components.career_snapshot_secondary_locale.bls_table.pop();
    expect(() => buildCareerPageDisplaySurface(normalizeCareerPage(raw, 'en', raw.subject.canonical_slug)!, {slug:raw.subject.canonical_slug}, '/en/tests/holland-career-interest-test-riasec')).toThrow('CAREER_PAGE_DISPLAY_INVALID');
  });

  it('accepts an omitted module and legal unavailable marker without inventing CTA or rich requirements', async () => {
    const raw = structuredClone(samples[1]);
    raw.display.component_order = ['definition_block', 'career_quick_answers_block'];
    raw.display.components = {definition_block: raw.display.components.definition_block,
      career_quick_answers_block: {availability:'unavailable', reason_code:'source_locale_unavailable'}};
    const root = readerRoot(await route(raw));
    expect(root.textContent).toContain(raw.display.components.definition_block);
    expect(root.querySelector('[data-testid="career-production-assessment-rail"]')).toBeNull();
    expect(root.querySelector('[data-testid="career-dossier-us-salary"]')).toBeNull();
  });

  it.each(['https://evil.example/source', 'javascript:alert(1)', 'https://user:pass@www.bls.gov/ooh/'])('rejects unsafe mixed-field URL %s', async href => {
    const raw = structuredClone(samples[1]);
    raw.display.components.ai_impact_table.questions[0]['链接'] = href;
    await expect(route(raw)).rejects.toThrow('CAREER_PAGE_DISPLAY_INVALID');
  });
  it('preserves editorial link-field prose as visible non-clickable text', async () => {
    const raw = structuredClone(samples[1]);
    const note = 'Editorial suggestion, with no external links or adoption-effect evidence';
    raw.display.components.ai_impact_table.questions[0]['链接'] = note;
    const root = readerRoot(await route(raw));
    expect(root.textContent).toContain(note);
    expect([...root.querySelectorAll('a')].some(link => link.getAttribute('href') === note)).toBe(false);
  });
  it('keeps API absence and failure distinct without fallback content', async () => {
    fetchBundle.mockResolvedValue(null);
    await expect(CareerJobDetailPage({params:Promise.resolve({locale:'en',slug:'actors'})})).rejects.toThrow('not-found');
    fetchBundle.mockRejectedValue(new Error('upstream timeout'));
    await expect(CareerJobDetailPage({params:Promise.resolve({locale:'en',slug:'actors'})})).rejects.toThrow('upstream timeout');
  });
  it.each(['locale', 'hash', 'identity', 'version', 'duplicate', 'unknown', 'malformed'])('fails closed for %s instead of choosing another template', async failure => {
    const raw = structuredClone(samples[1]);
    if (failure === 'locale') raw.content.locale = 'zh-CN';
    if (failure === 'hash') raw.content.source_content_sha256 = '0'.repeat(64);
    if (failure === 'identity') raw.content.subject.canonical_slug = 'actors';
    if (failure === 'version') raw.contract_version = 'unsupported';
    if (failure === 'duplicate') raw.display.component_order.push(raw.display.component_order[0]);
    if (failure === 'unknown') { raw.display.component_order.push('unknown'); raw.display.components.unknown = 'x'; }
    if (failure === 'malformed') raw.display.components.ai_impact_table.answer = '';
    await expect(route(raw)).rejects.toThrow();
  });
});

it.skipIf(!process.env.CAREER_SHARED_UI_CORPUS)('selects the same actual route renderer for all 2092 real Current projections (no full SSR)', async () => {
  const seen = new Set<string>();
  const locales = new Map<string, number>();
  const pairs = new Map<string, Set<string>>();
  for await (const line of createInterface({ input: createReadStream(process.env.CAREER_SHARED_UI_CORPUS!), crlfDelay: Infinity })) {
    const raw = JSON.parse(line);
    const key = `${raw.locale}:${raw.subject.canonical_slug}`;
    expect(seen.has(key), key).toBe(false);
    seen.add(key);
    const pair = pairs.get(raw.subject.canonical_slug) ?? new Set<string>();
    pair.add(raw.locale);
    pairs.set(raw.subject.canonical_slug, pair);
    locales.set(raw.locale, (locales.get(raw.locale) ?? 0) + 1);
    await route(raw).catch(error => { throw new Error(`${key}: ${error.message}`); });
    fetchBundle.mockClear();
  }
  expect(seen.size).toBe(2092);
  expect(pairs.size).toBe(1046);
  for (const pair of pairs.values()) expect(pair).toEqual(new Set(["en", "zh-CN"]));
  expect(locales).toEqual(new Map([['en',1046], ['zh-CN',1046]]));
  console.info('actual_Current_route_coverage', {input:seen.size, en:locales.get('en'), zh:locales.get('zh-CN'), shared:seen.size, skipped:0});
}, 120000);
