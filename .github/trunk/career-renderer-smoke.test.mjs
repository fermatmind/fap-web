import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const source = readFileSync('scripts/deploy_web_pm2.sh', 'utf8');
const probe = source.slice(source.indexOf('require_career_renderer_revision() {'), source.indexOf('require_analytics_bootstrap_contract() {'));
const timeout = source.match(/^CAREER_RENDERER_TIMEOUT_SEC=(\d+)$/m)?.[1];
for (const mode of ['success', 'download-failure', 'revision-mismatch']) {
  test(`career renderer smoke distinguishes ${mode}`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'career-renderer-smoke-'));
    try {
      writeFileSync(path.join(root, 'curl'), `#!/usr/bin/env bash
printf '%s\\n' "$@" > "$TRACE"
while [[ $# -gt 0 ]]; do
  if [[ "$1" == -o ]]; then output="$2"; shift; fi
  shift
done
if [[ "$MODE" == download-failure ]]; then exit 28; fi
revision="$DEPLOY_SHA"
if [[ "$MODE" == revision-mismatch ]]; then revision=wrong; fi
printf '<main data-career-renderer-release="%s"></main>' "$revision" > "$output"
`, { mode: 0o700 });
      const trace = path.join(root, 'trace');
      const result = spawnSync('bash', ['-c', `set -eu\nlog() { echo "$*"; }\n${probe}\nrequire_career_renderer_revision https://fermatmind.com public`], {
        env: { ...process.env, PATH: `${root}:${process.env.PATH}`, TRACE: trace, MODE: mode,
          DEPLOY_SHA: 'a'.repeat(40), CAREER_RENDERER_PATH: '/zh/career/jobs/accountants-and-auditors',
          CAREER_RENDERER_TIMEOUT_SEC: timeout, HTTP_CONNECT_TIMEOUT_SEC: '5' },
        encoding: 'utf8', timeout: 5000,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, mode === 'success' ? 0 : 1, result.stderr);
      const args = readFileSync(trace, 'utf8').trim().split('\n');
      assert.ok(args.includes('--compressed'));
      assert.equal(args[args.indexOf('--max-time') + 1], '60');
      assert.match(result.stdout, mode === 'success' ? /revision passed/ : mode === 'download-failure' ? /response download failed/ : /revision mismatch/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}
