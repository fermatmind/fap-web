import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCareerPageFixture } from './careerPage.fixture';

function bundle(indexable = true) {
  const page = buildCareerPageFixture('actors', 'zh');
  return {bundle_kind: 'career_job_detail', bundle_version: 'career.detail.page.v1',
    identity: {canonical_slug: 'actors'}, locale_policy: {requested_locale: 'zh-CN'}, career_page: page,
    seo_contract: {canonical_path: '/zh/career/jobs/actors', canonical_target: '/zh/career/jobs/actors',
      metadata_fingerprint: page.source_content_sha256, index_eligible: indexable,
      index_state: indexable ? 'indexable' : 'noindex', robots_policy: indexable ? 'index,follow' : 'noindex,follow',
      reason_codes: ['runtime_publish_projection', 'release_gate_pass']},
    seo_authority_v1: {seo_surface_v1: {metadata_contract_version: 'seo.surface.v1', surface_type: 'career_job_detail',
      title: 'Stale independent title', description: 'Stale independent description',
      canonical_url: '/zh/career/jobs/another-role', metadata_fingerprint: 'old-version',
      robots_policy: indexable ? 'noindex,follow' : 'index,follow', index_state: indexable ? 'noindex' : 'indexable', index_eligible: !indexable}}
  };
}
async function metadata(payload: ReturnType<typeof bundle> | null) {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://fermatmind.com');
  vi.doMock('@/lib/career/api/fetchCareerJobBundle', () => ({fetchCareerJobBundle: vi.fn(async ({locale}: {locale: string}) => locale === 'zh' ? payload : null)}));
  const {generateMetadata} = await import('@/app/(localized)/[locale]/career/jobs/[slug]/page');
  return generateMetadata({params: Promise.resolve({locale: 'zh', slug: 'actors'})});
}
afterEach(() => { vi.resetModules(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.doUnmock('@/lib/career/api/fetchCareerJobBundle'); });

describe('Current Chinese same-response publication authority', () => {
  it.each(['Actors', ' actors '])('keeps the existing same-identity canonical redirect for %s', async slug => {
    vi.doMock('@/lib/career/api/fetchCareerJobBundle', () => ({fetchCareerJobBundle: vi.fn(async () => bundle())}));
    const {generateMetadata} = await import('@/app/(localized)/[locale]/career/jobs/[slug]/page');
    await expect(generateMetadata({params: Promise.resolve({locale: 'zh', slug})})).rejects.toThrow('NEXT_REDIRECT');
  });
  it('rejects an internally consistent response belonging to another requested fixed slug', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://fermatmind.com');
    vi.doMock('@/lib/career/api/fetchCareerJobBundle', () => ({fetchCareerJobBundle: vi.fn(async () => bundle())}));
    const {generateMetadata} = await import('@/app/(localized)/[locale]/career/jobs/[slug]/page');
    await expect(generateMetadata({params: Promise.resolve({locale: 'zh', slug: 'data-scientists'})}))
      .rejects.toMatchObject({kind: 'contract', errorCode: 'CAREER_PAGE_AUTHORITY_INVALID'});
  });
  it.each([true, false])('ignores the opposite stale SEO decision and wrong canonical when bundle index=%s', async indexable => {
    const payload = bundle(indexable);
    const result = await metadata(payload);
    expect(result.robots).toMatchObject({index: indexable, follow: true});
    expect(result.alternates?.canonical).toBe('https://fermatmind.com/zh/career/jobs/actors');
    expect(result.title).toBe(payload.career_page.seo.title.text);
  });
  it.each(['fingerprint', 'source-hash', 'content-hash', 'identity', 'subject', 'locale', 'requested-locale', 'canonical', 'canonical-target', 'external-canonical'] as const)('rejects %s corruption before metadata', async kind => {
    const payload = bundle();
    if (kind === 'fingerprint') payload.seo_contract.metadata_fingerprint = 'b'.repeat(64);
    if (kind === 'source-hash') payload.career_page.source_content_sha256 = 'b'.repeat(64);
    if (kind === 'content-hash') payload.career_page.content.source_content_sha256 = 'b'.repeat(64);
    if (kind === 'identity') payload.identity.canonical_slug = 'another-role';
    if (kind === 'subject') payload.career_page.subject.canonical_slug = 'another-role';
    if (kind === 'locale') payload.career_page.locale = 'en';
    if (kind === 'requested-locale') payload.locale_policy.requested_locale = 'en';
    if (kind === 'canonical') payload.seo_contract.canonical_path = '/zh/career/jobs/another-role';
    if (kind === 'canonical-target') payload.seo_contract.canonical_target = '/zh/career/jobs/another-role';
    if (kind === 'external-canonical') payload.seo_contract.canonical_path = 'https://untrusted.example/zh/career/jobs/actors';
    await expect(metadata(payload)).rejects.toThrow();
  });
  it('keeps a valid empty Chinese Current body noindex with follow', async () => {
    const payload = bundle(false);
    payload.career_page = buildCareerPageFixture('actors', 'en');
    payload.career_page.locale = 'zh-CN';
    payload.career_page.content.locale = 'zh-CN';
    payload.seo_contract.metadata_fingerprint = payload.career_page.source_content_sha256;
    expect((await metadata(payload)).robots).toMatchObject({index: false, follow: true});
  });
  it('preserves authoritative absence and a visible body without indexing authority', async () => {
    expect((await metadata(null)).robots).toMatchObject({index: false});
    vi.resetModules();
    const payload = bundle(); payload.seo_contract.reason_codes = [];
    expect((await metadata(payload)).robots).toMatchObject({index: false});
  });
  it.each([404, 503, 'timeout'] as const)('does not start or depend on an independent SEO %s request', async failure => {
    vi.doUnmock('@/lib/career/api/fetchCareerJobBundle');
    const requested: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input); requested.push(url);
      if (url.includes('/seo?')) {
        if (failure === 'timeout') throw new DOMException('timeout', 'AbortError');
        return new Response('{}', {status: failure});
      }
      return new Response(JSON.stringify(bundle()), {headers: {'Content-Type': 'application/json'}});
    }));
    const {fetchCareerJobBundle} = await import('@/lib/career/api/fetchCareerJobBundle');
    const result = await fetchCareerJobBundle({locale: 'zh', slug: 'actors', includeSeoAuthority: true});
    expect(result?.career_page).toBeDefined();
    expect(requested).toHaveLength(1);
    expect(requested[0]).toContain('/career/jobs/actors?');
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({cache: 'no-store'});
  });
  it.each([503, 504])('preserves actual bundle HTTP %s failures', async status => {
    vi.doUnmock('@/lib/career/api/fetchCareerJobBundle');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', {status})));
    const {fetchCareerJobBundle} = await import('@/lib/career/api/fetchCareerJobBundle');
    await expect(fetchCareerJobBundle({locale: 'zh', slug: 'actors', includeSeoAuthority: true})).rejects.toMatchObject({kind: status === 503 ? 'transient' : 'timeout'});
  });
});
