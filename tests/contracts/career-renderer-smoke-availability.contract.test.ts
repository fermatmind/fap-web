import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

function smoke(availability: string, fact: unknown, factRef: unknown, missingMarker: boolean) {
  const dir = mkdtempSync(join(tmpdir(), 'career-renderer-smoke-'));
  const hash = 'a'.repeat(64);
  const canonical = '/zh/career/jobs/accountants-and-auditors';
  const response = {
    bundle_version: 'career.detail.page.v1', locale_policy: { requested_locale: 'zh-CN' },
    identity: { canonical_slug: 'accountants-and-auditors' },
    career_page: {
      locale: 'zh-CN', source_content_sha256: hash, subject: { canonical_slug: 'accountants-and-auditors', name: 'Accountants' },
      hero: { ai: { availability, fact, fact_ref: factRef, label: 'AI label' }, badges: ['Badge A', 'Badge B', 'Badge C'], metrics: [{ fact: { display_value: 'Metric' } }] },
      display: { contract_version: 'career.detail.display.v1', components: { hero: { quick_answer: 'Quick answer' }, definition_block: 'Definition', faq_block: { items: [{ question: 'Question' }] } } },
      content: { locale: 'zh-CN', subject: { canonical_slug: 'accountants-and-auditors' }, source_content_sha256: hash, content_state: 'enhanced', blocks: [{}] },
    },
    seo_contract: { metadata_fingerprint: hash, canonical_path: canonical, canonical_target: canonical, index_eligible: true, index_state: 'indexable', robots_policy: 'index,follow', reason_codes: ['runtime_publish_projection', 'release_gate_pass'] },
  };
  const html = `<html><head><meta name="robots" content="index,follow"><link rel="canonical" href="https://fermatmind.com${canonical}"></head><body><article data-career-production-template="career-production-v1"><div data-testid="career-production-ai-gauge"><strong${missingMarker ? ' data-career-ai-unavailable="true"' : ''}>${missingMarker ? '暂无数据' : '4.2/10'}</strong>AI label</div><div data-testid="career-production-hero-badges">Badge A Badge B Badge C</div><nav data-testid="career-dossier-toc"></nav><div data-testid="career-display-faq">Question</div>Accountants Metric Quick answer Definition</article></body></html>`;
  try {
    writeFileSync(join(dir, 'body.html'), html);
    writeFileSync(join(dir, 'api.json'), JSON.stringify(response));
    writeFileSync(join(dir, 'headers.txt'), 'HTTP/1.1 200 OK\n');
    return spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', resolve('scripts/ops/verify-career-renderer.mjs'), join(dir, 'body.html'), join(dir, 'api.json'), join(dir, 'headers.txt'), 'https://fermatmind.com', 'public', resolve('lib/site.ts')], { encoding: 'utf8' });
  } finally { rmSync(dir, { recursive: true }); }
}

it('accepts the explicit no-score Hero with its visible missing state', () => {
  const result = smoke('missing', null, null, true);
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
});
it('keeps the existing available-score success path', () => {
  expect(smoke('available', { display_value: '4.2/10' }, 'ai-score', false).status).toBe(0);
});
it.each([
  ['missing', { display_value: '4.2/10' }, 'ai-score', true],
  ['missing', null, 'ai-score', true],
  ['missing', null, null, false],
  ['available', null, null, false],
  ['unknown', null, null, true],
] as const)('rejects inconsistent or invisible AI state: %s', (availability, fact, ref, marker) => {
  expect(smoke(availability, fact, ref, marker).status).toBe(1);
});
