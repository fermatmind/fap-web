import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const source = readFileSync('scripts/deploy_web_pm2.sh', 'utf8');
const probe = source.slice(source.indexOf('require_career_renderer_revision() {'), source.indexOf('require_analytics_bootstrap_contract() {'));
const timeout = source.match(/^CAREER_RENDERER_TIMEOUT_SEC=(\d+)$/m)?.[1];
const sha = 'a'.repeat(40);
// Minimal synthetic data exercises failures without maintaining another career body.
const existingPage = JSON.parse(readFileSync('tests/fixtures/career-page/actors.zh-CN.json', 'utf8'));
const page = {
  ...existingPage,
  contract_version: 'career.detail.page.v1', locale: 'zh-CN', source_content_sha256: 'b'.repeat(64), subject: { canonical_slug: 'accountants-and-auditors', name: '职业示例' },
  content: {...existingPage.content, contract_version: 'career.detail.content.v3', locale: 'zh-CN', subject: {canonical_slug: 'accountants-and-auditors', name: '职业示例'}, source_content_sha256: 'b'.repeat(64), content_state: 'enhanced', blocks: [{}]},
  hero: { ai: { availability: 'available', fact: { display_value: '7/10' } }, badges: ['标签甲', '标签乙', '标签丙'], metrics: [{ fact: { display_value: '$123' } }] },
  display: { contract_version: 'career.detail.display.v1', components: {
    hero: { quick_answer: '示例概述' }, definition_block: '正文 & 说明', faq_block: { items: [{ question: '示例问题？' }] },
  } },
};
const body = {bundle_kind: 'career_job_detail', bundle_version: 'career.detail.page.v1', locale_policy: {requested_locale: 'zh-CN'}, identity: { canonical_slug: 'accountants-and-auditors' }, career_page: page, seo_contract: {canonical_path: '/zh/career/jobs/accountants-and-auditors', canonical_target: '/zh/career/jobs/accountants-and-auditors', metadata_fingerprint: 'b'.repeat(64), index_eligible: true, index_state: 'indexable', robots_policy: 'index,follow', reason_codes: ['runtime_publish_projection', 'release_gate_pass']} };
const markers = ['career-production-ai-gauge', 'career-production-hero-badges', 'career-dossier-toc', 'career-display-faq'];
const validHtml = `<link rel="canonical" href="https://fermatmind.com/zh/career/jobs/accountants-and-auditors"><meta name="robots" content="index, follow"><main data-career-production-template="career-production-v1" data-career-renderer-release="${sha}">${markers.map(marker => `<section data-testid="${marker}"></section>`).join('')}职业示例 7/10 标签甲 标签乙 标签丙 $123 示例概述 正文 &amp; 说明 示例问题？</main>`;
for (const mode of ['success', 'download-failure', 'revision-mismatch', 'page-404', 'page-redirect', 'api-404', 'api-locale', 'missing-display', 'missing-score', 'wrong-template', 'props-only', 'production-success', 'stale-noindex', 'googlebot-noindex', 'duplicate-noindex', 'header-noindex', 'noindex-success', 'noindex-overridden', 'fingerprint-mismatch', 'wrong-canonical', 'staging-noindex-missing', 'stream-success', 'hidden-content', 'missing-stream-source', 'stream-noindex', 'missing-version', 'content-locale', 'content-subject']) {
  test(`career renderer smoke distinguishes ${mode}`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'career-renderer-smoke-'));
    try {
      let html = validHtml;
      const api = structuredClone(body);
      const production = !['success', 'staging-noindex-missing'].includes(mode);
      let headers = production ? 'HTTP/1.1 200 OK\r\n' : 'HTTP/1.1 200 OK\r\nX-Robots-Tag: noindex, nofollow\r\n';
      if (mode === 'staging-noindex-missing') headers = 'HTTP/1.1 200 OK\r\n';
      if (mode === 'stale-noindex' || mode === 'noindex-success') html = html.replace('index, follow', 'noindex, follow');
      if (mode === 'googlebot-noindex') html += '<meta name="googlebot" content="noindex">';
      if (mode === 'duplicate-noindex') html += '<meta name="robots" content="noindex">';
      if (mode === 'header-noindex') headers += 'X-Robots-Tag: googlebot: noindex\r\n';
      if (mode.startsWith('noindex-')) Object.assign(api.seo_contract, {index_eligible: false, index_state: 'noindex', robots_policy: 'noindex,follow'});
      if (mode === 'fingerprint-mismatch') api.seo_contract.metadata_fingerprint = 'c'.repeat(64);
      if (mode === 'wrong-canonical') html = html.replace('/zh/career/jobs/accountants-and-auditors', '/zh/career/jobs/another-role');
      writeFileSync(path.join(root, 'headers'), headers);
      if (mode === 'stream-success' || mode === 'stream-noindex') {
        html = `<!--$?--><template id="B:0"></template>加载中<!--/$--><div hidden="" id="S:0">${html}</div><script>$RC("B:0","S:0")</script>`;
        if (mode === 'stream-noindex') html = html.replace('index, follow', 'noindex, follow');
      }
      if (mode === 'hidden-content') html = `<div hidden="">${html}</div>`;
      if (mode === 'missing-stream-source') html += '<script>$RS("S:missing","P:0")</script>';
      if (mode === 'missing-version') delete api.bundle_version;
      if (mode === 'content-locale') api.career_page.content.locale = 'en';
      if (mode === 'content-subject') api.career_page.content.subject.canonical_slug = 'another-role';
      if (mode === 'revision-mismatch') html = html.replace(sha, 'wrong');
      if (mode === 'wrong-template') html = html.replace('career-production-v1', 'generic');
      if (mode === 'missing-score') html = html.replace('7/10', '暂无数据');
      if (mode === 'props-only') html = `<main data-career-renderer-release="${sha}"></main><script>${JSON.stringify(validHtml)}</script>`;
      if (mode === 'api-locale') api.career_page.locale = 'en';
      if (mode === 'missing-display') delete api.career_page.display;
      writeFileSync(path.join(root, 'html'), html);
      writeFileSync(path.join(root, 'api'), JSON.stringify(api));
      writeFileSync(path.join(root, 'curl'), `#!/usr/bin/env bash
printf '%s\\n' "$@" >> "$TRACE"
while [[ $# -gt 0 ]]; do
  if [[ "$1" == -o ]]; then output="$2"; shift; elif [[ "$1" == -D ]]; then headers="$2"; shift; else url="$1"; fi
  shift
done
if [[ "$MODE" == download-failure ]]; then exit 28; fi
if [[ "$url" == *api/v0.5/* ]]; then
  cp "$SAMPLE_ROOT/api" "$output"
  if [[ "$MODE" == api-404 ]]; then printf 404; exit 0; fi
else
  cp "$SAMPLE_ROOT/html" "$output"
  cp "$SAMPLE_ROOT/headers" "$headers"
  if [[ "$MODE" == page-404 ]]; then printf 404; exit 0; fi
  if [[ "$MODE" == page-redirect ]]; then printf 302; exit 0; fi
fi
printf 200
`, { mode: 0o700 });
      const trace = path.join(root, 'trace');
      const result = spawnSync('bash', ['-c', `set -eu\nlog() { echo "$*"; }\n${probe}\nrequire_career_renderer_revision https://staging.fermatmind.com public`], {
        env: { ...process.env, PATH: `${root}:${process.env.PATH}`, TRACE: trace, SAMPLE_ROOT: root, MODE: mode,
          PUBLIC_BASE_URL: production ? 'https://fermatmind.com' : 'https://staging.fermatmind.com', DEPLOY_SHA: sha, CAREER_RENDERER_PATH: '/zh/career/jobs/accountants-and-auditors',
          CAREER_RENDERER_TIMEOUT_SEC: timeout, HTTP_CONNECT_TIMEOUT_SEC: '5', SCRIPT_DIR: path.resolve('scripts') },
        encoding: 'utf8', timeout: 5000,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, ['success', 'production-success', 'noindex-success', 'stream-success'].includes(mode) ? 0 : 1, `${result.stdout}\n${result.stderr}`);
      const category = {'api-locale': 'api_contract', 'missing-display': 'api_contract', 'missing-version': 'api_contract',
        'fingerprint-mismatch': 'seo_authority', 'content-locale': 'seo_authority', 'content-subject': 'seo_authority',
        'stale-noindex': 'robots', 'stream-noindex': 'robots', 'googlebot-noindex': 'robots', 'duplicate-noindex': 'robots', 'header-noindex': 'robots', 'noindex-overridden': 'robots', 'staging-noindex-missing': 'robots',
        'wrong-canonical': 'canonical', 'wrong-template': 'renderer', 'props-only': 'robots', 'hidden-content': 'robots', 'missing-stream-source': 'stream', 'missing-score': 'visible_content'}[mode];
      if (category) assert.match(result.stderr, new RegExp(`category=${category}(?:\\s|$)`));
      const args = readFileSync(trace, 'utf8').trim().split('\n');
      assert.ok(args.includes('--compressed'));
      assert.ok(!args.includes('-L'));
      assert.equal(args[args.indexOf('--max-time') + 1], '60');
      if (mode === 'success') {
        assert.match(result.stdout, /content passed/);
        assert.ok(args.some(arg => arg.startsWith('https://staging-api.fermatmind.com/')));
      }
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}

test('staging cannot skip the accountant page', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  assert.ok(workflow.includes('REQUIRE_CAREER_RENDERER_REVISION: "1"'));
  assert.ok(!workflow.includes('REQUIRE_CAREER_RENDERER_REVISION: "0"'));
});

test('remote Career comparison ships the same site contract used by metadata', () => {
  const transport = readFileSync('.github/trunk/deploy-web-release.sh', 'utf8');
  assert.match(transport, /scripts\/ops\/verify-career-renderer\.mjs lib\/site\.ts/);
  const check = readFileSync('scripts/ops/verify-career-renderer.mjs', 'utf8');
  assert.match(check, /getSiteUrlOrThrow\(\)/);
  assert.match(check, /isConfiguredStagingSiteUrl\(\)/);
});
