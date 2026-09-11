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
const page = {
  locale: 'zh-CN', subject: { name: '职业示例' },
  hero: { ai: { availability: 'available', fact: { display_value: '7/10' } }, badges: ['标签甲', '标签乙', '标签丙'], metrics: [{ fact: { display_value: '$123' } }] },
  display: { contract_version: 'career.detail.display.v1', components: {
    hero: { quick_answer: '示例概述' }, definition_block: '正文 & 说明', faq_block: { items: [{ question: '示例问题？' }] },
  } },
};
const body = { identity: { canonical_slug: 'accountants-and-auditors' }, career_page: page };
const markers = ['career-production-ai-gauge', 'career-production-hero-badges', 'career-dossier-toc', 'career-display-faq'];
const validHtml = `<main data-career-production-template="career-production-v1" data-career-renderer-release="${sha}">${markers.map(marker => `<section data-testid="${marker}"></section>`).join('')}职业示例 7/10 标签甲 标签乙 标签丙 $123 示例概述 正文 &amp; 说明 示例问题？</main>`;
for (const mode of ['success', 'download-failure', 'revision-mismatch', 'page-404', 'page-redirect', 'api-404', 'api-locale', 'missing-display', 'missing-score', 'wrong-template', 'props-only']) {
  test(`career renderer smoke distinguishes ${mode}`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'career-renderer-smoke-'));
    try {
      let html = validHtml;
      const api = structuredClone(body);
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
  if [[ "$1" == -o ]]; then output="$2"; shift; else url="$1"; fi
  shift
done
if [[ "$MODE" == download-failure ]]; then exit 28; fi
if [[ "$url" == *api/v0.5/* ]]; then
  cp "$SAMPLE_ROOT/api" "$output"
  if [[ "$MODE" == api-404 ]]; then printf 404; exit 0; fi
else
  cp "$SAMPLE_ROOT/html" "$output"
  if [[ "$MODE" == page-404 ]]; then printf 404; exit 0; fi
  if [[ "$MODE" == page-redirect ]]; then printf 302; exit 0; fi
fi
printf 200
`, { mode: 0o700 });
      const trace = path.join(root, 'trace');
      const result = spawnSync('bash', ['-c', `set -eu\nlog() { echo "$*"; }\n${probe}\nrequire_career_renderer_revision https://staging.fermatmind.com public`], {
        env: { ...process.env, PATH: `${root}:${process.env.PATH}`, TRACE: trace, SAMPLE_ROOT: root, MODE: mode,
          PUBLIC_BASE_URL: 'https://staging.fermatmind.com', DEPLOY_SHA: sha, CAREER_RENDERER_PATH: '/zh/career/jobs/accountants-and-auditors',
          CAREER_RENDERER_TIMEOUT_SEC: timeout, HTTP_CONNECT_TIMEOUT_SEC: '5' },
        encoding: 'utf8', timeout: 5000,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, mode === 'success' ? 0 : 1, `${result.stdout}\n${result.stderr}`);
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
